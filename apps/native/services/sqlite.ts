import * as ExpoSQLite from "expo-sqlite";

export type SQLiteDatabase = ExpoSQLite.SQLiteDatabase;

let db: SQLiteDatabase | null = null;

export async function openSQLiteDB(): Promise<SQLiteDatabase> {
  if (!db) {
    db = await ExpoSQLite.openDatabaseAsync("studentos.db");
  }
  return db;
}

export const MIGRATIONS = [
  {
    version: 1,
    name: "V1.0 - Initial",
    queries: [
      `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        course_id TEXT,
        is_pinned INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS flashcard_decks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        color TEXT,
        card_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS flashcard_cards (
        id TEXT PRIMARY KEY,
        deck_id TEXT NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        sm2_interval REAL DEFAULT 0,
        sm2_repetition INTEGER DEFAULT 0,
        sm2_easiness REAL DEFAULT 2.5,
        next_review_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        progress REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS ai_summaries (
        id TEXT PRIMARY KEY,
        note_id TEXT NOT NULL,
        summary_text TEXT NOT NULL,
        model_used TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        conflict_strategy TEXT DEFAULT 'server_wins',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS sync_state (
        key TEXT PRIMARY KEY,
        value TEXT
      );`,
    ],
  },
  {
    version: 2,
    name: "V1.1 - Add next_review_at indexes",
    queries: [
      `CREATE INDEX IF NOT EXISTS idx_flashcard_cards_rev ON flashcard_cards(next_review_at);`,
      `CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_courses_user ON courses(user_id);`,
    ],
  },
  {
    version: 3,
    name: "V1.2 - Add sync_state last_sync_at",
    queries: [
      `INSERT OR IGNORE INTO sync_state (key, value) VALUES ('last_sync_at', '0');`,
      `INSERT OR IGNORE INTO sync_state (key, value) VALUES ('sync_enabled', 'true');`,
    ],
  },
];

export async function runMigrations(): Promise<void> {
  const database = await openSQLiteDB();
  const storedVersion = Number(await database.getAllAsync<{ version: number }>(`PRAGMA user_version;`).then(r => r[0]?.version || 0));
  let currentVersion = storedVersion;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      for (const query of migration.queries) {
        await database.execAsync(query);
      }
      currentVersion = migration.version;
    }
  }

  await database.execAsync(`PRAGMA user_version = ${currentVersion};`);
}
