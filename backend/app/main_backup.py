from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Optional
from uuid import uuid4
from datetime import datetime
import json

from .database import init_db, save_session, get_session
from .llm_client import call_llm
from .ocr_client import run_ocr


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="MediIntake AI API",
    version="0.3.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# SUPPORTED LANGUAGES
# =========================================================

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "or": "Odia",
    "as": "Assamese",
}


def normalize_language(language: Optional[str]) -> str:
    """
    Normalize frontend language value.

    Example:
        hi -> hi
        hi-IN -> hi
        English -> en
    """

    if not language:
        return "en"

    value = language.strip().lower()

    if value in SUPPORTED_LANGUAGES:
        return value

    if "-" in value:
        base = value.split("-")[0]
        if base in SUPPORTED_LANGUAGES:
            return base

    language_names = {
        "english": "en",
        "hindi": "hi",
        "marathi": "mr",
        "bengali": "bn",
        "gujarati": "gu",
        "tamil": "ta",
        "telugu": "te",
        "kannada": "kn",
        "malayalam": "ml",
        "punjabi": "pa",
        "odia": "or",
        "assamese": "as",
    }

    return language_names.get(value, "en")


# =========================================================
# PYDANTIC MODELS
# =========================================================

class ChatRequest(BaseModel):
    session_id: str
    message: str
    quick_reply: Optional[str] = None
    language: str = "en"


class SummaryRequest(BaseModel):
    session_id: str
    documents: list[dict[str, Any]] = Field(default_factory=list)
    language: str = "en"


class SaveSessionRequest(BaseModel):
    session_id: str
    patient_id: str
    transcript: list[dict[str, Any]] = Field(default_factory=list)
    extracted_documents: list[dict[str, Any]] = Field(default_factory=list)
    final_summary: Optional[dict[str, Any]] = None
    status: str = "draft"
    language: str = "en"


class ConfirmRequest(BaseModel):
    session_id: str
    summary: Optional[dict[str, Any]] = None


# =========================================================
# SOCRATES
# =========================================================

SOCRATES = [
    "Site",
    "Onset",
    "Character",
    "Radiation",
    "Associations",
    "Timing",
    "Exacerbating / relieving factors",
    "Severity",
]


QUESTIONS = [
    (
        "Where exactly do you feel the discomfort or pain?",
        [
            "Chest center",
            "Left side",
            "Right side",
            "Other",
        ],
    ),
    (
        "When did it start, and did it begin suddenly or gradually?",
        [
            "Today",
            "1–2 days ago",
            "More than a week ago",
            "Not sure",
        ],
    ),
    (
        "How would you describe it?",
        [
            "Pressure",
            "Burning",
            "Sharp",
            "Dull / aching",
        ],
    ),
    (
        "Does it move or spread anywhere?",
        [
            "No",
            "Arm / shoulder",
            "Back",
            "Jaw / neck",
        ],
    ),
    (
        "Do you have any other symptoms with it?",
        [
            "Nausea",
            "Breathlessness",
            "Fever",
            "None",
        ],
    ),
    (
        "Is it constant or does it come and go? How long does each episode last?",
        [
            "Constant",
            "Comes and goes",
            "A few minutes",
            "Not sure",
        ],
    ),
    (
        "What makes it better or worse?",
        [
            "Activity",
            "Food",
            "Rest",
            "Nothing helps",
        ],
    ),
    (
        "On a scale of 0 to 10, how severe is it?",
        [
            "1–3 mild",
            "4–6 moderate",
            "7–8 severe",
            "9–10 very severe",
        ],
    ),
]


# =========================================================
# MULTILINGUAL QUESTIONS
# =========================================================

QUESTION_TRANSLATIONS = {
    "en": [
        "Where exactly do you feel the discomfort or pain?",
        "When did it start, and did it begin suddenly or gradually?",
        "How would you describe it?",
        "Does it move or spread anywhere?",
        "Do you have any other symptoms with it?",
        "Is it constant or does it come and go? How long does each episode last?",
        "What makes it better or worse?",
        "On a scale of 0 to 10, how severe is it?",
    ],

    "hi": [
        "आपको दर्द या परेशानी बिल्कुल कहाँ महसूस हो रही है?",
        "यह कब शुरू हुआ? अचानक शुरू हुआ या धीरे धीरे?",
        "आप इस दर्द को किस तरह बताएंगे?",
        "क्या दर्द शरीर के किसी दूसरे हिस्से में फैलता है?",
        "क्या इसके साथ कोई और लक्षण हैं?",
        "क्या दर्द लगातार रहता है या आता जाता है?",
        "किस चीज से दर्द कम या ज्यादा होता है?",
        "0 से 10 के पैमाने पर दर्द कितना है?",
    ],

    "mr": [
        "तुम्हाला वेदना किंवा त्रास नेमका कुठे जाणवतो?",
        "हे कधी सुरू झाले? अचानक सुरू झाले की हळूहळू?",
        "तुम्ही या वेदनेचे वर्णन कसे कराल?",
        "वेदना शरीराच्या इतर भागात पसरते का?",
        "यासोबत आणखी काही लक्षणे आहेत का?",
        "वेदना सतत असते की अधूनमधून येते?",
        "कशामुळे त्रास कमी किंवा जास्त होतो?",
        "0 ते 10 मध्ये वेदनेची तीव्रता किती आहे?",
    ],

    "bn": [
        "আপনি ঠিক কোথায় ব্যথা বা অস্বস্তি অনুভব করছেন?",
        "এটি কখন শুরু হয়েছে? হঠাৎ নাকি ধীরে ধীরে?",
        "আপনি ব্যথাটিকে কীভাবে বর্ণনা করবেন?",
        "ব্যথা কি অন্য কোথাও ছড়িয়ে পড়ে?",
        "এর সঙ্গে অন্য কোনো উপসর্গ আছে কি?",
        "ব্যথা কি সবসময় থাকে নাকি মাঝে মাঝে আসে?",
        "কী করলে ব্যথা কমে বা বেড়ে যায়?",
        "0 থেকে 10 এর মধ্যে ব্যথার মাত্রা কত?",
    ],

    "gu": [
        "તમને દુખાવો અથવા તકલીફ ચોક્કસ ક્યાં થાય છે?",
        "આ ક્યારે શરૂ થયું? અચાનક કે ધીમે ધીમે?",
        "તમે આ દુખાવાનું વર્ણન કેવી રીતે કરશો?",
        "શું દુખાવો બીજી કોઈ જગ્યાએ ફેલાય છે?",
        "શું તેની સાથે અન્ય કોઈ લક્ષણો છે?",
        "દુખાવો સતત રહે છે કે વચ્ચે વચ્ચે આવે છે?",
        "કઈ વસ્તુથી દુખાવો ઓછો કે વધારે થાય છે?",
        "0 થી 10 માં દુખાવાની તીવ્રતા કેટલી છે?",
    ],

    "ta": [
        "வலி அல்லது அசௌகரியம் சரியாக எங்கு உள்ளது?",
        "இது எப்போது தொடங்கியது? திடீரெனவா அல்லது மெதுவாகவா?",
        "வலியை எப்படி விவரிப்பீர்கள்?",
        "வலி வேறு எங்காவது பரவுகிறதா?",
        "இதனுடன் வேறு அறிகுறிகள் உள்ளதா?",
        "வலி தொடர்ந்து இருக்கிறதா அல்லது வந்து போகிறதா?",
        "எதனால் வலி குறைகிறது அல்லது அதிகரிக்கிறது?",
        "0 முதல் 10 வரை வலியின் தீவிரம் எவ்வளவு?",
    ],

    "te": [
        "మీకు నొప్పి లేదా అసౌకర్యం ఖచ్చితంగా ఎక్కడ ఉంది?",
        "ఇది ఎప్పుడు ప్రారంభమైంది? అకస్మాత్తుగా లేదా నెమ్మదిగా?",
        "మీరు ఈ నొప్పిని ఎలా వివరిస్తారు?",
        "నొప్పి మరెక్కడికైనా వ్యాపిస్తుందా?",
        "దీనితో పాటు ఇతర లక్షణాలు ఉన్నాయా?",
        "నొప్పి నిరంతరం ఉంటుందా లేదా వచ్చి పోతుందా?",
        "ఏది నొప్పిని తగ్గిస్తుంది లేదా పెంచుతుంది?",
        "0 నుండి 10 వరకు నొప్పి తీవ్రత ఎంత?",
    ],

    "kn": [
        "ನಿಮಗೆ ನೋವು ಅಥವಾ ಅಸೌಕರ್ಯ ನಿಖರವಾಗಿ ಎಲ್ಲಿದೆ?",
        "ಇದು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು? ಹಠಾತ್ತಾಗಿ ಅಥವಾ ನಿಧಾನವಾಗಿ?",
        "ಈ ನೋವನ್ನು ನೀವು ಹೇಗೆ ವಿವರಿಸುತ್ತೀರಿ?",
        "ನೋವು ಬೇರೆಡೆಗೆ ಹರಡುತ್ತದೆಯೇ?",
        "ಇದರೊಂದಿಗೆ ಬೇರೆ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿವೆಯೇ?",
        "ನೋವು ನಿರಂತರವಾಗಿದೆಯೇ ಅಥವಾ ಬಂದು ಹೋಗುತ್ತದೆಯೇ?",
        "ಯಾವುದರಿಂದ ನೋವು ಕಡಿಮೆಯಾಗುತ್ತದೆ ಅಥವಾ ಹೆಚ್ಚಾಗುತ್ತದೆ?",
        "0 ರಿಂದ 10 ರವರೆಗೆ ನೋವಿನ ತೀವ್ರತೆ ಎಷ್ಟು?",
    ],

    "ml": [
        "വേദനയോ അസ്വസ്ഥതയോ കൃത്യമായി എവിടെയാണ് അനുഭവപ്പെടുന്നത്?",
        "ഇത് എപ്പോൾ തുടങ്ങി? പെട്ടെന്നോ പതുക്കെയോ?",
        "ഈ വേദനയെ എങ്ങനെ വിവരിക്കും?",
        "വേദന മറ്റെവിടെയെങ്കിലും പടരുന്നുണ്ടോ?",
        "ഇതിനൊപ്പം മറ്റേതെങ്കിലും ലക്ഷണങ്ങളുണ്ടോ?",
        "വേദന തുടർച്ചയായാണോ അതോ ഇടയ്ക്കിടെ വരുന്നതാണോ?",
        "എന്താണ് വേദന കുറയ്ക്കുകയോ കൂട്ടുകയോ ചെയ്യുന്നത്?",
        "0 മുതൽ 10 വരെ വേദനയുടെ തീവ്രത എത്രയാണ്?",
    ],

    "pa": [
        "ਤੁਹਾਨੂੰ ਦਰਦ ਜਾਂ ਤਕਲੀਫ਼ ਬਿਲਕੁਲ ਕਿੱਥੇ ਮਹਿਸੂਸ ਹੁੰਦੀ ਹੈ?",
        "ਇਹ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਇਆ? ਅਚਾਨਕ ਜਾਂ ਹੌਲੀ ਹੌਲੀ?",
        "ਤੁਸੀਂ ਇਸ ਦਰਦ ਨੂੰ ਕਿਵੇਂ ਬਿਆਨ ਕਰੋਗੇ?",
        "ਕੀ ਦਰਦ ਕਿਸੇ ਹੋਰ ਥਾਂ ਫੈਲਦਾ ਹੈ?",
        "ਕੀ ਇਸ ਦੇ ਨਾਲ ਹੋਰ ਕੋਈ ਲੱਛਣ ਹਨ?",
        "ਕੀ ਦਰਦ ਲਗਾਤਾਰ ਰਹਿੰਦਾ ਹੈ ਜਾਂ ਆਉਂਦਾ ਜਾਂਦਾ ਹੈ?",
        "ਕਿਸ ਚੀਜ਼ ਨਾਲ ਦਰਦ ਘੱਟ ਜਾਂ ਵੱਧ ਹੁੰਦਾ ਹੈ?",
        "0 ਤੋਂ 10 ਵਿੱਚ ਦਰਦ ਦੀ ਤੀਬਰਤਾ ਕਿੰਨੀ ਹੈ?",
    ],

    "or": [
        "ଆପଣଙ୍କୁ ଠିକ କେଉଁଠାରେ ଯନ୍ତ୍ରଣା ବା ଅସୁବିଧା ହେଉଛି?",
        "ଏହା କେବେ ଆରମ୍ଭ ହେଲା? ହଠାତ୍ ନା ଧୀରେ ଧୀରେ?",
        "ଆପଣ ଏହି ଯନ୍ତ୍ରଣାକୁ କିପରି ବର୍ଣ୍ଣନା କରିବେ?",
        "ଯନ୍ତ୍ରଣା ଅନ୍ୟ କୌଣସି ସ୍ଥାନକୁ ବ୍ୟାପୁଛି କି?",
        "ଏହା ସହିତ ଅନ୍ୟ କୌଣସି ଲକ୍ଷଣ ଅଛି କି?",
        "ଯନ୍ତ୍ରଣା ସବୁବେଳେ ରହୁଛି ନା ମଝିରେ ମଝିରେ ଆସୁଛି?",
        "କଣ କଲେ ଯନ୍ତ୍ରଣା କମେ ବା ବଢ଼େ?",
        "0 ରୁ 10 ମଧ୍ୟରେ ଯନ୍ତ୍ରଣା କେତେ?",
    ],

    "as": [
        "আপুনি ঠিক ক'ত বিষ বা অস্বস্তি অনুভৱ কৰিছে?",
        "এইটো কেতিয়া আৰম্ভ হৈছিল? হঠাতে নে লাহে লাহে?",
        "আপুনি এই বিষটো কেনেকৈ বৰ্ণনা কৰিব?",
        "বিষটো আন কোনো ঠাইলৈ বিয়পি যায় নেকি?",
        "ইয়াৰ সৈতে আন কোনো লক্ষণ আছে নেকি?",
        "বিষটো সদায় থাকে নে মাজে মাজে আহে?",
        "কিহে বিষটো কমায় বা বঢ়ায়?",
        "0 ৰ পৰা 10 লৈ বিষৰ তীব্ৰতা কিমান?",
    ],
}


