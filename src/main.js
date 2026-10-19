// Project AINA - AI National Assistant
// Core Application Controller & UI Logic (NYLP AI Hackathon 2026)

import { CIVIC_CATEGORIES, EMERGENCY_HELPLINES, OFFICIAL_PORTALS, SAMPLE_SCENARIOS, PAKISTAN_LAWS_GUIDE } from './civicData.js';
import { AinaEngine } from './aiEngine.js';
import { SpeechHandler } from './speech.js';
import { apiClient } from './apiClient.js';

// Application State
const state = {
  lang: 'en', // 'en' or 'ur'
  theme: 'dark',
  currentDiagnosis: null,
  currentDocLang: 'en',
  activeTab: 'tab-assistant',
  geminiKey: localStorage.getItem('aina_gemini_api_key') || '',
  selectedModel: localStorage.getItem('aina_gemini_model') || 'gemini-1.5-flash',
  selectedClarifications: {},
  currentCase: null,
  currentTrackingId: 'AINA-PK-2026-X8F2'
};

// Instantiate Engines
const ainaEngine = new AinaEngine();
let speechHandler = null;

// UI Dictionary for Full Bilingual Experience
const I18N = {
  en: {
    appTitle: "AINA (AI National Assistant) | NYLP AI Hackathon 2026",
    subtitle: "AI National Assistant • قومی معاون برائے شہری امور",
    disclaimer: "AINA is an independent civic AI assistant developed for NYLP AI Hackathon 2026, not a government entity. It provides informative legal & procedural guidance; the citizen remains responsible for reviewing and submitting their formal application or complaint to the competent authority.",
    navAssistant: "AI Civic Consultation",
    navDrafter: "Smart Complaint Drafter",
    navDirectory: "Official Civic Directory",
    navRights: "Citizen Rights & Laws",
    heroPill: "✨ Empowering 240M+ Pakistani Citizens",
    heroTitle: `Describe Any Civic Problem in <span class="text-gradient">Urdu or English</span>. Get Instant Legal Guidance.`,
    heroDesc: "From inflated electricity detection bills and blocked NADRA CNICs to police station FIR refusals, online cyber fraud, and municipal sewage neglect—AINA guides you step-by-step through official Pakistani government procedures and generates formal legal complaints.",
    consoleHeading: "Citizen Problem Input & Diagnostic Console",
    placeholderInput: "Describe your issue in detail. Example in English: 'My electricity bill this month has jumped to Rs. 75,000 with a bogus detection bill claiming meter tampering...' Or in Urdu: 'میرے گھر کا بجلی کا بل اچانک 75 ہزار آ گیا ہے، متعلقہ ایس ڈی او شنوائی نہیں کر رہا...' Or in Roman Urdu: 'Mera bijli ka bill bohat ziada aya hai...'",
    tapToSpeak: "Tap to Speak (آواز سے بتائیں)",
    listening: "Listening... Speak now in Urdu or English",
    clear: "Clear",
    diagnoseBtn: "Diagnose & Guide Me",
    commonIssuesTitle: "⚡ Common Pakistani Civic Issues (Click to test):",
    compAuthority: "Primary Competent Authority",
    govLaw: "Governing Pakistani Law / Code",
    escalationForum: "Appellate / Escalation Forum",
    readAloud: "Read Aloud",
    stopReading: "Stop Audio",
    ctaHeading: "Ready to Submit an Official Application?",
    ctaDesc: "AINA has already structured and drafted your formal complaint in both official English legal format and standard Urdu (درخواست برائے سرکاری ادارہ).",
    ctaBtn: "Open & Review Formal Draft",
    drafterTitle: "AINA Official Complaint & Application Drafter",
    drafterSubtitle: "Generate, customize, and export formal petitions and complaints formatted for Pakistani government offices, ombudsmen, and courts.",
    editorTitle: "Document Variables & Details",
    editorHelper: "Edit any field below to instantly update the official preview on the right.",
    lblRecipientTitle: "Recipient Designation / Officer",
    lblRecipientDept: "Department / Authority",
    lblRecipientAddress: "Office Address / Sub-Division",
    lblSubject: "Subject Line",
    lblApplicantName: "Applicant Legal Name",
    lblApplicantCnic: "13-Digit CNIC Number",
    lblApplicantPhone: "Mobile Contact Number",
    lblRefId: "Consumer Ref / Meter / Incident No.",
    lblApplicantAddress: "Complete Residential Address",
    lblBodyText: "Factual Statement & Narrative (Numbered Paragraphs)",
    lblPrayerText: "Prayer / Relief Clause (استدعا و مطالبہ)",
    livePreviewLabel: "Official Legal Document Preview",
    btnCopy: "Copy Text",
    btnPrint: "Print / Save as PDF",
    dirTitle: "Official Pakistani Civic Directory & Helplines",
    dirSubtitle: "Quick, verified directory of emergency distress lines, utility helplines, ombudsman secretariats, and official government complaint portals.",
    rightsTitle: "Know Your Citizen Rights Under Pakistani Law",
    rightsSubtitle: "Empower yourself with fundamental constitutional protections, statutory deadlines for government officers, and legal recourse against corruption and neglect.",
    navTracking: "Case Tracker & Timeline",
    saveCaseBtn: "Save & Track Case",
    titleTrackingSection: "Pakistani Civic Case Tracker & Diary Monitor",
    descTrackingSection: "Monitor the real-time status of your formal petitions, log receiving diary numbers, view procedural timelines, and record official department milestones."
  },
  ur: {
    appTitle: "آئینہ (قومی معاون برائے شہری امور) | NYLP AI Hackathon 2026",
    subtitle: "قومی معاون برائے شہری امور • AI National Assistant",
    disclaimer: "آئینہ (AINA) ایک آزاد شہری و فلاحی AI پلیٹ فارم ہے جو NYLP AI Hackathon 2026 کے لیے تیار کیا گیا ہے، یہ کوئی سرکاری ادارہ نہیں۔ یہ شہریوں کو آگاہی و رہنمائی فراہم کرتا ہے؛ متعلقہ محکمے میں باضابطہ درخواست یا شکایت جمع کروانے کا صارف خود ذمہ دار ہے۔",
    navAssistant: "شہری مسائل کی مشاورت",
    navDrafter: "قانونی درخواست و شکایت ساز",
    navDirectory: "سرکاری ڈائریکٹری و ہیلپ لائنز",
    navRights: "شہری حقوق و قوانین",
    navTracking: "کیس ٹریکر و قانونی پیش رفت",
    saveCaseBtn: "درخواست محفوظ کریں اور ٹریک کریں",
    titleTrackingSection: "قومی شہری شکایات اور دفتری ڈائری ٹریکر",
    descTrackingSection: "اپنی باضابطہ قانونی درخواستوں کی لائیو پیش رفت دیکھیں، دفتری ڈائری نمبر درج کریں اور محکماتی کارروائی کی تاریخ مانیٹر کریں۔",
    heroPill: "✨ 24 کروڑ سے زائد پاکستانی شہریوں کی خدمت",
    heroTitle: `اپنا کوئی بھی شہری مسئلہ <span class="text-gradient">اردو یا انگریزی</span> میں بیان کریں۔ فوری قانونی رہنمائی حاصل کریں۔`,
    heroDesc: "بجلی کے زائد ڈیٹیکشن بل، نادرا شناختی کارڈ بلاک ہونا، تھانے میں ایف آئی آر کاٹںے سے انکار، آن لائن بینک فراڈ یا سیوریج کے مسائل—آئینہ آپ کو مرحلہ وار قانونی راستہ بتاتا ہے اور باقاعدہ دفتری درخواست تیار کرتا ہے۔",
    consoleHeading: "شہری مسائل کا اندراج اور اے آئی تشخیص",
    placeholderInput: "اپنا مسئلہ تفصیل سے بیان کریں، مثلاً: 'میرے گھر کا بجلی کا بل اچانک 75 ہزار آ گیا ہے اور ڈیٹیکشن بل لگا دیا گیا ہے، میں کیا کروں؟' یا انگریزی میں لکھیں یا مائیک کا بٹن دبا کر بولیں۔",
    tapToSpeak: "بول کر بتائیں (مائیکروفون آن)",
    listening: "سن رہے ہیں... اردو یا انگریزی میں بولیں",
    clear: "صاف کریں",
    diagnoseBtn: "مسئلہ جانچیں اور رہنمائی لیں",
    commonIssuesTitle: "⚡ عام پیش آنے والے پاکستانی مسائل (کلک کریں):",
    compAuthority: "بنیادی مجاز سرکاری ادارہ",
    govLaw: "متعلقہ ملکی قانون / کوڈ",
    escalationForum: "اپیل و دادرسی کا اعلیٰ فورم",
    readAloud: "آواز میں سنیں",
    stopReading: "آواز بند کریں",
    ctaHeading: "کیا آپ باقاعدہ سرکاری درخواست جمع کروانا چاہتے ہیں؟",
    ctaDesc: "آئینہ نے آپ کے مسئلے کے مطابق باضابطہ قانونی درخواست اردو (سرکاری درخواست) اور انگلش دونوں میں تیار کر دی ہے۔",
    ctaBtn: "درخواست دیکھیں اور ایڈٹ کریں",
    drafterTitle: "آئینہ دفتری درخواست و شکایت بلڈر",
    drafterSubtitle: "پاکستانی سرکاری محکموں، وفاقی محتسب اور کنزیومر کورٹس کے لیے معیاری قانونی فارمیٹ کے مطابق درخواستیں تیار اور پرنٹ کریں۔",
    editorTitle: "درخواست کی تفصیلات اور متغیرات",
    editorHelper: "نیچے کسی بھی خانے میں ترمیم کریں، دائیں جانب سرکاری پیپر پر لائیو تبدیلی فوراً نظر آئے گی۔",
    lblRecipientTitle: "مخاطب افسر کا عہدہ",
    lblRecipientDept: "متعلقہ محکمہ / اتھارٹی",
    lblRecipientAddress: "دفتری پتہ / سب ڈویژن",
    lblSubject: "درخواست کا عنوان",
    lblApplicantName: "سائل / درخواست گزار کا نام",
    lblApplicantCnic: "13 ہندسوں کا قومی شناختی کارڈ نمبر",
    lblApplicantPhone: "موبائل فون نمبر",
    lblRefId: "کنزیومر ریفرنس یا ڈائری نمبر",
    lblApplicantAddress: "رہائشی پتہ",
    lblBodyText: "واقعات اور تفصیلات (نمبر وار پیراگراف)",
    lblPrayerText: "استدعا و قانونی مطالبہ (Prayer)",
    livePreviewLabel: "سرکاری قانونی پیپر کا لائیو پیش منظر",
    btnCopy: "متن کاپی کریں",
    btnPrint: "پرنٹ / PDF محفوظ کریں",
    dirTitle: "سرکاری پاکستانی ڈائریکٹری و ایمرجنسی ہیلپ لائنز",
    dirSubtitle: "پولیس، ریسکیو، یوٹیلیٹیز، وفاقی محتسب اور سرکاری آن لائن پورٹلز کی تصدیق شدہ فہرست۔",
    rightsTitle: "آئین و قانون کے تحت پاکستانی شہریوں کے بنیادی حقوق",
    rightsSubtitle: "سرکاری افسران کے لیے قانونی مدت، حق معلومات (RTI)، اور بلاوجہ تاخیر کے خلاف اپنے حقوق جانیے۔"
  }
};

