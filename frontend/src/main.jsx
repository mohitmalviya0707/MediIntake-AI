import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Mic,
  Send,
  Upload,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  FileText,
  ShieldCheck,
  Edit3,
  Printer,
  Languages,
  Lock,
  Save,
} from "lucide-react";

import "./index.css";

// =========================================================
// API
// =========================================================

const API = "http://localhost:8000/api";

// =========================================================
// LANGUAGES
// =========================================================

const LANGUAGE_CONFIG = {
  en: {
    name: "English",
    native: "English",
    speech: "en-IN",
  },

  hi: {
    name: "Hindi",
    native: "हिन्दी",
    speech: "hi-IN",
  },

  mr: {
    name: "Marathi",
    native: "मराठी",
    speech: "mr-IN",
  },

  bn: {
    name: "Bengali",
    native: "বাংলা",
    speech: "bn-IN",
  },

  gu: {
    name: "Gujarati",
    native: "ગુજરાતી",
    speech: "gu-IN",
  },

  ta: {
    name: "Tamil",
    native: "தமிழ்",
    speech: "ta-IN",
  },

  te: {
    name: "Telugu",
    native: "తెలుగు",
    speech: "te-IN",
  },

  kn: {
    name: "Kannada",
    native: "ಕನ್ನಡ",
    speech: "kn-IN",
  },

  ml: {
    name: "Malayalam",
    native: "മലയാളം",
    speech: "ml-IN",
  },

  pa: {
    name: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    speech: "pa-IN",
  },

  or: {
    name: "Odia",
    native: "ଓଡ଼ିଆ",
    speech: "or-IN",
  },

  as: {
    name: "Assamese",
    native: "অসমীয়া",
    speech: "as-IN",
  },
};

// =========================================================
// TRANSLATIONS
// =========================================================

