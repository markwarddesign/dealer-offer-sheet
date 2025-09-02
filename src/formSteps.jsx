import { User, Calculator, Receipt, PlusCircle, Landmark, Handshake } from 'lucide-react';

const createPath = (title) => `/form/${title.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')}`;

export const formSteps = [
	{
		title: 'Buyer Information',
		name: 'Buyer Info',
		icon: User,
		path: createPath('Buyer Information'),
		fields: [
			{ label: 'First Name', name: 'buyerFirstName', type: 'text' },
			{ label: 'Last Name', name: 'buyerLastName', type: 'text' },
			{ label: 'Phone', name: 'buyerPhone', type: 'tel' },
			{ label: 'Email', name: 'buyerEmail', type: 'email' },
		],
	},
	{
		title: 'Vehicle & Trade',
		name: 'Vehicle & Trade',
		icon: Handshake,
		path: createPath('Vehicle & Trade'),
	},
	{
		title: 'Pricing & Profitability',
		name: 'Pricing',
		icon: Calculator,
		path: createPath('Pricing & Profitability'),
		fields: [
			{
				label: 'Selling Price',
				name: 'sellingPrice',
				type: 'number',
				helpText: 'Optional. Leave at 0 to calculate from ROI %.',
			},
			{
				label: 'ROI Percentage (%)',
				name: 'roiPercentage',
				type: 'number',
				helpText: 'Used if Selling Price is 0.',
			},
			{ label: 'Market Value', name: 'marketValue', type: 'number' },
			{ label: 'Acquisition Cost', name: 'acquisitionCost', type: 'number' },
			{ label: 'Reconditioning Cost', name: 'reconditioningCost', type: 'number' },
			{ label: 'Advertising Cost', name: 'advertisingCost', type: 'number' },
			{ label: 'Flooring Cost', name: 'flooringCost', type: 'number' },
			{
				label: 'Is this a new vehicle?',
				name: 'isNewVehicle',
				type: 'checkbox',
				helpText: 'Check if the vehicle being purchased is new.',
			},
			{
				label: 'Rebates',
				name: 'rebates',
				type: 'number',
				showIf: (dealData) => !!dealData.isNewVehicle,
			},
		],
	},
	{
		title: 'Fees & Taxes',
		name: 'Fees',
		icon: Receipt,
		path: createPath('Fees & Taxes'),
		fields: [
			{ label: 'Tax Rate (%)', name: 'taxRate', type: 'number' },
			{ label: 'Doc Fee', name: 'docFee', type: 'number' },
			{ label: 'License Estimate', name: 'licenseEstimate', type: 'number' },
			{ label: 'Title Fee', name: 'titleFee', type: 'number' },
			{ label: 'Tire Fee', name: 'tireFee', type: 'number' },
		],
	},
	{
		title: 'Add-ons',
		name: 'Add-ons',
		icon: PlusCircle,
		path: createPath('Add-ons'),
		fields: [
			{
				label: 'Down Payment',
				name: 'downPayment',
				type: 'text',
				helpText: 'Enter single value or comma-separated values (e.g., 1000, 2000).',
			},
			{
				label: 'Finance Term',
				name: 'financeTerm',
				type: 'text',
				helpText: 'Enter single value or comma-separated values (e.g., 60, 72).',
			},
			{ label: 'Brake Plus', name: 'brakePlus', type: 'number' },
			{ label: 'Safe Guard', name: 'safeGuard', type: 'number' },
			{
				label: 'Protection Package',
				name: 'protectionPackage',
				type: 'number',
				showIf: (dealData, settings) => settings?.showProtectionPackage,
			},
			{
				label: 'GAP Insurance',
				name: 'gapInsurance',
				type: 'number',
				showIf: (dealData, settings) => settings?.showGapInsurance,
			},
			{
				label: 'Extended Service Contract',
				name: 'serviceContract',
				type: 'number',
				showIf: (dealData, settings) => settings?.showServiceContract,
			},
		],
	},
	{
		title: 'Finance Details',
		name: 'Finance',
		icon: Landmark,
		path: createPath('Finance Details'),
		fields: [
			{ label: 'Term (months)', name: 'financeTerm', type: 'number' },
			{
				label: 'Interest Rate (%)',
				name: 'interestRate',
				type: 'number',
				helpText: 'Used for finance calculations.',
			},
			{
				label: 'Down Payment',
				name: 'downPayment',
				type: 'number',
			},
		],
	},
];
