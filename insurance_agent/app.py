from fastapi import FastAPI
from pydantic import BaseModel, ValidationError
from utils.model_router import analyze
from utils.json_parser import extract_json_from_response, JSONExtractionError
import requests
from datetime import datetime
# Métricas para los modelos
import time
import csv
from pathlib import Path

app = FastAPI(title="Agente Clasificador", version="2.0")

def save_metrics_unique(engine: str, model: str, casos: int,
                        tiempo_api_ms: float, tiempo_modelo_ms: float, tiempo_total_ms: float):

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"metrics_{engine}_{model}_{timestamp}.csv"
    file_path = Path(filename)

    with open(file_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "timestamp",
            "engine",
            "model",
            "casos",
            "tiempo_api_ms",
            "tiempo_modelo_ms",
            "tiempo_total_ms"
        ])
        writer.writerow([
            timestamp,
            engine,
            model,
            casos,
            round(tiempo_api_ms, 2),
            round(tiempo_modelo_ms, 2),
            round(tiempo_total_ms, 2)
        ])

#  VALIDADORES INTERNOS

def safe_float(value):
    try:
        if value is None:
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        value = str(value).replace(",", "").strip()
        return float(value)
    except:
        return 0.0

def safe_date(value):
    if not value:
        return datetime(1900, 1, 1)

    try:
        d = datetime.fromisoformat(value.replace("Z", ""))
        # Forzar hora = 00:00:00 (ignorar hora real)
        return datetime(d.year, d.month, d.day)
    except:
        return datetime(1900, 1, 1)

def nacionalidad_peso(id_type: str):
    if not id_type:
        return 2

    t = id_type.strip().lower()

    # Nacional
    if "cédula física nacional" in t or "nacional" in t:
        return 0
    
    # Extranjero físico (DIMEX)
    if "dimex" in t or "residencia" in t:
        return 1
    
    # Pasaporte / jurídica / otros
    return 2


#  Pydantic MODELOS

class ClasifItem(BaseModel):
    id: int
    categoria: str
    motivo: str


class IAResponse(BaseModel):
    resultado: list[ClasifItem]


class DataPayload(BaseModel):
    url_api: str
    url_save: str | None = None
    limite: int = 20
    engine: str = "ollama"
    model: str = "mistral"


#  ENDPOINT BASE
@app.get("/")
def home():
    return {"status": "Microservicio IA activo 🚀"}

def obtener_monto(caso):
    categoria = caso.get("categoria")

    if categoria == "Vehículos":
        return safe_float(caso.get("vehicle_value"))
    
    if categoria == "Gastos Médicos":
        return safe_float(caso.get("coverage"))
    
    if categoria == "Hogares":
        return safe_float(caso.get("structure_value"))
    
    # fallback si algo falla
    return 0

def calcular_monto_visible(caso, categoria: str) -> str:
    if categoria == "Vehículos":
        return str(caso.get("vehicle_value") or caso.get("monto") or "0")

    if categoria == "Gastos Médicos":
        return str(caso.get("coverage") or "0")

    if categoria == "Hogares":
        return str(caso.get("structure_value") or "0")

    return str(
        caso.get("monto")
        or caso.get("vehicle_value")
        or caso.get("coverage")
        or caso.get("structure_value")
        or "0"
    )