// Initialize Speech Handler
function setupSpeechEngine() {
  speechHandler = new SpeechHandler(
    (transcript, isFinal) => {
      const textarea = document.getElementById('user-issue-input');
      if (textarea) {
        textarea.value = transcript;
        textarea.focus();
      }
    },
    (isListening, error) => {
      const micBtn = document.getElementById('btn-toggle-mic');
      const voiceStatus = document.getElementById('voice-status');
      const voiceStatusText = document.getElementById('voice-status-text');

      if (micBtn && voiceStatus) {
        if (isListening) {
          micBtn.classList.add('recording');
          voiceStatus.style.display = 'flex';
          voiceStatusText.textContent = I18N[state.lang].listening;
        } else {
          micBtn.classList.remove('recording');
          voiceStatus.style.display = 'none';
        }
      }
      if (error) {
        showToast(`Mic Notice: ${error}`, 'info');
      }
    }
  );
  speechHandler.setLanguage(state.lang);
}

// Show Toast Notification
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Switch UI Language
function setLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';

  // Toggle active class on lang buttons
  const btnEn = document.getElementById('btn-lang-en');
  const btnUr = document.getElementById('btn-lang-ur');
  if (btnEn && btnUr) {
    btnEn.classList.toggle('active', lang === 'en');
    btnUr.classList.toggle('active', lang === 'ur');
  }

  // Update speech engine language
  if (speechHandler) {
    speechHandler.setLanguage(lang);
  }

  // Update All Static Labels
  const dict = I18N[lang];
  document.title = dict.appTitle;
  setElText('disclaimer-text', dict.disclaimer);
  setElText('nav-assistant', dict.navAssistant);
  setElText('nav-drafter', dict.navDrafter);
  setElText('nav-directory', dict.navDirectory);
  setElText('nav-rights', dict.navRights);
  setElText('hero-pill', dict.heroPill);
  setElHtml('hero-title-text', dict.heroTitle);
  setElText('hero-desc-text', dict.heroDesc);
  setElText('console-heading-text', dict.consoleHeading);
  setElText('label-mic', dict.tapToSpeak);
  setElText('label-analyze', dict.diagnoseBtn);
  setElText('btn-clear-input', dict.clear);
  setElText('chips-title-text', dict.commonIssuesTitle);
  setElText('label-competent-authority', dict.compAuthority);
  setElText('label-governing-law', dict.govLaw);
  setElText('label-escalation-forum', dict.escalationForum);
  setElText('label-read-aloud', dict.readAloud);
  setElText('label-cta-heading', dict.ctaHeading);
  setElText('label-cta-desc', dict.ctaDesc);
  setElText('label-cta-btn', dict.ctaBtn);
  setElText('title-drafter-section', dict.drafterTitle);
  setElText('desc-drafter-section', dict.drafterSubtitle);
  setElText('label-doc-editor', dict.editorTitle);
  setElText('label-editor-helper', dict.editorHelper);
  setElText('lbl-recipient-title', dict.lblRecipientTitle);
  setElText('lbl-recipient-dept', dict.lblRecipientDept);
  setElText('lbl-recipient-address', dict.lblRecipientAddress);
  setElText('lbl-subject', dict.lblSubject);
  setElText('lbl-applicant-name', dict.lblApplicantName);
  setElText('lbl-applicant-cnic', dict.lblApplicantCnic);
  setElText('lbl-applicant-phone', dict.lblApplicantPhone);
  setElText('lbl-reference-id', dict.lblRefId);
  setElText('lbl-applicant-address', dict.lblApplicantAddress);
  setElText('lbl-body-text', dict.lblBodyText);
  setElText('lbl-prayer-text', dict.lblPrayerText);
  setElText('label-live-preview', dict.livePreviewLabel);
  setElText('label-btn-copy', dict.btnCopy);
  setElText('label-btn-print', dict.btnPrint);
  setElText('title-directory-section', dict.dirTitle);
  setElText('desc-directory-section', dict.dirSubtitle);
  setElText('title-rights-section', dict.rightsTitle);
  setElText('desc-rights-section', dict.rightsSubtitle);
  setElText('nav-tracking', dict.navTracking);
  setElText('label-btn-save-case', dict.saveCaseBtn);
  setElText('title-tracking-section', dict.titleTrackingSection);
  setElText('desc-tracking-section', dict.descTrackingSection);

  const inputEl = document.getElementById('user-issue-input');
  if (inputEl) inputEl.placeholder = dict.placeholderInput;

  // Re-render Sample Chips for correct language display
  renderSampleChips();

  // If a diagnosis is currently shown, re-render it in new language
  if (state.currentDiagnosis) {
    renderDiagnosisReport(state.currentDiagnosis);
  }
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setElHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// Render Quick Sample Scenario Chips
function renderSampleChips() {
  const container = document.getElementById('sample-chips-container');
  if (!container) return;

  container.innerHTML = '';
  SAMPLE_SCENARIOS.forEach(scenario => {
    const chip = document.createElement('button');
    chip.className = 'scenario-chip';
    chip.innerHTML = `<span>⚡</span> ${state.lang === 'ur' ? scenario.titleUr : scenario.titleEn}`;
    chip.addEventListener('click', () => {
      const inputEl = document.getElementById('user-issue-input');
      if (inputEl) {
        inputEl.value = state.lang === 'ur' ? scenario.userPromptUr : scenario.userPromptEn;
        inputEl.focus();
        handleAnalyzeIssue();
      }
    });
    container.appendChild(chip);
  });
}

