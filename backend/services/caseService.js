import crypto from 'crypto';
import db from '../config/db.js';
import { aiService } from './aiService.js';

export class CaseService {
  generateTrackingId() {
    const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AINA-PK-2026-${randomCode}`;
  }

  maskCnic(cnic) {
    if (!cnic) return null;
    const clean = cnic.replace(/[^0-9]/g, '');
    if (clean.length === 13) {
      // e.g. 35201-1234567-1 -> 35201-*****67-1
      return `${clean.slice(0, 5)}-*****${clean.slice(10, 12)}-${clean.slice(12)}`;
    }
    return cnic;
  }

  createCase(data) {
    const trackingId = this.generateTrackingId();
    const maskedCnic = this.maskCnic(data.applicantCnic);
    const category = data.category || 'utilities';
    const description = data.description || '';

    const generatedDraftEn = data.draftEn || aiService.generateComplaintLetter(category, description, 'en');
    const generatedDraftUr = data.draftUr || aiService.generateComplaintLetter(category, description, 'ur');
    const generatedRoadmap = data.roadmap || aiService.generateRoadmap(category, description, 'en');

    const draftEn = typeof generatedDraftEn === 'object' ? JSON.stringify(generatedDraftEn) : generatedDraftEn;
    const draftUr = typeof generatedDraftUr === 'object' ? JSON.stringify(generatedDraftUr) : generatedDraftUr;
    const roadmap = typeof generatedRoadmap === 'object' ? JSON.stringify(generatedRoadmap) : generatedRoadmap;
    const status = data.status || 'draft';
    const filedAt = status === 'filed' || status === 'diary_assigned' ? new Date().toISOString() : null;

    const stmt = db.prepare(`
      INSERT INTO cases (
        tracking_id, category, severity, title, description, authority_name, authority_name_ur,
        department, status, diary_number, applicant_name, applicant_cnic_masked, applicant_phone,
        applicant_address, reference_id, draft_en, draft_ur, roadmap, statutory_days, legal_act,
        escalation_officer, filed_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    const result = stmt.run(
      trackingId,
      data.category || 'utilities',
      data.severity || 'Medium',
      data.title || 'Civic Problem Grievance',
      data.description || '',
      data.authorityName || 'Competent Authority',
      data.authorityNameUr || 'متعلقہ مجاز ادارہ',
      data.department || null,
      status,
      data.diaryNumber || null,
      data.applicantName || 'Citizen Applicant',
      maskedCnic,
      data.applicantPhone || null,
      data.applicantAddress || null,
      data.referenceId || null,
      draftEn,
      draftUr,
      roadmap,
      data.statutoryDays || '15 Days',
      data.legalAct || 'Applicable Public Service Regulations',
      data.escalationOfficer || 'Federal / Provincial Ombudsman',
      filedAt
    );

    const caseId = result.lastInsertRowid;

    // Create initial timeline milestone
    const initialStage = status === 'draft' ? 'draft_created' : 'filed';
    const initialNote = data.diaryNumber
      ? `Case officially registered with Diary No: ${data.diaryNumber}`
      : `Case created and petition generated via AINA Smart Drafter.`;

    this.insertTimelineRecord(caseId, initialStage, initialNote, data.applicantName || 'Applicant');

    return this.getCaseByTrackingId(trackingId);
  }

  insertTimelineRecord(caseId, stage, note, officer) {
    const stmt = db.prepare(`
      INSERT INTO case_timeline (case_id, stage, note, officer, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(caseId, stage, note, officer || null);
  }

  getCaseByTrackingId(trackingId) {
    const stmt = db.prepare(`
      SELECT * FROM cases WHERE tracking_id = ?
    `);
    const caseData = stmt.get(trackingId);
    if (!caseData) return null;

    // Fetch timeline events
    const timelineStmt = db.prepare(`
      SELECT * FROM case_timeline WHERE case_id = ? ORDER BY created_at ASC
    `);
    const timeline = timelineStmt.all(caseData.id);

    return {
      ...caseData,
      draftEn: caseData.draft_en ? JSON.parse(caseData.draft_en) : null,
      draftUr: caseData.draft_ur ? JSON.parse(caseData.draft_ur) : null,
      roadmap: caseData.roadmap ? JSON.parse(caseData.roadmap) : null,
      timeline
    };
  }

  getCaseById(id) {
    const stmt = db.prepare(`
      SELECT * FROM cases WHERE id = ?
    `);
    const caseData = stmt.get(id);
    if (!caseData) return null;
    return this.getCaseByTrackingId(caseData.tracking_id);
  }

  searchCases(filters = {}) {
    let sql = 'SELECT * FROM cases WHERE 1=1';
    const params = [];

    if (filters.trackingId) {
      sql += ' AND tracking_id LIKE ?';
      params.push(`%${filters.trackingId.trim()}%`);
    }

    if (filters.category && filters.category !== 'all') {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.query) {
      sql += ' AND (tracking_id LIKE ? OR title LIKE ? OR applicant_name LIKE ? OR applicant_phone LIKE ? OR diary_number LIKE ?)';
      const q = `%${filters.query.trim()}%`;
      params.push(q, q, q, q, q);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 20, filters.offset || 0);

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);

    return rows.map(row => ({
      ...row,
      draftEn: row.draft_en ? JSON.parse(row.draft_en) : null,
      draftUr: row.draft_ur ? JSON.parse(row.draft_ur) : null,
      roadmap: row.roadmap ? JSON.parse(row.roadmap) : null
    }));
  }

  updateStatus(trackingId, { status, diaryNumber, note, officer }) {
    const caseData = this.getCaseByTrackingId(trackingId);
    if (!caseData) return null;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved') {
        updates.push('resolved_at = CURRENT_TIMESTAMP');
      }
    }

    if (diaryNumber !== undefined && diaryNumber !== null) {
      updates.push('diary_number = ?');
      params.push(diaryNumber);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(caseData.id);

    const updateStmt = db.prepare(`
      UPDATE cases SET ${updates.join(', ')} WHERE id = ?
    `);
    updateStmt.run(...params);

    // Record timeline entry
    const stage = status || 'status_updated';
    const timelineNote = note || (diaryNumber ? `Diary Number updated to: ${diaryNumber}` : `Status transitioned to ${status}`);
    this.insertTimelineRecord(caseData.id, stage, timelineNote, officer || 'Officer');

    return this.getCaseByTrackingId(trackingId);
  }

  addTimelineMilestone(trackingId, { stage, note, officer }) {
    const caseData = this.getCaseByTrackingId(trackingId);
    if (!caseData) return null;

    this.insertTimelineRecord(caseData.id, stage, note, officer);
    return this.getCaseByTrackingId(trackingId);
  }

  exportFormattedPetition(trackingId, lang = 'en') {
    const caseData = this.getCaseByTrackingId(trackingId);
    if (!caseData) return null;

    const draft = (lang === 'ur' ? caseData.draftUr : caseData.draftEn) || aiService.generateComplaintLetter(caseData.category, caseData.description, lang);
    if (!draft) return null;

    if (lang === 'ur') {
      return `
========================================================================
                      بخدمتِ عالیہ: سرکاری باضابطہ درخواست
========================================================================
ریکارڈ ٹریکنگ کوڈ: ${caseData.tracking_id}
تاریخ: ${draft.date || '19 اکتوبر 2026'}
ڈائری نمبر: ${caseData.diary_number || 'زیرِ کارروائی'}

مخاطب:
${draft.recipientTitle || ''}
${draft.recipientDept || ''}
${draft.recipientAddress || ''}

عنوان: ${draft.subject || ''}
ریفرنس نمبر: ${draft.referenceId || ''}

جنابِ عالی!
${(draft.bodyParagraphs || []).join('\n\n')}

استدعا:
${draft.prayerClause || ''}

${draft.closing || 'العارض:'}
سائل: ${draft.applicantName || caseData.applicant_name}
شناختی کارڈ نمبر: ${caseData.applicant_cnic_masked || draft.applicantCnic}
موبائل فون: ${draft.applicantPhone || caseData.applicant_phone}
پتہ: ${draft.applicantAddress || caseData.applicant_address}
========================================================================
ایپلی کیشن تیار کردہ: آئینہ (AINA) قومی معاون برائے شہری امور
      `.trim();
    }

    return `
========================================================================
               GOVERNMENT OF PAKISTAN • FORMAL CITIZEN PETITION
========================================================================
AINA Tracking Code: ${caseData.tracking_id}
Date: ${draft.date || '19 October 2026'}
Official Receiving Diary No: ${caseData.diary_number || '[Pending Receiving]'}

To,
${draft.recipientTitle || ''}
${draft.recipientDept || ''}
${draft.recipientAddress || ''}

SUBJECT: ${draft.subject || ''}
Reference ID: ${draft.referenceId || ''}

Respected Sir / Madam,

${(draft.bodyParagraphs || []).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

PRAYER / RELIEF SOUGHT:
${draft.prayerClause || ''}

${draft.closing || 'Yours obediently,'}
Applicant: ${draft.applicantName || caseData.applicant_name}
CNIC: ${caseData.applicant_cnic_masked || draft.applicantCnic}
Phone: ${draft.applicantPhone || caseData.applicant_phone}
Address: ${draft.applicantAddress || caseData.applicant_address}
========================================================================
Generated by: AINA (AI National Assistant) • Civic Grievance System
    `.trim();
  }
}

export const caseService = new CaseService();
