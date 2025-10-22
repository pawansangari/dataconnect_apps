# 📝 Simple Task Manager - Databricks App Demo

A beautiful, full-stack task management application built with **React** and **FastAPI**, deployed on **Databricks Apps**.

![Status](https://img.shields.io/badge/status-ready-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)

---

## 🌟 Features

### User Features
- ✅ **Create Tasks** - Add tasks with title, description, and priority
- ✅ **Mark Complete** - Toggle task completion status
- ✅ **Delete Tasks** - Remove tasks you no longer need
- ✅ **View Statistics** - See total, completed, and pending tasks
- ✅ **Priority Levels** - Organize with Low, Medium, High priorities
- ✅ **Beautiful UI** - Modern gradient design with smooth animations

### Technical Features
- ⚡ **Fast Performance** - React for instant UI updates
- 🔄 **RESTful API** - Clean FastAPI backend with automatic docs
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Gradient themes, smooth transitions
- 🔒 **Databricks Auth** - Built-in workspace authentication
- ☁️ **Serverless** - No infrastructure management needed

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 16+ and npm
node --version
npm --version

# Databricks CLI (configured)
databricks --version
```

### Deploy in 3 Steps

```bash
# 1. Navigate to the project
cd simple-task-app

# 2. Make deploy script executable
chmod +x deploy.sh

# 3. Deploy!
./deploy.sh
```

That's it! Your app will be live in ~2 minutes.

---

## 📁 Project Structure

```
simple-task-app/
│
├── README.md                 # This file
├── HOW_TO_CREATE.md         # Detailed creation guide
├── DEMO_GUIDE.md            # Demo presentation guide
│
├── backend/                  # FastAPI Backend
│   ├── main.py              # API endpoints & logic
│   └── requirements.txt     # Python dependencies
│
├── frontend/                 # React Frontend
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styles
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # npm dependencies
│   └── build/               # Production build (generated)
│
├── app.yaml                  # Databricks app config
└── deploy.sh                 # Deployment automation
```

---

## 🎯 API Endpoints

### Base URL
```
https://YOUR-APP-URL.databricksapps.com
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check & status |
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create new task |
| `GET` | `/api/tasks/{id}` | Get specific task |
| `PATCH` | `/api/tasks/{id}/toggle` | Toggle completion |
| `DELETE` | `/api/tasks/{id}` | Delete task |
| `GET` | `/api/stats` | Get statistics |
| `GET` | `/docs` | Interactive API docs |

### Example API Call

```bash
# Health check
curl https://YOUR-APP-URL.databricksapps.com/api/health

# Create task
curl -X POST https://YOUR-APP-URL.databricksapps.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My new task",
    "description": "Task details here",
    "priority": "high"
  }'
```

---

## 💻 Local Development

### Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload

# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start

# App available at http://localhost:3000
```

---

## 🎨 Screenshots & Demo

### Task Manager Interface
- Clean, modern design with gradient background
- Card-based task layout
- Real-time statistics dashboard
- Responsive form with validation

### Features in Action
1. **Add Task** - Click "+ Add Task" button
2. **Fill Form** - Enter title, description, priority
3. **View Task** - See task appear in beautiful card
4. **Complete Task** - Click checkbox to mark done
5. **Delete Task** - Click trash icon to remove

---

## 🔧 Customization

### Change App Name
Edit `deploy.sh`:
```bash
APP_NAME="your-app-name"
```

### Modify UI Colors
Edit `frontend/src/App.css`:
```css
.App {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%);
}
```

### Add Database
Replace in-memory storage in `backend/main.py`:
```python
from sqlalchemy import create_engine

engine = create_engine(os.getenv("DATABASE_URL"))
```

---

## 📊 Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Axios 1.6** - HTTP client
- **CSS3** - Styling with gradients & animations

### Backend
- **FastAPI 0.104** - Python web framework
- **Uvicorn 0.24** - ASGI server
- **Pydantic 2.5** - Data validation

### Infrastructure
- **Databricks Apps** - Serverless hosting
- **Databricks CLI** - Deployment automation

---

## 🐛 Troubleshooting

### Node.js Not Found
```bash
brew install node
```

### Deployment Fails
```bash
# Check CLI is configured
databricks configure --host YOUR_WORKSPACE_URL

# Verify authentication
databricks workspace list /
```

### Frontend Not Loading
```bash
# Rebuild React app
cd frontend
rm -rf build node_modules
npm install
npm run build
```

### API Not Responding
```bash
# Check app status
databricks apps get task-manager-demo

# View deployment history
databricks apps list-deployments task-manager-demo
```

---

## 📚 Documentation

- **[HOW_TO_CREATE.md](./HOW_TO_CREATE.md)** - Complete step-by-step guide for building from scratch
- **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - Presentation guide for demos
- **[FastAPI Docs](https://fastapi.tiangolo.com/)** - Backend framework
- **[React Docs](https://react.dev/)** - Frontend framework
- **[Databricks Apps](https://docs.databricks.com/apps/)** - Deployment platform

---

## 🎯 Use Cases

This demo app is perfect for:

- 🎓 **Learning** - Understand full-stack development
- 🎤 **Presentations** - Demo Databricks Apps capabilities
- 🚀 **Prototyping** - Quick MVP development
- 📚 **Teaching** - Show best practices
- 🔨 **Starting Point** - Base for real applications

---

## 🌱 Next Steps

### Phase 1: Enhance Features
- [ ] Add task categories/tags
- [ ] Implement due dates
- [ ] Add task search/filter
- [ ] Enable task editing
- [ ] Add task sorting

### Phase 2: Production Ready
- [ ] Connect to PostgreSQL database
- [ ] Add user authentication
- [ ] Implement data persistence
- [ ] Add error logging
- [ ] Set up monitoring

### Phase 3: Advanced Features
- [ ] Real-time updates (WebSockets)
- [ ] Email notifications
- [ ] Task assignments
- [ ] File attachments
- [ ] Mobile app (React Native)

---

## 📝 License

This is a demo application for educational purposes.

---

## 🤝 Contributing

This is a demo project. Feel free to:
- Fork and modify
- Use as a learning resource
- Build upon for your own projects
- Share with others

---

## 📧 Support

For questions about Databricks Apps, refer to:
- [Databricks Documentation](https://docs.databricks.com/)
- [Databricks Community](https://community.databricks.com/)

---

## 🎉 Credits

**Built with ❤️ for Databricks App Demos**

- React Team - UI framework
- FastAPI Team - Backend framework
- Databricks Team - Hosting platform

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 22, 2025

