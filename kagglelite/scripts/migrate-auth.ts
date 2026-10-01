import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'kagglelite.db'));

function migrate() {
  console.log('Running auth migrations...');

  try {
    // Add columns to users table
    db.exec(`
      ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN locked_until DATETIME;
      ALTER TABLE users ADD COLUMN last_login_at DATETIME;
      ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
      ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
    `);
  } catch(e) {
    console.log('User columns already exist or error:', (e as Error).message);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      refresh_token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip TEXT,
      device_label TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token_hash);

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
    CREATE INDEX IF NOT EXISTS idx_evt_user_id ON email_verification_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_evt_token ON email_verification_tokens(token_hash);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
    CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token_hash);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      event TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
    CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);

    CREATE TABLE IF NOT EXISTS oauth_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      UNIQUE(provider, provider_account_id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
    CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON oauth_accounts(user_id);

    CREATE TABLE IF NOT EXISTS dev_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure unique email index
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);`);

  console.log('Auth migration complete!');
}

migrate();
