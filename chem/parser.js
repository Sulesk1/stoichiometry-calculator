/**
 * Chemical formula parser
 * Converts tokens into composition maps with element counts and charges
 */

import { ChemicalLexer, TokenType } from './lexer.js';

export class ParseError extends Error {
  constructor(message, position = 0) {
    super(message);
    this.name = 'ParseError';
    this.position = position;
  }
}

export class ChemicalParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.length = tokens.length;
  }
  
  // Current token
  current() {
    if (this.position >= this.length) return null;
    return this.tokens[this.position];
  }
  
  // Peek ahead
  peek(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.length) return null;
    return this.tokens[pos];
  }
  
  // Advance position
  advance() {
    this.position++;
  }
  
  // Check if current token matches type
  match(tokenType) {
    const token = this.current();
    return token && token.type === tokenType;
  }
  
  // Consume token of expected type
  consume(tokenType, errorMessage) {
    const token = this.current();
    if (!token || token.type !== tokenType) {
      throw new ParseError(errorMessage, token ? token.position : this.position);
    }
    this.advance();
    return token;
  }
  
  // Parse a number (default 1 if not present)
  parseNumber() {
    if (this.match(TokenType.NUMBER)) {
      const token = this.current();
      this.advance();
      return token.value;
    }
    return 1;
  }
  
  // Parse isotope notation [13C] -> returns {mass: 13, element: 'C'}
  parseIsotope() {
    if (!this.match(TokenType.LBRACKET)) return null;
    
    this.advance(); // consume [
    
    const mass = this.consume(TokenType.NUMBER, 'Expected isotope mass number').value;
    const element = this.consume(TokenType.ELEMENT, 'Expected element symbol after isotope mass').value;
    
    this.consume(TokenType.RBRACKET, 'Expected ] after isotope');
    
    return { mass, element };
  }
  
  // Parse an atom: element or isotope with optional count
  parseAtom() {
    const composition = {};
    let elementKey;
    
    // Check for isotope
    if (this.match(TokenType.LBRACKET)) {
      const isotope = this.parseIsotope();
      elementKey = `${isotope.element}-${isotope.mass}`; // Store as "C-13"
    } else if (this.match(TokenType.ELEMENT)) {
      const element = this.current().value;
      this.advance();
      elementKey = element;
    } else {
      throw new ParseError(`Expected element or isotope, got ${this.current()?.type}`, 
                          this.current()?.position || this.position);
    }
    
    // Parse count
    const count = this.parseNumber();
    composition[elementKey] = count;
    
    return composition;
  }
  
  // Parse a group: (formula) with optional count
  parseGroup() {
    this.consume(TokenType.LPAREN, 'Expected (');
    
    const groupComposition = this.parseFormula();
    
    this.consume(TokenType.RPAREN, 'Expected )');
    
    const multiplier = this.parseNumber();
    
    // Multiply all elements in group by multiplier
    const result = {};
    for (const [element, count] of Object.entries(groupComposition.elements)) {
      result[element] = count * multiplier;
    }
    
    return {
      elements: result,
      charge: groupComposition.charge * multiplier
    };
  }
  
  // Parse hydrate: formula·nH2O
  parseHydrate(baseComposition) {
    if (!this.match(TokenType.DOT)) return baseComposition;
    
    this.advance(); // consume dot
    
    const waterCount = this.parseNumber();
    
    // Expect H2O
    if (!this.match(TokenType.ELEMENT) || this.current().value !== 'H') {
      throw new ParseError('Expected H2O after hydrate dot', this.current()?.position);
    }
    this.advance();
    
    const hydrogenCount = this.parseNumber();
    if (hydrogenCount !== 2) {
      throw new ParseError('Expected H2 in hydrate formula', this.current()?.position);
    }
    
    if (!this.match(TokenType.ELEMENT) || this.current().value !== 'O') {
      throw new ParseError('Expected O after H2 in hydrate', this.current()?.position);
    }
    this.advance();
    
    const oxygenCount = this.parseNumber();
    if (oxygenCount !== 1) {
      throw new ParseError('Expected single O in hydrate formula', this.current()?.position);
    }
    
    // Add water molecules to composition
    const result = { ...baseComposition };
    result.elements = { ...baseComposition.elements };
    result.elements.H = (result.elements.H || 0) + (2 * waterCount);
    result.elements.O = (result.elements.O || 0) + waterCount;
    
    return result;
  }
  
  // Parse main formula
  parseFormula() {
    const elements = {};
    let charge = 0;
    
    while (this.current() && 
           this.current().type !== TokenType.EOF && 
           this.current().type !== TokenType.RPAREN &&
           this.current().type !== TokenType.PHASE) {
      
      let partialComposition;
      
      if (this.match(TokenType.LPAREN)) {
        partialComposition = this.parseGroup();
      } else if (this.match(TokenType.ELEMENT) || this.match(TokenType.LBRACKET)) {
        const atomComposition = this.parseAtom();
        partialComposition = { elements: atomComposition, charge: 0 };
      } else if (this.match(TokenType.CHARGE)) {
        charge += this.current().value;
        this.advance();
        continue;
      } else {
        throw new ParseError(`Unexpected token ${this.current().type}`, 
                           this.current().position);
      }
      
      // Merge compositions
      for (const [element, count] of Object.entries(partialComposition.elements)) {
        elements[element] = (elements[element] || 0) + count;
      }
      charge += partialComposition.charge;
    }
    
    return { elements, charge };
  }
  
  // Parse complete species (formula + optional charge + optional phase)
  parseSpecies() {
    let composition = this.parseFormula();
    
    // Handle charge at end of formula
    if (this.match(TokenType.CHARGE)) {
      composition.charge += this.current().value;
      this.advance();
    }
    
    // Handle hydrates
    composition = this.parseHydrate(composition);
    
    // Handle phase
    let phase = null;
    if (this.match(TokenType.PHASE)) {
      phase = this.current().value;
      this.advance();
    }
    
    return {
      elements: composition.elements,
      charge: composition.charge,
      phase: phase
    };
  }
  
  // Main parse method
  parse() {
    const result = this.parseSpecies();
    
    if (!this.match(TokenType.EOF)) {
      throw new ParseError(`Unexpected token at end: ${this.current().type}`, 
                         this.current().position);
    }
    
    return result;
  }
  
  // Static helper method
  static parse(formula) {
    try {
      const tokens = ChemicalLexer.tokenize(formula);
      const parser = new ChemicalParser(tokens);
      return parser.parse();
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(`Parse error in "${formula}": ${error.message}`, error.position);
      }
      throw error;
    }
  }
}

// Helper function to parse formula string
export function parseFormula(formula) {
  return ChemicalParser.parse(formula);
}

// Helper function to validate formula
export function validateFormula(formula) {
  try {
    parseFormula(formula);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error.message,
      position: error.position 
    };
  }
}

// Helper function to get element list from formula
export function getElements(formula) {
  try {
    const parsed = parseFormula(formula);
    return Object.keys(parsed.elements);
  } catch (error) {
    return [];
  }
}

// Helper function to format parsed composition for display
export function formatComposition(composition) {
  const parts = [];
  
  for (const [element, count] of Object.entries(composition.elements)) {
    if (count === 1) {
      parts.push(element);
    } else {
      parts.push(`${element}${count}`);
    }
  }
  
  let result = parts.join('');
  
  if (composition.charge !== 0) {
    if (composition.charge === 1) {
      result += '+';
    } else if (composition.charge === -1) {
      result += '-';
    } else if (composition.charge > 0) {
      result += `${composition.charge}+`;
    } else {
      result += `${Math.abs(composition.charge)}-`;
    }
  }
  
  if (composition.phase) {
    result += `(${composition.phase})`;
  }
  
  return result;
}

export default ChemicalParser;