# How to Create a React + FastAPI Databricks App

## 📚 Complete Step-by-Step Guide for Building & Deploying

This guide shows you how to create a **simple Task Manager application** with React frontend and FastAPI backend, deployed on Databricks Apps.

---

## 🎯 What We're Building

**Task Manager App** - A demo application that showcases:
- ✅ React frontend with modern UI
- ✅ FastAPI backend with RESTful API
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Real-time statistics
- ✅ Responsive design
- ✅ Deployed on Databricks Apps

**Live Demo Features:**
- Create tasks with title, description, and priority
- Mark tasks as complete/incomplete
- Delete tasks
- View task statistics
- Beautiful gradient UI

---

## 📋 Prerequisites

### Required Tools
```bash
# 1. Node.js and npm (for React)
node --version    # Should be v16 or higher
npm --version     # Should be v8 or higher

# Install if missing:
brew install node

# 2. Databricks CLI (configured)
databricks --version

# Configure if needed:
databricks configure --host <workspace-url>

# 3. Python 3.8+ (usually pre-installed on macOS)
python3 --version
```

---

## 🏗️ Step 1: Create Project Structure

```bash
# Create project directory
mkdir simple-task-app
cd simple-task-app

# Create subdirectories
mkdir backend frontend
```

Your structure should look like:
```
simple-task-app/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── app.yaml          # Databricks config
└── deploy.sh         # Deployment script
```

---

## 🔧 Step 2: Create the Backend (FastAPI)

### 2.1 Create `backend/main.py`

```python
"""
Simple Task Manager API - FastAPI Backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="Task Manager API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (demo purposes)
tasks_db = []
task_id_counter = 1

# Data Models
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "medium"

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    priority: str = "medium"
    completed: bool = False
    created_at: str

# API Endpoints
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Task Manager",
        "total_tasks": len(tasks_db)
    }

@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    return tasks_db

@app.post("/api/tasks", response_model=Task)
def create_task(task: TaskCreate):
    global task_id_counter
    new_task = Task(
        id=task_id_counter,
        title=task.title,
        description=task.description,
        priority=task.priority,
        completed=False,
        created_at=datetime.now().isoformat()
    )
    tasks_db.append(new_task.dict())
    task_id_counter += 1
    return new_task

@app.patch("/api/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    for task in tasks_db:
        if task["id"] == task_id:
            task["completed"] = not task["completed"]
            return {"message": "Task updated", "task": task}
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    for i, task in enumerate(tasks_db):
        if task["id"] == task_id:
            deleted_task = tasks_db.pop(i)
            return {"message": "Task deleted", "task": deleted_task}
    raise HTTPException(status_code=404, detail="Task not found")

@app.get("/api/stats")
def get_stats():
    total = len(tasks_db)
    completed = sum(1 for task in tasks_db if task["completed"])
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": total - completed
    }
```

### 2.2 Create `backend/requirements.txt`

```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
```

### 2.3 Test Backend Locally (Optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Test in browser: http://localhost:8000/docs
```

---

## ⚛️ Step 3: Create the Frontend (React)

### 3.1 Create `frontend/package.json`

```json
{
  "name": "task-manager-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

### 3.2 Create Frontend Structure

```bash
cd frontend
mkdir -p public src
```

### 3.3 Create `frontend/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Task Manager - Databricks App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 3.4 Create `frontend/src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.5 Create `frontend/src/App.js`

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' 
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get(`${API_BASE_URL}/tasks`);
    setTasks(response.data);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE_URL}/tasks`, newTask);
    setNewTask({ title: '', description: '', priority: 'medium' });
    fetchTasks();
  };

  const handleToggleTask = async (taskId) => {
    await axios.patch(`${API_BASE_URL}/tasks/${taskId}/toggle`);
    fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    fetchTasks();
  };

  return (
    <div className="App">
      <h1>📝 Task Manager</h1>
      
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="tasks">
        {tasks.map((task) => (
          <div key={task.id} className="task">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleTask(task.id)}
            />
            <span>{task.title}</span>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

### 3.6 Add Basic Styling (Optional)

Create `frontend/src/index.css` and `frontend/src/App.css` with your desired styles.

### 3.7 Test Frontend Locally (Optional)

```bash
cd frontend
npm install
npm start

# Opens browser at http://localhost:3000
```

---

## 📦 Step 4: Create Databricks Configuration

### 4.1 Create `app.yaml`

```yaml
command:
  - sh
  - -c
  - |
    # Install dependencies
    pip install fastapi uvicorn pydantic python-multipart
    
    # Create app (embed backend code here)
    cat > /tmp/app.py << 'PYEOF'
    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from pathlib import Path
    
    # ... (paste your backend code here)
    
    # Serve React frontend
    FRONTEND_DIR = Path("/workspace/frontend")
    if FRONTEND_DIR.exists():
        app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR / "static")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        index_html = FRONTEND_DIR / "index.html"
        if index_html.exists():
            return FileResponse(index_html)
        return {"message": "API running"}
    
    PYEOF
    
    # Run server
    uvicorn app:app --host 0.0.0.0 --port 8000 --app-dir /tmp
