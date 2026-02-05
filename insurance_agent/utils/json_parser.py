import json
import re

class JSONExtractionError(Exception):
    pass

def extract_json_from_response(text: str):
    # ----------------------------------
    # 1) Buscar bloque <JSON>...</JSON>
    # ----------------------------------
    match = re.search(r"<JSON>(.*?)</JSON>", text, re.DOTALL)
    if match:
        raw_json = match.group(1).strip()
    else:
        # -------------------------------
        # 2) Buscar bloque ```json
        # -------------------------------
        match2 = re.search(r"```json(.*?)```", text, re.DOTALL | re.IGNORECASE)
        if match2:
            raw_json = match2.group(1).strip()
        else:
            # -------------------------------
            # 3) JSON “desnudo” (array/objeto)
            # -------------------------------
            start = None
            end = None
            for i,ch in enumerate(text):
                if ch in "{[":
                    start = i
                    break
            for j in range(len(text)-1, -1, -1):
                if text[j] in "}]":
                    end = j+1
                    break
            if start is None or end is None:
                raise JSONExtractionError(
                    "No se encontró JSON válido."
                )
            raw_json = text[start:end].strip()

    cleaned = raw_json

    # -------------------------------------------------------------------
    # Reparar SOLO comillas dobles internas no escapadas dentro de strings
    # Ej: "motivo": "Vehículo tipo "SUV"."  --> "motivo": "Vehículo tipo 'SUV'."
    # -------------------------------------------------------------------
    def fix_inner_quotes(match):
        content = match.group(1)
        # reemplazar comillas dobles internas por comillas simples
        content = re.sub(r'"([^"]+)"', r"'\1'", content)
        return f"\"{content}\""

    cleaned = re.sub(r'"([^"\n]*)"', fix_inner_quotes, cleaned)

    # Quitar comas finales ilegales
    cleaned = re.sub(r",\s*([}\]])", r"\1", cleaned)

    try:
        return json.loads(cleaned)
    except Exception as e:
        raise JSONExtractionError(
            f"Error al parsear JSON: {str(e)}. JSON recibido corregido: {cleaned}"
        )
