import  { useState } from 'react';

const TrackWorkout = () => {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState({
    date: new Date().toLocaleDateString(),
    entries: [],
  });
  const [newEntry, setNewEntry] = useState({
    exercise: '',
    sets: 0,
    reps: 0,
    weight: 0,
  });

  const addWorkoutLog = () => {
    setWorkoutLogs([...workoutLogs, currentLog]);
    setCurrentLog({
      date: new Date().toLocaleDateString(),
      entries: [],
    });
    setNewEntry({
      exercise: '',
      sets: 0,
      reps: 0,
      weight: 0,
    });
  };

  const addWorkoutEntry = () => {
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
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sets:</label>
        <input
          type="number"
          value={newEntry.sets}
          onChange={(e) => setNewEntry({ ...newEntry, sets: parseInt(e.target.value) })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Reps:</label>
        <input
          type="number"
          value={newEntry.reps}
          onChange={(e) => setNewEntry({ ...newEntry, reps: parseInt(e.target.value) })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs):</label>
        <input
          type="number"
          value={newEntry.weight}
          onChange={(e) => setNewEntry({ ...newEntry, weight: parseInt(e.target.value) })}
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
        onClick={addWorkoutLog}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Save Workout Log
      </button>

      {/* Display all workout logs */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">All Workout Logs</h2>
        <ul>
          {workoutLogs.map((log, index) => (
            <li key={index}>
              {log.date} - {log.entries.length} entries
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrackWorkout;