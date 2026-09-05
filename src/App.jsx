import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, BookOpen, Clock, Settings, CheckCircle, XCircle, ChevronLeft, ChevronRight, Edit3, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

// Theme Palette
const THEME = {
  deepPine: '#0F2E23',
  oliveMoss: '#798F53',
  warmIvory: '#F4F1DE',
  dustyRose: '#C88582',
  deepTeal: '#1B5B65'
};

const DEFAULT_HOLIDAYS = [
  '2026-01-15', '2026-01-26', '2026-02-15', '2026-03-02', 
  '2026-03-19', '2026-03-21', '2026-03-27', '2026-04-03',
  '2026-04-14', '2026-05-01', '2026-05-28', '2026-08-15',
  '2026-08-21', '2026-08-26', '2026-09-04', '2026-09-14',
  '2026-10-02', '2026-10-10', '2026-10-20', '2026-10-21',
  '2026-11-01', '2026-11-08', '2026-11-10', '2026-12-25'
];

const DEFAULT_SLOTS = [
    { id: 0, label: '9:05-9:55', type: 'class' },
    { id: 1, label: '9:55-10:45', type: 'class' },
    { id: 2, label: '10:45-11:15', type: 'break' },
    { id: 3, label: '11:15-12:05', type: 'class' },
    { id: 4, label: '12:05-12:55', type: 'class' },
    { id: 5, label: '12:55-1:45', type: 'class' },
    { id: 6, label: '1:45-2:30', type: 'break' },
    { id: 7, label: '2:30-3:20', type: 'class' },
    { id: 8, label: '3:20-4:10', type: 'class' },
    { id: 9, label: '4:10-5:00', type: 'class' }
];

const DEFAULT_SCHEDULE = {
    Monday: [
      { start: 0, span: 2, subject: 'Software development lab[A103A]', type: 'lab' },
      { start: 3, span: 1, subject: 'Discrete maths', type: 'theory' },
      { start: 4, span: 2, subject: 'Software development', type: 'theory' },
      { start: 7, span: 1, subject: 'Probablity and statistics', type: 'theory' }
    ],
    Tuesday: [
      { start: 0, span: 2, subject: 'DSA', type: 'theory' },
      { start: 3, span: 2, subject: 'Constitution', type: 'theory' },
      { start: 5, span: 1, subject: 'Discrete maths', type: 'theory' },
      { start: 7, span: 2, subject: 'DSA lab[A103G]', type: 'lab' }
    ],
    Wednesday: [
      { start: 0, span: 2, subject: 'Logic design lab[A103A]', type: 'lab' },
      { start: 3, span: 2, subject: 'Programming paradigms', type: 'theory' },
      { start: 5, span: 1, subject: 'Probablity and statistics', type: 'theory' }
    ],
    Thursday: [
      { start: 0, span: 2, subject: 'Probablity and statistics', type: 'theory' },
      { start: 3, span: 2, subject: 'Logic design', type: 'theory' },
      { start: 5, span: 1, subject: 'DSA', type: 'theory' },
      { start: 7, span: 2, subject: 'Programming paradigms lab[A103C]', type: 'lab' }
    ],
    Friday: [
      { start: 0, span: 2, subject: 'Discrete maths', type: 'theory' },
      { start: 3, span: 1, subject: 'Programming paradigms', type: 'theory' }
    ]
};

const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const parseSubjectDetails = (rawName) => {
  let name = rawName;
  let room = null;
  const roomMatch = name.match(/\[(.*?)\]/);
  if (roomMatch) {
      room = roomMatch[1];
      name = name.replace(/\[.*?\]/, '').trim();
  }
  const isLab = name.toLowerCase().includes('lab');
  return { name, room, isLab };
};

