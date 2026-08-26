"""
♀ Venus - UI/UX & Experience Planet
"A product is successful when people enjoy using it, not just when it works."

Venus designs the complete user experience: user personas, journeys,
design system, component library, and brand identity.
"""
from llm_utils import llm_call, llm_json_call
from models import AIRAState, Planet, PlanetStatus
import json
import os
import random


VENUS_PERSONALITY = [
    "Mars calls that architecture elegant. I call it emotional damage.",
    "Good design is invisible. Unlike Mars' diagrams.",
    "If users need a manual... the design has already failed.",
    "I fixed the interface. Mars immediately added twelve new settings.",
    "Everyone builds AI. Very few build beautiful AI.",
]

VENUS_SYSTEM_PROMPT = """You are Venus, the UI/UX & Experience Planet of AIRA OS.
Your role: Chief Experience Officer.
Personality: Creative, perfectionist, stylish, brutally honest, constantly roasts Mars.

Your job is to design the complete human experience for the project.
You create:
- User personas and journey maps
- Information architecture
- Design system (colors, typography, spacing, components)
- Brand identity
- Screen layouts and wireframes (described in detail)
- Animation and interaction design
- Accessibility guidelines

Venus does NOT write frontend code — that's Earth's job.
Venus designs what users will love.
Always respond with beautiful, user-centered design thinking."""