const TRANSLATIONS = {
  en: {
    appName: "MediIntake AI",
    subtitle: "AI-Powered Clinical History Intake",

    steps: [
      "Welcome",
      "History",
      "Documents",
      "Review",
      "Doctor View",
    ],

    patientIntake: "PATIENT INTAKE",
    welcomeTitle: "Tell your health story before you meet the doctor.",
    welcomeText:
      "MediIntake AI asks simple follow-up questions, reads prior reports, and prepares a structured draft for your clinician.",

    newPatient: "New Patient",
    newPatientText: "Start a fresh intake",

    existingPatient: "Existing Patient",
    existingPatientText: "Continue with patient ID",

    patientSessionId: "Patient / session ID",

    consentTitle: "Consent and Privacy",
    consentText:
      "I understand that my answers and uploaded documents will be used to prepare a draft clinical summary for a healthcare professional to review.",

    startIntake: "Start intake",
    starting: "Starting...",

    safeHandoff: "Designed for safe handoff",

    feature1: "Conversational history",
    feature1Text:
      "SOCRATES-style prompts with quick replies and voice input.",

    feature2: "Prior documents",
    feature2Text:
      "OCR extracts key facts into editable fields.",

    feature3: "Doctor-ready draft",
    feature3Text:
      "A structured summary clearly marked for clinician review.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR, and emergency red-flag logic are configured as integration modules.",

    history: "Clinical History",
    documents: "Medical Documents",
    review: "Review",
    doctorView: "Doctor View",

    intakeWarning:
      "This is an intake assistant, not a diagnostic system. Describe what you are experiencing in your own words.",

    speak: "Speak",
    listening: "Listening...",
    typeAnswer: "Type your answer...",
    send: "Send",

    continueDocuments: "Continue to documents",

    uploadTitle: "Do you have any prior prescriptions or reports?",
    uploadText:
      "Upload a clear image or PDF. You can skip this step.",

    extracting: "Extracting...",
    uploadDocument: "Tap to upload prescription / report",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR complete",

    skip: "Skip for now",
    reviewExtracted: "Review extracted data",

    reviewTitle: "Review extracted information",
    reviewText:
      "Please correct any OCR mistakes before generating the summary.",

    editable: "Editable",

    diagnosis: "Diagnosis / impression",
    documentDate: "Document date",

    medicines: "Medicines",
    medicine: "Medicine",
    dosage: "Dosage",

    laboratory: "Laboratory Investigations",
    labTest: "Lab test",
    value: "Value",
    referenceRange: "Reference range",

    noLabs: "No laboratory tests extracted.",
    noDocuments:
      "No documents were uploaded. You can continue to the draft summary.",

    generateSummary: "Generate draft summary",
    generating: "Generating...",

    structuredSummary:
      "Structured summary assembled from patient intake and uploaded documents.",

    draft: "DRAFT • CLINICIAN REVIEW REQUIRED",
    final: "FINAL • CLINICIAN CONFIRMED",

    patientView: "Patient view",
    staffDoctor: "Staff / doctor",

    edit: "Edit",
    done: "Done",
    print: "Print",
    editSummary: "Edit summary",

    patientReadonly: "Patient view is read-only",

    confirmDraft: "Confirm draft",
    saving: "Saving...",
    clinicianConfirmed: "Clinician confirmed",

    chiefComplaint: "Chief Complaint",
    hpi: "History of Present Illness",
    pastHistory: "Past Medical/Surgical History",
    drugHistory: "Drug & Allergy History",
    familyHistory: "Family History",
    personalHistory: "Personal History",
    ros: "Review of Systems",
    investigations: "Prior Investigations Summary",

    notDocumented: "Not documented",

    disclaimer:
      "This output is a documentation draft. It does not constitute an autonomous diagnosis, treatment recommendation, or emergency triage decision. A qualified clinician should verify and amend it.",

    footer:
      "Demo mode • No autonomous diagnosis • Information is a draft for clinician review.",

    cannotConnect:
      "Cannot connect to MediIntake AI backend. Please make sure FastAPI is running on port 8000.",
  },

  hi: {
    appName: "MediIntake AI",
    subtitle: "AI आधारित क्लिनिकल इतिहास संग्रह प्रणाली",

    steps: [
      "स्वागत",
      "इतिहास",
      "दस्तावेज़",
      "समीक्षा",
      "डॉक्टर व्यू",
    ],

    patientIntake: "रोगी जानकारी",
    welcomeTitle: "डॉक्टर से मिलने से पहले अपनी स्वास्थ्य जानकारी बताएं।",
    welcomeText:
      "MediIntake AI सरल सवाल पूछता है, पुराने मेडिकल दस्तावेज़ पढ़ता है और डॉक्टर के लिए व्यवस्थित ड्राफ्ट तैयार करता है।",

    newPatient: "नया रोगी",
    newPatientText: "नई जानकारी शुरू करें",

    existingPatient: "मौजूदा रोगी",
    existingPatientText: "रोगी ID से जारी रखें",

    patientSessionId: "रोगी / सेशन ID",

    consentTitle: "सहमति और गोपनीयता",
    consentText:
      "मैं समझता/समझती हूँ कि मेरे उत्तर और अपलोड किए गए दस्तावेज़ स्वास्थ्य विशेषज्ञ द्वारा समीक्षा के लिए क्लिनिकल सारांश तैयार करने में उपयोग किए जाएंगे।",

    startIntake: "शुरू करें",
    starting: "शुरू हो रहा है...",

    safeHandoff: "सुरक्षित क्लिनिकल हैंडऑफ के लिए",

    feature1: "बातचीत द्वारा इतिहास",
    feature1Text:
      "SOCRATES आधारित सवाल, quick replies और voice input।",

    feature2: "पुराने दस्तावेज़",
    feature2Text:
      "OCR महत्वपूर्ण जानकारी को editable fields में निकालता है।",

    feature3: "डॉक्टर के लिए ड्राफ्ट",
    feature3Text:
      "डॉक्टर की समीक्षा के लिए स्पष्ट रूप से चिन्हित structured summary।",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR और emergency red-flag logic integration modules के रूप में configured हैं।",

    history: "क्लिनिकल इतिहास",
    documents: "चिकित्सीय दस्तावेज़",
    review: "समीक्षा",
    doctorView: "डॉक्टर व्यू",

    intakeWarning:
      "यह intake assistant है, diagnostic system नहीं। अपने लक्षणों के बारे में अपने शब्दों में बताएं।",

    speak: "बोलें",
    listening: "सुना जा रहा है...",
    typeAnswer: "अपना उत्तर लिखें...",
    send: "भेजें",

    continueDocuments: "दस्तावेज़ों पर जाएं",

    uploadTitle: "क्या आपके पास पुराने prescription या reports हैं?",
    uploadText:
      "स्पष्ट image या PDF upload करें। आप इस चरण को skip भी कर सकते हैं।",

    extracting: "जानकारी निकाली जा रही है...",
    uploadDocument: "Prescription / report upload करने के लिए टैप करें",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR पूरा",

    skip: "अभी skip करें",
    reviewExtracted: "निकाली गई जानकारी देखें",

    editable: "बदल सकते हैं",

    diagnosis: "Diagnosis / Impression",
    documentDate: "दस्तावेज़ की तारीख",

    medicines: "दवाएं",
    medicine: "दवा",
    dosage: "खुराक",

    laboratory: "प्रयोगशाला जांच",
    labTest: "जांच",
    value: "मान",
    referenceRange: "सामान्य सीमा",

    noLabs: "कोई laboratory test नहीं मिला।",
    noDocuments:
      "कोई दस्तावेज़ upload नहीं किया गया। आप draft summary जारी रख सकते हैं।",

    generateSummary: "ड्राफ्ट सारांश बनाएं",
    generating: "सारांश बनाया जा रहा है...",

    structuredSummary:
      "रोगी के इतिहास और अपलोड किए गए दस्तावेज़ों से तैयार structured summary।",

    draft: "ड्राफ्ट • डॉक्टर की समीक्षा आवश्यक",
    final: "अंतिम • डॉक्टर द्वारा पुष्टि की गई",

    patientView: "रोगी व्यू",
    staffDoctor: "स्टाफ / डॉक्टर",

    edit: "संपादित करें",
    done: "पूरा",
    print: "प्रिंट",
    editSummary: "सारांश संपादित करें",

    patientReadonly: "रोगी व्यू केवल पढ़ने के लिए है",

    confirmDraft: "ड्राफ्ट की पुष्टि करें",
    saving: "सहेजा जा रहा है...",
    clinicianConfirmed: "डॉक्टर द्वारा पुष्टि की गई",

    chiefComplaint: "मुख्य शिकायत",
    hpi: "वर्तमान बीमारी का इतिहास",
    pastHistory: "पिछला चिकित्सा / सर्जिकल इतिहास",
    drugHistory: "दवा और एलर्जी का इतिहास",
    familyHistory: "पारिवारिक इतिहास",
    personalHistory: "व्यक्तिगत इतिहास",
    ros: "सिस्टम की समीक्षा",
    investigations: "पिछली जांचों का सारांश",

    notDocumented: "दर्ज नहीं है",

    disclaimer:
      "यह केवल documentation draft है। यह अपने आप diagnosis, treatment recommendation या emergency triage decision नहीं देता। योग्य डॉक्टर को इसकी समीक्षा और पुष्टि करनी चाहिए।",

    footer:
      "Demo mode • कोई autonomous diagnosis नहीं • जानकारी डॉक्टर की समीक्षा के लिए draft है।",

    cannotConnect:
      "MediIntake AI backend से connection नहीं हो पा रहा है। कृपया जांचें कि FastAPI port 8000 पर चल रहा है।",
  },

  mr: {
    appName: "MediIntake AI",
    subtitle: "AI आधारित क्लिनिकल इतिहास प्रणाली",
    steps: ["स्वागत", "इतिहास", "कागदपत्रे", "पुनरावलोकन", "डॉक्टर व्यू"],

    patientIntake: "रुग्ण माहिती",
    welcomeTitle: "डॉक्टरांना भेटण्यापूर्वी आपल्या आरोग्याची माहिती सांगा.",
    welcomeText:
      "MediIntake AI सोपे प्रश्न विचारते, जुने वैद्यकीय कागदपत्रे वाचते आणि डॉक्टरांसाठी संरचित मसुदा तयार करते.",

    newPatient: "नवीन रुग्ण",
    newPatientText: "नवीन माहिती सुरू करा",
    existingPatient: "विद्यमान रुग्ण",
    existingPatientText: "रुग्ण ID ने पुढे जा",
    patientSessionId: "रुग्ण / सेशन ID",

    consentTitle: "संमती आणि गोपनीयता",
    consentText:
      "माझी उत्तरे आणि अपलोड केलेली कागदपत्रे आरोग्य तज्ज्ञांच्या पुनरावलोकनासाठी क्लिनिकल सारांश तयार करण्यासाठी वापरली जातील हे मला समजले आहे.",

    startIntake: "सुरू करा",
    starting: "सुरू होत आहे...",

    safeHandoff: "सुरक्षित क्लिनिकल हस्तांतरणासाठी",

    feature1: "संवादाद्वारे इतिहास",
    feature1Text: "SOCRATES आधारित प्रश्न, quick replies आणि voice input.",
    feature2: "जुनी कागदपत्रे",
    feature2Text: "OCR महत्त्वाची माहिती editable fields मध्ये काढते.",
    feature3: "डॉक्टरांसाठी मसुदा",
    feature3Text: "डॉक्टरांच्या पुनरावलोकनासाठी structured summary.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR आणि emergency red-flag logic integration modules म्हणून configured आहेत.",

    history: "क्लिनिकल इतिहास",
    documents: "वैद्यकीय कागदपत्रे",
    review: "पुनरावलोकन",
    doctorView: "डॉक्टर व्यू",

    intakeWarning:
      "हे intake assistant आहे, diagnostic system नाही. आपल्या लक्षणांबद्दल आपल्या शब्दांत सांगा.",

    speak: "बोला",
    listening: "ऐकत आहे...",
    typeAnswer: "आपले उत्तर लिहा...",
    send: "पाठवा",

    continueDocuments: "कागदपत्रांकडे जा",

    uploadTitle: "आपल्याकडे जुनी prescriptions किंवा reports आहेत का?",
    uploadText: "स्पष्ट image किंवा PDF upload करा. हा टप्पा skip करू शकता.",

    extracting: "माहिती काढली जात आहे...",
    uploadDocument: "Prescription / report upload करण्यासाठी टॅप करा",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR पूर्ण",

    skip: "आत्ता skip करा",
    reviewExtracted: "काढलेली माहिती तपासा",

    editable: "संपादित करता येईल",

    diagnosis: "Diagnosis / Impression",
    documentDate: "कागदपत्राची तारीख",

    medicines: "औषधे",
    medicine: "औषध",
    dosage: "डोस",

    laboratory: "प्रयोगशाळा तपासण्या",
    labTest: "तपासणी",
    value: "मूल्य",
    referenceRange: "संदर्भ मर्यादा",

    noLabs: "कोणतीही laboratory test मिळाली नाही.",
    noDocuments: "कोणतेही कागदपत्र upload केले नाही.",

    generateSummary: "ड्राफ्ट सारांश तयार करा",
    generating: "सारांश तयार होत आहे...",

    structuredSummary:
      "रुग्ण इतिहास आणि upload केलेल्या कागदपत्रांवर आधारित structured summary.",

    draft: "ड्राफ्ट • डॉक्टर पुनरावलोकन आवश्यक",
    final: "अंतिम • डॉक्टरांनी पुष्टी केली",

    patientView: "रुग्ण व्यू",
    staffDoctor: "स्टाफ / डॉक्टर",

    edit: "संपादित करा",
    done: "पूर्ण",
    print: "प्रिंट",
    editSummary: "सारांश संपादित करा",

    patientReadonly: "रुग्ण व्यू फक्त वाचनासाठी आहे",

    confirmDraft: "ड्राफ्टची पुष्टी करा",
    saving: "साठवले जात आहे...",
    clinicianConfirmed: "डॉक्टरांनी पुष्टी केली",

    chiefComplaint: "मुख्य तक्रार",
    hpi: "सध्याच्या आजाराचा इतिहास",
    pastHistory: "मागील वैद्यकीय / शस्त्रक्रिया इतिहास",
    drugHistory: "औषध आणि ऍलर्जी इतिहास",
    familyHistory: "कौटुंबिक इतिहास",
    personalHistory: "वैयक्तिक इतिहास",
    ros: "सिस्टमचा आढावा",
    investigations: "मागील तपासण्यांचा सारांश",

    notDocumented: "नोंद केलेली नाही",

    disclaimer:
      "हे केवळ documentation draft आहे. हे स्वतःहून diagnosis किंवा treatment recommendation देत नाही. योग्य डॉक्टरांनी त्याची तपासणी करावी.",

    footer:
      "Demo mode • Autonomous diagnosis नाही • माहिती डॉक्टरांच्या पुनरावलोकनासाठी draft आहे.",

    cannotConnect:
      "MediIntake AI backend शी connection होत नाही. FastAPI port 8000 वर चालू आहे का ते तपासा.",
  },

  bn: {
    appName: "MediIntake AI",
    subtitle: "AI ভিত্তিক ক্লিনিক্যাল ইতিহাস সংগ্রহ ব্যবস্থা",
    steps: ["স্বাগতম", "ইতিহাস", "নথি", "পর্যালোচনা", "ডাক্তার ভিউ"],

    patientIntake: "রোগীর তথ্য",
    welcomeTitle: "ডাক্তারের সঙ্গে দেখা করার আগে আপনার স্বাস্থ্য সম্পর্কে বলুন।",
    welcomeText:
      "MediIntake AI সহজ প্রশ্ন করে, পুরনো মেডিক্যাল রিপোর্ট পড়ে এবং চিকিৎসকের জন্য একটি structured draft তৈরি করে।",

    newPatient: "নতুন রোগী",
    newPatientText: "নতুন তথ্য শুরু করুন",
    existingPatient: "বর্তমান রোগী",
    existingPatientText: "রোগী ID দিয়ে চালিয়ে যান",
    patientSessionId: "রোগী / সেশন ID",

    consentTitle: "সম্মতি এবং গোপনীয়তা",
    consentText:
      "আমার উত্তর এবং আপলোড করা নথি স্বাস্থ্যসেবা পেশাদারের পর্যালোচনার জন্য ক্লিনিক্যাল সারাংশ তৈরিতে ব্যবহার করা হবে তা আমি বুঝতে পারছি।",

    startIntake: "শুরু করুন",
    starting: "শুরু হচ্ছে...",

    safeHandoff: "নিরাপদ ক্লিনিক্যাল হ্যান্ডঅফের জন্য",

    feature1: "কথোপকথনের মাধ্যমে ইতিহাস",
    feature1Text: "SOCRATES প্রশ্ন, quick replies এবং voice input।",
    feature2: "পুরনো নথি",
    feature2Text: "OCR গুরুত্বপূর্ণ তথ্য editable fields এ বের করে।",
    feature3: "ডাক্তারের জন্য draft",
    feature3Text: "চিকিৎসকের review এর জন্য structured summary।",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR এবং emergency red-flag logic integration modules হিসেবে configured।",

    history: "ক্লিনিক্যাল ইতিহাস",
    documents: "চিকিৎসা নথি",
    review: "পর্যালোচনা",
    doctorView: "ডাক্তার ভিউ",

    intakeWarning:
      "এটি intake assistant, diagnostic system নয়। আপনার লক্ষণ নিজের ভাষায় বলুন।",

    speak: "বলুন",
    listening: "শোনা হচ্ছে...",
    typeAnswer: "আপনার উত্তর লিখুন...",
    send: "পাঠান",

    continueDocuments: "নথিতে যান",

    uploadTitle: "আপনার কাছে পুরনো prescription বা report আছে কি?",
    uploadText: "পরিষ্কার image বা PDF upload করুন। এই ধাপ skip করতে পারেন।",

    extracting: "তথ্য বের করা হচ্ছে...",
    uploadDocument: "Prescription / report upload করতে ট্যাপ করুন",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR সম্পূর্ণ",

    skip: "এখন skip করুন",
    reviewExtracted: "বের করা তথ্য দেখুন",

    editable: "সম্পাদনাযোগ্য",

    diagnosis: "Diagnosis / Impression",
    documentDate: "নথির তারিখ",

    medicines: "ওষুধ",
    medicine: "ওষুধ",
    dosage: "ডোজ",

    laboratory: "ল্যাবরেটরি পরীক্ষা",
    labTest: "পরীক্ষা",
    value: "মান",
    referenceRange: "রেফারেন্স রেঞ্জ",

    noLabs: "কোনো laboratory test পাওয়া যায়নি।",
    noDocuments: "কোনো নথি upload করা হয়নি।",

    generateSummary: "ড্রাফট সারাংশ তৈরি করুন",
    generating: "সারাংশ তৈরি হচ্ছে...",

    structuredSummary:
      "রোগীর ইতিহাস এবং আপলোড করা নথির ভিত্তিতে structured summary।",

    draft: "ড্রাফট • চিকিৎসকের পর্যালোচনা প্রয়োজন",
    final: "চূড়ান্ত • চিকিৎসক নিশ্চিত করেছেন",

    patientView: "রোগী ভিউ",
    staffDoctor: "স্টাফ / ডাক্তার",

    edit: "সম্পাদনা",
    done: "সম্পন্ন",
    print: "প্রিন্ট",
    editSummary: "সারাংশ সম্পাদনা করুন",

    patientReadonly: "রোগী ভিউ শুধুমাত্র পড়ার জন্য",

    confirmDraft: "ড্রাফট নিশ্চিত করুন",
    saving: "সংরক্ষণ করা হচ্ছে...",
    clinicianConfirmed: "চিকিৎসক নিশ্চিত করেছেন",

    chiefComplaint: "প্রধান অভিযোগ",
    hpi: "বর্তমান অসুস্থতার ইতিহাস",
    pastHistory: "পূর্ববর্তী চিকিৎসা / অস্ত্রোপচার ইতিহাস",
    drugHistory: "ওষুধ এবং অ্যালার্জির ইতিহাস",
    familyHistory: "পারিবারিক ইতিহাস",
    personalHistory: "ব্যক্তিগত ইতিহাস",
    ros: "সিস্টেম পর্যালোচনা",
    investigations: "পূর্ববর্তী পরীক্ষার সারাংশ",

    notDocumented: "নথিভুক্ত নয়",

    disclaimer:
      "এটি শুধুমাত্র documentation draft। এটি স্বয়ংক্রিয় diagnosis বা treatment recommendation দেয় না। যোগ্য চিকিৎসককে এটি যাচাই করতে হবে।",

    footer:
      "Demo mode • Autonomous diagnosis নেই • তথ্য চিকিৎসকের review এর জন্য draft।",

    cannotConnect:
      "MediIntake AI backend এর সাথে সংযোগ করা যাচ্ছে না। FastAPI port 8000 এ চলছে কিনা দেখুন।",
  },

  gu: {
    appName: "MediIntake AI",
    subtitle: "AI આધારિત ક્લિનિકલ હિસ્ટ્રી સિસ્ટમ",
    steps: ["સ્વાગત", "ઇતિહાસ", "દસ્તાવેજો", "સમીક્ષા", "ડોક્ટર વ્યૂ"],

    patientIntake: "દર્દીની માહિતી",
    welcomeTitle: "ડોક્ટરને મળતા પહેલા તમારી આરોગ્ય માહિતી જણાવો.",
    welcomeText:
      "MediIntake AI સરળ પ્રશ્નો પૂછે છે, જૂના રિપોર્ટ વાંચે છે અને ડોક્ટર માટે structured draft બનાવે છે.",

    newPatient: "નવો દર્દી",
    newPatientText: "નવી માહિતી શરૂ કરો",
    existingPatient: "હાલનો દર્દી",
    existingPatientText: "દર્દી ID સાથે ચાલુ રાખો",
    patientSessionId: "દર્દી / સેશન ID",

    consentTitle: "સંમતિ અને ગોપનીયતા",
    consentText:
      "મારા જવાબો અને upload કરેલા દસ્તાવેજોનો ઉપયોગ આરોગ્ય નિષ્ણાત દ્વારા review માટે clinical summary તૈયાર કરવા કરવામાં આવશે તે હું સમજું છું.",

    startIntake: "શરૂ કરો",
    starting: "શરૂ થઈ રહ્યું છે...",

    safeHandoff: "સુરક્ષિત clinical handoff માટે",

    feature1: "વાતચીત દ્વારા ઇતિહાસ",
    feature1Text: "SOCRATES પ્રશ્નો, quick replies અને voice input.",
    feature2: "જૂના દસ્તાવેજો",
    feature2Text: "OCR મહત્વપૂર્ણ માહિતી editable fields માં કાઢે છે.",
    feature3: "ડોક્ટર માટે draft",
    feature3Text: "ડોક્ટરની review માટે structured summary.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR અને emergency red-flag logic integration modules તરીકે configured છે.",

    history: "ક્લિનિકલ ઇતિહાસ",
    documents: "તબીબી દસ્તાવેજો",
    review: "સમીક્ષા",
    doctorView: "ડોક્ટર વ્યૂ",

    intakeWarning:
      "આ intake assistant છે, diagnostic system નથી. તમારા લક્ષણો તમારા શબ્દોમાં જણાવો.",

    speak: "બોલો",
    listening: "સાંભળવામાં આવી રહ્યું છે...",
    typeAnswer: "તમારો જવાબ લખો...",
    send: "મોકલો",

    continueDocuments: "દસ્તાવેજો પર જાઓ",

    uploadTitle: "શું તમારી પાસે જૂના prescription અથવા report છે?",
    uploadText: "સ્પષ્ટ image અથવા PDF upload કરો. તમે આ step skip કરી શકો છો.",

    extracting: "માહિતી કાઢવામાં આવી રહી છે...",
    uploadDocument: "Prescription / report upload કરવા માટે tap કરો",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR પૂર્ણ",

    skip: "હમણાં skip કરો",
    reviewExtracted: "કાઢેલી માહિતી જુઓ",

    editable: "સંપાદિત કરી શકાય છે",

    diagnosis: "Diagnosis / Impression",
    documentDate: "દસ્તાવેજની તારીખ",

    medicines: "દવાઓ",
    medicine: "દવા",
    dosage: "ડોઝ",

    laboratory: "લેબોરેટરી તપાસ",
    labTest: "તપાસ",
    value: "મૂલ્ય",
    referenceRange: "સંદર્ભ મર્યાદા",

    noLabs: "કોઈ laboratory test મળ્યો નથી.",
    noDocuments: "કોઈ દસ્તાવેજ upload થયો નથી.",

    generateSummary: "ડ્રાફ્ટ સારાંશ બનાવો",
    generating: "સારાંશ બનાવવામાં આવી રહ્યો છે...",

    structuredSummary:
      "દર્દીના ઇતિહાસ અને upload કરેલા દસ્તાવેજોના આધારે structured summary.",

    draft: "ડ્રાફ્ટ • ડોક્ટરની સમીક્ષા જરૂરી",
    final: "અંતિમ • ડોક્ટર દ્વારા પુષ્ટિ",

    patientView: "દર્દી વ્યૂ",
    staffDoctor: "સ્ટાફ / ડોક્ટર",

    edit: "ફેરફાર કરો",
    done: "પૂર્ણ",
    print: "પ્રિન્ટ",
    editSummary: "સારાંશમાં ફેરફાર કરો",

    patientReadonly: "દર્દી વ્યૂ ફક્ત વાંચવા માટે છે",

    confirmDraft: "ડ્રાફ્ટની પુષ્ટિ કરો",
    saving: "સાચવવામાં આવી રહ્યું છે...",
    clinicianConfirmed: "ડોક્ટરે પુષ્ટિ કરી",

    chiefComplaint: "મુખ્ય ફરિયાદ",
    hpi: "વર્તમાન બીમારીનો ઇતિહાસ",
    pastHistory: "અગાઉનો તબીબી / સર્જિકલ ઇતિહાસ",
    drugHistory: "દવા અને એલર્જીનો ઇતિહાસ",
    familyHistory: "કુટુંબનો ઇતિહાસ",
    personalHistory: "વ્યક્તિગત ઇતિહાસ",
    ros: "સિસ્ટમની સમીક્ષા",
    investigations: "અગાઉની તપાસનો સારાંશ",

    notDocumented: "નોંધાયેલ નથી",

    disclaimer:
      "આ માત્ર documentation draft છે. તે આપમેળે diagnosis અથવા treatment recommendation આપતું નથી. યોગ્ય ડોક્ટરે તેની ચકાસણી કરવી જોઈએ.",

    footer:
      "Demo mode • Autonomous diagnosis નથી • માહિતી ડોક્ટરની review માટે draft છે.",

    cannotConnect:
      "MediIntake AI backend સાથે connection થઈ રહ્યું નથી. FastAPI port 8000 પર ચાલે છે કે નહીં તપાસો.",
  },

  ta: {
    appName: "MediIntake AI",
    subtitle: "AI அடிப்படையிலான மருத்துவ வரலாறு சேகரிப்பு",
    steps: ["வரவேற்பு", "வரலாறு", "ஆவணங்கள்", "மதிப்பாய்வு", "மருத்துவர் பார்வை"],

    patientIntake: "நோயாளி தகவல்",
    welcomeTitle: "மருத்துவரை சந்திப்பதற்கு முன் உங்கள் உடல்நிலை பற்றி சொல்லுங்கள்.",
    welcomeText:
      "MediIntake AI எளிய கேள்விகளைக் கேட்டு, பழைய மருத்துவ அறிக்கைகளைப் படித்து, மருத்துவருக்கான structured draft உருவாக்குகிறது.",

    newPatient: "புதிய நோயாளர்",
    newPatientText: "புதிய தகவலைத் தொடங்குங்கள்",
    existingPatient: "ஏற்கனவே உள்ள நோயாளர்",
    existingPatientText: "நோயாளர் ID மூலம் தொடருங்கள்",
    patientSessionId: "நோயாளர் / session ID",

    consentTitle: "ஒப்புதல் மற்றும் தனியுரிமை",
    consentText:
      "எனது பதில்கள் மற்றும் upload செய்யப்பட்ட ஆவணங்கள் மருத்துவ நிபுணரின் review க்கான clinical summary தயாரிக்க பயன்படுத்தப்படும் என்பதை புரிந்துகொள்கிறேன்.",

    startIntake: "தொடங்குங்கள்",
    starting: "தொடங்குகிறது...",

    safeHandoff: "பாதுகாப்பான clinical handoff க்காக",

    feature1: "உரையாடல் மூலம் வரலாறு",
    feature1Text: "SOCRATES கேள்விகள், quick replies மற்றும் voice input.",
    feature2: "பழைய ஆவணங்கள்",
    feature2Text: "OCR முக்கிய தகவல்களை editable fields ஆக மாற்றுகிறது.",
    feature3: "மருத்துவருக்கான draft",
    feature3Text: "மருத்துவர் review க்கான structured summary.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR மற்றும் emergency red-flag logic integration modules ஆக configured செய்யப்பட்டுள்ளன.",

    history: "மருத்துவ வரலாறு",
    documents: "மருத்துவ ஆவணங்கள்",
    review: "மதிப்பாய்வு",
    doctorView: "மருத்துவர் பார்வை",

    intakeWarning:
      "இது intake assistant, diagnostic system அல்ல. உங்கள் அறிகுறிகளை உங்கள் சொந்த வார்த்தைகளில் சொல்லுங்கள்.",

    speak: "பேசுங்கள்",
    listening: "கேட்கப்படுகிறது...",
    typeAnswer: "உங்கள் பதிலை எழுதுங்கள்...",
    send: "அனுப்பவும்",

    continueDocuments: "ஆவணங்களுக்கு செல்லவும்",

    uploadTitle: "உங்களிடம் பழைய prescription அல்லது report உள்ளதா?",
    uploadText: "தெளிவான image அல்லது PDF upload செய்யுங்கள். இந்த படியை skip செய்யலாம்.",

    extracting: "தகவல் எடுக்கப்படுகிறது...",
    uploadDocument: "Prescription / report upload செய்ய tap செய்யுங்கள்",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR முடிந்தது",

    skip: "இப்போது skip செய்யவும்",
    reviewExtracted: "எடுக்கப்பட்ட தகவலைப் பார்க்கவும்",

    editable: "திருத்தலாம்",

    diagnosis: "Diagnosis / Impression",
    documentDate: "ஆவண தேதி",

    medicines: "மருந்துகள்",
    medicine: "மருந்து",
    dosage: "அளவு",

    laboratory: "ஆய்வக பரிசோதனைகள்",
    labTest: "பரிசோதனை",
    value: "மதிப்பு",
    referenceRange: "குறிப்பு வரம்பு",

    noLabs: "ஆய்வக பரிசோதனைகள் எதுவும் கிடைக்கவில்லை.",
    noDocuments: "ஆவணங்கள் upload செய்யப்படவில்லை.",

    generateSummary: "Draft summary உருவாக்கவும்",
    generating: "Summary உருவாக்கப்படுகிறது...",

    structuredSummary:
      "நோயாளியின் வரலாறு மற்றும் upload செய்யப்பட்ட ஆவணங்களின் அடிப்படையில் structured summary.",

    draft: "DRAFT • மருத்துவர் review தேவை",
    final: "FINAL • மருத்துவர் உறுதி செய்துள்ளார்",

    patientView: "நோயாளர் பார்வை",
    staffDoctor: "Staff / மருத்துவர்",

    edit: "திருத்து",
    done: "முடிந்தது",
    print: "Print",
    editSummary: "Summary திருத்தவும்",

    patientReadonly: "நோயாளர் பார்வை read-only",

    confirmDraft: "Draft உறுதி செய்யவும்",
    saving: "சேமிக்கப்படுகிறது...",
    clinicianConfirmed: "மருத்துவர் உறுதி செய்துள்ளார்",

    chiefComplaint: "முக்கிய புகார்",
    hpi: "தற்போதைய நோய் வரலாறு",
    pastHistory: "முந்தைய மருத்துவ / அறுவை சிகிச்சை வரலாறு",
    drugHistory: "மருந்து மற்றும் allergy வரலாறு",
    familyHistory: "குடும்ப வரலாறு",
    personalHistory: "தனிப்பட்ட வரலாறு",
    ros: "System review",
    investigations: "முந்தைய பரிசோதனைகளின் சுருக்கம்",

    notDocumented: "பதிவு செய்யப்படவில்லை",

    disclaimer:
      "இது documentation draft மட்டுமே. இது தானாக diagnosis அல்லது treatment recommendation வழங்காது. தகுதியான மருத்துவர் சரிபார்க்க வேண்டும்.",

    footer:
      "Demo mode • Autonomous diagnosis இல்லை • தகவல் மருத்துவர் review க்கான draft.",

    cannotConnect:
      "MediIntake AI backend உடன் connection செய்ய முடியவில்லை. FastAPI port 8000 இல் இயங்குகிறதா என்பதை சரிபார்க்கவும்.",
  },

  te: {
    appName: "MediIntake AI",
    subtitle: "AI ఆధారిత క్లినికల్ హిస్టరీ సేకరణ వ్యవస్థ",
    steps: ["స్వాగతం", "చరిత్ర", "పత్రాలు", "సమీక్ష", "డాక్టర్ వ్యూ"],

    patientIntake: "రోగి సమాచారం",
    welcomeTitle: "డాక్టర్‌ను కలిసే ముందు మీ ఆరోగ్య వివరాలను చెప్పండి.",
    welcomeText:
      "MediIntake AI సులభమైన ప్రశ్నలు అడిగి, పాత వైద్య నివేదికలను చదివి, డాక్టర్ కోసం structured draft తయారు చేస్తుంది.",

    newPatient: "కొత్త రోగి",
    newPatientText: "కొత్త సమాచారాన్ని ప్రారంభించండి",
    existingPatient: "ప్రస్తుత రోగి",
    existingPatientText: "రోగి ID తో కొనసాగండి",
    patientSessionId: "రోగి / session ID",

    consentTitle: "సమ్మతి మరియు గోప్యత",
    consentText:
      "నా సమాధానాలు మరియు upload చేసిన పత్రాలు ఆరోగ్య నిపుణుల review కోసం clinical summary తయారు చేయడానికి ఉపయోగించబడతాయని నేను అర్థం చేసుకున్నాను.",

    startIntake: "ప్రారంభించండి",
    starting: "ప్రారంభమవుతోంది...",

    safeHandoff: "సురక్షిత clinical handoff కోసం",

    feature1: "సంభాషణ ద్వారా చరిత్ర",
    feature1Text: "SOCRATES ప్రశ్నలు, quick replies మరియు voice input.",
    feature2: "పాత పత్రాలు",
    feature2Text: "OCR ముఖ్యమైన సమాచారాన్ని editable fields గా మార్చుతుంది.",
    feature3: "డాక్టర్ కోసం draft",
    feature3Text: "డాక్టర్ review కోసం structured summary.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR మరియు emergency red-flag logic integration modules గా configured చేయబడ్డాయి.",

    history: "క్లినికల్ హిస్టరీ",
    documents: "వైద్య పత్రాలు",
    review: "సమీక్ష",
    doctorView: "డాక్టర్ వ్యూ",

    intakeWarning:
      "ఇది intake assistant, diagnostic system కాదు. మీ లక్షణాలను మీ మాటల్లో చెప్పండి.",

    speak: "మాట్లాడండి",
    listening: "వింటోంది...",
    typeAnswer: "మీ సమాధానాన్ని టైప్ చేయండి...",
    send: "పంపండి",

    continueDocuments: "పత్రాలకు వెళ్లండి",

    uploadTitle: "మీ వద్ద పాత prescription లేదా report ఉందా?",
    uploadText: "స్పష్టమైన image లేదా PDF upload చేయండి. ఈ దశను skip చేయవచ్చు.",

    extracting: "సమాచారం తీసుకుంటోంది...",
    uploadDocument: "Prescription / report upload చేయడానికి tap చేయండి",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR పూర్తయింది",

    skip: "ఇప్పుడు skip చేయండి",
    reviewExtracted: "తీసిన సమాచారాన్ని చూడండి",

    editable: "సవరించవచ్చు",

    diagnosis: "Diagnosis / Impression",
    documentDate: "పత్రం తేదీ",

    medicines: "మందులు",
    medicine: "మందు",
    dosage: "మోతాదు",

    laboratory: "ల్యాబొరేటరీ పరీక్షలు",
    labTest: "పరీక్ష",
    value: "విలువ",
    referenceRange: "సూచన పరిధి",

    noLabs: "ల్యాబొరేటరీ పరీక్షలు ఏవీ లభించలేదు.",
    noDocuments: "పత్రాలు upload చేయలేదు.",

    generateSummary: "Draft summary రూపొందించండి",
    generating: "Summary రూపొందుతోంది...",

    structuredSummary:
      "రోగి చరిత్ర మరియు upload చేసిన పత్రాల ఆధారంగా structured summary.",

    draft: "DRAFT • డాక్టర్ review అవసరం",
    final: "FINAL • డాక్టర్ నిర్ధారించారు",

    patientView: "రోగి వ్యూ",
    staffDoctor: "స్టాఫ్ / డాక్టర్",

    edit: "సవరించండి",
    done: "పూర్తి",
    print: "Print",
    editSummary: "Summary సవరించండి",

    patientReadonly: "రోగి వ్యూ read-only",

    confirmDraft: "Draft నిర్ధారించండి",
    saving: "సేవ్ చేస్తోంది...",
    clinicianConfirmed: "డాక్టర్ నిర్ధారించారు",

    chiefComplaint: "ప్రధాన ఫిర్యాదు",
    hpi: "ప్రస్తుత అనారోగ్య చరిత్ర",
    pastHistory: "మునుపటి వైద్య / శస్త్రచికిత్స చరిత్ర",
    drugHistory: "మందులు మరియు allergy చరిత్ర",
    familyHistory: "కుటుంబ చరిత్ర",
    personalHistory: "వ్యక్తిగత చరిత్ర",
    ros: "సిస్టమ్ సమీక్ష",
    investigations: "మునుపటి పరీక్షల సారాంశం",

    notDocumented: "నమోదు కాలేదు",

    disclaimer:
      "ఇది documentation draft మాత్రమే. ఇది స్వయంచాలక diagnosis లేదా treatment recommendation ఇవ్వదు. అర్హత కలిగిన డాక్టర్ తనిఖీ చేయాలి.",

    footer:
      "Demo mode • Autonomous diagnosis లేదు • సమాచారం డాక్టర్ review కోసం draft.",

    cannotConnect:
      "MediIntake AI backend కు connection కాలేదు. FastAPI port 8000 లో నడుస్తుందో చూడండి.",
  },

  kn: {
    appName: "MediIntake AI",
    subtitle: "AI ಆಧಾರಿತ ಕ್ಲಿನಿಕಲ್ ಹಿಸ್ಟರಿ ವ್ಯವಸ್ಥೆ",
    steps: ["ಸ್ವಾಗತ", "ಇತಿಹಾಸ", "ದಾಖಲೆಗಳು", "ಪರಿಶೀಲನೆ", "ವೈದ್ಯರ ವೀಕ್ಷಣೆ"],

    patientIntake: "ರೋಗಿಯ ಮಾಹಿತಿ",
    welcomeTitle: "ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ತಿಳಿಸಿ.",
    welcomeText:
      "MediIntake AI ಸರಳ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುತ್ತದೆ, ಹಳೆಯ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಓದುತ್ತದೆ ಮತ್ತು ವೈದ್ಯರಿಗಾಗಿ structured draft ತಯಾರಿಸುತ್ತದೆ.",

    newPatient: "ಹೊಸ ರೋಗಿ",
    newPatientText: "ಹೊಸ ಮಾಹಿತಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ",
    existingPatient: "ಈಗಿರುವ ರೋಗಿ",
    existingPatientText: "ರೋಗಿ ID ಮೂಲಕ ಮುಂದುವರಿಸಿ",
    patientSessionId: "ರೋಗಿ / session ID",

    consentTitle: "ಸಮ್ಮತಿ ಮತ್ತು ಗೌಪ್ಯತೆ",
    consentText:
      "ನನ್ನ ಉತ್ತರಗಳು ಮತ್ತು upload ಮಾಡಿದ ದಾಖಲೆಗಳನ್ನು ಆರೋಗ್ಯ ತಜ್ಞರ review ಗಾಗಿ clinical summary ತಯಾರಿಸಲು ಬಳಸಲಾಗುತ್ತದೆ ಎಂದು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.",

    startIntake: "ಪ್ರಾರಂಭಿಸಿ",
    starting: "ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ...",

    safeHandoff: "ಸುರಕ್ಷಿತ clinical handoff ಗಾಗಿ",

    feature1: "ಸಂಭಾಷಣೆಯ ಮೂಲಕ ಇತಿಹಾಸ",
    feature1Text: "SOCRATES ಪ್ರಶ್ನೆಗಳು, quick replies ಮತ್ತು voice input.",
    feature2: "ಹಳೆಯ ದಾಖಲೆಗಳು",
    feature2Text: "OCR ಮುಖ್ಯ ಮಾಹಿತಿಯನ್ನು editable fields ಆಗಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.",
    feature3: "ವೈದ್ಯರಿಗಾಗಿ draft",
    feature3Text: "ವೈದ್ಯರ review ಗಾಗಿ structured summary.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR ಮತ್ತು emergency red-flag logic integration modules ಆಗಿ configured ಮಾಡಲಾಗಿದೆ.",

    history: "ಕ್ಲಿನಿಕಲ್ ಹಿಸ್ಟರಿ",
    documents: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",
    review: "ಪರಿಶೀಲನೆ",
    doctorView: "ವೈದ್ಯರ ವೀಕ್ಷಣೆ",

    intakeWarning:
      "ಇದು intake assistant, diagnostic system ಅಲ್ಲ. ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ನಿಮ್ಮ ಮಾತಿನಲ್ಲಿ ತಿಳಿಸಿ.",

    speak: "ಮಾತನಾಡಿ",
    listening: "ಕೇಳಲಾಗುತ್ತಿದೆ...",
    typeAnswer: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಬರೆಯಿರಿ...",
    send: "ಕಳುಹಿಸಿ",

    continueDocuments: "ದಾಖಲೆಗಳಿಗೆ ಹೋಗಿ",

    uploadTitle: "ನಿಮ್ಮ ಬಳಿ ಹಳೆಯ prescription ಅಥವಾ report ಇದೆಯೇ?",
    uploadText: "ಸ್ಪಷ್ಟವಾದ image ಅಥವಾ PDF upload ಮಾಡಿ. ಈ ಹಂತವನ್ನು skip ಮಾಡಬಹುದು.",

    extracting: "ಮಾಹಿತಿ ತೆಗೆದುಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
    uploadDocument: "Prescription / report upload ಮಾಡಲು tap ಮಾಡಿ",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR ಪೂರ್ಣ",

    skip: "ಈಗ skip ಮಾಡಿ",
    reviewExtracted: "ತೆಗೆದ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ",

    editable: "ಸಂಪಾದಿಸಬಹುದು",

    diagnosis: "Diagnosis / Impression",
    documentDate: "ದಾಖಲೆ ದಿನಾಂಕ",

    medicines: "ಔಷಧಿಗಳು",
    medicine: "ಔಷಧಿ",
    dosage: "ಮಾತ್ರೆ",

    laboratory: "ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆಗಳು",
    labTest: "ಪರೀಕ್ಷೆ",
    value: "ಮೌಲ್ಯ",
    referenceRange: "ಉಲ್ಲೇಖ ಮಿತಿ",

    noLabs: "ಯಾವುದೇ laboratory test ಸಿಗಲಿಲ್ಲ.",
    noDocuments: "ಯಾವುದೇ ದಾಖಲೆ upload ಮಾಡಲಾಗಿಲ್ಲ.",

    generateSummary: "Draft summary ರಚಿಸಿ",
    generating: "Summary ರಚಿಸಲಾಗುತ್ತಿದೆ...",

    structuredSummary:
      "ರೋಗಿಯ ಇತಿಹಾಸ ಮತ್ತು upload ಮಾಡಿದ ದಾಖಲೆಗಳ ಆಧಾರದ ಮೇಲೆ structured summary.",

    draft: "DRAFT • ವೈದ್ಯರ review ಅಗತ್ಯ",
    final: "FINAL • ವೈದ್ಯರು ದೃಢಪಡಿಸಿದ್ದಾರೆ",

    patientView: "ರೋಗಿಯ ವೀಕ್ಷಣೆ",
    staffDoctor: "ಸ್ಟಾಫ್ / ವೈದ್ಯರು",

    edit: "ಸಂಪಾದಿಸಿ",
    done: "ಪೂರ್ಣ",
    print: "Print",
    editSummary: "Summary ಸಂಪಾದಿಸಿ",

    patientReadonly: "ರೋಗಿಯ ವೀಕ್ಷಣೆ read-only",

    confirmDraft: "Draft ದೃಢಪಡಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    clinicianConfirmed: "ವೈದ್ಯರು ದೃಢಪಡಿಸಿದ್ದಾರೆ",

    chiefComplaint: "ಮುಖ್ಯ ದೂರು",
    hpi: "ಪ್ರಸ್ತುತ ಅನಾರೋಗ್ಯದ ಇತಿಹಾಸ",
    pastHistory: "ಹಿಂದಿನ ವೈದ್ಯಕೀಯ / ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಇತಿಹಾಸ",
    drugHistory: "ಔಷಧಿ ಮತ್ತು allergy ಇತಿಹಾಸ",
    familyHistory: "ಕುಟುಂಬದ ಇತಿಹಾಸ",
    personalHistory: "ವೈಯಕ್ತಿಕ ಇತಿಹಾಸ",
    ros: "ವ್ಯವಸ್ಥೆಯ ಪರಿಶೀಲನೆ",
    investigations: "ಹಿಂದಿನ ಪರೀಕ್ಷೆಗಳ ಸಾರಾಂಶ",

    notDocumented: "ದಾಖಲಾಗಿಲ್ಲ",

    disclaimer:
      "ಇದು documentation draft ಮಾತ್ರ. ಇದು ಸ್ವಯಂಚಾಲಿತ diagnosis ಅಥವಾ treatment recommendation ನೀಡುವುದಿಲ್ಲ. ಅರ್ಹ ವೈದ್ಯರು ಪರಿಶೀಲಿಸಬೇಕು.",

    footer:
      "Demo mode • Autonomous diagnosis ಇಲ್ಲ • ಮಾಹಿತಿ ವೈದ್ಯರ review ಗಾಗಿ draft.",

    cannotConnect:
      "MediIntake AI backend ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. FastAPI port 8000 ನಲ್ಲಿ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಪರಿಶೀಲಿಸಿ.",
  },

  ml: {
    appName: "MediIntake AI",
    subtitle: "AI അടിസ്ഥാനമാക്കിയ ക്ലിനിക്കൽ ഹിസ്റ്ററി സംവിധാനം",
    steps: ["സ്വാഗതം", "ചരിത്രം", "രേഖകൾ", "അവലോകനം", "ഡോക്ടർ വ്യൂ"],

    patientIntake: "രോഗിയുടെ വിവരങ്ങൾ",
    welcomeTitle: "ഡോക്ടറെ കാണുന്നതിന് മുമ്പ് നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് പറയുക.",
    welcomeText:
      "MediIntake AI ലളിതമായ ചോദ്യങ്ങൾ ചോദിക്കുകയും പഴയ മെഡിക്കൽ റിപ്പോർട്ടുകൾ വായിക്കുകയും ഡോക്ടർക്കായി structured draft തയ്യാറാക്കുകയും ചെയ്യുന്നു.",

    newPatient: "പുതിയ രോഗി",
    newPatientText: "പുതിയ വിവരങ്ങൾ ആരംഭിക്കുക",
    existingPatient: "നിലവിലുള്ള രോഗി",
    existingPatientText: "രോഗി ID ഉപയോഗിച്ച് തുടരുക",
    patientSessionId: "രോഗി / session ID",

    consentTitle: "സമ്മതവും സ്വകാര്യതയും",
    consentText:
      "എന്റെ ഉത്തരങ്ങളും upload ചെയ്ത രേഖകളും ആരോഗ്യ വിദഗ്ധന്റെ review നായി clinical summary തയ്യാറാക്കാൻ ഉപയോഗിക്കുമെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു.",

    startIntake: "ആരംഭിക്കുക",
    starting: "ആരംഭിക്കുന്നു...",

    safeHandoff: "സുരക്ഷിത clinical handoff നായി",

    feature1: "സംഭാഷണത്തിലൂടെ ചരിത്രം",
    feature1Text: "SOCRATES ചോദ്യങ്ങൾ, quick replies, voice input.",
    feature2: "പഴയ രേഖകൾ",
    feature2Text: "OCR പ്രധാന വിവരങ്ങൾ editable fields ആയി എടുക്കുന്നു.",
    feature3: "ഡോക്ടർക്കുള്ള draft",
    feature3Text: "ഡോക്ടറുടെ review നായി structured summary.",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR, emergency red-flag logic എന്നിവ integration modules ആയി configured ചെയ്തിട്ടുണ്ട്.",

    history: "ക്ലിനിക്കൽ ഹിസ്റ്ററി",
    documents: "മെഡിക്കൽ രേഖകൾ",
    review: "അവലോകനം",
    doctorView: "ഡോക്ടർ വ്യൂ",

    intakeWarning:
      "ഇത് intake assistant ആണ്, diagnostic system അല്ല. നിങ്ങളുടെ ലക്ഷണങ്ങൾ നിങ്ങളുടെ വാക്കുകളിൽ പറയുക.",

    speak: "സംസാരിക്കുക",
    listening: "കേൾക്കുന്നു...",
    typeAnswer: "നിങ്ങളുടെ ഉത്തരം എഴുതുക...",
    send: "അയയ്ക്കുക",

    continueDocuments: "രേഖകളിലേക്ക് പോകുക",

    uploadTitle: "നിങ്ങളുടെ പക്കൽ പഴയ prescription അല്ലെങ്കിൽ report ഉണ്ടോ?",
    uploadText: "വ്യക്തമായ image അല്ലെങ്കിൽ PDF upload ചെയ്യുക. ഈ ഘട്ടം skip ചെയ്യാം.",

    extracting: "വിവരങ്ങൾ എടുക്കുന്നു...",
    uploadDocument: "Prescription / report upload ചെയ്യാൻ tap ചെയ്യുക",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR പൂർത്തിയായി",

    skip: "ഇപ്പോൾ skip ചെയ്യുക",
    reviewExtracted: "എടുത്ത വിവരങ്ങൾ പരിശോധിക്കുക",

    editable: "തിരുത്താം",

    diagnosis: "Diagnosis / Impression",
    documentDate: "രേഖയുടെ തീയതി",

    medicines: "മരുന്നുകൾ",
    medicine: "മരുന്ന്",
    dosage: "ഡോസ്",

    laboratory: "ലബോറട്ടറി പരിശോധനകൾ",
    labTest: "പരിശോധന",
    value: "മൂല്യം",
    referenceRange: "റഫറൻസ് പരിധി",

    noLabs: "Laboratory test ഒന്നും ലഭിച്ചില്ല.",
    noDocuments: "രേഖകൾ upload ചെയ്തിട്ടില്ല.",

    generateSummary: "Draft summary തയ്യാറാക്കുക",
    generating: "Summary തയ്യാറാക്കുന്നു...",

    structuredSummary:
      "രോഗിയുടെ ചരിത്രവും upload ചെയ്ത രേഖകളും അടിസ്ഥാനമാക്കിയുള്ള structured summary.",

    draft: "DRAFT • ഡോക്ടറുടെ review ആവശ്യമാണ്",
    final: "FINAL • ഡോക്ടർ സ്ഥിരീകരിച്ചു",

    patientView: "രോഗി വ്യൂ",
    staffDoctor: "സ്റ്റാഫ് / ഡോക്ടർ",

    edit: "തിരുത്തുക",
    done: "പൂർത്തിയായി",
    print: "Print",
    editSummary: "Summary തിരുത്തുക",

    patientReadonly: "രോഗി വ്യൂ read-only ആണ്",

    confirmDraft: "Draft സ്ഥിരീകരിക്കുക",
    saving: "സേവ് ചെയ്യുന്നു...",
    clinicianConfirmed: "ഡോക്ടർ സ്ഥിരീകരിച്ചു",

    chiefComplaint: "പ്രധാന പരാതി",
    hpi: "നിലവിലെ രോഗചരിത്രം",
    pastHistory: "മുൻ മെഡിക്കൽ / ശസ്ത്രക്രിയ ചരിത്രം",
    drugHistory: "മരുന്നുകളും allergy ചരിത്രവും",
    familyHistory: "കുടുംബ ചരിത്രം",
    personalHistory: "വ്യക്തിഗത ചരിത്രം",
    ros: "സിസ്റ്റം അവലോകനം",
    investigations: "മുൻ പരിശോധനകളുടെ സംഗ്രഹം",

    notDocumented: "രേഖപ്പെടുത്തിയിട്ടില്ല",

    disclaimer:
      "ഇത് documentation draft മാത്രമാണ്. ഇത് സ്വയം diagnosis അല്ലെങ്കിൽ treatment recommendation നൽകുന്നില്ല. യോഗ്യനായ ഡോക്ടർ പരിശോധിക്കണം.",

    footer:
      "Demo mode • Autonomous diagnosis ഇല്ല • വിവരങ്ങൾ ഡോക്ടറുടെ review നുള്ള draft ആണ്.",

    cannotConnect:
      "MediIntake AI backend-ലേക്ക് connection സാധ്യമല്ല. FastAPI port 8000 ൽ പ്രവർത്തിക്കുന്നുണ്ടോ പരിശോധിക്കുക.",
  },

  pa: {
    appName: "MediIntake AI",
    subtitle: "AI ਅਧਾਰਿਤ ਕਲੀਨਿਕਲ ਹਿਸਟਰੀ ਸਿਸਟਮ",
    steps: ["ਜੀ ਆਇਆਂ ਨੂੰ", "ਇਤਿਹਾਸ", "ਦਸਤਾਵੇਜ਼", "ਸਮੀਖਿਆ", "ਡਾਕਟਰ ਵਿਊ"],

    patientIntake: "ਮਰੀਜ਼ ਦੀ ਜਾਣਕਾਰੀ",
    welcomeTitle: "ਡਾਕਟਰ ਨੂੰ ਮਿਲਣ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੀ ਸਿਹਤ ਬਾਰੇ ਦੱਸੋ।",
    welcomeText:
      "MediIntake AI ਸਧਾਰਨ ਸਵਾਲ ਪੁੱਛਦਾ ਹੈ, ਪੁਰਾਣੀਆਂ ਮੈਡੀਕਲ ਰਿਪੋਰਟਾਂ ਪੜ੍ਹਦਾ ਹੈ ਅਤੇ ਡਾਕਟਰ ਲਈ structured draft ਤਿਆਰ ਕਰਦਾ ਹੈ।",

    newPatient: "ਨਵਾਂ ਮਰੀਜ਼",
    newPatientText: "ਨਵੀਂ ਜਾਣਕਾਰੀ ਸ਼ੁਰੂ ਕਰੋ",
    existingPatient: "ਮੌਜੂਦਾ ਮਰੀਜ਼",
    existingPatientText: "ਮਰੀਜ਼ ID ਨਾਲ ਜਾਰੀ ਰੱਖੋ",
    patientSessionId: "ਮਰੀਜ਼ / session ID",

    consentTitle: "ਸਹਿਮਤੀ ਅਤੇ ਗੋਪਨੀਯਤਾ",
    consentText:
      "ਮੈਂ ਸਮਝਦਾ/ਸਮਝਦੀ ਹਾਂ ਕਿ ਮੇਰੇ ਜਵਾਬ ਅਤੇ upload ਕੀਤੇ ਦਸਤਾਵੇਜ਼ ਸਿਹਤ ਮਾਹਰ ਦੁਆਰਾ review ਲਈ clinical summary ਬਣਾਉਣ ਵਿੱਚ ਵਰਤੇ ਜਾਣਗੇ।",

    startIntake: "ਸ਼ੁਰੂ ਕਰੋ",
    starting: "ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ...",

    safeHandoff: "ਸੁਰੱਖਿਅਤ clinical handoff ਲਈ",

    feature1: "ਗੱਲਬਾਤ ਰਾਹੀਂ ਇਤਿਹਾਸ",
    feature1Text: "SOCRATES ਸਵਾਲ, quick replies ਅਤੇ voice input।",
    feature2: "ਪੁਰਾਣੇ ਦਸਤਾਵੇਜ਼",
    feature2Text: "OCR ਮਹੱਤਵਪੂਰਨ ਜਾਣਕਾਰੀ editable fields ਵਿੱਚ ਕੱਢਦਾ ਹੈ।",
    feature3: "ਡਾਕਟਰ ਲਈ draft",
    feature3Text: "ਡਾਕਟਰ ਦੇ review ਲਈ structured summary।",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR ਅਤੇ emergency red-flag logic integration modules ਵਜੋਂ configured ਹਨ।",

    history: "ਕਲੀਨਿਕਲ ਇਤਿਹਾਸ",
    documents: "ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼",
    review: "ਸਮੀਖਿਆ",
    doctorView: "ਡਾਕਟਰ ਵਿਊ",

    intakeWarning:
      "ਇਹ intake assistant ਹੈ, diagnostic system ਨਹੀਂ। ਆਪਣੇ ਲੱਛਣ ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਦੱਸੋ।",

    speak: "ਬੋਲੋ",
    listening: "ਸੁਣਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    typeAnswer: "ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ...",
    send: "ਭੇਜੋ",

    continueDocuments: "ਦਸਤਾਵੇਜ਼ਾਂ ਤੇ ਜਾਓ",

    uploadTitle: "ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਪੁਰਾਣਾ prescription ਜਾਂ report ਹੈ?",
    uploadText: "ਸਾਫ image ਜਾਂ PDF upload ਕਰੋ। ਤੁਸੀਂ ਇਹ step skip ਕਰ ਸਕਦੇ ਹੋ।",

    extracting: "ਜਾਣਕਾਰੀ ਕੱਢੀ ਜਾ ਰਹੀ ਹੈ...",
    uploadDocument: "Prescription / report upload ਕਰਨ ਲਈ tap ਕਰੋ",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR ਪੂਰਾ",

    skip: "ਹੁਣੇ skip ਕਰੋ",
    reviewExtracted: "ਕੱਢੀ ਜਾਣਕਾਰੀ ਵੇਖੋ",

    editable: "ਸੋਧਿਆ ਜਾ ਸਕਦਾ ਹੈ",

    diagnosis: "Diagnosis / Impression",
    documentDate: "ਦਸਤਾਵੇਜ਼ ਦੀ ਮਿਤੀ",

    medicines: "ਦਵਾਈਆਂ",
    medicine: "ਦਵਾਈ",
    dosage: "ਖੁਰਾਕ",

    laboratory: "ਲੈਬੋਰਟਰੀ ਜਾਂਚ",
    labTest: "ਜਾਂਚ",
    value: "ਮੁੱਲ",
    referenceRange: "ਸੰਦਰਭ ਸੀਮਾ",

    noLabs: "ਕੋਈ laboratory test ਨਹੀਂ ਮਿਲਿਆ।",
    noDocuments: "ਕੋਈ ਦਸਤਾਵੇਜ਼ upload ਨਹੀਂ ਕੀਤਾ ਗਿਆ।",

    generateSummary: "Draft summary ਬਣਾਓ",
    generating: "Summary ਬਣਾਈ ਜਾ ਰਹੀ ਹੈ...",

    structuredSummary:
      "ਮਰੀਜ਼ ਦੇ ਇਤਿਹਾਸ ਅਤੇ upload ਕੀਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਤੋਂ ਤਿਆਰ structured summary।",

    draft: "DRAFT • ਡਾਕਟਰ ਦੀ ਸਮੀਖਿਆ ਜ਼ਰੂਰੀ",
    final: "FINAL • ਡਾਕਟਰ ਨੇ ਪੁਸ਼ਟੀ ਕੀਤੀ",

    patientView: "ਮਰੀਜ਼ ਵਿਊ",
    staffDoctor: "ਸਟਾਫ / ਡਾਕਟਰ",

    edit: "ਸੋਧੋ",
    done: "ਪੂਰਾ",
    print: "Print",
    editSummary: "Summary ਸੋਧੋ",

    patientReadonly: "ਮਰੀਜ਼ ਵਿਊ read-only ਹੈ",

    confirmDraft: "Draft ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    saving: "ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ...",
    clinicianConfirmed: "ਡਾਕਟਰ ਨੇ ਪੁਸ਼ਟੀ ਕੀਤੀ",

    chiefComplaint: "ਮੁੱਖ ਸ਼ਿਕਾਇਤ",
    hpi: "ਮੌਜੂਦਾ ਬਿਮਾਰੀ ਦਾ ਇਤਿਹਾਸ",
    pastHistory: "ਪਿਛਲਾ ਮੈਡੀਕਲ / ਸਰਜੀਕਲ ਇਤਿਹਾਸ",
    drugHistory: "ਦਵਾਈ ਅਤੇ ਐਲਰਜੀ ਇਤਿਹਾਸ",
    familyHistory: "ਪਰਿਵਾਰਕ ਇਤਿਹਾਸ",
    personalHistory: "ਨਿੱਜੀ ਇਤਿਹਾਸ",
    ros: "ਸਿਸਟਮ ਸਮੀਖਿਆ",
    investigations: "ਪਿਛਲੀਆਂ ਜਾਂਚਾਂ ਦਾ ਸਾਰ",

    notDocumented: "ਦਰਜ ਨਹੀਂ",

    disclaimer:
      "ਇਹ ਸਿਰਫ documentation draft ਹੈ। ਇਹ ਆਪਣੇ ਆਪ diagnosis ਜਾਂ treatment recommendation ਨਹੀਂ ਦਿੰਦਾ। ਯੋਗ ਡਾਕਟਰ ਨੂੰ ਇਸਦੀ ਜਾਂਚ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ।",

    footer:
      "Demo mode • Autonomous diagnosis ਨਹੀਂ • ਜਾਣਕਾਰੀ ਡਾਕਟਰ ਦੇ review ਲਈ draft ਹੈ।",

    cannotConnect:
      "MediIntake AI backend ਨਾਲ connection ਨਹੀਂ ਹੋ ਰਿਹਾ। FastAPI port 8000 ਤੇ ਚੱਲ ਰਿਹਾ ਹੈ ਜਾਂ ਨਹੀਂ ਜਾਂਚੋ।",
  },

  or: {
    appName: "MediIntake AI",
    subtitle: "AI ଆଧାରିତ କ୍ଲିନିକାଲ ହିଷ୍ଟ୍ରି ସିଷ୍ଟମ",
    steps: ["ସ୍ୱାଗତ", "ଇତିହାସ", "ଦଲିଲ", "ସମୀକ୍ଷା", "ଡାକ୍ତର ଭ୍ୟୁ"],

    patientIntake: "ରୋଗୀ ସୂଚନା",
    welcomeTitle: "ଡାକ୍ତରଙ୍କୁ ଦେଖିବା ପୂର୍ବରୁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ କୁହନ୍ତୁ।",
    welcomeText:
      "MediIntake AI ସରଳ ପ୍ରଶ୍ନ ପଚାରେ, ପୁରୁଣା ମେଡିକାଲ ରିପୋର୍ଟ ପଢ଼େ ଏବଂ ଡାକ୍ତରଙ୍କ ପାଇଁ structured draft ପ୍ରସ୍ତୁତ କରେ।",

    newPatient: "ନୂଆ ରୋଗୀ",
    newPatientText: "ନୂଆ ସୂଚନା ଆରମ୍ଭ କରନ୍ତୁ",
    existingPatient: "ବର୍ତ୍ତମାନ ରୋଗୀ",
    existingPatientText: "ରୋଗୀ ID ଦ୍ୱାରା ଜାରି ରଖନ୍ତୁ",
    patientSessionId: "ରୋଗୀ / session ID",

    consentTitle: "ସମ୍ମତି ଏବଂ ଗୋପନୀୟତା",
    consentText:
      "ମୋର ଉତ୍ତର ଏବଂ upload କରାଯାଇଥିବା ଦଲିଲଗୁଡ଼ିକ ସ୍ୱାସ୍ଥ୍ୟ ବିଶେଷଜ୍ଞଙ୍କ review ପାଇଁ clinical summary ପ୍ରସ୍ତୁତ କରିବାରେ ବ୍ୟବହାର ହେବ ବୋଲି ମୁଁ ବୁଝିଛି।",

    startIntake: "ଆରମ୍ଭ କରନ୍ତୁ",
    starting: "ଆରମ୍ଭ ହେଉଛି...",

    safeHandoff: "ସୁରକ୍ଷିତ clinical handoff ପାଇଁ",

    feature1: "କଥାବାର୍ତ୍ତା ମାଧ୍ୟମରେ ଇତିହାସ",
    feature1Text: "SOCRATES ପ୍ରଶ୍ନ, quick replies ଏବଂ voice input।",
    feature2: "ପୁରୁଣା ଦଲିଲ",
    feature2Text: "OCR ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସୂଚନାକୁ editable fields ରେ ବାହାର କରେ।",
    feature3: "ଡାକ୍ତରଙ୍କ ପାଇଁ draft",
    feature3Text: "ଡାକ୍ତରଙ୍କ review ପାଇଁ structured summary।",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR ଏବଂ emergency red-flag logic integration modules ଭାବେ configured ଅଛି।",

    history: "କ୍ଲିନିକାଲ ଇତିହାସ",
    documents: "ଚିକିତ୍ସା ଦଲିଲ",
    review: "ସମୀକ୍ଷା",
    doctorView: "ଡାକ୍ତର ଭ୍ୟୁ",

    intakeWarning:
      "ଏହା intake assistant, diagnostic system ନୁହେଁ। ଆପଣଙ୍କ ଲକ୍ଷଣକୁ ନିଜ ଭାଷାରେ କୁହନ୍ତୁ।",

    speak: "କୁହନ୍ତୁ",
    listening: "ଶୁଣାଯାଉଛି...",
    typeAnswer: "ଆପଣଙ୍କ ଉତ୍ତର ଲେଖନ୍ତୁ...",
    send: "ପଠାନ୍ତୁ",

    continueDocuments: "ଦଲିଲକୁ ଯାଆନ୍ତୁ",

    uploadTitle: "ଆପଣଙ୍କ ପାଖରେ ପୁରୁଣା prescription କିମ୍ବା report ଅଛି କି?",
    uploadText: "ସ୍ପଷ୍ଟ image କିମ୍ବା PDF upload କରନ୍ତୁ। ଏହି ପଦକ୍ଷେପ skip କରିପାରିବେ।",

    extracting: "ସୂଚନା ବାହାର କରାଯାଉଛି...",
    uploadDocument: "Prescription / report upload ପାଇଁ tap କରନ୍ତୁ",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR ସମ୍ପୂର୍ଣ୍ଣ",

    skip: "ବର୍ତ୍ତମାନ skip କରନ୍ତୁ",
    reviewExtracted: "ବାହାର କରାଯାଇଥିବା ସୂଚନା ଦେଖନ୍ତୁ",

    editable: "ସମ୍ପାଦନାଯୋଗ୍ୟ",

    diagnosis: "Diagnosis / Impression",
    documentDate: "ଦଲିଲ ତାରିଖ",

    medicines: "ଔଷଧ",
    medicine: "ଔଷଧ",
    dosage: "ମାତ୍ରା",

    laboratory: "ଲାବୋରେଟୋରୀ ପରୀକ୍ଷା",
    labTest: "ପରୀକ୍ଷା",
    value: "ମୂଲ୍ୟ",
    referenceRange: "ସନ୍ଦର୍ଭ ସୀମା",

    noLabs: "କୌଣସି laboratory test ମିଳିଲା ନାହିଁ।",
    noDocuments: "କୌଣସି ଦଲିଲ upload କରାଯାଇନାହିଁ।",

    generateSummary: "Draft summary ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    generating: "Summary ପ୍ରସ୍ତୁତ ହେଉଛି...",

    structuredSummary:
      "ରୋଗୀର ଇତିହାସ ଏବଂ upload କରାଯାଇଥିବା ଦଲିଲ ଆଧାରରେ structured summary।",

    draft: "DRAFT • ଡାକ୍ତରଙ୍କ review ଆବଶ୍ୟକ",
    final: "FINAL • ଡାକ୍ତର ନିଶ୍ଚିତ କରିଛନ୍ତି",

    patientView: "ରୋଗୀ ଭ୍ୟୁ",
    staffDoctor: "ଷ୍ଟାଫ / ଡାକ୍ତର",

    edit: "ସମ୍ପାଦନା",
    done: "ସମାପ୍ତ",
    print: "Print",
    editSummary: "Summary ସମ୍ପାଦନା କରନ୍ତୁ",

    patientReadonly: "ରୋଗୀ ଭ୍ୟୁ read-only",

    confirmDraft: "Draft ନିଶ୍ଚିତ କରନ୍ତୁ",
    saving: "ସଞ୍ଚୟ ହେଉଛି...",
    clinicianConfirmed: "ଡାକ୍ତର ନିଶ୍ଚିତ କରିଛନ୍ତି",

    chiefComplaint: "ମୁଖ୍ୟ ଅଭିଯୋଗ",
    hpi: "ବର୍ତ୍ତମାନ ରୋଗର ଇତିହାସ",
    pastHistory: "ପୂର୍ବ ଚିକିତ୍ସା / ଅପରେସନ ଇତିହାସ",
    drugHistory: "ଔଷଧ ଏବଂ ଆଲର୍ଜି ଇତିହାସ",
    familyHistory: "ପାରିବାରିକ ଇତିହାସ",
    personalHistory: "ବ୍ୟକ୍ତିଗତ ଇତିହାସ",
    ros: "ସିଷ୍ଟମ ସମୀକ୍ଷା",
    investigations: "ପୂର୍ବ ପରୀକ୍ଷାର ସାରାଂଶ",

    notDocumented: "ଦଲିଲଭୁକ୍ତ ହୋଇନାହିଁ",

    disclaimer:
      "ଏହା କେବଳ documentation draft। ଏହା ସ୍ୱୟଂଚାଳିତ diagnosis କିମ୍ବା treatment recommendation ଦିଏ ନାହିଁ। ଯୋଗ୍ୟ ଡାକ୍ତର ଏହାକୁ ଯାଞ୍ଚ କରିବା ଉଚିତ।",

    footer:
      "Demo mode • Autonomous diagnosis ନାହିଁ • ସୂଚନା ଡାକ୍ତର review ପାଇଁ draft।",

    cannotConnect:
      "MediIntake AI backend ସହ connection ହେଉନାହିଁ। FastAPI port 8000 ରେ ଚାଲୁଛି କି ଯାଞ୍ଚ କରନ୍ତୁ।",
  },

  as: {
    appName: "MediIntake AI",
    subtitle: "AI আধাৰিত ক্লিনিকেল ইতিহাস সংগ্ৰহ ব্যৱস্থা",
    steps: ["স্বাগতম", "ইতিহাস", "নথি", "পৰ্যালোচনা", "ডাক্তৰৰ ভিউ"],

    patientIntake: "ৰোগীৰ তথ্য",
    welcomeTitle: "ডাক্তৰক লগ পোৱাৰ আগতে আপোনাৰ স্বাস্থ্যৰ বিষয়ে কওক।",
    welcomeText:
      "MediIntake AI সহজ প্ৰশ্ন সোধে, পুৰণি চিকিৎসা নথি পঢ়ে আৰু ডাক্তৰৰ বাবে structured draft প্ৰস্তুত কৰে।",

    newPatient: "নতুন ৰোগী",
    newPatientText: "নতুন তথ্য আৰম্ভ কৰক",
    existingPatient: "বৰ্তমানৰ ৰোগী",
    existingPatientText: "ৰোগী ID ৰে আগবাঢ়ক",
    patientSessionId: "ৰোগী / session ID",

    consentTitle: "সন্মতি আৰু গোপনীয়তা",
    consentText:
      "মোৰ উত্তৰ আৰু upload কৰা নথি স্বাস্থ্য বিশেষজ্ঞৰ review ৰ বাবে clinical summary প্ৰস্তুত কৰিবলৈ ব্যৱহাৰ কৰা হ'ব বুলি মই বুজিছোঁ।",

    startIntake: "আৰম্ভ কৰক",
    starting: "আৰম্ভ হৈ আছে...",

    safeHandoff: "সুৰক্ষিত clinical handoff ৰ বাবে",

    feature1: "কথোপকথনৰ জৰিয়তে ইতিহাস",
    feature1Text: "SOCRATES প্ৰশ্ন, quick replies আৰু voice input।",
    feature2: "পুৰণি নথি",
    feature2Text: "OCR এ গুৰুত্বপূৰ্ণ তথ্য editable fields লৈ উলিয়াই আনে।",
    feature3: "ডাক্তৰৰ বাবে draft",
    feature3Text: "ডাক্তৰৰ review ৰ বাবে structured summary।",

    placeholder:
      "ABHA / ABDM integration, authentication, multilingual ASR আৰু emergency red-flag logic integration modules হিচাপে configured কৰা হৈছে।",

    history: "ক্লিনিকেল ইতিহাস",
    documents: "চিকিৎসা নথি",
    review: "পৰ্যালোচনা",
    doctorView: "ডাক্তৰৰ ভিউ",

    intakeWarning:
      "এইটো intake assistant, diagnostic system নহয়। আপোনাৰ লক্ষণ আপোনাৰ নিজৰ ভাষাত কওক।",

    speak: "কওক",
    listening: "শুনা হৈছে...",
    typeAnswer: "আপোনাৰ উত্তৰ লিখক...",
    send: "পঠিয়াওক",

    continueDocuments: "নথিলৈ যাওক",

    uploadTitle: "আপোনাৰ পুৰণি prescription বা report আছে নেকি?",
    uploadText: "স্পষ্ট image বা PDF upload কৰক। এই ধাপটো skip কৰিব পাৰে।",

    extracting: "তথ্য উলিওৱা হৈছে...",
    uploadDocument: "Prescription / report upload কৰিবলৈ tap কৰক",
    pdfJpgPng: "PDF, JPG, PNG",

    ocrComplete: "OCR সম্পূৰ্ণ",

    skip: "এতিয়া skip কৰক",
    reviewExtracted: "উলিওৱা তথ্য চাওক",

    editable: "সম্পাদনা কৰিব পাৰি",

    diagnosis: "Diagnosis / Impression",
    documentDate: "নথিৰ তাৰিখ",

    medicines: "ঔষধ",
    medicine: "ঔষধ",
    dosage: "মাত্ৰা",

    laboratory: "লেবৰেটৰী পৰীক্ষা",
    labTest: "পৰীক্ষা",
    value: "মান",
    referenceRange: "Reference range",

    noLabs: "কোনো laboratory test পোৱা নগ'ল।",
    noDocuments: "কোনো নথি upload কৰা হোৱা নাই।",

    generateSummary: "Draft summary প্ৰস্তুত কৰক",
    generating: "Summary প্ৰস্তুত হৈ আছে...",

    structuredSummary:
      "ৰোগীৰ ইতিহাস আৰু upload কৰা নথিৰ ভিত্তিত structured summary।",

    draft: "DRAFT • ডাক্তৰৰ review প্ৰয়োজন",
    final: "FINAL • ডাক্তৰে নিশ্চিত কৰিছে",

    patientView: "ৰোগীৰ ভিউ",
    staffDoctor: "ষ্টাফ / ডাক্তৰ",

    edit: "সম্পাদনা",
    done: "সম্পূৰ্ণ",
    print: "Print",
    editSummary: "Summary সম্পাদনা কৰক",

    patientReadonly: "ৰোগীৰ ভিউ read-only",

    confirmDraft: "Draft নিশ্চিত কৰক",
    saving: "সংৰক্ষণ কৰা হৈছে...",
    clinicianConfirmed: "ডাক্তৰে নিশ্চিত কৰিছে",

    chiefComplaint: "মুখ্য অভিযোগ",
    hpi: "বৰ্তমান ৰোগৰ ইতিহাস",
    pastHistory: "পূৰ্বৰ চিকিৎসা / অস্ত্ৰোপচাৰৰ ইতিহাস",
    drugHistory: "ঔষধ আৰু এলাৰ্জীৰ ইতিহাস",
    familyHistory: "পৰিয়ালৰ ইতিহাস",
    personalHistory: "ব্যক্তিগত ইতিহাস",
    ros: "চিষ্টেম পৰ্যালোচনা",
    investigations: "পূৰ্বৰ পৰীক্ষাৰ সাৰাংশ",

    notDocumented: "নথিভুক্ত কৰা হোৱা নাই",

    disclaimer:
      "এইটো কেৱল documentation draft। ই স্বয়ংক্ৰিয় diagnosis বা treatment recommendation নিদিয়ে। যোগ্য ডাক্তৰে পৰীক্ষা কৰিব লাগে।",

    footer:
      "Demo mode • Autonomous diagnosis নাই • তথ্য ডাক্তৰৰ review ৰ বাবে draft।",

    cannotConnect:
      "MediIntake AI backend ৰ সৈতে connection হোৱা নাই। FastAPI port 8000 ত চলি আছে নেকি পৰীক্ষা কৰক।",
  },
};