// Handle Issue Diagnosis
async function handleAnalyzeIssue() {
  const inputEl = document.getElementById('user-issue-input');
  if (!inputEl) return;

  const query = inputEl.value.trim();
  if (!query) {
    showToast(state.lang === 'ur' ? 'براہ کرم اپنا مسئلہ درج کریں یا مائیک کے ذریعے بتائیں!' : 'Please describe your civic issue or use voice input!', 'info');
    inputEl.focus();
    return;
  }

  const resultsArea = document.getElementById('results-area');
  const loadingEl = document.getElementById('analysis-loading');
  const reportCard = document.getElementById('diagnosis-report');

  resultsArea.style.display = 'block';
  loadingEl.style.display = 'block';
  reportCard.style.display = 'none';

  resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const diagnosis = await ainaEngine.analyzeCivicIssue(query, state.selectedClarifications);
    state.currentDiagnosis = diagnosis;

    loadingEl.style.display = 'none';
    reportCard.style.display = 'block';

    renderDiagnosisReport(diagnosis);

    // Pre-populate the drafter form with generated complaint
    loadDiagnosisIntoDrafter(diagnosis);
  } catch (err) {
    console.error('Diagnosis failed:', err);
    loadingEl.style.display = 'none';
    showToast('Analysis error. Please try again.', 'info');
  }
}

// Render Diagnosis Report in UI
function renderDiagnosisReport(diag) {
  const isUr = state.lang === 'ur';

  // Category Icon & Details
  const catObj = CIVIC_CATEGORIES.find(c => c.id === diag.category) || CIVIC_CATEGORIES[0];
  setElText('report-cat-icon', catObj.icon);
  setElText('report-cat-title', isUr ? catObj.nameUr : catObj.nameEn);
  setElText('report-source-tag', diag.source || 'AINA Pakistani Civic Intelligence Engine');

  // Severity & Timeframe
  setElText('report-severity', `${isUr ? 'شدت' : 'Severity'}: ${diag.severity}`);
  setElText('report-timeframe', `${isUr ? 'قانونی مدت' : 'Statutory Time'}: ${diag.statutoryDays}`);

  // Summary
  setElText('report-summary-content', isUr ? diag.issueSummaryUr : diag.issueSummaryEn);

  // Authority Grid
  setElText('report-authority-name', isUr ? diag.authorityUr : diag.authorityEn);
  setElText('report-department-name', diag.department);
  setElText('report-legal-act', diag.legalAct);
  setElText('report-escalation-officer', diag.escalationOfficer);

  // Render Clarification Questions
  renderClarifications(diag.clarificationQuestions);

  // Render 4-Phase Roadmap
  renderRoadmapTimeline(diag.roadmap);
}

