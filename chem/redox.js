/**
 * Redox helper functions for acidic and basic media
 * Provides suggestions and validation for redox reactions
 */

import { parseFormula } from './parser.js';

export class RedoxHelper {
  
  /**
   * Suggest medium (acidic/basic) based on species present
   * @param {string[]} species - Array of chemical formulas
   * @returns {Object} Suggestion result
   */
  static suggestMedium(species) {
    const indicators = {
      acidic: ['H+', 'H3O+', 'HSO4-', 'HNO3', 'HCl', 'H2SO4'],
      basic: ['OH-', 'NH3', 'CO3^2-', 'HCO3-'],
      neutral: ['H2O']
    };
    
    let acidicScore = 0;
    let basicScore = 0;
    let hasTransitionMetal = false;
    let hasOxyacid = false;
    
    for (const formula of species) {
      try {
        const parsed = parseFormula(formula);
        
        // Check for specific indicators
        if (indicators.acidic.includes(formula)) acidicScore += 3;
        if (indicators.basic.includes(formula)) basicScore += 3;
        
        // Check for H+ or OH- in parsed structure
        if (parsed.elements.H && parsed.charge > 0) acidicScore += 1;
        if (parsed.elements.O && parsed.charge < 0 && formula.includes('OH')) basicScore += 1;
        
        // Check for transition metals (common in redox)
        const transitionMetals = ['Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn'];
        for (const metal of transitionMetals) {
          if (parsed.elements[metal]) {
            hasTransitionMetal = true;
            break;
          }
        }
        
        // Check for oxyacids/oxyanions
        if (parsed.elements.O && Object.keys(parsed.elements).length >= 2) {
          hasOxyacid = true;
        }
        
      } catch (error) {
        // Skip unparseable formulas
        continue;
      }
    }
    
    let suggestion = 'standard';
    let confidence = 0;
    let reason = 'No clear redox indicators detected';
    
    if (acidicScore > basicScore && acidicScore > 0) {
      suggestion = 'acidic';
      confidence = Math.min(acidicScore / 5, 1.0);
      reason = 'Acidic species detected';
    } else if (basicScore > acidicScore && basicScore > 0) {
      suggestion = 'basic';
      confidence = Math.min(basicScore / 5, 1.0);
      reason = 'Basic species detected';
    } else if (hasTransitionMetal || hasOxyacid) {
      suggestion = 'acidic'; // Default for transition metal redox
      confidence = 0.5;
      reason = 'Transition metals/oxyanions suggest redox reaction';
    }
    
    return {
      suggestion,
      confidence,
      reason,
      indicators: {
        acidic: acidicScore,
        basic: basicScore,
        hasTransitionMetal,
        hasOxyacid
      }
    };
  }
  