# =========================================================
# MULTILINGUAL COMPLETION TEXT
# =========================================================

COMPLETION_MESSAGES = {
    "en": (
        "Thank you. I have captured the main symptom history. "
        "We can now review any prior prescriptions or reports."
    ),
    "hi": (
        "धन्यवाद। मैंने आपकी मुख्य लक्षण संबंधी जानकारी दर्ज कर ली है। "
        "अब हम पिछली दवाओं या रिपोर्ट्स की समीक्षा कर सकते हैं।"
    ),
    "mr": (
        "धन्यवाद. तुमच्या मुख्य लक्षणांची माहिती नोंदवली आहे. "
        "आता आपण मागील औषधे किंवा रिपोर्ट तपासू शकतो."
    ),
    "bn": (
        "ধন্যবাদ। আপনার প্রধান উপসর্গের তথ্য নথিভুক্ত করা হয়েছে। "
        "এখন আমরা আগের প্রেসক্রিপশন বা রিপোর্ট দেখতে পারি।"
    ),
    "gu": (
        "આભાર. તમારી મુખ્ય લક્ષણોની માહિતી નોંધવામાં આવી છે. "
        "હવે આપણે અગાઉની દવાઓ અથવા રિપોર્ટની સમીક્ષા કરી શકીએ છીએ."
    ),
    "ta": (
        "நன்றி. உங்கள் முக்கிய அறிகுறிகளின் தகவலை பதிவு செய்துள்ளேன். "
        "இப்போது முந்தைய மருந்துகள் அல்லது அறிக்கைகளை பார்க்கலாம்."
    ),
    "te": (
        "ధన్యవాదాలు. మీ ప్రధాన లక్షణాల సమాచారాన్ని నమోదు చేశాను. "
        "ఇప్పుడు మునుపటి మందులు లేదా నివేదికలను పరిశీలించవచ్చు."
    ),
    "kn": (
        "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಮುಖ್ಯ ಲಕ್ಷಣಗಳ ಮಾಹಿತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. "
        "ಈಗ ಹಿಂದಿನ ಔಷಧಿಗಳು ಅಥವಾ ವರದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು."
    ),
    "ml": (
        "നന്ദി. നിങ്ങളുടെ പ്രധാന ലക്ഷണങ്ങളുടെ വിവരങ്ങൾ രേഖപ്പെടുത്തി. "
        "ഇനി മുമ്പത്തെ മരുന്നുകളോ റിപ്പോർട്ടുകളോ പരിശോധിക്കാം."
    ),
    "pa": (
        "ਧੰਨਵਾਦ। ਤੁਹਾਡੇ ਮੁੱਖ ਲੱਛਣਾਂ ਦੀ ਜਾਣਕਾਰੀ ਦਰਜ ਕਰ ਲਈ ਹੈ। "
        "ਹੁਣ ਅਸੀਂ ਪਿਛਲੀਆਂ ਦਵਾਈਆਂ ਜਾਂ ਰਿਪੋਰਟਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰ ਸਕਦੇ ਹਾਂ।"
    ),
    "or": (
        "ଧନ୍ୟବାଦ। ଆପଣଙ୍କର ମୁଖ୍ୟ ଲକ୍ଷଣର ସୂଚନା ରେକର୍ଡ କରାଯାଇଛି। "
        "ଏବେ ଆମେ ପୂର୍ବ ଔଷଧ ବା ରିପୋର୍ଟ ଦେଖିପାରିବା।"
    ),
    "as": (
        "ধন্যবাদ। আপোনাৰ মুখ্য লক্ষণৰ তথ্য লিপিবদ্ধ কৰা হৈছে। "
        "এতিয়া আমি আগৰ ঔষধ বা প্ৰতিবেদনসমূহ পৰ্যালোচনা কৰিব পাৰোঁ।"
    ),
}


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def startup():
    init_db()

    # Demo session
    sid = "demo-session"

    if not get_session(sid):
        save_session(
            {
                "session_id": sid,
                "patient_id": "P-DEMO-001",
                "language": "en",
                "transcript": [
                    {
                        "role": "assistant",
                        "text": (
                            "Hello. I will help record your medical history. "
                            "What is your main health concern today?"
                        ),
                    }
                ],
                "extracted_documents": [],
                "final_summary": None,
                "status": "draft",
            }
        )


