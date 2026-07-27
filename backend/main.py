from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="TaskStrand API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------
# Models
# -----------------------

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool


# -----------------------
# In-memory database
# -----------------------

tasks_db: List[Task] = [
    Task(
        id=1,
        title="Set up Python backend",
        description="Install FastAPI and run main.py",
        completed=True,
    ),
    Task(
        id=2,
        title="Connect frontend UI",
        description="Fetch data from localhost:8000",
        completed=False,
    ),
]


# -----------------------
# Helper
# -----------------------

def get_next_id() -> int:
    if not tasks_db:
        return 1
    return max(task.id for task in tasks_db) + 1


# -----------------------
# Routes
# -----------------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the TaskStrand API backend!"}


@app.get("/tasks", response_model=List[Task])
def get_all_tasks():
    return tasks_db


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    for task in tasks_db:
        if task.id == task_id:
            return task

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found",
    )


@app.post(
    "/tasks",
    response_model=Task,
    status_code=status.HTTP_201_CREATED,
)
def create_task(task: TaskCreate):
    new_task = Task(
        id=get_next_id(),
        title=task.title,
        description=task.description,
        completed=False,
    )

    tasks_db.append(new_task)
    return new_task


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: TaskUpdate):
    for index, task in enumerate(tasks_db):
        if task.id == task_id:
            tasks_db[index] = Task(
                id=task.id,
                title=updated_task.title,
                description=updated_task.description,
                completed=updated_task.completed,
            )
            return tasks_db[index]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found",
    )


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int):
    for index, task in enumerate(tasks_db):
        if task.id == task_id:
            tasks_db.pop(index)
            return

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found",
    )
