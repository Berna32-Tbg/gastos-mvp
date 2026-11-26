export const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS categories(
  id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT,
  synced INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS budgets(
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount REAL NOT NULL CHECK(amount > 0),
  period TEXT NOT NULL CHECK(period IN ('weekly','monthly')),
  start_date TEXT NOT NULL,
  synced INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS expenses(
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  amount REAL NOT NULL CHECK(amount > 0),
  description TEXT, date TEXT NOT NULL, receipt_path TEXT,
  synced INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);
`;
