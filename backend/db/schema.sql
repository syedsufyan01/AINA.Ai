-- Project AINA - Pakistani Civic Assistant Database Schema
-- Uses SQLite with Foreign Keys and WAL Mode

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  authority_name TEXT NOT NULL,
  authority_name_ur TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, filed, diary_assigned, under_investigation, hearing_scheduled, resolved, escalated
  diary_number TEXT,
  applicant_name TEXT,
  applicant_cnic_masked TEXT,
  applicant_phone TEXT,
  applicant_address TEXT,
  reference_id TEXT,
  draft_en TEXT, -- JSON serialized formal English petition
  draft_ur TEXT, -- JSON serialized formal Urdu petition
  roadmap TEXT,  -- JSON serialized actionable phases
  statutory_days TEXT DEFAULT '15 Days',
  legal_act TEXT,
  escalation_officer TEXT,
  filed_at DATETIME,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_tracking_id ON cases(tracking_id);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_phone ON cases(applicant_phone);

CREATE TABLE IF NOT EXISTS case_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  note TEXT NOT NULL,
  officer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON case_timeline(case_id);

CREATE TABLE IF NOT EXISTS civic_directory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_ur TEXT NOT NULL,
  category TEXT NOT NULL,
  helpline TEXT NOT NULL,
  alternate_contact TEXT,
  online_portal TEXT,
  jurisdiction TEXT NOT NULL DEFAULT 'Federal',
  description TEXT,
  description_ur TEXT,
  badge TEXT DEFAULT 'Verified'
);

CREATE INDEX IF NOT EXISTS idx_directory_category ON civic_directory(category);

CREATE TABLE IF NOT EXISTS legal_statutes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  act_name TEXT NOT NULL,
  act_name_ur TEXT NOT NULL,
  category TEXT NOT NULL,
  relevant_sections TEXT NOT NULL,
  statutory_timeframe TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_ur TEXT NOT NULL,
  penalty_clause TEXT
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- diagnosis, draft_export, case_filed, helpline_call, search
  category TEXT,
  language TEXT DEFAULT 'en',
  meta TEXT, -- JSON extra metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at);
