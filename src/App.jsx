import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import StudyHours from './pages/StudyHours';
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [taskType, setTaskType] = useState('pending');
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    // Check if user name exists in localStorage
    const savedName = localStorage.getItem('attodo_user_name');
    if (savedName) {
      setUserName(savedName);
    } else {
      setShowNameInput(true);
    }
  }, []);

  const handleNameSubmit = (name) => {
    if (name.trim()) {
      const trimmedName = name.trim();
      setUserName(trimmedName);
      localStorage.setItem('attodo_user_name', trimmedName);
      setShowNameInput(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('attodo_user_name');
    setUserName('');
    setCurrentView('dashboard');
    setShowNameInput(true);
  };

  const navigateTo = (view, taskType = 'pending') => {
    setCurrentView(view);
    if (taskType) setTaskType(taskType);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1 className="navbar-title" onClick={() => navigateTo('dashboard')} style={{ cursor: 'pointer' }}>Attodo</h1>
        {userName && !showNameInput && (
          <button className="logout-btn" onClick={handleLogout} type="button">
            Log out
          </button>
        )}
      </nav>

      {showNameInput && (
        <div className="name-input-overlay">
          <div className="name-input-modal">
            <div className="name-input-content">
              <div className="name-input-header">
                <h2>Welcome to Attodo! 🎉</h2>
                <p>Please tell us your name to get started</p>
              </div>
              <div className="name-input-form">
                <input
                  type="text"
                  placeholder="Enter your name..."
                  className="name-input-field"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNameSubmit(e.target.value);
                    }
                  }}
                />
                <button
                  className="name-submit-btn"
                  onClick={() => handleNameSubmit(document.querySelector('.name-input-field').value)}
                >
                  Get Started →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        {currentView === 'dashboard' ? (
          <Dashboard onNavigate={navigateTo} userName={userName} />
        ) : currentView === 'attendance' ? (
          <Attendance onBack={() => navigateTo('dashboard')} />
        ) : currentView === 'tasks' ? (
          <Tasks onBack={() => navigateTo('dashboard')} taskType={taskType} />
        ) : currentView === 'study-hours' ? (
          <StudyHours onBack={() => navigateTo('dashboard')} />
        ) : null}
      </main>
    </div>
  )
}

export default App
