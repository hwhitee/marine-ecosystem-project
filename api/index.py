import asyncio
import os
import json
import re
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from sqlalchemy import create_engine, Column, Integer, Float, DateTime, JSON, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

# ==========================================
# 1. SETUP: GOOGLE GENAI & SQLALCHEMY
# ==========================================
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Using SQLite for local testing
# Change this line:
# SQLALCHEMY_DATABASE_URL = "sqlite:///./ecosystem.db"

# To this:
SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/ecosystem.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class EnvironmentalSensorData(Base):
    __tablename__ = "environmental_sensor_data"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    temperature: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salinity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    dissolved_oxygen: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    chlorophyll_a: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ph: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    plankton_abundance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fish_observations: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class EcosystemAssessment(Base):
    __tablename__ = "ecosystem_assessments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ecosystem_status: Mapped[str] = mapped_column(String(100), nullable=False)
    combined_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    contributing_parameters: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

Base.metadata.create_all(bind=engine)

# ==========================================
# 2. FASTAPI & PYDANTIC MODELS
# ==========================================
app = FastAPI(title="Marine Ecosystem Monitoring API", version="1.0.0")

# Add CORS Middleware to allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorData(BaseModel):
    temperature: float = Field(..., description="Water temperature")
    salinity: float = Field(..., description="Water salinity")
    dissolved_oxygen: float = Field(..., description="Dissolved oxygen concentration")
    chlorophyll_a: float = Field(..., description="Chlorophyll-a concentration")
    ph: float = Field(..., description="Water pH")
    plankton_abundance: float = Field(..., description="Plankton abundance")
    fish_observations: int = Field(..., ge=0, description="Number of observed fish")

class EcosystemEvaluationResponse(BaseModel):
    water_quality: Any
    primary_productivity: Any
    biodiversity: Any
    master_reasoning: Any

# ==========================================
# 3. AI AGENT FUNCTIONS
# ==========================================
def _clean_and_parse_json(raw_text: str, agent_name: str) -> dict:
    """Strips Markdown ticks from AI responses to prevent JSONDecodeErrors."""
    text = raw_text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        print(f"[{agent_name}] Failed to parse JSON. Raw output:\n{raw_text}")
        return {"error": f"Failed to parse output from {agent_name} agent.", "raw_output": text}

def _sync_water_quality(data):
    config = {'temperature': 0.1, 'max_output_tokens': 2048, 'top_p': 0.95, 'response_mime_type': 'application/json'}
    interaction = client.interactions.create(
        model='models/gemini-3.6-flash',
        input=f"Analyze this raw sensor data: {data}",
        system_instruction='You are the Water Quality Agent in a multi-agent marine ecosystem monitoring system. Analyze the array of water temperature, salinity, dissolved oxygen, and pH. Output a strictly typed JSON response matching this schema: { "agent_name": "Water Quality", "assessment": "ENUM(Optimal, Marginal, Degraded)", "confidence": "float", "key_finding": "string", "anomalous_readings": ["string"] }.',
        generation_config=config,
    )
    return _clean_and_parse_json(interaction.output_text, "Water Quality")

def _sync_primary_productivity(data):
    config = {'temperature': 0.1, 'max_output_tokens': 2048, 'top_p': 0.95, 'response_mime_type': 'application/json'}
    interaction = client.interactions.create(
        model='models/gemini-3.6-flash',
        input=f"Analyze this raw sensor data: {data}",
        system_instruction='You are the Primary Productivity Agent. Analyze chlorophyll-a, dissolved oxygen, water temp, and pH. Output strictly typed JSON: { "agent_name": "Primary Productivity", "assessment": "ENUM(High, Normal, Low)", "confidence": "float", "key_finding": "string", "anomalous_readings": ["string"] }.',
        generation_config=config,
    )
    return _clean_and_parse_json(interaction.output_text, "Primary Productivity")

def _sync_biodiversity(data):
    config = {'temperature': 0.1, 'max_output_tokens': 2048, 'top_p': 0.95, 'response_mime_type': 'application/json'}
    interaction = client.interactions.create(
        model='models/gemini-3.6-flash',
        input=f"Analyze this raw sensor data: {data}",
        system_instruction='You are the Biodiversity Agent. Analyze plankton abundance and fish observations. Output strictly typed JSON: { "agent_name": "Biodiversity", "assessment": "ENUM(Thriving, Stable, Declining)", "confidence": "float", "key_finding": "string", "anomalous_readings": ["string"] }.',
        generation_config=config,
    )
    return _clean_and_parse_json(interaction.output_text, "Biodiversity")

def _sync_master_reasoning(data):
    config = {'temperature': 0.1, 'max_output_tokens': 2048, 'top_p': 0.95, 'response_mime_type': 'application/json'}
    interaction = client.interactions.create(
        model='models/gemini-3.6-flash',
        input=f"Evaluate these independent agent findings: {data}",
        system_instruction='You are the central Reasoning Agent. Evaluate the independent JSON assessments from the Water Quality, Primary Productivity, and Biodiversity agents. Resolve contradictions and determine overall status. Output strict JSON: { "ecosystem_status": "ENUM(Healthy, Stressed, At Risk)", "combined_explanation": "string", "detected_changes": ["string"], "final_confidence_score": "float", "contributing_parameters": ["string"] }.',
        generation_config=config,
    )
    return _clean_and_parse_json(interaction.output_text, "Master Reasoning")

# Async wrappers to prevent server blocking
async def get_water_quality_assessment(data): return await asyncio.to_thread(_sync_water_quality, data)
async def get_primary_productivity_assessment(data): return await asyncio.to_thread(_sync_primary_productivity, data)
async def get_biodiversity_assessment(data): return await asyncio.to_thread(_sync_biodiversity, data)
async def get_master_reasoning_assessment(data): return await asyncio.to_thread(_sync_master_reasoning, data)

# ==========================================
# 4. ORCHESTRATION ROUTE
# ==========================================
@app.post("/api/evaluate-ecosystem", response_model=EcosystemEvaluationResponse)
async def evaluate_ecosystem(sensor_data: SensorData) -> EcosystemEvaluationResponse:
    raw_data: Dict[str, Any] = sensor_data.model_dump()

    try:
        # Run specialist agents concurrently
        (
            water_quality_result,
            primary_productivity_result,
            biodiversity_result,
        ) = await asyncio.gather(
            get_water_quality_assessment(raw_data),
            get_primary_productivity_assessment(raw_data),
            get_biodiversity_assessment(raw_data),
        )

        specialist_results: Dict[str, Any] = {
            "water_quality": water_quality_result,
            "primary_productivity": primary_productivity_result,
            "biodiversity": biodiversity_result,
        }

        # Feed combined assessments into the master agent
        master_reasoning_result = await get_master_reasoning_assessment(specialist_results)

        # Persistence
        db = SessionLocal()
        db_assessment = EcosystemAssessment(
            ecosystem_status=master_reasoning_result.get("ecosystem_status", "Unknown"),
            combined_explanation=master_reasoning_result.get("combined_explanation", ""),
            confidence_score=master_reasoning_result.get("final_confidence_score", 0.0),
            contributing_parameters=master_reasoning_result.get("contributing_parameters", [])
        )
        db.add(db_assessment)
        db.commit()
        db.close()

        return EcosystemEvaluationResponse(
            water_quality=water_quality_result,
            primary_productivity=primary_productivity_result,
            biodiversity=biodiversity_result,
            master_reasoning=master_reasoning_result,
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "healthy"}
