from fastapi import APIRouter, Request
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import json
from ollama import AsyncClient


router = APIRouter()

# For LLM response
class ChatValues(BaseModel):
    plant: str
    disease: str

# Async function to generate LLM response
async def generate_llm_response(plant: str, disease: str) -> AsyncGenerator[str, None]:
    async_client = AsyncClient()
    message = {
        "role": "user",
        "content": f"As a plant pathologist, provide a concise explanation of {disease} in {plant}. Part 1 - Disease Overview: - What is the specific pathogen causing {disease}?- What are the primary symptoms of the disease?- How does the disease spread? Part 2 - Disease Management:- What are key prevention strategies?- What are effective treatment methods?- What cultural practices can minimize disease impact? Provide a technical, precise response focused on actionable information for farmers and agricultural professionals. Remove special syntaxes like **, avoid using tabs or complex formatting, use plain text with clear, simple structure.",
    }
    
    try:
        async for part in await async_client.chat(
            model="llama3.2", 
            messages=[message], 
            stream=True
        ):
            data = json.dumps({"content": part['message']['content']})
            yield f"data: {data}\n\n"
    except Exception as e:
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
    finally:
        yield "event: close\ndata: Stream completed\n\n"

# Endpoint for the chat route (GET request for streaming)
@router.get("/chat")
async def chat_stream(request: Request, plant: str, disease: str):
    return StreamingResponse(
        generate_llm_response(plant, disease), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )
