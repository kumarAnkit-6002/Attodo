// Utility functions to calculate real metrics from localStorage

export const calculateAttendancePercentage = () => {
  try {
    const subjects = JSON.parse(localStorage.getItem('attodo_subjects') || '[]');
    const records = JSON.parse(localStorage.getItem('attodo_records') || '{}');

    if (subjects.length === 0) return 0;

    let totalPresent = 0;
    let totalClasses = 0;

    subjects.forEach(subject => {
      const key = `subject_${subject.id}`;
      const subjectRecords = records[key] || {};
      
      const present = Object.values(subjectRecords).filter(v => v === 'present').length;
      const total = Object.keys(subjectRecords).length;

      totalPresent += present;
      totalClasses += total;
    });

    if (totalClasses === 0) return 0;
    return Math.round((totalPresent / totalClasses) * 100);
  } catch (error) {
    console.error('Error calculating attendance:', error);
    return 0;
  }
};

export const getTasks = () => {
  try {
    const tasks = JSON.parse(localStorage.getItem('attodo_tasks') || '{"pending":[],"completed":[]}');
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    return { pending: [], completed: [] };
  }
};

export const getPendingTasksCount = () => {
  const tasks = getTasks();
  return tasks.pending ? tasks.pending.length : 0;
};

export const getCompletedTasksCount = () => {
  const tasks = getTasks();
  return tasks.completed ? tasks.completed.length : 0;
};

export const getTodaysTasks = () => {
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];
  
  const pendingToday = (tasks.pending || []).filter(task => 
    task.deadline?.date === today
  );
  
  return pendingToday;
};

export const getAverageStudyHours = () => {
  try {
    const studyData = JSON.parse(localStorage.getItem('attodo_study_hours') || '{}');
    
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
  } catch (error) {
    console.error('Error calculating average study hours:', error);
    return { hours: 0, minutes: 0 };
  }
};

export const getTodayStudyHours = () => {
  try {
    const studyData = JSON.parse(localStorage.getItem('attodo_study_hours') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    const todayData = studyData[today];
    if (!todayData) return { hours: 0, minutes: 0 };
    
    return {
      hours: todayData.hours,
      minutes: todayData.minutes
    };
  } catch (error) {
    console.error('Error getting today study hours:', error);
    return { hours: 0, minutes: 0 };
  }
};
