/**
 * Periodic table data and molar mass calculations
 * Uses IUPAC standard atomic weights and supports isotopes
 */

import { Fraction } from './fractions.js';
import { parseFormula } from './parser.js';

// IUPAC Standard Atomic Weights (2021) - abridged for common elements
export const ATOMIC_WEIGHTS = {
  'H': 1.008,
  'He': 4.002602,
  'Li': 6.94,
  'Be': 9.0121831,
  'B': 10.81,
  'C': 12.011,
  'N': 14.007,
  'O': 15.999,
  'F': 18.998403163,
  'Ne': 20.1797,
  'Na': 22.98976928,
  'Mg': 24.305,
  'Al': 26.9815384,
  'Si': 28.085,
  'P': 30.973761998,
  'S': 32.06,
  'Cl': 35.45,
  'Ar': 39.948,
  'K': 39.0983,
  'Ca': 40.078,
  'Sc': 44.955908,
  'Ti': 47.867,
  'V': 50.9415,
  'Cr': 51.9961,
  'Mn': 54.938043,
  'Fe': 55.845,
  'Co': 58.933194,
  'Ni': 58.6934,
  'Cu': 63.546,
  'Zn': 65.38,
  'Ga': 69.723,
  'Ge': 72.630,
  'As': 74.921595,
  'Se': 78.971,
  'Br': 79.904,
  'Kr': 83.798,
  'Rb': 85.4678,
  'Sr': 87.62,
  'Y': 88.90584,
  'Zr': 91.224,
  'Nb': 92.90637,
  'Mo': 95.95,
  'Tc': 98,
  'Ru': 101.07,
  'Rh': 102.90549,
  'Pd': 106.42,
  'Ag': 107.8682,
  'Cd': 112.414,
  'In': 114.818,
  'Sn': 118.710,
  'Sb': 121.760,
  'Te': 127.60,
  'I': 126.90447,
  'Xe': 131.293,
  'Cs': 132.90545196,
  'Ba': 137.327,
  'La': 138.90547,
  'Ce': 140.116,
  'Pr': 140.90766,
  'Nd': 144.242,
  'Pm': 145,
  'Sm': 150.36,
  'Eu': 151.964,
  'Gd': 157.25,
  'Tb': 158.92535,
  'Dy': 162.500,
  'Ho': 164.93033,
  'Er': 167.259,
  'Tm': 168.93422,
  'Yb': 173.045,
  'Lu': 174.9668,
  'Hf': 178.49,
  'Ta': 180.94788,
  'W': 183.84,
  'Re': 186.207,
  'Os': 190.23,
  'Ir': 192.217,
  'Pt': 195.084,
  'Au': 196.966570,
  'Hg': 200.592,
  'Tl': 204.38,
  'Pb': 207.2,
  'Bi': 208.98040,
  'Po': 209,
  'At': 210,
  'Rn': 222,
  'Fr': 223,
  'Ra': 226,
  'Ac': 227,
  'Th': 232.0377,
  'Pa': 231.03588,
  'U': 238.02891,
  'Np': 237,
  'Pu': 244,
  'Am': 243,
  'Cm': 247,
  'Bk': 247,
  'Cf': 251,
  'Es': 252,
  'Fm': 257,
  'Md': 258,
  'No': 259,
  'Lr': 262,
  'Rf': 267,
  'Db': 270,
  'Sg': 271,
  'Bh': 270,
  'Hs': 277,
  'Mt': 276,
  'Ds': 281,
  'Rg': 280,
  'Cn': 285,
  'Nh': 284,
  'Fl': 289,
  'Mc': 288,
  'Lv': 293,
  'Ts': 292,
  'Og': 294
};

