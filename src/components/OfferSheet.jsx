import React from 'react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/formatCurrency';
import { ShieldCheck, Wrench } from 'lucide-react';
import NumberInput from './NumberInput';

const OfferSheet = ({ onGoBack, onShowTradeVsPrivate }) => {
	const { dealData, settings, updateDealData, updateRoi } = useAppStore();

	const handleSellingPriceChange = (e) => {
		const newSellingPrice = e.target.value === null ? 0 : Number(e.target.value);
		updateDealData({ sellingPrice: newSellingPrice });
	};

	const handleRoiChange = (e) => {
		const newRoi = e.target.value === null ? 0 : Number(e.target.value);
		updateRoi(newRoi);
	};

	const getAddon = (key, fallback = 0) => {
		const val = dealData[key];
		return val !== undefined && val !== '' ? Number(val) : fallback;
	};

	const sunsetExclusives = [
		{
			icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
			title: 'Warranty Protection for Life',
			description: 'A lifetime limited powertrain warranty honored at any ASE certified facility in the US and Canada.',
		},
		{
			icon: <Wrench className="h-8 w-8 text-blue-600" />,
			title: 'Oil Changes for Life',
			description: 'Save thousands over the lifetime of your vehicle with complimentary oil changes.',
		},
	];

	return (
		<div className="space-y-8 offer-sheet">
			<div className="bg-white rounded-xl shadow-lg p-8 printable-section">
				<div className="flex flex-row flex-wrap justify-between items-start mb-8 gap-6 mx-4">
					<div>
						<div className="uppercase tracking-wide text-sm text-red-600 font-semibold">
							{dealData.vehicleYear} {dealData.vehicleMake}
						</div>
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
						<p className="text-xl font-bold">
							{dealData.buyerFirstName} {dealData.buyerLastName}
						</p>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
					{/* Pricing Transparency */}
					<div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:col-span-1 w-full md:w-auto print:col-span-1">
						<h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Pricing Transparency</h3>
						<div className="space-y-5 text-gray-700">
							<div className="flex justify-between text-base">
								<p>Market Value</p>
								<p className="font-semibold">{formatCurrency(dealData.marketValue)}</p>
							</div>
							<div className="flex justify-between text-sm">
								<p>Acquisition Cost</p>
								<p>{formatCurrency(dealData.acquisitionCost)}</p>
							</div>
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
							<div className="flex justify-between text-sm">
								<p>B&O Tax (Calculated)</p>
								<p>{formatCurrency(dealData.boTax)}</p>
							</div>
							<div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
								<p className="font-semibold">Total Investment</p>
								<p className="font-bold">{formatCurrency(dealData.dealershipInvestment)}</p>
							</div>
							{/* ROI Input */}
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-2">
									<p>ROI</p>
									<NumberInput
										name="roiPercentage"
										value={dealData.roiPercentage}
										onChange={handleRoiChange}
										className="w-20 p-1 text-sm font-medium border rounded-md shadow-inner no-print"
										placeholder="ROI %"
									/>
									<span className="print-only">({(dealData.roiPercentage || 0).toFixed(2)})</span>
									<p>%</p>
								</div>
								<p className="font-medium">{formatCurrency(dealData.profit)}</p>
							</div>

							{/* Adjusted Price Input */}
							<div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-inner mt-2">
								<p className="text-base font-bold text-gray-900">Adjusted Price</p>
								<p>
									$ <NumberInput
										name="sellingPrice"
										value={dealData.sellingPrice}
										onChange={handleSellingPriceChange}
										className="w-32 p-1 text-lg font-bold text-blue-700 border rounded-md text-right"
										placeholder="Price"
									/>
								</p>
							</div>

							{/* Value Add-ons itemized */}
							<div className="flex justify-between text-sm py-1 border-b border-gray-100 font-semibold text-gray-700 mt-4">
								<p>Value Add-ons</p>
								<p></p>
							</div>
							<div className="pl-4">
								<div className="flex justify-between text-sm py-1 border-b border-gray-100">
									<span>Brake Plus</span>
									<span>{formatCurrency(getAddon('brakePlus', 499))}</span>
								</div>
								<div className="flex justify-between text-sm py-1 border-b border-gray-100">
									<span>Safe Guard</span>
									<span>{formatCurrency(getAddon('safeGuard', 249))}</span>
								</div>
								{settings?.showProtectionPackage && (
									<div className="flex justify-between text-sm py-1 border-b border-gray-100">
										<span>Protection Package</span>
										<span>{formatCurrency(getAddon('protectionPackage', 0))}</span>
									</div>
								)}
								{settings?.showGapInsurance && (
									<div className="flex justify-between text-sm py-1 border-b border-gray-100">
										<span>GAP Insurance</span>
										<span>{formatCurrency(getAddon('gapInsurance', 0))}</span>
									</div>
								)}
								{settings?.showServiceContract && (
									<div className="flex justify-between text-sm py-1 border-b border-gray-100">
										<span>Extended Service Contract</span>
										<span>{formatCurrency(getAddon('serviceContract', 0))}</span>
									</div>
								)}
								<div className="flex justify-between text-sm py-1 border-b border-gray-100 font-bold">
									<span>Total Add-ons</span>
									<span>{formatCurrency(dealData.totalAddons)}</span>
								</div>
							</div>

							<div className="flex justify-between text-sm py-1 border-b border-gray-100">
								<p>Doc Fee</p>
								<p>{formatCurrency(dealData.docFee)}</p>
							</div>
							{dealData.showLicenseFeeOnOfferSheet && (
								<div className="flex justify-between text-sm py-1 border-b border-gray-100">
									<p>License Estimate</p>
									<p>{formatCurrency(dealData.licenseEstimate)}</p>
								</div>
							)}
							<div className="flex justify-between text-sm py-1 border-b border-gray-100">
								<p>Other Fees</p>
								<p>{formatCurrency((dealData.titleFee || 0) + (dealData.tireFee || 0) + (dealData.otherFee || 0))}</p>
							</div>
							{dealData.showTaxRateOnOfferSheet && (
								<div className="flex justify-between text-sm py-1 border-b border-gray-100">
									<p>Sales Tax ({dealData.taxRate}%)</p>
									<p>{formatCurrency(dealData.salesTax)}</p>
								</div>
							)}
							{dealData.isNewVehicle && (
								<div className="flex justify-between text-sm text-blue-700">
									<p>Rebates</p>
									<p>({formatCurrency(dealData.rebates)})</p>
								</div>
							)}
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
										{dealData.tradeVehicleTrim && (
											<span className="ml-1 text-base font-semibold text-blue-700">{dealData.tradeVehicleTrim}</span>
										)}
									</div>
									<div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-1 mt-1">
										<span>
											<span className="font-semibold">VIN:</span> {dealData.tradeVehicleVin || '-'}
										</span>
										<span>
											<span className="font-semibold">MPG:</span>{' '}
											{dealData.tradeVehicleMpg ? dealData.tradeVehicleMpg : '-'}
											{dealData.tradeVehicleMpg ? ' mpg' : ''}
										</span>
										<span>
											<span className="font-semibold">Lease:</span> {dealData.tradeIsLease ? 'Yes' : 'No'}
										</span>
										<span>
											<span className="font-semibold">Current Payment:</span>{' '}
											{dealData.tradePayment ? formatCurrency(dealData.tradePayment) : '-'}
										</span>
									</div>
								</div>
								<div className="space-y-1 text-gray-800">
									<div className="flex justify-between text-sm">
										<span>Market Value</span>
										<span>{formatCurrency(dealData.tradeMarketValue)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<div>
											<span>Reconditioning</span>
											<br />
											{dealData.tradeDevalueSelected &&
												settings &&
												settings.tradeDevalueItems &&
												dealData.tradeDevalueSelected.length > 0 && (
													<ul className="ml-4 mt-1 text-xs text-gray-600 list-disc">
														{dealData.tradeDevalueSelected.map((idx) => {
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
												)}
										</div>
										<span>({formatCurrency(dealData.totalTradeDevalue)})</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Trade Value</span>
										<span>{formatCurrency(dealData.tradeValue)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Payoff</span>
										<span>({formatCurrency(dealData.tradePayOff)})</span>
									</div>
									<div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-2 mt-2 text-blue-900">
										<span>Net Trade</span>
										<span>{formatCurrency(dealData.netTrade)}</span>
									</div>
								</div>
							</div>
						)}

						{dealData.showAmountFinancedOnOfferSheet && (
							<div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex justify-between items-center">
								<h3 className="text-xl font-bold text-blue-900">Amount Financed</h3>
								<div className="text-2xl font-semibold text-blue-900">{formatCurrency(dealData.totalAmountFinanced)}</div>
							</div>
						)}

						<div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex flex-col mb-0">
							<h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Financing Options</h3>
							<div className="flex flex-row justify-between">
								{dealData.rebates != null &&
									dealData.rebates !== '' &&
									!isNaN(Number(dealData.rebates)) &&
									Number(dealData.rebates) !== 0 && (
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
								<table className="w-full text-xs text-center rounded-xl shadow border border-gray-200 bg-white overflow-hidden">
									<thead>
										<tr className="bg-gray-100">
											<th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700 rounded-tl-xl">
												Down
											</th>
											<th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700">Term</th>
											<th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700">Financed</th>
											<th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700 rounded-tr-xl">
												Payment
											</th>
										</tr>
									</thead>
									<tbody>
										{(() => {
											const grouped = {};
											(dealData.financeTableRows || []).forEach((row) => {
												if (!grouped[row.down]) grouped[row.down] = [];
												grouped[row.down].push(row);
											});
											const downs = Object.keys(grouped)
												.map(Number)
												.sort((a, b) => a - b);
											return downs.flatMap((down) => {
												const rows = grouped[down];
												return rows.map((row, tIdx) => {
													const isGroupFirst = tIdx === 0;
													const isGroupLast = tIdx === rows.length - 1;
													const borderClass =
														rows.length > 1 ? 'border-t-2 border-b-2 border-gray-200' : '';
													return (
														<tr key={row.down + '-' + row.term} className={'transition hover:bg-blue-50'}>
															{isGroupFirst ? (
																<td
																	rowSpan={rows.length}
																	className={`px-2 py-2 font-semibold text-gray-700 align-middle whitespace-nowrap border-r border-gray-100 bg-gray-50 rounded-l-xl ${borderClass}`}
																>
																	{formatCurrency(row.down)}
																</td>
															) : null}
															<td
																className={`px-2 py-2 text-gray-600 border-r border-gray-100 ${
																	isGroupFirst ? 'border-t-2 border-gray-200' : ''
																} ${isGroupLast ? 'border-b-2 border-gray-200' : ''}`}
															>
																{row.term}
															</td>
															<td
																className={`px-2 py-2 text-gray-600 border-r border-gray-100 ${
																	isGroupFirst ? 'border-t-2 border-gray-200' : ''
																} ${isGroupLast ? 'border-b-2 border-gray-200' : ''}`}
															>
																{formatCurrency(row.amountFinanced)}
															</td>
															<td
																className={`px-2 py-2 font-bold text-blue-900 bg-blue-50 rounded-r-xl ${
																	isGroupFirst ? 'border-t-2 border-gray-200' : ''
																} ${isGroupLast ? 'border-b-2 border-gray-200' : ''}`}
															>
																{formatCurrency(row.payment)}
															</td>
														</tr>
													);
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
							<div
								className="border-b border-gray-400 w-full mb-2"
								style={{ minWidth: '200px', minHeight: '2.5em' }}
							></div>
							<div className="text-xs text-gray-700 text-left">Customer Signature</div>
						</div>
						<div className="flex-1 ml-8">
							<div
								className="border-b border-gray-400 w-full mb-2"
								style={{ minWidth: '120px', minHeight: '2.5em' }}
							></div>
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
							<div className="flex-shrink-0 bg-white p-3 rounded-full shadow-md">{benefit.icon}</div>
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
					<button
						onClick={onGoBack}
						className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 print-hide"
					>
						Go Back & Edit
					</button>
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

export default OfferSheet;