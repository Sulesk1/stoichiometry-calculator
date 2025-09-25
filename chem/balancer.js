/**
 * Chemical equation balancer using matrix nullspace method
 * Balances equations with exact integer coefficients
 */

import { Fraction, FractionUtils } from './fractions.js';
import LinearAlgebra from './linear.js';
import { parseFormula } from './parser.js';

export class BalanceError extends Error {
  constructor(message, code = 'BALANCE_ERROR') {
    super(message);
    this.name = 'BalanceError';
    this.code = code;
  }
}

export class ChemicalBalancer {
  
  /**
   * Balance a chemical equation
   * @param {Object} options - Balancing options
   * @param {string[]} options.reactants - Array of reactant formulas
   * @param {string[]} options.products - Array of product formulas  
   * @param {string} options.mode - 'standard', 'acidic', or 'basic'
   * @returns {Object} Balancing result
   */
  static balance({ reactants, products, mode = 'standard' }) {
    try {
      const balancer = new ChemicalBalancer(reactants, products, mode);
      return balancer.solve();
    } catch (error) {
      if (error instanceof BalanceError) {
        throw error;
      }
      throw new BalanceError(`Balancing failed: ${error.message}`);
    }
  }
  
  constructor(reactants, products, mode = 'standard') {
    this.reactants = reactants || [];
    this.products = products || [];
    this.mode = mode;
    this.species = [...this.reactants, ...this.products];
    this.addedSpecies = [];
    
    // Parse all formulas
    this.parsed = this.species.map(formula => {
      try {
        return parseFormula(formula);
      } catch (error) {
        throw new BalanceError(`Invalid formula "${formula}": ${error.message}`);
      }
    });
    
    // Collect all elements
    this.elements = this.getAllElements();
    
    // Add redox species if needed
    if (mode === 'acidic' || mode === 'basic') {
      this.addRedoxSpecies();
    }
    
    // Validate input
    this.validateInput();
  }
  
  // Get all unique elements across all species
  getAllElements() {
    const elementSet = new Set();
    
    for (const comp of this.parsed) {
      for (const element of Object.keys(comp.elements)) {
        elementSet.add(element);
      }
    }
    
    return Array.from(elementSet).sort();
  }
  
  // Add H+, H2O, OH-, e- for redox balancing
  addRedoxSpecies() {
    const redoxCandidates = {
      acidic: ['H+', 'H2O', 'e-'],
      basic: ['OH-', 'H2O', 'e-']
    };
    
    const candidates = redoxCandidates[this.mode] || [];
    
    for (const candidate of candidates) {
      if (!this.species.includes(candidate)) {
        this.species.push(candidate);
        this.addedSpecies.push(candidate);
        
        try {
          this.parsed.push(parseFormula(candidate));
        } catch (error) {
          // Handle special electron case
          if (candidate === 'e-') {
            this.parsed.push({ elements: {}, charge: -1 });
          } else {
            throw error;
          }
        }
      }
    }
    
    // Update elements list
    this.elements = this.getAllElements();
  }
  
  // Validate input for balancing
  validateInput() {
    if (this.species.length === 0) {
      throw new BalanceError('No species provided', 'NO_SPECIES');
    }
    
    if (this.species.length > 40) {
      throw new BalanceError('Too many species (maximum 40)', 'TOO_MANY_SPECIES');
    }
    
    // Check for identical species on both sides
    const reactantSet = new Set(this.reactants);
    const productSet = new Set(this.products);
    const common = this.reactants.filter(r => productSet.has(r));
    
    if (common.length > 0) {
      console.warn(`Spectator species detected: ${common.join(', ')}`);
    }
  }
  
  // Build stoichiometric matrix A
  buildMatrix() {
    const numSpecies = this.species.length;
    const hasCharge = this.parsed.some(comp => comp.charge !== 0) || 
                     this.mode === 'acidic' || this.mode === 'basic';
    
    const numRows = this.elements.length + (hasCharge ? 1 : 0);
    const matrix = LinearAlgebra.zeros(numRows, numSpecies);
    
    // Fill element rows
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      
      for (let j = 0; j < numSpecies; j++) {
        const comp = this.parsed[j];
        const count = comp.elements[element] || 0;
        
        // Reactants are negative, products are positive
        const sign = j < this.reactants.length ? -1 : 1;
        matrix[i][j] = new Fraction(sign * count, 1);
      }
    }
    
    // Fill charge row if needed
    if (hasCharge) {
      const chargeRow = this.elements.length;
      
      for (let j = 0; j < numSpecies; j++) {
        const charge = this.parsed[j].charge || 0;
        const sign = j < this.reactants.length ? -1 : 1;
        matrix[chargeRow][j] = new Fraction(sign * charge, 1);
      }
    }
    