// Common isotope masses (exact masses for precision calculations)
export const ISOTOPE_MASSES = {
  'H-1': 1.00782503223,
  'H-2': 2.01410177812, // Deuterium
  'H-3': 3.0160492779,  // Tritium
  'C-12': 12.0000000,   // Definition standard
  'C-13': 13.00335483507,
  'C-14': 14.003241989,
  'N-14': 14.00307400443,
  'N-15': 15.00010889888,
  'O-16': 15.99491461957,
  'O-17': 16.99913175650,
  'O-18': 17.99915961286,
  'F-19': 18.99840316273,
  'Na-23': 22.9897692820,
  'Mg-24': 23.98504190,
  'Mg-25': 24.98583692,
  'Mg-26': 25.98259297,
  'Al-27': 26.98153853,
  'Si-28': 27.97692653465,
  'Si-29': 28.97649466490,
  'Si-30': 29.97377022,
  'P-31': 30.97376199842,
  'S-32': 31.97207117,
  'S-33': 32.97145876,
  'S-34': 33.96786701,
  'S-36': 35.96708071,
  'Cl-35': 34.96885268,
  'Cl-37': 36.96590260,
  'K-39': 38.9637064864,
  'K-40': 39.963998166,
  'K-41': 40.9618252579,
  'Ca-40': 39.9625909,
  'Ca-42': 41.9586456,
  'Ca-43': 42.9587666,
  'Ca-44': 43.9554811,
  'Ca-46': 45.9536890,
  'Ca-48': 47.9525229,
  'Fe-54': 53.9396105,
  'Fe-56': 55.9349375,
  'Fe-57': 56.9353940,
  'Fe-58': 57.9332756,
  'Cu-63': 62.9295975,
  'Cu-65': 64.9277895,
  'Zn-64': 63.9291422,
  'Zn-66': 65.9260334,
  'Zn-67': 66.9271273,
  'Zn-68': 67.9248442,
  'Zn-70': 69.9253193,
  'Br-79': 78.9183371,
  'Br-81': 80.9162906,
  'I-127': 126.9044719,
  'U-235': 235.0439299,
  'U-238': 238.0507882
};

export class MolarMassCalculator {
  
  /**
   * Calculate molar mass of a formula
   * @param {string|Object} formula - Chemical formula string or parsed composition
   * @returns {Object} Result with exact fraction and decimal values
   */
  static calculate(formula) {
    let composition;
    
    if (typeof formula === 'string') {
      try {
        composition = parseFormula(formula);
      } catch (error) {
        throw new Error(`Cannot parse formula "${formula}": ${error.message}`);
      }
    } else {
      composition = formula;
    }
    
    let totalMass = new Fraction(0, 1);
    const breakdown = [];
    
    for (const [elementKey, count] of Object.entries(composition.elements)) {
      const mass = this.getAtomicMass(elementKey);
      const contribution = mass.mul(count);
      
      totalMass = totalMass.add(contribution);
      breakdown.push({
        element: elementKey,
        count: count,
        atomicMass: mass.toNumber(),
        contribution: contribution.toNumber()
      });
    }
    
    return {
      exactMass: totalMass,
      decimalMass: totalMass.toNumber(),
      formula: typeof formula === 'string' ? formula : this.formatFormula(composition),
      breakdown: breakdown,
      unit: 'g/mol'
    };
  }
  
  /**
   * Get atomic mass for element (handles isotopes)
   * @param {string} elementKey - Element symbol or isotope notation (e.g., 'C' or 'C-13')
   * @returns {Fraction} Atomic mass as fraction
   */
  static getAtomicMass(elementKey) {
    // Check if it's an isotope notation
    if (elementKey.includes('-')) {
      const exactMass = ISOTOPE_MASSES[elementKey];
      if (exactMass) {
        return Fraction.fromDecimal(exactMass);
      }
      
      // Fall back to standard atomic weight of base element
      const baseElement = elementKey.split('-')[0];
      const standardWeight = ATOMIC_WEIGHTS[baseElement];
      if (standardWeight) {
        return Fraction.fromDecimal(standardWeight);
      }
    } else {
      // Standard element
      const atomicWeight = ATOMIC_WEIGHTS[elementKey];
      if (atomicWeight) {
        return Fraction.fromDecimal(atomicWeight);
      }
    }
    
    throw new Error(`Unknown element or isotope: ${elementKey}`);
  }
  
  /**
   * Format composition object back to formula string
   * @param {Object} composition - Parsed composition
   * @returns {string} Formula string
   */
  static formatFormula(composition) {
    const parts = [];
    
    for (const [element, count] of Object.entries(composition.elements)) {
      if (count === 1) {
        parts.push(element);
      } else {
        parts.push(`${element}${count}`);
      }
    }
    
    let result = parts.join('');
    
    if (composition.charge && composition.charge !== 0) {
      if (composition.charge === 1) {
        result += '+';
      } else if (composition.charge === -1) {
        result += '-';
      } else if (composition.charge > 0) {
        result += `^${composition.charge}+`;
      } else {
        result += `^${Math.abs(composition.charge)}-`;
      }
    }
    
    return result;
  }
  
  /**
   * Calculate empirical formula from percentage composition
   * @param {Object} percentages - Element percentages {element: percentage}
   * @returns {Object} Empirical formula result
   */
  static empiricalFromPercentages(percentages) {
    const moles = {};
    let minMoles = Infinity;
    
    // Convert percentages to moles
    for (const [element, percentage] of Object.entries(percentages)) {
      const atomicWeight = ATOMIC_WEIGHTS[element];
      if (!atomicWeight) {
        throw new Error(`Unknown element: ${element}`);
      }
      
      const moleCount = percentage / atomicWeight;
      moles[element] = moleCount;
      minMoles = Math.min(minMoles, moleCount);
    }
    
    // Divide by smallest to get ratios
    const ratios = {};
    for (const [element, moleCount] of Object.entries(moles)) {
      ratios[element] = moleCount / minMoles;
    }
    
    // Convert to simple integer ratios
    const empirical = this.ratiesToIntegers(ratios);
    
    return {
      empirical: empirical,
      ratios: ratios,
      moles: moles
    };
  }
  
