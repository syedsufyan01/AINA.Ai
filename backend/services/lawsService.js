import db from '../config/db.js';

export class LawsService {
  getAll(category = 'all', query = '') {
    let sql = 'SELECT * FROM legal_statutes WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (query && query.trim()) {
      sql += ' AND (act_name LIKE ? OR act_name_ur LIKE ? OR relevant_sections LIKE ? OR summary_en LIKE ? OR summary_ur LIKE ?)';
      const q = `%${query.trim()}%`;
      params.push(q, q, q, q, q);
    }

    sql += ' ORDER BY id ASC';
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  }

  getById(id) {
    const stmt = db.prepare('SELECT * FROM legal_statutes WHERE id = ?');
    return stmt.get(id);
  }
}

export const lawsService = new LawsService();
