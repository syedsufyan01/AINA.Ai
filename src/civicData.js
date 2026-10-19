// Project AINA - Pakistani Civic Intelligence & Legal Grievance Database
// NYLP AI Hackathon 2026

export const CIVIC_CATEGORIES = [
  {
    id: "utilities",
    nameEn: "Electricity, Gas & Water",
    nameUr: "بجلی، گیس اور پانی کے مسائل",
    icon: "⚡",
    color: "#f59e0b",
    description: "Overbilling, defective meters, detection bills, load-shedding, gas pressure, WASA sewer issues."
  },
  {
    id: "identity",
    nameEn: "NADRA, Passport & Excise",
    nameUr: "نادرا، پاسپورٹ اور ایکسائز",
    icon: "🪪",
    color: "#10b981",
    description: "CNIC blocking, name correction, succession certificate, passport delay, vehicle biometric transfer."
  },
  {
    id: "police",
    nameEn: "Police, FIR & Security",
    nameUr: "پولیس، ایف آئی آر اور تحفظ",
    icon: "🛡️",
    color: "#ef4444",
    description: "Refusal to file FIR (CrPC 154), lost property Roznamcha, 15 emergency, harassment, Justice of Peace 22-A."
  },
  {
    id: "cybercrime",
    nameEn: "FIA Cybercrime & Online Fraud",
    nameUr: "ایف آئی اے سائبر کرائم اور آن لائن فراڈ",
    icon: "💻",
    color: "#6366f1",
    description: "WhatsApp hack, bank OTP phishing scam, online blackmail, fake social media profiles, digital financial theft."
  },
  {
    id: "municipal",
    nameEn: "Municipal, Sanitation & Encroachment",
    nameUr: "بلدیاتی ادارے، صفائی اور تجاوزات",
    icon: "🏙️",
    color: "#06b6d4",
    description: "Garbage dumping (LWMC/KMC), broken roads, open manholes, illegal construction, street lights."
  },
  {
    id: "consumer",
    nameEn: "Consumer Protection & Rights",
    nameUr: "صارفین کے حقوق اور کنزیومر کورٹس",
    icon: "⚖️",
    color: "#8b5cf6",
    description: "Defective electronics, shopkeeper refusing return, price gouging, deficient private hospital/airline service."
  },
  {
    id: "ombudsman",
    nameEn: "Wafaqi Mohtasib & Citizen Portal",
    nameUr: "وفاقی محتسب اور سٹیزن پورٹل",
    icon: "🏛️",
    color: "#14b8a6",
    description: "Escalation against Federal/Provincial departments for maladministration, delays, pension delays, PMDU portal."
  },
  {
    id: "women",
    nameEn: "Women Safety & Harassment (FOSPAH)",
    nameUr: "خواتین کا تحفظ اور انسدادِ ہراسگی",
    icon: "🌸",
    color: "#ec4899",
    description: "Workplace harassment, domestic violence helpline (1091), inheritance denial, women ombudsperson."
  }
];

export const EMERGENCY_HELPLINES = [
  { name: "Police Emergency", number: "15", urduName: "پولیس ایمرجنسی", category: "police", note: "Immediate distress call across Pakistan" },
  { name: "Rescue Emergency", number: "1122", urduName: "ریسکیو 1122", category: "emergency", note: "Ambulance, fire brigade and disaster response" },
  { name: "Women Helpline (Punjab/Federal)", number: "1091", urduName: "خواتین ہیلپ لائن", category: "women", note: "For harassment, violence or emergency aid" },
  { name: "FIA Cybercrime Wing", number: "9911 / 1991", urduName: "ایف آئی اے سائبر کرائم", category: "cybercrime", note: "Report online blackmail, extortion, hacking" },
  { name: "National Human Rights Helpline", number: "1099", urduName: "قومی انسانی حقوق ہیلپ لائن", category: "rights", note: "Ministry of Human Rights legal assistance" },
  { name: "Wafaqi Mohtasib (Federal Ombudsman)", number: "1055", urduName: "وفاقی محتسب ہیلپ لائن", category: "ombudsman", note: "Free complaint against any federal agency" },
  { name: "SNGPL Gas Emergency", number: "1199", urduName: "سوئی ناردرن گیس ایمرجنسی", category: "utilities", note: "Gas leakage and immediate fire hazard" },
  { name: "SSGC Gas Helpline (Sindh/Balochistan)", number: "1199", urduName: "سوئی سدرن گیس ہیلپ لائن", category: "utilities", note: "Gas leakage and low pressure helpline" },
  { name: "K-Electric Helpline (Karachi)", number: "118", urduName: "کے الیکٹرک ہیلپ لائن", category: "utilities", note: "Karachi power breakdown and billing" },
  { name: "LESCO Electricity Helpline (Lahore)", number: "118 / 042-99205461", urduName: "لیسکو بجلی ہیلپ لائن", category: "utilities", note: "Lahore division electricity breakdown" },
  { name: "Banking Mohtasib Pakistan", number: "021-99217334", urduName: "بینکنگ محتسب پاکستان", category: "consumer", note: "Unauthorized banking deduction, ATM card skim" },
  { name: "Child Protection Helpline", number: "1121", urduName: "چائلڈ پروٹیکشن ہیلپ لائن", category: "rights", note: "Protection for runaway, abandoned or abused children" }
];