  /**
   * Detect if equation involves redox (change in oxidation states)
   * @param {string[]} reactants - Reactant formulas
   * @param {string[]} products - Product formulas  
   * @returns {Object} Redox analysis
   */
  static analyzeRedox(reactants, products) {
    const allSpecies = [...reactants, ...products];
    const elements = new Set();
    
    // Collect all elements
    for (const formula of allSpecies) {
      try {
        const parsed = parseFormula(formula);
        Object.keys(parsed.elements).forEach(el => elements.add(el));
      } catch (error) {
        continue;
      }
    }
    
    // Simple heuristics for redox detection
    const redoxIndicators = {
      hasChargedSpecies: allSpecies.some(formula => {
        try {
          return parseFormula(formula).charge !== 0;
        } catch { return false; }
      }),
      
      hasTransitionMetals: Array.from(elements).some(el => 
        ['Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'V', 'Ti', 'Mo', 'W'].includes(el)
      ),
      
      hasOxyacids: allSpecies.some(formula => {
        try {
          const parsed = parseFormula(formula);
          return parsed.elements.O && Object.keys(parsed.elements).length >= 2;
        } catch { return false; }
      }),
      
      hasPeroxides: allSpecies.some(formula => 
        formula.includes('H2O2') || formula.includes('O2^2-')
      )
    };
    
    const isLikelyRedox = Object.values(redoxIndicators).some(indicator => indicator);
    
    return {
      isLikelyRedox,
      indicators: redoxIndicators,
      elements: Array.from(elements)
    };
  }
  
  /**
   * Get standard redox species for different media
   * @param {string} medium - 'acidic' or 'basic'
   * @returns {Object} Available species
   */
  static getRedoxSpecies(medium) {
    const species = {
      acidic: {
        proton: 'H+',
        water: 'H2O', 
        electron: 'e-',
        description: 'Acidic medium: H⁺ and H₂O available'
      },
      basic: {
        hydroxide: 'OH-',
        water: 'H2O',
        electron: 'e-', 
        description: 'Basic medium: OH⁻ and H₂O available'
      },
      standard: {
        description: 'Standard balancing: no additional species'
      }
    };
    
    return species[medium] || species.standard;
  }
  
  /**
   * Validate redox equation requirements
   * @param {string[]} reactants - Reactant formulas
   * @param {string[]} products - Product formulas
   * @param {string} medium - Reaction medium
   * @returns {Object} Validation result
   */
  static validateRedox(reactants, products, medium) {
    const errors = [];
    const warnings = [];
    
    // Check for electron balance (will be handled by balancer)
    const analysis = this.analyzeRedox(reactants, products);
    
    if (medium !== 'standard' && !analysis.isLikelyRedox) {
      warnings.push('Redox mode selected but no redox indicators detected');
    }
    
    if (medium === 'standard' && analysis.isLikelyRedox) {
      warnings.push('Possible redox reaction - consider using acidic or basic mode');
    }
    
    // Check for incompatible species in different media
    const allSpecies = [...reactants, ...products];
    
    if (medium === 'acidic') {
      const basicSpecies = allSpecies.filter(s => 
        s.includes('OH-') && !s.includes('H2O')
      );
      if (basicSpecies.length > 0) {
        errors.push(`Basic species ${basicSpecies.join(', ')} incompatible with acidic medium`);
      }
    }
    
    if (medium === 'basic') {
      const acidicSpecies = allSpecies.filter(s => 
        (s.includes('H+') || s.includes('H3O+')) && !s.includes('H2O')
      );
      if (acidicSpecies.length > 0) {
        errors.push(`Acidic species ${acidicSpecies.join(', ')} incompatible with basic medium`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      analysis
    };
  }
  
  /**
   * Get common redox couples for reference
   * @returns {Array} List of common redox couples
   */
  static getCommonRedoxCouples() {
    return [
      { oxidized: 'MnO4-', reduced: 'Mn2+', medium: 'acidic', eº: 1.51 },
      { oxidized: 'MnO4-', reduced: 'MnO2', medium: 'basic', eº: 0.59 },
      { oxidized: 'Cr2O7^2-', reduced: 'Cr3+', medium: 'acidic', eº: 1.33 },
      { oxidized: 'Fe3+', reduced: 'Fe2+', medium: 'any', eº: 0.77 },
      { oxidized: 'Cu2+', reduced: 'Cu', medium: 'any', eº: 0.34 },
      { oxidized: 'H+', reduced: 'H2', medium: 'acidic', eº: 0.00 },
      { oxidized: 'O2', reduced: 'H2O', medium: 'acidic', eº: 1.23 },
      { oxidized: 'O2', reduced: 'OH-', medium: 'basic', eº: 0.40 },
      { oxidized: 'Cl2', reduced: 'Cl-', medium: 'any', eº: 1.36 },
      { oxidized: 'Br2', reduced: 'Br-', medium: 'any', eº: 1.07 },
      { oxidized: 'I2', reduced: 'I-', medium: 'any', eº: 0.54 }
    ];
  }
  
  /**
   * Format redox equation with proper notation
   * @param {Object} balanceResult - Result from balancer
   * @returns {string} Formatted equation
   */
  static formatRedoxEquation(balanceResult) {
    const { coefficients } = balanceResult;
    
    // Group by side
    const reactants = coefficients
      .filter(item => item.side === 'reactant')
      .map(item => {
        const coeff = item.coeff === 1 ? '' : `${item.coeff} `;
        return `${coeff}${this.formatSpecies(item.species)}`;
      });
    
    const products = coefficients
      .filter(item => item.side === 'product')
      .map(item => {
        const coeff = item.coeff === 1 ? '' : `${item.coeff} `;
        return `${coeff}${this.formatSpecies(item.species)}`;
      });
    
    return `${reactants.join(' + ')} → ${products.join(' + ')}`;
  }
  
  /**
   * Format chemical species with proper subscripts/superscripts
   * @param {string} species - Chemical formula
   * @returns {string} Formatted formula
   */
  static formatSpecies(species) {
    // This is a basic formatter - the main app will have more sophisticated formatting
    return species
      .replace(/(\d+)/g, '₍$1₎') // subscripts (basic)
      .replace(/\^([\d+-]+)/g, '^($1)') // superscripts
      .replace(/\+/g, '⁺')
      .replace(/\-/g, '⁻');
  }
}

export default RedoxHelper;