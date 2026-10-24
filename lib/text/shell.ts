import type { LangCode } from "@/lib/languages";

export type ShellText = {
  navHome: string; navBill: string; navStock: string; navUdhaar: string; navReports: string;
  hello: string; settings: string; reportIssue: string; language: string; logout: string; back: string;
  todaySales: string; bills: (n: number) => string;
  stockOverview: string; totalItems: string; healthy: string; lowLabel: string; outLabel: string; expiringLabel: string;
  quickBill: string; quickStock: string; askVoice: string; voiceExample: string;
  trendTitle: string; last7: string;
  alertsTitle: string; allGood: string; viewAll: string;
  stLow: string; stOut: string; stExpired: string; stExpiresToday: string; stExpiresIn: (n: number) => string;
  udhaarTitle: string; pending: string; openLedger: string;
  settingsTitle: string; langTitle: string; textSize: string; sizeNormal: string; sizeLarge: string; sizeXL: string;
  voiceTitle: string; voiceOn: string; voiceOff: string;
  demoTitle: string; demoText: string; demoBtn: string; demoConfirm: string; demoDone: string; demoYes: string; demoNo: string;
  aboutTitle: string; version: string; account: string;
  issueTitle: string; issueIntro: string; typeBug: string; typeIdea: string; typeOther: string;
  msgPh: string; send: string; sending: string; thanks: string; mineTitle: string; none: string;
  stOpen: string; stSeen: string; stFixed: string; errShort: string; errMany: string; errGeneric: string;
};