export const OFFICIAL_PORTALS = [
  {
    title: "Pakistan Citizen's Portal (PMDU)",
    titleUr: "پاکستان سٹیزن پورٹل (وزیراعظم ڈلیوری یونٹ)",
    url: "https://web.citizenportal.gov.pk/",
    desc: "Direct complaint lodging system connected to over 8,900 federal and provincial government offices.",
    badge: "Official Federal Portal"
  },
  {
    title: "Wafaqi Mohtasib (Federal Ombudsman) Online Portal",
    titleUr: "وفاقی محتسب آن لائن شکایات پورٹل",
    url: "https://www.mohtasib.gov.pk/",
    desc: "Free grievance redressal against WAPDA, SNGPL, NADRA, Postal, Passport and all Federal agencies without hiring a lawyer.",
    badge: "Quasi-Judicial Redressal"
  },
  {
    title: "FIA Cybercrime Complaint Cell (NR3C)",
    titleUr: "ایف آئی اے سائبر کرائم رپورٹنگ سیل",
    url: "https://complaint.fia.gov.pk/",
    desc: "National portal to report cyber harassment, WhatsApp compromise, financial phishing, online scams.",
    badge: "Law Enforcement"
  },
  {
    title: "NADRA Pak-ID Portal & App",
    titleUr: "نادرا پاک آئی ڈی پورٹل",
    url: "https://id.nadra.gov.pk/",
    desc: "Online renewal, modification, FRC application, and verification of CNIC/NICOP without queueing.",
    badge: "Civil Registry"
  },
  {
    title: "NEPRA Consumer Complaint Portal",
    titleUr: "نیپرا صارفین شکایات پورٹل",
    url: "https://www.nepra.org.pk/consumer_complaints.php",
    desc: "Appellate body for electricity overbilling, disputed detection bills, transformer delays.",
    badge: "Utility Regulator"
  },
  {
    title: "Punjab Consumer Protection Council (PCPC)",
    titleUr: "پنجاب کنزیومر پروٹیکشن کونسل",
    url: "https://pcpc.punjab.gov.pk/",
    desc: "File complaints before District Consumer Courts for defective goods, zero fee, compensation awards.",
    badge: "Consumer Rights"
  }
];

