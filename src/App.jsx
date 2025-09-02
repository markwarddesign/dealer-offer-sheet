import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './components/LoginPage';
import { isAuthenticated, logout } from './utils/auth';
import SteppedForm from './components/SteppedForm';
import Sidebar from './components/Sidebar';
import OfferSheet from './components/OfferSheet';
import TradeVsPrivateSale from './components/TradeVsPrivateSale';
import QuickEntryPage from './pages/QuickEntryPage';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe20azLghiq6B4uoUgyV5A_j5zjglEyeNF9g&s";

import { formSteps as allFormSteps } from './formSteps';

const App = () => {
    const [isAuth, setIsAuth] = useState(isAuthenticated());

    const handleLogin = () => setIsAuth(true);
    const handleLogout = () => {
        logout();
        setIsAuth(false);
    };

    return (
        <BrowserRouter basename={import.meta.env.DEV ? '/' : '/dealer-offer-sheet/'}>
            {isAuth ? <AppContent onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
        </BrowserRouter>
    );
};

const AppContent = ({ onLogout }) => {
    const {
        settings,
        resetDeal,
        isSidebarExpanded,
        page,
        setPage,
    } = useAppStore();
    const [showTradeVsPrivate, setShowTradeVsPrivate] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const formSteps = allFormSteps;

    useEffect(() => {
        const root = window.document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings.theme]);

    useEffect(() => {
        const path = location.pathname;
        let currentPage = 'form';
        if (path === '/') {
            currentPage = 'form';
        } else if (path === '/offer') {
            currentPage = 'offer';
        } else if (path === '/settings') {
            currentPage = 'settings';
        } else if (path === '/quick-entry') {
            currentPage = 'quick-entry';
        }
        setPage(currentPage);

        if (path !== '/offer') {
            setShowTradeVsPrivate(false);
        }
    }, [location, setPage]);

    const getPageTitle = () => {
        switch (page) {
            case 'form':
                return 'Deal Configuration';
            case 'settings':
                return 'Settings';
            case 'quick-entry':
                return 'Quick Entry';
            case 'offer':
                return 'Customer Offer Sheet';
            default:
                return '';
        }
    };

    return (
        <div className="flex min-h-dvh bg-gray-100">
            <Sidebar />
            <div className='w-full'>
                <header className={`bg-black text-white p-4 shadow-lg sticky top-0 z-10 no-print transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center">
                            <img src={logoUrl} alt="Sunset Chevrolet Logo" className="h-12" />
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-300">{getPageTitle()}</p>
                            <button
                                onClick={onLogout}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
                <main className={`p-4 md:p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
                    <Routes>
                        <Route path="/form/:step" element={
                            <SteppedForm
                                steps={formSteps}
                                onGenerateOffer={() => navigate('/offer')}
                                resetDeal={resetDeal}
                            />
                        } />
                        <Route path="/quick-entry" element={<QuickEntryPage />} />
                        <Route path="/settings" element={<SettingsPage onBack={() => navigate(formSteps[0].path)} />} />
                        <Route path="/offer" element={
                            <>
                                <OfferSheet
                                    onGoBack={() => navigate(formSteps[0].path)}
                                    onShowTradeVsPrivate={() => setShowTradeVsPrivate(true)}
                                />
                                {showTradeVsPrivate && (
                                    <div className="mt-8 print:mt-0 print-page-break">
                                        <TradeVsPrivateSale
                                            onBack={() => setShowTradeVsPrivate(false)}
                                        />
                                    </div>
                                )}
                            </>
                        } />
                        <Route path="*" element={<Navigate to={formSteps[0].path} />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;

