"""
Simple Task Manager API - FastAPI Backend
A demo application for Databricks Apps
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="Task Manager API",
    description="A simple task management API for demo purposes",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (for demo - in production, use a database)
tasks_db = []
task_id_counter = 1


# Data Models
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "medium"  # low, medium, high


class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    priority: str = "medium"
    completed: bool = False
    created_at: str


# API Endpoints
@app.get("/")
def root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to Task Manager API!",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "tasks": "/api/tasks",
            "docs": "/docs"
        }
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": "Task Manager",
        "timestamp": datetime.now().isoformat(),
        "total_tasks": len(tasks_db)
    }


@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    """Get all tasks"""
    return tasks_db


@app.post("/api/tasks", response_model=Task)
def create_task(task: TaskCreate):
    """Create a new task"""
    global task_id_counter
    
    new_task = Task(
        id=task_id_counter,
        title=task.title,
        description=task.description or "",
        priority=task.priority,
        completed=False,
        created_at=datetime.now().isoformat()
    )
    
    tasks_db.append(new_task.dict())
    task_id_counter += 1
    
    return new_task


@app.get("/api/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    """Get a specific task by ID"""
    for task in tasks_db:
        if task["id"] == task_id:
            return task
    
    raise HTTPException(status_code=404, detail="Task not found")


@app.put("/api/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskCreate):
    """Update a task"""
    for i, task in enumerate(tasks_db):
        if task["id"] == task_id:
            tasks_db[i].update({
                "title": task_update.title,
                "description": task_update.description,
                "priority": task_update.priority
            })
            return tasks_db[i]
    
    raise HTTPException(status_code=404, detail="Task not found")


@app.patch("/api/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    """Toggle task completion status"""
    for task in tasks_db:
        if task["id"] == task_id:
            task["completed"] = not task["completed"]
            return {"message": "Task updated", "task": task}
    
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    """Delete a task"""
    global tasks_db
    
    for i, task in enumerate(tasks_db):
        if task["id"] == task_id:
            deleted_task = tasks_db.pop(i)
            return {"message": "Task deleted", "task": deleted_task}
    
    raise HTTPException(status_code=404, detail="Task not found")


@app.get("/api/stats")
def get_stats():
    """Get task statistics"""
    total = len(tasks_db)
    completed = sum(1 for task in tasks_db if task["completed"])
    pending = total - completed
    
    priority_counts = {"low": 0, "medium": 0, "high": 0}
    for task in tasks_db:
        priority_counts[task["priority"]] += 1
    
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "by_priority": priority_counts
    }


# Add some demo data on startup
@app.on_event("startup")
def add_demo_data():
    """Add some demo tasks on startup"""
    demo_tasks = [
        {"title": "Welcome to Task Manager!", "description": "This is a demo task", "priority": "high"},
        {"title": "Try creating a new task", "description": "Click the 'Add Task' button", "priority": "medium"},
        {"title": "Mark tasks as complete", "description": "Click the checkbox to complete tasks", "priority": "low"}
    ]
    
    for task_data in demo_tasks:
        create_task(TaskCreate(**task_data))
    
    print("✅ Demo data loaded!")
    print(f"📊 Total tasks: {len(tasks_db)}")

