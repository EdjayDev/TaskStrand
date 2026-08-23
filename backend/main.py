from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    completed: bool


class TaskPatch(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    completed: Optional[bool] = None


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


def find_task_index(task_id: int) -> int:
    for index, task in enumerate(tasks_db):
        if task.id == task_id:
            return index
    return -1


# -----------------------
# Endpoints
# -----------------------

@app.get("/tasks", response_model=List[Task], summary="Get all tasks")
def get_tasks():
    return tasks_db


@app.get("/tasks/{task_id}", response_model=Task, summary="Get a single task by ID")
def get_task(task_id: int):
    index = find_task_index(task_id)
    if index == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return tasks_db[index]


@app.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED, summary="Create a new task")
def create_task(task_in: TaskCreate):
    new_task = Task(
        id=get_next_id(),
        title=task_in.title,
        description=task_in.description,
        completed=False
    )
    tasks_db.append(new_task)
    return new_task


@app.put("/tasks/{task_id}", response_model=Task, summary="Fully update a task")
def update_task(task_id: int, task_in: TaskUpdate):
    index = find_task_index(task_id)
    if index == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    updated_task = Task(
        id=task_id,
        title=task_in.title,
        description=task_in.description,
        completed=task_in.completed
    )
    tasks_db[index] = updated_task
    return updated_task


@app.patch("/tasks/{task_id}", response_model=Task, summary="Partially update a task")
def patch_task(task_id: int, task_in: TaskPatch):
    index = find_task_index(task_id)
    if index == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    current_task = tasks_db[index]
    update_data = task_in.model_dump(exclude_unset=True)
    
    updated_task = current_task.model_copy(update=update_data)
    tasks_db[index] = updated_task
    return updated_task


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a task")
def delete_task(task_id: int):
    index = find_task_index(task_id)
    if index == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    tasks_db.pop(index)
    return None

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
