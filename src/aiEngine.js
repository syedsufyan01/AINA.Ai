// Project AINA - Intelligent Civic AI Engine
// Combines Domain Knowledge Matrix, Bilingual Heuristics & Optional Gemini LLM API

import { CIVIC_CATEGORIES, EMERGENCY_HELPLINES, OFFICIAL_PORTALS, PAKISTAN_LAWS_GUIDE } from './civicData.js';

export class AinaEngine {
  constructor() {
    this.apiKey = localStorage.getItem('aina_gemini_api_key') || '';
    this.selectedModel = localStorage.getItem('aina_gemini_model') || 'gemini-1.5-flash';
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('aina_gemini_api_key', this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  detectLanguage(text) {
    // Check for Urdu Arabic script unicode range
    const urduRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    if (urduRegex.test(text)) {
      return 'ur';
    }

    // Check for common Roman Urdu patterns
    const romanUrduKeywords = [
      'mera', 'meri', 'mere', 'apna', 'apni', 'bijli', 'pani', 'paani', 'gas', 'bill',
      'masla', 'shikayat', 'darkhwast', 'thana', 'police', ' رشوت', 'pesa', 'paisa',
      'kharab', 'ziada', 'zyada', 'chori', 'dhoka', 'karna', 'karein', 'kare', 'hoga',
      'hogi', 'nahi', 'raha', 'rahi', 'kahan', 'kis', 'tarah', 'kese', 'kaise', 'wala'
    ];
    const words = text.toLowerCase().split(/\s+/);
    const romanMatches = words.filter(w => romanUrduKeywords.includes(w));
    if (romanMatches.length >= 2) {
      return 'roman_ur';
    }

    return 'en';
  }

  // Analyze problem using Backend AI Engine, Gemini API, or Built-in Expert Rule-Engine
  async analyzeCivicIssue(userInput, context = {}) {
    const lang = this.detectLanguage(userInput);

    // 1. Try Backend API first
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-gemini-api-key': this.apiKey } : {})
        },
        body: JSON.stringify({
          input: userInput,
          apiKey: this.apiKey,
          model: this.selectedModel,
          context
        })
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (backendErr) {
      console.warn('Backend /api/ai/diagnose unreachable, using local fallback:', backendErr.message);
    }

    // 2. Direct client-side Gemini call if user entered API key
    if (this.apiKey) {
      try {
        const geminiResult = await this.queryGemini(userInput, lang, context);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('Gemini API call failed or quota exceeded, falling back to AINA Expert Engine:', err);
      }
    }

    // 3. Built-in Expert Cognitive Engine
    return this.expertHeuristicAnalysis(userInput, lang, context);
  }

  // Built-in Expert Domain Analysis
  expertHeuristicAnalysis(input, lang, context = {}) {
    const text = input.toLowerCase();

    let matchedCategory = 'utilities';
    let matchedAuthority = 'Relevant Civic Authority';
    let matchedAuthorityUr = 'متعلقہ مجاز ادارہ';
    let department = 'Public Utilities';
    let severity = 'Medium';
    let legalAct = 'Public Grievance Redressal Regulations';
    let statutoryDays = '15 Days';
    let escalationOfficer = 'Federal / Provincial Ombudsman';

    // Heuristic Classification
    if (
      text.includes('electricity') || text.includes('bijli') || text.includes('lesco') ||
      text.includes('iesco') || text.includes('k-electric') || text.includes('kelectric') ||
      text.includes('fesco') || text.includes('gepco') || text.includes('mepco') ||
      text.includes('pesco') || text.includes('hesco') || text.includes('meter') ||
      text.includes('detection bill') || text.includes('overbilling') || text.includes('bill') ||
      text.includes('gas') || text.includes('sngpl') || text.includes('ssgc') ||
      text.includes('water') || text.includes('wasa') || text.includes('paani')
    ) {
      matchedCategory = 'utilities';
      if (text.includes('gas') || text.includes('sngpl') || text.includes('ssgc')) {
        matchedAuthority = 'Sui Northern Gas Pipelines Limited (SNGPL) / SSGC & OGRA';
        matchedAuthorityUr = 'سوئی ناردرن / سوئی سدرن گیس اور اوگرا (OGRA)';
        department = 'Gas Utility & Consumer Services';
        legalAct = 'Oil and Gas Regulatory Authority (OGRA) Consumer Regulations';
      } else if (text.includes('wasa') || text.includes('water') || text.includes('paani')) {
        matchedAuthority = 'Water and Sanitation Agency (WASA) / Municipal Water Board';
        matchedAuthorityUr = 'واٹر اینڈ سینی ٹیشن ایجنسی (واسا) / واٹر بورڈ';
        department = 'Water Supply & Sewerage Directorate';
        legalAct = 'Local Government & Public Health Engineering Act';
      } else {
        matchedAuthority = 'Electric Power Supply Company (DISCO: LESCO/IESCO/KE) & NEPRA';
        matchedAuthorityUr = 'متعلقہ الیکٹرک پاور ڈسٹری بیوشن کمپنی (لیسکو/آئیسکو/کے الیکٹرک) اور نیپرا';
        department = 'Revenue & Metering Sub-Division';
        legalAct = 'NEPRA Consumer Service Manual (CSM) Chapter 6 & 9';
      }
      severity = text.includes('detection') || text.includes('tampering') ? 'High' : 'Medium';
      statutoryDays = '7 to 15 Days';
      escalationOfficer = 'NEPRA Consumer Affairs / Wafaqi Mohtasib';
    } else if (
      text.includes('nadra') || text.includes('cnic') || text.includes('identity') ||
      text.includes('passport') || text.includes('b-form') || text.includes('frc') ||
      text.includes('biometric') || text.includes('excise') || text.includes('token tax') ||
      text.includes('smart card') || text.includes('شناختی کارڈ') || text.includes('پاسپورٹ')
    ) {
      matchedCategory = 'identity';
      if (text.includes('passport')) {
        matchedAuthority = 'Directorate General of Immigration & Passports (DGI&P)';
        matchedAuthorityUr = 'ڈائریکٹوریٹ جنرل آف امیگریشن اینڈ پاسپورٹس';
        department = 'Regional Passport Office & Incharge Delivery';
        legalAct = 'Passport Act, 1974 & Consular Manual';
      } else if (text.includes('excise') || text.includes('token') || text.includes('vehicle')) {
        matchedAuthority = 'Excise, Taxation & Narcotics Control Department';
        matchedAuthorityUr = 'محکمہ ایکسائز، ٹیکسیشن اینڈ نارکوٹکس کنٹرول';
        department = 'Motor Registration Authority (MRA)';
        legalAct = 'Motor Vehicles Ordinance & Biometric Transfer Rules';
      } else {
        matchedAuthority = 'National Database and Registration Authority (NADRA)';
        matchedAuthorityUr = 'نیشنل ڈیٹا بیس اینڈ رجسٹریشن اتھارٹی (نادرا)';
        department = 'Operations & Verification Wing / District Level Committee (DLC)';
        legalAct = 'NADRA Ordinance, 2000 (Section 18 & 21)';
      }
      severity = text.includes('blocked') || text.includes('frozen') ? 'High' : 'Medium';
      statutoryDays = '14 to 30 Days';
      escalationOfficer = 'Director General NADRA / Federal Ombudsman (Wafaqi Mohtasib)';
    } else if (
      text.includes('cyber') || text.includes('whatsapp') || text.includes('hack') ||
      text.includes('scam') || text.includes('otp') || text.includes('fraud') ||
      text.includes('blackmail') || text.includes('online') || text.includes('bank') ||
      text.includes('raast') || text.includes('easypaisa') || text.includes('jazzcash')
    ) {
      matchedCategory = 'cybercrime';
      matchedAuthority = 'FIA National Response Centre for Cyber Crime (NR3C)';
      matchedAuthorityUr = 'ایف آئی اے نیشنل رسپانس سینٹر فار سائبر کرائم (NR3C)';
      department = 'Cyber Crime Wing & Digital Forensics Unit';
      severity = 'Urgent / High';
      legalAct = 'Prevention of Electronic Crimes Act, 2016 (PECA Section 13, 14, 20, 21)';
      statutoryDays = 'Immediate / 48 Hours for Account Freeze';
      escalationOfficer = 'Additional Director General FIA / Banking Mohtasib Pakistan';
    } else if (
      text.includes('police') || text.includes('fir') || text.includes('thana') ||
      text.includes('chori') || text.includes('theft') || text.includes('snatch') ||
      text.includes('robbery') || text.includes('sho') || text.includes('roznamcha') ||
      text.includes('ایف آئی آر') || text.includes('تھانہ') || text.includes('پولیس')
    ) {
      matchedCategory = 'police';
      matchedAuthority = 'District Police (Station House Officer - SHO & SP Complaints)';
      matchedAuthorityUr = 'متعلقہ ضلعی پولیس (ایس ایچ او، تھانہ و ایس پی کمپلینٹ سیل)';
      department = 'Investigation & Crime Reporting Wing';
      severity = 'Urgent / High';
      legalAct = 'Code of Criminal Procedure (Cr.P.C 1898) Section 154, 22-A & 22-B';
      statutoryDays = 'Immediate (Mandatory within 24 hours under law)';
      escalationOfficer = 'Ex-Officio Justice of Peace (District & Sessions Judge)';
    } else if (
      text.includes('garbage') || text.includes('kura') || text.includes('sewer') ||
      text.includes('gutter') || text.includes('road') || text.includes('encroach') ||
      text.includes('tma') || text.includes('kmc') || text.includes('cda') ||
      text.includes('lda') || text.includes('cantonment') || text.includes('safai')
    ) {
      matchedCategory = 'municipal';
      matchedAuthority = 'Metropolitan Corporation / Development Authority (CDA/LDA/KMC/TMA)';
      matchedAuthorityUr = 'شہری بلدیاتی ادارہ و میونسپل کارپوریشن (KMC / LDA / CDA / کینٹ بورڈ)';
      department = 'Sanitation & Solid Waste Management Directorate';
      severity = 'Medium';
      legalAct = 'Local Government Act & Environmental Protection Regulations';
      statutoryDays = '3 to 7 Days';
      escalationOfficer = 'Deputy Commissioner (DC) / Provincial Ombudsman';
    } else if (
      text.includes('consumer') || text.includes('shop') || text.includes('warranty') ||
      text.includes('refund') || text.includes('return') || text.includes('defective') ||
      text.includes('kharab saman') || text.includes('dukaan') || text.includes('hospital')
    ) {
      matchedCategory = 'consumer';
      matchedAuthority = 'District Consumer Protection Court & Authority';
      matchedAuthorityUr = 'ڈسٹرکٹ کنزیومر پروٹیکشن کورٹ اینڈ اتھارٹی';
      department = 'Consumer Dispute Redressal Tribunal';
      severity = 'Medium';
      legalAct = 'Provincial Consumer Protection Act (Section 13, 15 & 28)';
      statutoryDays = '15 Days Legal Notice Period';
      escalationOfficer = 'District & Sessions Judge presiding Consumer Court';
    } else if (
      text.includes('woman') || text.includes('harass') || text.includes('female') ||
      text.includes('larki') || text.includes('aurat') || text.includes('domestic') ||
      text.includes('fospah') || text.includes('1091')
    ) {
      matchedCategory = 'women';
      matchedAuthority = 'Federal/Provincial Ombudsman for Protection Against Harassment (FOSPAH)';
      matchedAuthorityUr = 'وفاقی و صوبائی محتسب برائے انسدادِ ہراسگی بمقامِ کار (FOSPAH)';
      department = 'Women Grievance & Harassment Redressal Inquiry Committee';
      severity = 'Urgent / High';
      legalAct = 'Protection Against Harassment of Women at the Workplace Act, 2010';
      statutoryDays = '7 to 30 Days';
      escalationOfficer = 'Federal Ombudsperson for Harassment / High Court';
    }

    // Generate Actionable Resolution Roadmap
    const roadmap = this.generateRoadmap(matchedCategory, input, lang);

    // Generate Clarification Questions if context is sparse
    const clarificationQuestions = this.generateClarificationQuestions(matchedCategory, input, lang);

    // Pre-draft Complaint
    const draftEn = this.generateComplaintLetter(matchedCategory, input, 'en');
    const draftUr = this.generateComplaintLetter(matchedCategory, input, 'ur');

    return {
      issueSummaryEn: this.summarizeIssue(input, 'en', matchedCategory),
      issueSummaryUr: this.summarizeIssue(input, 'ur', matchedCategory),
      category: matchedCategory,
      authorityEn: matchedAuthority,
      authorityUr: matchedAuthorityUr,
      department: department,
      severity: severity,
      statutoryDays: statutoryDays,
      legalAct: legalAct,
      escalationOfficer: escalationOfficer,
      roadmap: roadmap,
      clarificationQuestions: clarificationQuestions,
      draftEn: draftEn,
      draftUr: draftUr,
      source: 'AINA Pakistani Civic Intelligence Engine'
    };
  }

  summarizeIssue(input, lang, category) {
    if (lang === 'ur') {
      const summaries = {
        utilities: "بجلی، گیس یا پانی کے بل، میٹر کی جانچ پڑتال اور اوور بلنگ کا تصفیہ۔",
        identity: "شناختی کارڈ، نادرا ڈیٹا بلاکنگ، فنگر پرنٹ کی عدم تصدیق یا پاسپورٹ تاخیر۔",
        cybercrime: "ڈیجیٹل فراڈ، واٹس ایپ یا بینکنگ کوڈ کا استحصال اور سائبر کرائم رپورٹنگ۔",
        police: "تھانے کی سطح پر قانونی رپٹ، گمشدگی یا ضابطہ فوجداری دفعہ 154 کے تحت ایف آئی آر کا اندراج۔",
        municipal: "علاقائی صفائی، سیوریج نظام کی بندش، تجاوزات اور بلدیاتی عملے کی سستی۔",
        consumer: "ناقص مصنوعات، وارنٹی کا انکار اور کنزیومر کورٹ میں قانونی چارہ جوئی۔",
        women: "خواتین کو ہراساں کرنے کے خلاف قانونی تحفظ اور محتسب برائے ہراسگی میں درخواست۔",
        ombudsman: "سرکاری محکموں کی بدانتظامی، غیر ضروری تاخیر اور وفاقی محتسب میں فری شکایت۔"
      };
      return summaries[category] || "عوامی و قانونی مسئلے کی جانچ اور متعلقہ سرکاری فورم کی رہنمائی۔";
    }

    const summaries = {
      utilities: "Dispute regarding utility overbilling, defective metering, or service disruption under NEPRA/OGRA codes.",
      identity: "Civil registration dispute regarding NADRA CNIC block, succession, biometric mismatch, or passport delay.",
      cybercrime: "Unauthorized financial electronic transaction, WhatsApp compromise, or online extortion under PECA 2016.",
      police: "Refusal to register cognizable offense FIR under Cr.P.C Section 154 or lost property entry in police register.",
      municipal: "Sanitation crisis, sewer main blockage, or municipal neglect by regional development authority/TMA.",
      consumer: "Consumer dispute regarding defective product warranty refusal or deficient commercial services.",
      women: "Workplace or public harassment redressal under statutory women protection laws.",
      ombudsman: "Administrative delay or maladministration by federal or provincial government functionaries."
    };
    return summaries[category] || "Resolution of citizen civic problem with designated public authority.";
  }

  generateRoadmap(category, input, lang) {
    if (category === 'utilities') {
      return [
        {
          phaseEn: "Phase 1: Immediate Evidence Preservation",
          phaseUr: "مرحلہ 1: فوری ٹھوس شواہد اور ثبوت جمع کرنا",
          tasksEn: [
            "Capture a clear, timestamped photograph of your physical electricity/gas meter dial showing the current reading and meter serial number.",
            "Compare the physical reading with the 'Present Reading' printed on the bill to calculate the exact difference in units.",
            "Make copies of the last 6 months' paid bills showing historical consumption and proof of consistent timely payments."
          ],
          tasksUr: [
            "اپنے فزیکل میٹر کے ڈائل کی واضح تصویر تاریخ اور وقت کے ساتھ بنائیں جس میں موجودہ ریڈنگ اور میٹر نمبر صاف نظر آئے۔",
            "میٹر کی موجودہ ریڈنگ کا موازنہ بل پر درج 'Present Reading' سے کریں تاکہ اضافی یونٹس کا فوری حساب لگایا جا سکے۔",
            "گزشتہ 6 ماہ کے ادا شدہ بلوں کی نقول اپنے پاس رکھیں جو باقاعدہ ادائیگی کا ثبوت فراہم کرتی ہیں۔"
          ]
        },
        {
          phaseEn: "Phase 2: Formal Lodgment with Sub-Divisional Officer (SDO)",
          phaseUr: "مرحلہ 2: متعلقہ ایس ڈی او (SDO) کے دفتر میں تحریری درخواست جمع کروانا",
          tasksEn: [
            "Submit our drafted formal application addressed to the Sub-Divisional Officer (SDO) of your distribution division (e.g., LESCO/IESCO/KE).",
            "CRITICAL: Always obtain a stamped 'Diary Number / Receiving Receipt' (ڈائری نمبر) on your photocopy. Never leave without acknowledgment.",
            "Request an interim order or bill freeze on the disputed portion while the inquiry is conducted so your connection is not disconnected."
          ],
          tasksUr: [
            "ہمارے تیار کردہ فارمیٹ کے مطابق اپنے متعلقہ ڈویژن کے ایس ڈی او (SDO) صاحب کے نام تحریری درخواست جمع کروائیں۔",
            "اہم ترین ہدایت: اپنی کاپی پر دفتر کی مہر اور 'ڈائری نمبر / وصولی کی رسید' لازماً حاصل کریں۔ زبانی یقین دہانی پر مت جائیں۔",
            "تحقیقات مکمل ہونے تک متنازعہ رقم کے بل پر سٹے یا تعطل کی تحریری درخواست کریں تاکہ کنکشن نہ کاٹا جائے۔"
          ]
        },
        {
          phaseEn: "Phase 3: Statutory Regulatory Escalation (NEPRA / OGRA)",
          phaseUr: "مرحلہ 3: ریگولیٹری ادارے (نیپرا / اوگرا) میں قانونی اپیل",
          tasksEn: [
            "If the SDO does not resolve the discrepancy within 7 working days, file an online appeal on the NEPRA Consumer Complaints Cell (nepra.org.pk).",
            "Quote NEPRA Consumer Service Manual Chapter 6 (Disputed Billing) which prohibits DISCOs from arbitrarily charging detection bills without testing by an independent laboratory.",
            "Lodge a duplicate ticket on the Prime Minister's Citizen Portal (PMDU) tagging the Secretary, Ministry of Energy (Power Division)."
          ],
          tasksUr: [
            "اگر ایس ڈی او 7 دفتری ایام میں مسئلہ حل نہ کرے تو فوری نیپرا کنزیومر پورٹل پر آن لائن شکایت درج کریں۔",
            "نیپرا کنزیومر سروس مینوئل چیپٹر 6 کا حوالہ دیں جس کی رو سے بغیر لیب ٹیسٹنگ صارف پر یکطرفہ ڈیٹیکشن بل لگانا غیر قانونی ہے۔",
            "پاکستان سٹیزن پورٹل (PMDU) پر سیکرٹری پاور ڈویژن کو ٹیگ کر کے متوازی کمپلینٹ درج کروائیں۔"
          ]
        },
        {
          phaseEn: "Phase 4: Quasi-Judicial Redressal at Wafaqi Mohtasib",
          phaseUr: "مرحلہ 4: وفاقی محتسب (وفاقی محتسب اعلیٰ) میں باقاعدہ کیس دائر کرنا",
          tasksEn: [
            "File a complaint under Establishment of the Office of Wafaqi Mohtasib Order 1983. It is 100% free; no lawyer or court fee is needed.",
            "The Federal Ombudsman summons the XEN/Chief Executive of the electric company and issues legally binding orders within 45 to 60 days.",
            "Over 92% of unfair detection and overbilling cases are decided in favor of the consumer at the Ombudsman forum."
          ],
          tasksUr: [
            "وفاقی محتسب میں 'بدانتظامی اور اضافی بلنگ' کے خلاف درخواست دائر کریں۔ اس کے لیے وکیل یا فیس کی بالکل ضرورت نہیں ہوتی۔",
            "وفاقی محتسب متعلقہ ڈسکوز کے چیف ایگزیکٹو کو طلب کر کے 45 سے 60 دن کے اندر حتمی پابند فیصلہ صادر کرتا ہے۔",
            "وفاقی محتسب کے فورم پر 92 فیصد سے زائد مقدمات میں اضافی بل منسوخ کر کے درست میٹر ریڈنگ کے مطابق بلنگ کا حکم دیا جاتا ہے۔"
          ]
        }
      ];
    }

    if (category === 'identity') {
      return [
        {
          phaseEn: "Phase 1: Verification & Category Identification",
          phaseUr: "مرحلہ 1: بلاک ہونے کی قسم اور وجہ معلوم کرنا",
          tasksEn: [
            "Visit the nearest NADRA Mega Center or Executive NRC and request a 'Digital Status & Token Slip' to ascertain if the block is under Routine Verification, Court Order, or Joint Verification Committee (JVC).",
            "Gather ancestral documentary lineage: Father's CNIC, Grandfather's National Identity / 1973 Electoral Roll / Pre-1978 Land Registry (Fard) / Matriculation certificate."
          ],
          tasksUr: [
            "قریبی نادرا میگا سینٹر سے 'ڈیجیٹل اسٹیٹس رپورٹ' حاصل کریں تاکہ معلوم ہو کہ کارڈ معمول کی تصدیق میں رکا ہے یا جوائنٹ ویری فکیشن کمیٹی کے پاس ہے۔",
            "خاندانی دستاویزات جمع کریں: والد اور دادا کا شناختی ریکارڈ، 1973 یا پرانی انتخابی فہرست، 1978 سے قبل کا زرعی ریکارڈ (فرد) یا تعلیمی اسناد۔"
          ]
        },
        {
          phaseEn: "Phase 2: Appearance before District Level Committee (DLC)",
          phaseUr: "مرحلہ 2: ڈسٹرکٹ لیول کمیٹی (DLC) کے روبرو پیشی",
          tasksEn: [
            "Submit a formal unblocking application along with the Family Registration Certificate (FRC) by Birth.",
            "Request a hearing date before the District Level Committee chaired by the Deputy Commissioner / Additional Deputy Commissioner with NADRA representative.",
            "Present two verified family blood relatives (Brother, Uncle, Father) with active biometric CNICs as biological witnesses."
          ],
          tasksUr: [
            "خاندانی رجسٹریشن سرٹیفکیٹ (FRC) کے ہمراہ شناختی کارڈ کی بحالی کی باقاعدہ درخواست جمع کروائیں۔",
            "ڈپٹی کمشنر کی زیر صدارت قائم ڈسٹرکٹ لیول کمیٹی کے روبرو پیشی کی تاریخ حاصل کریں۔",
            "خون کے رشتے داروں (باپ، بھائی، چچا) کو اصل شناختی کارڈ کے ساتھ بطور گواہ پیش کریں۔"
          ]
        },
        {
          phaseEn: "Phase 3: Formal Representation to DG Operations NADRA & Ombudsman",
          phaseUr: "مرحلہ 3: ڈی جی آپریشنز نادرا اور وفاقی محتسب سے رجوع",
          tasksEn: [
            "If the DLC delays beyond 30 days, dispatch a registered legal representation to the Director General (Operations), NADRA Headquarters, Islamabad.",
            "Simultaneously file a complaint before the Federal Ombudsman (Wafaqi Mohtasib) under Article 9 of the 1983 Order for arbitrary deprivation of citizenship identity without due process.",
            "In extreme delays, file a Writ Petition (Article 199) before the High Court citing violation of Fundamental Human Rights (Article 9 & 14 of the Constitution)."
          ],
          tasksUr: [
            "اگر 30 دن تک کمیٹی فیصلہ نہ کرے تو ڈائریکٹر جنرل آپریشنز نادرا ہیڈ کوارٹر اسلام آباد کو رجسٹرڈ درخواست بھیجیں۔",
            "بیک وقت وفاقی محتسب کے پاس نادرا کی سست روی اور بلاوجہ کارڈ بلاک رکھنے کے خلاف مقدمہ دائر کریں۔",
            "شدید تاخیر کی صورت میں ہائیکورٹ میں آئین کے آرٹیکل 199 کے تحت بنیادی انسانی حقوق کی خلاف ورزی کی رٹ پٹیشن دائر کی جا سکتی ہے۔"
          ]
        }
      ];
    }

    if (category === 'cybercrime') {
      return [
        {
          phaseEn: "Phase 1: Emergency Financial & Account Containment (First 2 Hours)",
          phaseUr: "مرحلہ 1: فوری اکاونٹ و مالیاتی تحفظ (پہلے 2 گھنٹے)",
          tasksEn: [
            "Call your bank's 24/7 emergency helpline immediately. Request an emergency freeze on your Raast ID, debit/credit cards, and digital banking access.",
            "Take complete screenshots of fraudulent SMS, transaction alert messages, caller phone number, and beneficiary account/IBAN details.",
            "If WhatsApp is hijacked, send an email to support@whatsapp.com with subject: 'Lost/Stolen: Please deactivate my account' mentioning your phone number in full international format (+92...)."
          ],
          tasksUr: [
            "اپنے بینک کی ہیلپ لائن پر فوری کال کر کے اپنا بینک اکاؤنٹ، راستہ آئی ڈی اور اے ٹی ایم کارڈ ہنگامی طور پر بلاک کروائیں۔",
            "تمام فراڈ میسجز، کالر کے فون نمبر، اور جس اکاؤنٹ میں رقم منتقل ہوئی اس کے سکرین شاٹس اور بینک ٹرانزیکشن سلپ محفوظ کریں۔",
            "اگر واٹس ایپ ہیک ہوا ہے تو فوری support@whatsapp.com پر ای میل بھیجیں اور اپنا نمبر انٹرنیشنل فارمیٹ (+92...) کے ساتھ لکھ کر فوری ڈی ایکٹیویشن مانگیں۔"
          ]
        },
        {
          phaseEn: "Phase 2: Formal Lodgment with FIA Cybercrime Wing (NR3C)",
          phaseUr: "مرحلہ 2: ایف آئی اے نیشنل ریسپانس سینٹر فار سائبر کرائم میں رپورٹ",
          tasksEn: [
            "Visit the official portal at complaint.fia.gov.pk or visit the nearest FIA Cyber Crime Reporting Center in person.",
            "Lodge the complaint under Sections 13, 14, 20 & 21 of the Prevention of Electronic Crimes Act (PECA 2016).",
            "Attach transaction receipts, mobile call logs, and written application with your CNIC copy. Obtain the official FIA tracking inquiry number."
          ],
          tasksUr: [
            "ایف آئی اے کے سرکاری پورٹل complaint.fia.gov.pk پر جائیں یا قریبی ایف آئی اے سائبر کرائم رپورٹنگ سینٹر خود تشریف لے جائیں۔",
            "پریوینشن آف الیکٹرانک کرائمز ایکٹ (پیکا 2016) کی دفعات 13 اور 14 کے تحت باقاعدہ تحریری شکایت درج کروائیں۔",
            "بینک سٹیٹمنٹ، کال ریکارڈ اور شناختی کارڈ کی کاپی منسلک کر کے ایف آئی اے کا انکوائری ٹریکنگ نمبر حاصل کریں۔"
          ]
        },
        {
          phaseEn: "Phase 3: Banking Mohtasib Dispute for Unauthorized Transactions",
          phaseUr: "مرحلہ 3: بینکنگ محتسب پاکستان میں غیر مجاز کٹوتی کا کیس",
          tasksEn: [
            "Submit a formal written dispute to your bank's Grievance Redressal / Fraud Monitoring Unit. Under State Bank of Pakistan (SBP) rules, the bank must investigate within 30 days.",
            "If the bank refuses compensation despite lack of 2-factor authentication safeguards, submit a free complaint to the Banking Mohtasib Pakistan (bankingmohtasib.gov.pk).",
            "The Banking Mohtasib routinely orders commercial banks to reimburse victims when security protocol loopholes are proven."
          ],
          tasksUr: [
            "اپنے بینک کے فراڈ مانیٹرنگ یونٹ کو تحریری درخواست دیں؛ اسٹیٹ بینک آف پاکستان کے قوانین کے مطابق بینک 30 دن میں جواب دینے کا پابند ہے۔",
            "اگر بینک ذمہ داری لینے سے انکار کرے تو بینکنگ محتسب پاکستان (bankingmohtasib.gov.pk) میں شکایت دائر کریں۔",
            "بینکنگ محتسب سیکیورٹی اور او ٹی پی تصدیق میں غفلت ثابت ہونے پر متاثرہ شہری کی رقم واپس دلوانے کا حکم دیتا ہے۔"
          ]
        }
      ];
    }

    if (category === 'police') {
      return [
        {
          phaseEn: "Phase 1: Written Application Submission at Police Station (Thana)",
          phaseUr: "مرحلہ 1: متعلقہ تھانے میں قانونی درخواست پیش کرنا",
          tasksEn: [
            "Prepare our drafted written application addressed to the Station House Officer (SHO) clearly narrating Date, Time, Place of Occurrence, Weapon/Force used, and Stolen items with IMEI/chassis numbers.",
            "Present the application to the Muharrir (محصول دار / محرر) or SHO. Under Section 154 Cr.P.C, registering an FIR for a cognizable offense is mandatory by law.",
            "Insist on an acknowledgment copy with official stamp and Entry Number (رپٹ نمبر). Do not accept an informal verbal promise."
          ],
          tasksUr: [
            "ہمارے تیار کردہ فارمیٹ کے مطابق ایس ایچ او کے نام تحریری درخواست دیں جس میں تاریخ، وقت، جائے وقوعہ، اور مسروقہ سامان کا مکمل اندراج ہو۔",
            "تھانے کے محرر یا ایس ایچ او کے روبرو پیش کریں۔ ضابطہ فوجداری کی دفعہ 154 کے تحت قابل دست اندازی پولیس جرم کی ایف آئی آر کاٹنا پولیس پر قانوناً لازم ہے۔",
            "تھانے سے اپنی کاپی پر دفتری مہر اور رپٹ نمبر حاصل کریں۔ محض زبانی تسلی پر واپس نہ آئیں۔"
          ]
        },
        {
          phaseEn: "Phase 2: Escalation to District Police Officer / SP Complaint Cell",
          phaseUr: "مرحلہ 2: ایس پی کمپلینٹ سیل / ڈسٹرکٹ پولیس آفیسر کو درخواست",
          tasksEn: [
            "If the SHO refuses to lodge the FIR or demands gratification/bribes, visit the Office of the Superintendent of Police (SP) or CPO/DPO Complaints Cell.",
            "Submit a certified application regarding 'Police Refusal to Enter FIR' along with the stamped copy of your first application.",
            "The SP Complaints Cell conducts open hearings and directs the SHO under Police Order 2002."
          ],
          tasksUr: [
            "اگر ایس ایچ او ایف آئی آر درج نہ کرے، تو فوری طور پر ضلعی پولیس آفیسر (DPO) یا ایس پی کمپلینٹ سیل تشریف لے جائیں۔",
            "تھانے کی وصول شدہ درخواست کی کاپی کے ہمراہ ایس ایچ او کے انکار کے خلاف باقاعدہ درخواست دیں۔",
            "پولیس آرڈر 2002 کے تحت ایس پی کمپلینٹ سیل ایس ایچ او کو طلب کر کے مقدمہ درج کرنے کا پابند بناتا ہے۔"
          ]
        },
        {
          phaseEn: "Phase 3: Petition to Ex-Officio Justice of Peace (Section 22-A & 22-B Cr.P.C)",
          phaseUr: "مرحلہ 3: سیشن کورٹ میں جسٹس آف پیس (22-A / 22-B) کی درخواست",
          tasksEn: [
            "File a petition under Section 22-A & 22-B of the Criminal Procedure Code before the District & Sessions Judge / Ex-Officio Justice of Peace.",
            "The honorable Judge issues a direct notice to the SHO summoning the Daily Diary (Roznamcha) within 3 to 7 days.",
            "Upon finding that a cognizable offense is disclosed, the Justice of Peace passes a binding judicial order commanding the SHO to register the FIR forthwith."
          ],
          tasksUr: [
            "ڈسٹرکٹ اینڈ سیشن جج / جسٹس آف پیس کی عدالت میں ضابطہ فوجداری کی دفعہ 22-A اور 22-B کے تحت رٹ دائر کریں۔",
            "معزز جج صاحب تھانے کے ایس ایچ او کو 3 سے 7 دن میں روزنامچے سمیت جواب داخل کرنے کا سمن جاری کرتے ہیں۔",
            "جرم کے عناصر واضح ہونے پر عدالت ایس ایچ او کو فوری طور پر ایف آئی آر درج کر کے رپورٹ پیش کرنے کا قانونی حکم صادر فرماتی ہے۔"
          ]
        }
      ];
    }

    // Default Civic / Municipal / Consumer roadmap
    return [
      {
        phaseEn: "Phase 1: Verification & Evidence Gathering",
        phaseUr: "مرحلہ 1: شواہد اور دستاویزی ثبوت جمع کرنا",
        tasksEn: [
          "Document photos, video evidence, written receipts, and exact location coordinates of the civic failure.",
          "Identify the exact jurisdictional government department responsible for this specific territory."
        ],
        tasksUr: [
          "مقام کی تصاویر، ویڈیوز اور تمام رسیدیں محفوظ کریں تاکہ متعلقہ ادارے کے سامنے ناقابل تردید ثبوت موجود ہو۔",
          "اس علاقے کے مجاز سرکاری ادارے کی باقاعدہ نشاندہی کریں۔"
        ]
      },
      {
        phaseEn: "Phase 2: Formal Written Submission with Diary Number",
        phaseUr: "مرحلہ 2: باقاعدہ دفتری وصولی کے ساتھ درخواست جمع کروانا",
        tasksEn: [
          "Deliver the drafted application to the head of the municipal/civic office and obtain a signed diary entry.",
          "Submit a parallel ticket on the Pakistan Citizen's Portal (PMDU) app for digital civil audit tracking."
        ],
        tasksUr: [
          "ہمارے تیار کردہ ڈرافٹ کے ہمراہ متعلقہ افسر کو درخواست پیش کریں اور وصولی کا ڈائری نمبر حاصل کریں۔",
          "پاکستان سٹیزن پورٹل موبائل ایپ پر متوازی کمپلینٹ درج کریں تاکہ پیش رفت کا ریکارڈ رہے گا۔"
        ]
      },
      {
        phaseEn: "Phase 3: Escalation to District Ombudsman / Legal Notice",
        phaseUr: "مرحلہ 3: متعلقہ محتسب یا کنزیومر کورٹ کو قانونی نوٹس",
        tasksEn: [
          "If neglected for 15 days, invoke statutory grievance redressal through the Provincial Ombudsman or District Consumer Protection Court.",
          "Serve a 15-day formal legal notice under the relevant Provincial Consumer Protection Act."
        ],
        tasksUr: [
          "15 دن میں مسئلہ حل نہ ہونے کی صورت میں صوبائی محتسب یا ڈسٹرکٹ کنزیومر پروٹیکشن کورٹ سے رجوع کریں۔",
          "متعلقہ قانون کے تحت 15 روزہ تحریری نوٹس بذریعہ رجسٹرڈ ڈاک ارسال کریں۔"
        ]
      }
    ];
  }

  generateClarificationQuestions(category, input, lang) {
    const isUr = lang === 'ur' || lang === 'roman_ur';

    if (category === 'utilities') {
      return [
        {
          id: 'disco',
          labelEn: 'Which electricity/gas distribution company supplies your area?',
          labelUr: 'آپ کے علاقے میں بجلی یا گیس فراہم کرنے والی کمپنی کون سی ہے؟',
          options: ['LESCO (Lahore)', 'IESCO (Islamabad/Rawalpindi)', 'K-Electric (Karachi)', 'FESCO / MEPCO / GEPCO', 'SNGPL (Gas North)', 'SSGC (Gas South)']
        },
        {
          id: 'refNo',
          labelEn: 'Do you have your 14-digit Consumer Reference Number handy?',
          labelUr: 'کیا آپ کے پاس بل پر درج 14 ہندسوں پر مشتمل ریفرنس نمبر موجود ہے؟',
          options: ['Yes, ready with me', 'Need to check bill', 'New meter applicant']
        },
        {
          id: 'status',
          labelEn: 'Have you already spoken to the local SDO / Revenue Officer?',
          labelUr: 'کیا آپ نے پہلے ہی مقامی ایس ڈی او یا ریونیو دفتر میں زبانی یا تحریری بات کی ہے؟',
          options: ['Not visited yet', 'Visited but refused help', 'Received notice / fine']
        }
      ];
    }

    if (category === 'police') {
      return [
        {
          id: 'thana',
          labelEn: 'Have you formally visited the local police station (Thana)?',
          labelUr: 'کیا آپ متعلقہ تھانے جا کر محرر یا ایس ایچ او سے ملاقات کر چکے ہیں؟',
          options: ['Yes, police refused to register FIR', 'Only entered Roznamcha', 'Have not visited yet']
        },
        {
          id: 'nature',
          labelEn: 'What was the nature of the incident?',
          labelUr: 'واقعے کی نوعیت کیا تھی؟',
          options: ['Armed snatching / Robbery', 'Theft / Burglary', 'Cheating / Fraud', 'Physical assault / Threats']
        }
      ];
    }

    if (category === 'cybercrime') {
      return [
        {
          id: 'fraud_type',
          labelEn: 'What type of cyber incident occurred?',
          labelUr: 'سائبر واقعے کی نوعیت کیا ہے؟',
          options: ['Bank OTP / Raast unauthorized transfer', 'WhatsApp account takeover', 'Online blackmail / Harassment', 'Fake online store scam']
        },
        {
          id: 'bank_freeze',
          labelEn: 'Have you called your bank helpline to freeze your account/cards?',
          labelUr: 'کیا آپ نے اپنے بینک کو کال کر کے اکاؤنٹ یا کارڈز ہنگامی طور پر منجمد کروائے ہیں؟',
          options: ['Yes, already frozen', 'Not yet, will do immediately', 'No bank involved']
        }
      ];
    }

    return [
      {
        id: 'city',
        labelEn: 'Which city/district does this issue pertain to?',
        labelUr: 'یہ مسئلہ کس شہر یا ضلع سے متعلق ہے؟',
        options: ['Islamabad / ICT', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar', 'Quetta', 'Other District']
      },
      {
        id: 'prev_complaint',
        labelEn: 'Have you lodged a complaint on the Pakistan Citizen Portal (PMDU)?',
        labelUr: 'کیا آپ پہلے ہی پاکستان سٹیزن پورٹل پر شکایت درج کر چکے ہیں؟',
        options: ['Yes, pending without response', 'No, not registered yet']
      }
    ];
  }

  // Generates formal complaint letter suitable for submission to Pakistani government offices
  generateComplaintLetter(category, input, lang = 'en') {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const todayUr = new Date().toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' });

    if (lang === 'ur') {
      return this.generateUrduComplaint(category, input, todayUr);
    }
    return this.generateEnglishComplaint(category, input, today);
  }

  generateEnglishComplaint(category, input, dateStr) {
    if (category === 'utilities') {
      return {
        recipientTitle: "The Sub-Divisional Officer (SDO) / Executive Engineer (XEN)",
        recipientDept: "Relevant Power Distribution Company (DISCO) / Revenue Office",
        recipientAddress: "Sub-Division Office, Pakistan",
        subject: "APPLICATION FOR IMMEDIATE RECTIFICATION OF ERRONEOUS BILLING & CANCELLATION OF UNJUSTIFIED DETECTION CHARGES",
        applicantName: "[Your Full Legal Name]",
        applicantCnic: "[Your 13-Digit CNIC: 00000-0000000-0]",
        applicantAddress: "[Your Complete Residential Address, City]",
        applicantPhone: "[03XX-XXXXXXX]",
        referenceId: "[14-Digit Consumer Reference No.]",
        bodyParagraphs: [
          `1. Respectfully submitted that the applicant is a lawful, law-abiding consumer of electricity/gas bearing Consumer Reference No. [Insert Reference No.], residing at the address mentioned above.`,
          `2. That the applicant has consistently and punctually cleared all electricity dues in accordance with genuine consumption over past months, maintaining a clean payment history.`,
          `3. That to the applicant's utmost shock and dismay, the bill issued for the current billing cycle contains an exorbitant, unrealistic billing amount including an arbitrary 'Detection Bill / Tampering' penalty without any physical inspection in applicant's presence or testing by an independent laboratory.`,
          `4. That under the binding NEPRA Consumer Service Manual (CSM) Chapter 6 and Chapter 9, a Distribution Company is legally prohibited from charging arbitrary detection units without strictly following due procedure, providing prior notice, and serving a preliminary show-cause opportunity.`,
          `5. That the actual physical meter reading on site as of today stands at [Insert Physical Meter Reading Units], which is in stark contradiction to the erroneous reading printed on the disputed bill.`
        ],
        prayerClause: `WHEREFORE, it is most respectfully prayed that your good office may graciously be pleased to:
a) Grant an interim freeze / stay on the recovery of the disputed excessive amount and direct that applicant's connection shall not be severed pending inquiry;
b) Order an immediate site inspection by an authorized revenue inspector in the applicant's presence;
c) Revise the bill strictly in accordance with actual meter reading as verified on site and withdraw the arbitrary detection charges.`,
        closing: "Yours obediently,",
        date: dateStr
      };
    }

    if (category === 'police') {
      return {
        recipientTitle: "The Station House Officer (SHO)",
        recipientDept: "Police Station [Insert Thana Name], District [Insert City]",
        recipientAddress: "Police Department, Government of Pakistan",
        subject: "APPLICATION FOR REGISTRATION OF FIRST INFORMATION REPORT (FIR) UNDER SECTION 154 Cr.P.C FOR COGNIZABLE OFFENSE",
        applicantName: "[Your Full Legal Name]",
        applicantCnic: "[Your 13-Digit CNIC: 00000-0000000-0]",
        applicantAddress: "[Your Residential Address, City]",
        applicantPhone: "[03XX-XXXXXXX]",
        referenceId: "[Police Diary / Roznamcha No. if any]",
        bodyParagraphs: [
          `1. Respectfully submitted that the applicant is a respectable citizen of Pakistan residing at the aforementioned address.`,
          `2. That on [Insert Date of Incident] at approximately [Insert Time: e.g. 08:30 PM], the applicant was present at [Insert Exact Location / Street, City].`,
          `3. That at said time and place, [Insert Number of Culprits, e.g. two unknown armed persons on a motorcycle] intercepted the applicant, threatened applicant with deadly weapons, and forcibly deprived applicant of [Insert Stolen Articles: Motorcycle, Mobile Phone IMEI: XXXXXXX, Cash Rs. XX,XXX, Original CNIC].`,
          `4. That the incident was witnessed by [Insert Names of Witnesses / Local Shopkeepers if available] who can verify the occurrence.`,
          `5. That under Section 154 of the Code of Criminal Procedure (Cr.P.C), the officer in charge of a police station is legally and statutorily bound to reduce information disclosing a cognizable offense into writing and register an FIR without delay.`
        ],
        prayerClause: `PRAYER:
In view of the above circumstances, it is most respectfully prayed that an FIR against the accused persons under the relevant sections of the Pakistan Penal Code (PPC) be registered immediately, investigation be entrusted to an honest officer, and every effort be made for the recovery of snatched articles and apprehension of culprits.`,
        closing: "Yours faithfully,",
        date: dateStr
      };
    }

    if (category === 'cybercrime') {
      return {
        recipientTitle: "The Incharge / Deputy Director",
        recipientDept: "FIA National Response Centre for Cyber Crime (NR3C)",
        recipientAddress: "Federal Investigation Agency (FIA), Regional Office, Pakistan",
        subject: "FORMAL COMPLAINT UNDER PREVENTION OF ELECTRONIC CRIMES ACT (PECA) 2016 FOR UNAUTHORIZED ELECTRONIC TRANSACTION & FINANCIAL FRAUD",
        applicantName: "[Your Full Legal Name]",
        applicantCnic: "[Your 13-Digit CNIC: 00000-0000000-0]",
        applicantAddress: "[Your Address, City]",
        applicantPhone: "[03XX-XXXXXXX]",
        referenceId: "[Bank Transaction ID / Disputed IBAN]",
        bodyParagraphs: [
          `1. That the applicant is an account holder at [Bank Name], maintaining Account/IBAN: [Insert Account Number].`,
          `2. That on [Insert Date], the applicant received deceptive communication from mobile phone number [Insert Culprit Phone Number] falsely impersonating bank/security officials.`,
          `3. That an unauthorized electronic transfer of Rs. [Insert Amount] was fraudulently initiated and debited from applicant's account without applicant's lawful consent or authorization, transferred into beneficiary account [Insert Beneficiary Account / Raast ID if known].`,
          `4. That applicant immediately contacted the bank's helpline to dispute the transaction and place an emergency freeze on the account.`,
          `5. That the acts of the perpetrator squarely fall within the ambit of Section 13 (Electronic Forgery), Section 14 (Electronic Fraud), and Section 16 (Unauthorized use of identity information) of PECA 2016.`
        ],
        prayerClause: `PRAYER:
It is earnestly requested that:
a) An inquiry under PECA 2016 be initiated against the holder of the recipient account/wallet and caller MSISDN;
b) The recipient account be frozen immediately through SBP/commercial bank liaisons to preserve the stolen funds;
c) The fraudulently debited amount be reversed and returned to the applicant.`,
        closing: "Applicant,",
        date: dateStr
      };
    }

    // Default Civic / Consumer complaint
    return {
      recipientTitle: "The Presiding Officer / Incharge",
      recipientDept: "Relevant Civic Authority / Consumer Protection Forum",
      recipientAddress: "District Office, Pakistan",
      subject: "FORMAL APPLICATION FOR STATUTORY REDRESSAL OF CIVIC GRIEVANCE & URGENT INTERVENTION",
      applicantName: "[Your Full Legal Name]",
      applicantCnic: "[Your 13-Digit CNIC: 00000-0000000-0]",
      applicantAddress: "[Your Address, City]",
      applicantPhone: "[03XX-XXXXXXX]",
      referenceId: "[Application / Case Reference]",
      bodyParagraphs: [
        `1. That the applicant is a bona fide resident/consumer of the area, paying all requisite municipal and public charges regularly.`,
        `2. That the public problem detailed as: "${input.substring(0, 150)}..." has persisted for several days/weeks, causing immense hardship, public hazard, and financial disruption.`,
        `3. That despite verbal representations to local field staff, no remedial action has been instituted so far.`,
        `4. That under the relevant public service charters and administrative law, the citizen has a fundamental right to timely redressal and protection of health, property, and civic amenities.`
      ],
      prayerClause: `PRAYER:
It is respectfully prayed that your good office issue urgent directions for immediate inspection and remediation of the problem, and order departmental inquiry into the negligence of responsible field functionaries.`,
      closing: "Respectfully submitted,",
      date: dateStr
    };
  }

  generateUrduComplaint(category, input, dateStr) {
    if (category === 'utilities') {
      return {
        recipientTitle: "بخدمت جناب ایس ڈی او (SDO) صاحب / ایکسین (XEN) صاحب",
        recipientDept: "متعلقہ الیکٹرک پاور سپلائی کمپنی (لیسکو / آئیسکو / کے الیکٹرک وغیرہ)",
        recipientAddress: "متعلقہ سب ڈویژن، پاکستان",
        subject: "درخواست برائے منسوخی غیر منصفانہ ڈیٹیکشن بل و درستگی میٹر ریڈنگ",
        applicantName: "[آپ کا مکمل قانونی نام]",
        applicantCnic: "[شناختی کارڈ نمبر: 0-0000000-00000]",
        applicantAddress: "[رہائشی پتہ، شہر]",
        applicantPhone: "[03XX-XXXXXXX]",
        referenceId: "[14 ہندسوں پر مشتمل ریفرنس نمبر]",
        bodyParagraphs: [
          `جناب عالی! نہایت ادب سے گزارش ہے کہ سائل متذکرہ بالا پتے پر رہائش پذیر ایک باقاعدہ صارف ہے جس کا بجلی کنکشن کا ریفرنس نمبر [یہاں ریفرنس نمبر درج کریں] ہے۔`,
          `یہ کہ سائل ماضی میں ہمیشہ اپنے تمام بلات بروقت اور باقاعدگی سے ادا کرتا رہا ہے اور سائل کے ذمہ کوئی بقایا جات نہ ہیں۔`,
          `یہ کہ موجودہ ماہ کا بل سائل کو موصول ہوا جس میں بغیر کسی معائنہ، بغیر کسی ثبوت اور بغیر کسی پیشگی قانونی نوٹس کے بھاری رقم بطور 'ڈیٹیکشن بل' شامل کر دی گئی ہے جو کہ حقیقت اور انصاف کے قطعی برعکس ہے۔`,
          `یہ کہ نیپرا کنزیومر سروس مینوئل (CSM) کے چیپٹر 6 اور 9 کے تحت بغیر آزادانہ لیبارٹری ٹیسٹنگ اور صارف کی موجودگی کے ڈیٹیکشن بل لگانا سراسر غیر قانونی ہے۔`,
          `یہ کہ اس وقت سائل کے فزیکل میٹر پر موجود اصل ریڈنگ [اصل میٹر ریڈنگ درج کریں] ہے، جبکہ بل پر غلط اور من گھڑت ریڈنگ درج کی گئی ہے۔`
        ],
        prayerClause: `استدعا:
لہٰذا سائل نہایت ادب سے ملتمس ہے کہ:
الف) متنازعہ بل پر فوری حکمِ امتناعی (Stay) دیا جائے تاکہ سائل کا کنکشن منقطع نہ ہو؛
ب) موقع پر کسی مجاز انسپکٹر کو بھیج کر اصل میٹر ریڈنگ کی تصدیق کروائی جائے؛
ج) غیر قانونی ڈیٹیکشن چارجز منسوخ کر کے درست ریڈنگ کے مطابق فوری نیا بل جاری کرنے کے احکامات صادر فرمائے جائیں۔`,
        closing: "العارض / سائل:",
        date: dateStr
      };
    }

    if (category === 'police') {
      return {
        recipientTitle: "بخدمت جناب ایس ایچ او (SHO) صاحب",
        recipientDept: "تھانہ [تھانے کا نام]، ضلع [شہر کا نام]",
        recipientAddress: "محکمہ پولیس، حکومتِ پاکستان",
        subject: "درخواست برائے لازمی اندراج مقدمہ (ایف آئی آر) زیر دفعہ 154 ضابطہ فوجداری",
        applicantName: "[آپ کا مکمل نام]",
        applicantCnic: "[شناختی کارڈ نمبر: 0-0000000-00000]",
        applicantAddress: "[رہائشی پتہ، شہر]",
        applicantPhone: "[03XX-XXXXXXX]",
        referenceId: "[تھانہ روزنامچہ رپٹ نمبر اگر موجود ہو]",
        bodyParagraphs: [
          `جناب عالی! گزارش ہے کہ سائل ایک شریف اور قانون پسند شہری ہے اور متذکرہ بالا پتے کا مستقل رہائشی ہے۔`,
          `یہ کہ مورخہ [واقعے کی تاریخ] بوقت تقریباً [واقعے کا وقت] سائل بمقام [جائے وقوعہ کا مکمل پتہ] موجود تھا کہ اچانک [ملزمان کی تعداد اور حلیہ مثلاً موٹر سائیکل سوار دو نامعلوم مسلح افراد] نے سائل کو اسلحے کے زور پر روکا۔`,
          `یہ کہ ملزمان نے اسلحہ تان کر سائل کو جان سے مارنے کی دھمکیاں دیں اور زبردستی سائل سے [چھینے گئے سامان کی تفصیل: موٹر سائیکل، موبائل فون IMEI سمیت، نقد رقم وغیرہ] چھین کر فرار ہو گئے۔`,
          `یہ کہ اس واردات کے عینی شاہدین [گواہان کے نام] موقع پر موجود تھے جنہوں نے سارا واقعہ اپنی آنکھوں سے دیکھا۔`,
          `یہ کہ ضابطہ فوجداری کی دفعہ 154 کے تحت قابل دست اندازی پولیس جرم کی اطلاع ملنے پر پولیس لازماً ایف آئی آر کا اندراج کرنے کی قانونی پابند ہے۔`
        ],
        prayerClause: `استدعا:
حالات بالا کے پیشِ نظر دست بستہ التماس ہے کہ ملزمان کے خلاف پاکستان پینل کوڈ کی متعلقہ دفعات کے تحت فوری طور پر باقاعدہ ایف آئی آر درج فرمائی جائے، واردات کی تفتیش کسی دیانت دار افسر کے سپرد کی جائے، اور مسروقہ سامان کی برآمدگی کے ساتھ ساتھ ملزمان کو گرفتار کر کے قانون کے کٹہرے میں لایا جائے۔`,
        closing: "درخواست گزار:",
        date: dateStr
      };
    }

    // Default Urdu complaint
    return {
      recipientTitle: "بخدمت جناب مجاز افسر / انچارج صاحب",
      recipientDept: "متعلقہ سرکاری ادارہ و بلدیاتی اتھارٹی",
      recipientAddress: "ضلعی دفتر، پاکستان",
      subject: "درخواست برائے فوری دادرسی و حل عوامی و بلدیاتی مسئلہ",
      applicantName: "[آپ کا مکمل نام]",
      applicantCnic: "[شناختی کارڈ نمبر: 0-0000000-00000]",
      applicantAddress: "[رہائشی پتہ، شہر]",
      applicantPhone: "[03XX-XXXXXXX]",
      referenceId: "[ریفرنس نمبر]",
      bodyParagraphs: [
        `جناب عالی! مودبانہ التماس ہے کہ سائل علاقے کا باسی ہے اور تمام قانونی ٹیکسز باقاعدگی سے ادا کرتا ہے۔`,
        `یہ کہ سائل اور اہل محلہ کو گزشتہ کافی عرصے سے شدید عوامی مسئلے کا سامنا ہے جس کی وجہ سے شہریوں کی روزمرہ زندگی شدید متاثر ہو رہی ہے۔`,
        `یہ کہ متعلقہ فیلڈ عملے کو بارہا زبانی آگاہ کرنے کے باوجود ابھی تک کوئی عملی اقدام نہیں کیا گیا جس سے عوامی مشکلات میں مسلسل اضافہ ہو رہا ہے۔`,
        `یہ کہ آئین پاکستان اور بنیادی انتظامی قوانین کے تحت شہریوں کو بنیادی بلدیاتی و قانونی حقوق کی فراہمی ریاست اور متعلقہ ادارے کی اولین ذمہ داری ہے۔`
      ],
      prayerClause: `استدعا:
برائے مہربانی فوری طور پر اس مسئلے کا نوٹس لیتے ہوئے موقع کا معائنہ کروایا جائے اور شہریوں کی داد رسی فرما کر مسئلہ حل کیا جائے۔ سائل آپ کا شکر گزار رہے گا۔`,
      closing: "العارض:",
      date: dateStr
    };
  }

  // Gemini API live integration
  async queryGemini(userInput, lang, context) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${this.apiKey}`;

    const systemPrompt = `You are AINA (AI National Assistant), an elite civic intelligence and public grievance resolution AI designed for Pakistani citizens.
You have mastery over Pakistani law, federal and provincial government structures (WAPDA/DISCOs, SNGPL/SSGC, NADRA, FIA NR3C, Police CrPC 154, Wafaqi Mohtasib, Consumer Courts, FOSPAH, PMDU).

Your task:
Analyze the user's civic issue, categorize it, provide a 3-4 phase actionable resolution roadmap (with specific Pakistani departments, laws, contact helplines, timeframes), ask 2-3 clarification questions if details are missing, and provide complete formal complaints in both English and Urdu.

Format your output STRICTLY as valid JSON with this exact structure:
{
  "issueSummaryEn": "Concise summary in English",
  "issueSummaryUr": "Concise summary in Urdu",
  "category": "utilities|identity|police|cybercrime|municipal|consumer|ombudsman|women",
  "authorityEn": "Name of Authority in English",
  "authorityUr": "Name of Authority in Urdu",
  "department": "Specific Sub-Department",
  "severity": "Low|Medium|High|Urgent",
  "statutoryDays": "Expected resolution timeframe",
  "legalAct": "Governing Pakistani Law / Section",
  "escalationOfficer": "Officer / Forum for Escalation",
  "roadmap": [
    {
      "phaseEn": "Phase Name English",
      "phaseUr": "Phase Name Urdu",
      "tasksEn": ["Task 1", "Task 2"],
      "tasksUr": ["Task 1 in Urdu", "Task 2 in Urdu"]
    }
  ],
  "clarificationQuestions": [
    {
      "id": "q1",
      "labelEn": "Question in English",
      "labelUr": "Question in Urdu",
      "options": ["Option 1", "Option 2"]
    }
  ],
  "draftEn": {
    "recipientTitle": "Title",
    "recipientDept": "Department",
    "recipientAddress": "Address",
    "subject": "SUBJECT IN CAPS",
    "applicantName": "[Name]",
    "applicantCnic": "[CNIC]",
    "applicantAddress": "[Address]",
    "applicantPhone": "[Phone]",
    "referenceId": "[Ref ID]",
    "bodyParagraphs": ["Para 1", "Para 2"],
    "prayerClause": "PRAYER text",
    "closing": "Yours obediently,",
    "date": "Date"
  },
  "draftUr": {
    "recipientTitle": "بخدمت...",
    "recipientDept": "محکمہ...",
    "recipientAddress": "پتہ...",
    "subject": "عنوان...",
    "applicantName": "[نام]",
    "applicantCnic": "[شناختی کارڈ]",
    "applicantAddress": "[پتہ]",
    "applicantPhone": "[فون]",
    "referenceId": "[ریفرنس]",
    "bodyParagraphs": ["پیرا 1", "پیرا 2"],
    "prayerClause": "استدعا...",
    "closing": "العارض:",
    "date": "تاریخ"
  }
}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `Citizen's Problem Description: "${userInput}". Language preference: ${lang}. Additional Context: ${JSON.stringify(context)}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      parsed.source = `Google Gemini AI (${this.selectedModel})`;
      return parsed;
    }
    return null;
  }
}
