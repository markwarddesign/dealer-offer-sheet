
// ...existing code...
import React from "react";
import { useAppStore } from '../store';

// Helper function to format currency
const formatCurrency = (amount) => {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(number);
};

function TradeVsPrivateSale({ dealData, onBack }) {
  // Market data values
  const vehiclesInMarket = dealData.vehiclesInMarket ?? '';
  const avgDaysToSell = dealData.avgDaysToSell ?? '';

  // Always use the latest settings from the global store for live updates
  const settings = useAppStore(state => state.settings);
  const WPFL_OPTIONS = settings.wpflOptions || [
    { label: 'Sunset Chevrolet', price: 0 },
    { label: 'CarShield', price: 149 },
    { label: 'Endurance', price: 125 },
    { label: 'Optional Plan', price: 100 },
  ];
  const defaultWPFLIndex = settings.defaultWPFLIndex ?? 0;
  const WPFL_SELECTED = WPFL_OPTIONS[defaultWPFLIndex] || WPFL_OPTIONS[0];
  // Print styles are now in a separate CSS file
  // Helper to calculate monthly savings for selected months
  // Removed unused getMonthlySavings function and requiredSalePrice variable
  const [selectedMonths, setSelectedMonths] = React.useState(3);
  // Helper to get total trade devalue
  // Removed unused getTotalTradeDevalue function

  // --- Constants ---
  const TAX_RATE = 0.098; // 9.8%
  const AVG_AD_COST = 350; // Example: average advertising cost
  const AVG_DAYS_TO_SELL = 75; // 60-90 days
  const MONTHLY_PAYMENT = Number(dealData.tradePayment) || 0;
  const MONTHS_TO_SELL = Math.ceil(AVG_DAYS_TO_SELL / 30);

  // --- Calculations ---
  // Removed unused tradeMarketValue variable
  const tradePayOff = Number(dealData.tradePayOff) || 0;
  const tradeValue = Number(dealData.tradeValue) || 0;
  // Removed unused totalDevalue variable
  const netTrade = tradeValue - tradePayOff;

  // Private sale proceeds
  // Removed unused privateSaleGross variable
  // Removed unused privateSaleTaxOwed, privateSaleAdCost, privateSaleHoldingCost, and privateSaleNet variables

  // Savings calculation
  // Removed unused savings variable

  // --- OCFL/WPFL/Fuel Savings Example Data ---
  const OIL_CHANGE_COST = settings.oilChangeCost ?? 150;
  const OCFL_YEARS = settings.ocflYears ?? 5;
  const OCFL_YEARLY_SAVINGS = OIL_CHANGE_COST;
  const OCFL_TOTAL_SAVINGS = OIL_CHANGE_COST * OCFL_YEARS;
  const OCFL_MONTHLY_SAVINGS = OCFL_TOTAL_SAVINGS / 12;

  const WPFL_NAME = settings.wpflName || 'Warranty Protection for Life (WPFL)';

  // Fuel savings
  const NEW_MPG = Number(dealData.vehicleMpg) || 28;
  const TRADE_MPG = Number(dealData.tradeVehicleMpg) || 19;
  const MILES_PER_MONTH = 1500;
  const GAS_PRICE = 4.80;
  const NEW_GALLONS = NEW_MPG > 0 ? MILES_PER_MONTH / NEW_MPG : 0;
  const TRADE_GALLONS = TRADE_MPG > 0 ? MILES_PER_MONTH / TRADE_MPG : 0;
  const NET_MPG = NEW_MPG - TRADE_MPG;
  const NET_GALLONS = TRADE_GALLONS - NEW_GALLONS;
  const FUEL_SAVINGS = (TRADE_MPG > 0 && NEW_MPG > 0) ? (TRADE_GALLONS - NEW_GALLONS) * GAS_PRICE : 0;

  // Cost of Ownership Adjustment
  const COST_OF_OWNERSHIP_TOTAL = (WPFL_SELECTED?.price ?? 0) + OCFL_MONTHLY_SAVINGS + FUEL_SAVINGS;

  if (!dealData.hasTrade) {
    return null;
  }
  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-8 mb-12 trade-vs-private-print-main">
        <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-red-500 inline-block mr-1"><circle cx="12" cy="12" r="10" fill="#fee2e2"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Trade-In vs Private Sale Breakdown
        </h2>
        <div className="mb-8 text-center text-base text-gray-800 max-w-3xl mx-auto">
          <span className="font-bold text-gray-900">Trading in your vehicle</span> typically results in <span className="font-bold text-gray-900">more money in your pocket</span> compared to selling it privately, once you factor in taxes, advertising, and holding costs.
        </div>

        {/* --- Combined Trade & Sale Comparison Section --- */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8 the-options">
          {/* Trade Option (Top) */}
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 flex flex-col items-center shadow-md">
            <div className="text-lg font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-500"><circle cx="12" cy="12" r="10" fill="#dbeafe"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Trade Option <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">Recommended</span>
            </div>
            <div className="w-full flex flex-col items-center mb-4">
              <div className="text-5xl font-extrabold text-blue-700 mb-2">{formatCurrency(tradeValue)}</div>
              {!dealData.tradeIsLease &&<div className="text-3xl font-bold text-gray-900 mb-2 flex items-center">+ Tax Credit&nbsp;
                <span className="text-blue-700">{formatCurrency(tradeValue * TAX_RATE)}</span>
              </div>}
              <div className="mt-6">
                <div className="font-semibold text-gray-800 mb-2">Why choose trade-in?</div>
                <ul className="list-disc pl-5 text-gray-900 text-sm space-y-1">
                  {!dealData.tradeIsLease &&<li><span className="font-bold text-blue-700">Immediate tax credit</span> (reduces sales tax on your new purchase)</li>}
                  <li>No advertising or marketing costs</li>
                  <li>No waiting period—get paid instantly</li>
                  <li>No risk of additional payments or insurance</li>
                  <li>Simple, safe, and fast transaction</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Sell Option (Top) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center">
            <div className="text-lg font-bold mb-2 text-gray-800 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-gray-400"><circle cx="12" cy="12" r="10" fill="#f3f4f6"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sell Option
            </div>
            <div className="w-full flex flex-col items-center mb-4">
              <div className="text-5xl font-extrabold text-gray-800 mb-2">{(() => {
                const adCost = AVG_AD_COST;
                const holdingCost = MONTHLY_PAYMENT * selectedMonths;
                const numerator = netTrade + tradePayOff + adCost + holdingCost - netTrade * TAX_RATE;
                const requiredSalePrice = numerator / (1 - TAX_RATE);
                return formatCurrency(Math.ceil(requiredSalePrice));
              })()}</div>
              <div className="mt-4 text-sm font-semibold text-gray-800">Required Sale Price to Match Trade Value</div>
            </div>
            <div className="mt-4">
              <div className="font-semibold text-gray-800 mb-2">Cons:</div>
              <ul className="list-disc pl-5 text-gray-800 text-sm space-y-1">
                {!dealData.tradeIsLease &&<li>No tax credit ({formatCurrency(tradeValue * TAX_RATE)})</li>}
                <li>Must market and advertise yourself</li>
                <li className="!list-none !pl-0">
                  <div className="my-2">
                    <div className="font-semibold text-gray-800 mb-1">Payments While Selling:</div>
                    <div className="flex gap-1 mb-2 w-full">
                      <button
                        type="button"
                        key={'today'}
                        onClick={() => setSelectedMonths(0)}
                        className={
                          selectedMonths === 0
                            ? 'bg-gray-400 text-white rounded px-2 py-1 ring-2 ring-gray-400 text-xs font-semibold flex-1'
                            : 'bg-gray-100 text-gray-800 rounded px-2 py-1 hover:bg-gray-200 text-xs font-semibold flex-1'
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        Today<br />{formatCurrency(MONTHLY_PAYMENT * 0)}
                      </button>
                      {[1,2,3].map((mo) => (
                        <button
                          type="button"
                          key={mo}
                          onClick={() => setSelectedMonths(mo)}
                          className={
                            selectedMonths === mo
                              ? 'bg-gray-400 text-white rounded px-2 py-1 ring-2 ring-gray-400 text-xs font-semibold flex-1'
                              : 'bg-gray-100 text-gray-800 rounded px-2 py-1 hover:bg-gray-200 text-xs font-semibold flex-1'
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          {mo} mo<br />{formatCurrency(MONTHLY_PAYMENT * mo)}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-6 py-2 shadow font-semibold text-gray-800 flex flex-col items-center">
                        <span className="text-xs font-bold uppercase tracking-wide"># in Market</span>
                        <span className="text-lg">{vehiclesInMarket}</span>
                      </div>
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-6 py-2 shadow font-semibold text-gray-800 flex flex-col items-center">
                        <span className="text-xs font-bold uppercase tracking-wide">Avg Days to Sell</span>
                        <span className="text-lg">{avgDaysToSell}</span>
                      </div>
                    </div>
                  </div>
                </li>
                <li>Potential for more hassle and risk</li>
              </ul>
            </div>
          </div>
        </div>


        {/* --- Monthly Cost Savings Cards Layout --- */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 the-cards no-print">
          {/* OCFL Savings Card */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 flex flex-col items-center">
            <div className="text-lg font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-blue-400"><circle cx="12" cy="12" r="10" fill="#dbeafe"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              OCFL Savings
            </div>
            <div className="text-2xl font-extrabold text-blue-700 mb-1">{formatCurrency(OCFL_MONTHLY_SAVINGS)}</div>
            <div className="text-xs text-gray-700 mb-2">per month</div>
            <div className="text-sm text-gray-800">{OCFL_YEARS} years • {formatCurrency(OCFL_TOTAL_SAVINGS)} total</div>
            <div className="mt-2 text-xs text-gray-700 text-center bg-blue-50 rounded p-2 w-full">
              <div className="font-semibold mb-1">How it's calculated:</div>
              <div>Oil Change Cost × Years ÷ 12</div>
              <div>{formatCurrency(OIL_CHANGE_COST)} × {OCFL_YEARS} ÷ 12 = <span className="font-bold">{formatCurrency(OCFL_MONTHLY_SAVINGS)}</span></div>
            </div>
          </div>
          {/* WPFL Cost Card */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 flex flex-col items-center">
            <div className="text-lg font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-blue-400"><circle cx="12" cy="12" r="10" fill="#dbeafe"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {WPFL_NAME}
            </div>
            <div className="text-2xl font-extrabold text-blue-700 mb-1">{formatCurrency(WPFL_SELECTED?.price ?? 0)}</div>
            <div className="text-xs text-gray-700 mb-2">per month</div>
            {dealData.wpfl && WPFL_OPTIONS.length > 1 && (
              <div className="w-full mt-2">
                <div className="text-xs text-gray-600 mb-1 font-semibold text-center">Other Options:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {WPFL_OPTIONS.map((opt, idx) => (
                    <div key={idx} className={`px-2 py-1 rounded border text-xs ${idx === defaultWPFLIndex ? 'bg-blue-50 border-blue-400 font-bold' : 'bg-white border-blue-200'}`}>{opt.label}: {formatCurrency(opt.price)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Fuel Savings Card */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 flex flex-col items-center">
            <div className="text-lg font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-blue-400"><circle cx="12" cy="12" r="10" fill="#dbeafe"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Fuel Savings
            </div>
            <div className="text-2xl font-extrabold text-blue-700 mb-1">{formatCurrency(FUEL_SAVINGS)}</div>
            <div className="text-xs text-gray-700 mb-2">per month</div>
            <div className="text-sm text-gray-800">MPG: {NET_MPG > 0 ? '+' : ''}{NET_MPG} | Gallons: {NET_GALLONS.toFixed(1)}</div>
            <div className="mt-2 text-xs text-gray-700 text-center bg-blue-50 rounded p-2 w-full">
              <div className="font-semibold mb-1">How it's calculated:</div>
              <div>(Trade MPG vs New MPG) × Miles ÷ MPG × Gas Price</div>
              <div>({TRADE_MPG} vs {NEW_MPG}) × {MILES_PER_MONTH} ÷ MPG × {formatCurrency(GAS_PRICE)}</div>
              <div>({TRADE_GALLONS.toFixed(1)} - {NEW_GALLONS.toFixed(1)}) × {formatCurrency(GAS_PRICE)} = <span className="font-bold">{formatCurrency(FUEL_SAVINGS)}</span></div>
            </div>
          </div>
        </div>

       
        {/* <div className="mb-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-lg font-bold mb-2">Value Add-ons</div>
          <div className="w-full">
            <table className="w-full text-xs text-center mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">Brake Plus</th>
                  <th className="px-2 py-1">Safe Guard</th>
                  <th className="px-2 py-1">Protection Package</th>
                  <th className="px-2 py-1">GAP Insurance</th>
                  <th className="px-2 py-1">Service Contract</th>
                  <th className="px-2 py-1">Total Add-ons</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">{formatCurrency(Number(dealData.brakePlus))}</td>
                  <td className="px-2 py-1">{formatCurrency(Number(dealData.safeGuard))}</td>
                  <td className="px-2 py-1">{formatCurrency(Number(dealData.protectionPackage))}</td>
                  <td className="px-2 py-1">{formatCurrency(Number(dealData.gapInsurance))}</td>
                  <td className="px-2 py-1">{formatCurrency(Number(dealData.serviceContract))}</td>
                  <td className="px-2 py-1 font-bold">{formatCurrency(totalAddons)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Cost of Ownership Adjustment - Modern Card Layout */}
        <section className="mb-12 mt-12">
          <div className="max-w-2xl mx-auto rounded-2xl shadow-lg border border-gray-200 bg-white print:border-gray-400 print:bg-white p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 px-8 py-6 border-b border-gray-200 print:bg-white print:border-b-gray-300 flex items-center gap-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-blue-500"><circle cx="12" cy="12" r="10" fill="#e0e7ef"/><path d="M8 13.5l2.5 2.5L16 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">Cost of Ownership Adjustment</div>
                <div className="text-sm text-gray-600 font-medium">Your monthly savings with all included benefits</div>
              </div>
            </div>
            <div className="px-8 py-8 flex flex-col gap-6 print:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-semibold mb-1">WPFL</span>
                  <span className="text-lg font-bold text-blue-700">{formatCurrency(WPFL_SELECTED?.price ?? 0)}</span>
                  <span className="text-xs text-gray-400 mt-1">Warranty Protection</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-semibold mb-1">OCFL</span>
                  <span className="text-lg font-bold text-yellow-600">{formatCurrency(OCFL_MONTHLY_SAVINGS)}</span>
                  <span className="text-xs text-gray-400 mt-1">Oil Change Savings</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-semibold mb-1">Fuel</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(FUEL_SAVINGS)}</span>
                  <span className="text-xs text-gray-400 mt-1">Fuel Savings</span>
                </div>
              </div>
              <div className="flex flex-col items-center mt-2">
                <span className="uppercase text-xs text-gray-500 tracking-widest font-semibold">Total Monthly Savings</span>
                <span className="text-5xl font-extrabold text-blue-800 mt-1 mb-1">{formatCurrency(COST_OF_OWNERSHIP_TOTAL)}</span>
                <span className="text-sm text-gray-700">All benefits included, every month</span>
              </div>
              <div className="mt-2 text-center text-xs text-gray-500 border-t border-gray-200 pt-4 print:border-t-gray-300">
                <span className="font-semibold text-gray-700">What's included:</span> Warranty Protection for Life, Oil Change for Life, and Fuel Savings. <br className="hidden print:block"/>Sunset reduces your cost of ownership by including exclusive benefits you won't find elsewhere.<br className="hidden print:block"/>
                <span className="italic text-blue-700 font-semibold block mt-2">"It's not what you pay, it's what you get."</span>
              </div>
            </div>
          </div>
        </section>
        <div className="flex justify-end mt-8 gap-4 no-print">
          {onBack && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 font-semibold"
              onClick={onBack}
            >
              Back to Offer
            </button>
          )}
          <button
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold flex items-center no-print print-hide"
            onClick={() => window.print()}
          >
            Print Offer
          </button>
        </div>
    </div>
  );
}

export default TradeVsPrivateSale;
