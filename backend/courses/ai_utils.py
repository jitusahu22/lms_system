import os
import json
import logging

logger = logging.getLogger(__name__)

try:
    from google import genai
    GENAI_AVAILABLE = True
    logger.info("google.genai imported successfully")
except ImportError as e:
    GENAI_AVAILABLE = False
    logger.error(f"Failed to import google.genai: {e}")

def generate_practice_questions(lesson_content):
    logger.info(f"generate_practice_questions called, GENAI_AVAILABLE={GENAI_AVAILABLE}")
    if not GENAI_AVAILABLE:
        return {"error": "AI features not available. Install google-genai package."}

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("API Key not configured.")
        return {"error": "API Key not configured."}

    client = genai.Client(api_key=api_key)

    prompt = f"""
    Based on the following lesson content, generate 3 practice questions to test the student's understanding.
    Return the response as a JSON array of objects.
    Each object should have:
    - 'question': The text of the question.
    - 'options': An array of 4 possible string answers.
    - 'answer': The correct option string.
    - 'explanation': A short explanation of why the answer is correct.

    Lesson Content:
    {lesson_content}
    """

    # Try gemini-2.5-flash first, fall back to gemini-flash-latest if it fails
    models_to_try = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash']
    last_error = None

    for model in models_to_try:
        try:
            logger.info(f"Trying model: {model}")
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            text = response.text.strip()
            # Clean up in case Gemini returns markdown block
            if text.startswith('```json'):
                text = text[7:]
            elif text.startswith('```'):
                text = text[3:]
            
            text = text.strip()
            if text.endswith('```'):
                text = text[:-3]
            
            text = text.strip()

            data = json.loads(text)
            
            # Normalize data: if Gemini returned an object like {"questions": [...]}, extract the array
            if isinstance(data, dict) and 'questions' in data:
                data = data['questions']
            elif isinstance(data, dict):
                # if it returned an object but no 'questions' key, just wrap it
                data = [data]
                
            logger.info(f"Successfully generated questions using {model}")
            return {"questions": data}
        except Exception as e:
            last_error = str(e)
            logger.warning(f"Model {model} failed: {e}")
            continue

    return {"error": f"All models failed. Last error: {last_error}"}
