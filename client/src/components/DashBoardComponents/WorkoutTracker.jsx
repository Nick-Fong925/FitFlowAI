import  { useState } from 'react';
import axios from 'axios';

const TrackWorkout = () => {

  
  const [errorMessage, setErrorMessage] = useState('');
  
  const [currentLog, setCurrentLog] = useState({
    userID: 10, //UPDATE TO ACTUAL USER ID AFTER USER AUTH CREATED 
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
    try {
      await axios.post('http://localhost:8080/saveWorkoutLog', currentLog);

      setCurrentLog({
        userID: 10, // Replace with the actual user ID
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
          className="border p-2 w-full"
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
          className="border p-2 w-full"
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
          className="border p-2 w-full"
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
        className="border p-2 w-full"
      />
      </div>
      <button
        onClick={addWorkoutEntry}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
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
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Save Workout Log
      </button>
  
    </div>
  );
};

export default TrackWorkout;