  /**
   * Convert decimal ratios to simple integers
   * @param {Object} ratios - Decimal ratios
   * @returns {Object} Integer ratios
   */
  static ratiesToIntegers(ratios) {
    const values = Object.values(ratios);
    const tolerance = 0.1;
    
    // Try multipliers up to 12 (common denominators)
    for (let multiplier = 1; multiplier <= 12; multiplier++) {
      const scaled = values.map(v => v * multiplier);
      const rounded = scaled.map(v => Math.round(v));
      
      // Check if all values are close to integers
      const allClose = scaled.every((v, i) => Math.abs(v - rounded[i]) < tolerance);
      
      if (allClose) {
        const result = {};
        let i = 0;
        for (const element of Object.keys(ratios)) {
          result[element] = rounded[i++];
        }
        return result;
      }
    }
    
    // Fall back to rounding original ratios
    const result = {};
    for (const [element, ratio] of Object.entries(ratios)) {
      result[element] = Math.round(ratio);
    }
    return result;
  }
  
  /**
   * Get element information
   * @param {string} symbol - Element symbol
   * @returns {Object} Element data
   */
  static getElementInfo(symbol) {
    const atomicWeight = ATOMIC_WEIGHTS[symbol];
    
    if (!atomicWeight) {
      return null;
    }
    
    // Basic element data (expand as needed)
    const elementData = {
      symbol: symbol,
      atomicWeight: atomicWeight,
      name: this.getElementName(symbol),
      available: true
    };
    
    return elementData;
  }
  
  /**
   * Get element name from symbol
   * @param {string} symbol - Element symbol
   * @returns {string} Element name
   */
  static getElementName(symbol) {
    const names = {
      'H': 'Hydrogen', 'He': 'Helium', 'Li': 'Lithium', 'Be': 'Beryllium',
      'B': 'Boron', 'C': 'Carbon', 'N': 'Nitrogen', 'O': 'Oxygen',
      'F': 'Fluorine', 'Ne': 'Neon', 'Na': 'Sodium', 'Mg': 'Magnesium',
      'Al': 'Aluminum', 'Si': 'Silicon', 'P': 'Phosphorus', 'S': 'Sulfur',
      'Cl': 'Chlorine', 'Ar': 'Argon', 'K': 'Potassium', 'Ca': 'Calcium',
      'Sc': 'Scandium', 'Ti': 'Titanium', 'V': 'Vanadium', 'Cr': 'Chromium',
      'Mn': 'Manganese', 'Fe': 'Iron', 'Co': 'Cobalt', 'Ni': 'Nickel',
      'Cu': 'Copper', 'Zn': 'Zinc', 'Ga': 'Gallium', 'Ge': 'Germanium',
      'As': 'Arsenic', 'Se': 'Selenium', 'Br': 'Bromine', 'Kr': 'Krypton',
      'Rb': 'Rubidium', 'Sr': 'Strontium', 'Y': 'Yttrium', 'Zr': 'Zirconium',
      'Nb': 'Niobium', 'Mo': 'Molybdenum', 'Tc': 'Technetium', 'Ru': 'Ruthenium',
      'Rh': 'Rhodium', 'Pd': 'Palladium', 'Ag': 'Silver', 'Cd': 'Cadmium',
      'In': 'Indium', 'Sn': 'Tin', 'Sb': 'Antimony', 'Te': 'Tellurium',
      'I': 'Iodine', 'Xe': 'Xenon', 'Cs': 'Cesium', 'Ba': 'Barium'
    };
    
    return names[symbol] || symbol;
  }
  
  /**
   * Validate if all elements in formula are known
   * @param {string} formula - Chemical formula
   * @returns {Object} Validation result
   */
  static validateElements(formula) {
    try {
      const composition = parseFormula(formula);
      const unknownElements = [];
      
      for (const elementKey of Object.keys(composition.elements)) {
        const baseElement = elementKey.split('-')[0]; // Handle isotopes
        if (!ATOMIC_WEIGHTS[baseElement]) {
          unknownElements.push(elementKey);
        }
      }
      
      return {
        valid: unknownElements.length === 0,
        unknownElements: unknownElements
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Convenience function
export function molarMass(formula) {
  return MolarMassCalculator.calculate(formula);
}

export default MolarMassCalculator;