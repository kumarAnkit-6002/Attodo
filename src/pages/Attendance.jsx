import React, { useState, useEffect } from 'react';
import '../App.css';

const Attendance = ({ onBack }) => {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('attodo_subjects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('attodo_records');
    return saved ? JSON.parse(saved) : {};
  });

  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAttendanceOptions, setShowAttendanceOptions] = useState(false);

  useEffect(() => {
    localStorage.setItem('attodo_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('attodo_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const addSubject = () => {
    if (newSubjectName.trim()) {
      setSubjects([...subjects, { 
        id: Date.now(), 
        name: newSubjectName.trim()
      }]);
      setNewSubjectName('');
    }
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setSelectedSubject(null);
  };

  const calculatePercentage = (subjectId) => {
    const key = `subject_${subjectId}`;
    const records = attendanceRecords[key] || {};
    const present = Object.values(records).filter(v => v === 'present').length;
    const total = Object.keys(records).length;
    if (total === 0) return 0;
    return ((present / total) * 100).toFixed(1);
  };

  const getSubjectStats = (subjectId) => {
    const key = `subject_${subjectId}`;
    const records = attendanceRecords[key] || {};
    const present = Object.values(records).filter(v => v === 'present').length;
    const absent = Object.values(records).filter(v => v === 'absent').length;
    const cancelled = Object.values(records).filter(v => v === 'cancelled').length;
    const total = present + absent; // canceled classes do not count toward total

    return {
      totalClasses: total,
      presentClasses: present,
      absentClasses: absent,
      cancelledClasses: cancelled,
      percentage: total === 0 ? 0 : ((present / total) * 100).toFixed(1)
    };
  };

  const getMonthlyStats = (subjectId) => {
    const key = `subject_${subjectId}`;
    const records = attendanceRecords[key] || {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    let present = 0;
    let absent = 0;
    let cancelled = 0;
    
    Object.keys(records).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const status = records[dateStr];
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'cancelled') cancelled++;
      }
    });

    const total = present + absent; // canceled classes do not count toward total

    return {
      totalClasses: total,
      presentClasses: present,
      absentClasses: absent,
      cancelledClasses: cancelled,
      percentage: total === 0 ? 0 : ((present / total) * 100).toFixed(1)
    };
  };

  const markAttendance = (date, status) => {
    if (!selectedSubject) return;
    
    const key = `subject_${selectedSubject.id}`;
    const dateStr = date.toISOString().split('T')[0];
    
    setAttendanceRecords({
      ...attendanceRecords,
      [key]: {
        ...(attendanceRecords[key] || {}),
        [dateStr]: status
      }
    });
    
    setShowAttendanceOptions(false);
    setSelectedDate(null);
  };

  const getAttendanceStatus = (date) => {
    if (!selectedSubject) return null;
    const key = `subject_${selectedSubject.id}`;
    const dateStr = date.toISOString().split('T')[0];
    return attendanceRecords[key]?.[dateStr] || null;
  };

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

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    if (!selectedSubject) return null;

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

            const status = getAttendanceStatus(date);
            const isTodayDate = isToday(date);
            const isYesterdayDate = isYesterday(date);

            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${status ? `status-${status}` : ''} ${isTodayDate ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDate(date);
                  setShowAttendanceOptions(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
        <h2>Attendance Management</h2>
      </div>

      <div className="add-subject-form">
        <input 
          type="text" 
          placeholder="Enter subject name" 
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
        />
        <button onClick={addSubject}>Add Subject</button>
      </div>

      <div className="subjects-inline">
        {subjects.map(subject => (
          <div 
            key={subject.id}
            className={`subject-inline-block ${selectedSubject?.id === subject.id ? 'active' : ''}`}
            onClick={() => setSelectedSubject(subject)}
          >
            <div className="subject-inline-name">{subject.name}</div>
            <div className="subject-inline-percentage">{calculatePercentage(subject.id)}%</div>
            <button 
              className="subject-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeSubject(subject.id);
              }}
              title="Remove subject"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {selectedSubject && (
        <div className="calendar-section">
          <div className="subject-stats-container">
            <div className="stats-header">
              <h3>{selectedSubject.name}</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-label">Total Classes</div>
                <div className="stat-value">{getSubjectStats(selectedSubject.id).totalClasses}</div>
              </div>
              <div className="stat-card present">
                <div className="stat-label">Present</div>
                <div className="stat-value">{getSubjectStats(selectedSubject.id).presentClasses}</div>
              </div>
              <div className="stat-card absent">
                <div className="stat-label">Absent</div>
                <div className="stat-value">{getSubjectStats(selectedSubject.id).absentClasses}</div>
              </div>
              <div className="stat-card percentage">
                <div className="stat-label">Attendance %</div>
                <div className="stat-value">{getSubjectStats(selectedSubject.id).percentage}%</div>
              </div>
              <div className="stat-card cancelled">
                <div className="stat-label">Cancelled</div>
                <div className="stat-value">{getSubjectStats(selectedSubject.id).cancelledClasses}</div>
              </div>
            </div>
          </div>

          {renderCalendar()}

          <div className="monthly-stats-container">
            <h4>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Statistics
            </h4>
            <div className="monthly-stats-grid">
              <div className="monthly-stat-card">
                <div className="monthly-stat-label">Classes</div>
                <div className="monthly-stat-value">{getMonthlyStats(selectedSubject.id).totalClasses}</div>
              </div>
              <div className="monthly-stat-card">
                <div className="monthly-stat-label">Present</div>
                <div className="monthly-stat-value present-text">{getMonthlyStats(selectedSubject.id).presentClasses}</div>
              </div>
              <div className="monthly-stat-card">
                <div className="monthly-stat-label">Absent</div>
                <div className="monthly-stat-value absent-text">{getMonthlyStats(selectedSubject.id).absentClasses}</div>
              </div>
              <div className="monthly-stat-card">
                <div className="monthly-stat-label">Attendance</div>
                <div className="monthly-stat-value">{getMonthlyStats(selectedSubject.id).percentage}%</div>
              </div>
            </div>
          </div>

          {showAttendanceOptions && selectedDate && (
            <div className="attendance-modal">
              <div className="attendance-options">
                <h4>Mark attendance for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                <div className="option-buttons">
                  <button 
                    className="option-btn present"
                    onClick={() => markAttendance(selectedDate, 'present')}
                  >
                    Present
                  </button>
                  <button 
                    className="option-btn absent"
                    onClick={() => markAttendance(selectedDate, 'absent')}
                  >
                    Absent
                  </button>
                  <button 
                    className="option-btn cancelled"
                    onClick={() => markAttendance(selectedDate, 'cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
                <button 
                  className="close-modal"
                  onClick={() => setShowAttendanceOptions(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedSubject && subjects.length > 0 && (
        <div className="select-subject-message">
          Click on a subject to view and mark attendance
        </div>
      )}
    </div>
  );
};

export default Attendance;
