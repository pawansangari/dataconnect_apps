import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Configure API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/tasks`, newTask);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/toggle`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Failed to update task. Please try again.');
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>📝 Task Manager</h1>
            <p className="subtitle">Databricks App Demo</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancel' : '+ Add Task'}
          </button>
        </header>

        {/* Statistics */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_tasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-value">{stats.completed_tasks}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-value">{stats.pending_tasks}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        {showForm && (
          <div className="card form-card">
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-input"
                  placeholder="Enter task description (optional)..."
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="form-input"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Create Task
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        )}

        {/* Tasks List */}
        {!loading && tasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No tasks yet!</h2>
            <p>Click "Add Task" to create your first task.</p>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`task-card ${task.completed ? 'task-completed' : ''}`}
              >
                <div className="task-header">
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                    />
                  </div>
                  <div className="task-priority" style={{ color: getPriorityColor(task.priority) }}>
                    {getPriorityEmoji(task.priority)} {task.priority}
                  </div>
                </div>

                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                </div>

                <div className="task-footer">
                  <span className="task-id">Task #{task.id}</span>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>Built with React + FastAPI on Databricks Apps</p>
          <p className="footer-links">
            <a href="/api/health" target="_blank" rel="noopener noreferrer">API Health</a>
            <span>•</span>
            <a href="/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