# =========================================================
# HEALTH
# =========================================================

@app.get("/api/health")
def health():
    return {
        "ok": True,
        "demo_session": "demo-session",
        "status": "running",
        "supported_languages": SUPPORTED_LANGUAGES,
    }


# =========================================================
# CREATE SESSION
# =========================================================

@app.post("/api/session")
def create_session(
    language: str = "en",
):

    language = normalize_language(language)

    sid = str(uuid4())
    patient_id = f"P-{sid[:6].upper()}"

    greeting = {
        "en": (
            "Hello. I will help record your medical history. "
            "What is your main health concern today?"
        ),
        "hi": (
            "नमस्ते। मैं आपकी मेडिकल हिस्ट्री रिकॉर्ड करने में मदद करूंगा। "
            "आज आपकी मुख्य स्वास्थ्य समस्या क्या है?"
        ),
        "mr": (
            "नमस्कार. मी तुमची वैद्यकीय माहिती नोंदवण्यास मदत करेन. "
            "आज तुमची मुख्य आरोग्य समस्या काय आहे?"
        ),
        "bn": (
            "হ্যালো। আমি আপনার চিকিৎসা ইতিহাস রেকর্ড করতে সাহায্য করব। "
            "আজ আপনার প্রধান স্বাস্থ্য সমস্যা কী?"
        ),
        "gu": (
            "નમસ્તે. હું તમારી તબીબી માહિતી નોંધવામાં મદદ કરીશ. "
            "આજે તમારી મુખ્ય આરોગ્ય સમસ્યા શું છે?"
        ),
        "ta": (
            "வணக்கம். உங்கள் மருத்துவ வரலாற்றை பதிவு செய்ய உதவுகிறேன். "
            "இன்று உங்கள் முக்கிய உடல்நல பிரச்சனை என்ன?"
        ),
        "te": (
            "హలో. మీ వైద్య చరిత్రను నమోదు చేయడంలో నేను సహాయం చేస్తాను. "
            "ఈరోజు మీ ప్రధాన ఆరోగ్య సమస్య ఏమిటి?"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ. ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ದಾಖಲಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. "
            "ಇಂದು ನಿಮ್ಮ ಮುಖ್ಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಏನು?"
        ),
        "ml": (
            "ഹലോ. നിങ്ങളുടെ മെഡിക്കൽ ചരിത്രം രേഖപ്പെടുത്താൻ ഞാൻ സഹായിക്കും. "
            "ഇന്ന് നിങ്ങളുടെ പ്രധാന ആരോഗ്യ പ്രശ്നം എന്താണ്?"
        ),
        "pa": (
            "ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਮੈਂ ਤੁਹਾਡੀ ਮੈਡੀਕਲ ਹਿਸਟਰੀ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ। "
            "ਅੱਜ ਤੁਹਾਡੀ ਮੁੱਖ ਸਿਹਤ ਸਮੱਸਿਆ ਕੀ ਹੈ?"
        ),
        "or": (
            "ନମସ୍କାର। ମୁଁ ଆପଣଙ୍କର ଚିକିତ୍ସା ଇତିହାସ ରେକର୍ଡ କରିବାରେ ସାହାଯ୍ୟ କରିବି। "
            "ଆଜି ଆପଣଙ୍କର ମୁଖ୍ୟ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା କଣ?"
        ),
        "as": (
            "নমস্কাৰ। মই আপোনাৰ চিকিৎসা ইতিহাস ৰেকৰ্ড কৰাত সহায় কৰিম। "
            "আজি আপোনাৰ মুখ্য স্বাস্থ্য সমস্যা কি?"
        ),
    }

    session = {
        "session_id": sid,
        "patient_id": patient_id,
        "language": language,
        "transcript": [
            {
                "role": "assistant",
                "text": greeting.get(language, greeting["en"]),
            }
        ],
        "extracted_documents": [],
        "final_summary": None,
        "status": "draft",
    }

    save_session(session)

    return session


