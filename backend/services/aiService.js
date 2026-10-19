import { env } from '../config/env.js';

export class AiService {
  detectLanguage(text) {
    if (!text) return 'en';
    const urduRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    if (urduRegex.test(text)) return 'ur';

    const romanUrduKeywords = [
      'mera', 'meri', 'mere', 'apna', 'apni', 'bijli', 'pani', 'paani', 'gas', 'bill',
      'masla', 'shikayat', 'darkhwast', 'thana', 'police', 'pesa', 'paisa',
      'kharab', 'ziada', 'zyada', 'chori', 'dhoka', 'karna', 'karein', 'kare', 'hoga',
      'hogi', 'nahi', 'raha', 'rahi', 'kahan', 'kis', 'tarah', 'kese', 'kaise', 'wala'
    ];
    const words = text.toLowerCase().split(/\s+/);
    const romanMatches = words.filter(w => romanUrduKeywords.includes(w));
    if (romanMatches.length >= 2) return 'roman_ur';

    return 'en';
  }

  async diagnose(userInput, options = {}) {
    const lang = this.detectLanguage(userInput);
    const clientKey = options.apiKey || '';
    const activeKey = clientKey || env.GEMINI_API_KEY;
    const model = options.model || env.GEMINI_MODEL;

    if (activeKey) {
      try {
        const geminiResult = await this.queryGemini(userInput, lang, options.context, activeKey, model);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('Gemini API call failed, activating built-in Pakistani Civic Intelligence Engine:', err.message);
      }
    }

    return this.expertHeuristicAnalysis(userInput, lang, options.context);
  }