#  ENDPOINT CLASIFICAR
@app.post("/clasificar")
async def clasificar(payload: DataPayload):

    # Medición general del endpoint
    t_inicio_total = time.perf_counter()
    # --- medir tiempo de API remota ---
    t_inicio_api = time.perf_counter()

    # 1. Obtener los datos desde tu API Node
    try:
        res = requests.post(payload.url_api, json={})
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        return {"error": "No se pudo obtener datos desde API", "detalle": str(e)}

    t_fin_api = time.perf_counter()    

    casos = data.get("data", [])[:payload.limite]

    # 2. PROMPT IA para clasificar
    prompt = """
Eres un sistema experto en clasificación de solicitudes de seguros.

Clasifica cada caso en EXACTAMENTE una de estas categorías:
- Vehículos
- Gastos Médicos
- Hogares

Requisitos estrictos:
- El campo "motivo" DEBE ser una breve explicación del por qué clasificaste el caso en la categoría seleccionada.
- El campo "motivo" NO debe contener comillas dobles internas (") porque eso rompe JSON.
- Si necesitas citar un texto o tipo, usa comillas simples (' ') dentro del texto.
  Ejemplo correcto:
  "motivo": "El tipo de vehículo es 'Carga Liviana'."
- NO debe ser igual al campo 'how' del caso.
- El motivo debe describir la razón técnica o lógica (ejemplo: tipo de vehículo, monto asegurado, naturaleza de la solicitud).
- NO uses texto del campo original 'how'.
- NO agregues texto fuera del JSON.
- NO ordenes ni calcules prioridades.
- NO uses bloques ```json.
- La respuesta DEBE estar dentro de <JSON>...</JSON>.

Formato obligatorio:

<JSON>
{
  "resultado": [
    {
      "id": <id>,
      "categoria": "<Vehículos|Gastos Médicos|Hogares>",
      "motivo": "<explicación clara y profesional>"
    }
  ]
}
</JSON>

CASOS:
"""
    prompt += str(casos)

    t_inicio_modelo = time.perf_counter()
    # 3. Ejecutar IA
    resultado_raw = analyze(prompt, engine=payload.engine, model=payload.model)
    t_fin_modelo = time.perf_counter()

      # 4. Extraer JSON usando el parser robusto
    try:
        json_ia = extract_json_from_response(resultado_raw)
    except JSONExtractionError as e:
        return {
            "error": "JSON inválido desde IA",
            "detalle": str(e),
            "respuesta": resultado_raw
        }

    # 🔹 Normalizar: si la IA devolvió una lista, la envolvemos en {"resultado": [...]}
    if isinstance(json_ia, list):
        json_ia = {"resultado": json_ia}

    # 5. Validar estructura IA con Pydantic
    try:
        ia_struct = IAResponse(**json_ia)
    except ValidationError as ve:
        return {"error": "Estructura JSON inválida", "detalle": ve.errors()}

    # 6. Normalizar IDs clasificados
    clasif_map = {int(item.id): item for item in ia_struct.resultado}

    # 7. Detectar IDs faltantes y autocorregirlos
    ids_reales = {c["id"] for c in casos}
    ids_modelo = set(clasif_map.keys())
    faltantes = ids_reales - ids_modelo

    for f in faltantes:
        clasif_map[f] = ClasifItem(
            id=f,
            categoria="Sin Clasificar",
            motivo="La IA no devolvió este ID"
        )

    # 8. Combinar datos originales + clasificación IA
    combinados = []
    for c in casos:
        cid = c["id"]
        clas = clasif_map[cid]
        categoria = clas.categoria

        combinados.append({
            "id": cid,
            "nombre": c.get("name"),
            "fecha": c.get("registered"),
            "monto": calcular_monto_visible(c, categoria),
            "nacionalidad": c.get("id_type"),
            "how": c.get("how"),
            "categoria": categoria,
            "motivo": clas.motivo
        })

    # 9. Orden final determinístico (Python)
    combinados_ordenados = sorted(
        combinados,
        key=lambda x: (
            safe_date(x["fecha"]),             # más antiguo primero
            -obtener_monto(x),             # monto mayor primero
            nacionalidad_peso(x["nacionalidad"])
        )
    )

    # 10. Asignar prioridad y orden final
    total = len(combinados_ordenados)
    tercio = max(1, total // 3)

    for idx, c in enumerate(combinados_ordenados, start=1):
        c["orden_final"] = idx

        if idx <= tercio:
            c["prioridad"] = 1
        elif idx <= tercio * 2:
            c["prioridad"] = 2
        else:
            c["prioridad"] = 3

    # 11. Medir tiempos finales
    t_fin_total = time.perf_counter()

    tiempo_api_ms = (t_fin_api - t_inicio_api) * 1000
    tiempo_modelo_ms = (t_fin_modelo - t_inicio_modelo) * 1000
    tiempo_total_ms = (t_fin_total - t_inicio_total) * 1000

    # 12. Guardar archivo CSV único para esta petición
    save_metrics_unique(
        engine=payload.engine,
        model=payload.model,
        casos=len(casos),
        tiempo_api_ms=tiempo_api_ms,
        tiempo_modelo_ms=tiempo_modelo_ms,
        tiempo_total_ms=tiempo_total_ms
    )

    # ---------------------------------------------------
    if payload.url_save:
        try:
            save_res = requests.post(
                payload.url_save,
                json={"clasificacion": combinados_ordenados},
                timeout=30
            )
            save_res.raise_for_status()
        except Exception as e:
            print("⚠ Error enviando datos al API NodeJS:", e)

    # 11. Respuesta final
    return {
        "clasificacion": combinados_ordenados
    }

@app.post("/interpretar")
async def interpretar(payload: DataPayload):
    """
    Interpreta los casos YA CLASIFICADOS desde Node.js
    y genera un análisis profesional con IA.
    Luego guarda la interpretación usando /save-interpretation.
    """

    # Obtener los casos ya clasificados desde Node.js
    try:
        res = requests.post(payload.url_api, json={})
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        return {"error": "No se pudieron obtener casos desde Node.js", "detalle": str(e)}

    casos = data.get("data", [])
    if not casos:
        return {"error": "No hay casos para interpretar"}

    # Preparar datos resumidos para IA
    total = len(casos)

    categorias = {}
    prioridades = {1: 0, 2: 0, 3: 0}

    for c in casos:
        cat = c.get("categoria", "Sin Categoría")
        categorias[cat] = categorias.get(cat, 0) + 1

        pr = c.get("prioridad", 3)
        prioridades[pr] = prioridades.get(pr, 0) + 1

    # PROMPT PARA INTERPRETACIÓN IA
    prompt = f"""
Eres un analista de seguros experto, apoyando a una corredora de seguras.

Analiza el siguiente conjunto de casos YA CLASIFICADOS y priorizados.
Produce una interpretación profesional con:

- Tendencias generales
- Riesgos detectados
- Insights relevantes por categoría
- Interpretación de prioridades
- Recomendaciones accionables
- Oportunidades de negocio

CASOS:
{casos}

Devuelve SOLO TEXTO PLANO, sin JSON, sin etiquetas.
"""

    # Ejecutar IA usando tu router analyze()
    try:
        resultado_raw = analyze(prompt, engine=payload.engine, model=payload.model)
        interpretacion = resultado_raw.strip()
    except Exception as e:
        return {"error": "Falló el análisis IA", "detalle": str(e)}

    # Construir payload para Node.js
    interpret_payload = {
        "interpretacion": interpretacion,
        "total_casos": total,
        "categorias": categorias,
        "prioridades": prioridades,
        "timestamp": datetime.now().isoformat()
    }

    # Guardar en Node.js si url_save viene en payload
    save_result = None
    if payload.url_save:
        try:
            save_res = requests.post(payload.url_save, json=interpret_payload)
            save_res.raise_for_status()
            save_result = save_res.json()
        except Exception as e:
            save_result = {"error": "No se pudo guardar en Node.js", "detalle": str(e)}

    # Respuesta final al frontend
    return {
        "status": "ok",
        "interpretacion": interpretacion,
        "total": total,
        "categorias": categorias,
        "prioridades": prioridades,
        "guardado": save_result
    }
