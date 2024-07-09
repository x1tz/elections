from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Body, Query
from fastapi.responses import StreamingResponse
import time
import json
from typing import Dict, List
import asyncio


class Vote(BaseModel):
  id: str
  choice: int

class StopState(BaseModel):
   is_stopped: bool

stop_state = False


from fastapi import FastAPI, Body, Query

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.post("/api/votes")
async def cast_vote(vote: Vote):
  """
  Casts a vote.
  """
  # Notify all SSE clients
  await notify_clients_vote("vote", vote)
  # Return the received vote (for confirmation or processing)
  return "OK"

  
@app.get("/api/stop")
async def get_stop():
  """
  Retrieves value of stop.
  """
  return stop_state

@app.put("/api/stop")
async def set_stop(is_stopped: bool = Query(default=False)):
  global stop_state
  stop_state = is_stopped
  # Notify all SSE clients about stop state change
  await notify_clients_stop("stop", StopState(is_stopped=is_stopped))
  return {"message": f"Stop state set to: {is_stopped}"}

clients = []

@app.get("/events")
async def sse_endpoint():
    """
    Endpoint for Server-Sent Events.
    """
    print("Sending message")
    async def event_generator():
        global clients
        queue = asyncio.Queue()
        clients.append(queue)
        try:
            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            clients.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def notify_clients_vote(event_type: str, data):

    message = {
        "type": event_type,
        "data": data
    }
    message_str = json.dumps(message)
    for queue in clients:
        await queue.put(message_str)

async def notify_clients_stop(event_type: str, data):

    message = {
        "type": event_type,
        "data": data.json()
    }
    message_str = json.dumps(message)
    for queue in clients:
        await queue.put(message_str)


def read_votes_from_file(filename):
  """
  Reads votes data from a JSON file.
  """
  with open(filename, 'r') as f:
    votes_data = json.load(f)
  return votes_data

@app.post("/api/votes/automated")
async def cast_votes_automated(votes_data: List[Vote]):
  """
  Casts multiple votes from a provided list.
  """
  i = 0
  for vote in votes_data:
    if i == 500:
       break
    await cast_vote(vote)
    i += 1
    await asyncio.sleep(5)  # Introduce 6 second delay between votes
  return "All votes cast successfully"  

@app.get("/api/automate")
async def start_automated_voting():
  """
  Triggers automated voting by reading votes from a file.
  """
  filename = "votes.json"
  votes_data = read_votes_from_file(filename)
  await cast_votes_automated(votes_data)
  return "Automated voting started"


if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000)

#http://localhost:8000/api/automate?filename=votes.json