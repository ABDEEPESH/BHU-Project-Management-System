import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="btn btn-outline-secondary btn-sm"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <>
          <i className="bi bi-sun-fill me-1"></i>
          <span className="d-none d-sm-inline">Light</span>
        </>
      ) : (
        <>
          <i className="bi bi-moon-fill me-1"></i>
          <span className="d-none d-sm-inline">Dark</span>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;
