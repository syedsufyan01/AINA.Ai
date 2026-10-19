import db from '../config/db.js';

export class AnalyticsService {
  getOverview() {
    // Total Cases & Statuses
    const totalCases = db.prepare('SELECT COUNT(*) as count FROM cases').get().count;
    const resolvedCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'resolved'").get().count;
    const filedCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status != 'draft'").get().count;

    // By Category
    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM cases 
      GROUP BY category 
      ORDER BY count DESC
    `).all();

    // By Status
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM cases 
      GROUP BY status 
      ORDER BY count DESC
    `).all();

    // Top Targeted Authorities
    const topAuthorities = db.prepare(`
      SELECT authority_name, COUNT(*) as count 
      FROM cases 
      GROUP BY authority_name 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    // Recent Timeline Milestones
    const recentActivity = db.prepare(`
      SELECT ct.stage, ct.note, ct.officer, ct.created_at, c.tracking_id, c.title, c.category
      FROM case_timeline ct
      JOIN cases c ON c.id = ct.case_id
      ORDER BY ct.created_at DESC
      LIMIT 8
    `).all();

    return {
      totalCases,
      filedCases,
      resolvedCases,
      activeCases: totalCases - resolvedCases,
      averageStatutoryDays: 14,
      categoryDistribution: categoryCounts,
      statusDistribution: statusCounts,
      topAuthorities,
      recentActivity
    };
  }

  recordEvent(eventType, category = null, language = 'en', meta = {}) {
    const stmt = db.prepare(`
      INSERT INTO analytics_events (event_type, category, language, meta, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const metaStr = typeof meta === 'object' ? JSON.stringify(meta) : null;
    return stmt.run(eventType, category, language, metaStr);
  }
}

export const analyticsService = new AnalyticsService();
