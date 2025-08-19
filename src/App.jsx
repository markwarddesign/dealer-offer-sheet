import React, { useState } from 'react';
import { ShieldCheck, Car, Wrench, Coins, User, FileText, DollarSign, PlusCircle, ClipboardList, Printer } from 'lucide-react';

// --- Helper Functions & Initial State ---

// Helper function to format currency
const formatCurrency = (amount) => {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

// Helper function to round to the nearest hundredth
const roundToHundredth = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

// B&O Tax Rate constant
const BO_TAX_RATE = 0.00471; // 0.471%

// Initial state for the form data reflecting the new items
const initialDealData = {
  // Buyer Info
  buyerFirstName: 'John',
  buyerLastName: 'Appleseed',
  buyerPhone: '555-123-4567',
  buyerEmail: 'john.appleseed@email.com',
  // Vehicle Info
  vehicleYear: 2024,
  vehicleMake: 'Chevrolet',
  vehicleModel: 'Silverado 1500',
  vehicleVin: 'VIN123456789XYZ',
  vehicleStock: 'C12345',
  vehicleColor: 'Summit White',
  vehicleMileage: 12,
  // Dealership Costs
  marketValue: 45788.00,
  acquisitionCost: 38244,
  reconditioningCost: 2650,
  advertisingCost: 675,
  flooringCost: 382.63,
  // Flexible inputs
  sellingPrice: 43477, // Can be 0 to trigger auto-calc
  roiPercentage: 5, // Used if sellingPrice is 0
  // Customer-facing numbers
  rebates: 0,
  tradeValue: 12000,
  tradePayoff: 6250,
  // Fees
  docFee: 200,
  titleFee: 0,
  tireFee: 0,
  licenseEstimate: 675,
  otherFee: 0,
  // Add-ons
  protectionPackage: 0,
  gapInsurance: 0,
  serviceContract: 0,
  brakePlus: 499,
  safeGuard: 249,
  // Tax
  taxRate: 9.8,
};

// --- Reusable Components ---

const FormSection = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
            {icon}
            {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', helpText }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <input
                type={type}
                name={name}
                id={name}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

// --- Page 1: Data Entry Form ---

const DataEntryForm = ({ dealData, setDealData, onGenerateOffer }) => {

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setDealData(prevData => ({
            ...prevData,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerateOffer();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection title="Buyer Information" icon={<User className="h-6 w-6 mr-3 text-red-600" />}>
                <InputField label="First Name" name="buyerFirstName" value={dealData.buyerFirstName} onChange={handleChange} />
                <InputField label="Last Name" name="buyerLastName" value={dealData.buyerLastName} onChange={handleChange} />
                <InputField label="Phone" name="buyerPhone" value={dealData.buyerPhone} onChange={handleChange} type="tel" />
                <InputField label="Email" name="buyerEmail" value={dealData.buyerEmail} onChange={handleChange} type="email" />
            </FormSection>

            <FormSection title="Vehicle of Interest" icon={<Car className="h-6 w-6 mr-3 text-red-600" />}>
                <InputField label="Year" name="vehicleYear" value={dealData.vehicleYear} onChange={handleChange} type="number" />
                <InputField label="Make" name="vehicleMake" value={dealData.vehicleMake} onChange={handleChange} />
                <InputField label="Model" name="vehicleModel" value={dealData.vehicleModel} onChange={handleChange} />
                <InputField label="VIN" name="vehicleVin" value={dealData.vehicleVin} onChange={handleChange} />
                <InputField label="Stock #" name="vehicleStock" value={dealData.vehicleStock} onChange={handleChange} />
                <InputField label="Color" name="vehicleColor" value={dealData.vehicleColor} onChange={handleChange} />
                <InputField label="Mileage" name="vehicleMileage" value={dealData.vehicleMileage} onChange={handleChange} type="number" />
            </FormSection>

            <FormSection title="Pricing & Profitability" icon={<ClipboardList className="h-6 w-6 mr-3 text-red-600" />}>
                <InputField label="Selling Price" name="sellingPrice" value={dealData.sellingPrice} onChange={handleChange} type="number" helpText="Optional. Leave at 0 to calculate from ROI %."/>
                <InputField label="ROI Percentage (%)" name="roiPercentage" value={dealData.roiPercentage} onChange={handleChange} type="number" helpText="Used if Selling Price is 0."/>
                <InputField label="Market Value" name="marketValue" value={dealData.marketValue} onChange={handleChange} type="number" />
                <InputField label="Acquisition Cost" name="acquisitionCost" value={dealData.acquisitionCost} onChange={handleChange} type="number" />
                <InputField label="Reconditioning Cost" name="reconditioningCost" value={dealData.reconditioningCost} onChange={handleChange} type="number" />
                <InputField label="Advertising Cost" name="advertisingCost" value={dealData.advertisingCost} onChange={handleChange} type="number" />
                <InputField label="Flooring Cost" name="flooringCost" value={dealData.flooringCost} onChange={handleChange} type="number" />
            </FormSection>

            <FormSection title="Customer Allowances & Trade" icon={<DollarSign className="h-6 w-6 mr-3 text-red-600" />}>
                <InputField label="Rebates" name="rebates" value={dealData.rebates} onChange={handleChange} type="number" />
                <InputField label="Trade Value" name="tradeValue" value={dealData.tradeValue} onChange={handleChange} type="number" />
                <InputField label="Trade Payoff" name="tradePayoff" value={dealData.tradePayoff} onChange={handleChange} type="number" />
            </FormSection>
            
            <FormSection title="Fees & Taxes" icon={<FileText className="h-6 w-6 mr-3 text-red-600" />}>
                <InputField label="Doc Fee" name="docFee" value={dealData.docFee} onChange={handleChange} type="number" />
                <InputField label="License Estimate" name="licenseEstimate" value={dealData.licenseEstimate} onChange={handleChange} type="number" />
                <InputField label="Title Fee" name="titleFee" value={dealData.titleFee} onChange={handleChange} type="number" />
                <InputField label="Tire Fee" name="tireFee" value={dealData.tireFee} onChange={handleChange} type="number" />
                <InputField label="Other Fees" name="otherFee" value={dealData.otherFee} onChange={handleChange} type="number" />
                <InputField label="Tax Rate (%)" name="taxRate" value={dealData.taxRate} onChange={handleChange} type="number" />
            </FormSection>

            <FormSection title="Value Add-ons" icon={<PlusCircle className="h-6 w-6 mr-3 text-red-600" />}>
                <InputField label="Brake Plus" name="brakePlus" value={dealData.brakePlus} onChange={handleChange} type="number" />
                <InputField label="Safe Guard" name="safeGuard" value={dealData.safeGuard} onChange={handleChange} type="number" />
                <InputField label="Protection Package" name="protectionPackage" value={dealData.protectionPackage} onChange={handleChange} type="number" />
                <InputField label="GAP Insurance" name="gapInsurance" value={dealData.gapInsurance} onChange={handleChange} type="number" />
                <InputField label="Extended Service Contract" name="serviceContract" value={dealData.serviceContract} onChange={handleChange} type="number" />
            </FormSection>

            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">
                    Generate Offer
                </button>
            </div>
        </form>
    );
};


// --- Page 2: Offer Sheet ---

const OfferSheet = ({ dealData, onGoBack }) => {

    // --- DYNAMIC CALCULATIONS ---
    let sellingPrice, roiPercentage, profit;
    const baseInvestment = roundToHundredth(dealData.acquisitionCost + dealData.reconditioningCost + dealData.advertisingCost + dealData.flooringCost);

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

    const netTrade = roundToHundredth(dealData.tradeValue - dealData.tradePayoff);
    const totalAddons = roundToHundredth(dealData.protectionPackage + dealData.gapInsurance + dealData.serviceContract + dealData.brakePlus + dealData.safeGuard);
    
    const difference = roundToHundredth(sellingPrice + totalAddons - netTrade);
    
    const salesTax = difference > 0 ? roundToHundredth(difference * (dealData.taxRate / 100)) : 0;

    const totalFees = roundToHundredth(dealData.docFee + dealData.titleFee + dealData.tireFee + dealData.otherFee);
    
    const amountFinanced = roundToHundredth(difference + salesTax + dealData.licenseEstimate + totalFees - dealData.rebates);

    const sunsetExclusives = [
        { icon: <ShieldCheck className="h-8 w-8 text-red-600" />, title: 'Warranty Protection for Life', description: 'A lifetime limited powertrain warranty honored at any ASE certified facility in the US and Canada.' },
        { icon: <Wrench className="h-8 w-8 text-red-600" />, title: 'Oil Changes for Life', description: 'Save thousands over the lifetime of your vehicle with complimentary oil changes.' }
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8 printable-section">
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">{dealData.vehicleYear} {dealData.vehicleMake}</div>
                        <h2 className="block mt-1 text-3xl leading-tight font-extrabold text-black">{dealData.vehicleModel}</h2>
                        <p className="mt-2 text-gray-500">VIN: {dealData.vehicleVin} | Stock: {dealData.vehicleStock}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg text-gray-700">Prepared for:</p>
                       <p className="text-xl font-bold">{dealData.buyerFirstName} {dealData.buyerLastName}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 p-8 rounded-xl shadow-lg printable-section">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pricing Transparency</h3>
                <div className="space-y-3 text-gray-700 max-w-2xl mx-auto">
                    <div className="flex justify-between text-lg"><p>Market Value</p><p className="font-semibold">{formatCurrency(dealData.marketValue)}</p></div>
                    <hr className="my-2 border-gray-200"/>
                    <div className="flex justify-between text-sm"><p>Acquisition & Reconditioning</p><p>{formatCurrency(dealData.acquisitionCost + dealData.reconditioningCost)}</p></div>
                    <div className="flex justify-between text-sm"><p>Advertising & Flooring</p><p>{formatCurrency(dealData.advertisingCost + dealData.flooringCost)}</p></div>
                    <div className="flex justify-between text-sm"><p>B&O Tax (Calculated)</p><p>{formatCurrency(roundToHundredth(sellingPrice * BO_TAX_RATE))}</p></div>
                    <div className="flex justify-between border-t border-gray-300 pt-3 mt-3"><p className="font-semibold">Total Dealership Investment</p><p className="font-bold">{formatCurrency(roundToHundredth(baseInvestment + (sellingPrice * BO_TAX_RATE)))}</p></div>
                    <div className="flex justify-between"><p>Dealership ROI ({roiPercentage}%)</p><p className="font-medium">{formatCurrency(profit)}</p></div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-inner mt-3">
                        <p className="text-lg font-bold text-gray-900">Final Selling Price</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(sellingPrice)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow-lg printable-section">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><Coins className="h-6 w-6 mr-3 text-red-600" />Final Offer Calculation</h3>
                <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between"><p>Final Selling Price</p><p className="font-medium">{formatCurrency(sellingPrice)}</p></div>
                    <div className="flex justify-between text-sm"><p>Brake Plus</p><p>{formatCurrency(dealData.brakePlus)}</p></div>
                    <div className="flex justify-between text-sm"><p>Safe Guard</p><p>{formatCurrency(dealData.safeGuard)}</p></div>
                    <div className="flex justify-between text-sm"><p>Other Add-ons</p><p>{formatCurrency(dealData.protectionPackage + dealData.gapInsurance + dealData.serviceContract)}</p></div>
                    <hr className="my-2"/>
                    <div className="flex justify-between"><p>Trade Value</p><p>{formatCurrency(dealData.tradeValue)}</p></div>
                    <div className="flex justify-between text-sm"><p>Trade Payoff</p><p>({formatCurrency(dealData.tradePayoff)})</p></div>
                    <div className="flex justify-between text-sm font-semibold"><p>Net Trade</p><p>{formatCurrency(netTrade)}</p></div>
                    <div className="flex justify-between items-center border-t-2 border-gray-300 pt-4 mt-4">
                        <p className="text-lg font-bold text-gray-900">Difference</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(difference)}</p>
                    </div>
                    <hr className="my-2"/>
                    <div className="flex justify-between text-sm text-red-600"><p>Rebates</p><p>({formatCurrency(dealData.rebates)})</p></div>
                    <div className="flex justify-between"><p>Sales Tax ({dealData.taxRate}%)</p><p className="font-medium">{formatCurrency(salesTax)}</p></div>
                    <div className="flex justify-between"><p>License Estimate</p><p className="font-medium">{formatCurrency(dealData.licenseEstimate)}</p></div>
                    <div className="flex justify-between"><p>Doc Fee</p><p className="font-medium">{formatCurrency(dealData.docFee)}</p></div>
                    <div className="flex justify-between"><p>Other Fees (Title, Tire, etc.)</p><p className="font-medium">{formatCurrency(dealData.titleFee + dealData.tireFee + dealData.otherFee)}</p></div>
                    <div className="flex justify-between items-center border-t-2 border-red-500 pt-4 mt-4">
                        <p className="text-xl font-bold text-gray-900">Amount Financed</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(amountFinanced)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 p-8 rounded-xl border border-red-200 printable-section sunset-exclusives-section">
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

            <div className="flex justify-center pt-4 space-x-4 no-print">
                <button onClick={onGoBack} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300">
                    Go Back & Edit
                </button>
                <button onClick={() => window.print()} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                    <Printer className="h-5 w-5 mr-2" />
                    Print Offer
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    const [page, setPage] = useState('form'); // 'form' or 'offer'
    const [dealData, setDealData] = useState(initialDealData);

    const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe20azLghiq6B4uoUgyV5A_j5zjglEyeNF9g&s";

    const printStyles = `
        @media print {
          body {
            background-color: #fff !important;
          }
          .no-print {
            display: none !important;
          }
          main.container {
            padding: 0 !important;
            margin: 0.5in !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .printable-section {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            background-color: #fff !important;
            page-break-inside: avoid;
          }
          .bg-red-50, .bg-gray-50 {
             background-color: #fff !important;
             -webkit-print-color-adjust: exact;
             color-adjust: exact;
          }
          .text-red-600 {
              color: #dc2626 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
          }
        }
    `;

    const handleGenerateOffer = () => {
        setPage('offer');
        window.scrollTo(0, 0); // Scroll to top when page changes
    };

    const handleGoBack = () => {
        setPage('form');
        window.scrollTo(0, 0);
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <style>{printStyles}</style>
            <header className="bg-black text-white p-4 shadow-lg sticky top-0 z-10 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={logoUrl} alt="Sunset Chevrolet Logo" className="h-12" />
                    </div>
                    <p className="text-sm text-gray-300">{page === 'form' ? 'Deal Configuration' : 'Customer Offer Sheet'}</p>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {page === 'form' ? (
                    <DataEntryForm dealData={dealData} setDealData={setDealData} onGenerateOffer={handleGenerateOffer} />
                ) : (
                    <OfferSheet dealData={dealData} onGoBack={handleGoBack} />
                )}
            </main>

            <footer className="bg-black text-white mt-12 py-8 no-print">
                <div className="container mx-auto text-center">
                    <p className="font-semibold">Sunset Chevrolet</p>
                    <p className="text-sm text-gray-400 mt-1">910 Traffic Ave, Sumner, WA 98390 | Sales: (253) 299-2561</p>
                </div>
            </footer>
        </div>
    );
}
