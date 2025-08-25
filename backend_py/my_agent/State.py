from typing import List, Any, Annotated, Dict, Optional
from typing_extensions import TypedDict
import operator
from langgraph.graph import add_messages

class State(TypedDict):
    question: str
    uuid: str
    session_id: Optional[str]  # Added for conversation history
    parsed_question: Dict[str, Any]
    unique_nouns: List[str]
    sql_query: str
    sql_valid: bool
    sql_issues: str
    results: List[Any]
    answer: str
    error: str
    visualization: str
    visualization_reason: str
    formatted_data_for_visualization: Dict[str, Any]

# Keep the old ones for backward compatibility
InputState = State
OutputState = State