// Render Clarification Option Chips
function renderClarifications(questions) {
  const container = document.getElementById('clarification-container');
  const listEl = document.getElementById('clarification-questions-list');
  if (!container || !listEl) return;

  if (!questions || questions.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  listEl.innerHTML = '';

  const isUr = state.lang === 'ur';

  questions.forEach(q => {
    const block = document.createElement('div');
    block.className = 'question-block';

    const prompt = document.createElement('div');
    prompt.className = 'question-prompt';
    prompt.textContent = isUr ? q.labelUr : q.labelEn;
    block.appendChild(prompt);

    const optionsRow = document.createElement('div');
    optionsRow.className = 'options-row';

    q.options.forEach(opt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'option-chip';
      chip.textContent = opt;

      if (state.selectedClarifications[q.id] === opt) {
        chip.classList.add('selected');
      }

      chip.addEventListener('click', () => {
        state.selectedClarifications[q.id] = opt;
        // Re-render chips to reflect selection
        block.querySelectorAll('.option-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');

        // Update Drafter Reference/Notes field dynamically
        const refInput = document.getElementById('edit-reference-id');
        if (refInput && opt.includes('Reference')) {
          refInput.value = 'Consumer Ref: 14-XXXX-XXXXXXX (Verified)';
          updateLiveDocPreview();
        }

        showToast(isUr ? 'آپ کی تفصیلات درخواست میں شامل کر دی گئیں!' : 'Details integrated into formal draft!', 'success');
      });

      optionsRow.appendChild(chip);
    });

    block.appendChild(optionsRow);
    listEl.appendChild(block);
  });
}

