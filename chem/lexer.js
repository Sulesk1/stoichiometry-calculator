/**
 * Chemical formula lexer/tokenizer
 * Converts formula strings into tokens for parsing
 */

export const TokenType = {
  ELEMENT: 'ELEMENT',
  NUMBER: 'NUMBER', 
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  CHARGE: 'CHARGE',
  DOT: 'DOT',
  PHASE: 'PHASE',
  EOF: 'EOF'
};

export class Token {
  constructor(type, value, position = 0) {
    this.type = type;
    this.value = value;
    this.position = position;
  }
  
  toString() {
    return `Token(${this.type}, '${this.value}', pos=${this.position})`;
  }
}

export class ChemicalLexer {
  constructor(formula) {
    this.formula = formula.trim();
    this.position = 0;
    this.length = this.formula.length;
  }
  
  // Current character
  current() {
    if (this.position >= this.length) return null;
    return this.formula[this.position];
  }
  
  // Peek ahead
  peek(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.length) return null;
    return this.formula[pos];
  }
  
  // Advance position
  advance() {
    this.position++;
  }
  
  // Skip whitespace
  skipWhitespace() {
    while (this.current() && /\s/.test(this.current())) {
      this.advance();
    }
  }
  
  // Read number
  readNumber() {
    const start = this.position;
    let number = '';
    
    while (this.current() && /\d/.test(this.current())) {
      number += this.current();
      this.advance();
    }
    
    return new Token(TokenType.NUMBER, parseInt(number, 10), start);
  }
  
  // Read element symbol
  readElement() {
    const start = this.position;
    let element = '';
    
    // First character must be uppercase
    if (this.current() && /[A-Z]/.test(this.current())) {
      element += this.current();
      this.advance();
      
      // Second character may be lowercase
      if (this.current() && /[a-z]/.test(this.current())) {
        element += this.current();
        this.advance();
        
        // Third character may be lowercase (for some extended symbols)
        if (this.current() && /[a-z]/.test(this.current()) && 
            ['Uut', 'Uuq', 'Uup', 'Uuh', 'Uus', 'Uuo'].includes(element + this.current())) {
          element += this.current();
          this.advance();
        }
      }
    }
    
    return new Token(TokenType.ELEMENT, element, start);
  }
  
  // Read charge (e.g., 2+, 3-, ^2+, ^3-)
  readCharge() {
    const start = this.position;
    let charge = '';
    
    // Skip optional caret
    if (this.current() === '^') {
      this.advance();
    }
    
    // Read number (optional)
    while (this.current() && /\d/.test(this.current())) {
      charge += this.current();
      this.advance();
    }
    
    // Read sign
    if (this.current() && /[+-]/.test(this.current())) {
      const sign = this.current();
      this.advance();
      
      // If no number was read before sign, check if number comes after
      if (charge === '' && this.current() && /\d/.test(this.current())) {
        while (this.current() && /\d/.test(this.current())) {
          charge += this.current();
          this.advance();
        }
      }
      
      // Default to 1 if no number
      if (charge === '') {
        charge = '1';
      }
      
      const chargeValue = sign === '+' ? parseInt(charge, 10) : -parseInt(charge, 10);
      return new Token(TokenType.CHARGE, chargeValue, start);
    }
    
    return null;
  }
  
  // Read phase notation (s), (l), (g), (aq)
  readPhase() {
    const start = this.position;
    
    if (this.current() === '(' && this.peek()) {
      this.advance(); // skip (
      let phase = '';
      
      while (this.current() && this.current() !== ')') {
        phase += this.current();
        this.advance();
      }
      
      if (this.current() === ')') {
        this.advance(); // skip )
        
        // Validate phase
        if (['s', 'l', 'g', 'aq'].includes(phase.toLowerCase())) {
          return new Token(TokenType.PHASE, phase.toLowerCase(), start);
        }
      }
    }
    
    return null;
  }
  
  // Get next token
  nextToken() {
    this.skipWhitespace();
    
    if (this.position >= this.length) {
      return new Token(TokenType.EOF, null, this.position);
    }
    
    const char = this.current();
    const start = this.position;
    
    // Numbers
    if (/\d/.test(char)) {
      return this.readNumber();
    }
    
    // Elements (uppercase letter)
    if (/[A-Z]/.test(char)) {
      return this.readElement();
    }
    
    // Charges (+ or - or ^ followed by charge)
    if (char === '+' || char === '-' || char === '^') {
      const chargeToken = this.readCharge();
      if (chargeToken) return chargeToken;
    }
    
    // Parentheses
    if (char === '(') {
      // Check if it's a phase first
      const phaseToken = this.readPhase();
      if (phaseToken) return phaseToken;
      
      // Otherwise it's a left parenthesis
      this.advance();
      return new Token(TokenType.LPAREN, '(', start);
    }
    
    if (char === ')') {
      this.advance();
      return new Token(TokenType.RPAREN, ')', start);
    }
    
    // Brackets for isotopes
    if (char === '[') {
      this.advance();
      return new Token(TokenType.LBRACKET, '[', start);
    }
    
    if (char === ']') {
      this.advance();
      return new Token(TokenType.RBRACKET, ']', start);
    }
    
    // Dot for hydrates
    if (char === '.' || char === '·') {
      this.advance();
      return new Token(TokenType.DOT, char, start);
    }
    
    // Skip unknown characters and try next
    this.advance();
    return this.nextToken();
  }
  
  // Get all tokens
  tokenize() {
    const tokens = [];
    let token;
    
    do {
      token = this.nextToken();
      tokens.push(token);
    } while (token.type !== TokenType.EOF);
    
    return tokens;
  }
  
  // Helper: tokenize formula string
  static tokenize(formula) {
    const lexer = new ChemicalLexer(formula);
    return lexer.tokenize();
  }
}

// Export for testing
export { ChemicalLexer as default };