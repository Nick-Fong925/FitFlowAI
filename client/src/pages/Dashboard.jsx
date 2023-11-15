import  { useState } from 'react';
import Sidebar from '../components/DashBoardComponents/SideBar.jsx';
import TrackWorkout from '../components/DashBoardComponents/WorkoutTracker.jsx';
import TrackEating from '../components/DashBoardComponents/EatingTracker.jsx';
import AIFitnessCoach from '../components/DashBoardComponents/AIFitnessCoach.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('Track Workout');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {activeTab === 'Track Workout' && <TrackWorkout />}
        {activeTab === 'Track Eating' && <TrackEating />}
        {activeTab === 'AI Fitness Coach' && <AIFitnessCoach />}
      </main>
    </div>
  );
}

export default App;
