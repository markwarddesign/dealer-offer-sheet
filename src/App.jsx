import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './components/LoginPage';
import { isAuthenticated, logout } from './utils/auth';
import SteppedForm from './components/SteppedForm';
import Sidebar from './components/Sidebar';
import OfferSheet from './components/OfferSheet';
import TradeVsPrivateSale from './components/TradeVsPrivateSale';
const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe20azLghiq6B4uoUgyV5A_j5zjglEyeNF9g&s";

import { formSteps as allFormSteps } from './formSteps';

const App = () => {
    const {
        settings,
        resetDeal,
        isSidebarExpanded,
        page,
        setPage,
    } = useAppStore();
    const [isAuth, setIsAuth] = useState(isAuthenticated());
    const [showTradeVsPrivate, setShowTradeVsPrivate] = useState(false);

    const formSteps = allFormSteps;

    useEffect(() => {
        const root = window.document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Reset the trade vs private view when the main page changes
        if (page !== 'offer') {
            setShowTradeVsPrivate(false);
        }
    }, [settings.theme, page]);

    const handleLogin = () => {
        setIsAuth(true);
    };

    const handleLogout = () => {
        logout();
        setIsAuth(false);
    };

    const renderPage = () => {
        switch (page) {
            case 'offer':
                return (
                    <>
                        <OfferSheet
                            onGoBack={() => setPage('form')}
                            onShowTradeVsPrivate={() => setShowTradeVsPrivate(true)}
                        />
                        {showTradeVsPrivate && (
                            <div className="mt-8">
                                <TradeVsPrivateSale
                                    onBack={() => setShowTradeVsPrivate(false)}
                                />
                            </div>
                        )}
                    </>
                );
            case 'settings':
                return <SettingsPage onBack={() => setPage('form')} />;
            case 'form':
            default:
                return (
                    <SteppedForm
                        steps={formSteps}
                        onGenerateOffer={() => setPage('offer')}
                        resetDeal={resetDeal}
                    />
                );
        }
    };

    if (!isAuth) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex min-h-dvh bg-gray-100">
            <Sidebar />
            <div className='w-full'>
					<header className="bg-black text-white p-4 shadow-lg sticky top-0 z-10 no-print ml-15">
				<div className="container mx-auto flex justify-between items-center">
				<div className="flex items-center">
					<img src={logoUrl} alt="Sunset Chevrolet Logo" className="h-12" />
				</div>
				<div className="flex items-center gap-4">
					<p className="text-sm text-gray-300">{page === 'form' ? 'Deal Configuration' : page === 'settings' ? 'Settings' : 'Customer Offer Sheet'}</p>
					<button
					onClick={handleLogout}
					className="ml-4 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
					aria-label="Logout"
					>
					Logout
					</button>
				</div>
				</div>
			</header>

			<main className={`flex-1 flex flex-col transition-all duration-300 py-20 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
				<div className="max-w-7xl mx-auto w-full">{renderPage()}</div>
			</main>
			</div>
		</div>
	);
};

export default App;

