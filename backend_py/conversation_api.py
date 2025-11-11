from flask import Flask, request, jsonify
from flask_cors import CORS
from my_agent.ConversationManager import ConversationManager
import os
import sqlite3
import json
import uuid as uuid_lib
import pandas as pd

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow frontend access

conversation_manager = ConversationManager()

# Database file path
UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "sqlite_server", "uploads"
)
# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".sqlite", ".csv"}


@app.route("/upload-file", methods=["POST"])
def upload_file():
    """Upload SQLite or CSV file."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Check file extension
        _, file_extension = os.path.splitext(file.filename)
        if file_extension.lower() not in ALLOWED_EXTENSIONS:
            return jsonify(
                {"error": "Invalid file type. Only .sqlite and .csv files are allowed"}
            ), 400

        # Generate unique ID for the file
        file_uuid = str(uuid_lib.uuid4())

        # Handle SQLite file
        if file_extension.lower() == ".sqlite":
            db_path = os.path.join(UPLOAD_DIR, f"{file_uuid}.sqlite")
            file.save(db_path)

        # Handle CSV file - convert to SQLite
        elif file_extension.lower() == ".csv":
            db_path = os.path.join(UPLOAD_DIR, f"{file_uuid}.sqlite")

            try:
                # Read CSV file
                df = pd.read_csv(file)

                if df.empty:
                    return jsonify({"error": "CSV file is empty"}), 400

                # Create SQLite database and save data
                conn = sqlite3.connect(db_path)
                df.to_sql("csv_data", conn, if_exists="replace", index=False)
                conn.close()

            except Exception as e:
                return jsonify(
                    {"error": f"Error converting CSV to SQLite: {str(e)}"}
                ), 500

        return jsonify({"uuid": file_uuid}), 200

    except Exception as e:
        return jsonify({"error": f"File upload failed: {str(e)}"}), 500


@app.route("/get-schema/<uuid>", methods=["GET"])
def get_schema(uuid):
    """Get schema for a database."""
    try:
        db_path = os.path.join(UPLOAD_DIR, f"{uuid}.sqlite")

        if not os.path.exists(db_path):
            return jsonify({"error": "Database not found"}), 404

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get all tables
        cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        schema = []
        for table_name, create_statement in tables:
            schema.append(f"Table: {table_name}")
            schema.append(f"CREATE statement: {create_statement}\n")

            # Get sample rows
            try:
                cursor.execute(f"SELECT * FROM '{table_name}' LIMIT 3;")
                rows = cursor.fetchall()
                if rows:
                    schema.append("Example rows:")
                    for row in rows:
                        schema.append(
                            json.dumps(
                                dict(zip([col[0] for col in cursor.description], row))
                            )
                        )
            except Exception as e:
                print(f"Error fetching rows for table {table_name}: {e}")

            schema.append("")  # Blank line between tables

        conn.close()
        return jsonify({"schema": "\n".join(schema)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/execute-query", methods=["POST"])
def execute_query():
    """Execute a SQL query on a database."""
    try:
        data = request.get_json()
        uuid = data.get("uuid")
        query = data.get("query")

        if not uuid or not query:
            return jsonify({"error": "Missing uuid or query"}), 400

        db_path = os.path.join(UPLOAD_DIR, f"{uuid}.sqlite")

        if not os.path.exists(db_path):
            return jsonify({"error": "Database not found"}), 404

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()

        # Convert rows to list of lists (values only)
        results = [list(row) for row in rows]
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/conversation-history/<session_id>", methods=["GET"])
def get_conversation_history(session_id):
    """Get conversation history for a session."""
    try:
        limit = request.args.get("limit", 20, type=int)
        history = conversation_manager.get_conversation_history(session_id, limit)
        return jsonify({"history": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recent-questions/<database_uuid>", methods=["GET"])
def get_recent_questions(database_uuid):
    """Get recent questions for a database."""
    try:
        limit = request.args.get("limit", 5, type=int)
        questions = conversation_manager.get_recent_questions(database_uuid, limit)
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/session/create", methods=["POST"])
def create_session():
    """Create a new conversation session."""
    try:
        data = request.get_json()
        database_uuid = data.get("database_uuid")
        user_identifier = data.get("user_identifier")

        if not database_uuid:
            return jsonify({"error": "database_uuid is required"}), 400

        session_id = conversation_manager.create_session(database_uuid, user_identifier)
        return jsonify({"session_id": session_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/session/<session_id>/stats", methods=["GET"])
def get_session_stats(session_id):
    """Get statistics for a session."""
    try:
        stats = conversation_manager.get_session_stats(session_id)
        return jsonify({"stats": stats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