// Render Roadmap Timeline
function renderRoadmapTimeline(roadmap) {
  const container = document.getElementById('roadmap-timeline-container');
  if (!container) return;

  container.innerHTML = '';
  const isUr = state.lang === 'ur';

  roadmap.forEach(phase => {
    const card = document.createElement('div');
    card.className = 'timeline-phase-card';

    const title = document.createElement('h4');
    title.className = 'phase-title';
    title.textContent = isUr ? phase.phaseUr : phase.phaseEn;
    card.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'tasks-checklist';

    const tasks = isUr ? phase.tasksUr : phase.tasksEn;
    tasks.forEach(task => {
      const item = document.createElement('li');
      item.className = 'task-item';
      item.innerHTML = `<span class="task-bullet">✔</span> <span>${task}</span>`;
      list.appendChild(item);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}

// Load Diagnosis into Drafter
function loadDiagnosisIntoDrafter(diag) {
  const draft = state.currentDocLang === 'ur' ? diag.draftUr : diag.draftEn;
  if (!draft) return;

  document.getElementById('edit-recipient-title').value = draft.recipientTitle || '';
  document.getElementById('edit-recipient-dept').value = draft.recipientDept || '';
  document.getElementById('edit-recipient-address').value = draft.recipientAddress || '';
  document.getElementById('edit-subject').value = draft.subject || '';
  document.getElementById('edit-applicant-name').value = draft.applicantName || 'Muhammad Ali Khan';
  document.getElementById('edit-applicant-cnic').value = draft.applicantCnic || '35201-1234567-1';
  document.getElementById('edit-applicant-phone').value = draft.applicantPhone || '0300-1234567';
  document.getElementById('edit-applicant-address').value = draft.applicantAddress || 'House No. 12, Street 4, Sector G-8/1, Islamabad';
  document.getElementById('edit-reference-id').value = draft.referenceId || '14-24512-9876543 U';
  document.getElementById('edit-body-text').value = (draft.bodyParagraphs || []).join('\n\n');
  document.getElementById('edit-prayer-text').value = draft.prayerClause || '';

  updateLiveDocPreview();
}

// Update Live Stationery Preview from Form
function updateLiveDocPreview() {
  const isUr = state.currentDocLang === 'ur';
  const paper = document.getElementById('printable-document');
  if (paper) {
    paper.classList.toggle('urdu-mode', isUr);
  }

  const recTitle = document.getElementById('edit-recipient-title').value;
  const recDept = document.getElementById('edit-recipient-dept').value;
  const recAddress = document.getElementById('edit-recipient-address').value;
  const subject = document.getElementById('edit-subject').value;
  const name = document.getElementById('edit-applicant-name').value;
  const cnic = document.getElementById('edit-applicant-cnic').value;
  const phone = document.getElementById('edit-applicant-phone').value;
  const refId = document.getElementById('edit-reference-id').value;
  const address = document.getElementById('edit-applicant-address').value;
  const bodyRaw = document.getElementById('edit-body-text').value;
  const prayerRaw = document.getElementById('edit-prayer-text').value;

  setElText('preview-recipient-title', recTitle);
  setElText('preview-recipient-dept', recDept);
  setElText('preview-recipient-address', recAddress);
  setElText('preview-subject', subject);
  setElText('preview-reference-id', refId);
  setElText('preview-salutation', isUr ? 'جناب عالی / محترم،' : 'Respected Sir / Madam,');

  // Body Paragraphs
  const parasContainer = document.getElementById('preview-body-paragraphs');
  if (parasContainer) {
    parasContainer.innerHTML = '';
    const lines = bodyRaw.split(/\n+/).filter(l => l.trim().length > 0);
    lines.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line;
      parasContainer.appendChild(p);
    });
  }

  // Prayer
  setElText('preview-prayer', prayerRaw);

  // Signatures
  setElText('preview-sign-name', name);
  setElText('preview-sign-cnic', cnic);
  setElText('preview-sign-phone', phone);
  setElText('preview-sign-address', address);

  // Date
  const dateVal = isUr
    ? new Date().toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  setElText('doc-date-val', dateVal);
}

// Render Civic Directory Helplines & Portals
function renderCivicDirectory(filter = 'all', searchQuery = '') {
  const helplineContainer = document.getElementById('helplines-grid-container');
  const portalsContainer = document.getElementById('portals-grid-container');
  if (!helplineContainer || !portalsContainer) return;

  const isUr = state.lang === 'ur';

  // Filter Helplines
  const filteredHelplines = EMERGENCY_HELPLINES.filter(h => {
    const matchesFilter = filter === 'all' || h.category === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query ||
      h.name.toLowerCase().includes(query) ||
      h.number.toLowerCase().includes(query) ||
      h.urduName.includes(query) ||
      h.note.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  helplineContainer.innerHTML = '';
  filteredHelplines.forEach(h => {
    const card = document.createElement('div');
    card.className = 'helpline-card';
    card.innerHTML = `
      <div class="helpline-info">
        <h4>${isUr ? h.urduName : h.name}</h4>
        <div class="helpline-urdu-name">${isUr ? h.name : h.urduName}</div>
        <p class="helpline-note">${h.note}</p>
      </div>
      <div class="helpline-action-row">
        <span class="helpline-number">${h.number}</span>
        <a href="tel:${h.number.split('/')[0].trim()}" class="btn-dial">📞 ${isUr ? 'کال کریں' : 'Speed Dial'}</a>
      </div>
    `;
    helplineContainer.appendChild(card);
  });

  // Render Portals
  portalsContainer.innerHTML = '';
  OFFICIAL_PORTALS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'portal-card';
    card.innerHTML = `
      <div>
        <span class="portal-badge">${p.badge}</span>
        <h4 class="portal-title">${p.title}</h4>
        <div class="portal-title-ur">${p.titleUr}</div>
        <p class="portal-desc">${p.desc}</p>
      </div>
      <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn-portal">
        <span>🌐</span> <span>${isUr ? 'پورٹل ملاحظہ کریں' : 'Open Official Portal'}</span> <span>↗</span>
      </a>
    `;
    portalsContainer.appendChild(card);
  });
}

// Render Laws & Knowledgebase
function renderRightsGuide() {
  const container = document.getElementById('laws-grid-container');
  if (!container) return;

  const isUr = state.lang === 'ur';
  container.innerHTML = '';

  PAKISTAN_LAWS_GUIDE.forEach(law => {
    const card = document.createElement('div');
    card.className = 'law-card';
    card.innerHTML = `
      <h4 class="law-act">${law.act}</h4>
      <div class="law-act-ur">${law.actUr}</div>
      <p class="law-scope">${law.scope}</p>
      <div class="law-penalty">
        <strong>${isUr ? 'قانونی تحفظ / دادرسی:' : 'Enforcement & Penalty:'}</strong> ${law.penalty}
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Case Persistence & Tracking Logic ---
async function saveCurrentDrafterToDb() {
  const saveBtn = document.getElementById('btn-save-case-db');
  if (saveBtn) saveBtn.classList.add('loading');

  const subject = document.getElementById('edit-subject')?.value || 'Official Grievance Petition';
  const recipientTitle = document.getElementById('edit-recipient-title')?.value || '';
  const recipientDept = document.getElementById('edit-recipient-dept')?.value || '';
  const recipientAddress = document.getElementById('edit-recipient-address')?.value || '';
  const applicantName = document.getElementById('edit-applicant-name')?.value || 'Muhammad Ali Khan';
  const applicantCnic = document.getElementById('edit-applicant-cnic')?.value || '';
  const applicantPhone = document.getElementById('edit-applicant-phone')?.value || '';
  const applicantAddress = document.getElementById('edit-applicant-address')?.value || '';
  const referenceId = document.getElementById('edit-reference-id')?.value || '';
  const bodyText = document.getElementById('edit-body-text')?.value || '';
  const prayerText = document.getElementById('edit-prayer-text')?.value || '';

  const paragraphs = bodyText.split(/\n+/).map(p => p.trim()).filter(Boolean);

  const draftEn = {
    recipientTitle,
    recipientDept,
    recipientAddress,
    subject,
    applicantName,
    applicantCnic,
    applicantAddress,
    applicantPhone,
    referenceId,
    bodyParagraphs: paragraphs,
    prayerClause: prayerText,
    closing: state.lang === 'ur' ? 'العارض:' : 'Yours obediently,',
    date: document.getElementById('doc-date-val')?.textContent || '19 October 2026'
  };

  const draftUr = state.currentDiagnosis?.draftUr || ainaEngine.generateUrduComplaint(state.currentDiagnosis?.category || 'utilities', subject, '19 اکتوبر 2026');

  const payload = {
    category: state.currentDiagnosis?.category || 'utilities',
    severity: state.currentDiagnosis?.severity || 'Medium',
    title: subject.length > 80 ? subject.substring(0, 77) + '...' : subject,
    description: paragraphs[0] || subject,
    authorityName: state.currentDiagnosis?.authorityEn || recipientDept || 'Competent Authority',
    authorityNameUr: state.currentDiagnosis?.authorityUr || 'متعلقہ مجاز ادارہ',
    department: state.currentDiagnosis?.department || recipientTitle,
    applicantName,
    applicantCnic,
    applicantPhone,
    applicantAddress,
    referenceId,
    draftEn,
    draftUr,
    roadmap: state.currentDiagnosis?.roadmap || null,
    statutoryDays: state.currentDiagnosis?.statutoryDays || '15 Days',
    legalAct: state.currentDiagnosis?.legalAct || 'Applicable Public Service Regulations',
    escalationOfficer: state.currentDiagnosis?.escalationOfficer || 'Wafaqi Mohtasib / High Court',
    status: 'draft'
  };

  try {
    const res = await apiClient.saveCase(payload);
    if (res && res.success) {
      const createdCase = res.data;
      state.currentCase = createdCase;
      state.currentTrackingId = createdCase.tracking_id;

      // Show confirmation modal
      const modalSaved = document.getElementById('modal-case-saved');
      const trackingEl = document.getElementById('saved-modal-tracking-id');
      if (trackingEl) trackingEl.textContent = createdCase.tracking_id;
      if (modalSaved) modalSaved.style.display = 'flex';

      showToast(`Case saved to national database: ${createdCase.tracking_id}`, 'success');
      loadTrackingDashboard();
    }
  } catch (err) {
    showToast(`Error saving case: ${err.message}`, 'error');
  } finally {
    if (saveBtn) saveBtn.classList.remove('loading');
  }
}

async function loadTrackingDashboard(filterStatus = 'all', searchQuery = '') {
  // Update platform overview analytics
  try {
    const analytics = await apiClient.getAnalytics();
    if (analytics) {
      setElText('stat-total-cases', analytics.totalCases ?? 1);
      setElText('stat-active-cases', analytics.activeCases ?? 1);
      setElText('stat-avg-days', `${analytics.averageStatutoryDays || 14} Days`);
    }
  } catch (err) {
    console.warn('Could not load analytics:', err.message);
  }

  // Load cases list
  try {
    const cases = await apiClient.searchCases(searchQuery, 'all', filterStatus);
    const container = document.getElementById('cases-grid-container');
    if (!container) return;

    if (cases.length === 0) {
      container.innerHTML = `<p class="no-results" style="padding: 20px; color: var(--text-muted);">No tracked petitions found matching "${searchQuery || filterStatus}".</p>`;
      return;
    }

    container.innerHTML = '';
    cases.forEach(c => {
      const card = document.createElement('div');
      card.className = 'case-summary-card';
      const statusClass = `status-${c.status}`;
      const statusLabel = c.status ? c.status.replace(/_/g, ' ') : 'draft';

      card.innerHTML = `
        <div class="summary-card-header">
          <span class="summary-code">${c.tracking_id}</span>
          <span class="status-pill-badge ${statusClass}">${statusLabel}</span>
        </div>
        <h4 class="summary-title">${c.title}</h4>
        <p class="summary-authority">🏛️ ${c.authority_name || 'Competent Authority'}</p>
        <div class="summary-footer">
          <span>Diary: <strong>${c.diary_number || 'Pending'}</strong></span>
          <span>${new Date(c.created_at).toLocaleDateString()}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        inspectCase(c.tracking_id);
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.warn('Could not load cases list:', err.message);
  }
}

async function inspectCase(trackingId) {
  if (!trackingId) return;
  try {
    const caseData = await apiClient.getCase(trackingId);
    if (!caseData) {
      showToast(`Case '${trackingId}' not found.`, 'info');
      return;
    }

    state.currentCase = caseData;
    state.currentTrackingId = caseData.tracking_id;

    // Show container
    const detailContainer = document.getElementById('case-detail-container');
    if (detailContainer) detailContainer.style.display = 'flex';

    // Populate overview fields
    setElText('case-view-tracking-id', caseData.tracking_id);
    setElText('case-view-title', caseData.title);
    setElText('case-view-desc', caseData.description || 'No additional narrative description recorded.');
    setElText('case-view-authority', `${caseData.authority_name} ${caseData.department ? '(' + caseData.department + ')' : ''}`);
    setElText('case-view-diary', caseData.diary_number || 'Pending Receiving Diary');
    setElText('case-view-applicant', `${caseData.applicant_name} • CNIC: ${caseData.applicant_cnic_masked || 'Masked'}`);
    setElText('case-view-law', `${caseData.legal_act || 'Public Law'} (Timeline: ${caseData.statutory_days || '15 Days'})`);

    // Severity & Status
    setElText('case-view-severity', `Severity: ${caseData.severity || 'Medium'}`);
    const statusEl = document.getElementById('case-view-status');
    if (statusEl) {
      statusEl.textContent = (caseData.status || 'draft').replace(/_/g, ' ');
      statusEl.className = `status-pill-badge status-${caseData.status}`;
    }

    // Render Progress Stepper
    renderCaseProgressStepper(caseData.status);

    // Render Timeline Feed
    renderCaseTimeline(caseData.timeline || []);

    // Smooth scroll to details
    detailContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast(`Error loading case: ${err.message}`, 'error');
  }
}

function renderCaseProgressStepper(currentStatus = 'draft') {
  const stepperTrack = document.getElementById('case-stepper-track');
  if (!stepperTrack) return;

  const steps = [
    { key: 'draft', label: '1. Draft Created' },
    { key: 'filed', label: '2. Petition Filed' },
    { key: 'diary_assigned', label: '3. Diary Assigned' },
    { key: 'under_investigation', label: '4. Inquiry / Hearing' },
    { key: 'resolved', label: '5. Redressal / Relief' }
  ];

  const statusOrder = ['draft', 'filed', 'diary_assigned', 'under_investigation', 'resolved'];
  let currentIdx = statusOrder.indexOf(currentStatus);
  if (currentIdx === -1) currentIdx = 1;

  stepperTrack.innerHTML = '';
  steps.forEach((step, idx) => {
    const stepEl = document.createElement('div');
    let stepClass = 'stepper-step';
    if (idx < currentIdx) stepClass += ' completed';
    else if (idx === currentIdx) stepClass += ' active';

    stepEl.className = stepClass;
    stepEl.innerHTML = `
      <div class="step-node">${idx < currentIdx ? '✓' : idx + 1}</div>
      <span class="step-label">${step.label}</span>
    `;
    stepperTrack.appendChild(stepEl);
  });
}

function renderCaseTimeline(timeline = []) {
  const feed = document.getElementById('case-timeline-feed');
  if (!feed) return;

  if (timeline.length === 0) {
    feed.innerHTML = '<p class="text-muted" style="padding: 10px 0;">No timeline milestones logged yet.</p>';
    return;
  }

  feed.innerHTML = '';
  timeline.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';
    const timeFormatted = new Date(item.created_at).toLocaleString();
    const stageName = (item.stage || 'Update').replace(/_/g, ' ');

    itemEl.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-header">
        <span class="timeline-stage">${stageName}</span>
        <span class="timeline-time">${timeFormatted}</span>
        ${item.officer ? `<span class="timeline-officer">By: ${item.officer}</span>` : ''}
      </div>
      <p class="timeline-note">${item.note}</p>
    `;
    feed.appendChild(itemEl);
  });
}

async function handleCaseUpdateSubmit() {
  if (!state.currentCase) return;
  const diaryNumber = document.getElementById('input-update-diary')?.value?.trim();
  const status = document.getElementById('select-update-status')?.value;
  const officer = document.getElementById('input-update-officer')?.value?.trim();
  const note = document.getElementById('input-update-note')?.value?.trim();

  try {
    const updated = await apiClient.updateCaseStatus(state.currentCase.tracking_id, {
      status,
      diaryNumber,
      officer,
      note
    });

    if (updated) {
      showToast('Official receiving diary & status updated!', 'success');
      const modalUpdate = document.getElementById('modal-case-update');
      if (modalUpdate) modalUpdate.style.display = 'none';
      inspectCase(state.currentCase.tracking_id);
      loadTrackingDashboard();
    }
  } catch (err) {
    showToast(`Failed to update status: ${err.message}`, 'error');
  }
}

async function handleExportCaseText() {
  if (!state.currentCase) return;
  try {
    const text = await apiClient.exportPetition(state.currentCase.tracking_id, state.lang === 'ur' ? 'ur' : 'en');
    navigator.clipboard.writeText(text).then(() => {
      showToast('Petition text copied to clipboard! Ready to print/file.', 'success');
    }).catch(() => {
      alert(text);
    });
  } catch (err) {
    showToast(`Export error: ${err.message}`, 'error');
  }
}

function handleLoadInDrafter() {
  if (!state.currentCase) return;
  const c = state.currentCase;
  const draft = state.currentDocLang === 'ur' ? c.draftUr : c.draftEn;
  if (draft) {
    loadDiagnosisIntoDrafter(state.currentDocLang === 'ur' ? { draftUr: draft } : { draftEn: draft });
  }

  // Switch to drafter tab
  const drafterTab = document.getElementById('tab-btn-drafter');
  if (drafterTab) drafterTab.click();
}

// Setup Event Listeners
function setupEventListeners() {
  // Keyboard shortcuts: Alt+1..5 switch main sections; Escape closes open dialogs.
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target && (target.matches('input, textarea, select, [contenteditable="true"]'));
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(modal => {
        if (modal.classList.contains('active') || getComputedStyle(modal).display !== 'none') {
          modal.classList.remove('active');
        }
      });
      return;
    }
    if (!typing && event.altKey && /^[1-5]$/.test(event.key)) {
      event.preventDefault();
      document.getElementById(['tab-btn-assistant','tab-btn-drafter','tab-btn-directory','tab-btn-rights','tab-btn-tracking'][Number(event.key)-1])?.click();
    }
  });

  // Navigation Tabs Switching
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.querySelectorAll('.tab-item').forEach(b => {
        b.setAttribute('aria-selected', String(b === btn));
        b.setAttribute('aria-current', b === btn ? 'page' : 'false');
      });
      const panel = document.getElementById(targetId);
      if (panel) {
        panel.classList.add('active');
        panel.setAttribute('aria-live', 'polite');
      }
      state.activeTab = targetId;

      if (targetId === 'tab-tracking') {
        loadTrackingDashboard();
        if (state.currentTrackingId) {
          inspectCase(state.currentTrackingId);
        }
      }
    });
  });

  // Language Switch Buttons
  document.getElementById('btn-lang-en')?.addEventListener('click', () => setLanguage('en'));
  document.getElementById('btn-lang-ur')?.addEventListener('click', () => setLanguage('ur'));

  // Theme Toggle Button
  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeIcon = document.querySelector('#btn-theme-toggle .theme-icon');
    if (themeIcon) themeIcon.textContent = state.theme === 'dark' ? '🌙' : '☀️';
  });

  // Voice Mic Button
  document.getElementById('btn-toggle-mic')?.addEventListener('click', () => {
    if (!speechHandler || !speechHandler.isSupported()) {
      showToast('Speech recognition is not supported in this browser. Please use Chrome/Edge or type directly.', 'info');
      return;
    }
    speechHandler.toggle();
  });

  // Clear Input Button
  document.getElementById('btn-clear-input')?.addEventListener('click', () => {
    const input = document.getElementById('user-issue-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  });

  // Analyze Button
  document.getElementById('btn-analyze-issue')?.addEventListener('click', handleAnalyzeIssue);

  // Enter Key in Textarea (Ctrl+Enter or Cmd+Enter to submit)
  document.getElementById('user-issue-input')?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyzeIssue();
    }
  });

  // Read Aloud / Audio Narration Button
  let isNarrating = false;
  document.getElementById('btn-read-roadmap')?.addEventListener('click', () => {
    if (!state.currentDiagnosis) return;
    if (isNarrating) {
      speechHandler.stopSpeaking();
      isNarrating = false;
      setElText('label-read-aloud', I18N[state.lang].readAloud);
      return;
    }

    const isUr = state.lang === 'ur';
    let textToSpeak = isUr ? `مسئلہ کی تشخیص: ${state.currentDiagnosis.issueSummaryUr}. ` : `Issue Diagnosis: ${state.currentDiagnosis.issueSummaryEn}. `;
    state.currentDiagnosis.roadmap.forEach((phase, idx) => {
      textToSpeak += isUr ? `مرحلہ ${idx + 1}: ${phase.phaseUr}. ` : `Phase ${idx + 1}: ${phase.phaseEn}. `;
      const tasks = isUr ? phase.tasksUr : phase.tasksEn;
      textToSpeak += tasks.join('. ') + '. ';
    });

    speechHandler.speak(textToSpeak, state.lang);
    isNarrating = true;
    setElText('label-read-aloud', I18N[state.lang].stopReading);
  });

  // CTA button: Open Drafter
  document.getElementById('btn-go-to-drafter')?.addEventListener('click', () => {
    const drafterTabBtn = document.getElementById('tab-btn-drafter');
    if (drafterTabBtn) drafterTabBtn.click();
  });

  // Reactive Inputs in Drafter Form
  const formInputIds = [
    'edit-recipient-title',
    'edit-recipient-dept',
    'edit-recipient-address',
    'edit-subject',
    'edit-applicant-name',
    'edit-applicant-cnic',
    'edit-applicant-phone',
    'edit-reference-id',
    'edit-applicant-address',
    'edit-body-text',
    'edit-prayer-text'
  ];
  formInputIds.forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateLiveDocPreview);
  });

  // Drafter Language Buttons (English Formal / Urdu Darkhwast)
  document.getElementById('btn-doc-lang-en')?.addEventListener('click', () => {
    state.currentDocLang = 'en';
    document.getElementById('btn-doc-lang-en').classList.add('active');
    document.getElementById('btn-doc-lang-ur').classList.remove('active');
    if (state.currentDiagnosis) {
      loadDiagnosisIntoDrafter(state.currentDiagnosis);
    } else {
      updateLiveDocPreview();
    }
  });

  document.getElementById('btn-doc-lang-ur')?.addEventListener('click', () => {
    state.currentDocLang = 'ur';
    document.getElementById('btn-doc-lang-ur').classList.add('active');
    document.getElementById('btn-doc-lang-en').classList.remove('active');
    if (state.currentDiagnosis) {
      loadDiagnosisIntoDrafter(state.currentDiagnosis);
    } else {
      // Load sample Urdu complaint
      const urduDraft = ainaEngine.generateUrduComplaint('utilities', '', '19 اکتوبر 2026');
      loadDiagnosisIntoDrafter({ draftUr: urduDraft });
    }
  });

  // Preset Template Selector
  document.getElementById('select-preset-template')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'current' && state.currentDiagnosis) {
      loadDiagnosisIntoDrafter(state.currentDiagnosis);
      return;
    }
    const catMap = {
      'electricity-overbilling': 'utilities',
      'police-refusing-fir': 'police',
      'nadra-blocked-cnic': 'identity',
      'fia-cybercrime-scam': 'cybercrime',
      'consumer-defective-item': 'consumer',
      'wasa-sewage-overflow': 'municipal'
    };
    const cat = catMap[val] || 'utilities';
    const draft = state.currentDocLang === 'ur'
      ? ainaEngine.generateUrduComplaint(cat, '', '19 اکتوبر 2026')
      : ainaEngine.generateEnglishComplaint(cat, '', '19 October 2026');
    loadDiagnosisIntoDrafter(state.currentDocLang === 'ur' ? { draftUr: draft } : { draftEn: draft });
  });

  // Copy Document Text Button
  document.getElementById('btn-copy-doc')?.addEventListener('click', () => {
    const docEl = document.getElementById('printable-document');
    if (!docEl) return;
    const text = docEl.innerText;
    navigator.clipboard.writeText(text).then(() => {
      showToast(state.lang === 'ur' ? 'درخواست کا متن کاپی ہو گیا!' : 'Formal complaint copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Could not copy automatically. Please select text manually.', 'info');
    });
  });

  // Print Document Button
  document.getElementById('btn-print-doc')?.addEventListener('click', () => {
    window.print();
  });

  // Directory Search & Filter Pills
  document.getElementById('input-directory-search')?.addEventListener('input', (e) => {
    const activePill = document.querySelector('.filter-pill.active');
    const filter = activePill ? activePill.getAttribute('data-filter') : 'all';
    renderCivicDirectory(filter, e.target.value);
  });

  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');
      const search = document.getElementById('input-directory-search')?.value || '';
      renderCivicDirectory(filter, search);
    });
  });

  // Disclaimer Dismiss
  document.getElementById('btn-dismiss-disclaimer')?.addEventListener('click', () => {
    const banner = document.querySelector('.disclaimer-banner');
    if (banner) banner.style.display = 'none';
  });

  // Settings Modal Controls
  const modalSettings = document.getElementById('modal-settings');
  document.getElementById('btn-open-settings')?.addEventListener('click', () => {
    const keyInput = document.getElementById('input-gemini-key');
    const modelSelect = document.getElementById('select-gemini-model');
    if (keyInput) keyInput.value = state.geminiKey;
    if (modelSelect) modelSelect.value = state.selectedModel;
    updateKeyStatusIndicator();
    if (modalSettings) modalSettings.style.display = 'flex';
  });

  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    if (modalSettings) modalSettings.style.display = 'none';
  });

  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    const keyInput = document.getElementById('input-gemini-key');
    const modelSelect = document.getElementById('select-gemini-model');
    if (keyInput && modelSelect) {
      state.geminiKey = keyInput.value.trim();
      state.selectedModel = modelSelect.value;
      ainaEngine.setApiKey(state.geminiKey);
      localStorage.setItem('aina_gemini_model', state.selectedModel);
      showToast(state.geminiKey ? 'Gemini API Key activated!' : 'Using Built-in Cognitive Civic Matrix', 'success');
    }
    if (modalSettings) modalSettings.style.display = 'none';
  });

  document.getElementById('btn-clear-key')?.addEventListener('click', () => {
    state.geminiKey = '';
    ainaEngine.setApiKey('');
    const keyInput = document.getElementById('input-gemini-key');
    if (keyInput) keyInput.value = '';
    updateKeyStatusIndicator();
    showToast('Gemini API Key removed. Engine reverted to built-in civic matrix.', 'info');
  });

  // About Modal Controls
  const modalAbout = document.getElementById('modal-about');
  document.getElementById('btn-open-about')?.addEventListener('click', () => {
    if (modalAbout) modalAbout.style.display = 'flex';
  });
  document.getElementById('btn-close-about')?.addEventListener('click', () => {
    if (modalAbout) modalAbout.style.display = 'none';
  });
  document.getElementById('btn-dismiss-about')?.addEventListener('click', () => {
    if (modalAbout) modalAbout.style.display = 'none';
  });

  // Save & Track Complaint Button in Drafter
  document.getElementById('btn-save-case-db')?.addEventListener('click', saveCurrentDrafterToDb);

  // Search Case in Tracking Tab
  document.getElementById('btn-search-case')?.addEventListener('click', () => {
    const query = document.getElementById('input-tracking-id')?.value?.trim();
    if (query) {
      if (query.toUpperCase().startsWith('AINA-PK-')) {
        inspectCase(query);
      } else {
        loadTrackingDashboard('all', query);
      }
    } else {
      loadTrackingDashboard();
    }
  });

  document.getElementById('input-tracking-id')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btn-search-case')?.click();
    }
  });

  // Tracking Filter Pills
  document.querySelectorAll('#tracking-status-filters .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#tracking-status-filters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const status = pill.getAttribute('data-status');
      const q = document.getElementById('input-tracking-id')?.value || '';
      loadTrackingDashboard(status, q);
    });
  });

  // Copy tracking codes
  document.getElementById('btn-copy-tracking-id')?.addEventListener('click', () => {
    if (state.currentTrackingId) {
      navigator.clipboard.writeText(state.currentTrackingId).then(() => {
        showToast('Tracking ID copied to clipboard!', 'success');
      });
    }
  });

  document.getElementById('btn-copy-saved-id')?.addEventListener('click', () => {
    const text = document.getElementById('saved-modal-tracking-id')?.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Tracking ID copied to clipboard!', 'success');
      });
    }
  });

  // Saved Modal Actions
  const modalCaseSaved = document.getElementById('modal-case-saved');
  document.getElementById('btn-close-saved-modal')?.addEventListener('click', () => {
    if (modalCaseSaved) modalCaseSaved.style.display = 'none';
  });
  document.getElementById('btn-dismiss-saved-modal')?.addEventListener('click', () => {
    if (modalCaseSaved) modalCaseSaved.style.display = 'none';
  });
  document.getElementById('btn-view-saved-timeline')?.addEventListener('click', () => {
    if (modalCaseSaved) modalCaseSaved.style.display = 'none';
    const tabTrackingBtn = document.getElementById('tab-btn-tracking');
    if (tabTrackingBtn) tabTrackingBtn.click();
  });

  // Case Update Modal Controls
  const modalCaseUpdate = document.getElementById('modal-case-update');
  document.getElementById('btn-open-update-modal')?.addEventListener('click', () => {
    if (!state.currentCase) return;
    const inputDiary = document.getElementById('input-update-diary');
    const selectStatus = document.getElementById('select-update-status');
    if (inputDiary) inputDiary.value = state.currentCase.diary_number || '';
    if (selectStatus) selectStatus.value = state.currentCase.status || 'draft';
    if (modalCaseUpdate) modalCaseUpdate.style.display = 'flex';
  });

  document.getElementById('btn-close-update-modal')?.addEventListener('click', () => {
    if (modalCaseUpdate) modalCaseUpdate.style.display = 'none';
  });
  document.getElementById('btn-cancel-update-modal')?.addEventListener('click', () => {
    if (modalCaseUpdate) modalCaseUpdate.style.display = 'none';
  });
  document.getElementById('btn-submit-case-update')?.addEventListener('click', handleCaseUpdateSubmit);

  // Case Actions: Export & Load in Drafter
  document.getElementById('btn-export-case-text')?.addEventListener('click', handleExportCaseText);
  document.getElementById('btn-load-in-drafter')?.addEventListener('click', handleLoadInDrafter);

  // Close modals on outside backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === modalSettings) modalSettings.style.display = 'none';
    if (e.target === modalAbout) modalAbout.style.display = 'none';
    if (e.target === modalCaseSaved) modalCaseSaved.style.display = 'none';
    if (e.target === modalCaseUpdate) modalCaseUpdate.style.display = 'none';
  });
}

function updateKeyStatusIndicator() {
  const indicator = document.getElementById('key-status-indicator');
  if (!indicator) return;
  if (state.geminiKey) {
    indicator.textContent = `● Google Gemini Live Connected (${state.selectedModel})`;
    indicator.style.color = '#34d399';
  } else {
    indicator.textContent = `● Built-in Civic Matrix Active (No API Key required)`;
    indicator.style.color = '#f59e0b';
  }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  setupSpeechEngine();
  setupEventListeners();
  renderSampleChips();
  renderCivicDirectory();
  renderRightsGuide();
  updateLiveDocPreview();
  loadTrackingDashboard();
});
