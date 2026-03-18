import React, { useState, useEffect } from 'react';
import '../App.css';

const StudyHours = ({ onBack }) => {
  const [studyData, setStudyData] = useState(() => {
    const saved = localStorage.getItem('attodo_study_hours');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [inputHours, setInputHours] = useState('');
  const [inputMinutes, setInputMinutes] = useState('');
  const [graphView, setGraphView] = useState('week'); // 'week', 'month', 'all'

  useEffect(() => {
    localStorage.setItem('attodo_study_hours', JSON.stringify(studyData));
  }, [studyData]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getStudyHours = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return studyData[dateStr] || null;
  };

  const saveStudyHours = () => {
    if (selectedDate && (inputHours || inputMinutes)) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hours = parseInt(inputHours) || 0;
      const minutes = parseInt(inputMinutes) || 0;

      setStudyData({
        ...studyData,
        [dateStr]: { hours, minutes }
      });

      setInputHours('');
      setInputMinutes('');
      setShowTimeInput(false);
      setSelectedDate(null);
    }
  };

  const deleteStudyHours = (dateStr) => {
    const newData = { ...studyData };
    delete newData[dateStr];
    setStudyData(newData);
  };

  const getAverageHours = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    let totalMinutes = 0;
    let count = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      if (studyData[dateStr]) {
        totalMinutes += studyData[dateStr].hours * 60 + studyData[dateStr].minutes;
        count++;
      }
    }

    if (count === 0) return { hours: 0, minutes: 0 };

    const avgMinutes = Math.round(totalMinutes / count);
    return {
      hours: Math.floor(avgMinutes / 60),
      minutes: avgMinutes % 60
    };
  };

  const getWeekData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      data.push({
        date: dateStr,
        dayName: dayName,
        totalMinutes: (studyData[dateStr]?.hours || 0) * 60 + (studyData[dateStr]?.minutes || 0)
      });
    }
    return data;
  };

  const getLast30DaysData = () => {
    const today = new Date();
    const data = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: dateStr,
        dayName: dayName,
        totalMinutes: (studyData[dateStr]?.hours || 0) * 60 + (studyData[dateStr]?.minutes || 0)
      });
    }
    return data;
  };

  const getAllData = () => {
    const sortedDates = Object.keys(studyData)
      .sort()
      .slice(-30); // Show last 30 recorded dates

    return sortedDates.map(dateStr => ({
      date: dateStr,
      dayName: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalMinutes: (studyData[dateStr]?.hours || 0) * 60 + (studyData[dateStr]?.minutes || 0)
    }));
  };

  const getGraphData = () => {
    if (graphView === 'week') {
      return getWeekData();
    } else if (graphView === 'month') {
      return getLast30DaysData();
    } else {
      return getAllData();
    }
  };

  const getSortedDates = () => {
    return Object.entries(studyData)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([dateStr, data]) => ({
        dateStr,
        date: new Date(dateStr),
        ...data
      }));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={previousMonth}>←</button>
          <h3>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={nextMonth}>→</button>
        </div>

        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty_${index}`} className="calendar-day empty"></div>;
            }

            const isTodayDate = isToday(date);
            const hasData = getStudyHours(date);

            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${hasData ? 'has-data' : ''} ${isTodayDate ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDate(date);
                  setShowTimeInput(true);
                  const existing = getStudyHours(date);
                  if (existing) {
                    setInputHours(existing.hours.toString());
                    setInputMinutes(existing.minutes.toString());
                  }
                }}
              >
                {date.getDate()}
                {hasData && <span className="data-indicator">●</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const avgHours = getAverageHours();

  return (
    <div className="study-hours-container">
      <div className="study-hours-header">
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
        <h2>Study Hours Tracker</h2>
      </div>

      <div className="average-stats">
        <h3>Weekly Average</h3>
        <div className="average-value">
          <span className="hours">{avgHours.hours}h</span>
          <span className="minutes">{avgHours.minutes}m</span>
        </div>
      </div>

      {renderCalendar()}

      {showTimeInput && selectedDate && (
        <div className="time-input-modal">
          <div className="time-input-box">
            <h4>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
            <div className="time-inputs">
              <div className="time-field">
                <label>Hours</label>
                <input 
                  type="number" 
                  min="0" 
                  max="24"
                  value={inputHours}
                  onChange={(e) => setInputHours(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="time-field">
                <label>Minutes</label>
                <input 
                  type="number" 
                  min="0" 
                  max="59"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="time-actions">
              <button className="save-btn" onClick={saveStudyHours}>Save</button>
              <button className="cancel-btn" onClick={() => {
                setShowTimeInput(false);
                setSelectedDate(null);
                setInputHours('');
                setInputMinutes('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="date-wise-section">
        <h3>Date-wise Study Hours</h3>
        {getSortedDates().length === 0 ? (
          <div className="no-data">No study hours recorded yet.</div>
        ) : (
          <div className="date-list">
            {getSortedDates().map(({ dateStr, hours, minutes }) => (
              <div key={dateStr} className="date-item">
                <div className="date-info">
                  <span className="date-label">{new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="date-time">{hours}h {minutes}m</span>
                </div>
                <button 
                  className="delete-date-btn"
                  onClick={() => deleteStudyHours(dateStr)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="weekly-graph-section">
        <h3>Study Hours Graph</h3>
        
        <div className="graph-view-tabs">
          <button 
            className={`graph-tab ${graphView === 'week' ? 'active' : ''}`}
            onClick={() => setGraphView('week')}
          >
            This Week
          </button>
          <button 
            className={`graph-tab ${graphView === 'month' ? 'active' : ''}`}
            onClick={() => setGraphView('month')}
          >
            Last 30 Days
          </button>
          <button 
            className={`graph-tab ${graphView === 'all' ? 'active' : ''}`}
            onClick={() => setGraphView('all')}
          >
            All Records
          </button>
        </div>

        <div className="weekly-chart">
          {getGraphData().map(({ dayName, totalMinutes }) => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const maxMinutes = Math.max(...getGraphData().map(d => d.totalMinutes), 1);
            const heightPercent = maxMinutes > 0 ? (totalMinutes / maxMinutes) * 100 : 0;

            return (
              <div key={dayName} className="chart-bar-container">
                <div className="chart-value">{hours}h {minutes}m</div>
                <div className="chart-bar" style={{ height: `${heightPercent}%` }}></div>
                <div className="chart-day">{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyHours;
