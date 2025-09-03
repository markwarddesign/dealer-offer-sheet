// Utility to calculate total trade devalue
export function getTotalTradeDevalue(dealData, defaultItems) {
  if (!dealData) return 0;

  const selectedDevalue = (dealData.tradeDevalueSelected || []).reduce(
    (sum, idx) => sum + (defaultItems[idx]?.price || 0),
    0
  );

  const customDevalue = (dealData.tradeDevalueItems || []).reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  return selectedDevalue + customDevalue;
}

