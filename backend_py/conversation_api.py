from flask import Flask, request, jsonify
from flask_cors import CORS
from my_agent.ConversationManager import ConversationManager
import os

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  # Allow frontend access

conversation_manager = ConversationManager()

@app.route('/conversation-history/<session_id>', methods=['GET'])
def get_conversation_history(session_id):
    """Get conversation history for a session."""
    try:
        limit = request.args.get('limit', 20, type=int)
        history = conversation_manager.get_conversation_history(session_id, limit)
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recent-questions/<database_uuid>', methods=['GET'])
def get_recent_questions(database_uuid):
    """Get recent questions for a database."""
    try:
        limit = request.args.get('limit', 5, type=int)
        questions = conversation_manager.get_recent_questions(database_uuid, limit)
        return jsonify({'questions': questions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/session/create', methods=['POST'])
def create_session():
    """Create a new conversation session."""
    try:
        data = request.get_json()
        database_uuid = data.get('database_uuid')
        user_identifier = data.get('user_identifier')
        
        if not database_uuid:
            return jsonify({'error': 'database_uuid is required'}), 400
            
        session_id = conversation_manager.create_session(database_uuid, user_identifier)
        return jsonify({'session_id': session_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/session/<session_id>/stats', methods=['GET'])
def get_session_stats(session_id):
    """Get statistics for a session."""
    try:
        stats = conversation_manager.get_session_stats(session_id)
        return jsonify({'stats': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 