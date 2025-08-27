import { User, Car, ClipboardList, DollarSign, FileText, PlusCircle } from 'lucide-react';

const steps = [
  {
    title: "Buyer Information",
    icon: <User className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "First Name", name: "buyerFirstName", type: "text" },
      { label: "Last Name", name: "buyerLastName", type: "text" },
      { label: "Phone", name: "buyerPhone", type: "tel" },
      { label: "Email", name: "buyerEmail", type: "email" },
    ],
  },
  {
    title: "Vehicle of Interest",
    icon: <Car className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Year", name: "vehicleYear", type: "number" },
      { label: "Make", name: "vehicleMake", type: "text" },
      { label: "Model", name: "vehicleModel", type: "text" },
      { label: "VIN", name: "vehicleVin", type: "text" },
      { label: "Stock #", name: "vehicleStock", type: "text" },
      { label: "Color", name: "vehicleColor", type: "text" },
      { label: "Mileage", name: "vehicleMileage", type: "number" },
      { label: "Fuel Economy (MPG)", name: "vehicleMpg", type: "number", helpText: "Auto-filled from VIN or enter manually." },
    ],
  },
  {
    title: "Pricing & Profitability",
    icon: <ClipboardList className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Selling Price", name: "sellingPrice", type: "number", helpText: "Optional. Leave at 0 to calculate from ROI %." },
      { label: "ROI Percentage (%)", name: "roiPercentage", type: "number", helpText: "Used if Selling Price is 0." },
      { label: "Market Value", name: "marketValue", type: "number" },
      { label: "Acquisition Cost", name: "acquisitionCost", type: "number" },
      { label: "Reconditioning Cost", name: "reconditioningCost", type: "number" },
      { label: "Advertising Cost", name: "advertisingCost", type: "number" },
      { label: "Flooring Cost", name: "flooringCost", type: "number" },
      { label: "Interest Rate (%)", name: "interestRate", type: "number", helpText: "Used for finance calculations." },
      { label: "Is this a new vehicle?", name: "isNewVehicle", type: "checkbox", helpText: "Check if the vehicle being purchased is new." },
      { label: "Rebates", name: "rebates", type: "number", showIf: (dealData) => !!dealData.isNewVehicle },
    ],
  },
  {
    title: "Customer Allowances & Trade",
    icon: <DollarSign className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Market Value / Auction Value", name: "tradeMarketValue", type: "number", helpText: "The raw value before trade devalue deductions." },
      { label: "Trade Value", name: "tradeValue", type: "number", helpText: "This is Market Value minus trade devalue items. Editing this will update Market Value." },
      { label: "Trade Payoff", name: "tradePayoff", type: "number" },
      { label: "Year", name: "tradeVehicleYear", type: "number" },
      { label: "Make", name: "tradeVehicleMake", type: "text" },
      { label: "Model", name: "tradeVehicleModel", type: "text" },
      { label: "VIN", name: "tradeVehicleVin", type: "text" },
      { label: "Fuel Economy (MPG)", name: "tradeVehicleMpg", type: "number", helpText: "Auto-filled from VIN or enter manually." },
      { label: "Lease (Check if trade-in is a lease)", name: "tradeIsLease", type: "checkbox", helpText: "Tax credit only applies if trade-in is not a lease." },
      { label: "Current Monthly Payment", name: "tradeCurrentMonthlyPayment", type: "number", helpText: "Enter the current monthly payment for the trade-in vehicle." },
    ],
  },
  {
    title: "Fees & Taxes",
    icon: <FileText className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Doc Fee", name: "docFee", type: "number" },
      { label: "License Estimate", name: "licenseEstimate", type: "number" },
      { label: "Title Fee", name: "titleFee", type: "number" },
      { label: "Other Fees", name: "otherFee", type: "number" },
      { label: "Tax Rate (%)", name: "taxRate", type: "number" },
    ],
  },
  {
    title: "Value Add-ons",
    icon: <PlusCircle className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Brake Plus", name: "brakePlus", type: "number" },
      { label: "Safe Guard", name: "safeGuard", type: "number" },
      { label: "Protection Package", name: "protectionPackage", type: "number" },
      { label: "GAP Insurance", name: "gapInsurance", type: "number" },
      { label: "Extended Service Contract", name: "serviceContract", type: "number" },
    ],
  },
  {
    title: "Finance Options",
    icon: <DollarSign className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Down Payment", name: "downPayment", type: "number", helpText: "Enter the amount to be paid upfront." },
      { label: "Finance Term (months)", name: "financeTerm", type: "select", options: [24, 30, 36, 42, 48, 60, 66, 72, 84], helpText: "Select the loan term in months." },
    ],
  },
];

export default steps;
