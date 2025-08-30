// Utility to calculate total trade devalue
export function getTotalTradeDevalue(dealData, settings) {
  if (!dealData.tradeDevalueSelected || !settings || !settings.tradeDevalueItems) return 0;
  return dealData.tradeDevalueSelected.reduce((sum, idx) => sum + (settings.tradeDevalueItems[idx]?.price || 0), 0);
}

