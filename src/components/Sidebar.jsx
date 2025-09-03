import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { formSteps } from '../formSteps';
import { FileText, Settings as SettingsIcon, Zap, Layers, X } from 'lucide-react';
import milesLogo from '../assets/MILES_Logo.svg';
import milesIcon from '../assets/MILES_Icon.svg';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { page, activeStep } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlyupOpen, setIsFlyupOpen] = useState(false);
  const navigate = useNavigate();
  const flyupRef = useRef(null);

  const handleNavClick = (path) => {
    navigate(path);
    setIsFlyupOpen(false);
  };

  const handleOfferSheetClick = () => navigate('/offer');
  const handleSettingsClick = () => navigate('/settings');
  const handleQuickEntryClick = () => navigate('/quick-entry');

  // Close flyup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (flyupRef.current && !flyupRef.current.contains(event.target)) {
        // A bit of a hack to not immediately close when the flyup button is clicked
        if (!event.target.closest('#flyup-toggle')) {
          setIsFlyupOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [flyupRef]);

  const mobileNavItems = [
    {
      id: 'flyup-toggle',
      title: 'Deal Steps',
      icon: Layers,
      action: () => setIsFlyupOpen(!isFlyupOpen),
      isActive: page === 'form',
    },
    {
      title: 'Quick Entry',
      icon: Zap,
      action: handleQuickEntryClick,
      isActive: page === 'quick-entry',
    },
    {
      title: 'Offer Sheet',
      icon: FileText,
      action: handleOfferSheetClick,
      isActive: page === 'offer',
    },
    {
      title: 'Settings',
      icon: SettingsIcon,
      action: handleSettingsClick,
      isActive: page === 'settings',
    },
  ];

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <div
        className="sidebar no-print hidden md:sticky md:top-0 md:left-0 md:flex md:h-[100dvh] md:flex-col md:justify-between md:overflow-y-auto text-white transition-all duration-300 ease-in-out z-20 bg-gradient-to-br from-dark-gradient-1 via-dark-gradient-2 to-dark-gradient-3"
        style={{ width: isHovered ? '280px' : '60px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col items-center py-4 pt-0">
              <div className="p-4 bg-miles-darkest w-full text-center flex justify-center">
                {isHovered ? (
                  <img src={milesLogo} alt="Miles Logo" className="h-7" />
                ) : (
                  <img src={milesIcon} alt="Miles Icon" className="w-8 h-7" />
                )}
              </div>
              <nav className="flex flex-col space-y-2 w-full">
                {formSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(step.path)}
                    className={`flex items-center py-3 transition-colors duration-200 ${
                      page === 'form' && activeStep === index
                        ? 'bg-miles-dark text-white'
                        : 'text-miles-light hover:bg-miles-darkest hover:text-white'
                    }`}
                    style={{ paddingLeft: isHovered ? '20px' : '18px' }}
                    title={step.title}
                  >
                    <step.icon className="h-6 w-6 flex-shrink-0" />
                    <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>{step.title}</span>
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
                  <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>Offer Sheet</span>
                </button>
                <button
                  onClick={handleQuickEntryClick}
                  className={`flex items-center py-3 transition-colors duration-200 text-miles-light hover:bg-miles-darkest hover:text-white w-full ${
                    page === 'quick-entry' ? 'bg-miles-dark text-white' : ''
                  }`}
                  style={{ paddingLeft: isHovered ? '20px' : '18px' }}
                  title="Quick Entry"
                >
                  <Zap className="h-6 w-6 flex-shrink-0" />
                  <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>Quick Entry</span>
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
                <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>Settings</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* --- Mobile Flyup Menu --- */}
      {isFlyupOpen && (
        <div ref={flyupRef} className="md:hidden fixed bottom-16 left-0 w-full z-40 no-print animate-slide-up">
          <div className="bg-gradient-to-t from-dark-gradient-1 to-dark-gradient-2 p-4 rounded-t-lg shadow-top">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Deal Steps</h3>
              <button onClick={() => setIsFlyupOpen(false)} className="p-1 text-miles-light">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-1">
              {formSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(step.path)}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-left ${
                    page === 'form' && activeStep === index
                      ? 'bg-miles-dark text-white'
                      : 'text-miles-light hover:bg-miles-darkest hover:text-white'
                  }`}
                >
                  <step.icon className="h-6 w-6 mr-4 flex-shrink-0" />
                  <span>{step.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* --- Mobile Bottom Nav --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-gradient-to-t from-dark-gradient-1 via-dark-gradient-2 to-dark-gradient-3 text-white z-30 flex justify-around items-center no-print shadow-top">
        {mobileNavItems.map((item) => (
          <button
            key={item.title}
            id={item.id}
            onClick={item.action}
            className={`flex flex-col items-center justify-center text-xs p-1 rounded-md transition-colors duration-200 w-1/4 h-full ${
              item.isActive ? 'text-white' : 'text-miles-light hover:text-white'
            }`}
            title={item.title}
          >
            <item.icon className="h-6 w-6 mb-0.5" />
            <span className="truncate">{item.title}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