export const SHELL: Record<LangCode, ShellText> = {
  en: {
    navHome: "Home", navBill: "Bill", navStock: "Stock", navUdhaar: "Udhaar", navReports: "Reports",
    hello: "Namaste 🙏", settings: "Settings", reportIssue: "Report an issue", language: "Language", logout: "Log out", back: "← Back",
    todaySales: "Today's sales", bills: (n) => `${n} ${n === 1 ? "bill" : "bills"}`,
    stockOverview: "Stock overview", totalItems: "Total items", healthy: "In stock", lowLabel: "Low", outLabel: "Out", expiringLabel: "Expiring",
    quickBill: "Make a bill", quickStock: "Stock arrived", askVoice: "Ask by voice", voiceExample: "Try: “How much rice is left?”",
    trendTitle: "Sales trend", last7: "Last 7 days",
    alertsTitle: "Needs attention", allGood: "Everything looks good 👍", viewAll: "View all stock",
    stLow: "Low", stOut: "Out of stock", stExpired: "Expired", stExpiresToday: "Expires today",
    stExpiresIn: (n) => `Expires in ${n} ${n === 1 ? "day" : "days"}`,
    udhaarTitle: "Udhaar pending", pending: "to collect", openLedger: "Open ledger",
    settingsTitle: "Settings", langTitle: "Language", textSize: "Text size", sizeNormal: "Normal", sizeLarge: "Large", sizeXL: "Extra large",
    voiceTitle: "Spoken replies", voiceOn: "On", voiceOff: "Off",
    demoTitle: "Demo data", demoText: "Fill the shop with sample items, sales and customers. This replaces the current data.",
    demoBtn: "Load demo data", demoConfirm: "Replace all current items, sales and customers with sample data?",
    demoDone: "Demo data loaded", demoYes: "Yes, load it", demoNo: "Cancel",
    aboutTitle: "About", version: "Vyapar Setu · version 1.0", account: "Account",
    issueTitle: "Report an issue", issueIntro: "Found a problem or have an idea? Tell us and we will look into it.",
    typeBug: "Problem", typeIdea: "Idea", typeOther: "Other",
    msgPh: "Write here...", send: "Send", sending: "Sending...", thanks: "Thank you! Your message was sent.",
    mineTitle: "Your earlier reports", none: "No reports yet", stOpen: "Open", stSeen: "Seen", stFixed: "Fixed",
    errShort: "Please write a little more (at least 5 characters)", errMany: "Too many reports today, please try tomorrow", errGeneric: "Something went wrong",
  },
  hi: {
    navHome: "घर", navBill: "बिल", navStock: "स्टॉक", navUdhaar: "उधार", navReports: "रिपोर्ट",
    hello: "नमस्ते 🙏", settings: "सेटिंग्स", reportIssue: "समस्या बताएं", language: "भाषा", logout: "बाहर निकलें", back: "← वापस",
    todaySales: "आज की बिक्री", bills: (n) => `${n} बिल`,
    stockOverview: "स्टॉक का हाल", totalItems: "कुल सामान", healthy: "ठीक", lowLabel: "कम", outLabel: "खत्म", expiringLabel: "एक्सपायरी",
    quickBill: "बिल बनाएं", quickStock: "माल आया", askVoice: "बोलकर पूछें", voiceExample: "कहिए: “चावल कितना बचा है?”",
    trendTitle: "बिक्री का रुझान", last7: "पिछले 7 दिन",
    alertsTitle: "ध्यान दें", allGood: "सब ठीक है 👍", viewAll: "पूरा स्टॉक देखें",
    stLow: "कम", stOut: "खत्म", stExpired: "एक्सपायर", stExpiresToday: "आज एक्सपायर", stExpiresIn: (n) => `${n} दिन में एक्सपायर`,
    udhaarTitle: "उधार बाकी", pending: "वसूलना है", openLedger: "खाता खोलें",
    settingsTitle: "सेटिंग्स", langTitle: "भाषा", textSize: "अक्षरों का आकार", sizeNormal: "सामान्य", sizeLarge: "बड़ा", sizeXL: "बहुत बड़ा",
    voiceTitle: "बोलकर जवाब", voiceOn: "चालू", voiceOff: "बंद",
    demoTitle: "डेमो डेटा", demoText: "दुकान में नमूने का सामान, बिक्री और ग्राहक भर दें। इससे मौजूदा डेटा बदल जाएगा।",
    demoBtn: "डेमो डेटा डालें", demoConfirm: "क्या सारा मौजूदा सामान, बिक्री और ग्राहक नमूना डेटा से बदलना है?",
    demoDone: "डेमो डेटा डाल दिया", demoYes: "हाँ, डालें", demoNo: "रद्द करें",
    aboutTitle: "ऐप के बारे में", version: "व्यापार सेतु · संस्करण 1.0", account: "खाता",
    issueTitle: "समस्या बताएं", issueIntro: "कोई दिक्कत मिली या कोई सुझाव है? हमें बताइए, हम देखेंगे।",
    typeBug: "समस्या", typeIdea: "सुझाव", typeOther: "अन्य",
    msgPh: "यहाँ लिखें...", send: "भेजें", sending: "भेज रहे हैं...", thanks: "धन्यवाद! आपका संदेश भेज दिया गया।",
    mineTitle: "आपकी पिछली शिकायतें", none: "अभी कोई शिकायत नहीं", stOpen: "खुली", stSeen: "देखी गई", stFixed: "ठीक हो गई",
    errShort: "थोड़ा और लिखिए (कम से कम 5 अक्षर)", errMany: "आज बहुत संदेश हो गए, कल कोशिश करें", errGeneric: "कुछ गलत हुआ",
  },
  mr: {
    navHome: "मुख्य", navBill: "बिल", navStock: "साठा", navUdhaar: "उधारी", navReports: "अहवाल",
    hello: "नमस्कार 🙏", settings: "सेटिंग्ज", reportIssue: "समस्या कळवा", language: "भाषा", logout: "बाहेर पडा", back: "← मागे",
    todaySales: "आजची विक्री", bills: (n) => `${n} बिले`,
    stockOverview: "साठ्याची स्थिती", totalItems: "एकूण माल", healthy: "ठीक", lowLabel: "कमी", outLabel: "संपले", expiringLabel: "मुदत",
    quickBill: "बिल बनवा", quickStock: "माल आला", askVoice: "बोलून विचारा", voiceExample: "म्हणा: “तांदूळ किती शिल्लक आहे?”",
    trendTitle: "विक्रीचा कल", last7: "मागील 7 दिवस",
    alertsTitle: "लक्ष द्या", allGood: "सर्व ठीक आहे 👍", viewAll: "पूर्ण साठा पहा",
    stLow: "कमी", stOut: "संपले", stExpired: "मुदत संपली", stExpiresToday: "आज मुदत संपते", stExpiresIn: (n) => `${n} दिवसांत मुदत संपते`,
    udhaarTitle: "उधारी बाकी", pending: "वसूल करायचे", openLedger: "खाते उघडा",
    settingsTitle: "सेटिंग्ज", langTitle: "भाषा", textSize: "अक्षरांचा आकार", sizeNormal: "सामान्य", sizeLarge: "मोठा", sizeXL: "खूप मोठा",
    voiceTitle: "बोलून उत्तर", voiceOn: "चालू", voiceOff: "बंद",
    demoTitle: "डेमो डेटा", demoText: "दुकानात नमुना माल, विक्री आणि ग्राहक भरा. यामुळे सध्याचा डेटा बदलेल.",
    demoBtn: "डेमो डेटा भरा", demoConfirm: "सध्याचा सर्व माल, विक्री आणि ग्राहक नमुना डेटाने बदलायचे का?",
    demoDone: "डेमो डेटा भरला", demoYes: "हो, भरा", demoNo: "रद्द करा",
    aboutTitle: "अॅपबद्दल", version: "व्यापार सेतू · आवृत्ती 1.0", account: "खाते",
    issueTitle: "समस्या कळवा", issueIntro: "काही अडचण आली किंवा सूचना आहे? आम्हाला सांगा, आम्ही पाहू.",
    typeBug: "समस्या", typeIdea: "सूचना", typeOther: "इतर",
    msgPh: "येथे लिहा...", send: "पाठवा", sending: "पाठवत आहे...", thanks: "धन्यवाद! तुमचा संदेश पाठवला.",
    mineTitle: "तुमच्या आधीच्या तक्रारी", none: "अजून तक्रार नाही", stOpen: "उघडी", stSeen: "पाहिली", stFixed: "दुरुस्त झाली",
    errShort: "थोडे अधिक लिहा (किमान 5 अक्षरे)", errMany: "आज खूप संदेश झाले, उद्या प्रयत्न करा", errGeneric: "काहीतरी चुकले",
  },
  te: {
    navHome: "హోమ్", navBill: "బిల్లు", navStock: "స్టాక్", navUdhaar: "బాకీ", navReports: "రిపోర్టులు",
    hello: "నమస్కారం 🙏", settings: "సెట్టింగ్స్", reportIssue: "సమస్య చెప్పండి", language: "భాష", logout: "లాగ్ అవుట్", back: "← వెనక్కి",
    todaySales: "ఈ రోజు అమ్మకాలు", bills: (n) => `${n} బిల్లులు`,
    stockOverview: "స్టాక్ పరిస్థితి", totalItems: "మొత్తం వస్తువులు", healthy: "సరిపడా", lowLabel: "తక్కువ", outLabel: "అయిపోయినవి", expiringLabel: "గడువు",
    quickBill: "బిల్లు చేయండి", quickStock: "సరుకు వచ్చింది", askVoice: "మాట్లాడి అడగండి", voiceExample: "ఇలా చెప్పండి: “బియ్యం ఎంత మిగిలి ఉన్నాయి?”",
    trendTitle: "అమ్మకాల ధోరణి", last7: "గత 7 రోజులు",
    alertsTitle: "శ్రద్ధ అవసరం", allGood: "అంతా బాగుంది 👍", viewAll: "మొత్తం స్టాక్ చూడండి",
    stLow: "తక్కువ", stOut: "అయిపోయింది", stExpired: "గడువు ముగిసింది", stExpiresToday: "ఈ రోజే గడువు ముగుస్తుంది", stExpiresIn: (n) => `${n} రోజుల్లో గడువు ముగుస్తుంది`,
    udhaarTitle: "బాకీ రావాల్సినది", pending: "వసూలు చేయాలి", openLedger: "ఖాతా తెరవండి",
    settingsTitle: "సెట్టింగ్స్", langTitle: "భాష", textSize: "అక్షరాల పరిమాణం", sizeNormal: "సాధారణం", sizeLarge: "పెద్దది", sizeXL: "చాలా పెద్దది",
    voiceTitle: "మాటల్లో సమాధానం", voiceOn: "ఆన్", voiceOff: "ఆఫ్",
    demoTitle: "డెమో డేటా", demoText: "దుకాణంలో నమూనా వస్తువులు, అమ్మకాలు, కస్టమర్లను నింపండి. ఇది ప్రస్తుత డేటాను మారుస్తుంది.",
    demoBtn: "డెమో డేటా నింపండి", demoConfirm: "ప్రస్తుత వస్తువులు, అమ్మకాలు, కస్టమర్లను నమూనా డేటాతో మార్చాలా?",
    demoDone: "డెమో డేటా నింపబడింది", demoYes: "అవును, నింపండి", demoNo: "రద్దు",
    aboutTitle: "యాప్ గురించి", version: "వ్యాపార్ సేతు · వెర్షన్ 1.0", account: "ఖాతా",
    issueTitle: "సమస్య చెప్పండి", issueIntro: "ఏదైనా సమస్య ఉందా లేదా సూచన ఉందా? మాకు చెప్పండి, మేము చూస్తాం.",
    typeBug: "సమస్య", typeIdea: "సూచన", typeOther: "ఇతర",
    msgPh: "ఇక్కడ రాయండి...", send: "పంపండి", sending: "పంపుతున్నాం...", thanks: "ధన్యవాదాలు! మీ సందేశం పంపబడింది.",
    mineTitle: "మీ గత ఫిర్యాదులు", none: "ఇంకా ఫిర్యాదులు లేవు", stOpen: "తెరిచి ఉంది", stSeen: "చూశాం", stFixed: "సరిచేశాం",
    errShort: "కొంచెం ఎక్కువ రాయండి (కనీసం 5 అక్షరాలు)", errMany: "ఈ రోజు చాలా సందేశాలు అయ్యాయి, రేపు ప్రయత్నించండి", errGeneric: "ఏదో తప్పు జరిగింది",
  },
};