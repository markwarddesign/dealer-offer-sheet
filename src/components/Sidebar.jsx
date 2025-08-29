import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formSteps } from '../formSteps'; // Assuming formSteps exports the steps array
import { FileText, Settings as SettingsIcon, MenuSquareIcon} from 'lucide-react';

const Sidebar = ({ activeStep, onStepClick }) => {
  const { page, setPage } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavClick = (stepIndex) => {
    if (page !== 'form') {
      setPage('form');
    }
    // This component will need to be able to switch the active tab/step in the form
    // For now, we'll just call the passed onStepClick function
    onStepClick(stepIndex);
  };

  const handleOfferSheetClick = () => {
    setPage('offer');
  };

  const handleSettingsClick = () => {
    setPage('settings');
  };


  return (
    <div
      className="no-print fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out z-20"
      style={{ width: isHovered ? '250px' : '60px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex flex-col items-center py-4">
            <div className="mb-8">
              {/* Placeholder for logo */}
              <div className="w-8 h-8 rounded-full"><MenuSquareIcon /></div>
            </div>
            <nav className="flex flex-col space-y-2 w-full">
              {formSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(index)}
                  className={`flex items-center py-3 transition-colors duration-200 ${
                    page === 'form' && activeStep === index
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  style={{ paddingLeft: isHovered ? '20px' : '18px' }}
                  title={step.title}
                >
                  <step.icon className="h-6 w-6 flex-shrink-0" />
                  {isHovered && <span className="ml-4 font-semibold">{step.title}</span>}
                </button>
              ))}
              <hr className="my-2 border-gray-700" />
              <button
                onClick={handleOfferSheetClick}
                className={`flex items-center py-3 transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white w-full ${
                  page === 'offer' ? 'bg-red-600 text-white' : ''
                }`}
                style={{ paddingLeft: isHovered ? '20px' : '18px' }}
                title="Go to Offer Sheet"
              >
                <FileText className="h-6 w-6 flex-shrink-0" />
                {isHovered && <span className="ml-4 font-semibold">Offer Sheet</span>}
              </button>
            </nav>
          </div>
        </div>
        <div className="pb-4">
          <nav className="flex flex-col space-y-2 w-full">
            <button
              onClick={handleSettingsClick}
              className={`flex items-center py-3 transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white w-full ${
                page === 'settings' ? 'bg-red-600 text-white' : ''
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
