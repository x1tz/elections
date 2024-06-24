from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Body, Query


class Vote(BaseModel):
  id: str
  choice: int

votes = []
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
  # Add vote to the list (if using in-memory storage)
  global votes
  votes.clear()
  votes.append(vote)

  # Return the received vote (for confirmation or processing)
  return vote

@app.get("/api/votes")
async def get_all_votes():
  """
  Retrieves all recorded votes.
  """
  global votes
  #v = votes
  # votes.clear()
  return votes

@app.put("/api/votes")
async def remove_votes():
  """
  Removes vote from the list.
  """
  global votes
  votes.clear()
  return 'votes cleared'

  
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
  return {"message": f"Stop state set to: {is_stopped}"}


if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000)