  expertHeuristicAnalysis(input, lang, context = {}) {
    const text = (input || '').toLowerCase();

    let matchedCategory = 'utilities';
    let matchedAuthority = 'Relevant Civic Authority';
    let matchedAuthorityUr = 'متعلقہ مجاز ادارہ';
    let department = 'Public Utilities';
    let severity = 'Medium';
    let legalAct = 'Public Grievance Redressal Regulations';
    let statutoryDays = '15 Days';
    let escalationOfficer = 'Federal / Provincial Ombudsman';

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

    const roadmap = this.generateRoadmap(matchedCategory, input, lang);
    const clarificationQuestions = this.generateClarificationQuestions(matchedCategory, input, lang);
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
      women: "Workplace harassment, stalking, or denial of legal inheritance protection before statutory ombudsman.",
      ombudsman: "Administrative delay, institutional neglect, or maladministration in federal/provincial public agencies."
    };
    return summaries[category] || "General administrative or civic grievance requiring departmental redressal.";
  }

  generateRoadmap(category, input, lang) {
    if (category === 'utilities') {
      return [
        {
          phaseEn: "Phase 1: Evidence Preservation & First-Line Challenge",
          phaseUr: "مرحلہ 1: ثبوتوں کا تحفظ اور ایس ڈی او کو درخواست",
          tasksEn: [
            "Photocopy current disputed bill alongside previous 6 months paid bills.",
            "Take clear timestamped photo/video of current meter display numbers.",
            "Submit formal application to local Sub-Divisional Officer (SDO) and obtain written diary receiving number."
          ],
          tasksUr: [
            "موجودہ متنازعہ بل کے ساتھ پچھلے 6 ماہ کے ادا شدہ بلوں کی فوٹو کاپیاں منسلک کریں۔",
            "میٹر کے موجودہ ہندسوں کی تاریخ اور وقت کے ساتھ واضح تصویر بنائیں تاکہ ریڈنگ کا فرق ثابت ہو۔",
            "متعلقہ سب ڈویژنل آفیسر (ایس ڈی او) کو باضابطہ تحریری درخواست پیش کریں اور رسید پر دفتری ڈائری نمبر لیں۔"
          ]
        },
        {
          phaseEn: "Phase 2: Escalation to Executive Engineer (XEN) & Revenue Office",
          phaseUr: "مرحلہ 2: ایکسین اور ڈسکوز کسٹمر ریونیو آفس میں اپیل",
          tasksEn: [
            "If SDO fails to rectify within 7 days, present receipt to Executive Engineer (XEN).",
            "Demand stay on disconnection as mandated by NEPRA Consumer Service Manual (CSM Chapter 6).",
            "Refuse payment of arbitrary detection billing until joint laboratory test verification."
          ],
          tasksUr: [
            "اگر 7 دن میں ایس ڈی او بل درست نہ کرے تو ڈائری نمبر کی کاپی لے کر ایکسین (XEN) کے پاس پیش ہوں۔",
            "نیپرا کنزیومر سروس مینوئل (چیپٹر 6) کے تحت تنازعہ کے دوران بجلی کاٹنے پر فوری روک کا تقاضا کریں۔",
            "بغیر لیب رپورٹ کسی بھی ڈیٹیکشن بل کی ادائیگی سے انکار کا قانونی حق استعمال کریں۔"
          ]
        },
        {
          phaseEn: "Phase 3: Quasi-Judicial Redressal at Federal Ombudsman (Wafaqi Mohtasib)",
          phaseUr: "مرحلہ 3: وفاقی محتسب میں فری شکایت اور نیپرا اپیل",
          tasksEn: [
            "Lodge free complaint at mohtasib.gov.pk or call 1055 helpline.",
            "No lawyer or stamp fee required; decision rendered within 60 days.",
            "Serve Ombudsman interim protection order to DISCO revenue staff."
          ],
          tasksUr: [
            "وفاقی محتسب کی ویب سائٹ (mohtasib.gov.pk) پر مفت شکایت درج کریں یا 1055 پر کال کریں۔",
            "کسی وکیل کی ضرورت نہیں، قانون کے مطابق 60 دن میں فیصلہ لازم ہے۔",
            "محتسب کے حکمِ امتناعی کی کاپی ڈسکوز ریونیو عملے کو فراہم کریں۔"
          ]
        }
      ];
    }

    if (category === 'police') {
      return [
        {
          phaseEn: "Phase 1: Written Information at Police Station (Thana)",
          phaseUr: "مرحلہ 1: تھانے میں تحریری درخواست اور رسید",
          tasksEn: [
            "Draft formal statement under Section 154 Cr.P.C detailing date, time, suspects, and stolen items.",
            "Present in duplicate to Station House Officer (SHO) or Police Moharrar.",
            "Demand receiving stamp with Daily Diary (Roznamcha) serial number."
          ],
          tasksUr: [
            "ضابطہ فوجداری کی دفعہ 154 کے تحت وقوعہ کی تفصیل، وقت، ملزمان کا حلیہ اور نقصان تحریر کریں۔",
            "درخواست کی دو کاپیاں تھانے کے محرر یا ایس ایچ او کو پیش کریں۔",
            "دوسری کاپی پر روزنامچہ نمبر اور تھانے کی سرکاری مہر لازمی حاصل کریں۔"
          ]
        },
        {
          phaseEn: "Phase 2: Formal Escalation to SP Complaints & CPO",
          phaseUr: "مرحلہ 2: ایس پی کمپلینٹ سیل اور سی پی او کو رجوع",
          tasksEn: [
            "If FIR is not registered within 24 hours, appear before SP Complaints / CPO.",
            "Call 1787 (IGP Police Complaint Line) or 15 emergency to record formal grievance number."
          ],
          tasksUr: [
            "اگر 24 گھنٹے میں ایف آئی آر درج نہ ہو تو ایس پی کمپلینٹس یا سی پی او دفتر رجوع کریں۔",
            "آئی جی پولیس کمپلینٹ ہیلپ لائن 1787 پر کال کر کے تھانے کے عملے کے خلاف شکایت درج کروائیں۔"
          ]
        },
        {
          phaseEn: "Phase 3: Petition under Section 22-A / 22-B Cr.P.C (Sessions Court)",
          phaseUr: "مرحلہ 3: سیشن کورٹ میں جسٹس آف پیس کو درخواست (22-A/22-B)",
          tasksEn: [
            "File criminal miscellaneous petition before Ex-Officio Justice of Peace (District & Sessions Judge).",
            "Court issues direct notice summoning SHO with police diary.",
            "Sessions Judge commands mandatory FIR registration if cognizable offense is disclosed."
          ],
          tasksUr: [
            "ضلعی سیشن جج (جسٹس آف پیس) کی عدالت میں دفعہ 22-A اور 22-B کے تحت رٹ دائر کریں۔",
            "عدالت ایس ایچ او کو ریکارڈ سمیت ذاتی حیثیت میں طلب کرے گی۔",
            "جرم ثابت ہونے پر عدالت فوری ایف آئی آر درج کرنے کا قطعی حکم جاری کرے گی۔"
          ]
        }
      ];
    }

    if (category === 'cybercrime') {
      return [
        {
          phaseEn: "Phase 1: Digital Evidence Preservation & Bank Alert",
          phaseUr: "مرحلہ 1: ڈیجیٹل ثبوتوں کا تحفظ اور بینک الرٹ",
          tasksEn: [
            "Take screenshots of phishing chats, transaction IDs, phone numbers, and WhatsApp call logs.",
            "Immediately call bank helpline to freeze unauthorized account/Raast transactions.",
            "Request bank fraud dispute reference number."
          ],
          tasksUr: [
            "دھوکہ دہی والی چیٹ، ٹرانزیکشن آئی ڈی، کال ریکارڈز اور واٹس ایپ پیغامات کے سکرین شاٹس لیں۔",
            "فوری طور پر متعلقہ بینک ہیلپ لائن پر کال کر کے اکاؤنٹ اور راست ٹرانسفر فریز کروائیں۔",
            "بینک سے فراڈ کمپلینٹ ریفرنس نمبر حاصل کریں۔"
          ]
        },
        {
          phaseEn: "Phase 2: Lodge Formal Complaint with FIA Cybercrime (NR3C)",
          phaseUr: "مرحلہ 2: ایف آئی اے سائبر کرائم پورٹل پر اندراج",
          tasksEn: [
            "Submit online application at complaint.fia.gov.pk or call 9911 / 1991.",
            "Provide suspect phone numbers, account numbers, and IP/screenshots.",
            "Receive FIA Complaint Tracking Pin."
          ],
          tasksUr: [
            "ایف آئی اے پورٹل (complaint.fia.gov.pk) پر درخواست جمع کریں یا 9911 پر کال کریں۔",
            "ملزم کا فون نمبر، موصول ہونے والا اکاؤنٹ اور تمام سکرین شاٹس اپلوڈ کریں۔",
            "ایف آئی اے ٹریکنگ پن نمبر محفوظ کریں۔"
          ]
        },
        {
          phaseEn: "Phase 3: Escalation to State Bank of Pakistan & Banking Mohtasib",
          phaseUr: "مرحلہ 3: اسٹیٹ بینک اور بینکنگ محتسب کو رجوع",
          tasksEn: [
            "If commercial bank refuses refund, file petition before Banking Mohtasib Pakistan.",
            "State Bank regulations mandate reimbursement if bank security architecture failed."
          ],
          tasksUr: [
            "اگر بینک رقم واپسی میں تاخیر کرے تو بینکنگ محتسب پاکستان (bankingmohtasib.gov.pk) میں دعویٰ دائر کریں۔",
            "اسٹیٹ بینک آف پاکستان کے ضوابط کے تحت بینک رقم واپس کرنے کا پابند ہے۔"
          ]
        }
      ];
    }

    // Default 3-phase roadmap for other categories
    return [
      {
        phaseEn: "Phase 1: Formal First-Line Application",
        phaseUr: "مرحلہ 1: ابتدائی باضابطہ تحریری درخواست",
        tasksEn: [
          "Document facts, evidence, and affected rights in standard format.",
          "Submit in person to designated officer and obtain official receipt.",
          "Note down official Diary Number and receiving stamp."
        ],
        tasksUr: [
          "واقعات اور شواہد کو باضابطہ درخواست میں تحریر کریں۔",
          "متعلقہ افسر کے دفتر جمع کروا کر سرکاری رسید اور ڈائری نمبر حاصل کریں۔"
        ]
      },
      {
        phaseEn: "Phase 2: Departmental Appellate Follow-up",
        phaseUr: "مرحلہ 2: محکماتی اپیل اور فالو اپ",
        tasksEn: [
          "If unaddressed within statutory time, escalate to District Head or Director General.",
          "Attach copy of previous receiving diary as proof of departmental inaction."
        ],
        tasksUr: [
          "قانونی مدت کے بعد متعلقہ محکمے کے ڈائریکٹر جنرل یا ضلعی سربراہ کو اپیل بھیجیں۔",
          "پہلی درخواست کی مہر شدہ رسید ساتھ منسلک کریں۔"
        ]
      },
      {
        phaseEn: "Phase 3: Quasi-Judicial Ombudsman Redressal",
        phaseUr: "مرحلہ 3: محتسب اعلیٰ یا قانونی فورم میں چارہ جوئی",
        tasksEn: [
          "File free complaint before Wafaqi / Provincial Ombudsman.",
          "Seek binding directives against delinquent public officers."
        ],
        tasksUr: [
          "وفاقی یا صوبائی محتسب کے روبرو فری شکایت درج کر کے فوری احکامات حاصل کریں۔"
        ]
      }
    ];
  }

  generateClarificationQuestions(category, input, lang) {
    if (category === 'utilities') {
      return [
        {
          id: 'q1',
          labelEn: 'What power/gas company serves your area?',
          labelUr: 'آپ کے علاقے میں کون سی بجلی یا گیس کمپنی سروس دیتی ہے؟',
          options: ['LESCO (Lahore)', 'IESCO (Islamabad/Rawalpindi)', 'K-Electric (Karachi)', 'SNGPL Gas', 'SSGC Gas', 'Other DISCO']
        },
        {
          id: 'q2',
          labelEn: 'Has the company served a written notice before detection billing?',
          labelUr: 'کیا کمپنی نے ڈیٹیکشن بل سے قبل کوئی تحریری نوٹس دیا تھا؟',
          options: ['No notice received (Violates NEPRA CSM)', 'Yes, received 7-day show-cause', 'Meter was replaced without consumer presence']
        }
      ];
    }
    if (category === 'police') {
      return [
        {
          id: 'q1',
          labelEn: 'Did the offense involve physical violence or weapons?',
          labelUr: 'کیا واردات میں اسلحہ یا جسمانی تشدد شامل تھا؟',
          options: ['Yes, armed robbery/snatching (PPC 392)', 'No, unattended theft (PPC 379)', 'Fraud / Harassment']
        },
        {
          id: 'q2',
          labelEn: 'Did the Police Thana issue a Daily Diary (Roznamcha) receipt?',
          labelUr: 'کیا تھانے کے عملے نے کوئی روزنامچہ رپٹ یا ڈائری نمبر دیا؟',
          options: ['Refused outright', 'Gave Roznamcha lost report only', 'Did not visit yet']
        }
      ];
    }
    return [
      {
        id: 'q1',
        labelEn: 'Have you already submitted an initial written application?',
        labelUr: 'کیا آپ پہلے سے کوئی تحریری درخواست جمع کروا چکے ہیں؟',
        options: ['No, preparing first application', 'Yes, but received no response within deadline']
      }
    ];
  }

  generateComplaintLetter(category, input, docLang = 'en') {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (docLang === 'ur') {
      return {
        recipientTitle: "بخدمت جناب مجاز افسر / سربراہ ادارہ",
        recipientDept: "متعلقہ مجاز سرکاری محکمہ و اتھارٹی",
        recipientAddress: "متعلقہ سب ڈویژنل آفس، پاکستان",
        subject: "درخواست برائے فوری دادرسی و حل عوامی و بلدیاتی مسئلہ",
        applicantName: "محمد علی خان",
        applicantCnic: "35201-1234567-1",
        applicantAddress: "مکان نمبر 12، گلی 4، اسلام آباد",
        applicantPhone: "0300-1234567",
        referenceId: "ریفرنس نمبر: AINA-DOC-2026",
        bodyParagraphs: [
          "جناب عالی! مودبانہ التماس ہے کہ سائل علاقے کا باسی ہے اور تمام قانونی ٹیکسز باقاعدگی سے ادا کرتا ہے۔",
          "یہ کہ سائل کو گزشتہ کافی عرصے سے شدید عوامی مسئلے کا سامنا ہے جس کی وجہ سے شہریوں کی روزمرہ زندگی شدید متاثر ہو رہی ہے۔",
          "یہ کہ متعلقہ فیلڈ عملے کو بارہا زبانی آگاہ کرنے کے باوجود ابھی تک کوئی عملی اقدام نہیں کیا گیا جس سے عوامی مشکلات میں مسلسل اضافہ ہو رہا ہے۔",
          "یہ کہ آئین پاکستان اور بنیادی انتظامی قوانین کے تحت شہریوں کو بنیادی بلدیاتی و قانونی حقوق کی فراہمی ریاست اور متعلقہ ادارے کی اولین ذمہ داری ہے۔"
        ],
        prayerClause: "استدعا: برائے مہربانی فوری طور پر اس مسئلے کا نوٹس لیتے ہوئے موقع کا معائنہ کروایا جائے اور شہریوں کی داد رسی فرما کر مسئلہ حل کیا جائے۔ سائل آپ کا شکر گزار رہے گا۔",
        closing: "العارض:",
        date: "19 اکتوبر 2026"
      };
    }

    return {
      recipientTitle: "The Competent Redressal Officer / Head of Department",
      recipientDept: "Relevant Public Service Authority / Ombudsman",
      recipientAddress: "Sub-Divisional Secretariat Office, Pakistan",
      subject: "APPLICATION FOR IMMEDIATE REDRESSAL OF CIVIC GRIEVANCE UNDER STATUTORY MANDATE",
      applicantName: "Muhammad Ali Khan",
      applicantCnic: "35201-1234567-1",
      applicantAddress: "House No. 12, Street 4, Islamabad",
      applicantPhone: "0300-1234567",
      referenceId: "AINA-REF-2026-01",
      bodyParagraphs: [
        "That the applicant is a law-abiding citizen and tax-paying consumer residing at the aforementioned address.",
        "That the applicant has been subjected to grave administrative prejudice, procedural delay, and deficiency in public service by the concerned subordinate staff.",
        "That multiple informal representations made to the field staff have yielded no fruitful outcome, compelling the petitioner to seek formal intervention under the applicable statutory framework.",
        "That under the constitutional mandate of due process and administrative fairness, every citizen is entitled to transparent grievance redressal within statutory time limits."
      ],
      prayerClause: "It is respectfully prayed that this grievance be taken up on urgent priority, field verification be ordered forthwith, and relief as prayed for be granted in the interest of justice.",
      closing: "Yours obediently,",
      date: dateStr
    };
  }

  async queryGemini(userInput, lang, context, apiKey, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `Citizen's Problem Description: "${userInput}". Language preference: ${lang}. Additional Context: ${JSON.stringify(context || {})}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      parsed.source = `Google Gemini AI (${model})`;
      return parsed;
    }
    return null;
  }
}

export const aiService = new AiService();
