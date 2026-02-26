import os
import google.generativeai as genai
import json

def generate_practice_questions(lesson_content):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "API Key not configured."}
        
    genai.configure(api_key=api_key)
    
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
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        text = response.text
        # Clean up in case Gemini returns markdown block
        if text.startswith('```json'):
            text = text[7:-3]
        elif text.startswith('```'):
            text = text[3:-3]
            
        data = json.loads(text)
        return {"questions": data}
    except Exception as e:
        return {"error": str(e)}
