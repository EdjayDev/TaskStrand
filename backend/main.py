from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="TaskStrand API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False

tasks_db: List[Task] = [
    Task(id=1, title="Set up Python backend", description="Install FastAPI and run main.py", completed=True),
    Task(id=2, title="Connect frontend UI", description="Fetch data from localhost:8000", completed=False)
]

@app.get("/")
def read_root():
    return {"message": "Welcome to the TaskStrand API backend!"}

@app.get("/tasks", response_model=List[Task])
def get_all_tasks():
    return tasks_db

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: Task):
    if any(t.id == task.id for t in tasks_db):
        raise HTTPException(status_code=400, detail="Task with this ID already exists.")
    
    tasks_db.append(task)
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: Task):
    for index, task in enumerate(tasks_db):
        if task.id == task_id:
            tasks_db[index] = updated_task
            return updated_task
            
    raise HTTPException(status_code=404, detail="Task not found")