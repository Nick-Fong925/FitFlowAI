import { useState, useEffect } from 'react';
import axios from 'axios';

const TrackWorkout = () => {

  const actualUserID = 1;

  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [currentLog, setCurrentLog] = useState({
    userID: actualUserID, 
    date: new Date().toLocaleDateString(),
    entries: [],
  });
  const [newEntry, setNewEntry] = useState({
    exercise: '',
    sets: 0,
    reps: 0,
    weight: 0,
  });

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }

  useEffect(() => {

    fetchWorkoutLogs();
  }, []); 


  const addWorkoutEntry = () => {
    // Check if the exercise is not an empty string before adding the entry
    if (newEntry.exercise.trim() !== '') {
      setCurrentLog({
        ...currentLog,
        entries: [...currentLog.entries, newEntry],
      });
      setNewEntry({
        exercise: '',
        sets: 0,
        reps: 0,
        weight: 0,
      });
      setErrorMessage(''); 
    } else {
 
      setErrorMessage('Please enter a valid exercise.');
    }
  };

  const fetchWorkoutLogs = async () => {
    try {
      // Replace actualUserID with the variable or state that holds the real user ID
      const response = await axios.get(`http://localhost:8080/getAllWorkoutLogs?userID=${actualUserID}`);
      setWorkoutLogs(response.data);
    } catch (error) {
      console.error('Error fetching workout logs:', error);
    }
  };
  
  const SaveWorkoutLog = async () => {
    console.log(currentLog)
    try {
      await axios.post('http://localhost:8080/saveWorkoutLog', currentLog);
 
      setCurrentLog({
        userID: actualUserID, // Replace with the actual user ID
        date: new Date().toLocaleDateString(),
        entries: [],
      });
      setNewEntry({
        exercise: '',
        sets: 0,
        reps: 0,
        weight: 0,
      });

      await fetchWorkoutLogs();

    } catch (error) {
      console.error('Error saving workout log:', error);
    
    }
  };


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Track Workout</h1>

      {/* Form to add new workout entry */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Exercise:</label>
        <input
          type="text"
          value={newEntry.exercise}
          onChange={(e) => setNewEntry({ ...newEntry, exercise: e.target.value })}
          className="border-2 p-2 w-full rounded-lg text-s"
        />
      </div>
      <div className="mb-4 text-red-500">{errorMessage}</div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sets:</label>
        <input
          type="text"
          value={newEntry.sets}
          onChange={(e) => {
            const parsedValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric characters
            setNewEntry({ ...newEntry, sets: parsedValue });
          }}
          className="border-2 p-2 w-full rounded-lg text-s"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Reps:</label>
        <input
          type="text"
          value={newEntry.reps}
          onChange={(e) => {
            const parsedValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric characters
            setNewEntry({ ...newEntry, reps: parsedValue });
          }}
          className="border-2 p-2 w-full rounded-lg text-s"
        />

      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs):</label>
    <input
        type="text"
        value={newEntry.weight}
        onChange={(e) => {
          const parsedValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric characters
          setNewEntry({ ...newEntry, weight: parsedValue });
        }}
        className="border-2 p-2 w-full rounded-lg text-s"
      />
      </div>
      <button
        onClick={addWorkoutEntry}        
        className="bg-teal-500 text-white font-semibold text-sm py-2 px-4 rounded hover:bg-teal-600"
      >
        Add Workout Entry
      </button>


      <div className="border-4 border-teal-600 bg-teal-50 rounded-xl p-4 max-w-xs font-semibold text-xs mt-10 mb-10 ">
        <h2 className="text-lg font-bold mb-4">{formatDate(currentLog.date)}</h2>
        <ul>
          {currentLog.entries.map((entry, index) => (
            <li key={index}>
              {entry.exercise} - {entry.sets} sets, {entry.reps} reps, {entry.weight} lbs
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={SaveWorkoutLog}
        className="bg-teal-500 text-white font-semibold text-sm py-2 px-4 rounded hover:bg-teal-600"
      >
        Save Workout Log
      </button>

      <div className="mt-8">
  <h2 className="text-xl font-bold mb-4">All Workout Logs</h2>
  {workoutLogs && workoutLogs.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {workoutLogs.map((log) => (
        <div key={log.entryID} className="border-4 border-teal-600 bg-teal-50 rounded-xl p-4 max-w-xs font-semibold text-xs">
          <ul>
          <p className="mb-3 font-bold text-slate-500"> {formatDate(log.date)}</p>
            {log.entries.map((entry, index) => (
              <li key={index}>
                <span className="font-bold">{entry.exercise}:</span> {entry.sets} sets | {entry.reps} reps | {entry.weight} lbs
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : (
    <p>No workout logs available.</p>
  )}
</div>
    </div>
  

  );
};

export default TrackWorkout;