export const SAMPLE_SCENARIOS = [
  {
    id: "electricity-overbilling",
    titleEn: "Electricity Overbilling & Detection Bill Dispute",
    titleUr: "بجلی کا غیر حقیقی زیادہ بل یا ڈیٹیکشن بل کا تنازعہ",
    category: "utilities",
    userPromptEn: "My electricity bill for this month has jumped to Rs. 75,000 with a bogus 'detection bill' claiming meter tampering. The meter reader never visited, and our regular bill is around Rs. 14,000. How do I challenge this?",
    userPromptUr: "میرے گھر کا بجلی کا بل اچانک 75 ہزار روپے آ گیا ہے اور اس پر بغیر کسی ثبوت کے 'ڈیٹیکشن بل' لگا دیا گیا ہے۔ ہمارا عام بل 14 ہزار آتا ہے۔ میں اس کے خلاف کس طرح قانونی کارروائی کروں؟",
    authorityEn: "Sub-Divisional Officer (SDO) / Executive Engineer (XEN) / NEPRA / Wafaqi Mohtasib",
    authorityUr: "ایس ڈی او / ایکسین (متعلقہ ڈسکوز) / نیپرا کنزیومر فورم / وفاقی محتسب"
  },
  {
    id: "nadra-blocked-cnic",
    titleEn: "NADRA CNIC Blocked or Verification Failure",
    titleUr: "نادرا شناختی کارڈ بلاک ہونا یا بائیومیٹرک کی تصدیق نہ ہونا",
    category: "identity",
    userPromptEn: "NADRA has digitally blocked my CNIC claiming suspected foreign nationality, but all my parents and grandparents have Pakistani CNICs and land records in Gujranwala. My bank account is frozen. What is the official unblocking procedure?",
    userPromptUr: "نادرا نے بغیر کسی ٹھوس وجہ کے میرا شناختی کارڈ بلاک کر دیا ہے جس کی وجہ سے میرا بینک اکاؤنٹ منجمد ہو گیا ہے، حالانکہ میرے والدین اور دادا کی نادرا تصدیق موجود ہے۔ بحالی کا طریقہ کیا ہے؟",
    authorityEn: "NADRA District Level Committee (DLC) / Regional Head Office / Federal Ombudsman",
    authorityUr: "نادرا ڈسٹرکٹ لیول کمیٹی (DLC) / ریجنل ہیڈ آفس / وفاقی محتسب"
  },
  {
    id: "fia-cybercrime-scam",
    titleEn: "Online Financial Fraud / Bank OTP & WhatsApp Scam",
    titleUr: "بینک او ٹی پی فراڈ، آن لائن دھوکہ دہی یا واٹس ایپ ہیکنگ",
    category: "cybercrime",
    userPromptEn: "Someone called claiming to be an army officer verifying my bank account, and withdrew Rs. 180,000 through unauthorized Raast transfer. The bank says it cannot refund. How do I register an urgent case with FIA Cybercrime and State Bank?",
    userPromptUr: "کسی نامعلوم شخص نے جعلی کال کر کے مجھ سے تصدیق کے بہانے کوڈ حاصل کیا اور میرے بینک اکاؤنٹ سے ایک لاکھ اسی ہزار روپے منتقل کر لیے۔ ایف آئی اے سائبر کرائم اور اسٹیٹ بینک میں کیا کارروائی کروں؟",
    authorityEn: "FIA National Response Centre for Cyber Crime (NR3C) & Banking Mohtasib Pakistan",
    authorityUr: "ایف آئی اے نیشنل رسپانس سینٹر فار سائبر کرائم (NR3C) اور بینکنگ محتسب"
  },
  {
    id: "police-refusing-fir",
    titleEn: "Police Station (Thana) Refusing to Register FIR",
    titleUr: "پولیس اسٹیشن (تھانہ) کا ایف آئی آر درج کرنے سے انکار",
    category: "police",
    userPromptEn: "Two armed men snatched my motorcycle and phone at gunpoint in Rawalpindi. The local police station (Thana) refuses to lodge an FIR under Section 392 PPC and is only offering to write a lost report in Roznamcha. What legal action can I take?",
    userPromptUr: "دو مسلح افراد نے مجھ سے اسلحے کے زور پر موٹر سائیکل چھین لی، لیکن تھانے کے محرر اور ایس ایچ او ڈکیتی کی ایف آئی آر کاٹنے سے انکاری ہیں اور صرف گمشدگی کی رپٹ لکھوانے پر زور دے رہے ہیں۔ میرے پاس کیا قانونی راستہ ہے؟",
    authorityEn: "Superintendent of Police (SP) / Ex-Officio Justice of Peace (Sessions Judge) U/S 22-A/22-B CrPC",
    authorityUr: "ایس پی کمپلینٹ سیل / جسٹس آف پیس (سیشن کورٹ) زیر دفعہ 22-A / 22-B ضابطہ فوجداری"
  },
  {
    id: "wasa-sewage-overflow",
    titleEn: "Sanitation & WASA Sewage Flooding Neighborhood",
    titleUr: "سیوریج کا گندا پانی گلیوں میں جمع ہونا اور واسا کی عدم توجہی",
    category: "municipal",
    userPromptEn: "The main sewer line in our residential block has been backed up for 3 weeks. Filthy water is entering homes and causing epidemic diseases. WASA and Town Municipal Administration are not responding to local complaints. How do we escalate?",
    userPromptUr: "ہمارے علاقے میں گزشتہ تین ہفتوں سے سیوریج کی مین لائن بند ہے اور گندہ پانی گلیوں اور گھروں کے اندر داخل ہو رہا ہے۔ واسا دفتر بار بار جانے کے باوجود کوئی شنوائی نہیں کر رہا۔ مؤثر درخواست کس طرح دیں؟",
    authorityEn: "Managing Director WASA / Deputy Commissioner / Provincial Ombudsman (Mohtasib)",
    authorityUr: "مینجنگ ڈائریکٹر واسا / ڈپٹی کمشنر / صوبائی محتسب اعلیٰ"
  },
  {
    id: "consumer-defective-item",
    titleEn: "Consumer Protection – Shopkeeper Refusing Refund for Defective AC",
    titleUr: "ناقص سامان کی واپسی سے دکاندار کا انکار (کنزیومر کورٹ میں کیس)",
    category: "consumer",
    userPromptEn: "I bought an inverter AC for Rs. 165,000 with a 10-year compressor warranty. It broke down in 10 days. The vendor and authorized service center refuse to replace or refund. How do I serve a legal notice and file in Consumer Court?",
    userPromptUr: "میں نے ایک لاکھ پینسٹھ ہزار روپے کا نیا اے سی خریدا جو دس دن بعد ہی خراب ہو گیا۔ کمپنی اور دکاندار وارنٹی کے باوجود نہ ٹھیک کر رہے ہیں نہ رقم واپس دے رہے ہیں۔ کنزیومر کورٹ کے لیے قانونی نوٹس کیسے تیار کروں؟",
    authorityEn: "District Consumer Court & Authority / Consumer Protection Act 2005",
    authorityUr: "ڈسٹرکٹ کنزیومر کورٹ / 15 روزہ قانونی نوٹس بمطابق کنزیومر پروٹیکشن ایکٹ"
  }
];