# =========================================================
# GET SESSION
# =========================================================

@app.get("/api/session/{session_id}")
def session(session_id: str):

    data = get_session(session_id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return data


# =========================================================
# CHAT / SOCRATES
# =========================================================

@app.post("/api/chat")
def chat(req: ChatRequest):

    session = get_session(req.session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    message = req.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    language = normalize_language(req.language)

    session["language"] = language

    session.setdefault("transcript", [])

    session["transcript"].append(
        {
            "role": "user",
            "text": message,
        }
    )

    user_count = sum(
        1
        for item in session["transcript"]
        if item.get("role") == "user"
    )

    chips = []

    if user_count <= len(QUESTIONS):

        framework_item = SOCRATES[user_count - 1]

        question, chips = QUESTIONS[user_count - 1]

        translated_questions = QUESTION_TRANSLATIONS.get(
            language,
            QUESTION_TRANSLATIONS["en"]
        )

        question = translated_questions[user_count - 1]

        # LLM seam
        try:
            call_llm(
                (
                    "Generate the next adaptive SOCRATES question. "
                    f"Framework item: {framework_item}. "
                    f"Language: {language}. "
                    f"Conversation: {session['transcript']}"
                ),
                language=language,
            )
        except Exception as exc:
            print("LLM question generation warning:", exc)

        answer = question

        session["transcript"].append(
            {
                "role": "assistant",
                "text": answer,
                "chips": chips,
                "framework": framework_item,
            }
        )

        complete = False

    else:

        answer = COMPLETION_MESSAGES.get(
            language,
            COMPLETION_MESSAGES["en"]
        )

        session["transcript"].append(
            {
                "role": "assistant",
                "text": answer,
                "chips": [],
                "framework": "complete",
            }
        )

        chips = []
        complete = True

    save_session(session)

    return {
        "reply": answer,
        "chips": [] if complete else chips,
        "transcript": session["transcript"],
        "complete": complete,
        "language": language,
    }


# =========================================================
# DOCUMENT OCR + EXTRACTION
# =========================================================

@app.post("/api/extract-document")
async def extract_document(
    file: UploadFile = File(...),
    session_id: str = "demo-session",
    language: str = "en",
):

    language = normalize_language(language)

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    # OCR adapter
    try:
        ocr_text = run_ocr(
            content,
            file.filename,
            language=language
        )
    except TypeError:
        # Backward compatibility if OCR adapter still accepts only
        # content and filename
        ocr_text = run_ocr(
            content,
            file.filename
        )

    print("\n========== OCR TEXT ==========")
    print(ocr_text)
    print("========== END OCR ==========\n")

    # LLM extraction
    prompt = f"""
You are extracting facts from a medical document.

Selected language:
{language}

IMPORTANT RULES:
1. Only extract information explicitly present in the OCR text.
2. Never invent a diagnosis.
3. If diagnosis or impression is not explicitly present, return an empty string.
4. Extract medicines only when present.
5. Extract lab tests, values and reference ranges only when present.
6. Extract the document date only when present.
7. Do not infer disease from symptoms or lab values.
8. Return valid JSON only.

Required JSON format:
{{
  "diagnosis": "",
  "medicines": [],
  "lab_tests": [],
  "date": ""
}}

OCR TEXT:
{ocr_text}
"""

    try:
        raw = call_llm(
            prompt,
            language=language
        )
    except TypeError:
        raw = call_llm(prompt)

    try:
        data = json.loads(raw)

    except Exception:
        data = {
            "diagnosis": "",
            "medicines": [],
            "lab_tests": [],
            "date": "",
        }

    # Defensive normalization
    data.setdefault("diagnosis", "")
    data.setdefault("medicines", [])
    data.setdefault("lab_tests", [])
    data.setdefault("date", "")

    # Never allow invalid types
    if not isinstance(data.get("medicines"), list):
        data["medicines"] = []

    if not isinstance(data.get("lab_tests"), list):
        data["lab_tests"] = []

    data["filename"] = file.filename
    data["ocr_text"] = ocr_text
    data["uploaded_at"] = datetime.utcnow().isoformat()
    data["language"] = language

    # Save document into session
    current_session = get_session(session_id)

    if current_session:

        current_session.setdefault(
            "extracted_documents",
            []
        )

        current_session["language"] = language

        current_session["extracted_documents"].append(data)

        save_session(current_session)

    return data


# =========================================================
# SUMMARY HELPERS
# =========================================================

def build_hpi(users: list[str]) -> str:

    if len(users) <= 1:
        return (
            "Symptom history recorded conversationally using "
            "the SOCRATES framework."
        )

    site = users[1] if len(users) > 1 else ""
    onset = users[2] if len(users) > 2 else ""
    character = users[3] if len(users) > 3 else ""
    radiation = users[4] if len(users) > 4 else ""
    associations = users[5] if len(users) > 5 else ""
    timing = users[6] if len(users) > 6 else ""
    factors = users[7] if len(users) > 7 else ""
    severity = users[8] if len(users) > 8 else ""

    # -----------------------------------------------------
    # Severity
    # -----------------------------------------------------

    severity_text = severity

    if severity:
        if "7–8" in severity:
            severity_text = "7–8/10 (severe)"
        elif "9–10" in severity:
            severity_text = "9–10/10 (very severe)"
        elif "4–6" in severity:
            severity_text = "4–6/10 (moderate)"
        elif "1–3" in severity:
            severity_text = "1–3/10 (mild)"

    # -----------------------------------------------------
    # Timing
    # -----------------------------------------------------

    timing_text = timing

    if timing == "Comes and goes":
        timing_text = "occurs intermittently"
    elif timing == "Constant":
        timing_text = "is constant"

    # -----------------------------------------------------
    # Associations
    # -----------------------------------------------------

    association_text = ""

    if associations and associations != "None":
        association_text = (
            f"It is associated with {associations.lower()}."
        )

    # -----------------------------------------------------
    # Radiation
    # -----------------------------------------------------

    radiation_text = ""

    if radiation and radiation != "No":
        radiation_text = (
            f"The pain radiates to the {radiation.lower()}."
        )

    # -----------------------------------------------------
    # Factors
    # -----------------------------------------------------

    factor_text = ""

    if factors == "Activity":
        factor_text = "Symptoms are worse with activity."
    elif factors == "Food":
        factor_text = "Symptoms are affected by food."
    elif factors == "Rest":
        factor_text = "Symptoms are improved with rest."
    elif factors == "Nothing helps":
        factor_text = "No relieving factor was reported."

    # -----------------------------------------------------
    # Build paragraph
    # -----------------------------------------------------

    parts = []

    if site:
        parts.append(
            f"Patient reports pain at the {site.lower()}."
        )

    if onset:
        parts.append(
            f"The symptom started {onset.lower()}."
        )

    if character:
        parts.append(
            f"The pain is described as {character.lower()}."
        )

    if radiation_text:
        parts.append(radiation_text)

    if association_text:
        parts.append(association_text)

    if timing_text:
        parts.append(
            f"The symptom {timing_text}."
        )

    if factor_text:
        parts.append(factor_text)

    if severity_text:
        parts.append(
            f"Reported severity is {severity_text}."
        )

    if not parts:
        return (
            "Symptom history recorded conversationally using "
            "the SOCRATES framework."
        )

    return " ".join(parts)


# =========================================================
# DOCUMENT SUMMARY BUILDER
# =========================================================

def build_document_summary(documents: list[dict[str, Any]]) -> str:

    if not documents:
        return "No prior investigations or documents uploaded."

    parts = []

    for document in documents:

        filename = document.get(
            "filename",
            "Uploaded document"
        )

        date = document.get(
            "date",
            ""
        )

        if date:
            parts.append(
                f"Document: {filename} ({date})"
            )
        else:
            parts.append(
                f"Document: {filename}"
            )

        # -------------------------------------------------
        # Diagnosis
        # -------------------------------------------------

        diagnosis = (
            document.get("diagnosis") or ""
        ).strip()

        # IMPORTANT:
        # Only show explicitly extracted diagnosis.
        # Never infer diagnosis from symptoms/labs.
        if diagnosis:
            parts.append(
                f"Diagnosis/impression: {diagnosis}"
            )

        # -------------------------------------------------
        # Medicines
        # -------------------------------------------------

        for medicine in document.get(
            "medicines",
            []
        ):

            if not isinstance(medicine, dict):
                continue

            name = medicine.get(
                "name",
                "Medicine"
            )

            dosage = medicine.get(
                "dosage",
                ""
            )

            if dosage:
                parts.append(
                    f"Medicine: {name} — {dosage}"
                )
            else:
                parts.append(
                    f"Medicine: {name}"
                )

        # -------------------------------------------------
        # Lab tests
        # -------------------------------------------------

        for lab in document.get(
            "lab_tests",
            []
        ):

            if not isinstance(lab, dict):
                continue

            name = lab.get(
                "name",
                "Lab test"
            )

            value = lab.get(
                "value",
                ""
            )

            reference = lab.get(
                "reference_range",
                ""
            )

            if value and reference:
                parts.append(
                    f"Lab: {name} = {value} "
                    f"(Reference: {reference})"
                )

            elif value:
                parts.append(
                    f"Lab: {name} = {value}"
                )

            else:
                parts.append(
                    f"Lab: {name}"
                )

    return "\n".join(parts)


# =========================================================
# GENERATE SUMMARY
# =========================================================

@app.post("/api/generate-summary")
def generate_summary(req: SummaryRequest):

    session = get_session(req.session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    language = normalize_language(req.language)

    session["language"] = language

    # Use documents sent by frontend.
    # If frontend sends empty list, use documents already saved.
    documents = req.documents

    if not documents:
        documents = session.get(
            "extracted_documents",
            []
        )

    session["extracted_documents"] = documents

    transcript = session.get(
        "transcript",
        []
    )

    users = [
        item.get("text", "")
        for item in transcript
        if item.get("role") == "user"
        and item.get("text")
    ]

    # -----------------------------------------------------
    # Required physician-ready structure
    # -----------------------------------------------------

    summary = {
        "Chief Complaint": "",
        "History of Present Illness": "",
        "Past Medical/Surgical History": (
            "Not documented in intake"
        ),
        "Drug & Allergy History": (
            "Not documented in intake"
        ),
        "Family History": (
            "Not documented in intake"
        ),
        "Personal History": (
            "Not documented in intake"
        ),
        "Review of Systems": (
            "Not fully documented in intake"
        ),
        "Prior Investigations Summary": "",
    }

    # -----------------------------------------------------
    # Chief complaint + HPI
    # -----------------------------------------------------

    if users:

        summary["Chief Complaint"] = users[0]

        summary["History of Present Illness"] = build_hpi(
            users
        )

    else:

        summary["Chief Complaint"] = (
            "Not documented in intake"
        )

        summary["History of Present Illness"] = (
            "Not documented in intake"
        )

    # -----------------------------------------------------
    # Documents
    # -----------------------------------------------------

    summary["Prior Investigations Summary"] = (
        build_document_summary(documents)
    )

    # -----------------------------------------------------
    # Save draft
    # -----------------------------------------------------

    session["final_summary"] = summary
    session["status"] = "draft"

    save_session(session)

    return {
        "summary": summary,
        "status": "draft",
        "session_id": session["session_id"],
        "language": language,
    }


# =========================================================
# SAVE SESSION
# =========================================================

@app.post("/api/session/save")
def save_session_endpoint(req: SaveSessionRequest):

    existing = get_session(req.session_id)

    language = normalize_language(req.language)

    session = {
        "session_id": req.session_id,
        "patient_id": req.patient_id,
        "transcript": req.transcript,
        "extracted_documents": req.extracted_documents,
        "final_summary": req.final_summary,
        "status": req.status,
        "language": language,
    }

    # Preserve fields that may exist in DB
    if existing:

        for key in existing:

            if key not in session:
                session[key] = existing[key]

    save_session(session)

    return {
        "ok": True,
        "message": "Session saved successfully",
        "session": session,
    }


# =========================================================
# CONFIRM SUMMARY
# =========================================================

@app.post("/api/session/confirm")
def confirm_session(req: ConfirmRequest):

    session = get_session(req.session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if req.summary is not None:
        session["final_summary"] = req.summary

    session["status"] = "confirmed"

    save_session(session)

    return {
        "ok": True,
        "status": "confirmed",
        "session_id": session["session_id"],
        "summary": session.get(
            "final_summary",
            {}
        ),
    }


# =========================================================
# EDIT / UPDATE SUMMARY
# =========================================================

@app.post("/api/session/update-summary")
def update_summary(
    session_id: str,
    summary: dict[str, Any],
):

    session = get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    session["final_summary"] = summary

    # Any edit makes it a draft again.
    session["status"] = "draft"

    save_session(session)

    return {
        "ok": True,
        "status": "draft",
        "summary": summary,
    }


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "name": "MediIntake AI API",
        "version": "0.3.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
    }