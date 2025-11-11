import sqlite3
import uuid
from typing import List, Dict
import os


class ConversationManager:
    def __init__(self, db_path: str = "conversations.sqlite"):
        """Initialize the conversation manager with database path."""
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        """Initialize the conversation history database if it doesn't exist."""
        if not os.path.exists(self.db_path):
            # Create the database using the schema
            # Get the path to the schema file (it's in the parent directory)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            schema_path = os.path.join(
                os.path.dirname(current_dir), "create_conversations_db.sql"
            )

            with open(schema_path, "r") as f:
                schema = f.read()

            conn = sqlite3.connect(self.db_path)
            conn.executescript(schema)
            conn.close()

    def create_session(self, database_uuid: str, user_identifier: str = None) -> str:
        """Create a new conversation session."""
        session_id = str(uuid.uuid4())

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO sessions (session_id, user_identifier, database_uuid)
            VALUES (?, ?, ?)
        """,
            (session_id, user_identifier, database_uuid),
        )

        conn.commit()
        conn.close()

        return session_id

    def get_or_create_session(
        self, database_uuid: str, user_identifier: str = None
    ) -> str:
        """Get the most recent session for a user/database or create a new one."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Try to find the most recent session for this database
        cursor.execute(
            """
            SELECT session_id FROM sessions 
            WHERE database_uuid = ? 
            ORDER BY last_activity DESC 
            LIMIT 1
        """,
            (database_uuid,),
        )

        result = cursor.fetchone()
        conn.close()

        if result:
            return result[0]
        else:
            return self.create_session(database_uuid, user_identifier)

    def save_conversation(
        self,
        session_id: str,
        question: str,
        sql_query: str = None,
        results_summary: str = None,
        visualization_type: str = None,
        error_message: str = None,
        database_uuid: str = None,
    ):
        """Save a conversation entry."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO conversations 
            (session_id, question, sql_query, results_summary, visualization_type, error_message, database_uuid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                session_id,
                question,
                sql_query,
                results_summary,
                visualization_type,
                error_message,
                database_uuid,
            ),
        )

        # Update session last activity
        cursor.execute(
            """
            UPDATE sessions SET last_activity = CURRENT_TIMESTAMP 
            WHERE session_id = ?
        """,
            (session_id,),
        )

        conn.commit()
        conn.close()

    def get_conversation_history(self, session_id: str, limit: int = 20) -> List[Dict]:
        """Get conversation history for a session."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM conversations 
            WHERE session_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        """,
            (session_id, limit),
        )

        rows = cursor.fetchall()
        conn.close()

        # Convert to list of dictionaries
        return [dict(row) for row in rows]

    def get_recent_questions(self, database_uuid: str, limit: int = 5) -> List[str]:
        """Get recent questions for a database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT DISTINCT question FROM conversations 
            WHERE database_uuid = ? AND question IS NOT NULL
            ORDER BY timestamp DESC 
            LIMIT ?
        """,
            (database_uuid, limit),
        )

        rows = cursor.fetchall()
        conn.close()

        return [row[0] for row in rows]

    def delete_old_conversations(self, days_old: int = 30):
        """Delete conversations older than specified days."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM conversations 
            WHERE timestamp < datetime('now', '-{} days')
        """.format(days_old)
        )

        cursor.execute(
            """
            DELETE FROM sessions 
            WHERE last_activity < datetime('now', '-{} days')
        """.format(days_old)
        )

        conn.commit()
        conn.close()

    def get_session_stats(self, session_id: str) -> Dict:
        """Get statistics for a session."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT 
                COUNT(*) as total_conversations,
                COUNT(CASE WHEN error_message IS NULL THEN 1 END) as successful_conversations,
                COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as failed_conversations,
                MAX(timestamp) as last_conversation,
                MIN(timestamp) as first_conversation
            FROM conversations 
            WHERE session_id = ?
        """,
            (session_id,),
        )

        result = cursor.fetchone()
        conn.close()

        if result:
            return {
                "total_conversations": result[0],
                "successful_conversations": result[1],
                "failed_conversations": result[2],
                "last_conversation": result[3],
                "first_conversation": result[4],
            }
        return {}
