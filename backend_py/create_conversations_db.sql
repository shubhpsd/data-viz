-- Database schema for conversation history management
-- This file is used by ConversationManager.py to initialize the database

-- Sessions table to track user conversation sessions
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_identifier TEXT,
    database_uuid TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table to store individual conversation entries
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question TEXT,
    sql_query TEXT,
    results_summary TEXT,
    visualization_type TEXT,
    error_message TEXT,
    database_uuid TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_database_uuid ON conversations(database_uuid);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_database_uuid ON sessions(database_uuid);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);
