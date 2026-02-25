"""
Platform Agent Chat API

Direct endpoint for the Platform Agent (Onboarding Specialist).
Unlike /api/agents/invoke which loads agents from DB,
this talks directly to the Agno Platform Agent.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import traceback

router = APIRouter()


class PlatformChatRequest(BaseModel):
    message: str = Field(..., max_length=10000)
    user_id: str = Field(default="anonymous", max_length=100)
    session_id: Optional[str] = Field(None, max_length=100)


class PlatformChatResponse(BaseModel):
    content: str
    session_id: str


@router.post("/platform/chat", response_model=PlatformChatResponse)
async def platform_chat(request: PlatformChatRequest):
    """
    Chat with the Platform Agent (Onboarding Specialist).

    Uses Agno's built-in session/history management.
    The session_id groups messages into a conversation.
    """
    try:
        from backend.agents.platform import platform_agent

        session_id = request.session_id or f"session_{request.user_id}"

        print(f"[PlatformChat] user={request.user_id} session={session_id} msg_len={len(request.message)}")

        response = platform_agent.run(
            request.message,
            user_id=request.user_id,
            session_id=session_id,
        )

        # Extract text content
        content = ""
        if hasattr(response, "content") and response.content:
            content = response.content
        elif isinstance(response, str):
            content = response
        else:
            content = str(response)

        print(f"[PlatformChat] Response: {len(content)} chars")

        return PlatformChatResponse(
            content=content,
            session_id=session_id,
        )

    except Exception as e:
        print(f"[PlatformChat] Error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
