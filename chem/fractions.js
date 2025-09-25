/**
 * Exact Fraction arithmetic for chemical equation balancing
 * Avoids floating-point precision issues
 */
export class Fraction {
  constructor(numerator = 0, denominator = 1) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }
    
    // Handle negative denominator
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }
    
    this.n = numerator;
    this.d = denominator;
    this.reduce();
  }
  
  // Create fraction from integer
  static fromInt(n) {
    return new Fraction(n, 1);
  }
  
  // Create fraction from decimal (for input parsing)
  static fromDecimal(decimal, maxDenominator = 1000) {
    if (Number.isInteger(decimal)) {
      return new Fraction(decimal, 1);
    }
    
    // Use continued fractions for best rational approximation
    let sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);
    
    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = Math.floor(decimal);
    
    while (k1 <= maxDenominator) {
      let h = b * h1 + h2;
      let k = b * k1 + k2;
      
      if (k > maxDenominator) break;
      
      if (Math.abs(decimal - h/k) < 1e-15) {
        return new Fraction(sign * h, k);
      }
      
      decimal = 1 / (decimal - b);
      b = Math.floor(decimal);
      
      h2 = h1; h1 = h;
      k2 = k1; k1 = k;
    }
    
    return new Fraction(sign * h1, k1);
  }
  
  // Greatest Common Divisor
  static gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }
  
  // Least Common Multiple  
  static lcm(a, b) {
    return Math.abs(a * b) / Fraction.gcd(a, b);
  }
  
  // Reduce fraction to lowest terms
  reduce() {
    if (this.n === 0) {
      this.d = 1;
      return this;
    }
    
    const gcd = Fraction.gcd(this.n, this.d);
    this.n /= gcd;
    this.d /= gcd;
    return this;
  }
  
  // Arithmetic operations
  add(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }
    return new Fraction(
      this.n * other.d + other.n * this.d,
      this.d * other.d
    );
  }
  
  sub(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }
    return new Fraction(
      this.n * other.d - other.n * this.d,
      this.d * other.d
    );
  }
  
  mul(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }
    return new Fraction(
      this.n * other.n,
      this.d * other.d
    );
  }
  
  div(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }
    if (other.n === 0) {
      throw new Error('Division by zero');
    }
    return new Fraction(
      this.n * other.d,
      this.d * other.n
    );
  }
  
  neg() {
    return new Fraction(-this.n, this.d);
  }
  
  abs() {
    return new Fraction(Math.abs(this.n), this.d);
  }
  
  // Comparison
  cmp(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }
    const diff = this.n * other.d - other.n * this.d;
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
  }
  
  eq(other) {
    return this.cmp(other) === 0;
  }
  
  lt(other) {
    return this.cmp(other) < 0;
  }
  
  gt(other) {
    return this.cmp(other) > 0;
  }
  
  le(other) {
    return this.cmp(other) <= 0;
  }
  
  ge(other) {
    return this.cmp(other) >= 0;
  }
  
  // Check if zero
  isZero() {
    return this.n === 0;
  }
  
  // Check if integer
  isInteger() {
    return this.d === 1;
  }
  
  // Convert to decimal
  toNumber() {
    return this.n / this.d;
  }
  
  // Convert to integer (throws if not integer)
  toInteger() {
    if (this.d !== 1) {
      throw new Error(`Fraction ${this} is not an integer`);
    }
    return this.n;
  }
  
  // String representation
  toString() {
    if (this.d === 1) {
      return this.n.toString();
    }
    return `${this.n}/${this.d}`;
  }
  
  // Clone
  clone() {
    return new Fraction(this.n, this.d);
  }
}

// Helper functions for arrays of fractions
export class FractionUtils {
  // Find GCD of array of integers
  static gcdArray(numbers) {
    if (numbers.length === 0) return 1;
    let result = Math.abs(numbers[0]);
    for (let i = 1; i < numbers.length; i++) {
      result = Fraction.gcd(result, Math.abs(numbers[i]));
      if (result === 1) break;
    }
    return result;
  }
  
  // Find LCM of array of integers
  static lcmArray(numbers) {
    if (numbers.length === 0) return 1;
    let result = Math.abs(numbers[0]);
    for (let i = 1; i < numbers.length; i++) {
      result = Fraction.lcm(result, Math.abs(numbers[i]));
    }
    return result;
  }
  
  // Convert array of fractions to integers by finding common denominator
  static toIntegers(fractions) {
    if (fractions.length === 0) return [];
    
    // Find LCM of all denominators
    const denominators = fractions.map(f => f.d);
    const lcm = this.lcmArray(denominators);
    
    // Scale to integers
    const integers = fractions.map(f => f.n * (lcm / f.d));
    
    // Remove common factor
    const gcd = this.gcdArray(integers);
    return integers.map(n => n / gcd);
  }
  
  // Create zero vector
  static zeroVector(size) {
    return Array(size).fill(0).map(() => new Fraction(0, 1));
  }
  
  // Create identity matrix
  static identityMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      const row = this.zeroVector(size);
      row[i] = new Fraction(1, 1);
      matrix.push(row);
    }
    return matrix;
  }
}