
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
  // --- Add-ons Calculation ---
  const totalAddons =
    Number(dealData.brakePlus) +
    Number(dealData.safeGuard) +
    Number(dealData.protectionPackage) +
    Number(dealData.gapInsurance) +
    Number(dealData.serviceContract);
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
  const tradePayoff = Number(dealData.tradePayoff) || 0;
  const tradeValue = Number(dealData.tradeValue) || 0;
  // Removed unused totalDevalue variable
  const netTrade = tradeValue - tradePayoff;

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
    <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-8 mb-12 print:mb-0 print:break-before-page max-w-4xl mx-auto print:p-4 print:shadow-none print:max-w-full print:text-sm print:leading-tight trade-vs-private-print-main">
      <h2 className="text-2xl font-bold mb-6 text-center">Trade-In vs Private Sale Breakdown</h2>
      <div className="mb-8 text-center text-lg text-gray-700">
        <span className="font-bold text-green-700">Trading in your vehicle</span> typically results in <span className="font-bold text-green-700">more money in your pocket</span> compared to selling it privately, once you factor in taxes, advertising, and holding costs.
      </div>

      {/* --- Combined Trade & Sale Comparison Section --- */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trade Option (Top) */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center">
          <div className="text-lg font-bold mb-2">Trade Option</div>
          <div className="w-full flex flex-col items-center mb-4">
            <div className="text-5xl font-extrabold text-green-700 mb-2">{formatCurrency(tradeValue)}</div>
            <div className="text-3xl font-bold text-green-800 mb-2 flex items-center">+ Tax Credit&nbsp;
              <span className="text-green-700">{formatCurrency(tradeValue * TAX_RATE)}</span>
            </div>
            <div className="mt-6">
            <div className="font-semibold text-green-800 mb-2">Pros:</div>
            <ul className="list-disc pl-5 text-green-900 text-sm space-y-1">
              <li>Immediate tax credit (reduces sales tax on your new purchase)</li>
              <li>No advertising or marketing costs</li>
              <li>No waiting period—get paid instantly</li>
              <li>No risk of additional payments or insurance</li>
              <li>Simple, safe, and fast transaction</li>
            </ul>
          </div>
          </div>
         
        </div>
    

            {/* Sell Option (Top) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center">
            <div className="text-lg font-bold mb-2">Sell Option</div>
            <div className="w-full flex flex-col items-center mb-4">
              <div className="text-5xl font-extrabold text-blue-700 mb-2">{(() => {
                const adCost = AVG_AD_COST;
                const holdingCost = MONTHLY_PAYMENT * selectedMonths;
                const numerator = netTrade + tradePayoff + adCost + holdingCost - netTrade * TAX_RATE;
                const requiredSalePrice = numerator / (1 - TAX_RATE);
                return formatCurrency(Math.ceil(requiredSalePrice));
              })()}</div>
              <div className="mt-4 text-sm font-semibold text-blue-800">Required Sale Price to Match Trade Value</div>

            </div>
            <div className="mt-4">
              <div className="font-semibold text-blue-800 mb-2">Cons:</div>
              <ul className="list-disc pl-5 text-blue-900 text-sm space-y-1">
                <li>No tax credit ({formatCurrency(tradeValue * TAX_RATE)})</li>
                <li>Must market and advertise yourself</li>
                <li className="!list-none !pl-0">
                  <div className="my-2">
                    <div className="font-semibold text-blue-800 mb-1">Payments While Selling:</div>
                    <button
                          type="button"
                          key={'today'}
                          onClick={() => setSelectedMonths(0)}
                          className={
                            selectedMonths === 0
                              ? 'bg-blue-900 text-white rounded p-2 ring-2 ring-blue-700 mb-2 w-full'
                              : 'bg-blue-100 text-blue-900 rounded p-2 hover:bg-blue-200 mb-2 w-full'
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="font-bold">Today</div>
                          <div>{formatCurrency(MONTHLY_PAYMENT * 0)}</div>
                        </button>
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                      {[1,2,3].map((mo) => (
                        <button
                          type="button"
                          key={mo}
                          onClick={() => setSelectedMonths(mo)}
                          className={
                            selectedMonths === mo
                              ? 'bg-blue-900 text-white rounded p-2 ring-2 ring-blue-700'
                              : 'bg-blue-100 text-blue-900 rounded p-2 hover:bg-blue-200'
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="font-bold">{mo} mo</div>
                          <div>{formatCurrency(MONTHLY_PAYMENT * mo)}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                      <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-6 py-2 shadow font-semibold text-yellow-900 flex flex-col items-center">
                        <span className="text-xs font-bold uppercase tracking-wide"># in Market</span>
                        <span className="text-lg">{vehiclesInMarket}</span>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-6 py-2 shadow font-semibold text-yellow-900 flex flex-col items-center">
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

      {/* OCFL Savings Table */}
      {dealData.ocfl && (
        <div className="mb-10 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-lg font-bold mb-2">Oil Change for Life (OCFL) Savings</div>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[400px] text-xs text-center mb-2">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="px-2 py-1">Oil Change Cost</th>
                  <th className="px-2 py-1">Per Year</th>
                  <th className="px-2 py-1">Yearly Savings</th>
                  <th className="px-2 py-1">Monthly Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">{formatCurrency(OIL_CHANGE_COST)}</td>
                  <td className="px-2 py-1">{OCFL_YEARS}</td>
                  <td className="px-2 py-1">{formatCurrency(OCFL_TOTAL_SAVINGS)}</td>
                  <td className="px-2 py-1">{formatCurrency(OCFL_MONTHLY_SAVINGS)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WPFL Table */}
      {dealData.wpfl && WPFL_OPTIONS.length > 0 && (
        <div className="mb-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-lg font-bold mb-2">{WPFL_NAME} Monthly Cost</div>
          <div className="w-full">
            <table className="w-full text-xs text-center mb-2">
              <thead>
                <tr className="bg-gray-100">
                  {WPFL_OPTIONS.map((opt, idx) => (
                    <th key={idx} className="px-2 py-1">{opt.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {WPFL_OPTIONS.map((opt, idx) => (
                    <td key={idx} className="px-2 py-1">{formatCurrency(opt.price)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fuel Savings Table */}
      <div className="mb-10 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-lg font-bold mb-2">Fuel Savings</div>
  <div className="w-full">
  <table className="w-full text-xs text-center mb-2">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">MPG</th>
              <th className="px-2 py-1">Miles</th>
              <th className="px-2 py-1">Gal/mo</th>
              <th className="px-2 py-1">$/Gal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 font-semibold">New Vehicle</td>
              <td className="px-2 py-1">{Number(dealData.vehicleMpg) || 28}</td>
              <td className="px-2 py-1">{MILES_PER_MONTH}</td>
              <td className="px-2 py-1">{NEW_GALLONS.toFixed(1)}</td>
              <td className="px-2 py-1">{formatCurrency(GAS_PRICE)}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-semibold">Trade-In</td>
              <td className="px-2 py-1">{Number(dealData.tradeVehicleMpg) || 19}</td>
              <td className="px-2 py-1">{MILES_PER_MONTH}</td>
              <td className="px-2 py-1">{TRADE_GALLONS.toFixed(1)}</td>
              <td className="px-2 py-1">{formatCurrency(GAS_PRICE)}</td>
            </tr>
          </tbody>
  </table>
  </div>
        {NET_MPG >= 0 && (
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-0 sm:justify-between sm:items-center mt-2 text-blue-900 font-semibold text-center sm:text-left">
            <span>Net Savings</span>
            <span>MPG: {NET_MPG > 0 ? '+' : ''}{NET_MPG}</span>
            <span>Gallons: {NET_GALLONS.toFixed(1)}</span>
            <span>Monthly: {formatCurrency(FUEL_SAVINGS)}</span>
          </div>
        )}
      </div>

      {/* Add-ons Table */}
      <div className="mb-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
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
      </div>

      {/* Cost of Ownership Adjustment Table */}
      <div className="mb-10 bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-lg font-bold mb-2">Cost of Ownership Adjustment</div>
        <div className="w-full">
          <table className="w-full text-xs text-center mb-2">
            <thead>
              <tr className="bg-green-100">
                <th className="px-2 py-1">WPFL</th>
                <th className="px-2 py-1">OCFL</th>
                <th className="px-2 py-1">Fuel Savings</th>
                <th className="px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1">{formatCurrency(WPFL_SELECTED?.price ?? 0)}</td>
                <td className="px-2 py-1">{formatCurrency(OCFL_MONTHLY_SAVINGS)}</td>
                <td className="px-2 py-1">{formatCurrency(FUEL_SAVINGS)}</td>
                <td className="px-2 py-1 font-bold">{formatCurrency((WPFL_SELECTED?.price ?? 0) + OCFL_MONTHLY_SAVINGS + FUEL_SAVINGS)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost of Ownership Adjustment Summary Box */}
      <div className="mt-10 bg-green-50 border-2 border-green-400 rounded-xl p-8 text-center shadow-lg">
        <div className="text-2xl font-bold text-green-900 mb-3">Cost of Ownership Adjustment</div>
        <div className="text-lg text-green-800 mb-2">Includes Warranty Protection for Life, Oil Change for Life, and Fuel Savings</div>
        <div className="text-4xl font-extrabold text-green-700 mb-2">{formatCurrency(COST_OF_OWNERSHIP_TOTAL)} / mo.</div>
  <div className="text-base text-gray-700 mb-2">This is your estimated total monthly savings with all ownership benefits included.</div>
  <div className="text-base text-green-900 font-semibold mb-1">Sunset reduces your cost of ownership by including exclusive benefits you won't find elsewhere.</div>
  <div className="italic text-green-800 text-lg font-bold mt-2">"It's not what you pay, it's what you get."</div>
      </div>
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
          className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold flex items-center"
          onClick={() => window.print()}
        >
          Print Offer
        </button>
      </div>
    </div>
  );
}

export default TradeVsPrivateSale;
