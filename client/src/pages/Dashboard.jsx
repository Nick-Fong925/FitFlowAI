import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/DashBoardComponents/SideBar.jsx';
import TrackWorkout from '../components/DashBoardComponents/WorkoutTracker.jsx';
import TrackEating from '../components/DashBoardComponents/EatingTracker.jsx';
import AIFitnessCoach from '../components/DashBoardComponents/AIFitnessCoach.jsx';
import Analytics from '../components/DashBoardComponents/CaloriesAnalytics.jsx';
import Analytics2 from '../components/DashBoardComponents/WorkoutAnalytics.jsx';

import { selectActualUserName } from "../selectors/nameSelector";

function Dashboard() {
  const [activeTab, setActiveTab] = useState('Log Workout');
  const userName = useSelector(selectActualUserName);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen max-width-6xl">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {activeTab === 'Log Workout' && <TrackWorkout />}
        {activeTab === 'Log Eating' && <TrackEating />}
        {activeTab === 'AI Fitness Coach' }
        {(activeTab === 'Analytic Tools' && userName) && <Analytics />}
        {(activeTab === 'Analytic Tools2' && userName) && <Analytics2 />}
        {activeTab === 'AI Chef' && <AIFitnessCoach />}
      </main>
    </div>
  );
}

export default Dashboard;