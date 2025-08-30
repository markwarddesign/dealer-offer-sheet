import React, { useState } from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/formatCurrency';
import NumberInput from '../components/NumberInput';

function calculateMonthlyPayment(amount, rate, termMonths) {
  if (!amount || !rate || !termMonths) return 0;
  const monthlyRate = rate / 12 / 100;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
}

const downPaymentOptions = [0, 1000, 2500, 5000, 7500, 10000];
const financeTerms = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];

const FinanceStep = () => {
  const { dealData, updateDealData } = useAppStore();
  // Toggle for showing interest rate on offer sheet
  const showInterestRateOnOfferSheet = dealData.showInterestRateOnOfferSheet ?? false;
  const handleToggleShowInterestRate = () => {
    updateDealData({ showInterestRateOnOfferSheet: !showInterestRateOnOfferSheet });
  };
  // Toggle for showing amount financed on offer sheet
  const showAmountFinancedOnOfferSheet = dealData.showAmountFinancedOnOfferSheet ?? true;
  const handleToggleShowAmountFinanced = () => {
    updateDealData({ showAmountFinancedOnOfferSheet: !showAmountFinancedOnOfferSheet });
  };
  // Use interest rate from dealData, fallback to store default
  const rate = dealData.interestRate !== undefined && dealData.interestRate !== '' ? Number(dealData.interestRate) : 6.99;
  const initialTerms = Array.isArray(dealData.financeTerm)
    ? dealData.financeTerm.map(Number).filter(t => !isNaN(t) && isFinite(t))
    : [];
  const [selectedTerms, setSelectedTerms] = useState(initialTerms.length ? initialTerms : []);
  const initialDowns = Array.isArray(dealData.downPayment)
    ? dealData.downPayment.map(Number).filter(d => !isNaN(d) && isFinite(d))
    : [];
  const [selectedDowns, setSelectedDowns] = useState(initialDowns.length ? initialDowns : []);
  const [customDown, setCustomDown] = useState('');

  const sellingPrice = dealData.sellingPrice || 0;
  const docFee = dealData.docFee || 0;
  const otherFee = dealData.otherFee || 0;

  // Update store when terms/downs change
  const handleTermsChange = (newTerms) => {
    setSelectedTerms(newTerms);
    updateDealData({ financeTerm: newTerms });
  };
  const handleDownsChange = (newDowns) => {
    setSelectedDowns(newDowns);
    updateDealData({ downPayment: newDowns });
  };

  return (
    <FormSection title="Finance Options" icon={null} noGrid={true}>
      <div className='flex flex-col w-full'>
        <div className="flex items-center gap-6 mb-6">
          {/* Sleek Toggle for Interest Rate */}
          <label htmlFor="toggleShowInterestRateOnOfferSheet" className="flex items-center cursor-pointer select-none">
            <div className="relative">
              <input
                id="toggleShowInterestRateOnOfferSheet"
                type="checkbox"
                checked={showInterestRateOnOfferSheet}
                onChange={handleToggleShowInterestRate}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="ml-3 text-base font-medium text-gray-800">Display interest rate on offer sheet</span>
          </label>
          {/* Sleek Toggle for Amount Financed */}
          <label htmlFor="toggleShowAmountFinancedOnOfferSheet" className="flex items-center cursor-pointer select-none">
            <div className="relative">
              <input
                id="toggleShowAmountFinancedOnOfferSheet"
                type="checkbox"
                checked={showAmountFinancedOnOfferSheet}
                onChange={handleToggleShowAmountFinanced}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="ml-3 text-base font-medium text-gray-800">Display Amount Financed on offer sheet</span>
          </label>
        </div>
        <div className="mb-8 w-full">
          <div className="w-full">
            <label className="block text-base font-bold text-gray-800 mb-2">Finance Term (months)</label>
            <div className="flex flex-wrap gap-2 w-full">
              {financeTerms.map(opt => {
                const isSelected = selectedTerms.includes(opt);
                const disableAdd = !isSelected && selectedTerms.length >= 5;
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`px-2 py-1 rounded font-semibold border shadow-sm text-base transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 ${isSelected ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-300' : 'bg-white text-gray-800 border-gray-300 hover:bg-red-50'} ${disableAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      let newTerms;
                      if (isSelected) {
                        newTerms = selectedTerms.filter(t => t !== opt);
                      } else {
                        if (selectedTerms.length >= 5) return;
                        newTerms = [...selectedTerms, opt];
                      }
                      if (newTerms.length === 0) newTerms = [opt];
                      handleTermsChange(newTerms);
                    }}
                    disabled={disableAdd}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full mt-6">
            <label className="block text-base font-bold text-gray-800 mb-2">Down Payment</label>
            <div className="flex flex-wrap gap-2 w-full mb-3">
              {downPaymentOptions.map(opt => {
                const isSelected = selectedDowns.includes(opt);
                const disableAdd = !isSelected && selectedDowns.length >= 4;
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`px-2 py-1 rounded font-semibold border shadow-sm text-base transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 ${isSelected ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-300' : 'bg-white text-gray-800 border-gray-300 hover:bg-red-50'} ${disableAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      let newDowns;
                      if (isSelected) {
                          newDowns = selectedDowns.filter(d => d !== opt);
                        } else {
                          if (selectedDowns.length >= 4) return;
                          newDowns = [...selectedDowns, opt];
                        }
                        if (newDowns.length === 0) newDowns = [0];
                        handleDownsChange(newDowns);
                      }}
                      disabled={disableAdd}
                    >
                      ${opt.toLocaleString()}
                    </button>
                );
              })}
              </div>
              <div className="flex items-center gap-2 mt-2 w-full">
                <label htmlFor="customDownPayment" className="text-sm text-gray-700">Custom:</label>
                <NumberInput
                  id="customDownPayment"
                  min="0"
                  step="100"
                  className="w-40 px-3 py-2 rounded border border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                  value={customDown}
                  placeholder="Other..."
                  onChange={e => {
                    const val = e.target.value;
                    setCustomDown(val === null ? '' : val);
                    let newDowns = selectedDowns.filter(d => !downPaymentOptions.includes(d));
                    if (val !== null && val > 0) {
                      // Only add custom if not exceeding 4 total
                      const baseDowns = downPaymentOptions.filter(d => selectedDowns.includes(d));
                      if (baseDowns.length + 1 > 4) return;
                      newDowns = [...baseDowns, val];
                    } else {
                      newDowns = downPaymentOptions.filter(d => selectedDowns.includes(d));
                      if (newDowns.length === 0) newDowns = [0];
                    }
                    handleDownsChange(newDowns);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="w-full mt-12">
            <div className="flex flex-row justify-between">
            {dealData.rebates != null && dealData.rebates !== '' && !isNaN(Number(dealData.rebates)) && Number(dealData.rebates) !== 0 && (
              <div className="mb-2 text-left text-sm text-blue-700 font-semibold">
                Rebates: <span className="text-blue-900">{formatCurrency(Number(dealData.rebates))}</span>
              </div>
            )}
            {dealData.showInterestRateOnOfferSheet && (
              <div className="mb-2 text-right text-sm text-gray-700 font-semibold">
                Interest Rate: <span className="text-red-700">{(Number(dealData.interestRate) || 6.99).toFixed(2)}%</span>
              </div>
            )}
          </div>
            <div className="w-full">
              <table className="w-full text-xs text-center rounded-xl shadow-lg border border-gray-200 bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 border-b border-gray-200 font-bold text-gray-700">Down Payment</th>
                    <th className="px-4 py-3 border-b border-gray-200 font-bold text-gray-700">Term (mo)</th>
                    <th className="px-4 py-3 border-b border-gray-200 font-bold text-gray-700">Amount Financed</th>
                    <th className="px-4 py-3 border-b border-gray-200 font-bold text-gray-700">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // If nothing selected, fallback to 72 months and $0 down
                    const terms = selectedTerms.length ? selectedTerms : [72];
                    const downs = selectedDowns.length ? selectedDowns : [0];
                    // Sort for clarity
                    const sortedTerms = [...terms]
                      .map(t => Number(t))
                      .filter(t => !isNaN(t) && isFinite(t))
                      .sort((a, b) => a - b);
                    const sortedDowns = [...downs].map(d => Number(d)).filter(d => !isNaN(d) && isFinite(d)).sort((a, b) => a - b);
                    const rows = [];
                    sortedDowns.forEach((down, dIdx) => {
                      let amountFinanced;
                      sortedTerms.forEach((term, tIdx) => {
                        amountFinanced = sellingPrice - down + docFee + otherFee;
                        const payment = calculateMonthlyPayment(amountFinanced, rate, term);
                        rows.push(
                          <tr
                            key={down + '-' + term}
                            className={
                              'transition-all duration-150 ' +
                              ((dIdx + tIdx) % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                            }
                          >
                            {/* Down payment cell only on first row of group, else empty cell for alignment */}
                            {tIdx === 0 ? (
                              <td rowSpan={sortedTerms.length} className="px-4 py-3 font-bold border-b border-gray-100 text-gray-700 align-middle whitespace-nowrap">{down === 0 ? 'Financed' : `$${down.toLocaleString()}`}</td>
                            ) : (
                              <td style={{ display: 'none' }}></td>
                            )}
                            <td className="px-4 py-3 align-top border-b border-gray-100 text-gray-600 whitespace-nowrap">{term}</td>
                            <td className="px-4 py-3 align-top border-b border-gray-100 text-gray-600 whitespace-nowrap">${amountFinanced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className={"px-4 py-3 align-top border-b border-gray-100 font-extrabold text-lg text-gray-900 whitespace-nowrap"}>{`$${payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                          </tr>
                        );
                      });
                    });
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </FormSection>
  );
};

export default FinanceStep;
