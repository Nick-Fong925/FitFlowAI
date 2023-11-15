import { useState } from 'react';
import PropTypes from 'prop-types';

const Sidebar = ({ activeTab, onTabChange }) => {
  const tabs = ['Track Workout', 'Track Eating', 'AI Fitness Coach'];
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const handleTabHover = () => {
    setSidebarExpanded(true);
  };

  const handleTabLeave = () => {
    setSidebarExpanded(false);
  };

  return (
    <nav
      className={`bg-gray-300 transition-all duration-300 ${
        isSidebarExpanded ? 'w-48' : 'w-24'
      } h-screen`}
    >
      <div className="flex flex-col items-center py-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`text-black p-2 mb-2 focus:outline-none ${
              activeTab === tab ? 'text-white' : ''
            }`}
            onMouseEnter={handleTabHover}
            onMouseLeave={handleTabLeave}
            onClick={() => onTabChange(tab)}
          >
            <span className="hover:overflow-visible">{tab}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Sidebar;
