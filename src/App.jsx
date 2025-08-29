import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { ShieldCheck, Car, Wrench, User, FileText, DollarSign, PlusCircle, ClipboardList, Settings as SettingsIcon } from 'lucide-react';
import SettingsPage from './pages/SettingsPage';
import { formatCurrency } from './utils/formatCurrency';
import LoginPage from './components/LoginPage';
import { isAuthenticated, logout } from './utils/auth';
import TradeVsPrivateSale from './components/TradeVsPrivateSale';
import BuyerInfoStep from './steps/BuyerInfoStep';
import VehicleInfoStep from './steps/VehicleInfoStep';
import PricingStep from './steps/PricingStep';
import TradeStep from './steps/TradeStep';
import FeesStep from './steps/FeesStep';
import AddonsStep from './steps/AddonsStep';
import FinanceStep from './steps/FinanceStep';
import SteppedForm from './components/SteppedForm';
import Sidebar from './components/Sidebar';

// --- Helper Functions & Initial State ---

// ...formatCurrency now imported from utils/formatCurrency.js...

// Helper function to round to the nearest hundredth
const roundToHundredth = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

// B&O Tax Rate constant
const BO_TAX_RATE = 0.00471; // 0.471%






// --- Page 2: Offer Sheet ---

const OfferSheet = ({ dealData, onGoBack, settings, onShowTradeVsPrivate }) => {
    // --- DYNAMIC CALCULATIONS ---
    let sellingPrice, roiPercentage, profit;
    const reconditioningCost = dealData.isNewVehicle ? 0 : dealData.reconditioningCost;
    const baseInvestment = roundToHundredth(dealData.acquisitionCost + reconditioningCost + dealData.advertisingCost + dealData.flooringCost);

    if (dealData.sellingPrice > 0) {
        // Scenario 1: Selling Price was entered manually. Calculate ROI from it.
        sellingPrice = roundToHundredth(dealData.sellingPrice);
        const boTax = roundToHundredth(sellingPrice * BO_TAX_RATE);
        const dealershipInvestment = roundToHundredth(baseInvestment + boTax);
        profit = roundToHundredth(sellingPrice - dealershipInvestment);
        roiPercentage = baseInvestment > 0 ? roundToHundredth((profit / baseInvestment) * 100) : 0;
    } else {
        // Scenario 2: Selling Price is 0, so calculate it from the ROI percentage.
        roiPercentage = dealData.roiPercentage;
        sellingPrice = roundToHundredth((baseInvestment * (1 + roiPercentage / 100)) / (1 - BO_TAX_RATE));
        const boTax = roundToHundredth(sellingPrice * BO_TAX_RATE);
        const dealershipInvestment = roundToHundredth(baseInvestment + boTax);
        profit = roundToHundredth(sellingPrice - dealershipInvestment);
    }

    // --- Trade Devalue Calculation ---
    let totalTradeDevalue = 0;
    if (dealData.tradeDevalueSelected && settings && settings.tradeDevalueItems) {
      totalTradeDevalue = dealData.tradeDevalueSelected.reduce((sum, idx) => sum + (settings.tradeDevalueItems[idx]?.price || 0), 0);
    }
  // Net Trade should match TradeStep Net Trade Equity: tradeValue - tradePayOff
  const netTrade = roundToHundredth(dealData.tradeValue - dealData.tradePayOff);
    // Use dealData value if set, else fallback to store default
    const getAddon = (key, fallback = 0) => {
      const val = dealData[key];
      return val !== undefined && val !== '' ? Number(val) : fallback;
    };
    const totalAddons = roundToHundredth(
      (settings?.showProtectionPackage ? getAddon('protectionPackage', 0) : 0) +
      (settings?.showGapInsurance ? getAddon('gapInsurance', 0) : 0) +
      (settings?.showServiceContract ? getAddon('serviceContract', 0) : 0) +
      getAddon('brakePlus', 0) +
      getAddon('safeGuard', 0)
    );
    
    // If trade-in is a lease, tax is on full selling price + add-ons (no trade deduction)
    let taxableAmount;
    if (dealData.tradeIsLease) {
        taxableAmount = sellingPrice + totalAddons;
    } else {
        taxableAmount = sellingPrice + totalAddons - dealData.tradeValue;
    }
    const difference = roundToHundredth(taxableAmount);
    
    const salesTax = difference > 0 ? roundToHundredth(difference * (dealData.taxRate / 100)) : 0;

    
  // Remove tax credit from calculations
  const licenseEstimate = Number(dealData.licenseEstimate) || 0;

  console.log(dealData.tradePayOff);

  const totalAmountFinanced = roundToHundredth(
    Number(difference) +
    (Number(dealData.tradePayOff) || 0) +
    (Number(dealData.docFee) || 0) +
    (Number(licenseEstimate) || 0) +
    (Number(salesTax) || 0)
  );

  // Restore sunsetExclusives
  const sunsetExclusives = [
    { icon: <ShieldCheck className="h-8 w-8 text-blue-600" />, title: 'Warranty Protection for Life', description: 'A lifetime limited powertrain warranty honored at any ASE certified facility in the US and Canada.' },
    { icon: <Wrench className="h-8 w-8 text-blue-600" />, title: 'Oil Changes for Life', description: 'Save thousands over the lifetime of your vehicle with complimentary oil changes.' }
  ];

    // --- Finance Options Section ---
    // Support both array and single value for financeTerm and downPayment
    const selectedTerms = Array.isArray(dealData.financeTerm)
      ? dealData.financeTerm.filter(t => !isNaN(Number(t))).map(Number)
      : [Number(dealData.financeTerm)].filter(t => !isNaN(t));
    const selectedDowns = Array.isArray(dealData.downPayment)
      ? dealData.downPayment.filter(d => !isNaN(Number(d))).map(Number)
      : [Number(dealData.downPayment)].filter(d => !isNaN(d));
    const financeRate = 6.99;
    const financeTableRows = [];
    const docFee = dealData.docFee || 0;
    const otherFee = dealData.otherFee || 0;
    const sellingPriceForFinance = dealData.sellingPrice || 0;
    const calculateMonthlyPayment = (amount, rate, termMonths) => {
      if (!amount || !rate || !termMonths) return 0;
      const monthlyRate = rate / 12 / 100;
      return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    };
    // Grouped by down payment
    const sortedTerms = [...selectedTerms].sort((a, b) => a - b);
    const sortedDowns = [...selectedDowns].sort((a, b) => a - b);
    sortedDowns.forEach((down) => {
      sortedTerms.forEach((term) => {
        const amountFinanced = totalAmountFinanced - down || sellingPriceForFinance - down + docFee + otherFee;
        const payment = calculateMonthlyPayment(totalAmountFinanced, financeRate, term);
        financeTableRows.push({
          down,
          term,
          amountFinanced,
          payment
        });
      });
    });


    return (
  <div className="space-y-8 offer-sheet">
        {/* Price display in top right */}
        {/* <div className="flex justify-end mb-2">
          <div className="bg-white rounded-lg shadow px-6 py-3 text-right border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Final Price</div>
            <div className="text-2xl font-extrabold text-red-600">{formatCurrency(sellingPrice)}</div>
          </div>
        </div> */}
        <div className="bg-white rounded-xl shadow-lg p-8 printable-section">
          <div className="flex flex-row flex-wrap justify-between items-start mb-8 gap-6 mx-4">
            <div>
              <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">{dealData.vehicleYear} {dealData.vehicleMake}</div>
              <h2 className="block mt-1 text-3xl leading-tight font-extrabold text-black">{dealData.vehicleModel}</h2>
              <div className="mt-2 text-gray-700 text-sm grid grid-cols-2 gap-x-8 gap-y-1">
                <div className="flex flex-col sm:flex-row gap-y-1 sm:gap-x-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                    <span className="font-semibold">VIN:</span>
                    <span className="break-all">{dealData.vehicleVin}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                    <span className="font-semibold">Stock #:</span>
                    <span>{dealData.vehicleStock}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-y-1 sm:gap-x-8 mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                    <span className="font-semibold">Color:</span>
                    <span>{dealData.vehicleColor}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                    <span className="font-semibold">Mileage:</span>
                    <span>{dealData.vehicleMileage?.toLocaleString()} mi</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right mt-6 md:mt-0">
              <p className="text-lg text-gray-700">Prepared for:</p>
              <p className="text-xl font-bold">{dealData.buyerFirstName} {dealData.buyerLastName}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
            {/* Pricing Transparency */}
            <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:col-span-1 w-full md:w-auto print:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Pricing Transparency</h3>
              <div className="space-y-5 text-gray-700">
                <div className="flex justify-between text-base"><p>Market Value</p><p className="font-semibold">{formatCurrency(dealData.marketValue)}</p></div>
                <div className="flex justify-between text-sm"><p>Acquisition Cost</p><p>{formatCurrency(dealData.acquisitionCost)}</p></div>
                {!dealData.isNewVehicle && (
                <div className="flex justify-between text-sm items-start">
                  <div>
                    <p>Reconditioning Cost</p>
                   
                  </div>
                  <p className="text-right">{formatCurrency(dealData.reconditioningCost)}</p>
                </div>
                )}
                <div className="flex justify-between text-sm items-end">
                  <div>
                    <p>Advertising</p>
                    <span className="block text-[10px] text-gray-500">Avg: $600–$900 per vehicle</span>
                  </div>
                  <p>{formatCurrency(dealData.advertisingCost)}</p>
                </div>
                <div className="flex justify-between text-sm items-end">
                  <div>
                    <p>Flooring</p>
                    <span className="block text-[10px] text-gray-500">Avg: $300–$500 per vehicle</span>
                  </div>
                  <p>{formatCurrency(dealData.flooringCost)}</p>
                </div>
                <div className="flex justify-between text-sm"><p>B&O Tax (Calculated)</p><p>{formatCurrency(roundToHundredth(sellingPrice * BO_TAX_RATE))}</p></div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2"><p className="font-semibold">Total Investment</p><p className="font-bold">{formatCurrency(roundToHundredth(baseInvestment + (sellingPrice * BO_TAX_RATE)))}</p></div>
                <div className="flex justify-between"><p>ROI ({roiPercentage}%)</p><p className="font-medium">{formatCurrency(profit)}</p></div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-inner mt-2">
                  <p className="text-base font-bold text-gray-900">Adjusted Price</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(sellingPrice)}</p>
                </div>
                {/* Value Add-ons itemized */}
                <div className="flex justify-between text-sm py-1 border-b border-gray-100 font-semibold text-gray-700"><p>Value Add-ons</p><p></p></div>
                <div className="pl-4">
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Brake Plus</span><span>{formatCurrency(getAddon('brakePlus', 499))}</span></div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Safe Guard</span><span>{formatCurrency(getAddon('safeGuard', 249))}</span></div>
                  {settings?.showProtectionPackage && (
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Protection Package</span><span>{formatCurrency(getAddon('protectionPackage', 0))}</span></div>
                  )}
                  {settings?.showGapInsurance && (
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>GAP Insurance</span><span>{formatCurrency(getAddon('gapInsurance', 0))}</span></div>
                  )}
                  {settings?.showServiceContract && (
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Extended Service Contract</span><span>{formatCurrency(getAddon('serviceContract', 0))}</span></div>
                  )}
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100 font-bold"><span>Total Add-ons</span><span>{formatCurrency(totalAddons)}</span></div>
                </div>

                {/* <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-inner mt-2">
                  <p className="text-base font-bold text-gray-900">Subtotal</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(sellingPrice + totalAddons)}</p>
                </div>

                {dealData.hasTrade && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Trade Value</p><p>{formatCurrency(dealData.tradeValue)}</p></div>
                  </>
                )} */}
                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Doc Fee</p><p>{formatCurrency(dealData.docFee)}</p></div>
                {dealData.showLicenseFeeOnOfferSheet && (
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>License Estimate</p><p>{formatCurrency(dealData.licenseEstimate)}</p></div>
                )}
                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Other Fees</p><p>{formatCurrency(dealData.titleFee + dealData.tireFee + dealData.otherFee)}</p></div>
                {dealData.showTaxRateOnOfferSheet && (
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Sales Tax ({dealData.taxRate}%)</p><p>{formatCurrency(salesTax)}</p></div>
                )}
                {dealData.isNewVehicle && <div className="flex justify-between text-sm text-blue-700"><p>Rebates</p><p>({formatCurrency(dealData.rebates)})</p></div>}
              </div>
            </div>
            {/* Finance Table + Trade Breakdown stacked */}
            <div className="flex flex-col gap-6 w-full md:w-auto print:col-span-1">
              {dealData.hasTrade && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex flex-col">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Trade Breakdown</h3>
                  {/* Prominent Trade Vehicle Card */}
                  <div className="mb-4 p-4 rounded-lg bg-white border border-blue-300 shadow flex flex-col gap-1">
                    <div className="text-lg font-bold text-blue-900 flex flex-wrap items-center gap-2">
                      {dealData.tradeVehicleYear} {dealData.tradeVehicleMake} {dealData.tradeVehicleModel}
                      {dealData.tradeVehicleTrim && <span className="ml-1 text-base font-semibold text-blue-700">{dealData.tradeVehicleTrim}</span>}
                    </div>
                    <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-1 mt-1">
                      <span><span className="font-semibold">VIN:</span> {dealData.tradeVehicleVin || '-'}</span>
                      <span><span className="font-semibold">MPG:</span> {dealData.tradeVehicleMpg ? dealData.tradeVehicleMpg : '-'}{dealData.tradeVehicleMpg ? ' mpg' : ''}</span>
                      <span><span className="font-semibold">Lease:</span> {dealData.tradeIsLease ? 'Yes' : 'No'}</span>
                      <span><span className="font-semibold">Current Payment:</span> {dealData.tradePayment ? formatCurrency(dealData.tradePayment) : '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-800">
                    <div className="flex justify-between text-sm"><span>Market Value</span><span>{formatCurrency(dealData.tradeMarketValue)}</span></div>
                    <div className="flex justify-between text-sm"><div><span>Reconditioning</span><br />
                    
                       {/* Sub-items for checked Trade Devalue Items */}
                    {dealData.tradeDevalueSelected && settings && settings.tradeDevalueItems && dealData.tradeDevalueSelected.length > 0 && (
                      <ul className="ml-4 mt-1 text-xs text-gray-600 list-disc">
                        {dealData.tradeDevalueSelected.map(idx => {
                          const item = settings.tradeDevalueItems[idx];
                          if (!item) return null;
                          return (
                            <li key={idx} className="flex justify-between">
                              <span>{item.label}</span>
                              <span className="ml-2">{formatCurrency(item.price)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}</div>
                    <span>({formatCurrency(totalTradeDevalue)})</span>
                    </div>
                    <div className="flex justify-between text-sm"><span>Trade Value</span><span>{formatCurrency(dealData.tradeValue)}</span></div>
                    <div className="flex justify-between text-sm"><span>Payoff</span><span>({formatCurrency(dealData.tradePayOff)})</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-2 mt-2 text-blue-900"><span>Net Trade</span><span>{formatCurrency(netTrade)}</span></div>
                  </div>
                </div>
              )}

              {/* ADD Amount Financed in its own box, controlled by toggle */}
              {dealData.showAmountFinancedOnOfferSheet && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex justify-between align-middle">
                  <h3 className="text-xl font-bold text-blue-900">Amount Financed</h3>
                  <div className="text-2xl font-semibold text-blue-900">{formatCurrency(totalAmountFinanced)}</div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex flex-col mb-0">
                <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Financing Options</h3>
                <div className="flex flex-row justify-between">
                   {dealData.rebates != null && dealData.rebates !== '' && !isNaN(Number(dealData.rebates)) && Number(dealData.rebates) !== 0 && (
                      <div className="mb-2 text-left text-sm text-blue-700 font-semibold">
                        Rebates: <span className="text-blue-900">{formatCurrency(Number(dealData.rebates))}</span>
                      </div>
                    )}
                    {dealData.showInterestRateOnOfferSheet && (
                      <div className="mb-2 text-right text-sm text-gray-700 font-semibold">
                        Interest Rate: <span className="text-red-700">{(dealData.interestRate ?? 6.99).toFixed(2)}%</span>
                      </div>
                    )}
                </div>
               
                <div className="w-full">
                  <table className="w-full text-xs text-center rounded-xl shadow border border-gray-200 bg-white overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700 rounded-tl-xl">Down</th>
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700">Term</th>
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700">Financed</th>
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700 rounded-tr-xl">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grouped = {};
                        financeTableRows.forEach(row => {
                          if (!grouped[row.down]) grouped[row.down] = [];
                          grouped[row.down].push(row);
                        });
                        const downs = Object.keys(grouped).map(Number).sort((a, b) => a - b);
                        let rowIdx = 0;
                        return downs.flatMap(down => {
                          const rows = grouped[down];
                          return rows.map((row, tIdx) => {
                            const isGroupFirst = tIdx === 0;
                            const isGroupLast = tIdx === rows.length - 1;
                            const groupBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                            const tr = (
                              <tr
                                key={row.down + '-' + row.term}
                                className={groupBg + ' transition hover:bg-blue-50'}
                              >
                                {isGroupFirst ? (
                                  <td
                                    rowSpan={rows.length}
                                    className={'px-2 py-2 font-semibold text-gray-700 align-middle whitespace-nowrap border-r border-gray-100 bg-gray-50 rounded-l-xl ' + (rows.length > 1 ? 'border-t-2 border-b-2 border-gray-200' : '')}
                                  >
                                    {row.down === 0 ? 'Financed' : `$${row.down.toLocaleString()}`}
                                  </td>
                                ) : null}
                                <td className={'px-2 py-2 text-gray-600 border-r border-gray-100' + (isGroupFirst ? ' border-t-2 border-gray-200' : '') + (isGroupLast ? ' border-b-2 border-gray-200' : '')}>{row.term}</td>
                                <td className={'px-2 py-2 text-gray-600 border-r border-gray-100' + (isGroupFirst ? ' border-t-2 border-gray-200' : '') + (isGroupLast ? ' border-b-2 border-gray-200' : '')}>${row.amountFinanced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className={'px-2 py-2 font-bold text-blue-900 bg-blue-50 rounded-r-xl' + (isGroupFirst ? ' border-t-2 border-gray-200' : '') + (isGroupLast ? ' border-b-2 border-gray-200' : '')}>${row.payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              </tr>
                            );
                            return tr;
                          });
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Print-only signature box at the bottom of the offer sheet */}
        <div className="print-only mt-16 flex flex-col items-center w-full">
          <div className="w-full max-w-lg border-t-2 border-gray-400 pt-8 mt-8" style={{ minHeight: '80px' }}>
            <div className="flex flex-row justify-between items-end w-full">
              <div className="flex-1">
                <div className="border-b border-gray-400 w-full mb-2" style={{ minWidth: '200px', minHeight: '2.5em' }}></div>
                <div className="text-xs text-gray-700 text-left">Customer Signature</div>
              </div>
              <div className="flex-1 ml-8">
                <div className="border-b border-gray-400 w-full mb-2" style={{ minWidth: '120px', minHeight: '2.5em' }}></div>
                <div className="text-xs text-gray-700 text-left">Date</div>
              </div>
            </div>
          </div>
        </div>

      <div className="bg-blue-50 p-8 rounded-xl border border-blue-200 printable-section sunset-exclusives-section no-print">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Sunset Exclusives</h3>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Buying at Sunset Chevrolet gets you more. A lot more.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sunsetExclusives.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-md">
                {benefit.icon}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{benefit.title}</h4>
                <p className="text-gray-600 mt-1">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

            <div className="flex flex-col items-center pt-4 space-y-2 no-print mb-9">
                <div className="flex space-x-4">
                  <button onClick={onGoBack} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 print-hide">
                      Go Back & Edit
                  </button>
                  {/* <button onClick={() => window.print()} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                      <Printer className="h-5 w-5 mr-2" />
                      Print Offer
                  </button> */}
                  {dealData.hasTrade && (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold"
                      onClick={onShowTradeVsPrivate}
                    >
                      Show Trade vs Private Sale
                    </button>
                  )}
                </div>
            </div>
        </div>
    );
};

// --- TabbedForm Component ---



// --- Main App Component ---
export default function App() {
  const {
    page,
    setPage,
    dealData,
    setDealData,
    settings,
    setSettings,
  } = useAppStore();

  const [authed, setAuthed] = useState(isAuthenticated());
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) setAuthed(false);
  }, []);

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  if (!authed) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe20azLghiq6B4uoUgyV5A_j5zjglEyeNF9g&s";

  const handleGenerateOffer = () => {
    setPage('offer');
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    setPage('form');
    window.scrollTo(0, 0);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Sidebar activeStep={activeStep} onStepClick={handleStepChange} />
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
      <main className="max-w-7xl container mx-auto p-4 sm:p-6 md:p-8">
        {page === 'form' && (
          <SteppedForm
            dealData={dealData}
            setDealData={setDealData}
            onGenerateOffer={handleGenerateOffer}
            settings={settings}
            setSettings={setSettings}
            activeStep={activeStep}
            onStepChange={handleStepChange}
          />
        )}
        {(page === 'offer' || page === 'trade-vs-private') && <OfferSheet dealData={dealData} onGoBack={handleGoBack} settings={settings} onShowTradeVsPrivate={() => setPage('trade-vs-private')} />}
        {page === 'trade-vs-private' && <TradeVsPrivateSale dealData={dealData} settings={settings} onBack={() => setPage('offer')} />}
        {page === 'settings' && <SettingsPage onBack={() => setPage('form')} />}
        
      </main>
    </div>
  );
}
