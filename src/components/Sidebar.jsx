import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formSteps } from '../formSteps'; // Assuming formSteps exports the steps array
import { FileText, Settings as SettingsIcon, MenuSquareIcon} from 'lucide-react';

const Sidebar = () => {
  const { page, setPage, activeStep, onStepChange } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavClick = (stepIndex) => {
    if (page !== 'form') {
      setPage('form');
    }
    onStepChange(stepIndex);
  };

  const handleOfferSheetClick = () => {
    setPage('offer');
  };

  const handleSettingsClick = () => {
    setPage('settings');
  };

  return (
    <div
      className="sidebar no-print fixed top-0 left-0 h-full text-white transition-all duration-300 ease-in-out z-20 bg-gradient-to-br from-dark-gradient-1 via-dark-gradient-2 to-dark-gradient-3"
      style={{ width: isHovered ? '250px' : '60px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex flex-col items-center py-4 pt-0">
            <div className="p-4 bg-miles-darkest w-full text-center flex justify-center">
              {isHovered ? (
                <img src="/assets/MILES_Logo.svg" alt="Miles Logo" className="h-7" />
              ) : (
                <img src="/assets/MILES_Icon.svg" alt="Miles Icon" className="w-8 h-7" />
              )}
            </div>
            <nav className="flex flex-col space-y-2 w-full">
              {formSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(index)}
                  className={`flex items-center py-3 transition-colors duration-200 ${
                    page === 'form' && activeStep === index
                      ? 'bg-miles-dark text-white'
                      : 'text-miles-light hover:bg-miles-darkest hover:text-white'
                  }`}
                  style={{ paddingLeft: isHovered ? '20px' : '18px' }}
                  title={step.title}
                >
                  <step.icon className="h-6 w-6 flex-shrink-0" />
                  {isHovered && <span className="ml-4 text-white">{step.title}</span>}
                </button>
              ))}
              <hr className="my-2 border-miles-dark" />
              <button
                onClick={handleOfferSheetClick}
                className={`flex items-center py-3 transition-colors duration-200 text-miles-light hover:bg-miles-darkest hover:text-white w-full ${
                  page === 'offer' ? 'bg-miles-dark text-white' : ''
                }`}
                style={{ paddingLeft: isHovered ? '20px' : '18px' }}
                title="Go to Offer Sheet"
              >
                <FileText className="h-6 w-6 flex-shrink-0" />
                {isHovered && <span className="ml-4">Offer Sheet</span>}
              </button>
            </nav>
          </div>
        </div>
        <div className="pb-4">
          <nav className="flex flex-col space-y-2 w-full">
            <button
              onClick={handleSettingsClick}
              className={`flex items-center py-3 transition-colors duration-200 text-miles-light hover:bg-miles-darkest hover:text-white w-full ${
                page === 'settings' ? 'bg-miles-dark text-white' : ''
              }`}
              style={{ paddingLeft: isHovered ? '20px' : '18px' }}
              title="Settings"
            >
              <SettingsIcon className="h-6 w-6 flex-shrink-0" />
              {isHovered && <span className="ml-4 font-semibold">Settings</span>}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
