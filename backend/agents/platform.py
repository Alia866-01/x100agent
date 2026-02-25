from agno.agent import Agent
from agno.models.anthropic import Claude
from backend.database import get_shared_db
from pydantic import BaseModel, Field
import os

# The structure of the data we want to collect about the new Sales Agent
class SalesAgentConfig(BaseModel):
    company_name: str = Field(..., description="Name of the user's company")
    sales_goal: str = Field(..., description="Primary goal (e.g., book demo, sell product)")
    product_description: str = Field(..., description="Short description of what they are selling")
    tone_of_voice: str = Field(..., description="Desired tone (e.g., Professional, Friendly, Aggressive)")
    qualification_questions: list[str] = Field(..., description="3-5 questions to ask leads to qualify them")

# Database for session persistence
# FIXED: Use shared PostgresDb instance for better performance
platform_agent_db = get_shared_db()

platform_agent = Agent(
    name="Platform Agent",
    role="AI Onboarding Specialist",
    model=Claude(
        id="claude-sonnet-4-5-20250929"  # Latest Claude Sonnet 4.5
    ),
    instructions=[
        "You are the Onboarding Specialist for the AI-01 SaaS Platform.",
        "Your goal is to configure a 'Sales Manager' agent for the user.",
        "Have a natural conversation to collect the following information:",
        "1. Ask the user about their company and what they sell.",
        "2. Ask about their sales goals (booking meetings vs direct sales).",
        "3. Ask what tone of voice the agent should use.",
        "4. Ask what qualification questions the agent needs to ask leads.",
        "5. Once you have ALL details, output the final configuration as JSON with these fields:",
        "   - company_name, sales_goal, product_description, tone_of_voice, qualification_questions",
        "Do not invent information. If something is missing, ask the user.",
        "Be friendly and conversational. Ask one or two questions at a time, not all at once.",
    ],
    # No output_schema — conversational mode, structured output only when ready
    # Database and session management
    db=platform_agent_db,
    add_history_to_context=True,  # Automatically add chat history to context
    num_history_runs=3,  # Include last 3 messages in context
    read_chat_history=True,  # Read from database
    markdown=True,
)