const getSubjectColor = (subjectName) => {
    const colors = [THEME.deepPine, THEME.oliveMoss, THEME.dustyRose, THEME.deepTeal];
    const name = parseSubjectDetails(subjectName).name;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitialState = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

export default function App() {
  const [startDate, setStartDate] = useState(() => getInitialState('app_startDate', '2026-09-02'));
  const [endDate, setEndDate] = useState(() => getInitialState('app_endDate', '2026-12-11'));
  
  const [holidays, setHolidays] = useState(() => getInitialState('app_holidays', DEFAULT_HOLIDAYS));
  const [slots, setSlots] = useState(() => getInitialState('app_slots', DEFAULT_SLOTS));
  
  const [timetableData, setTimetableData] = useState(() => getInitialState('app_timetableData', DEFAULT_SCHEDULE));
  const [attendanceRecords, setAttendanceRecords] = useState(() => getInitialState('app_attendanceRecords', {}));
  
  const [settings, setSettings] = useState(() => getInitialState('app_settings', {
      dangerThreshold: 80,
      warningThreshold: 90,
      dangerColor: THEME.dustyRose, 
      warningColor: THEME.oliveMoss,
      safeColor: THEME.deepTeal 
  }));

  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHolidayInput, setNewHolidayInput] = useState('');

  useEffect(() => localStorage.setItem('app_startDate', JSON.stringify(startDate)), [startDate]);
  useEffect(() => localStorage.setItem('app_endDate', JSON.stringify(endDate)), [endDate]);
  useEffect(() => localStorage.setItem('app_holidays', JSON.stringify(holidays)), [holidays]);
  useEffect(() => localStorage.setItem('app_slots', JSON.stringify(slots)), [slots]);
  useEffect(() => localStorage.setItem('app_timetableData', JSON.stringify(timetableData)), [timetableData]);
  useEffect(() => localStorage.setItem('app_attendanceRecords', JSON.stringify(attendanceRecords)), [attendanceRecords]);
  useEffect(() => localStorage.setItem('app_settings', JSON.stringify(settings)), [settings]);

  const activeDays = useMemo(() => {
    const days = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayName = getDayName(dateStr);
      
      if (timetableData[dayName]) {
        days.push({
          date: dateStr,
          dayName,
          isHoliday: holidays.includes(dateStr),
          classes: timetableData[dayName]
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate, holidays, timetableData]);

  const subjects = useMemo(() => {
    const subs = new Set();
    Object.values(timetableData).forEach(day => {
      day.forEach(cls => subs.add(cls.subject));
    });
    return Array.from(subs);
  }, [timetableData]);

  const attendanceStats = useMemo(() => {
    const stats = {};
    subjects.forEach(sub => {
      stats[sub] = { attended: 0, absent: 0, cancelled: 0, conducted: 0, left: 0, total: 0 };
    });

    const today = new Date().toISOString().split('T')[0];

    activeDays.forEach(dayInfo => {
      if (dayInfo.isHoliday) return;

      dayInfo.classes.forEach(cls => {
        if(!stats[cls.subject]) return;
        stats[cls.subject].total += cls.span;
        const isPastOrToday = dayInfo.date <= today;
        const record = attendanceRecords[dayInfo.date]?.[cls.subject];
        const status = record?.status || 'unrecorded';

        if (status === 'cancelled') {
            stats[cls.subject].cancelled += cls.span;
        } else if (status === 'absent') {
            stats[cls.subject].absent += cls.span;
            if (isPastOrToday) {
                stats[cls.subject].conducted += cls.span;
            }
        } else {
            if (isPastOrToday) {
               stats[cls.subject].attended += cls.span;
               stats[cls.subject].conducted += cls.span;
            } else {
               stats[cls.subject].left += cls.span;
            }
        }
      });
    });

    Object.keys(stats).forEach(sub => {
      const s = stats[sub];
      const validTotal = s.total - s.cancelled;
      const projectedTotalAttended = s.attended + s.left; 
      
      s.percentage = validTotal > 0 ? ((projectedTotalAttended / validTotal) * 100).toFixed(1) : 100;
    });

    return stats;
  }, [activeDays, attendanceRecords, subjects]);

  const handleAttendanceChange = (date, subject, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [subject]: { status }
      }
    }));
  };

  const changeDateBy = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    if (newDate >= startDate && newDate <= endDate) {
        setSelectedDate(newDate);
    }
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    setTimetableData(prev => {
        const newData = { ...prev };
        if (!newData[editingClass.day]) newData[editingClass.day] = [];
        
        const newClass = {
            start: parseInt(editingClass.start),
            span: parseInt(editingClass.span),
            subject: editingClass.subject,
            type: editingClass.subject.toLowerCase().includes('lab') ? 'lab' : 'theory'
        };

        if (editingClass.originalIndex !== undefined) {
            newData[editingClass.day][editingClass.originalIndex] = newClass;
        } else {
            newData[editingClass.day].push(newClass);
        }
        newData[editingClass.day].sort((a,b) => a.start - b.start);
        return newData;
    });
    setEditingClass(null);
  };

  const handleDeleteClass = () => {
      setTimetableData(prev => {
          const newData = { ...prev };
          newData[editingClass.day].splice(editingClass.originalIndex, 1);
          return newData;
      });
      setEditingClass(null);
  };

  const renderDashboard = () => (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {subjects.map(subject => {
          const stat = attendanceStats[subject];
          if (!stat) return null;
          const pct = parseFloat(stat.percentage);
          const color = pct < settings.dangerThreshold ? settings.dangerColor : 
                        pct < settings.warningThreshold ? settings.warningColor : settings.safeColor;
          
          const { name, isLab } = parseSubjectDetails(subject);

          return (
            <div key={subject} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-[#0F2E23] leading-tight capitalize text-base md:text-lg">{name}</h3>
                  {isLab && <span className="bg-[#1B5B65]/10 text-[#1B5B65] text-[10px] font-bold px-2 py-0.5 rounded ml-2 uppercase">LAB</span>}
                </div>
                <div className="flex items-end gap-2 mt-4">
                    <span className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color }}>{pct}%</span>
                    <span className="text-xs text-[#798F53] font-bold pb-1 md:pb-1.5 uppercase tracking-wider">Projected</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-black/5 flex gap-4 text-xs justify-between">
                <div className="flex flex-col"><span className="text-black/40 font-bold uppercase text-[9px] md:text-[10px] tracking-wider mb-1">Attended</span><span className="font-black text-[#0F2E23] text-xs md:text-sm">{stat.attended}</span></div>
                <div className="flex flex-col"><span className="text-black/40 font-bold uppercase text-[9px] md:text-[10px] tracking-wider mb-1">Missed</span><span className="font-black text-[#0F2E23] text-xs md:text-sm">{stat.absent}</span></div>
                <div className="flex flex-col"><span className="text-black/40 font-bold uppercase text-[9px] md:text-[10px] tracking-wider mb-1">Left</span><span className="font-black text-[#0F2E23] text-xs md:text-sm">{stat.left}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-black/5 mt-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 w-full">
          <h2 className="text-lg md:text-xl font-black text-[#0F2E23] flex items-center gap-2">
             <CalendarIcon className="text-[#798F53]" size={24} />
             Daily Tracker
          </h2>
          <div className="flex items-center bg-[#F4F1DE] rounded-xl p-1.5 border border-[#1B5B65]/10 shadow-inner w-full md:w-auto justify-between">
             <button onClick={() => changeDateBy(-1)} className="p-2 md:p-3 hover:bg-white rounded-lg text-[#0F2E23] shadow-sm transition-colors"><ChevronLeft size={20}/></button>
             <input 
               type="date" 
               value={selectedDate}
               min={startDate}
               max={endDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="bg-transparent border-none outline-none text-sm md:text-base font-black text-[#0F2E23] px-2 md:px-4 cursor-pointer text-center w-full md:w-auto"
             />
             <button onClick={() => changeDateBy(1)} className="p-2 md:p-3 hover:bg-white rounded-lg text-[#0F2E23] shadow-sm transition-colors"><ChevronRight size={20}/></button>
          </div>
        </div>

        {(() => {
          const dayInfo = activeDays.find(d => d.date === selectedDate);
          if (!dayInfo) return <div className="text-center p-8 md:p-12 text-[#798F53] font-bold bg-[#F4F1DE] rounded-xl">No classes scheduled on this date.</div>;
          
          if (dayInfo.isHoliday) return (
            <div className="text-center p-8 md:p-12 bg-[#C88582]/10 text-[#C88582] rounded-xl border border-[#C88582]/20 flex flex-col items-center justify-center gap-3">
                <span className="text-3xl md:text-4xl animate-bounce">🌸</span>
                <span className="font-black text-base md:text-lg tracking-wide uppercase text-center">This day is marked as a holiday.</span>
            </div>
          );

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {dayInfo.classes.map((cls, idx) => {
                  const record = attendanceRecords[selectedDate]?.[cls.subject];
                  const isPastOrToday = selectedDate <= new Date().toISOString().split('T')[0];
                  const currentStatus = record?.status || 'unrecorded';
                  
                  const startSlot = slots.find(s => s.id === cls.start);
                  const endSlot = slots.find(s => s.id === (cls.start + cls.span - 1));
                  const startTime = startSlot ? startSlot.label.split('-')[0] : 'Unknown';
                  const endTime = endSlot ? endSlot.label.split('-')[1] : 'Unknown';
                  const { name, room, isLab } = parseSubjectDetails(cls.subject);
                  
                  const subColor = getSubjectColor(cls.subject);

                  return (
                    <div key={idx} className="p-4 md:p-5 bg-white rounded-2xl border border-black/5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 overflow-hidden relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: subColor }}></div>
                      <div className="pl-3 md:pl-4">
                        <div className="text-[9px] md:text-[10px] font-black text-[#798F53] uppercase tracking-widest mb-1.5">{startTime} - {endTime} • {cls.span} Sessions</div>
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="font-black text-[#0F2E23] text-base md:text-lg capitalize">{name}</div>
                           {isLab && <span className="text-[8px] md:text-[9px] uppercase font-bold text-[#1B5B65] bg-[#1B5B65]/10 px-2 py-0.5 rounded-full tracking-widest">LAB</span>}
                           {room && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold bg-[#F4F1DE] text-[#0F2E23]">{room}</span>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 self-start sm:self-auto pl-3 sm:pl-0 relative z-10 w-full sm:w-auto justify-start sm:justify-end">
                        {isPastOrToday ? (
                          <button 
                            onClick={() => handleAttendanceChange(selectedDate, cls.subject, 'present')}
                            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentStatus === 'present' || currentStatus === 'unrecorded' ? 'bg-[#798F53] text-white shadow-md shadow-[#798F53]/30 scale-105' : 'bg-[#F4F1DE] text-[#0F2E23] hover:bg-[#E8E4C9]'}`}>
                            Present
                          </button>
                        ) : (
                          currentStatus !== 'unrecorded' ? (
                            <button 
                              onClick={() => handleAttendanceChange(selectedDate, cls.subject, 'unrecorded')}
                              className="flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-xl text-xs font-bold transition-all bg-black/10 text-[#0F2E23] hover:bg-black/20">
                              Clear
                            </button>
                          ) : (
                            <button 
                              disabled
                              className="flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-xl text-xs font-bold bg-[#798F53]/20 text-[#798F53] cursor-not-allowed border border-[#798F53]/30"
                              title="Future classes are assumed present by default">
                              Present
                            </button>
                          )
                        )}

                        <button 
                          onClick={() => handleAttendanceChange(selectedDate, cls.subject, 'absent')}
                          className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentStatus === 'absent' ? 'bg-[#C88582] text-white shadow-md shadow-[#C88582]/30 scale-105' : 'bg-[#F4F1DE] text-[#0F2E23] hover:bg-[#E8E4C9]'}`}>
                          Absent
                        </button>
                        
                        <button 
                          onClick={() => handleAttendanceChange(selectedDate, cls.subject, 'cancelled')}
                          className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentStatus === 'cancelled' ? 'bg-[#1B5B65] text-white shadow-md shadow-[#1B5B65]/30 scale-105' : 'bg-[#F4F1DE] text-[#0F2E23] hover:bg-[#E8E4C9]'}`}>
                          Cancelled
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })()}
      </div>
    </div>
  );

  const renderTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const skipMap = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
    const rowBaseHeight = 6; 

    return (
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-black/5 relative min-h-[600px] w-full max-w-[1400px] mx-auto overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 className="text-2xl font-black text-[#0F2E23] tracking-tight">Class Schedule</h3>
                <p className="text-xs font-bold text-[#798F53] uppercase tracking-widest mt-1">Weekly Overview</p>
            </div>
            <button 
                onClick={() => setIsEditingTimetable(!isEditingTimetable)}
                className={`text-sm px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center ${isEditingTimetable ? 'bg-[#1B5B65] text-white shadow-md shadow-[#1B5B65]/30' : 'bg-[#F4F1DE] text-[#0F2E23] hover:bg-[#E8E4C9]'}`}
            >
                {isEditingTimetable ? <><CheckCircle size={18}/> Done Editing</> : <><Edit3 size={18}/> Edit Classes</>}
            </button>
        </div>
        
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full min-w-[800px] text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-4 w-24 border-b-2 border-[#0F2E23]/10 sticky left-0 bg-white z-20"></th>
                  {days.map(day => (
                    <th key={day} className="p-4 text-[#0F2E23] font-black border-b-2 border-[#0F2E23]/10 uppercase tracking-widest text-xs w-[16%]">
                       {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, rowIndex) => {
                  return (
                    <tr key={slot.id} className="group">
                      <td className="p-2 text-[10px] md:text-[11px] font-black text-[#798F53] border-b border-[#0F2E23]/5 align-top pt-4 tracking-widest relative sticky left-0 bg-white z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">{slot.label.split('-')[0]}</span>
                      </td>

                      {days.map((day, dayIndex) => {
                          if (skipMap[day] > 0) {
                              skipMap[day] -= 1;
                              return null; 
                          }

                          const classInSlot = (timetableData[day] || []).find(c => c.start === slot.id);

                          if (classInSlot) {
                              if (classInSlot.span > 1) {
                                  skipMap[day] = classInSlot.span - 1;
                              }
                              
                              const { name, room, isLab } = parseSubjectDetails(classInSlot.subject);
                              const bgColor = getSubjectColor(classInSlot.subject);
                              const cardHeight = `${classInSlot.span * rowBaseHeight}rem`;
                              
                              return (
                                  <td key={day} rowSpan={classInSlot.span} className="p-1.5 align-top border-b border-[#0F2E23]/5 relative z-10">
                                      <div 
                                        onClick={() => isEditingTimetable && setEditingClass({ ...classInSlot, day, originalIndex: (timetableData[day] || []).indexOf(classInSlot) })}
                                        className={`w-full rounded-2xl shadow-lg flex flex-col items-center justify-center p-2 md:p-3 text-white transition-all ${isEditingTimetable ? 'cursor-pointer hover:scale-[1.02] ring-4 ring-[#1B5B65]/30 ring-offset-2' : ''}`}
                                        style={{ backgroundColor: bgColor, minHeight: cardHeight }}
                                      >
                                          <span className="font-black text-[10px] md:text-[11px] uppercase tracking-wide leading-tight mb-1.5 px-1">{name}</span>
                                          {room && <span className="bg-white/20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black tracking-widest">{room}</span>}
                                      </div>
                                  </td>
                              );
                          }

                          if (slot.type === 'break') {
                              return (
                                  <td key={day} className="p-1.5 align-top border-b border-[#0F2E23]/5">
                                      <div className={`w-full rounded-2xl bg-[#F4F1DE] border-2 border-[#E8E4C9] flex items-center justify-center p-2 opacity-70`} style={{ minHeight: `${rowBaseHeight}rem`}}>
                                          <span className="text-[#C88582] font-black text-[9px] md:text-[10px] uppercase tracking-widest">Break</span>
                                      </div>
                                  </td>
                              );
                          }

                          return (
                              <td key={day} className="p-1.5 align-middle border-b border-[#0F2E23]/5 relative">
                                  <div 
                                    onClick={() => isEditingTimetable && setEditingClass({ day, start: slot.id, span: 1, subject: '' })}
                                    className={`w-full rounded-2xl transition-colors flex items-center justify-center ${isEditingTimetable ? 'cursor-pointer hover:bg-[#F4F1DE]/50 border-2 border-dashed border-[#798F53]/30' : ''}`}
                                    style={{ minHeight: `${rowBaseHeight}rem`}}
                                  >
                                      {isEditingTimetable && <CheckCircle size={20} className="text-[#798F53] opacity-0 hover:opacity-100"/>}
                                  </div>
                              </td>
                          );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-[1400px] mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-black/5 space-y-10 w-full">
      <div>
        <h3 className="text-xl font-black text-[#0F2E23] mb-5 border-b border-black/5 pb-3">Academic Term</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#798F53] uppercase tracking-widest mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3.5 text-sm font-bold bg-[#F4F1DE] text-[#0F2E23] border-none rounded-xl focus:ring-4 focus:ring-[#1B5B65]/20 outline-none"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#798F53] uppercase tracking-widest mb-2">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3.5 text-sm font-bold bg-[#F4F1DE] text-[#0F2E23] border-none rounded-xl focus:ring-4 focus:ring-[#1B5B65]/20 outline-none"/>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-black text-[#0F2E23]">Class Timings</h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        const newId = slots.length > 0 ? Math.max(...slots.map(s => s.id)) + 1 : 0;
                        setSlots([{ id: newId, label: 'New Slot', type: 'class' }, ...slots]);
                    }}
                    className="px-4 py-2 bg-[#F4F1DE] text-[#0F2E23] rounded-lg font-bold text-xs shadow-sm hover:bg-[#E8E4C9] transition-colors"
                >
                    + Add Top
                </button>
                <button 
                    onClick={() => {
                        const newId = slots.length > 0 ? Math.max(...slots.map(s => s.id)) + 1 : 0;
                        setSlots([...slots, { id: newId, label: 'New Slot', type: 'class' }]);
                    }}
                    className="px-4 py-2 bg-[#F4F1DE] text-[#0F2E23] rounded-lg font-bold text-xs shadow-sm hover:bg-[#E8E4C9] transition-colors"
                >
                    + Add Bottom
                </button>
            </div>
        </div>
        <p className="text-xs font-medium text-black/40 mb-6">Adjust the vertical slots to match your institution's schedule. Use the arrows to reorder.</p>
        <div className="space-y-3">
            {slots.map((slot, index) => (
                <div key={slot.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center bg-[#F4F1DE]/50 p-3 sm:p-2 rounded-xl">
                    <span className="text-xs font-black text-[#1B5B65] uppercase tracking-widest w-16 shrink-0 text-left sm:text-center">Slot {index + 1}</span>
                    <input 
                        type="text" 
                        value={slot.label}
                        onChange={(e) => {
                            const newSlots = [...slots];
                            const idx = newSlots.findIndex(s => s.id === slot.id);
                            newSlots[idx].label = e.target.value;
                            setSlots(newSlots);
                        }}
                        className="w-full p-2.5 text-sm font-bold border-none rounded-lg focus:ring-4 focus:ring-[#1B5B65]/20 outline-none shadow-sm text-[#0F2E23]"
                    />
                    <select
                        value={slot.type}
                        onChange={(e) => {
                            const newSlots = [...slots];
                            const idx = newSlots.findIndex(s => s.id === slot.id);
                            newSlots[idx].type = e.target.value;
                            setSlots(newSlots);
                        }}
                        className="w-full sm:w-auto p-2.5 text-sm font-bold border-none rounded-lg focus:ring-4 focus:ring-[#1B5B65]/20 outline-none bg-white shadow-sm text-[#0F2E23]"
                    >
                        <option value="class">Class</option>
                        <option value="break">Break</option>
                    </select>
                    
                    {/* Ordering and Delete Controls */}
                    <div className="flex items-center gap-1 w-full sm:w-auto justify-end sm:ml-auto">
                        <button 
                            onClick={() => {
                                if (index === 0) return;
                                const newSlots = [...slots];
                                const temp = newSlots[index - 1];
                                newSlots[index - 1] = newSlots[index];
                                newSlots[index] = temp;
                                setSlots(newSlots);
                            }}
                            className={`p-2 transition-colors ${index === 0 ? 'text-black/10 cursor-not-allowed' : 'text-[#798F53] hover:text-[#0F2E23]'}`}
                            disabled={index === 0}
                            title="Move Slot Up"
                        >
                            <ChevronUp size={18}/>
                        </button>
                        <button 
                            onClick={() => {
                                if (index === slots.length - 1) return;
                                const newSlots = [...slots];
                                const temp = newSlots[index + 1];
                                newSlots[index + 1] = newSlots[index];
                                newSlots[index] = temp;
                                setSlots(newSlots);
                            }}
                            className={`p-2 transition-colors ${index === slots.length - 1 ? 'text-black/10 cursor-not-allowed' : 'text-[#798F53] hover:text-[#0F2E23]'}`}
                            disabled={index === slots.length - 1}
                            title="Move Slot Down"
                        >
                            <ChevronDown size={18}/>
                        </button>
                        <button 
                            onClick={() => setSlots(slots.filter(s => s.id !== slot.id))}
                            className="p-2 text-black/30 hover:text-[#C88582] transition-colors ml-2"
                            title="Delete Slot"
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black text-[#0F2E23] mb-2">Manage Holidays</h3>
        <p className="text-xs font-medium text-black/40 mb-6">Add or remove days to automatically skip them in the tracker.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input 
                type="date" 
                value={newHolidayInput}
                onChange={(e) => setNewHolidayInput(e.target.value)}
                className="flex-1 p-3 text-sm font-bold border-none bg-[#F4F1DE] rounded-xl focus:ring-4 focus:ring-[#1B5B65]/20 outline-none text-[#0F2E23] w-full"
            />
            <button 
                onClick={() => {
                    if(newHolidayInput && !holidays.includes(newHolidayInput)) {
                        setHolidays([...holidays, newHolidayInput].sort());
                    }
                    setNewHolidayInput('');
                }}
                className="px-6 py-3 bg-[#1B5B65] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#0F2E23] transition-colors w-full sm:w-auto"
            >
                Add Holiday
            </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-5 border border-black/5 rounded-2xl bg-[#F4F1DE]/30 shadow-inner">
            {holidays.map(h => (
                <span key={h} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0F2E23] border border-[#0F2E23]/10 rounded-full text-xs font-black shadow-sm">
                    {h} 
                    <button onClick={() => setHolidays(holidays.filter(d => d !== h))} className="hover:text-[#C88582] text-black/30 ml-1 transition-colors">
                        <XCircle size={16}/>
                    </button>
                </span>
            ))}
            {holidays.length === 0 && <span className="text-sm font-bold text-black/30">No holidays scheduled. 🌸</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F1DE] text-[#0F2E23] font-sans p-2 sm:p-4 md:p-8 w-full max-w-full overflow-x-hidden">
      <div className="w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#0F2E23] flex items-center gap-1 md:gap-3">
              Attendance Tracker<img src="/swan.jpeg" alt="swan logo" className="mix-blend-multiply w-24 h-24" />
            </h1>
            <p className="text-xs md:text-sm text-[#798F53] font-bold mt-2 uppercase tracking-widest">Manage your schedule beautifully.</p>
          </div>
          
          <div className="flex bg-white p-1 md:p-1.5 rounded-2xl shadow-sm border border-black/5 w-full md:w-auto overflow-x-auto custom-scrollbar">
            <button onClick={() => setActiveTab('dashboard')} className={`flex-1 min-w-[120px] md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-black rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#0F2E23] text-white shadow-md' : 'text-[#798F53] hover:text-[#0F2E23] hover:bg-[#F4F1DE]'}`}>
              <BookOpen size={18} /> Dashboard
            </button>
            <button onClick={() => setActiveTab('timetable')} className={`flex-1 min-w-[120px] md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-black rounded-xl transition-all ${activeTab === 'timetable' ? 'bg-[#0F2E23] text-white shadow-md' : 'text-[#798F53] hover:text-[#0F2E23] hover:bg-[#F4F1DE]'}`}>
              <Clock size={18} /> Timetable
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[120px] md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-black rounded-xl transition-all ${activeTab === 'settings' ? 'bg-[#0F2E23] text-white shadow-md' : 'text-[#798F53] hover:text-[#0F2E23] hover:bg-[#F4F1DE]'}`}>
              <Settings size={18} /> Settings
            </button>
          </div>
        </header>

        <main className="w-full">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'timetable' && renderTimetable()}
          {activeTab === 'settings' && renderSettings()}
        </main>

        {editingClass && (
            <div className="fixed inset-0 bg-[#0F2E23]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
                    <div className="px-6 md:px-8 py-5 md:py-6 border-b border-black/5 flex justify-between items-center bg-[#F4F1DE]/50">
                        <h3 className="font-black text-[#0F2E23] text-base md:text-lg">{editingClass.originalIndex !== undefined ? 'Edit Class' : 'Add Class'} <span className="text-[#798F53] text-xs md:text-sm tracking-widest uppercase ml-1 md:ml-2">({editingClass.day})</span></h3>
                        <button onClick={() => setEditingClass(null)} className="text-black/30 hover:text-[#C88582] transition-colors"><XCircle size={24}/></button>
                    </div>
                    <form onSubmit={handleSaveClass} className="p-6 md:p-8 space-y-5 md:space-y-6">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-[#798F53] uppercase tracking-widest mb-2">Subject Name</label>
                            <input 
                                required
                                type="text"
                                value={editingClass.subject}
                                onChange={e => setEditingClass({...editingClass, subject: e.target.value})}
                                placeholder="e.g., DSA lab[A103G]"
                                className="w-full p-3 md:p-3.5 text-sm font-bold bg-[#F4F1DE]/50 border-none rounded-xl focus:ring-4 focus:ring-[#1B5B65]/20 outline-none text-[#0F2E23]"
                            />
                            <p className="text-[9px] md:text-[10px] text-black/40 mt-2 font-bold tracking-wide">Add [Room] to automatically extract the room number.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-5">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#798F53] uppercase tracking-widest mb-2">Start Slot</label>
                                <select 
                                    value={editingClass.start} 
                                    onChange={e => setEditingClass({...editingClass, start: e.target.value})}
                                    className="w-full p-3 md:p-3.5 text-sm font-bold bg-[#F4F1DE]/50 border-none rounded-xl focus:ring-4 focus:ring-[#1B5B65]/20 outline-none text-[#0F2E23]"
                                >
                                    {slots.filter(s => s.type !== 'break').map(slot => (
                                        <option key={slot.id} value={slot.id}>{slot.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#798F53] uppercase tracking-widest mb-2">Duration (Slots)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    max="4"
                                    value={editingClass.span}
                                    onChange={e => setEditingClass({...editingClass, span: e.target.value})}
                                    className="w-full p-3 md:p-3.5 text-sm font-bold bg-[#F4F1DE]/50 border-none rounded-xl focus:ring-4 focus:ring-[#1B5B65]/20 outline-none text-[#0F2E23]"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-black/5">
                            {editingClass.originalIndex !== undefined && (
                                <button type="button" onClick={handleDeleteClass} className="px-5 py-2.5 flex items-center justify-center sm:justify-start gap-2 text-sm font-black text-[#C88582] bg-[#C88582]/10 hover:bg-[#C88582]/20 rounded-xl transition-colors sm:mr-auto w-full sm:w-auto mb-2 sm:mb-0">
                                    <Trash2 size={16}/> Delete
                                </button>
                            )}
                            <button type="button" onClick={() => setEditingClass(null)} className="px-5 py-2.5 text-sm font-black text-[#0F2E23] bg-[#F4F1DE] hover:bg-[#E8E4C9] rounded-xl transition-colors w-full sm:w-auto">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2.5 text-sm font-black text-white bg-[#1B5B65] hover:bg-[#0F2E23] rounded-xl shadow-md transition-colors w-full sm:w-auto">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}