// =========================================================
// TRANSLATION HELPERS
// =========================================================

function getTranslation(language) {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

const SUMMARY_LABELS = {
  "Chief Complaint": "chiefComplaint",
  "History of Present Illness": "hpi",
  "Past Medical/Surgical History": "pastHistory",
  "Drug & Allergy History": "drugHistory",
  "Family History": "familyHistory",
  "Personal History": "personalHistory",
  "Review of Systems": "ros",
  "Prior Investigations Summary": "investigations",
};

// =========================================================
// API HELPER
// =========================================================

async function api(path, options = {}) {
  try {
    const response = await fetch(API + path, options);

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        text || `Request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to MediIntake AI backend. " +
          "Please make sure FastAPI is running on port 8000."
      );
    }

    throw error;
  }
}

// =========================================================
// APP
// =========================================================

function App() {
  const [step, setStep] = useState(0);

  const [language, setLanguage] = useState("en");

  const [mode, setMode] = useState("new");

  const [existingId, setExistingId] = useState("");

  const [consent, setConsent] = useState(false);

  const [session, setSession] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [summary, setSummary] = useState(null);

  const [role, setRole] = useState("patient");

  const [loading, setLoading] = useState(false);

  const [confirmed, setConfirmed] = useState(false);

  const t = getTranslation(language);

  // -------------------------------------------------------
  // Start Session
  // -------------------------------------------------------

  const start = async () => {
    if (!consent) {
      return;
    }

    setLoading(true);

    try {
      const data =
        mode === "existing" && existingId
          ? await api(
              `/session/${encodeURIComponent(existingId)}`
            )
          : await api(`/session?language=${encodeURIComponent(language)}`, {
              method: "POST",
            });

      setSession(data);

      setDocuments(data.extracted_documents || []);

      setSummary(data.final_summary || null);

      setConfirmed(data.status === "confirmed");

      setStep(1);
    } catch (error) {
      alert(
        "Could not start session: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Go To Documents
  // -------------------------------------------------------

  const goDocuments = async () => {
    if (!session?.session_id) {
      alert("Session is not available.");
      return;
    }

    try {
      const latest = await api(
        `/session/${encodeURIComponent(
          session.session_id
        )}`
      );

      setSession(latest);

      setDocuments(
        latest.extracted_documents ||
          documents ||
          []
      );

      setSummary(
        latest.final_summary ||
          summary ||
          null
      );

      setConfirmed(
        latest.status === "confirmed"
      );

      setStep(2);
    } catch (error) {
      console.error(
        "Could not refresh session:",
        error
      );

      setStep(2);
    }
  };

  // -------------------------------------------------------
  // Finish Documents
  // -------------------------------------------------------

  const finishDocs = () => {
    setStep(3);
  };

  // -------------------------------------------------------
  // Generate Summary
  // -------------------------------------------------------

  const generate = async () => {
    if (!session?.session_id) {
      alert("Session is not available.");
      return;
    }

    setLoading(true);

    try {
      const latest = await api(
        `/session/${encodeURIComponent(
          session.session_id
        )}`
      );

      setSession(latest);

      const latestDocuments =
        documents.length > 0
          ? documents
          : latest.extracted_documents || [];

      setDocuments(latestDocuments);

      const result = await api(
        "/generate-summary",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            session_id:
              latest.session_id,

            documents:
              latestDocuments,

            language: language,
          }),
        }
      );

      setSummary(result.summary);

      setConfirmed(false);

      setStep(4);
    } catch (error) {
      console.error(
        "Summary generation error:",
        error
      );

      alert(
        "Could not generate summary: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Confirm Summary
  // -------------------------------------------------------

  const confirmSummary = async () => {
    if (!session || !summary) {
      return;
    }

    setLoading(true);

    try {
      await api(
        "/session/save",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            session_id:
              session.session_id,

            patient_id:
              session.patient_id,

            transcript:
              session.transcript || [],

            extracted_documents:
              documents,

            final_summary:
              summary,

            status: "confirmed",

            language: language,
          }),
        }
      );

      setConfirmed(true);

      setSession(previous => ({
        ...previous,

        status: "confirmed",

        final_summary:
          summary,

        extracted_documents:
          documents,
      }));
    } catch (error) {
      alert(
        "Could not confirm summary: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-[#f5f9fc] text-[#17324d]">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700">
              <Stethoscope />
            </div>

            <div>

              <div className="text-xl font-bold tracking-tight">
                {t.appName}
              </div>

              <div className="text-xs text-slate-500">
                {t.subtitle}
              </div>

            </div>

          </div>

          {/* LANGUAGE */}

          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm">

            <Languages size={17} />

            <select
              value={language}
              onChange={e =>
                setLanguage(
                  e.target.value
                )
              }
              className="bg-transparent outline-none"
            >

              {Object.entries(
                LANGUAGE_CONFIG
              ).map(
                ([code, config]) => (
                  <option
                    key={code}
                    value={code}
                  >
                    {config.native}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-6xl px-5 py-7">

        <Progress
          step={step}
          language={language}
        />

        {/* LANDING */}

        {step === 0 && (
          <Landing
            t={t}
            mode={mode}
            setMode={setMode}
            existingId={existingId}
            setExistingId={
              setExistingId
            }
            consent={consent}
            setConsent={setConsent}
            start={start}
            loading={loading}
          />
        )}

        {/* CHAT */}

        {step === 1 && session && (
          <Chat
            session={session}
            setSession={setSession}
            onNext={goDocuments}
            language={language}
            t={t}
          />
        )}

        {/* DOCUMENTS */}

        {step === 2 && (
          <UploadDocs
            session={session}
            documents={documents}
            setDocuments={setDocuments}
            onNext={finishDocs}
            language={language}
            t={t}
          />
        )}

        {/* REVIEW */}

        {step === 3 && (
          <Review
            documents={documents}
            setDocuments={setDocuments}
            onNext={generate}
            loading={loading}
            t={t}
          />
        )}

        {/* DOCTOR */}

        {step === 4 && (
          <DoctorView
            summary={summary}
            setSummary={setSummary}
            role={role}
            setRole={setRole}
            confirmed={confirmed}
            onConfirm={confirmSummary}
            loading={loading}
            t={t}
          />
        )}

      </main>

      {/* FOOTER */}

      <footer className="mx-auto max-w-6xl px-5 pb-8 text-xs text-slate-500">
        {t.footer}
      </footer>

    </div>
  );
}

// =========================================================
// PROGRESS
// =========================================================

function Progress({
  step,
  language,
}) {
  const t = getTranslation(language);

  return (
    <div className="mb-7 flex items-center justify-between gap-2 overflow-x-auto">

      {t.steps.map(
        (name, index) => (
          <React.Fragment
            key={name}
          >

            <div
              className={
                "flex min-w-fit items-center gap-2 text-sm " +
                (
                  index <= step
                    ? "font-semibold text-sky-700"
                    : "text-slate-400"
                )
              }
            >

              <div
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full " +
                  (
                    index < step
                      ? "bg-sky-600 text-white"
                      : index === step
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100"
                  )
                }
              >

                {index < step ? (
                  <CheckCircle2
                    size={17}
                  />
                ) : (
                  index + 1
                )}

              </div>

              {name}

            </div>

            {index <
              t.steps.length -
                1 && (
              <div className="h-px min-w-8 flex-1 bg-slate-200" />
            )}

          </React.Fragment>
        )
      )}

    </div>
  );
}

// =========================================================
// LANDING
// =========================================================

function Landing({
  t,
  mode,
  setMode,
  existingId,
  setExistingId,
  consent,
  setConsent,
  start,
  loading,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">

      <div className="rounded-3xl bg-white p-8 soft-shadow md:p-10">

        <div className="mb-5 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          {t.patientIntake}
        </div>

        <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
          {t.welcomeTitle}
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
          {t.welcomeText}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">

          <button
            onClick={() =>
              setMode("new")
            }
            className={
              "rounded-2xl border p-5 text-left " +
              (
                mode === "new"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200"
              )
            }
          >

            <b>
              {t.newPatient}
            </b>

            <div className="mt-1 text-sm text-slate-500">
              {t.newPatientText}
            </div>

          </button>

          <button
            onClick={() =>
              setMode("existing")
            }
            className={
              "rounded-2xl border p-5 text-left " +
              (
                mode === "existing"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200"
              )
            }
          >

            <b>
              {t.existingPatient}
            </b>

            <div className="mt-1 text-sm text-slate-500">
              {t.existingPatientText}
            </div>

          </button>

        </div>

        {mode === "existing" && (
          <input
            value={existingId}
            onChange={e =>
              setExistingId(
                e.target.value
              )
            }
            placeholder={
              t.patientSessionId
            }
            className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
          />
        )}

        <label className="mt-6 flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">

          <input
            type="checkbox"
            checked={consent}
            onChange={e =>
              setConsent(
                e.target.checked
              )
            }
            className="mt-1 h-5 w-5"
          />

          <span>
            {t.consentText}
          </span>

        </label>

        <button
          disabled={
            !consent || loading
          }
          onClick={start}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >

          {loading
            ? t.starting
            : t.startIntake}

          <ChevronRight size={18} />

        </button>

      </div>

      <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-8">

        <div className="flex items-center gap-3 text-sky-800">

          <ShieldCheck />

          <b>
            {t.safeHandoff}
          </b>

        </div>

        <ul className="mt-6 space-y-5 text-sm leading-6 text-slate-600">

          <li>
            <b className="text-slate-800">
              01 · {t.feature1}
            </b>

            <br />

            {t.feature1Text}
          </li>

          <li>
            <b className="text-slate-800">
              02 · {t.feature2}
            </b>

            <br />

            {t.feature2Text}
          </li>

          <li>
            <b className="text-slate-800">
              03 · {t.feature3}
            </b>

            <br />

            {t.feature3Text}
          </li>

        </ul>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          {t.placeholder}
        </div>

      </div>

    </section>
  );
}

// =========================================================
// CHAT
// =========================================================

function Chat({
  session,
  setSession,
  onNext,
  language,
  t,
}) {
  const [text, setText] =
    useState("");

  const [chips, setChips] =
    useState(
      session?.transcript?.at(-1)
        ?.chips || []
    );

  const [busy, setBusy] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const end =
    useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [session]);

  // -------------------------------------------------------
  // SEND MESSAGE
  // -------------------------------------------------------

  const send = async (
    value = text
  ) => {
    if (
      !value ||
      !value.trim() ||
      busy
    ) {
      return;
    }

    setBusy(true);

    try {
      const result =
        await api(
          "/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              session_id:
                session.session_id,

              message: value,

              language: language,
            }),
          }
        );

      setSession(
        previous => ({
          ...previous,

          transcript:
            result.transcript,
        })
      );

      setChips(
        result.chips || []
      );
    } catch (error) {
      alert(
        "Could not send response: " +
          error.message
      );
    } finally {
      setText("");
      setBusy(false);
    }
  };

  // -------------------------------------------------------
  // VOICE
  // -------------------------------------------------------

  const voice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Browser voice input is not available. Please use Chrome or another supported browser."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      LANGUAGE_CONFIG[
        language
      ]?.speech || "en-IN";

    recognition.continuous = false;

    recognition.interimResults =
      false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () =>
      setListening(true);

    recognition.onend = () =>
      setListening(false);

    recognition.onerror = event => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onresult =
      event => {
        const spoken =
          event.results[0][0]
            .transcript;

        setText(spoken);
      };

    recognition.start();
  };

  return (
    <section className="mx-auto max-w-3xl">

      <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t.intakeWarning}
      </div>

      <div className="overflow-hidden rounded-3xl bg-white soft-shadow">

        <div className="max-h-[58vh] min-h-[420px] space-y-5 overflow-y-auto p-5 md:p-7">

          {(session.transcript ||
            []).map(
            (message, index) => (
              <div
                key={index}
                className={
                  message.role ===
                  "assistant"
                    ? ""
                    : "text-right"
                }
              >

                <div
                  className={
                    "inline-block max-w-[88%] rounded-3xl px-5 py-4 text-left " +
                    (
                      message.role ===
                      "assistant"
                        ? "bg-slate-100"
                        : "bg-sky-700 text-white"
                    )
                  }
                >

                  {message.text}

                </div>

                {message.role ===
                  "assistant" &&
                  message.chips
                    ?.length > 0 && (

                    <div className="mt-3 flex flex-wrap gap-2">

                      {message.chips.map(
                        chip => (
                          <button
                            key={chip}
                            onClick={() =>
                              send(chip)
                            }
                            disabled={
                              busy
                            }
                            className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                          >
                            {chip}
                          </button>
                        )
                      )}

                    </div>
                  )}

              </div>
            )
          )}

          <div ref={end} />

        </div>

        <div className="border-t border-slate-100 p-4">

          <div className="flex gap-2">

            <button
              onClick={voice}
              className={
                "rounded-2xl border px-4 " +
                (
                  listening
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white text-slate-600"
                )
              }
              title={
                listening
                  ? t.listening
                  : t.speak
              }
            >

              <Mic />

            </button>

            <input
              value={text}
              onChange={e =>
                setText(
                  e.target.value
                )
              }
              onKeyDown={e => {
                if (
                  e.key === "Enter"
                ) {
                  send();
                }
              }}
              placeholder={
                t.typeAnswer
              }
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
            />

            <button
              onClick={() =>
                send()
              }
              disabled={busy}
              className="rounded-2xl bg-sky-700 px-4 text-white disabled:opacity-50"
              title={t.send}
            >

              <Send />

            </button>

          </div>

          <button
            onClick={onNext}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >

            {t.continueDocuments}

            <ChevronRight
              size={17}
            />

          </button>

        </div>

      </div>

    </section>
  );
}

// =========================================================
// UPLOAD DOCUMENTS
// =========================================================

function UploadDocs({
  session,
  documents,
  setDocuments,
  onNext,
  t,
}) {
  const [busy, setBusy] =
    useState(false);

  const add = async file => {
    if (!file) {
      return;
    }

    setBusy(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const result =
        await api(
          `/extract-document?session_id=${encodeURIComponent(
            session?.session_id ||
              "demo-session"
          )}`,
          {
            method: "POST",
            body: formData,
          }
        );

      setDocuments(
        previous => [
          ...previous,
          result,
        ]
      );
    } catch (error) {
      alert(
        "Document extraction failed: " +
          error.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl">

      <div className="rounded-3xl bg-white p-7 soft-shadow">

        <h2 className="text-3xl font-bold">
          {t.uploadTitle}
        </h2>

        <p className="mt-2 text-slate-500">
          {t.uploadText}
        </p>

        <label className="mt-7 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/60 p-10 text-center">

          <Upload
            className="text-sky-700"
            size={34}
          />

          <span className="mt-3 font-semibold">
            {busy
              ? t.extracting
              : t.uploadDocument}
          </span>

          <span className="mt-1 text-xs text-slate-500">
            {t.pdfJpgPng}
          </span>

          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            disabled={busy}
            onChange={event => {
              const file =
                event.target
                  .files?.[0];

              if (file) {
                add(file);
              }
            }}
          />

        </label>

        {documents.length > 0 && (
          <div className="mt-6 space-y-2">

            {documents.map(
              (document, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >

                  <div className="flex items-center gap-3">

                    <FileText className="text-sky-700" />

                    <span className="text-sm font-medium">
                      {
                        document.filename
                      }
                    </span>

                  </div>

                  <span className="text-xs text-emerald-700">
                    {t.ocrComplete}
                  </span>

                </div>
              )
            )}

          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          <button
            onClick={onNext}
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold"
          >
            {t.skip}
          </button>

          <button
            onClick={onNext}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >

            {t.reviewExtracted}

            <ChevronRight
              size={17}
            />

          </button>

        </div>

      </div>

    </section>
  );
}

// =========================================================
// REVIEW
// =========================================================

function Review({
  documents,
  setDocuments,
  onNext,
  loading,
  t,
}) {
  const update = (
    documentIndex,
    key,
    value
  ) => {
    setDocuments(
      documentsList =>
        documentsList.map(
          (document, index) =>
            index ===
            documentIndex
              ? {
                  ...document,
                  [key]: value,
                }
              : document
        )
    );
  };

  const updateMedicine = (
    documentIndex,
    medicineIndex,
    key,
    value
  ) => {
    setDocuments(
      documentsList =>
        documentsList.map(
          (document, index) => {
            if (
              index !==
              documentIndex
            ) {
              return document;
            }

            return {
              ...document,

              medicines:
                (
                  document.medicines ||
                  []
                ).map(
                  (
                    medicine,
                    medicineIndex2
                  ) =>
                    medicineIndex2 ===
                    medicineIndex
                      ? {
                          ...medicine,
                          [key]: value,
                        }
                      : medicine
                ),
            };
          }
        )
    );
  };

  const updateLab = (
    documentIndex,
    labIndex,
    key,
    value
  ) => {
    setDocuments(
      documentsList =>
        documentsList.map(
          (document, index) => {
            if (
              index !==
              documentIndex
            ) {
              return document;
            }

            return {
              ...document,

              lab_tests:
                (
                  document.lab_tests ||
                  []
                ).map(
                  (
                    lab,
                    labIndex2
                  ) =>
                    labIndex2 ===
                    labIndex
                      ? {
                          ...lab,
                          [key]: value,
                        }
                      : lab
                ),
            };
          }
        )
    );
  };

  return (
    <section className="mx-auto max-w-4xl">

      <div className="mb-5">

        <h2 className="text-3xl font-bold">
          {t.reviewTitle}
        </h2>

        <p className="mt-2 text-slate-500">
          {t.reviewText}
        </p>

      </div>

      {documents.length === 0 ? (

        <div className="rounded-3xl bg-white p-8 text-slate-500 soft-shadow">
          {t.noDocuments}
        </div>

      ) : (

        documents.map(
          (
            document,
            documentIndex
          ) => (

            <div
              key={documentIndex}
              className="mb-5 rounded-3xl bg-white p-6 soft-shadow"
            >

              <div className="mb-5 flex items-center justify-between">

                <b>
                  {
                    document.filename
                  }
                </b>

                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700">
                  {t.editable}
                </span>

              </div>

              <label className="text-sm font-semibold">

                {t.diagnosis}

                <input
                  value={
                    document.diagnosis ||
                    ""
                  }
                  onChange={event =>
                    update(
                      documentIndex,
                      "diagnosis",
                      event.target.value
                    )
                  }
                  placeholder={
                    t.notDocumented
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-sky-500"
                />

              </label>

              <label className="mt-4 block text-sm font-semibold">

                {t.documentDate}

                <input
                  value={
                    document.date ||
                    ""
                  }
                  onChange={event =>
                    update(
                      documentIndex,
                      "date",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-sky-500"
                />

              </label>

              {/* MEDICINES */}

              {(
                document.medicines ||
                []
              ).length > 0 && (

                <div className="mt-6">

                  <h3 className="mb-3 font-bold">
                    {t.medicines}
                  </h3>

                  <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                      <thead>

                        <tr className="border-b text-slate-500">

                          <th className="p-2">
                            {t.medicine}
                          </th>

                          <th className="p-2">
                            {t.dosage}
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {document.medicines.map(
                          (
                            medicine,
                            medicineIndex
                          ) => (

                            <tr
                              key={
                                medicineIndex
                              }
                              className="border-b last:border-0"
                            >

                              <td className="p-2">

                                <input
                                  value={
                                    medicine.name ||
                                    ""
                                  }
                                  onChange={event =>
                                    updateMedicine(
                                      documentIndex,
                                      medicineIndex,
                                      "name",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border px-2 py-1"
                                />

                              </td>

                              <td className="p-2">

                                <input
                                  value={
                                    medicine.dosage ||
                                    ""
                                  }
                                  onChange={event =>
                                    updateMedicine(
                                      documentIndex,
                                      medicineIndex,
                                      "dosage",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border px-2 py-1"
                                />

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>
              )}

              {/* LABS */}

              <div className="mt-6 overflow-x-auto">

                <h3 className="mb-3 font-bold">
                  {t.laboratory}
                </h3>

                {(
                  document.lab_tests ||
                  []
                ).length === 0 ? (

                  <p className="text-sm text-slate-500">
                    {t.noLabs}
                  </p>

                ) : (

                  <table className="w-full text-left text-sm">

                    <thead>

                      <tr className="border-b text-slate-500">

                        <th className="p-2">
                          {t.labTest}
                        </th>

                        <th className="p-2">
                          {t.value}
                        </th>

                        <th className="p-2">
                          {t.referenceRange}
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {document.lab_tests.map(
                        (
                          lab,
                          labIndex
                        ) => (

                          <tr
                            key={labIndex}
                            className="border-b last:border-0"
                          >

                            <td className="p-2">

                              <input
                                value={
                                  lab.name ||
                                  ""
                                }
                                onChange={event =>
                                  updateLab(
                                    documentIndex,
                                    labIndex,
                                    "name",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border px-2 py-1"
                              />

                            </td>

                            <td className="p-2">

                              <input
                                value={
                                  lab.value ||
                                  ""
                                }
                                onChange={event =>
                                  updateLab(
                                    documentIndex,
                                    labIndex,
                                    "value",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border px-2 py-1"
                              />

                            </td>

                            <td className="p-2">

                              <input
                                value={
                                  lab.reference_range ||
                                  ""
                                }
                                onChange={event =>
                                  updateLab(
                                    documentIndex,
                                    labIndex,
                                    "reference_range",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border px-2 py-1"
                              />

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                )}

              </div>

            </div>
          )
        )
      )}

      <button
        onClick={onNext}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-4 font-semibold text-white disabled:opacity-50"
      >

        {loading
          ? t.generating
          : t.generateSummary}

        <ChevronRight
          size={18}
        />

      </button>

    </section>
  );
}

// =========================================================
// DOCTOR VIEW
// =========================================================

function DoctorView({
  summary,
  setSummary,
  role,
  setRole,
  confirmed,
  onConfirm,
  loading,
  t,
}) {
  const [editing, setEditing] =
    useState(false);

  const print = () => {
    window.print();
  };

  const change = (
    key,
    value
  ) => {
    setSummary(
      previous => ({
        ...previous,
        [key]: value,
      })
    );
  };

  const canEdit =
    role === "staff";

  return (
    <section className="mx-auto max-w-4xl">

      {/* TOP */}

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">

        <div>

          <div
            className={
              "mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
              (
                confirmed
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              )
            }
          >

            {confirmed
              ? t.final
              : t.draft}

          </div>

          <h2 className="text-3xl font-bold">
            {t.doctorView}
          </h2>

          <p className="mt-1 text-slate-500">
            {t.structuredSummary}
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <select
            value={role}
            onChange={event => {
              setRole(
                event.target.value
              );

              if (
                event.target.value !==
                "staff"
              ) {
                setEditing(false);
              }
            }}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >

            <option value="patient">
              {t.patientView}
            </option>

            <option value="staff">
              {t.staffDoctor}
            </option>

          </select>

          {canEdit && (

            <button
              onClick={() =>
                setEditing(
                  !editing
                )
              }
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
            >

              <Edit3 size={16} />

              {editing
                ? t.done
                : t.edit}

            </button>

          )}

          <button
            onClick={print}
            className="rounded-xl border bg-white p-2"
            title={t.print}
          >

            <Printer size={17} />

          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="rounded-3xl bg-white p-7 soft-shadow print:shadow-none">

        {Object.entries(
          summary || {}
        ).map(
          ([key, value]) => {

            const translationKey =
              SUMMARY_LABELS[key];

            const translatedKey =
              translationKey
                ? t[translationKey]
                : key;

            return (
              <div
                key={key}
                className="border-b border-slate-100 py-5 last:border-0"
              >

                <h3 className="font-bold text-slate-800">
                  {translatedKey}
                </h3>

                {editing &&
                canEdit ? (

                  <textarea
                    value={
                      typeof value ===
                      "string"
                        ? value
                        : JSON.stringify(
                            value,
                            null,
                            2
                          )
                    }
                    onChange={event =>
                      change(
                        key,
                        event.target
                          .value
                      )
                    }
                    className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-sky-500"
                  />

                ) : (

                  <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">

                    {value ||
                      t.notDocumented}

                  </p>

                )}

              </div>
            );
          }
        )}

        {/* DISCLAIMER */}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          {t.disclaimer}
        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        {canEdit && (

          <button
            onClick={() =>
              setEditing(true)
            }
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold"
          >

            <Edit3 size={18} />

            {t.editSummary}

          </button>

        )}

        {!canEdit && (

          <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm text-slate-500">

            <Lock size={16} />

            {t.patientReadonly}

          </div>

        )}

        {canEdit &&
          !confirmed && (

            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >

              {loading ? (
                <>
                  <Save
                    size={18}
                  />
                  {t.saving}
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={18}
                  />
                  {t.confirmDraft}
                </>
              )}

            </button>

          )}

        {confirmed && (

          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 font-semibold text-emerald-700">

            <CheckCircle2
              size={18}
            />

            {t.clinicianConfirmed}

          </div>

        )}

      </div>

    </section>
  );
}

// =========================================================
// MOUNT
// =========================================================

createRoot(
  document.getElementById("root")
).render(
  <App />
);