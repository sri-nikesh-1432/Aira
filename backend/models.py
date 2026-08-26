from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid
from datetime import datetime


class PlanetStatus(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    COMPLETED = "completed"
    ERROR = "error"
    WAITING = "waiting"


class Planet(str, Enum):
    AIRA = "aira"
    MERCURY = "mercury"
    MARS = "mars"
    VENUS = "venus"
    EARTH = "earth"
    JUPITER = "jupiter"
    SATURN = "saturn"
    NEPTUNE = "neptune"
    URANUS = "uranus"
    PLUTO = "pluto"


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ProjectRequest(BaseModel):
    idea: str = Field(..., description="User's project idea or prompt")
    msme_theme: Optional[str] = Field(None, description="MSME hackathon theme if applicable")
    target_audience: Optional[str] = Field(None, description="Target audience")
    tech_preferences: Optional[str] = Field(None, description="Technology preferences")
    competition_name: Optional[str] = Field(None, description="Competition name if any")


class PlanetMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender: Planet
    receiver: Planet
    task: str
    content: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PlanetOutput(BaseModel):
    planet: Planet
    status: PlanetStatus
    output: Dict[str, Any] = Field(default_factory=dict)
    files: List[str] = Field(default_factory=list)
    message: str = ""
    personality_quip: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AIRAState(BaseModel):
    """LangGraph state shared across all planets"""
    project_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_request: str = ""
    msme_theme: Optional[str] = None
    target_audience: Optional[str] = None
    tech_preferences: Optional[str] = None
    competition_name: Optional[str] = None

    # Decomposed tasks
    tasks: List[str] = Field(default_factory=list)
    current_phase: str = "init"

    # AIRA's mission plan — the task split assigned to each planet
    aira_plan: Optional[Dict[str, Any]] = None

    # Planet outputs
    mercury_output: Optional[Dict[str, Any]] = None
    mars_output: Optional[Dict[str, Any]] = None
    venus_output: Optional[Dict[str, Any]] = None
    earth_output: Optional[Dict[str, Any]] = None
    jupiter_output: Optional[Dict[str, Any]] = None
    saturn_output: Optional[Dict[str, Any]] = None
    neptune_output: Optional[Dict[str, Any]] = None
    uranus_output: Optional[Dict[str, Any]] = None
    pluto_output: Optional[Dict[str, Any]] = None
    aira_validation: Optional[Dict[str, Any]] = None

    # Status tracking
    planet_statuses: Dict[str, str] = Field(default_factory=dict)
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)

    # Final deliverables
    final_output: Optional[Dict[str, Any]] = None
    output_dir: str = ""

    class Config:
        arbitrary_types_allowed = True


class StreamEvent(BaseModel):
    event: str
    planet: Optional[str] = None
    message: str = ""
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ProjectResponse(BaseModel):
    project_id: str
    status: TaskStatus
    phases_completed: List[str] = Field(default_factory=list)
    outputs: Dict[str, Any] = Field(default_factory=dict)
    files: List[str] = Field(default_factory=list)
    summary: str = ""
