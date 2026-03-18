import React, { useState, useEffect } from 'react';
import '../App.css';
import {
  calculateAttendancePercentage,
  getPendingTasksCount,
  getCompletedTasksCount,
  getAverageStudyHours,
  getTodaysTasks
} from '../utils/dataCalculations';

const Dashboard = ({ onNavigate, userName }) => {
  const [metrics, setMetrics] = useState({
    attendance: 0,
    pending: 0,
    completed: 0,
    avgStudyHours: { hours: 0, minutes: 0 },
    todaysTasks: []
  });

  useEffect(() => {
    updateMetrics();
    // Set up interval to refresh metrics
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    setMetrics({
      attendance: calculateAttendancePercentage(),
      pending: getPendingTasksCount(),
      completed: getCompletedTasksCount(),
      avgStudyHours: getAverageStudyHours(),
      todaysTasks: getTodaysTasks()
    });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return '#28a745'; // Green
    if (attendance >= 75) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const cardsData = [
    {
      title: 'Attendance Percentage',
      value: `${metrics.attendance}%`,
      icon: '📊',
      color: getAttendanceColor(metrics.attendance),
      action: () => onNavigate('attendance'),
      description: 'Overall attendance'
    },
    {
      title: 'Pending Tasks',
      value: metrics.pending,
      icon: '📋',
      color: '#ff9800',
      action: () => onNavigate('tasks', 'pending'),
      description: 'Tasks to complete'
    },
    {
      title: 'Completed Tasks',
      value: metrics.completed,
      icon: '✅',
      color: '#28a745',
      action: () => onNavigate('tasks', 'completed'),
      description: 'Tasks completed'
    },
    {
      title: 'Average Study Hours',
      value: `${metrics.avgStudyHours.hours}h ${metrics.avgStudyHours.minutes}m`,
      icon: '📚',
      color: '#007bff',
      action: () => onNavigate('study-hours'),
      description: 'Weekly average'
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-heading">Dashboard</h1>
          <p className="dashboard-date">{today}</p>
        </div>
        <div className="dashboard-welcome">
          <p className="welcome-text">Hi {userName}! 👋</p>
        </div>
      </div>

      <div className="cards-grid">
        {cardsData.map((card, index) => (
          <div
            key={index}
            className="card-item"
            onClick={card.action}
            style={{
              cursor: 'pointer',
              borderLeft: `5px solid ${card.color}`
            }}
          >
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p className="card-value" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="card-description">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="todays-tasks-container">
        <div className="section-header">
          <h3>📅 Today's Tasks</h3>
          <button
            className="add-task-link"
            onClick={() => onNavigate('tasks', 'pending')}
          >
            Manage Tasks →
          </button>
        </div>

        <div className="tasks-section">
          {metrics.todaysTasks.length === 0 ? (
            <div className="no-tasks">
              <p className="no-tasks-icon">🎉</p>
              <p className="no-tasks-text">No tasks for today. Great job!</p>
              <button
                className="add-new-task-btn"
                onClick={() => onNavigate('tasks', 'pending')}
              >
                + Add Task
              </button>
            </div>
          ) : (
            <div className="todays-tasks-list">
              {metrics.todaysTasks.map((task) => (
                <div key={task.id} className="today-task-item">
                  <div className="task-status">
                    <input type="checkbox" disabled className="task-checkbox" />
                  </div>
                  <div className="task-details">
                    <p className="task-name">{task.name}</p>
                    {task.deadline?.time && (
                      <p className="task-time">Due at {task.deadline.time}</p>
                    )}
                  </div>
                  <div className="task-priority">
                    <span className="priority-badge">Today</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h4>Quick Stats</h4>
          <div className="stat-list">
            <div className="stat-item">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{metrics.pending + metrics.completed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">
                {metrics.completed + metrics.pending === 0
                  ? '0%'
                  : `${Math.round((metrics.completed / (metrics.completed + metrics.pending)) * 100)}%`}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Today's Study</span>
              <span className="stat-value">In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