export const PAKISTAN_LAWS_GUIDE = [
  {
    act: "Right of Access to Information Act, 2017 (Federal & Provincial RTI)",
    actUr: "حقِ معلومات ایکٹ 2017 (آر ٹی آئی)",
    scope: "Grants every citizen the constitutional right (Article 19A) to demand official public records, budgets, tender documents, and pending inquiry files from any government department within 10 to 14 working days.",
    penalty: "Government officer failing to provide information can face fine and departmental disciplinary inquiry by Information Commission."
  },
  {
    act: "Section 154 Code of Criminal Procedure (Cr.P.C) - Mandatory FIR Registration",
    actUr: "دفعہ 154 ضابطہ فوجداری - لازمی اندراج ایف آئی آر",
    scope: "Mandates that whenever information disclosing a cognizable offense (theft, robbery, assault, murder) is given to the officer in charge of a police station, it MUST be recorded into an FIR in prescribed register without delay.",
    penalty: "If police refuse, citizen can petition the Ex-Officio Justice of Peace (Sessions Judge) under Section 22-A / 22-B Cr.P.C for mandatory registration."
  },
  {
    act: "Prevention of Electronic Crimes Act, 2016 (PECA)",
    actUr: "پریوینشن آف الیکٹرانک کرائمز ایکٹ 2016 (پیکا)",
    scope: "Deals with unauthorized access to computer systems, electronic fraud, identity theft, cyberstalking, harassment of women online, and non-consensual dissemination of private images.",
    penalty: "Strict prison sentences ranging from 3 to 14 years and heavy monetary fines enforced by FIA Cybercrime Wing."
  },
  {
    act: "Establishment of the Office of Wafaqi Mohtasib (Ombudsman) Order, 1983",
    actUr: "وفاقی محتسب کا قانون (سرکاری اداروں کی بدانتظامی کے خلاف)",
    scope: "Empowers the Federal Ombudsman to investigate and rectify maladministration, corruption, inordinate delays, and neglect of duty by any Federal Government agency or department.",
    penalty: "Findings are binding on government agencies, requiring compliance reports to be submitted within specified days."
  },
  {
    act: "Provincial Consumer Protection Acts (e.g. Punjab 2005, Sindh 2014, KP 2015)",
    actUr: "کنزیومر پروٹیکشن ایکٹ (صارفین کے حقوق کا تحفظ)",
    scope: "Protects consumers against defective products, misleading advertisements, substandard professional services, and failure to issue warranty or receipt.",
    penalty: "Requires serving a 15-day prior written notice. Consumer Courts can award full product refund, damages, and compensation with no court fees."
  }
];
