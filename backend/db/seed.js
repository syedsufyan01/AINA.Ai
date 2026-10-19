import db from '../config/db.js';

export function seedDatabase() {
  // Check if directory already has records
  const dirCount = db.prepare('SELECT COUNT(*) as count FROM civic_directory').get();
  if (dirCount.count === 0) {
    console.log('Seeding civic directory...');
    const insertDir = db.prepare(`
      INSERT INTO civic_directory (name, name_ur, category, helpline, alternate_contact, online_portal, jurisdiction, description, description_ur, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const directoryItems = [
      ['Police Emergency', 'پولیس ایمرجنسی', 'police', '15', null, 'https://punjabpolice.gov.pk', 'Provincial / National', 'Immediate distress and crime response across Pakistan', 'ہنگامی مدد اور فوری کرائم رسپانس', 'Emergency 24/7'],
      ['Rescue Emergency', 'ریسکیو 1122', 'emergency', '1122', null, 'https://rescue.gov.pk', 'Provincial', 'Ambulance, fire rescue and disaster management', 'ایمبولینس، فائر بریگیڈ اور ریسکیو سروس', 'Emergency 24/7'],
      ['Women Harassment & Safety Helpline', 'خواتین ہیلپ لائن (تحفظ و انسدادِ ہراسگی)', 'women', '1091', '0800-22222', 'https://fospah.gov.pk', 'Federal / Provincial', 'FOSPAH and Police specialized women protection cell', 'خواتین کو ہراساں کرنے یا تشدد کے خلاف فوری مدد', 'Verified Official'],
      ['FIA Cybercrime Wing (NR3C)', 'ایف آئی اے سائبر کرائم رپورٹنگ سیل', 'cybercrime', '9911 / 1991', '051-111-345-786', 'https://complaint.fia.gov.pk', 'Federal', 'Report online fraud, WhatsApp hacks, extortion, and cyber harassment', 'آن لائن دھوکہ دہی، بلیک میلنگ اور ہیکنگ کی شکایت', 'Law Enforcement'],
      ['National Human Rights Helpline', 'قومی انسانی حقوق ہیلپ لائن', 'rights', '1099', null, 'https://mohr.gov.pk', 'Federal', 'Ministry of Human Rights free legal advice and assistance', 'وزارتِ انسانی حقوق کی مفت قانونی رہنمائی', 'Federal Govt'],
      ['Wafaqi Mohtasib (Federal Ombudsman)', 'وفاقی محتسب سیکرٹریٹ (مفت شکایات)', 'ombudsman', '1055', '051-9217334', 'https://www.mohtasib.gov.pk', 'Federal', 'Free complaints against WAPDA, NADRA, SNGPL, Passport, Postal and federal agencies', 'تمام وفاقی اداروں کی بدانتظامی کے خلاف فری دادرسی', 'Quasi-Judicial'],
      ['Sui Northern Gas (SNGPL) Emergency', 'سوئی ناردرن گیس ایمرجنسی', 'utilities', '1199', '042-99082000', 'https://www.sngpl.com.pk', 'Punjab / KP', 'Gas leakages, pipeline damage and low pressure complaint', 'گیس لیکیج، پائپ لائن ایمرجنسی اور کم پریشر', 'Utility Helpline'],
      ['Sui Southern Gas (SSGC) Helpline', 'سوئی سدرن گیس ہیلپ لائن', 'utilities', '1199', '021-99021000', 'https://www.ssgc.com.pk', 'Sindh / Balochistan', 'Gas breakdown, pipeline rupture and customer billing', 'سندھ و بلوچستان گیس ایمرجنسی اور بلنگ شکایات', 'Utility Helpline'],
      ['LESCO Electricity Breakdown', 'لیسکو بجلی ہیلپ لائن (لاہور ڈویژن)', 'utilities', '118', '042-99205461', 'https://lesco.gov.pk', 'Lahore Region', 'Power breakdowns, dangerous wires, meter faults and overbilling', 'بجلی بندش، خراب میٹر اور اوور بلنگ کی شکایت', 'Utility 24/7'],
      ['K-Electric Customer Helpline', 'کے الیکٹرک ہیلپ لائن (کراچی)', 'utilities', '118', '021-118', 'https://www.ke.com.pk', 'Karachi', 'Karachi power outages, line faults and billing grievances', 'کراچی میں بجلی کی بندش اور بلوں کا تنازعہ', 'Utility 24/7'],
      ['Banking Mohtasib Pakistan', 'بینکنگ محتسب پاکستان', 'consumer', '021-99217334', '021-99217338', 'https://www.bankingmohtasib.gov.pk', 'Federal', 'Unauthorized bank deductions, ATM skimming, loan malpractices', 'بینکوں کی غیر قانونی کٹوتی، فراڈ اور بدانتظامی کے خلاف فورم', 'Appellate Tribunal'],
      ['Child Protection & Welfare Helpline', 'چائلڈ پروٹیکشن ہیلپ لائن', 'rights', '1121', null, 'https://cpwb.punjab.gov.pk', 'Provincial', 'Protection for runaway, abandoned, abused or working children', 'گمشدہ، لاوارث یا تشدد کے شکار بچوں کا تحفظ', 'Child Safety'],
      ['Pakistan Citizen Portal (PMDU)', 'پاکستان سٹیزن پورٹل (وزیراعظم ڈلیوری یونٹ)', 'ombudsman', '051-9000000', null, 'https://web.citizenportal.gov.pk', 'Federal / National', 'Integrated portal connected to 8,900+ federal and provincial government offices', 'وفاقی و صوبائی محکموں میں براہ راست شکایات کا نظام', 'Prime Minister Office']
    ];

    for (const item of directoryItems) {
      insertDir.run(...item);
    }
  }

  // Check if legal statutes already exist
  const lawCount = db.prepare('SELECT COUNT(*) as count FROM legal_statutes').get();
  if (lawCount.count === 0) {
    console.log('Seeding legal statutes...');
    const insertLaw = db.prepare(`
      INSERT INTO legal_statutes (act_name, act_name_ur, category, relevant_sections, statutory_timeframe, summary_en, summary_ur, penalty_clause)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const statutes = [
      [
        'Right of Access to Information Act, 2017 (RTI)',
        'حقِ معلومات ایکٹ 2017 (آر ٹی آئی)',
        'ombudsman',
        'Section 3, 10 & 14 (Constitutional Article 19A)',
        '10 to 14 Working Days',
        'Grants every citizen the fundamental right to demand certified copies of public records, departmental inquiries, tenders, and budgets.',
        'ہر شہری کو سرکاری اداروں سے معلومات، انکوائری رپورٹ اور بجٹ ریکارڈ حاصل کرنے کا بنیادی قانونی حق دیتا ہے۔',
        'Fine up to Rs. 100,000 and departmental disciplinary action against delinquent Public Information Officer (PIO).'
      ],
      [
        'Code of Criminal Procedure (Cr.P.C 1898) - Police Action',
        'ضابطہ فوجداری (دفعہ 154، 22-A اور 22-B)',
        'police',
        'Section 154 (Mandatory FIR) & Section 22-A / 22-B (Justice of Peace)',
        'Immediate / Within 24 Hours',
        'Police SHO is statutorily mandated to lodge an FIR upon receipt of cognizable offense information. If refused, Sessions Judge can directly order registration.',
        'تھانے کے ایس ایچ او پر لازمی ہے کہ قابل دست اندازی جرم کی اطلاع ملتے ہی فوری ایف آئی آر درج کرے۔ انکار کی صورت میں سیشن جج حکم دے سکتا ہے۔',
        'Dereliction of statutory duty under Police Order 2002; punishable by disciplinary dismissal and court contempt.'
      ],
      [
        'Prevention of Electronic Crimes Act, 2016 (PECA)',
        'پریوینشن آف الیکٹرانک کرائمز ایکٹ 2016 (پیکا)',
        'cybercrime',
        'Sections 13, 14, 16, 20 & 21',
        '48 Hours for Account Freeze / 30 Days Inquiry',
        'Governs electronic fraud, identity theft, unauthorized SIM usage, WhatsApp hacking, online blackmail, and non-consensual image distribution.',
        'ڈیجیٹل فراڈ، واٹس ایپ ہیکنگ، آن لائن بلیک میلنگ اور شناختی ڈیٹا چوری کے خلاف سخت قانونی کارروائی۔',
        'Rigorous imprisonment up to 14 years and fines up to Rs. 50 Million enforced by FIA NR3C.'
      ],
      [
        'NEPRA Consumer Service Manual (CSM)',
        'نیپرا کنزیومر سروس مینوئل (بجلی بلز و میٹرز)',
        'utilities',
        'Chapter 6 (Detection Billing) & Chapter 9 (Consumer Grievances)',
        '7 to 15 Days',
        'Prohibits issuance of unilateral detection bills without physical notice, consumer representation, and verified meter testing in laboratory.',
        'بغیر پیشگی نوٹس اور تصدیق شدہ لیب رپورٹ کے غیر قانونی ڈیٹیکشن بل جاری کرنے پر مکمل ممانعت۔',
        'Cancellation of bogus billing and disciplinary penalty on DISCO revenue officers by NEPRA / Ombudsman.'
      ],
      [
        'Provincial Consumer Protection Acts (e.g. Punjab 2005 / Sindh 2014)',
        'کنزیومر پروٹیکشن ایکٹ (صارفین کے حقوق)',
        'consumer',
        'Section 13, 15, 25 & 28',
        '15 Days Mandatory Legal Notice',
        'Protects consumers against defective products, breach of warranty, and substandard services without requiring court fees.',
        'ناقص سامان، وارنٹی سے انکار اور غیر معیاری خدمات کے خلاف کنزیومر کورٹ میں مفت کارروائی۔',
        'Full product refund, compensatory damages up to Rs. 500,000, and punitive fines.'
      ],
      [
        'Protection Against Harassment of Women at Workplace Act, 2010',
        'کام کی جگہ پر خواتین کو ہراساں کرنے کے خلاف تحفظ کا ایکٹ 2010',
        'women',
        'Section 4, 8 & 9 (FOSPAH Rules)',
        '30 to 60 Days for Final Decision',
        'Quasi-judicial jurisdiction exercised by Federal & Provincial Ombudspersons for speedy disposal of harassment and inheritance deprivation complaints.',
        'دفاتر میں خواتین کو ہراساں کرنے اور جائیداد سے محرومی کے خلاف وفاقی محتسب برائے خواتین کا بااختیار فورم۔',
        'Compulsory retirement, dismissal from service, recovery of monetary fine, and payment of compensation to victim.'
      ]
    ];

    for (const stat of statutes) {
      insertLaw.run(...stat);
    }
  }

  // Seed sample initial case if no cases exist
  const caseCount = db.prepare('SELECT COUNT(*) as count FROM cases').get();
  if (caseCount.count === 0) {
    console.log('Seeding demo initial tracked cases...');
    const insertCase = db.prepare(`
      INSERT INTO cases (
        tracking_id, category, severity, title, description, authority_name, authority_name_ur, department,
        status, diary_number, applicant_name, applicant_cnic_masked, applicant_phone, applicant_address,
        reference_id, draft_en, draft_ur, roadmap, statutory_days, legal_act, escalation_officer, filed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const demoTrackingId = 'AINA-PK-2026-X8F2';
    const draftEn = JSON.stringify({
      recipientTitle: "The Sub-Divisional Officer (SDO) / Executive Engineer (XEN)",
      recipientDept: "Lahore Electric Supply Company (LESCO)",
      recipientAddress: "Sub-Division Office, Model Town, Lahore",
      subject: "APPLICATION FOR IMMEDIATE RECTIFICATION OF ERRONEOUS BILLING & CANCELLATION OF UNJUSTIFIED DETECTION CHARGES",
      applicantName: "Muhammad Ali Khan",
      applicantCnic: "35201-1234567-1",
      applicantAddress: "House No. 42, Block B, Model Town, Lahore",
      applicantPhone: "0300-1234567",
      referenceId: "14-11234-5678901 U",
      bodyParagraphs: [
        "That the applicant is a bona fide and law-abiding domestic electricity consumer with Reference No. 14-11234-5678901 U, having an impeccable record of timely utility payments.",
        "That for the billing month of October 2026, the applicant was astonished to receive an exorbitant bill of Rs. 78,500, incorporating an arbitrary 'Detection Bill' of Rs. 62,000 claiming meter tampering, without any prior notice or joint physical verification.",
        "That under Chapter 6 of the NEPRA Consumer Service Manual (CSM), no detection units may be charged without a 7-day prior show-cause notice and verified meter testing in an independent laboratory in the presence of the consumer.",
        "That the impugned billing is ultra vires, devoid of lawful justification, and causing grave financial and psychological harassment."
      ],
      prayerClause: "It is respectfully prayed that the unjustified detection bill of Rs. 62,000 be cancelled forthwith, the billing record be rectified to actual meter reading, and an interim stay against disconnection be granted.",
      closing: "Yours obediently,",
      date: "19 October 2026"
    });

    const draftUr = JSON.stringify({
      recipientTitle: "جناب سب ڈویژنل آفیسر (ایس ڈی او) / ایگزیکٹو انجینئر (ایکسین)",
      recipientDept: "لاہور الیکٹرک سپلائی کمپنی (لیسکو)",
      recipientAddress: "ماڈل ٹاؤن سب ڈویژن، لاہور",
      subject: "درخواست برائے منسوخی غیر قانونی ڈیٹیکشن بل و درستگی بجلی بل بمطابق نیپرا رولز",
      applicantName: "محمد علی خان",
      applicantCnic: "35201-1234567-1",
      applicantAddress: "مکان نمبر 42، بلاک بی، ماڈل ٹاؤن، لاہور",
      applicantPhone: "0300-1234567",
      referenceId: "14-11234-5678901 U",
      bodyParagraphs: [
        "جناب عالی! مودبانہ گزارش ہے کہ سائل لیسکو کا باقاعدہ گھریلو صارف ہے اور ہر ماہ اپنا بجلی کا بل بروقت ادا کرتا ہے۔",
        "یہ کہ ماہ اکتوبر 2026 میں سائل کو اچانک 78 ہزار 500 روپے کا بل موصول ہوا، جس میں بغیر کسی معائنے اور بغیر لیب رپورٹ کے 62 ہزار روپے کا غیر قانونی ڈیٹیکشن بل شامل کیا گیا ہے۔",
        "یہ کہ نیپرا کنزیومر سروس مینوئل چیپٹر 6 کے تحت صارف کو 7 روزہ شوکاز نوٹس اور صارف کی موجودگی میں لیب ٹیسٹنگ کے بغیر ڈیٹیکشن بل لگانا سراسر غیر قانونی ہے۔",
        "یہ کہ اس غیر قانونی بلنگ سے سائل کو شدید ذہنی اذیت اور مالی بوجھ کا سامنا ہے۔"
      ],
      prayerClause: "استدعا ہے کہ غیر قانونی ڈیٹیکشن چارجز فوری منسوخ فرما کر میٹر ریڈنگ کے مطابق اصل بل جاری کیا جائے اور کنکشن منقطع ہونے سے روکا جائے۔",
      closing: "العارض:",
      date: "19 اکتوبر 2026"
    });

    const roadmap = JSON.stringify([
      {
        phaseEn: "Phase 1: Evidence Preservation & First-Line Challenge",
        phaseUr: "مرحلہ 1: ثبوتوں کا تحفظ اور ایس ڈی او کو درخواست",
        tasksEn: ["Photocopy current and previous 6 months paid bills", "Take a clear timestamped photograph of current meter reading", "Submit formal written complaint to SDO Office and obtain receiving Diary Number"],
        tasksUr: ["پچھلے 6 ماہ کے ادا شدہ بلوں کی کاپیاں محفوظ کریں", "میٹر کے موجودہ ہندسوں کی تاریخ کے ساتھ واضح تصویر بنائیں", "ایس ڈی او دفتر میں تحریری درخواست جمع کروا کر ڈائری نمبر حاصل کریں"]
      },
      {
        phaseEn: "Phase 2: Escalation to Executive Engineer (XEN) & Revenue Office",
        phaseUr: "مرحلہ 2: ایکسین اور ڈسکوز کسٹمر ریونیو آفس میں اپیل",
        tasksEn: ["If SDO does not resolve within 7 days, present receiving copy to XEN Complaints", "Request stay on electric disconnection pending dispute resolution"],
        tasksUr: ["اگر ایس ڈی او 7 دن میں حل نہ کرے تو ایکسین کے پاس اپیل دائر کریں", "تنازعہ حل ہونے تک بجلی کٹنے پر فوری سٹے آرڈر کی استدعا کریں"]
      },
      {
        phaseEn: "Phase 3: Quasi-Judicial Redressal at Federal Ombudsman (Wafaqi Mohtasib)",
        phaseUr: "مرحلہ 3: وفاقی محتسب میں فری شکایت اور نیپرا اپیل",
        tasksEn: ["File free online complaint at mohtasib.gov.pk or call 1055 helpline", "No lawyer or court fees required; statutory resolution within 60 days"],
        tasksUr: ["وفاقی محتسب کی ویب سائٹ (mohtasib.gov.pk) پر مفت شکایت درج کریں", "کسی وکیل کی ضرورت نہیں، قانون کے مطابق 60 دن میں فیصلہ لازم ہے"]
      }
    ]);

    const res = insertCase.run(
      demoTrackingId,
      'utilities',
      'High',
      'Bogus Electricity Detection Bill Dispute (LESCO)',
      'Arbitrary detection bill of Rs. 62,000 charged without lab inspection.',
      'Electric Power Supply Company (DISCO: LESCO) & NEPRA',
      'متعلقہ الیکٹرک پاور ڈسٹری بیوشن کمپنی (لیسکو) اور نیپرا',
      'Revenue & Metering Sub-Division',
      'diary_assigned',
      'LESCO-MT-2026-8941',
      'Muhammad Ali Khan',
      '35201-*****67-1',
      '0300-1234567',
      'House No. 42, Block B, Model Town, Lahore',
      '14-11234-5678901 U',
      draftEn,
      draftUr,
      roadmap,
      '15 Days',
      'NEPRA Consumer Service Manual (CSM) Chapter 6 & 9',
      'NEPRA Consumer Affairs / Wafaqi Mohtasib',
      new Date().toISOString()
    );

    const caseId = res.lastInsertRowid;
    const insertTimeline = db.prepare(`
      INSERT INTO case_timeline (case_id, stage, note, officer, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertTimeline.run(caseId, 'draft_created', 'Formal legal petition generated via AINA Smart Drafter.', 'AINA AI Engine', new Date(Date.now() - 86400000 * 2).toISOString());
    insertTimeline.run(caseId, 'filed', 'Petition filed in person at Sub-Divisional Office.', 'Muhammad Ali Khan', new Date(Date.now() - 86400000).toISOString());
    insertTimeline.run(caseId, 'diary_assigned', 'Official Receiving Diary Assigned: LESCO-MT-2026-8941. Forwarded to XEN Inspection Wing.', 'SDO Reader', new Date().toISOString());
  }

  console.log('Database verification and seed completed successfully.');
}

// Auto seed on run
seedDatabase();
