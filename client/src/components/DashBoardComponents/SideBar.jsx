import  { useState } from 'react';
import PropTypes from 'prop-types';
import AICoachIcon from '../../assets/DashboardIcons/ai.png';
import EatingLogIcon from '../../assets/DashboardIcons/salad.png';
import WorkoutLogIcon from '../../assets/DashboardIcons/weightlifting.png';
import Chef from "../../assets/DashboardIcons/chef-hat.png"
import Data from '../../assets/DashboardIcons/data.png'

const Sidebar = ({ activeTab, onTabChange }) => {
  const icons = {
    'Log Workout': WorkoutLogIcon,
    'Log Eating': EatingLogIcon,
    'AI Chef': Chef,
    'AI Fitness Coach': AICoachIcon,
    'Analytic Tools': Data,
  };

  const descriptions = {
    'Log Workout': 'Workout Log',
    'Log Eating': 'Meal Tracker',
    'Analytic Tools': 'Analytics',
    'AI Chef': 'Recipe Creator',
    'AI Fitness Coach': 'FitFlow Coach'

  };

  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const handleTabHover = () => {
    setSidebarExpanded(true);
  };

  const handleTabLeave = () => {
    setSidebarExpanded(false);
  };

  return (
    <div    
    onMouseEnter={handleTabHover}
    onMouseLeave={handleTabLeave} >
    <nav
      className={`bg-gray-100 rounded-lg transition-all duration-300 ${
        isSidebarExpanded ? 'w-48' : 'w-24'
      } h-screen overflow-x-hidden`}
    >
      <div className="flex flex-col py-10">
        {Object.keys(icons).map((tab) => (
          <button
            key={tab}
            className={`text-black font-bold p-2 mb-2 focus:outline-none ${
              activeTab === tab ? 'text-white' : ''
            }`}
     
            onClick={() => onTabChange(tab)}
          >
            <div className="flex items-center">
              <img
                src={icons[tab]}
                alt={tab}
                className={`mr-2 ml-2 mb-10 flex items-left ${isSidebarExpanded ? 'w-10 h-10' : 'w-12 h-12'}`}
              />
              <span className={`mb-10 text-sm ${isSidebarExpanded ? 'visible' : 'invisible'}`}>
                {descriptions[tab]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </nav>
    </div>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Sidebar;
