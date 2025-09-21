CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT 1,
  guests INTEGER DEFAULT 1,
  dietary_restrictions TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rsvps_email ON rsvps(email);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);

