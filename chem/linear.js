/**
 * Linear algebra operations over exact fractions
 * Implements RREF and nullspace computation for chemical equation balancing
 */

import { Fraction, FractionUtils } from './fractions.js';

export class LinearAlgebra {
  
  // Reduced Row Echelon Form (RREF) over fractions
  static rref(matrix) {
    if (!matrix || matrix.length === 0) return { rref: [], rank: 0, pivotCols: [] };
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Deep copy matrix to avoid modifying original
    const A = matrix.map(row => row.map(entry => entry.clone()));
    
    let rank = 0;
    const pivotCols = [];
    
    for (let col = 0; col < cols && rank < rows; col++) {
      // Find pivot row
      let pivotRow = -1;
      for (let row = rank; row < rows; row++) {
        if (!A[row][col].isZero()) {
          pivotRow = row;
          break;
        }
      }
      
      if (pivotRow === -1) continue; // No pivot in this column
      
      // Swap rows if needed
      if (pivotRow !== rank) {
        [A[rank], A[pivotRow]] = [A[pivotRow], A[rank]];
      }
      
      pivotCols.push(col);
      const pivot = A[rank][col];
      
      // Scale pivot row to make pivot = 1
      if (!pivot.eq(1)) {
        for (let j = 0; j < cols; j++) {
          A[rank][j] = A[rank][j].div(pivot);
        }
      }
      
      // Eliminate column above and below pivot
      for (let row = 0; row < rows; row++) {
        if (row !== rank && !A[row][col].isZero()) {
          const factor = A[row][col];
          for (let j = 0; j < cols; j++) {
            A[row][j] = A[row][j].sub(A[rank][j].mul(factor));
          }
        }
      }
      
      rank++;
    }
    
    return {
      rref: A,
      rank: rank,
      pivotCols: pivotCols
    };
  }
  
  // Find nullspace basis of matrix A
  static nullspace(matrix) {
    if (!matrix || matrix.length === 0) return [];
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    const { rref: R, pivotCols } = this.rref(matrix);
    
    // Find free variables (non-pivot columns)
    const freeVars = [];
    for (let j = 0; j < cols; j++) {
      if (!pivotCols.includes(j)) {
        freeVars.push(j);
      }
    }
    
    if (freeVars.length === 0) {
      return []; // Trivial nullspace
    }
    
    // Construct nullspace basis vectors
    const basis = [];
    
    for (const freeVar of freeVars) {
      const nullVector = FractionUtils.zeroVector(cols);
      nullVector[freeVar] = new Fraction(1, 1); // Free variable = 1
      
      // Back-substitute to find pivot variable values
      for (let i = pivotCols.length - 1; i >= 0; i--) {
        const pivotCol = pivotCols[i];
        let sum = new Fraction(0, 1);
        
        // Sum over all columns to the right of pivot
        for (let j = pivotCol + 1; j < cols; j++) {
          sum = sum.add(R[i][j].mul(nullVector[j]));
        }
        
        nullVector[pivotCol] = sum.neg();
      }
      
      basis.push(nullVector);
    }
    
    return basis;
  }
  
  // Find a particular solution to Ax = b
  static solve(A, b) {
    if (!A || A.length === 0 || !b || A.length !== b.length) {
      throw new Error('Invalid matrix dimensions for solve');
    }
    
    const rows = A.length;
    const cols = A[0].length;
    
    // Augment matrix [A|b]
    const augmented = A.map((row, i) => [...row.map(x => x.clone()), b[i].clone()]);
    
    const { rref: R, rank, pivotCols } = this.rref(augmented);
    
    // Check for inconsistency
    for (let i = rank; i < rows; i++) {
      if (!R[i][cols].isZero()) { // Last column (b part) is nonzero but row is zero
        return null; // Inconsistent system
      }
    }
    
    // Construct particular solution
    const solution = FractionUtils.zeroVector(cols);
    
    for (let i = 0; i < rank; i++) {
      const pivotCol = pivotCols[i];
      solution[pivotCol] = R[i][cols]; // Value from augmented column
    }
    
    return solution;
  }
  
  // Check if vector is in nullspace of matrix
  static isInNullspace(matrix, vector, tolerance = 1e-10) {
    const result = this.matrixVectorProduct(matrix, vector);
    return result.every(x => Math.abs(x.toNumber()) < tolerance);
  }
  
  // Matrix-vector multiplication
  static matrixVectorProduct(matrix, vector) {
    if (!matrix || matrix.length === 0 || !vector) {
      throw new Error('Invalid arguments for matrix-vector multiplication');
    }
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    if (vector.length !== cols) {
      throw new Error(`Matrix has ${cols} columns but vector has ${vector.length} elements`);
    }
    
    const result = [];
    
    for (let i = 0; i < rows; i++) {
      let sum = new Fraction(0, 1);
      for (let j = 0; j < cols; j++) {
        sum = sum.add(matrix[i][j].mul(vector[j]));
      }
      result.push(sum);
    }
    
    return result;
  }
  
  // Matrix-matrix multiplication
  static matrixProduct(A, B) {
    if (!A || !B || A.length === 0 || B.length === 0) {
      throw new Error('Invalid matrices for multiplication');
    }
    
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;
    
    if (colsA !== rowsB) {
      throw new Error(`Cannot multiply ${rowsA}×${colsA} matrix by ${rowsB}×${colsB} matrix`);
    }
    
    const result = [];
    
    for (let i = 0; i < rowsA; i++) {
      const row = [];
      for (let j = 0; j < colsB; j++) {
        let sum = new Fraction(0, 1);
        for (let k = 0; k < colsA; k++) {
          sum = sum.add(A[i][k].mul(B[k][j]));
        }
        row.push(sum);
      }
      result.push(row);
    }
    
    return result;
  }
  
  // Transpose matrix
  static transpose(matrix) {
    if (!matrix || matrix.length === 0) return [];
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = [];
    
    for (let j = 0; j < cols; j++) {
      const row = [];
      for (let i = 0; i < rows; i++) {
        row.push(matrix[i][j].clone());
      }
      result.push(row);
    }
    
    return result;
  }
  
  // Get matrix rank
  static rank(matrix) {
    const { rank } = this.rref(matrix);
    return rank;
  }
  
  // Create zero matrix
  static zeros(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix.push(FractionUtils.zeroVector(cols));
    }
    return matrix;
  }
  
  // Create identity matrix
  static identity(size) {
    return FractionUtils.identityMatrix(size);
  }
  
  // Helper: print matrix for debugging
  static printMatrix(matrix, label = '') {
    if (label) console.log(`${label}:`);
    
    for (const row of matrix) {
      const rowStr = row.map(x => x.toString().padStart(8)).join(' ');
      console.log(`[${rowStr} ]`);
    }
    console.log('');
  }
  
  // Helper: convert matrix to decimal for debugging
  static toDecimalMatrix(matrix) {
    return matrix.map(row => row.map(x => x.toNumber()));
  }
  
  // Helper: convert vector to integers by clearing denominators
  static vectorToIntegers(vector) {
    return FractionUtils.toIntegers(vector);
  }
}

export default LinearAlgebra;