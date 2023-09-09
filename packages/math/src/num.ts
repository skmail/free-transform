export const Num = {
  normalize(value: number, min: number, max: number) {
    return (value - min) / (max - min);
  },

  clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
  },

  // Round number to closest number
  round(value: number, precision = 10000000000) {
    return Math.round(value * precision) / precision;
  },
  
  // Round to closest decimal
  roundDecimal(value: number, roundTo: number) {
    return Math.round(value / roundTo) * roundTo;
  },

  lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
  },
};