    return matrix;
  }
  
  // Find best nullspace vector for balancing
  findBestNullVector(nullBasis) {
    if (nullBasis.length === 0) {
      throw new BalanceError('No solution exists - equation cannot be balanced', 'NO_SOLUTION');
    }
    
    const numProducts = this.products.length;
    const productStart = this.reactants.length;
    
    let bestVector = null;
    let bestScore = Infinity;
    
    // Try different combinations of basis vectors
    for (let i = 0; i < nullBasis.length; i++) {
      const candidates = this.generateCandidates(nullBasis[i]);
      
      for (const candidate of candidates) {
        // Check if at least one product has positive coefficient
        const hasPositiveProduct = candidate.slice(productStart, productStart + numProducts)
          .some(coeff => coeff.gt(0));
        
        if (!hasPositiveProduct) continue;
        
        // Score based on coefficient size and simplicity
        const integers = LinearAlgebra.vectorToIntegers(candidate);
        const maxCoeff = Math.max(...integers.map(Math.abs));
        const sumCoeffs = integers.reduce((sum, c) => sum + Math.abs(c), 0);
        
        const score = maxCoeff * 1000 + sumCoeffs;
        
        if (score < bestScore) {
          bestScore = score;
          bestVector = candidate;
        }
      }
    }
    
    if (!bestVector) {
      throw new BalanceError('No valid solution found', 'NO_VALID_SOLUTION');
    }
    
    return bestVector;
  }
  
  // Generate candidate vectors from a basis vector
  generateCandidates(basisVector) {
    const candidates = [];
    
    // Try the vector as-is and its negation
    candidates.push(basisVector);
    candidates.push(basisVector.map(x => x.neg()));
    
    // Try scaling to make different components positive
    for (let i = 0; i < basisVector.length; i++) {
      if (!basisVector[i].isZero()) {
        const scale = basisVector[i].lt(0) ? new Fraction(-1, 1) : new Fraction(1, 1);
        const scaled = basisVector.map(x => x.mul(scale));
        candidates.push(scaled);
      }
    }
    
    return candidates;
  }
  
  // Main solving method
  solve() {
    const matrix = this.buildMatrix();
    const nullBasis = LinearAlgebra.nullspace(matrix);
    
    if (nullBasis.length === 0) {
      throw new BalanceError('Equation cannot be balanced - no solution exists', 'NO_SOLUTION');
    }
    
    const nullVector = this.findBestNullVector(nullBasis);
    
    // Convert to integer coefficients
    const intCoeffs = LinearAlgebra.vectorToIntegers(nullVector);
    
    // Validate electron balance in redox mode
    if (this.mode === 'acidic' || this.mode === 'basic') {
      this.validateRedoxBalance(intCoeffs);
    }
    
    // Build result
    const coefficients = this.buildCoefficientsResult(intCoeffs);
    
    // Remove species with zero coefficients
    const filteredCoeffs = coefficients.filter(item => item.coeff !== 0);
    const usedAddedSpecies = this.addedSpecies.filter((species, i) => {
      const speciesIndex = this.species.indexOf(species);
      return intCoeffs[speciesIndex] !== 0;
    });
    
    return {
      coefficients: filteredCoeffs,
      addedSpecies: usedAddedSpecies,
      details: {
        matrixA: matrix,
        nullVector: nullVector,
        integerCoefficients: intCoeffs,
        elements: this.elements
      }
    };
  }
  
  // Validate electron balance for redox equations
  validateRedoxBalance(coefficients) {
    const electronIndex = this.species.indexOf('e-');
    
    if (electronIndex !== -1 && coefficients[electronIndex] !== 0) {
      throw new BalanceError(
        'Redox equation is not self-consistent - electrons do not cancel',
        'ELECTRON_IMBALANCE'
      );
    }
  }
  
  // Build coefficients result array
  buildCoefficientsResult(intCoeffs) {
    const result = [];
    
    // Add reactants
    for (let i = 0; i < this.reactants.length; i++) {
      if (intCoeffs[i] !== 0) {
        result.push({
          side: 'reactant',
          species: this.reactants[i],
          coeff: Math.abs(intCoeffs[i])
        });
      }
    }
    
    // Add products (skip electrons in redox mode)
    const productStart = this.reactants.length;
    for (let i = 0; i < this.products.length; i++) {
      const speciesIndex = productStart + i;
      if (intCoeffs[speciesIndex] !== 0) {
        result.push({
          side: 'product',
          species: this.products[i],
          coeff: Math.abs(intCoeffs[speciesIndex])
        });
      }
    }
    
    // Add non-zero added species (except electrons)
    for (const species of this.addedSpecies) {
      if (species === 'e-') continue; // Skip electrons in final result
      
      const speciesIndex = this.species.indexOf(species);
      const coeff = intCoeffs[speciesIndex];
      
      if (coeff !== 0) {
        // Determine side based on coefficient sign and original position
        const side = coeff > 0 ? 'product' : 'reactant';
        
        result.push({
          side: side,
          species: species,
          coeff: Math.abs(coeff)
        });
      }
    }
    
    return result;
  }
  
  // Helper: format balanced equation
  static formatEquation(coefficients) {
    const reactants = coefficients
      .filter(item => item.side === 'reactant')
      .map(item => item.coeff === 1 ? item.species : `${item.coeff} ${item.species}`);
    
    const products = coefficients
      .filter(item => item.side === 'product')
      .map(item => item.coeff === 1 ? item.species : `${item.coeff} ${item.species}`);
    
    return `${reactants.join(' + ')} → ${products.join(' + ')}`;
  }
}

// Export convenience function
export function balanceEquation(reactants, products, mode = 'standard') {
  return ChemicalBalancer.balance({ reactants, products, mode });
}

export default ChemicalBalancer;