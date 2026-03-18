import React, { useState, useEffect } from 'react';
import '../App.css';

const Tasks = ({ onBack, taskType = 'pending' }) => {
  const [allTasks, setAllTasks] = useState(() => {
    const saved = localStorage.getItem('attodo_tasks');
    return saved ? JSON.parse(saved) : { pending: [], completed: [] };
  });

  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDeadlineDate, setNewTaskDeadlineDate] = useState('');
  const [newTaskDeadlineTime, setNewTaskDeadlineTime] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const [editingTime, setEditingTime] = useState('');
  const [currentView, setCurrentView] = useState(taskType);

  useEffect(() => {
    localStorage.setItem('attodo_tasks', JSON.stringify(allTasks));
  }, [allTasks]);

  const addTask = () => {
    if (newTaskName.trim()) {
      const newTask = {
        id: Date.now(),
        name: newTaskName.trim(),
        deadline: newTaskDeadlineDate ? {
          date: newTaskDeadlineDate,
          time: newTaskDeadlineTime || ''
        } : null,
        completed: false
      };

      setAllTasks({
        ...allTasks,
        pending: [...allTasks.pending, newTask]
      });

      setNewTaskName('');
      setNewTaskDeadlineDate('');
      setNewTaskDeadlineTime('');
    }
  };

  const removeTask = (id, type) => {
    setAllTasks({
      ...allTasks,
      [type]: allTasks[type].filter(t => t.id !== id)
    });
  };

  const startEditing = (task, type) => {
    setEditingId(task.id);
    setEditingName(task.name);
    setEditingDate(task.deadline?.date || '');
    setEditingTime(task.deadline?.time || '');
  };

  const saveEdit = (id, type) => {
    setAllTasks({
      ...allTasks,
      [type]: allTasks[type].map(t =>
        t.id === id ? {
          ...t,
          name: editingName.trim(),
          deadline: editingDate ? { date: editingDate, time: editingTime || '' } : null
        } : t
      )
    });
    setEditingId(null);
  };

  const toggleTaskCompletion = (id) => {
    const pendingTask = allTasks.pending.find(t => t.id === id);
    
    if (pendingTask) {
      setAllTasks({
        ...allTasks,
        pending: allTasks.pending.filter(t => t.id !== id),
        completed: [...allTasks.completed, { ...pendingTask, completed: true }]
      });
    }
  };

  const markIncomplete = (id) => {
    const completedTask = allTasks.completed.find(t => t.id === id);
    
    if (completedTask) {
      setAllTasks({
        ...allTasks,
        completed: allTasks.completed.filter(t => t.id !== id),
        pending: [...allTasks.pending, { ...completedTask, completed: false }]
      });
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline.date);
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return deadline.time ? `${formatted} at ${deadline.time}` : formatted;
  };

  const tasks = currentView === 'pending' ? allTasks.pending : allTasks.completed;

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
        <h2>Task Management</h2>
      </div>

      <div className="task-tabs">
        <button 
          className={`tab-btn ${currentView === 'pending' ? 'active' : ''}`}
          onClick={() => setCurrentView('pending')}
        >
          📋 Pending Tasks ({allTasks.pending.length})
        </button>
        <button 
          className={`tab-btn ${currentView === 'completed' ? 'active' : ''}`}
          onClick={() => setCurrentView('completed')}
        >
          ✅ Completed Tasks ({allTasks.completed.length})
        </button>
      </div>

      {currentView === 'pending' && (
        <div className="add-task-form">
          <div className="task-input-group">
            <input 
              type="text" 
              placeholder="Enter task name" 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-input"
            />
            <div className="deadline-inputs">
              <input 
                type="date" 
                value={newTaskDeadlineDate}
                onChange={(e) => setNewTaskDeadlineDate(e.target.value)}
                className="task-date-input"
                title="Deadline date (optional)"
              />
              <input 
                type="time" 
                value={newTaskDeadlineTime}
                onChange={(e) => setNewTaskDeadlineTime(e.target.value)}
                className="task-time-input"
                disabled={!newTaskDeadlineDate}
                title="Deadline time (optional)"
              />
            </div>
            <button onClick={addTask} className="add-task-btn">Add Task</button>
          </div>
        </div>
      )}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <p>{currentView === 'pending' ? 'No pending tasks. Add one to get started!' : 'No completed tasks yet.'}</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-item ${currentView}`}>
              <div className="task-checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => {
                    if (currentView === 'pending') {
                      toggleTaskCompletion(task.id);
                    } else {
                      markIncomplete(task.id);
                    }
                  }}
                  className="task-checkbox"
                />
              </div>

              <div className="task-content">
                {editingId === task.id ? (
                  <div className="task-edit-form">
                    <input 
                      type="text" 
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="task-edit-input"
                    />
                    <div className="deadline-inputs">
                      <input 
                        type="date" 
                        value={editingDate}
                        onChange={(e) => setEditingDate(e.target.value)}
                        className="task-date-input"
                      />
                      <input 
                        type="time" 
                        value={editingTime}
                        onChange={(e) => setEditingTime(e.target.value)}
                        className="task-time-input"
                        disabled={!editingDate}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-name">{task.name}</div>
                    <div className="task-deadline">{formatDeadline(task.deadline)}</div>
                  </>
                )}
              </div>

              <div className="task-actions">
                {editingId === task.id ? (
                  <>
                    <button 
                      className="save-btn"
                      onClick={() => saveEdit(task.id, currentView)}
                    >
                      Save
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="edit-btn"
                      onClick={() => startEditing(task, currentView)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => removeTask(task.id, currentView)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
