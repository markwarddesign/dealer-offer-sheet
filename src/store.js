import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const initialDealData = {
	// Buyer Info
	buyerFirstName: 'John',
	buyerLastName: 'Doe',
	buyerPhone: '555-123-4567',
	buyerEmail: 'john.doe@email.com',

	// Vehicle Info
	vehicleYear: 2024,
	vehicleMake: 'KIA',
	vehicleModel: 'Niro',
	vehicleVin: 'KNDCR3LE7RS152658',
	vehicleStock: 'C12345',
	vehicleColor: 'Summit White',
	vehicleMileage: 2468,
	vehicleMpg: 49,

	// Deal Info
	marketValue: 32988,
	msrp: 0,
	acquisitionCost: 26500,
	reconditioningCost: 2650,
	advertisingCost: 675,
	flooringCost: 382.63,
	sellingPrice: 31869,
	roiPercentage: 5,
	rebates: 0,

	// Trade Info
  hasTrade: false,
	tradeValue: 26500,
	tradeMarketValue: 30500,
	tradePayOff: 26000,
  tradePayment: 620,
	tradeVehicleVin: '1gnevkkw7pj207470',
	tradeVehicleYear: 2023,
	tradeVehicleMake: 'CHEVROLET',
	tradeVehicleModel: 'Traverse',
	tradeVehicleTrim: 'Premier',
	tradeVehicleMpg: 26,
	tradeVehicleMileage: 14000,
	tradeVehicleColor: 'Summit White',
	tradeVehicleStock: 'C12345',

	// Fees & Taxes
	docFee: 200,
	titleFee: 0,
	tireFee: 0,
	licenseEstimate: 675,
	brakePlus: 499,
	safeGuard: 249,
	protectionPackage: 0,
	gapInsurance: 0,
	serviceContract: 0,
	taxRate: 9.8,

	// Trade-in specifics
	tradeIsLease: false,
	tradeCurrentMonthlyPayment: '',

	// Financing
	interestRate: 6.99,
	downPayment: [0, 1000, 2000],
	financeTerm: [72, 84],

	// Misc
	vehiclesInMarket: 100,
	avgDaysToSell: 75,

	// Offer Sheet Display Options
	showInterestRateOnOfferSheet: true,
	showLicenseFeeOnOfferSheet: true,
	showTaxRateOnOfferSheet: true,
	showAmountFinancedOnOfferSheet: true,
};

const defaultSettings = {
	roiPercentage: 5,
	wpflName: 'Warranty Protection for Life (WPFL)',
	ocflPrice: 45,
	ocflServicesPerYear: 3,
	showProtectionPackage: false,
	showGapInsurance: false,
	showServiceContract: false,
	tradeDevalueItems: [
		{ label: 'Scratches & Dents', price: 1500 },
		{ label: 'Brakes', price: 800 },
		{ label: 'Tires', price: 900 },
		{ label: 'Safety Inspection', price: 800 },
	],
	wpflOptions: [
		{ label: 'Sunset Chevrolet', price: 0 },
		{ label: 'CarShield', price: 149 },
		{ label: 'Endurance', price: 125 },
		{ label: 'Optional Plan', price: 100 },
	],
	defaultWPFLIndex: 2,
	interestRate: 6.99,
};

export const useAppStore = create(
	persist(
		(set, get) => ({
			// UI State
			page: 'form',
			showTradeVsPrivate: false,
			settingsOpen: false,
			activeStep: 0,

			// Data State
			dealData: initialDealData,
			settings: defaultSettings,

			// Actions
			setPage: (page) => set({ page }),
			setShowTradeVsPrivate: (show) => set({ showTradeVsPrivate: show }),
			setSettingsOpen: (open) => set({ settingsOpen: open }),
			setDealData: (dealData) => set({ dealData }),
			setSettings: (newSettings) => {
				const currentSettings = get().settings;
				const updatedSettings = { ...currentSettings, ...newSettings };
				set({ settings: updatedSettings });
			},
			updateDealData: (updates) => set((state) => ({ dealData: { ...state.dealData, ...updates } })),
			updateSettings: (updates) => {
				const currentSettings = get().settings;
				const updatedSettings = { ...currentSettings, ...updates };
				set({ settings: updatedSettings });
			},
			onStepChange: (step) => set({ activeStep: step }),
			resetDeal: () =>
				set((state) => ({
					dealData: {
						...initialDealData,
						roiPercentage: state.settings.roiPercentage, // Get default from settings
					},
				})),
		}),
		{
			name: 'offer-sheet-storage', // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
			partialize: (state) => ({
				dealData: state.dealData,
				settings: state.settings,
			}),
		}
	)
);


