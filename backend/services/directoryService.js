import db from '../config/db.js';

export class DirectoryService {
  getAll(category = 'all', search = '') {
    let sql = 'SELECT * FROM civic_directory WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR name_ur LIKE ? OR helpline LIKE ? OR description LIKE ? OR description_ur LIKE ?)';
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q, q);
    }

    sql += ' ORDER BY id ASC';
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  }

  getCategories() {
    const stmt = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM civic_directory 
      GROUP BY category
    `);
    return stmt.all();
  }

  getById(id) {
    const stmt = db.prepare('SELECT * FROM civic_directory WHERE id = ?');
    return stmt.get(id);
  }
}

export const directoryService = new DirectoryService();
