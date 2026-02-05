# utils/model_router.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()


# ---------------------------
# OLLAMA (Mistral, Llama3, Gemma, etc.)
# ---------------------------
def analyze_with_ollama(prompt: str, model: str) -> str:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=120
    )
    data = response.json()
    return data.get("response", "").strip()


# ---------------------------
# OPENAI (GPT-4o, GPT-4o-mini, etc.)
# ---------------------------
def analyze_with_openai(prompt: str, model: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    res = client.chat.completions.create(
        model=model,      # respetamos el parámetro del usuario
        messages=[{"role": "user", "content": prompt}]
    )

    return res.choices[0].message.content.strip()


# ---------------------------
# GEMINI (Flash, Pro, Ultra)
# ---------------------------
def analyze_with_gemini(prompt: str, model: str) -> str:
    from google import genai
    
    client = genai.Client(api_key="AIzaSyCoTJ3jsIi3CZTJ2sE89AGkJbBhKDZsEZA")

    response = client.models.generate_content(
        model=model,
        contents=prompt
    )

    return response.text.strip()


# ---------------------------
# ROUTER GENERAL
# ---------------------------
def analyze(prompt: str, engine: str = "ollama", model: str = "mistral") -> str:
    engine = engine.lower()

    if engine == "ollama":
        return analyze_with_ollama(prompt, model)

    elif engine == "openai":
        return analyze_with_openai(prompt, model)

    elif engine == "gemini":
        return analyze_with_gemini(prompt, model)

    else:
        raise ValueError(f"Motor '{engine}' no soportado")
