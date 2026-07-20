import { useMemo } from 'react';
import { VoltageRange, CurrentRange } from '../types/instruments';

interface UseAnalogWattmeterProps {
  realPower: number; // P_real calculated and provided by MNA
  voltageRange: VoltageRange;
  currentRange: CurrentRange;
  maxDeflectionDegrees?: number; // Total rotation angle in CSS (e.g. 90 or 120 degrees)
}

export const useAnalogWattmeter = ({
  realPower,
  voltageRange,
  currentRange,
  maxDeflectionDegrees = 90,
}: UseAnalogWattmeterProps) => {
  return useMemo(() => {
    const vRanges = [3, 10, 30, 100, 300, 1000];
    const iRanges = [0.1, 0.3, 1, 3, 10, 30];
    
    // Fallback in case of weird values, though UI strictly limits to these
    let c = vRanges.indexOf(voltageRange);
    let r = iRanges.indexOf(currentRange);
    if (c === -1) c = 0;
    if (r === -1) r = 0;

    // The SO5127-1R6 hardware uses a precise checkerboard logic for its scales
    const exponent = Math.floor((c + (r % 2)) / 2) + Math.floor(r / 2) - 1;
    const recommendedFactor = Math.pow(10, exponent);
    
    const isScale10 = (r + c) % 2 !== 0;
    const recommendedScale = isScale10 ? 10 : 3;
    
    const pMax = recommendedScale * recommendedFactor;
    
    const factorScale10 = pMax / 10;
    const factorScale3 = pMax / 3;

    // 3. Needle Deflection Calculation
    // We map to a percentage between 0 and 100
    let deflectionPercentage = (realPower / pMax) * 100;

    // Saturation Effect / Analog Clipping
    // If the power exceeds Pmax, the needle physically "hits" the upper limit.
    const CLIPPING_LIMIT = 104; // Go past 4% to simulate the needle touching the physical edge
    
    // If MNA detects reverse power, the needle hits to the left (common if connected backwards)
    const LOWER_CLIPPING_LIMIT = -2;

    if (deflectionPercentage > 100) {
      deflectionPercentage = Math.min(deflectionPercentage, CLIPPING_LIMIT);
    } else if (deflectionPercentage < 0) {
      deflectionPercentage = Math.max(deflectionPercentage, LOWER_CLIPPING_LIMIT);
    }

    // 4. Translation to CSS Degrees
    // Example: If your CSS rotates from the bottom center (transform-origin: bottom center)
    // where 0% = -45deg and 100% = +45deg. (Assuming 90 degrees total aperture).
    const startAngle = -(maxDeflectionDegrees / 2);
    const needleRotation = startAngle + (deflectionPercentage / 100) * maxDeflectionDegrees;

    return {
      pMax,
      factors: {
        scale10: factorScale10,
        scale3: factorScale3,
        recommendedScale,      // 3 or 10
        recommendedFactor,     // The ideal multiplier to use mentally
      },
      deflection: {
        percentage: deflectionPercentage,
        isClippingHigh: deflectionPercentage > 100, // Useful to add a shake or sound in the UI
        isClippingLow: deflectionPercentage < 0,
        cssRotationDegrees: needleRotation,
      },
    };
  }, [realPower, voltageRange, currentRange, maxDeflectionDegrees]);
};
