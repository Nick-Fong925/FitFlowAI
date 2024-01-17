import  { useState } from 'react';
import axios from 'axios';

const TrackWorkout = () => {

  
  const [errorMessage, setErrorMessage] = useState('');
  
  const [currentLog, setCurrentLog] = useState({
    userID: 1, 
    date: new Date().toLocaleDateString(),
    entries: [],
  });
  const [newEntry, setNewEntry] = useState({
    exercise: '',
    sets: 0,
    reps: 0,
    weight: 0,
  });


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

  
  const SaveWorkoutLog = async () => {
    console.log(currentLog)
    try {
      await axios.post('http://localhost:8080/saveWorkoutLog', currentLog);
 
      setCurrentLog({
        userID: 1, // Replace with the actual user ID
        date: new Date().toLocaleDateString(),
        entries: [],
      });
      setNewEntry({
        exercise: '',
        sets: 0,
        reps: 0,
        weight: 0,
      });

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


      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Current Workout Log - {currentLog.date}</h2>
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
  
    </div>
  );
};

export default TrackWorkout;