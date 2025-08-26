import { create } from 'zustand';

// --- Initial State ---
const initialDealData = {
  hasTrade: false,
  buyerFirstName: 'John',
  buyerLastName: 'Appleseed',
  buyerPhone: '555-123-4567',
  buyerEmail: 'john.appleseed@email.com',
  vehicleYear: 2024,
  vehicleMake: 'KIA',
  vehicleModel: 'Niro',
  vehicleVin: 'VIN123456789XYZ',
  vehicleStock: 'C12345',
  vehicleColor: 'Summit White',
  vehicleMileage: 2468,
  vehicleMpg: 49,
  marketValue: 32988,
  acquisitionCost: 26500,
  reconditioningCost: 2650,
  advertisingCost: 675,
  flooringCost: 382.63,
  sellingPrice: 31869,
  roiPercentage: 5,
  rebates: 0,
  tradeValue: 4500,
  tradeMarketValue: 30500,
  tradePayOff: 26000,
  tradeVehicleVin: '1gnevkkw7pj207470',
  tradeVehicleYear: 2023,
  tradeVehicleMake: 'CHEVROLET',
  tradeVehicleModel: 'Traverse',
  tradeVehicleTrim: 'Premier',
  tradeVehicleMpg: 26,
  tradeVehicleMileage: 14000,
  tradeVehicleColor: 'Summit White',
  tradeVehicleStock: 'C12345',
  docFee: 200,
  titleFee: 0,
  tireFee: 0,
  licenseEstimate: 675,
  brakePlus: 499,
  safeGuard: 249,
  taxRate: 9.8,
  tradeIsLease: false,
  tradeCurrentMonthlyPayment: '',
  tradePayment: 620,
  isNewVehicle: false,
  downPayment: [2500, 5000, 7500],
  financeTerm: [48, 60, 72],
  tradeDevalueSelected: [0,1,2,3],
  wpfl: true,
  ocfl: true,
};

const defaultSettings = {
  layout: 'tabs',
  tradeDevalueItems: [
    { label: 'Scratches & Dents', price: 1500 },
    { label: 'Brakes', price: 800 },
    { label: 'Tires', price: 900 },
    { label: 'Safety Inspection', price: 800 },
  ],
};

export const useAppStore = create((set) => ({
  // UI State
  page: 'form',
  showTradeVsPrivate: false,
  settingsOpen: false,

  // Data State
  dealData: initialDealData,
  settings: defaultSettings,

  // Actions
  setPage: (page) => set({ page }),
  setShowTradeVsPrivate: (show) => set({ showTradeVsPrivate: show }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setDealData: (dealData) => set({ dealData }),
  setSettings: (settings) => set({ settings }),
  updateDealData: (updates) => set((state) => ({ dealData: { ...state.dealData, ...updates } })),
  updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
}));
