// Utility to round a number to the nearest hundredth
function roundToHundredth(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export default roundToHundredth;
