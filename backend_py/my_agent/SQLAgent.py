from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from my_agent.DatabaseManager import DatabaseManager
from my_agent.LLMManager import LLMManager
from my_agent.ConversationManager import ConversationManager

class SQLAgent:
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.llm_manager = LLMManager()
        self.conversation_manager = ConversationManager()

    def get_conversation_context(self, uuid: str, session_id: str = None) -> str:
        """Get recent conversation context for follow-up questions."""
        if not session_id:
            return ""
        
        try:
            history = self.conversation_manager.get_conversation_history(session_id, limit=3)
            if not history:
                return ""
            
            context_parts = []
            for entry in reversed(history):  # Reverse to get chronological order
                if entry['question'] and entry['sql_query']:
                    context_parts.append(f"Previous Q: {entry['question']}")
                    context_parts.append(f"Previous SQL: {entry['sql_query']}")
                    if entry['results_summary']:
                        context_parts.append(f"Previous Result: {entry['results_summary']}")
            
            if context_parts:
                return "===Recent conversation context:\n" + "\n".join(context_parts) + "\n\n"
            return ""
        except Exception as e:
            print(f"Error getting conversation context: {e}")
            return ""

    def parse_question(self, state: dict) -> dict:
        """Parse user question and identify relevant tables and columns."""
        question = state['question']
        uuid = state['uuid']
        session_id = state.get('session_id')
        schema = self.db_manager.get_schema(uuid)
        
        # Get conversation context for follow-up questions
        context = self.get_conversation_context(uuid, session_id)

        prompt = ChatPromptTemplate.from_messages([
            ("system", '''You are a data analyst that can help summarize SQL tables and parse user questions about a database. 
Given the question, database schema, and any conversation context, identify the relevant tables and columns.

Questions asking about "what data", "what kind of data", "describe the data", "show me the data", or similar exploratory questions should ALWAYS be considered relevant - these require examining the database structure and content.

Only set is_relevant to false for questions that are completely unrelated to data analysis, databases, or business intelligence (like "What's the weather?" or "Tell me a joke").

Pay attention to the conversation context as the current question might be a follow-up that references previous questions or results.

Your response should be in the following JSON format:
{{
    "is_relevant": boolean,
    "relevant_tables": [
        {{
            "table_name": string,
            "columns": [string],
            "noun_columns": [string]
        }}
    ]
}}

For exploratory questions about data types/content, include ALL tables and their main descriptive columns.

The "noun_columns" field should contain only the columns that are relevant to the question and contain nouns or names, for example, the column "Artist name" contains nouns relevant to the question "What are the top selling artists?", but the column "Artist ID" is not relevant because it does not contain a noun. Do not include columns that contain numbers.
'''),
            ("human", "{context}===Database schema:\n{schema}\n\n===User question:\n{question}\n\nIdentify relevant tables and columns:")
        ])

        output_parser = JsonOutputParser()
        
        response = self.llm_manager.invoke(prompt, schema=schema, question=question, context=context)
        parsed_response = output_parser.parse(response)
        return {"parsed_question": parsed_response}

    def get_unique_nouns(self, state: dict) -> dict:
        """Find unique nouns in relevant tables and columns."""
        parsed_question = state['parsed_question']
        
        if not parsed_question['is_relevant']:
            return {"unique_nouns": []}

        unique_nouns = set()
        for table_info in parsed_question['relevant_tables']:
            table_name = table_info['table_name']
            noun_columns = table_info['noun_columns']
            
            if noun_columns:
                column_names = ', '.join(f"`{col}`" for col in noun_columns)
                query = f"SELECT DISTINCT {column_names} FROM `{table_name}`"
                results = self.db_manager.execute_query(state['uuid'], query)
                for row in results:
                    unique_nouns.update(str(value) for value in row if value)

        return {"unique_nouns": list(unique_nouns)}

    def generate_sql(self, state: dict) -> dict:
        """Generate SQL query based on parsed question and unique nouns."""
        question = state['question']
        parsed_question = state['parsed_question']
        unique_nouns = state['unique_nouns']
        uuid = state['uuid']
        session_id = state.get('session_id')

        if not parsed_question['is_relevant']:
            return {"sql_query": "NOT_RELEVANT", "is_relevant": False}
    
        schema = self.db_manager.get_schema(uuid)
        
        # Get conversation context for follow-up questions
        context = self.get_conversation_context(uuid, session_id)

        prompt = ChatPromptTemplate.from_messages([
            ("system", '''
You are an AI assistant that generates SQL queries based on user questions, database schema, conversation context, and unique nouns found in the relevant tables. Generate a valid SQL query to answer the user's question.

Pay attention to the conversation context as the current question might be a follow-up that references previous questions or results.

If there is not enough information to write a SQL query, respond with "NOT_ENOUGH_INFO".

Here are some examples:

1. What is the top selling product?
Answer: SELECT product_name, SUM(quantity) as total_quantity FROM sales WHERE product_name IS NOT NULL AND quantity IS NOT NULL AND product_name != "" AND quantity != "" AND product_name != "N/A" AND quantity != "N/A" GROUP BY product_name ORDER BY total_quantity DESC LIMIT 1

2. What is the total revenue for each product?
Answer: SELECT \`product name\`, SUM(quantity * price) as total_revenue FROM sales WHERE \`product name\` IS NOT NULL AND quantity IS NOT NULL AND price IS NOT NULL AND \`product name\` != "" AND quantity != "" AND price != "" AND \`product name\` != "N/A" AND quantity != "N/A" AND price != "N/A" GROUP BY \`product name\`  ORDER BY total_revenue DESC

3. What is the market share of each product?
Answer: SELECT \`product name\`, SUM(quantity) * 100.0 / (SELECT SUM(quantity) FROM sa  les) as market_share FROM sales WHERE \`product name\` IS NOT NULL AND quantity IS NOT NULL AND \`product name\` != "" AND quantity != "" AND \`product name\` != "N/A" AND quantity != "N/A" GROUP BY \`product name\`  ORDER BY market_share DESC

4. Plot the distribution of income over time
Answer: SELECT income, COUNT(*) as count FROM users WHERE income IS NOT NULL AND income != "" AND income != "N/A" GROUP BY income

THE RESULTS SHOULD ONLY BE IN THE FOLLOWING FORMAT, SO MAKE SURE TO ONLY GIVE TWO OR THREE COLUMNS:
[[x, y]]
or 
[[label, x, y]]
             
For questions like "plot a distribution of the fares for men and women", count the frequency of each fare and plot it. The x axis should be the fare and the y axis should be the count of people who paid that fare.
SKIP ALL ROWS WHERE ANY COLUMN IS NULL or "N/A" or "".
Just give the query string. Do not format it. Do not include markdown code blocks or ```sql formatting. Return only the raw SQL query. Make sure to use the correct spellings of nouns as provided in the unique nouns list. All the table and column names should be enclosed in backticks.
'''),
            ("human", '''{context}===Database schema:
{schema}

===User question:
{question}

===Relevant tables and columns:
{parsed_question}

===Unique nouns in relevant tables:
{unique_nouns}

Generate SQL query string'''),
        ])

        response = self.llm_manager.invoke(prompt, schema=schema, question=question, parsed_question=parsed_question, unique_nouns=unique_nouns, context=context)
        
        if response.strip() == "NOT_ENOUGH_INFO":
            return {"sql_query": "NOT_RELEVANT"}
        else:
            # Clean up the response to remove markdown formatting
            cleaned_query = response.strip()
            # Remove ```sql and ``` markers if present
            if cleaned_query.startswith("```sql"):
                cleaned_query = cleaned_query[6:]
            if cleaned_query.startswith("```"):
                cleaned_query = cleaned_query[3:]
            if cleaned_query.endswith("```"):
                cleaned_query = cleaned_query[:-3]
            cleaned_query = cleaned_query.strip()
            
            return {"sql_query": cleaned_query}

    def validate_and_fix_sql(self, state: dict) -> dict:
        """Validate and fix the generated SQL query."""
        sql_query = state['sql_query']

        if sql_query == "NOT_RELEVANT":
            return {"sql_query": "NOT_RELEVANT", "sql_valid": False}
        
        # TEMPORARY FIX: Skip LLM validation and assume SQL is valid
        # The validation LLM was causing queries to hang or be incorrectly marked invalid
        # We'll validate by actually testing the query execution instead
        try:
            # Test the query by executing it
            results = self.db_manager.execute_query(state['uuid'], sql_query)
            return {"sql_query": sql_query, "sql_valid": True}
        except Exception as e:
            # If query fails, it's invalid
            return {
                "sql_query": sql_query, 
                "sql_valid": False,
                "sql_issues": f"Query execution failed: {str(e)}"
            }

    def execute_sql(self, state: dict) -> dict:
        """Execute SQL query and return results."""
        query = state['sql_query']
        uuid = state['uuid']
        
        if query == "NOT_RELEVANT":
            return {"results": "NOT_RELEVANT"}

        try:
            results = self.db_manager.execute_query(uuid, query)
            return {"results": results}
        except Exception as e:
            return {"error": str(e), "results": []}

    def format_results(self, state: dict) -> dict:
        """Format query results into a human-readable response."""
        question = state['question']
        results = state['results']
        uuid = state['uuid']
        session_id = state.get('session_id')
        sql_query = state.get('sql_query', '')
        visualization = state.get('visualization', 'none')
        error = state.get('error')

        if results == "NOT_RELEVANT":
            answer = "Sorry, I can only give answers relevant to the database."
        else:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an AI assistant that formats database query results into a human-readable response. Give a conclusion to the user's question based on the query results. Do not give the answer in markdown format. Only give the answer in one line."),
                ("human", "User question: {question}\n\nQuery results: {results}\n\nFormatted response:"),
            ])

            answer = self.llm_manager.invoke(prompt, question=question, results=results)

        # Save conversation to history
        try:
            if not session_id:
                session_id = self.conversation_manager.get_or_create_session(uuid)
            
            # Create results summary
            if results == "NOT_RELEVANT":
                results_summary = "Not relevant to database"
            elif not results:
                results_summary = "No data found"
            else:
                results_summary = f"Found {len(results) if isinstance(results, list) else 1} rows"
            
            self.conversation_manager.save_conversation(
                session_id=session_id,
                question=question,
                sql_query=sql_query,
                results_summary=results_summary,
                visualization_type=visualization,
                error_message=error,
                database_uuid=uuid
            )
        except Exception as e:
            print(f"Error saving conversation: {e}")
        
        return {"answer": answer, "session_id": session_id}

    def choose_visualization(self, state: dict) -> dict:
        """Choose an appropriate visualization for the data."""
        question = state['question']
        results = state['results']
        sql_query = state['sql_query']

        if results == "NOT_RELEVANT":
            return {"visualization": "none", "visualization_reasoning": "No visualization needed for irrelevant questions."}

        # Handle empty results or errors
        if not results or len(results) == 0:
            return {"visualization": "none", "visualization_reasoning": "No data available to visualize."}

        prompt = ChatPromptTemplate.from_messages([
            ("system", '''
You are an AI assistant that recommends appropriate data visualizations. Based on the user's question, SQL query, and query results, suggest the most suitable type of graph or chart to visualize the data. If no visualization is appropriate, indicate that.

Available chart types and their use cases:
- Bar Graphs: Best for comparing categorical data or showing changes over time when categories are discrete and the number of categories is more than 2. Use for questions like "What are the sales figures for each product?" or "How does the population of cities compare? or "What percentage of each city is male?"
- Horizontal Bar Graphs: Best for comparing categorical data or showing changes over time when the number of categories is small or the disparity between categories is large. Use for questions like "Show the revenue of A and B?" or "How does the population of 2 cities compare?" or "How many men and women got promoted?" or "What percentage of men and what percentage of women got promoted?" when the disparity between categories is large.
- Scatter Plots: Useful for identifying relationships or correlations between two numerical variables or plotting distributions of data. Best used when both x axis and y axis are continuous. Use for questions like "Plot a distribution of the fares (where the x axis is the fare and the y axis is the count of people who paid that fare)" or "Is there a relationship between advertising spend and sales?" or "How do height and weight correlate in the dataset? Do not use it for questions that do not have a continuous x axis."
- Pie Charts: Ideal for showing proportions or percentages within a whole. Use for questions like "What is the market share distribution among different companies?" or "What percentage of the total revenue comes from each product?"
- Line Graphs: Best for showing trends and distributionsover time. Best used when both x axis and y axis are continuous. Used for questions like "How have website visits changed over the year?" or "What is the trend in temperature over the past decade?". Do not use it for questions that do not have a continuous x axis or a time based x axis.

Consider these types of questions when recommending a visualization:
1. Aggregations and Summarizations (e.g., "What is the average revenue by month?" - Line Graph)
2. Comparisons (e.g., "Compare the sales figures of Product A and Product B over the last year." - Line or Column Graph)
3. Plotting Distributions (e.g., "Plot a distribution of the age of users" - Scatter Plot)
4. Trends Over Time (e.g., "What is the trend in the number of active users over the past year?" - Line Graph)
5. Proportions (e.g., "What is the market share of the products?" - Pie Chart)
6. Correlations (e.g., "Is there a correlation between marketing spend and revenue?" - Scatter Plot)

Provide your response in the following format:
Recommended Visualization: [Chart type or "None"]. ONLY use the following names: bar, horizontal_bar, line, pie, scatter, none
Reason: [Brief explanation for your recommendation]
'''),
            ("human", '''
User question: {question}
SQL query: {sql_query}
Query results: {results}

Recommend a visualization:'''),
        ])

        response = self.llm_manager.invoke(prompt, question=question, sql_query=sql_query, results=results)
        
        # Parse the response more robustly
        lines = response.strip().split('\n')
        visualization = "bar"  # default fallback
        reason = "Bar chart is suitable for comparing data across categories."  # default fallback
        
        # Try to extract visualization and reason from response
        for line in lines:
            line = line.strip()
            if line.lower().startswith('recommended visualization:'):
                parts = line.split(':', 1)
                if len(parts) > 1:
                    viz_text = parts[1].strip().lower()
                    # Extract just the chart type
                    if 'bar' in viz_text and 'horizontal' not in viz_text:
                        visualization = "bar"
                    elif 'horizontal' in viz_text and 'bar' in viz_text:
                        visualization = "horizontal_bar"
                    elif 'line' in viz_text:
                        visualization = "line"
                    elif 'pie' in viz_text:
                        visualization = "pie"
                    elif 'scatter' in viz_text:
                        visualization = "scatter"
                    elif 'none' in viz_text:
                        visualization = "none"
            elif line.lower().startswith('reason:'):
                parts = line.split(':', 1)
                if len(parts) > 1:
                    reason = parts[1].strip()

        return {"visualization": visualization, "visualization_reason": reason}
