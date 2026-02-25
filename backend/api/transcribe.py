"""
Audio Transcription API — faster-whisper (local, free)

Records audio on the frontend, sends to this endpoint,
runs Whisper locally via faster-whisper, returns text.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
import tempfile
import os
import traceback

router = APIRouter()

# Lazy-load model on first request (downloads ~150MB "base" model once)
_model = None


def get_whisper_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        print("[Whisper] Loading model 'base' (first request, ~150MB download)...")
        _model = WhisperModel("base", device="cpu", compute_type="int8")
        print("[Whisper] Model loaded successfully")
    return _model


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio using local Whisper model (faster-whisper).

    Accepts: audio/webm, audio/mp4, audio/wav, audio/mpeg, audio/ogg
    Returns: { "text": "transcribed text", "language": "en" }
    """
    try:
        model = get_whisper_model()

        # Determine file extension from content type
        suffix = ".webm"
        if file.content_type:
            ext_map = {
                "audio/webm": ".webm",
                "audio/mp4": ".mp4",
                "audio/mpeg": ".mp3",
                "audio/wav": ".wav",
                "audio/ogg": ".ogg",
            }
            suffix = ext_map.get(file.content_type, ".webm")

        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        print(f"[Transcribe] File: {file.filename}, size: {len(content)} bytes, type: {file.content_type}")

        try:
            segments, info = model.transcribe(tmp_path, beam_size=5)
            text = " ".join(segment.text.strip() for segment in segments)

            print(f"[Transcribe] Language: {info.language} ({info.language_probability:.0%})")
            print(f"[Transcribe] Result: {text[:100]}...")

            return {
                "text": text.strip(),
                "language": info.language,
            }

        finally:
            os.unlink(tmp_path)

    except Exception as e:
        print(f"[Transcribe] Error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