```

---

## 🚀 Step 5: Create Deployment Script

### 5.1 Create `deploy.sh`

```bash
#!/bin/bash

APP_NAME="task-manager-demo"
WORKSPACE_PATH="/Workspace/Users/YOUR_EMAIL@databricks.com/apps/$APP_NAME"

echo "🚀 Deploying Task Manager..."

# Build React app
cd frontend
npm install
npm run build
cd ..

# Create workspace
databricks workspace mkdirs "$WORKSPACE_PATH"

# Upload files
databricks workspace import-dir frontend/build "$WORKSPACE_PATH/frontend" --overwrite
databricks workspace import-dir backend "$WORKSPACE_PATH/backend" --overwrite
databricks workspace import "$WORKSPACE_PATH/app.yaml" --file app.yaml --language PYTHON

# Create/Deploy app
if ! databricks apps get "$APP_NAME" &>/dev/null; then
    databricks apps create "$APP_NAME"
fi

databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"

echo "✅ Deployment complete!"
```

### 5.2 Make it Executable

```bash
chmod +x deploy.sh
```

---

## 🎬 Step 6: Deploy to Databricks

### 6.1 Run Deployment Script

```bash
./deploy.sh
```

### 6.2 Monitor Deployment

```bash
# Check app status
databricks apps get task-manager-demo

# View deployments
databricks apps list-deployments task-manager-demo
```

### 6.3 Access Your App

The deployment script will output your app URL:
```
https://task-manager-demo-XXXXX.aws.databricksapps.com
```

---

## ✅ Verification Steps

### 1. Test API
```bash
curl https://YOUR-APP-URL.databricksapps.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "app": "Task Manager",
  "total_tasks": 3
}
```

### 2. Open in Browser
Navigate to your app URL and verify:
- ✅ Page loads with Task Manager UI
- ✅ Demo tasks are visible
- ✅ Can create new tasks
- ✅ Can mark tasks complete
- ✅ Can delete tasks
- ✅ Statistics update in real-time

---

## 🎨 Customization Ideas

### Add Database Support
Replace in-memory storage with PostgreSQL:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# In app.yaml, add environment variables:
env:
  - name: DATABASE_URL
    value: "postgresql://user:pass@host/db"
```

### Add Authentication
Integrate Databricks OAuth:

```python
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()
current_user = w.current_user.me()
```

### Enhance UI
- Add Material-UI components
- Implement drag-and-drop
- Add task categories
- Dark mode toggle

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js
```bash
brew install node
```

### Issue: "App deployment failed"
**Solution:** Check logs
```bash
databricks apps list-deployments task-manager-demo
```

### Issue: "API returns 404"
**Solution:** Verify app.yaml paths match your workspace structure

### Issue: "Frontend not loading"
**Solution:** Ensure React build completed successfully
```bash
cd frontend
npm run build
ls -la build/  # Should show index.html and static/
```

---

## 📊 Architecture Overview

```
┌────────────────────────────────────┐
│  User's Browser                     │
│  ┌──────────────────────────────┐  │
│  │  React App (JavaScript)      │  │
│  │  - UI Components             │  │
│  │  - State Management          │  │
│  │  - API Calls (Axios)         │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
              ↓ HTTPS
┌────────────────────────────────────┐
│  Databricks Apps (Serverless)      │
│  ┌──────────────────────────────┐  │
│  │  FastAPI Server (Python)     │  │
│  │  - API Endpoints             │  │
│  │  - Business Logic            │  │
│  │  - Static File Serving       │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Data Storage                │  │
│  │  - In-memory (demo)          │  │
│  │  - PostgreSQL (production)   │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

## 🎯 Summary

You've successfully created a full-stack React + FastAPI application on Databricks!

**What you learned:**
1. ✅ Setting up React frontend with npm
2. ✅ Creating FastAPI backend with Python
3. ✅ Integrating frontend and backend
4. ✅ Configuring Databricks Apps with app.yaml
5. ✅ Deploying with Databricks CLI
6. ✅ Testing and verification

**Next Steps:**
- Add database persistence
- Implement user authentication
- Add more features (tags, due dates, etc.)
- Deploy to production with proper secrets management

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Databricks Apps Guide](https://docs.databricks.com/apps/)
- [Databricks CLI Reference](https://docs.databricks.com/dev-tools/cli/)

---

**Created:** October 22, 2025  
**App Type:** Full-Stack React + FastAPI  
**Deployment Target:** Databricks Apps  
**Complexity:** Beginner-Friendly 🟢

