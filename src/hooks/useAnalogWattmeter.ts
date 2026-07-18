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
    // 1. Full Scale Logic (Pmax)
    const pMax = voltageRange * currentRange;

    // 2. Scale Factor Calculation (Wattmeter Constant K)
    // The student must multiply the visual reading of the scale by this factor.
    // Since it has scales of 0-10 and 0-3, we expose both factors so the UI 
    // can show the most appropriate one (the one with less complex decimals),
    // or to simulate the student's mental exercise.
    const factorScale10 = pMax / 10;
    const factorScale3 = pMax / 3;

    // Heuristic to determine which scale the student "should" use visually:
    // We prefer the scale that results in a factor that is a power of 10 (e.g. 0.1, 1, 10, 100)
    // or an easy multiplier (e.g. x3, x30).
    const recommendedScale = pMax.toString().match(/^[39]/) ? 3 : 10;
    const recommendedFactor = recommendedScale === 3 ? factorScale3 : factorScale10;

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