async def run_venus(state: AIRAState) -> AIRAState:
    """Execute Venus's design pipeline."""
    state.planet_statuses[Planet.VENUS] = PlanetStatus.ACTIVE
    state.current_phase = "venus"
    quip = random.choice(VENUS_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("venus", "")

    try:
        # Phase 1: Design System
        design_prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Create the complete design system and screens'}

Design a complete design system for this project:

PROJECT: {state.user_request}
TARGET USERS: {json.dumps(research.get('target_users', ['General users']), indent=2)}
DOMAIN: {research.get('domain', 'Technology')}
KEY FEATURES: {json.dumps(research.get('key_features', []), indent=2)}

Create a comprehensive design system as JSON:
{{
  "brand_identity": {{
    "brand_name": "Project brand name",
    "tagline": "Short tagline",
    "personality": ["adjective1", "adjective2", "adjective3"],
    "brand_voice": "Professional, friendly, innovative"
  }},
  "color_palette": {{
    "primary": "#6366F1",
    "primary_dark": "#4F46E5",
    "secondary": "#10B981",
    "accent": "#F59E0B",
    "background": "#0F0F1A",
    "surface": "#1A1A2E",
    "surface_elevated": "#16213E",
    "text_primary": "#F8FAFC",
    "text_secondary": "#94A3B8",
    "text_muted": "#64748B",
    "border": "#1E293B",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "info": "#3B82F6"
  }},
  "typography": {{
    "font_family_heading": "Inter or Geist",
    "font_family_body": "Inter",
    "font_family_mono": "JetBrains Mono",
    "scale": {{
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }}
  }},
  "spacing": {{
    "unit": "4px",
    "scale": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  }},
  "border_radius": {{
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "full": "9999px"
  }},
  "shadows": {{
    "sm": "0 1px 3px rgba(0,0,0,0.3)",
    "md": "0 4px 16px rgba(0,0,0,0.4)",
    "lg": "0 8px 32px rgba(0,0,0,0.5)",
    "glow_primary": "0 0 20px rgba(99,102,241,0.3)"
  }},
  "components": [
    {{
      "name": "PrimaryButton",
      "description": "Main CTA button",
      "variants": ["default", "outline", "ghost"],
      "states": ["default", "hover", "active", "disabled"]
    }},
    {{
      "name": "Card",
      "description": "Content container with glass morphism effect"
    }},
    {{
      "name": "PlanetBadge",
      "description": "Shows active planet with glow effect"
    }}
  ],
  "animations": {{
    "duration_fast": "150ms",
    "duration_normal": "300ms",
    "duration_slow": "600ms",
    "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
    "planet_orbit": "Rotating solar system animation",
    "thinking_pulse": "Pulsing glow when AI is processing",
    "stream_text": "Typewriter effect for AI responses"
  }},
  "venus_note": "A brief Venus personality quip about the design"
}}
"""
        design_data = await llm_json_call(VENUS_SYSTEM_PROMPT, design_prompt)

        # Phase 2: Screen Layouts
        screens_prompt = f"""
Design the key screens for this project: {state.user_request}
Features: {json.dumps(research.get('key_features', []), indent=2)}

Describe the main screens as JSON:
{{
  "screens": [
    {{
      "name": "Dashboard / Home",
      "route": "/",
      "purpose": "Main workspace",
      "layout": "description of layout",
      "key_sections": ["section 1", "section 2"],
      "interactions": ["what users can do"]
    }},
    {{
      "name": "New Project",
      "route": "/project/new",
      "purpose": "Start a new AI project",
      "layout": "centered form with planet animation",
      "key_sections": ["project input", "file upload", "configuration"],
      "interactions": ["type idea", "upload files", "configure options"]
    }},
    {{
      "name": "Project Workspace",
      "route": "/project/[id]",
      "purpose": "Active project with planet statuses",
      "layout": "split view - planets left, output right",
      "key_sections": ["solar system visualization", "planet status cards", "output panels"],
      "interactions": ["watch planets work", "view outputs", "download files"]
    }}
  ],
  "navigation": {{
    "type": "sidebar",
    "items": ["Dashboard", "Projects", "New Project", "Settings"]
  }},
  "ux_principles": [
    "Progressive disclosure - show complexity only when needed",
    "Real-time feedback - users always know what AI is doing",
    "Dark theme optimized for long sessions"
  ]
}}
"""
        screens_data = await llm_json_call(VENUS_SYSTEM_PROMPT, screens_prompt)

        venus_output = {
            "status": "completed",
            "planet": "venus",
            "personality_quip": quip,
            "assigned_task": assignment,
            "design_system": design_data,
            "screens": screens_data,
            "files_generated": [
                "Design_System.md",
                "Brand_Guide.md",
                "Screen_Designs.md",
                "Component_Library.md"
            ]
        }

        await save_venus_output(state.project_id, venus_output, state.output_dir)

        state.venus_output = venus_output
        state.planet_statuses[Planet.VENUS] = PlanetStatus.COMPLETED

        state.messages.append({
            "planet": "venus",
            "event": "completed",
            "message": f"Design system complete. {len(design_data.get('components', []))} components designed. {len(screens_data.get('screens', []))} screens planned.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.VENUS] = PlanetStatus.ERROR
        state.errors.append(f"Venus error: {str(e)}")
        state.venus_output = {"status": "error", "error": str(e), "planet": "venus"}

    return state


async def save_venus_output(project_id: str, output: dict, output_dir: str):
    """Save Venus's design to files."""
    if not output_dir:
        return

    design_dir = os.path.join(output_dir, "03_Design")
    os.makedirs(design_dir, exist_ok=True)

    ds = output.get("design_system", {})
    cp = ds.get("color_palette", {})
    ty = ds.get("typography", {})
    brand = ds.get("brand_identity", {})

    design_content = f"""# Design System
## Brand: {brand.get('brand_name', 'Project')}
> {brand.get('tagline', '')}

**Personality:** {', '.join(brand.get('personality', []))}

## Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `{cp.get('primary', '#6366F1')}` | Main brand color |
| Secondary | `{cp.get('secondary', '#10B981')}` | Success / CTA |
| Background | `{cp.get('background', '#0F0F1A')}` | Page background |
| Surface | `{cp.get('surface', '#1A1A2E')}` | Card backgrounds |
| Text Primary | `{cp.get('text_primary', '#F8FAFC')}` | Main text |
| Text Secondary | `{cp.get('text_secondary', '#94A3B8')}` | Secondary text |

## Typography
- **Heading Font:** {ty.get('font_family_heading', 'Inter')}
- **Body Font:** {ty.get('font_family_body', 'Inter')}
- **Mono Font:** {ty.get('font_family_mono', 'JetBrains Mono')}

## Animations
- **Planet Orbit:** {ds.get('animations', {}).get('planet_orbit', '')}
- **AI Thinking:** {ds.get('animations', {}).get('thinking_pulse', '')}
- **Stream Text:** {ds.get('animations', {}).get('stream_text', '')}

## Components
{chr(10).join(f"### {c.get('name','')}\\n{c.get('description','')}" for c in ds.get('components', []))}

---
*Generated by ♀ Venus - UI/UX & Experience Planet*
*"{output.get('personality_quip', '')}"*
"""

    with open(os.path.join(design_dir, "Design_System.md"), "w", encoding="utf-8") as f:
        f.write(design_content)

    with open(os.path.join(design_dir, "venus_data.json"), "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, default=str)
