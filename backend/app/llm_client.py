"""
MediIntake AI - Swappable LLM Client

Current mode:
- mock/demo
- no API key required
- does not invent diagnosis
- supports multilingual prompt context

Production:
Replace call_llm() with OpenAI, Mistral, Gemini,
local LLM, etc.
"""

import os
import json
import re


# =========================================================
# LANGUAGE NAMES
# =========================================================

LANGUAGES = {
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


# =========================================================
# DEMO DOCUMENT EXTRACTION
# =========================================================

def _extract_demo_fields_from_prompt(prompt: str) -> dict:
    """
    Extract only explicitly documented information.

    IMPORTANT:
    This function must never invent diagnosis.
    """

    text = prompt.lower()

    diagnosis = ""

    diagnosis_patterns = [
        r"diagnosis\s*[:\-]\s*(.+)",
        r"impression\s*[:\-]\s*(.+)",
    ]

    for pattern in diagnosis_patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            value = (
                match.group(1)
                .split("\n")[0]
                .strip()
            )

            if value:
                diagnosis = value
                break

    medicines = []

    if "paracetamol" in text:
        medicines.append(
            {
                "name": "Paracetamol 500 mg",
                "dosage": "500 mg as needed",
            }
        )

    if "pantoprazole" in text:
        medicines.append(
            {
                "name": "Pantoprazole 40 mg",
                "dosage": "40 mg once daily before breakfast",
            }
        )

    lab_tests = []

    hemoglobin = re.search(
        r"hemoglobin\s+([0-9.]+)\s*g/?dl",
        text,
        re.IGNORECASE
    )

    if hemoglobin:
        lab_tests.append(
            {
                "name": "Hemoglobin",
                "value": f"{hemoglobin.group(1)} g/dL",
                "reference_range": "13.0–17.0 g/dL",
            }
        )

    cholesterol = re.search(
        r"total cholesterol\s+([0-9.]+)\s*mg/?dl",
        text,
        re.IGNORECASE
    )

    if cholesterol:
        lab_tests.append(
            {
                "name": "Total Cholesterol",
                "value": f"{cholesterol.group(1)} mg/dL",
                "reference_range": "<200 mg/dL",
            }
        )

    glucose = re.search(
        r"fasting glucose\s+([0-9.]+)\s*mg/?dl",
        text,
        re.IGNORECASE
    )

    if glucose:
        lab_tests.append(
            {
                "name": "Fasting Glucose",
                "value": f"{glucose.group(1)} mg/dL",
                "reference_range": "70–100 mg/dL",
            }
        )

    date = ""

    date_patterns = [
        r"document date\s*[:\-]\s*([0-9]{1,2}\s+[a-z]+\s+[0-9]{4})",
        r"date\s*[:\-]\s*([0-9]{1,2}\s+[a-z]+\s+[0-9]{4})",
    ]

    for pattern in date_patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            date = match.group(1)
            break

    return {
        "diagnosis": diagnosis,
        "medicines": medicines,
        "lab_tests": lab_tests,
        "date": date,
    }


# =========================================================
# CHAT DEMO
# =========================================================

def _demo_chat_response(
    message: str,
    language: str = "en"
):
    """
    Simple deterministic demo conversation.

    Production LLM can replace this.
    """

    message_lower = message.lower()

    # -----------------------------------------------------
    # Hindi
    # -----------------------------------------------------

    if language == "hi":

        if any(
            word in message_lower
            for word in [
                "सीने",
                "छाती",
                "chest",
                "सीना",
            ]
        ):
            return {
                "text":
                    "दर्द छाती में ठीक किस जगह पर है?",
                "chips": [
                    "छाती के बीच में",
                    "बाईं तरफ",
                    "दाईं तरफ",
                    "पूरे सीने में",
                ],
            }

        return {
            "text":
                "क्या आप अपने लक्षणों के बारे में थोड़ा और बता सकते हैं?",
            "chips": [],
        }

    # -----------------------------------------------------
    # Marathi
    # -----------------------------------------------------

    if language == "mr":

        if any(
            word in message_lower
            for word in [
                "छाती",
                "chest",
            ]
        ):
            return {
                "text":
                    "दुखत नेमके छातीच्या कोणत्या भागात आहे?",
                "chips": [
                    "छातीच्या मध्यभागी",
                    "डाव्या बाजूला",
                    "उजव्या बाजूला",
                ],
            }

        return {
            "text":
                "आपल्या लक्षणांबद्दल आणखी थोडे सांगा.",
            "chips": [],
        }

    # -----------------------------------------------------
    # Bengali
    # -----------------------------------------------------

    if language == "bn":

        if "chest" in message_lower or "বুক" in message_lower:
            return {
                "text":
                    "ব্যথাটি বুকের ঠিক কোন অংশে হচ্ছে?",
                "chips": [
                    "বুকের মাঝখানে",
                    "বাম দিকে",
                    "ডান দিকে",
                ],
            }

        return {
            "text":
                "আপনার উপসর্গ সম্পর্কে আরও একটু বলুন।",
            "chips": [],
        }

    # -----------------------------------------------------
    # Gujarati
    # -----------------------------------------------------

    if language == "gu":

        if "chest" in message_lower or "છાતી" in message_lower:
            return {
                "text":
                    "દુખાવો છાતીના કયા ભાગમાં છે?",
                "chips": [
                    "છાતીની વચ્ચે",
                    "ડાબી બાજુ",
                    "જમણી બાજુ",
                ],
            }

        return {
            "text":
                "તમારા લક્ષણો વિશે થોડું વધુ જણાવો.",
            "chips": [],
        }

    # -----------------------------------------------------
    # Tamil
    # -----------------------------------------------------

    if language == "ta":

        if "chest" in message_lower or "மார்பு" in message_lower:
            return {
                "text":
                    "வலி மார்பின் எந்த பகுதியில் உள்ளது?",
                "chips": [
                    "மார்பின் நடுவில்",
                    "இடது பக்கம்",
                    "வலது பக்கம்",
                ],
            }

        return {
            "text":
                "உங்கள் அறிகுறிகளைப் பற்றி மேலும் சொல்லுங்கள்.",
            "chips": [],
        }

    # -----------------------------------------------------
    # Telugu
    # -----------------------------------------------------

    if language == "te":

        if "chest" in message_lower or "ఛాతి" in message_lower:
            return {
                "text":
                    "నొప్పి ఛాతీలో ఏ భాగంలో ఉంది?",
                "chips": [
                    "ఛాతీ మధ్యలో",
                    "ఎడమ వైపు",
                    "కుడి వైపు",
                ],
            }

        return {
            "text":
                "మీ లక్షణాల గురించి మరింత చెప్పండి.",
            "chips": [],
        }

    # -----------------------------------------------------
    # Kannada
    # -----------------------------------------------------

    if language == "kn":

        if "chest" in message_lower or "ಎದೆ" in message_lower:
            return {
                "text":
                    "ನೋವು ಎದೆಯ ಯಾವ ಭಾಗದಲ್ಲಿದೆ?",
                "chips": [
                    "ಎದೆಯ ಮಧ್ಯದಲ್ಲಿ",
                    "ಎಡಭಾಗದಲ್ಲಿ",
                    "ಬಲಭಾಗದಲ್ಲಿ",
                ],
            }

        return {
            "text":
                "ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಸಿ.",
            "chips": [],
        }

    # -----------------------------------------------------
    # Malayalam
    # -----------------------------------------------------

    if language == "ml":

        if "chest" in message_lower or "നെഞ്ച്" in message_lower:
            return {
                "text":
                    "വേദന നെഞ്ചിന്റെ ഏത് ഭാഗത്താണ്?",
                "chips": [
                    "നെഞ്ചിന്റെ മധ്യത്തിൽ",
                    "ഇടത് വശത്ത്",
                    "വലത് വശത്ത്",
                ],
            }

        return {
            "text":
                "നിങ്ങളുടെ ലക്ഷണങ്ങളെക്കുറിച്ച് കൂടുതൽ പറയൂ.",
            "chips": [],
        }

    # -----------------------------------------------------
    # Punjabi
    # -----------------------------------------------------

    if language == "pa":

        if "chest" in message_lower or "ਛਾਤੀ" in message_lower:
            return {
                "text":
                    "ਦਰਦ ਛਾਤੀ ਦੇ ਕਿਸ ਹਿੱਸੇ ਵਿੱਚ ਹੈ?",
                "chips": [
                    "ਛਾਤੀ ਦੇ ਵਿਚਕਾਰ",
                    "ਖੱਬੇ ਪਾਸੇ",
                    "ਸੱਜੇ ਪਾਸੇ",
                ],
            }

        return {
            "text":
                "ਆਪਣੇ ਲੱਛਣਾਂ ਬਾਰੇ ਹੋਰ ਦੱਸੋ।",
            "chips": [],
        }

    # -----------------------------------------------------
    # Odia
    # -----------------------------------------------------

    if language == "or":

        if "chest" in message_lower or "ଛାତି" in message_lower:
            return {
                "text":
                    "ଯନ୍ତ୍ରଣା ଛାତିର କେଉଁ ଅଂଶରେ ହେଉଛି?",
                "chips": [
                    "ଛାତିର ମଝିରେ",
                    "ବାମ ପାର୍ଶ୍ୱରେ",
                    "ଡାହାଣ ପାର୍ଶ୍ୱରେ",
                ],
            }

        return {
            "text":
                "ଆପଣଙ୍କ ଲକ୍ଷଣ ବିଷୟରେ ଆଉ କିଛି କୁହନ୍ତୁ।",
            "chips": [],
        }

    # -----------------------------------------------------
    # Assamese
    # -----------------------------------------------------

    if language == "as":

        if "chest" in message_lower or "বুক" in message_lower:
            return {
                "text":
                    "বিষটো বুকৰ কোন অংশত হৈছে?",
                "chips": [
                    "বুকৰ মাজত",
                    "বাওঁফালে",
                    "সোঁফালে",
                ],
            }

        return {
            "text":
                "আপোনাৰ লক্ষণসমূহৰ বিষয়ে আৰু অলপ কওক।",
            "chips": [],
        }

    # -----------------------------------------------------
    # English
    # -----------------------------------------------------

    if (
        "chest" in message_lower
        or "pain" in message_lower
    ):
        return {
            "text":
                "Where exactly is the pain located?",
            "chips": [
                "Center of chest",
                "Left side",
                "Right side",
                "Across the chest",
            ],
        }

    return {
        "text":
            "What else can you tell me about your symptoms?",
        "chips": [],
    }


# =========================================================
# MAIN LLM FUNCTION
# =========================================================

def call_llm(
    prompt: str,
    language: str = "en"
) -> str:

    provider = os.getenv(
        "LLM_PROVIDER",
        "mock"
    ).lower()

    if provider == "mock":

        prompt_lower = prompt.lower()

        # -------------------------------------------------
        # STRUCTURED DOCUMENT EXTRACTION
        # -------------------------------------------------

        if (
            "structured fields"
            in prompt_lower
            or "extract" in prompt_lower
        ):
            return json.dumps(
                _extract_demo_fields_from_prompt(
                    prompt
                ),
                ensure_ascii=False
            )

        # -------------------------------------------------
        # CLINICAL SUMMARY
        # -------------------------------------------------

        if "clinical summary" in prompt_lower:

            language_name = LANGUAGES.get(
                language,
                "English"
            )

            return (
                f"Demo clinical summary generated "
                f"in {language_name} from the patient "
                f"intake conversation and uploaded documents."
            )

        # -------------------------------------------------
        # CHAT
        # -------------------------------------------------

        response = _demo_chat_response(
            prompt,
            language
        )

        return json.dumps(
            response,
            ensure_ascii=False
        )

    raise RuntimeError(
        "LLM provider is not configured. "
        "Set LLM_PROVIDER or implement call_llm()."
    )