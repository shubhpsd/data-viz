import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI


class LLMManager:
    def __init__(self):
        # Get the API key from environment
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0,
            google_api_key=api_key,
            timeout=30,  # Add timeout to prevent hanging
            max_retries=2,  # Add retry logic
        )

    def invoke(self, prompt: ChatPromptTemplate, **kwargs) -> str:
        try:
            messages = prompt.format_messages(**kwargs)
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            # Log the error and re-raise with more context
            print(f"LLM invocation failed: {str(e)}")
            raise Exception(f"LLM call failed: {str(e)}")
