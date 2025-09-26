/**
 * Main Application Logic for Stoichiometry Calculator
 * Handles UI interactions, calculator integration, and user experience
 */

// Unicode normalization for chemical formulas
function normalizeChemInput(s) {
    if (!s) return s;
    
    // Unicode subscript mappings (₀-₉)
    const subMap = { 
        '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4',
        '₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' 
    };
    
    // Unicode superscript mappings (⁰-⁹⁺⁻)
    const supMap = { 
        '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4',
        '⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9',
        '⁺':'+','⁻':'-' 
    };
    
        return s
        .replace(/[₀-₉]/g, c => subMap[c])        // subscripts → digits
        .replace(/[⁰-⁹⁺⁻]/g, c => supMap[c])      // superscripts → digits/signs
        .replace(/[·•]/g, '.')                    // hydrate dot(s)
        .replace(/[−–]/g, '-')                    // minus variants
        .replace(/\s+/g, ' ')                     // collapse whitespace
        .trim();
}

// Validate equation based on selected mode
function validateEquationForMode(reactants, products, mode) {
    const allSpecies = [...reactants, ...products];
    
    if (mode === 'standard') {
        // Standard mode: only neutral molecules allowed
        const chargedSpecies = allSpecies.filter(species => species.charge && species.charge !== 0);
        if (chargedSpecies.length > 0) {
            const examples = chargedSpecies.slice(0, 2).map(s => s.formula + (s.charge > 0 ? '+' : s.charge < 0 ? '-' : '')).join(', ');
            return {
                valid: false,
                error: `Charges aren't supported in Standard mode. Found: ${examples}. Switch to Redox mode to balance ionic equations.`
            };
        }
    } else if (mode === 'redox') {
        // Redox mode: charges are allowed and expected for ionic equations
        // No specific validation needed here - charge balance will be enforced in matrix
    }
    
    return { valid: true };
}// Fraction class for exact arithmetic
class Fraction {
    constructor(num, den = 1) {
        if (den === 0) throw new Error('Division by zero');
        
        // Handle negative denominators
        if (den < 0) {
            num = -num;
            den = -den;
        }
        
        // Reduce to lowest terms
        const g = this.gcd(Math.abs(num), Math.abs(den));
        this.num = num / g;
        this.den = den / g;
    }
    
    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }
    
    add(other) {
        return new Fraction(
            this.num * other.den + other.num * this.den,
            this.den * other.den
        );
    }
    
    subtract(other) {
        return new Fraction(
            this.num * other.den - other.num * this.den,
            this.den * other.den
        );
    }
    
    multiply(other) {
        return new Fraction(this.num * other.num, this.den * other.den);
    }
    
    divide(other) {
        return new Fraction(this.num * other.den, this.den * other.num);
    }
    
    isZero() {
        return this.num === 0;
    }
    
    isNegative() {
        return this.num < 0;
    }
    
    abs() {
        return new Fraction(Math.abs(this.num), this.den);
    }
    
    toNumber() {
        return this.num / this.den;
    }
    
    toString() {
        return this.den === 1 ? this.num.toString() : `${this.num}/${this.den}`;
    }
}

// Parse chemical formula with proper element extraction and phase preservation
function parseChemicalFormula(formula) {
    // Extract coefficient and check for phase notation
    const match = formula.match(/^(\d*)\s*(.+?)(\([slgaq]+\))?$/);
    if (!match) return null;
    const coefficient = match[1] ? parseInt(match[1]) : 1;
    const compoundRaw = match[2];
    const phaseMatch = match[3];
    const phase = phaseMatch ? phaseMatch.slice(1, -1) : null; // Remove parentheses

    // Split hydrate parts at '.' (already normalized from · / •)
    const hydrateParts = compoundRaw.split('.');
    const totalComposition = {};
    let netCharge = 0;

    for (const part of hydrateParts) {
        if (!part) continue;
        // Allow leading multiplier per part (e.g., 5H2O)
        const partMatch = part.match(/^(\d+)?(.*)$/);
        if (!partMatch) continue;
        const partMultiplier = partMatch[1] ? parseInt(partMatch[1]) : 1;
        const partFormula = partMatch[2];

        // Parse one contiguous (possibly bracketed) complex formula segment
        const { composition: segmentComp, charge: segmentCharge } = parseSingleCompoundCore(partFormula);
        if (!segmentComp) continue;
        for (const [el, cnt] of Object.entries(segmentComp)) {
            totalComposition[el] = (totalComposition[el] || 0) + cnt * partMultiplier;
        }
        netCharge += segmentCharge * partMultiplier;
    }

    return {
        formula: compoundRaw,
        originalFormula: formula,
        coefficient,
        composition: totalComposition,
        charge: netCharge,
        phase
    };
}

// Parse a single compound core (no hydrate splitting) allowing (), [] nesting
function parseSingleCompoundCore(compound) {
    const elementsAccumulator = {};
    let charge = 0;
    let index = 0;
    
    function parseGroup() {
        const elements = {};
        
        while (index < compound.length) {
            const char = compound[index];
            
            if (char === '(' || char === '[') {
                index++; // skip '('
                const groupElements = parseGroup();
                if ((char === '(' && compound[index] === ')') || (char === '[' && compound[index] === ']')) {
                    index++; // skip closing
                    const multiplier = parseNumber() || 1;
                    
                    for (const [element, count] of Object.entries(groupElements)) {
                        elements[element] = (elements[element] || 0) + count * multiplier;
                    }
                }
            } else if (char === ')' || char === ']') {
                break;
            } else if (char >= 'A' && char <= 'Z') {
                const element = parseElement();
                const count = parseNumber() || 1;
                elements[element] = (elements[element] || 0) + count;
            } else if (char === '+' || char === '-') {
                // Handle charges
                const sign = char === '+' ? 1 : -1;
                index++;
                const chargeNum = parseNumber() || 1;
                charge += sign * chargeNum;
            } else {
                index++;
            }
        }
        
        return elements;
    }
    
    function parseElement() {
        let element = compound[index++];
        while (index < compound.length && compound[index] >= 'a' && compound[index] <= 'z') {
            element += compound[index++];
        }
        return element;
    }
    
    function parseNumber() {
        let numStr = '';
        while (index < compound.length && compound[index] >= '0' && compound[index] <= '9') {
            numStr += compound[index++];
        }
        return numStr ? parseInt(numStr) : null;
    }
    
    const parsed = parseGroup();
    for (const [el, cnt] of Object.entries(parsed)) {
        elementsAccumulator[el] = (elementsAccumulator[el] || 0) + cnt;
    }
    return { composition: elementsAccumulator, charge };
}

// Strip leading stoichiometric coefficients and parse formula
function parseSpeciesWithLeadingCoeff(speciesString) {
    const trimmed = normalizeChemInput(speciesString.trim());
    
    // Match optional leading coefficient followed by formula
    const coeffMatch = trimmed.match(/^(\d+)?\s*(.+)$/);
    if (!coeffMatch) return null;
    
    const userCoeff = coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
    let formulaPart = coeffMatch[2];
    
    // Robust charge extraction
    const { core: formula, charge } = extractCharge(formulaPart);
    
    // Parse the neutral formula part
    const parsed = parseChemicalFormula(formula);
    if (parsed) {
        // Add charge information
        parsed.charge = charge;
        
        // Ignore user coefficient - let the balancer determine correct coefficients
        // Store the user's attempted coefficient for reference if needed
        parsed.userInputCoefficient = userCoeff;
        return parsed;
    }
    
    return null;
}

// Parse equation into reactants and products with charge-aware tokenization
function parseChemicalEquation(equation) {
    // Normalize Unicode before parsing
    equation = normalizeChemInput(equation);
    
    // Normalize charge notation: MnO4- -> MnO4^-, Fe2+ -> Fe^2+
    equation = equation.replace(/([A-Za-z0-9)\]]+)([0-9]*)([+-])/g, '$1^$2$3');
    
    // Split on equation arrows (→, =>, ->, =)
    const arrowMatch = equation.match(/^(.*?)\s*(?:→|=>|->|=)\s*(.*)$/);
    if (!arrowMatch) return null;
    
    const [, left, right] = arrowMatch;
    if (!left || !right) return null;
    
    // Parse each side using charge-aware tokenization
    let reactants = parseEquationSide(left).filter(r => r);
    let products = parseEquationSide(right).filter(p => p);
    
    // Merge duplicates and cancel spectators
    const simplified = cancelSpectatorsAndMergeDuplicates(reactants, products);
    
    return { 
        reactants: simplified.reactants, 
        products: simplified.products,
        canceledSpectators: simplified.canceledSpectators
    };
}

// Parse one side of equation with charge-aware tokenization
function parseEquationSide(sideString) {
    const species = [];
    
    // First attempt: split on + with spaces (clear separators)
    let tokens = sideString.split(/\s+\+\s+/);

    // If only one token found but string contains '+' not part of charge context, do a more permissive split
    if (tokens.length === 1 && /\+/.test(sideString)) {
        // Replace charge plus signs temporarily (e.g., Na+ -> Na§PLUS§) to avoid splitting them
        const protectedStr = sideString.replace(/([A-Za-z0-9)\]])\+([^-0-9(]|$)/g, (m, before, after) => `${before}§PLUS§${after}`);
        tokens = protectedStr.split(/\+/).map(t => t.replace(/§PLUS§/g, '+'));
    }
    
    for (const token of tokens) {
        const parsed = parseSpeciesWithLeadingCoeff(token.trim());
        if (parsed) {
            species.push(parsed);
        }
    }
    
    return species;
}

// Cancel spectator species and merge duplicate entries
function cancelSpectatorsAndMergeDuplicates(reactants, products) {
    // First merge duplicates on each side
    const mergedReactants = mergeDuplicates(reactants);
    const mergedProducts = mergeDuplicates(products);
    
    // Find spectators (species appearing on both sides)
    const canceledSpectators = [];
    const finalReactants = [];
    const finalProducts = [];
    
    // Copy all species to final arrays initially
    for (const reactant of mergedReactants) {
        finalReactants.push({ ...reactant });
    }
    for (const product of mergedProducts) {
        finalProducts.push({ ...product });
    }
    
    // Look for matching species to cancel
    for (let i = 0; i < finalReactants.length; i++) {
        const reactant = finalReactants[i];
        if (!reactant) continue;
        
        for (let j = 0; j < finalProducts.length; j++) {
            const product = finalProducts[j];
            if (!product) continue;
            
            // Check if same formula (ignoring coefficients)
            if (reactant.formula === product.formula && 
                reactant.charge === product.charge &&
                reactant.phase === product.phase) {
                
                const minCoeff = Math.min(reactant.coefficient, product.coefficient);
                
                if (minCoeff > 0) {
                    canceledSpectators.push({
                        formula: reactant.formula,
                        coefficient: minCoeff,
                        phase: reactant.phase
                    });
                    
                    // Reduce coefficients
                    reactant.coefficient -= minCoeff;
                    product.coefficient -= minCoeff;
                    
                    // Remove if coefficient becomes 0
                    if (reactant.coefficient === 0) {
                        finalReactants[i] = null;
                    }
                    if (product.coefficient === 0) {
                        finalProducts[j] = null;
                    }
                }
            }
        }
    }
    
    return {
        reactants: finalReactants.filter(r => r !== null && r.coefficient > 0),
        products: finalProducts.filter(p => p !== null && p.coefficient > 0),
        canceledSpectators: canceledSpectators
    };
}

// Merge duplicate species by summing coefficients
function mergeDuplicates(species) {
    const merged = [];
    const formulaMap = new Map();
    
    for (const compound of species) {
        const key = `${compound.formula}_${compound.charge || 0}_${compound.phase || ''}`;
        
        if (formulaMap.has(key)) {
            // Add to existing
            const existing = formulaMap.get(key);
            existing.coefficient += compound.coefficient;
        } else {
            // Create new entry
            const newCompound = { ...compound };
            formulaMap.set(key, newCompound);
            merged.push(newCompound);
        }
    }
    
    return merged.filter(compound => compound.coefficient > 0);
}

// Build matrix A for balancing
function buildBalanceMatrix(reactants, products, includeCharge = false) {
    // Validate that every compound has a composition object
    const allCompoundsRaw = [...reactants, ...products];
    for (const c of allCompoundsRaw) {
        if (!c || !c.composition || Object.keys(c.composition).length === 0) {
            throw new Error(`Parse failure for species: ${c && c.originalFormula ? c.originalFormula : 'UNKNOWN'}`);
        }
    }
    const allCompounds = [...reactants, ...products];
    const elements = new Set();
    let hasCharge = false;
    
    // Collect all elements and check for charges
    allCompounds.forEach(compound => {
        Object.keys(compound.composition).forEach(element => elements.add(element));
        if (compound.charge !== 0) hasCharge = true;
    });
    
    const elementList = Array.from(elements);
    const numRows = elementList.length + (includeCharge || hasCharge ? 1 : 0);
    const numCols = allCompounds.length;
    
    // Build matrix A where A*x = 0
    const matrix = [];
    
    // Element balance rows
    elementList.forEach(element => {
        const row = [];
        
        // Reactants (negative coefficients)
        reactants.forEach(compound => {
            const count = compound.composition[element] || 0;
            row.push(new Fraction(-count));
        });
        
        // Products (positive coefficients)  
        products.forEach(compound => {
            const count = compound.composition[element] || 0;
            row.push(new Fraction(count));
        });
        
        matrix.push(row);
    });
    
    // Charge balance row (if needed)
    if (includeCharge || hasCharge) {
        const row = [];
        
        reactants.forEach(compound => {
            row.push(new Fraction(-compound.charge));
        });
        
        products.forEach(compound => {
            row.push(new Fraction(compound.charge));
        });
        
        matrix.push(row);
    }
    
    return { matrix, elements: elementList, compounds: allCompounds };
}

// Compute rational nullspace using Gaussian elimination
function computeNullspace(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Create augmented matrix for row reduction
    const augmented = matrix.map(row => [...row]);
    
    // Gaussian elimination to reduced row echelon form
    let pivot = 0;
    const pivotCols = [];
    
    for (let col = 0; col < cols && pivot < rows; col++) {
        // Find pivot row
        let maxRow = pivot;
        for (let row = pivot + 1; row < rows; row++) {
            if (augmented[row][col].abs().toNumber() > augmented[maxRow][col].abs().toNumber()) {
                maxRow = row;
            }
        }
        
        // Skip if column is zero
        if (augmented[maxRow][col].isZero()) continue;
        
        // Swap rows
        if (maxRow !== pivot) {
            [augmented[pivot], augmented[maxRow]] = [augmented[maxRow], augmented[pivot]];
        }
        
        pivotCols.push(col);
        
        // Make pivot = 1
        const pivotVal = augmented[pivot][col];
        for (let j = 0; j < cols; j++) {
            augmented[pivot][j] = augmented[pivot][j].divide(pivotVal);
        }
        
        // Eliminate column
        for (let row = 0; row < rows; row++) {
            if (row !== pivot && !augmented[row][col].isZero()) {
                const factor = augmented[row][col];
                for (let j = 0; j < cols; j++) {
                    augmented[row][j] = augmented[row][j].subtract(augmented[pivot][j].multiply(factor));
                }
            }
        }
        
        pivot++;
    }
    
    // Find free variables (non-pivot columns)
    const freeVars = [];
    for (let col = 0; col < cols; col++) {
        if (!pivotCols.includes(col)) {
            freeVars.push(col);
        }
    }
    
    if (freeVars.length === 0) {
        return null; // No non-trivial solution
    }
    
    // Generate basis vectors for nullspace
    const nullspaceBasis = [];
    
    freeVars.forEach(freeCol => {
        const solution = new Array(cols).fill(null).map(() => new Fraction(0));
        solution[freeCol] = new Fraction(1);
        
        // Back-substitute to find values of pivot variables
        for (let i = pivotCols.length - 1; i >= 0; i--) {
            const pivotCol = pivotCols[i];
            let sum = new Fraction(0);
            
            for (let j = pivotCol + 1; j < cols; j++) {
                sum = sum.add(augmented[i][j].multiply(solution[j]));
            }
            
            solution[pivotCol] = sum.multiply(new Fraction(-1));
        }
        
        nullspaceBasis.push(solution);
    });
    
    return nullspaceBasis;
}

// Convert fractions to integers and find best solution with strict positivity
function findBestIntegerSolution(nullspaceBasis, numReactants) {
    if (!nullspaceBasis || nullspaceBasis.length === 0) return null;
    
    let bestSolution = null;
    let bestScore = Infinity;
    
    // First try single basis vectors (original approach)
    nullspaceBasis.forEach(originalBasis => {
        // Try both the original vector and its negation
        const candidateVectors = [originalBasis, originalBasis.map(f => f.multiply(new Fraction(-1)))];
        
        for (const basis of candidateVectors) {
            const solution = evaluateNullspaceSolution(basis, numReactants);
            if (solution && solution.score < bestScore) {
                bestScore = solution.score;
                bestSolution = solution.coefficients;
            }
        }
    });
    
    // If no single vector works, try small integer combinations
    if (!bestSolution && nullspaceBasis.length > 1) {
        bestSolution = searchIntegerCombinations(nullspaceBasis, numReactants);
    }
    
    return bestSolution;
}

// Evaluate a nullspace solution vector
function evaluateNullspaceSolution(basis, numReactants) {
    // Convert to integers first to check signs properly
    const integers = convertToIntegers(basis);
    if (!integers) return null;
    
    // Strict validation: ALL reactants must be > 0 AND ALL products must be > 0
    let allReactantsPositive = true;
    let allProductsPositive = true;
    
    // Check reactants (indices 0 to numReactants-1)
    for (let i = 0; i < numReactants; i++) {
        if (integers[i] <= 0) {
            allReactantsPositive = false;
            break;
        }
    }
    
    // Check products (indices numReactants to end)
    for (let i = numReactants; i < integers.length; i++) {
        if (integers[i] <= 0) {
            allProductsPositive = false;
            break;
        }
    }
    
    // Only accept candidates where all coefficients are positive on their respective sides
    if (allReactantsPositive && allProductsPositive) {
        const maxCoeff = Math.max(...integers);
        const sumCoeff = integers.reduce((a, b) => a + b, 0);
        const score = maxCoeff * 1000 + sumCoeff; // Prefer smaller max, then smaller sum
        
        return { coefficients: integers, score };
    }
    
    return null;
}

// Search for integer combinations of basis vectors
function searchIntegerCombinations(nullspaceBasis, numReactants) {
    let bestSolution = null;
    let bestScore = Infinity;
    
    const maxWeight = 3; // Try weights from -3 to 3
    const numBasis = Math.min(nullspaceBasis.length, 3); // Limit to first 3 basis vectors for performance
    
    // Generate all combinations of small integer weights
    function generateWeights(depth, currentWeights) {
        if (depth === numBasis) {
            // Skip the all-zeros combination
            if (currentWeights.every(w => w === 0)) return;
            
            // Compute linear combination
            let combined = nullspaceBasis[0].map(() => new Fraction(0));
            for (let i = 0; i < numBasis; i++) {
                const weight = new Fraction(currentWeights[i]);
                for (let j = 0; j < combined.length; j++) {
                    combined[j] = combined[j].add(nullspaceBasis[i][j].multiply(weight));
                }
            }
            
            // Try both this combination and its negation
            const candidates = [combined, combined.map(f => f.multiply(new Fraction(-1)))];
            
            for (const candidate of candidates) {
                const solution = evaluateNullspaceSolution(candidate, numReactants);
                if (solution && solution.score < bestScore) {
                    bestScore = solution.score;
                    bestSolution = solution.coefficients;
                }
            }
            return;
        }
        
        // Try all weights for current basis vector
        for (let weight = -maxWeight; weight <= maxWeight; weight++) {
            currentWeights[depth] = weight;
            generateWeights(depth + 1, currentWeights);
        }
    }
    
    generateWeights(0, new Array(numBasis));
    return bestSolution;
}

// Convert fraction vector to positive integers
function convertToIntegers(fractions) {
    // Find LCM of all denominators
    let lcm = 1;
    fractions.forEach(f => {
        if (!f.isZero()) {
            lcm = lcmTwo(lcm, f.den);
        }
    });
    
    // Scale to integers
    const integers = fractions.map(f => Math.round(f.multiply(new Fraction(lcm)).toNumber()));
    
    // Make all positive
    const minVal = Math.min(...integers);
    if (minVal < 0) {
        for (let i = 0; i < integers.length; i++) {
            integers[i] = -integers[i];
        }
    }
    
    // Reduce by GCD
    const gcdVal = integers.reduce((g, val) => val === 0 ? g : gcdTwo(g, Math.abs(val)), 0);
    if (gcdVal > 1) {
        for (let i = 0; i < integers.length; i++) {
            integers[i] = integers[i] / gcdVal;
        }
    }
    
    return integers;
}

function gcdTwo(a, b) {
    return b === 0 ? a : gcdTwo(b, a % b);
}

function lcmTwo(a, b) {
    return Math.abs(a * b) / gcdTwo(a, b);
}

// Heuristic diagnostic for charge imbalance with optional suggestions
function attemptChargeMismatchDiagnostic(reactants, products, redoxAnalysis, reason) {
    try {
        const elementOnly = buildBalanceMatrix(reactants, products, false);
        const nullspaceElementOnly = computeNullspace(elementOnly.matrix);
        if (!nullspaceElementOnly) return null; // even elements won't balance
        const coeffsElementOnly = findBestIntegerSolution(nullspaceElementOnly, reactants.length);
        if (!coeffsElementOnly) return null;
        // Compute charges under that element-only balance
        const reactantCharge = reactants.reduce((sum, c, i) => sum + (c.charge || 0) * coeffsElementOnly[i], 0);
        const productCharge = products.reduce((sum, c, i) => sum + (c.charge || 0) * coeffsElementOnly[reactants.length + i], 0);
        if (reactantCharge === productCharge) return null; // Not purely charge caused

        const rStr = reactants.map((c, i) => {
            const k = coeffsElementOnly[i];
            const phase = c.phase ? `(${c.phase})` : '';
            return (k > 1 ? k + ' ' : '') + c.formula + phase;
        }).join(' + ');
        const pStr = products.map((c, i) => {
            const k = coeffsElementOnly[reactants.length + i];
            const phase = c.phase ? `(${c.phase})` : '';
            return (k > 1 ? k + ' ' : '') + c.formula + phase;
        }).join(' + ');

        // Build suggestions
        const suggestions = [];

        // 1. Prussian blue family heuristic
        const hasFerrocyanide = [...reactants, ...products].some(c => /\[Fe\(CN\)6\]/.test(c.formula));
        const hasFreeFe3 = reactants.some(c => /^Fe\^?3\+?$/.test(c.originalFormula || c.formula)) || products.some(c => /^Fe\^?3\+?$/.test(c.originalFormula || c.formula));
        const productHasMixed = products.some(c => /Fe\[Fe\(CN\)6\]/.test(c.formula));
        if (hasFerrocyanide && (hasFreeFe3 || productHasMixed)) {
            suggestions.push('Typical neutral complex: 4 Fe^3+ + 3 [Fe(CN)6]^4- → Fe4[Fe(CN)6]3');
            suggestions.push('Shorthand variants: Fe3[Fe(CN)6]2 (different lattice hydration)');
        }

        // 2. Counter-ion inference (simple): determine minimal monatomic ions to neutralize
        const netDelta = productCharge - reactantCharge; // what difference exists after element-only attempt
        if (netDelta !== 0) {
            // Suggest adding counter-ions WITHOUT altering existing species counts
            const counterSuggestions = inferCounterIons(netDelta);
            if (counterSuggestions.length) {
                suggestions.push('Add counter-ions: ' + counterSuggestions.join(' or '));
            }
        }

        // 3. If product appears neutral but reactant net charge non-zero, hint missing spectator salt
        if (reactantCharge !== 0 && productCharge === 0) {
            suggestions.push('Reaction may require spectator ions (e.g., K+, Na+, Cl-, NO3-) or precipitation form.');
        }

        const suggestionText = suggestions.length ? '\nSuggestions: ' + suggestions.join(' | ') : '';

        return {
            success: false,
            error: `Charge imbalance detected (reactants ${reactantCharge}, products ${productCharge}). Elements could balance as: ${rStr} → ${pStr}.${suggestionText}`,
            redoxAnalysis,
            diagnostic: {
                type: 'CHARGE_IMBALANCE',
                reason,
                elementBalancedEquation: `${rStr} → ${pStr}`,
                reactantCharge,
                productCharge,
                suggestions
            }
        };
    } catch (e) {
        return null; // Fail silently; original error path will report
    }
}

// Infer simple counter-ions set to neutralize a net charge difference (positive means products higher)
function inferCounterIons(netDelta) {
    const suggestions = [];
    // If products have higher charge (netDelta > 0), need anions on product side or cations on reactant side
    // We'll just suggest adding ions to the deficient side conceptually.
    const abs = Math.abs(netDelta);
    if (abs === 0) return suggestions;
    // Provide a few canonical sets: monovalent, divalent combos
    const ionSets = [
        { ion: netDelta > 0 ? 'Cl-' : 'K+', charge: netDelta > 0 ? -1 : +1 },
        { ion: netDelta > 0 ? 'NO3-' : 'Na+', charge: netDelta > 0 ? -1 : +1 },
        { ion: netDelta > 0 ? 'SO4^2-' : 'Ca^2+', charge: netDelta > 0 ? -2 : +2 }
    ];
    ionSets.forEach(set => {
        const count = Math.ceil(abs / Math.abs(set.charge));
        const total = count * set.charge;
        if (total === (netDelta > 0 ? -abs : abs) || Math.sign(total) !== Math.sign(netDelta)) {
            suggestions.push(`${count} ${set.ion}`);
        }
    });
    return suggestions;
}

// Detect common stoichiometry errors and suggest corrections
function detectCommonStoichiometryErrors(reactants, products) {
    const hints = [];
    
    // Check for missing subscripts in ionic compounds
    const checkMissingSubscripts = (species, side) => {
        for (const compound of species) {
            const formula = compound.formula;
            // Pattern: Metal + halide without proper subscript (e.g., CaCl should be CaCl2)
            if (/^(Ca|Mg|Ba|Sr|Zn|Cd|Pb|Sn)(Cl|Br|I|F)$/.test(formula)) {
                hints.push(`${formula} should likely be ${formula}2 (divalent metal + monovalent anion)`);
            }
            // Pattern: Metal + sulfate/carbonate without subscript
            if (/^(Na|K|Li|Ag)(SO4|CO3|CrO4)$/.test(formula)) {
                hints.push(`${formula} should likely be ${formula.charAt(0)}2${formula.slice(1)} (monovalent metal + divalent anion)`);
            }
        }
    };
    
    checkMissingSubscripts(reactants, 'reactants');
    checkMissingSubscripts(products, 'products');
    
    // Check for incomplete redox equations (missing H+, OH-, H2O)
    const hasChargedSpecies = [...reactants, ...products].some(c => c.charge !== 0);
    const hasRedoxIndicators = [...reactants, ...products].some(c => 
        /MnO4|Cr2O7|NO3|ClO/.test(c.formula)
    );
    if (hasChargedSpecies && hasRedoxIndicators) {
        const hasProton = [...reactants, ...products].some(c => c.formula === 'H' && c.charge === 1);
        const hasWater = [...reactants, ...products].some(c => c.formula === 'H2O');
        if (!hasProton && !hasWater) {
            hints.push('Redox equations often need H+, OH-, or H2O for complete balance');
        }
        
        // Suggest common redox completions
        const completionSuggestions = suggestRedoxCompletion(reactants, products);
        if (completionSuggestions.length > 0) {
            hints.push('Try: ' + completionSuggestions.join(' or '));
        }
    }
    
    return hints;
}

// Suggest proper redox equation completion based on common patterns
function suggestRedoxCompletion(reactants, products) {
    const suggestions = [];
    const rFormulas = reactants.map(r => r.formula);
    const pFormulas = products.map(p => p.formula);
    
    // MnO4- + Fe2+ pattern
    if (rFormulas.includes('MnO4') && rFormulas.includes('Fe') && pFormulas.includes('Mn') && pFormulas.includes('Fe')) {
        suggestions.push('MnO4^- + 5Fe^2+ + 8H+ → Mn^2+ + 5Fe^3+ + 4H2O');
    }
    
    // Cr2O7^2- + Fe2+ pattern  
    if (rFormulas.includes('Cr2O7') && rFormulas.includes('Fe') && pFormulas.includes('Cr') && pFormulas.includes('Fe')) {
        suggestions.push('Cr2O7^2- + 6Fe^2+ + 14H+ → 2Cr^3+ + 6Fe^3+ + 7H2O');
    }
    
    // MnO4- + I- pattern
    if (rFormulas.includes('MnO4') && rFormulas.includes('I') && pFormulas.includes('Mn') && pFormulas.includes('I2')) {
        suggestions.push('2MnO4^- + 10I^- + 16H+ → 2Mn^2+ + 5I2 + 8H2O');
    }
    
    // MnO4- + C2O4^2- pattern
    if (rFormulas.includes('MnO4') && rFormulas.includes('C2O4') && pFormulas.includes('Mn') && pFormulas.includes('CO2')) {
        suggestions.push('2MnO4^- + 5C2O4^2- + 16H+ → 2Mn^2+ + 10CO2 + 8H2O');
    }
    
    // Cr2O7^2- + H2S pattern
    if (rFormulas.includes('Cr2O7') && rFormulas.includes('H2S') && pFormulas.includes('Cr') && pFormulas.includes('S')) {
        suggestions.push('Cr2O7^2- + 3H2S + 8H+ → 2Cr^3+ + 3S + 7H2O');
    }
    
    // NO3- + Cu pattern
    if (rFormulas.includes('NO3') && rFormulas.includes('Cu') && pFormulas.includes('NO') && pFormulas.includes('Cu')) {
        suggestions.push('2NO3^- + 3Cu + 8H+ → 2NO + 3Cu^2+ + 4H2O');
    }
    
    // ClO3- + I- pattern
    if (rFormulas.includes('ClO3') && rFormulas.includes('I') && pFormulas.includes('Cl') && pFormulas.includes('I2')) {
        suggestions.push('ClO3^- + 6I^- + 6H+ → Cl^- + 3I2 + 3H2O');
    }
    
    return suggestions;
}

// Main balancing function with mode validation
function balanceChemicalEquation(equation, mode = 'standard') {
    try {
        // Handle 'no reaction' cases gracefully
        if (/no\s+reaction/i.test(equation)) {
            return { success: false, error: 'No reaction occurs under standard conditions.' };
        }
        
        const parsed = parseChemicalEquation(equation);
        if (!parsed) {
            return { success: false, error: 'Invalid equation format. Use = or → to separate reactants and products.' };
        }
        
        const { reactants, products } = parsed;
        
        // Validate mode-specific constraints
        const validation = validateEquationForMode(reactants, products, mode);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        
        // Analyze oxidation states to detect true redox (robust + guarded)
        let redoxAnalysis = { isRedox: false };
        try {
            // Skip complex coordination species for OS detection to avoid crashes (e.g., brackets or multiple metals)
            const hasComplex = [...reactants, ...products].some(s => /\[|\].*[A-Z].*\[/.test(s.originalFormula || s.formula) || /\[/.test(s.formula));
            if (!hasComplex) {
                const osEngine = new OxidationStateEngine();
                redoxAnalysis = osEngine.analyzeRedoxReaction(reactants, products);
            }
        } catch (e) {
            redoxAnalysis = { isRedox: false, error: 'Redox analysis skipped: ' + e.message };
        }
        const isActuallyRedox = redoxAnalysis.isRedox;
        
        // Use charge balance in Redox mode
        const useChargeBalance = mode === 'redox';
        const { matrix, elements, compounds } = buildBalanceMatrix(reactants, products, useChargeBalance);
        
        const nullspace = computeNullspace(matrix);
        if (!nullspace) {
            let fallbackResult = null;
            if (useChargeBalance) {
                fallbackResult = attemptChargeMismatchDiagnostic(reactants, products, redoxAnalysis, 'NO_NULLSPACE');
                if (fallbackResult) return fallbackResult;
            }
            // Enhanced error message with common chemistry hints
            let errorMsg = 'No solution exists. Check if the equation is chemically valid.';
            const commonHints = detectCommonStoichiometryErrors(reactants, products);
            if (commonHints.length > 0) {
                errorMsg += ' Hints: ' + commonHints.join('; ');
            }
            return { success: false, error: errorMsg, redoxAnalysis };
        }
        
        const coefficients = findBestIntegerSolution(nullspace, reactants.length);
        if (!coefficients) {
            let fallbackResult = null;
            if (useChargeBalance) {
                fallbackResult = attemptChargeMismatchDiagnostic(reactants, products, redoxAnalysis, 'NO_VALID_VECTOR');
                if (fallbackResult) return fallbackResult;
            }
            return { success: false, error: 'Could not find integer solution.', redoxAnalysis };
        }
        
        // Format result with preserved phases
        const reactantStrs = reactants.map((compound, i) => {
            const coeff = coefficients[i];
            const coeffStr = coeff > 1 ? coeff : '';
            const phase = compound.phase ? `(${compound.phase})` : '';
            return coeffStr + compound.formula + phase;
        });
        
        const productStrs = products.map((compound, i) => {
            const coeff = coefficients[reactants.length + i];
            const coeffStr = coeff > 1 ? coeff : '';
            const phase = compound.phase ? `(${compound.phase})` : '';
            return coeffStr + compound.formula + phase;
        });
        
        const balanced = reactantStrs.join(' + ') + ' → ' + productStrs.join(' + ');
        
        return {
            success: true,
            balanced: balanced,
            coefficients: coefficients,
            reactants: reactants,
            products: products,
            original: equation,
            redoxAnalysis: redoxAnalysis,
            isRedox: isActuallyRedox,
            elements: elements
        };
        
    } catch (error) {
        // Try to provide redox completion suggestions for incomplete equations
        if (equation.includes('+') && equation.includes('→')) {
            try {
                const parts = equation.split('→');
                if (parts.length === 2) {
                    const reactants = parseSpeciesList(parts[0]);
                    const products = parseSpeciesList(parts[1]);
                    const suggestions = suggestRedoxCompletion(reactants, products);
                    
                    if (suggestions.length > 0) {
                        return {
                            success: false,
                            error: `Balancing error: ${error.message}`,
                            suggestions: suggestions,
                            hint: 'Try this complete redox equation:'
                        };
                    }
                }
            } catch (suggestionError) {
                // Silently continue if suggestion fails
            }
        }
        
        return { success: false, error: `Balancing error: ${error.message}` };
    }
}

/**
 * Main Application Class
 */
class StoichiometryCalculator {
    constructor() {
        this.currentEquation = null;
        this.currentMode = 'standard';
        
        this.init();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
    }

    /**
     * Initialize the application
     */
    init() {
        // Load saved preferences
        this.loadPreferences();
        
        // Set initial focus
        const equationInput = document.getElementById('equation-input');
        if (equationInput) {
            equationInput.focus();
        }

        // Show example if no equation present
        this.showExample();
        
        // Initialize FAQ interactions
        this.initializeFAQ();
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Equation input
        const equationInput = document.getElementById('equation-input');
        if (equationInput) {
            equationInput.addEventListener('input', this.handleEquationInput.bind(this));
            equationInput.addEventListener('keydown', this.handleEquationKeydown.bind(this));
        }

        // Mode selection
        const modeInputs = document.querySelectorAll('input[name="calculation-mode"]');
        modeInputs.forEach(input => {
            input.addEventListener('change', this.handleModeChange.bind(this));
        });

        // Balance button
        const balanceBtn = document.getElementById('balance-btn');
        if (balanceBtn) {
            balanceBtn.addEventListener('click', this.handleBalance.bind(this));
        }

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', this.handleClear.bind(this));
        }

        // Examples dropdown button
        const examplesBtn = document.getElementById('examples-btn');
        if (examplesBtn) {
            examplesBtn.addEventListener('click', this.handleExamplesToggle.bind(this));
        }

        // Example menu items
        const exampleItems = document.querySelectorAll('[data-example]');
        exampleItems.forEach(item => {
            item.addEventListener('click', this.handleExampleSelect.bind(this));
        });

        // Copy result button
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', this.handleCopy.bind(this));
        }

        // Redox medium selection
        const mediumSelect = document.getElementById('redox-medium');
        if (mediumSelect) {
            mediumSelect.addEventListener('change', this.handleMediumChange.bind(this));
        }

        // Stoichiometry inputs
        const stoichInputs = document.querySelectorAll('.stoich-input input[type="number"]');
        stoichInputs.forEach(input => {
            input.addEventListener('input', this.handleStoichInput.bind(this));
        });

        // Unit selects
        const unitSelects = document.querySelectorAll('.stoich-input select');
        unitSelects.forEach(select => {
            select.addEventListener('change', this.handleStoichInput.bind(this));
        });

        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.savePreferences.bind(this));
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter: Balance equation
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.handleBalance();
            }
            
            // Ctrl+L: Clear
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                this.handleClear();
            }
            
            // Ctrl+E: Example
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.handleExample();
            }
            
            // Escape: Clear focus from inputs
            if (e.key === 'Escape') {
                document.activeElement.blur();
            }
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add role and aria-label to interactive elements
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (!btn.hasAttribute('aria-label') && btn.textContent.trim()) {
                btn.setAttribute('aria-label', btn.textContent.trim());
            }
        });

        // Setup live regions for announcements
        this.createLiveRegion();
    }

    /**
     * Create ARIA live region for screen reader announcements
     */
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }

    /**
     * Announce message to screen readers
     * @param {string} message
     */
    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    /**
     * Handle equation input changes
     * @param {Event} e
     */
    handleEquationInput(e) {
        const equation = e.target.value.trim();
        
        // Clear previous results and messages
        this.clearMessages();
        this.clearResults();
        
        // Enable/disable balance button
        const balanceBtn = document.getElementById('balance-btn');
        if (balanceBtn) {
            balanceBtn.disabled = !equation;
        }
        
        // Show suggestions for common mistakes
        this.showInputSuggestions(equation);
        
        // Auto-balance if preference is set (debounced)
        if (this.preferences && this.preferences.autoBalance) {
            clearTimeout(this.autoBalanceTimeout);
            this.autoBalanceTimeout = setTimeout(() => {
                if (equation && equation.includes('=')) {
                    this.performBalance();
                }
            }, 1000);
        }
    }

    /**
     * Handle equation input keydown
     * @param {Event} e
     */
    handleEquationKeydown(e) {
        // Insert common symbols with shortcuts
        if (e.altKey) {
            switch (e.key) {
                case '2':
                    e.preventDefault();
                    this.insertAtCursor('₂');
                    break;
                case '3':
                    e.preventDefault();
                    this.insertAtCursor('₃');
                    break;
                case '+':
                    e.preventDefault();
                    this.insertAtCursor('⁺');
                    break;
                case '-':
                    e.preventDefault();
                    this.insertAtCursor('⁻');
                    break;
                case '>':
                    e.preventDefault();
                    this.insertAtCursor('→');
                    break;
            }
        }
    }

    /**
     * Insert text at cursor position
     * @param {string} text
     */
    insertAtCursor(text) {
        const input = document.getElementById('equation-input');
        if (!input) return;
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;
        
        input.value = value.substring(0, start) + text + value.substring(end);
        input.selectionStart = input.selectionEnd = start + text.length;
        
        // Trigger input event
        input.dispatchEvent(new Event('input'));
    }

    /**
     * Handle mode change
     * @param {Event} e
     */
    handleModeChange(e) {
        this.currentMode = e.target.value;
        this.updateUIForMode();
        this.clearResults();
        this.savePreferences();
    }

    /**
     * Update UI based on selected mode
     */
    updateUIForMode() {
        // Currently only Standard and Redox modes are supported
        // Additional UI elements can be shown/hidden based on mode if needed
        
        // Update input placeholder based on mode
        const input = document.getElementById('equation-input');
        if (input) {
            if (this.currentMode === 'redox') {
                input.placeholder = "Fe²⁺ + Cr₂O₇²⁻ + H⁺ → Fe³⁺ + Cr³⁺ + H₂O";
            } else {
                input.placeholder = "C₃H₈ + O₂ → CO₂ + H₂O";
            }
        }
        
        // Update examples based on mode
        this.updateExamplesForMode();
    }
    
    /**
     * Update examples dropdown based on mode
     */
    updateExamplesForMode() {
        const exampleItems = document.querySelectorAll('[data-example]');
        exampleItems.forEach(item => {
            const example = item.getAttribute('data-example');
            const isRedox = ['redox-acidic', 'redox-basic'].includes(example);
            
            if (this.currentMode === 'standard' && isRedox) {
                item.style.display = 'none';
            } else if (this.currentMode === 'redox' && !isRedox && example !== 'combustion') {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
            }
        });
    }

    /**
     * Handle balance button click
     */
    handleBalance() {
        this.performBalance();
    }

    /**
     * Perform equation balancing
     */
    async performBalance() {
        const equationInput = document.getElementById('equation-input');
        if (!equationInput) return;
        
        const equation = equationInput.value.trim();
        if (!equation) {
            this.showError('Please enter a chemical equation to balance.');
            return;
        }

        // Show loading state
        this.setLoading(true);
        
        try {
            const result = await this.balanceEquation(equation);
            
            if (result.success) {
                this.displayResult(result);
                this.currentEquation = result;
                this.updateStoichiometry();
                this.showSuccess('Equation balanced successfully!');
                this.announce('Equation balanced successfully');
            } else {
                let errorMessage = result.error || 'Failed to balance equation.';
                
                // Display suggestions if available
                if (result.suggestions && result.suggestions.length > 0) {
                    errorMessage += '\n\n' + (result.hint || 'Suggestions:') + '\n' + 
                                   result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
                }
                
                this.showError(errorMessage);
                this.announce('Balancing failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            this.showError('An unexpected error occurred: ' + error.message);
            this.announce('Balancing failed due to an error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Balance chemical equation using matrix nullspace method
     * @param {string} equation
     * @returns {Promise<Object>}
     */
    async balanceEquation(equation) {
        try {
            const result = balanceChemicalEquation(equation, this.currentMode);
            
            if (result.success) {
                // Add coefficient information for display
                result.coefficients = result.coefficients.map(c => ({ 
                    toNumber: () => c,
                    toString: () => c.toString()
                }));
            }
            
            return result;
        } catch (error) {
            return { success: false, error: `Unexpected error: ${error.message}` };
        }
    }



    /**
     * Format balanced equation for display - simplified
     */
    formatBalancedEquation(coefficients, reactants, products) {
        // Simplified placeholder
        return 'Equation formatting will be available in full version';
    }

    /**
     * Display balanced equation result
     * @param {Object} result
     */
    displayResult(result) {
        const resultDiv = document.getElementById('equation-result');
        if (!resultDiv) return;

        resultDiv.innerHTML = `
            <div class="balanced-equation">
                ${this.formatChemicalFormula(result.balanced)}
            </div>
        `;

        // Show copy button
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.style.display = 'inline-flex';
        }

        // Show details if available
        if (result.matrix || result.details) {
            this.displayDetails(result);
        }
    }

    /**
     * Format chemical formula with proper subscripts and superscripts
     * @param {string} formula
     * @returns {string}
     */
    formatChemicalFormula(formula) {
        return formula
            // First handle coefficients (numbers at start or after spaces/+) - keep as regular numbers
            .replace(/(^|\s|\+\s*)(\d+)([A-Z])/g, '$1$2$3')
            // Then handle subscripts (numbers after elements) - make subscript
            .replace(/([A-Za-z])(\d+)/g, '$1<sub>$2</sub>')
            // Handle superscripts for charges
            .replace(/\^(\d*[\+\-])/g, '<sup>$1</sup>')
            // Style operators
            .replace(/\+/g, ' + ')
            .replace(/→/g, ' → ');
    }

    /**
     * Display calculation details
     * @param {Object} result
     */
    displayDetails(result) {
        const detailsContainer = document.querySelector('.details-content');
        if (!detailsContainer) return;

        let detailsHTML = '<div class="calculation-explanation">';
        
        // Basic balancing explanation
        detailsHTML += `
            <h4>🧮 Balancing Method</h4>
            <p>This equation was balanced using <strong>matrix nullspace analysis</strong>:</p>
            <ol>
                <li><strong>Parse</strong>: Extract all elements from each compound</li>
                <li><strong>Matrix</strong>: Build element balance equations (Ax = 0)</li>
                <li><strong>Solve</strong>: Find rational nullspace using Gaussian elimination</li>
                <li><strong>Scale</strong>: Convert to smallest positive integer coefficients</li>
            </ol>
        `;

        // Show element analysis
        if (result.reactants && result.products) {
            const allCompounds = [...result.reactants, ...result.products];
            const elements = new Set();
            
            allCompounds.forEach(compound => {
                Object.keys(compound.composition).forEach(element => {
                    elements.add(element);
                });
            });

            detailsHTML += `
                <h4>🔬 Element Analysis</h4>
                <p><strong>Elements present:</strong> ${Array.from(elements).join(', ')}</p>
                <p><strong>Compounds:</strong> ${allCompounds.length} total (${result.reactants.length} reactants, ${result.products.length} products)</p>
            `;
        }

        // Show coefficients breakdown
        if (result.coefficients) {
            detailsHTML += `
                <h4>⚖️ Coefficient Breakdown</h4>
                <div class="coefficients-grid">
            `;
            
            const allCompounds = [...(result.reactants || []), ...(result.products || [])];
            result.coefficients.forEach((coeff, index) => {
                const compound = allCompounds[index];
                const isReactant = index < (result.reactants?.length || 0);
                detailsHTML += `
                    <div class="coeff-item">
                        <span class="coeff-number">${coeff}</span>
                        <span class="coeff-formula">${compound?.formula || 'Unknown'}</span>
                        <span class="coeff-role">${isReactant ? 'reactant' : 'product'}</span>
                    </div>
                `;
            });
            
            detailsHTML += '</div>';
        }

        // Redox analysis if available
        if (result.redoxAnalysis) {
            const redox = result.redoxAnalysis;
            
            if (redox.isRedox) {
                detailsHTML += `
                    <h4>⚡ Redox Analysis</h4>
                    <p><strong>This IS a redox reaction!</strong> Oxidation states change.</p>
                `;
                
                // Show oxidation state changes
                if (Object.keys(redox.osChanges).length > 0) {
                    detailsHTML += '<div class="redox-changes">';
                    for (const [element, change] of Object.entries(redox.osChanges)) {
                        const direction = change.oxidized && change.reduced ? 'both oxidized & reduced' :
                                        change.oxidized ? 'oxidized' : 'reduced';
                        const color = change.oxidized && !change.reduced ? '#dc2626' : 
                                    change.reduced && !change.oxidized ? '#059669' : '#7c3aed';
                        
                        detailsHTML += `
                            <div class="os-change" style="border-left: 3px solid ${color};">
                                <strong>${element}</strong>: ${direction}
                                <br><small>OS: [${change.reactantRange.join(', ')}] → [${change.productRange.join(', ')}]</small>
                            </div>
                        `;
                    }
                    detailsHTML += '</div>';
                }
                
                // Show electron transfer
                if (redox.electronTransfer > 0) {
                    detailsHTML += `<p><strong>Electrons transferred:</strong> ${redox.electronTransfer}</p>`;
                }
                
            } else {
                detailsHTML += `
                    <h4>⚖️ Not a Redox Reaction</h4>
                    <p>No oxidation state changes detected - this is an acid-base, precipitation, or other non-redox reaction.</p>
                `;
            }
        } else if (this.currentMode === 'redox') {
            detailsHTML += `
                <h4>⚡ Redox Mode</h4>
                <p>Redox balancing mode includes charge balance constraints.</p>
                <p>The algorithm automatically balances both mass and charge conservation.</p>
            `;
        }

        detailsHTML += `
            <div class="method-note">
                <p><strong>Note:</strong> This uses exact rational arithmetic (no floating-point errors) 
                and guaranteed mathematical correctness through linear algebra.</p>
            </div>
        `;
        
        detailsHTML += '</div>';
        detailsContainer.innerHTML = detailsHTML;
    }

    /**
     * Format matrix for display - simplified
     */
    formatMatrix(matrix) {
        return 'Matrix display will be available in full version';
    }

    /**
     * Update stoichiometry calculations
     */
    updateStoichiometry() {
        if (!this.currentEquation) return;
        
        // Simplified - show placeholder for now
        const results = document.getElementById('stoich-results');
        if (results) {
            results.innerHTML = '<p>Stoichiometry calculations will be available in the full version.</p>';
        }
    }

    /**
     * Calculate molar masses for compounds - simplified
     */
    calculateMolarMasses() {
        // Simplified - placeholder for now
        console.log('Molar mass calculations will be available in full version');
    }

    /**
     * Handle stoichiometry input changes
     */
    handleStoichInput() {
        this.calculateStoichiometry();
    }

    /**
     * Calculate stoichiometry based on user inputs - simplified
     */
    calculateStoichiometry() {
        // Simplified - placeholder for now
        const results = document.getElementById('stoich-results');
        if (results) {
            results.innerHTML = '<p>Enter a balanced equation first to enable stoichiometry calculations.</p>';
        }
    }

    /**
     * Convert amount to moles - simplified
     */
    convertToMoles() {
        console.log('Unit conversion will be available in full version');
        return null;
    }

    /**
     * Calculate amounts for all compounds - simplified  
     */
    calculateAllAmounts() {
        console.log('Stoichiometry calculations will be available in full version');
    }

    /**
     * Clear stoichiometry results
     */
    clearStoichiometryResults() {
        const results = document.getElementById('stoich-results');
        if (results) {
            results.innerHTML = '<p class="result-placeholder">Enter amounts above to see calculations</p>';
        }
    }

    /**
     * Handle medium change for redox reactions
     */
    handleMediumChange() {
        if (this.currentEquation) {
            this.performBalance();
        }
    }

    /**
     * Handle clear button
     */
    handleClear() {
        const equationInput = document.getElementById('equation-input');
        if (equationInput) {
            equationInput.value = '';
            equationInput.focus();
        }
        
        this.clearResults();
        this.clearMessages();
        this.clearStoichiometryInputs();
        this.currentEquation = null;
        
        const balanceBtn = document.getElementById('balance-btn');
        if (balanceBtn) {
            balanceBtn.disabled = true;
        }
        
        this.announce('Calculator cleared');
    }

    /**
     * Clear stoichiometry inputs
     */
    clearStoichiometryInputs() {
        const inputs = document.querySelectorAll('.stoich-input input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
        });
        this.clearStoichiometryResults();
    }

    /**
     * Handle example button
     */
    handleExample() {
        const examples = [
            'C2H6 + O2 = CO2 + H2O',
            'Fe + HCl = FeCl2 + H2',
            'Ca(OH)2 + H3PO4 = Ca3(PO4)2 + H2O',
            'NH3 + O2 = NO + H2O',
            'C6H12O6 + O2 = CO2 + H2O',
            'Al + CuSO4 = Al2(SO4)3 + Cu',
            'NaHCO3 = Na2CO3 + CO2 + H2O'
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        const equationInput = document.getElementById('equation-input');
        
        if (equationInput) {
            equationInput.value = randomExample;
            equationInput.dispatchEvent(new Event('input'));
            equationInput.focus();
        }
        
        this.announce(`Example loaded: ${randomExample}`);
    }

    /**
     * Show example on startup if no equation present
     */
    showExample() {
        const equationInput = document.getElementById('equation-input');
        if (equationInput && !equationInput.value.trim()) {
            equationInput.placeholder = 'Enter equation (e.g., C2H6 + O2 = CO2 + H2O) or click Example';
        }
    }

    /**
     * Handle examples dropdown toggle
     */
    handleExamplesToggle() {
        const examplesBtn = document.getElementById('examples-btn');
        const dropdown = examplesBtn?.parentElement;
        const menu = dropdown?.querySelector('.dropdown-menu');
        
        if (dropdown && menu) {
            const isOpen = dropdown.classList.contains('open');
            if (isOpen) {
                dropdown.classList.remove('open');
                examplesBtn.setAttribute('aria-expanded', 'false');
            } else {
                dropdown.classList.add('open');
                examplesBtn.setAttribute('aria-expanded', 'true');
            }
        }
    }

    /**
     * Handle example selection from dropdown
     */
    handleExampleSelect(e) {
        const exampleType = e.target.getAttribute('data-example');
        const examples = {
            'combustion': 'C3H8 + O2 = CO2 + H2O',
            'redox-acidic': 'MnO4- + Fe2+ + H+ = Mn2+ + Fe3+ + H2O',
            'redox-basic': 'MnO4- + I- = MnO2 + I2',
            'hydrate': 'CuSO4·5H2O + NH3 = Cu(NH3)4SO4 + H2O',
            'isotope': '[13C]6H12O6 + O2 = 13CO2 + H2O',
            'complex': 'K2Cr2O7 + HCl = KCl + CrCl3 + Cl2 + H2O'
        };

        const equation = examples[exampleType];
        if (equation) {
            const equationInput = document.getElementById('equation-input');
            if (equationInput) {
                equationInput.value = equation;
                equationInput.dispatchEvent(new Event('input'));
            }
            
            // Close dropdown
            const dropdown = e.target.closest('.dropdown');
            if (dropdown) {
                dropdown.classList.remove('open');
                const btn = dropdown.querySelector('#examples-btn');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
            
            this.announce(`Example loaded: ${equation}`);
        }
    }

    /**
     * Handle copy button
     */
    async handleCopy() {
        const resultElement = document.querySelector('.balanced-equation');
        if (!resultElement) return;

        const text = resultElement.textContent || resultElement.innerText;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Equation copied to clipboard!');
            this.announce('Equation copied to clipboard');
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopy(text);
        }
    }

    /**
     * Fallback copy method
     * @param {string} text
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('Equation copied to clipboard!');
            this.announce('Equation copied to clipboard');
        } catch (error) {
            this.showError('Could not copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Show input suggestions
     * @param {string} equation
     */
    showInputSuggestions(equation) {
        // Check for common mistakes and show helpful suggestions
        const suggestions = [];
        
        if (equation && !equation.includes('=') && !equation.includes('→')) {
            suggestions.push('Tip: Use = or → to separate reactants and products');
        }
        
        if (equation.includes('->')) {
            suggestions.push('Tip: Use → (Alt+Shift+>) instead of ->');
        }
        
        if (/\b(H2SO4|HNO3|HClO4)\b/.test(equation) && this.currentMode !== 'redox') {
            suggestions.push('Consider switching to redox mode for acid reactions');
        }
        
        if (suggestions.length > 0) {
            this.showInfo(suggestions[0]);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust layout for mobile devices
        this.adjustMobileLayout();
    }

    /**
     * Adjust layout for mobile devices
     */
    adjustMobileLayout() {
        const isMobile = window.innerWidth < 768;
        const calculatorGrid = document.querySelector('.calculator-grid');
        
        if (calculatorGrid) {
            if (isMobile) {
                calculatorGrid.style.gridTemplateColumns = '1fr';
            } else {
                calculatorGrid.style.gridTemplateColumns = '1fr 1fr';
            }
        }
    }

    /**
     * Initialize FAQ interactions
     */
    initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                // Initially hide answers
                answer.style.display = 'none';
                
                question.addEventListener('click', () => {
                    const isOpen = answer.style.display !== 'none';
                    
                    // Close all other FAQs
                    faqItems.forEach(otherItem => {
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer && otherAnswer !== answer) {
                            otherAnswer.style.display = 'none';
                            otherItem.removeAttribute('open');
                        }
                    });
                    
                    // Toggle current FAQ
                    if (isOpen) {
                        answer.style.display = 'none';
                        item.removeAttribute('open');
                    } else {
                        answer.style.display = 'block';
                        item.setAttribute('open', '');
                        
                        // Scroll into view
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
                
                // Add keyboard support
                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            }
        });
    }

    /**
     * Set loading state
     * @param {boolean} loading
     */
    setLoading(loading) {
        const balanceBtn = document.getElementById('balance-btn');
        const equationInput = document.getElementById('equation-input');
        
        if (balanceBtn) {
            balanceBtn.disabled = loading;
            balanceBtn.textContent = loading ? 'Balancing...' : 'Balance Equation';
        }
        
        if (equationInput) {
            equationInput.disabled = loading;
        }
        
        // Add/remove loading class to main container
        const main = document.querySelector('.main');
        if (main) {
            if (loading) {
                main.classList.add('loading');
            } else {
                main.classList.remove('loading');
            }
        }
    }

    /**
     * Clear all results
     */
    clearResults() {
        const resultDiv = document.getElementById('equation-result');
        if (resultDiv) {
            resultDiv.innerHTML = '<p class="result-placeholder">Balanced equation will appear here</p>';
        }
        
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.style.display = 'none';
        }
        
        const detailsContainer = document.querySelector('.details-content');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<p>Calculation details will appear here after balancing</p>';
        }
        
        this.clearStoichiometryResults();
    }

    /**
     * Clear all status messages
     */
    clearMessages() {
        const messagesContainer = document.querySelector('.status-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    /**
     * Show error message
     * @param {string} message
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show success message
     * @param {string} message
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show info message
     * @param {string} message
     */
    showInfo(message) {
        this.showMessage(message, 'info');
    }

    /**
     * Show warning message
     * @param {string} message
     */
    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    /**
     * Escape HTML entities
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show status message
     * @param {string} message
     * @param {string} type
     */
    showMessage(message, type = 'info') {
        const messagesContainer = document.querySelector('.status-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        // Handle multi-line messages by preserving line breaks
        if (message.includes('\n')) {
            messageDiv.innerHTML = message.split('\n').map(line => 
                line.trim() ? `<div>${this.escapeHtml(line)}</div>` : '<br>'
            ).join('');
        } else {
            messageDiv.textContent = message;
        }
        messageDiv.setAttribute('role', 'alert');

        // Clear previous messages of the same type
        const existingMessages = messagesContainer.querySelectorAll(`.status-${type}`);
        existingMessages.forEach(msg => msg.remove());

        messagesContainer.appendChild(messageDiv);

        // Auto-remove non-error messages after 5 seconds
        if (type !== 'error') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    /**
     * Load user preferences
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('stoichiometry-calculator-preferences');
            if (saved) {
                this.preferences = JSON.parse(saved);
                this.applyPreferences();
            }
        } catch (error) {
            console.warn('Could not load preferences:', error);
        }
    }

    /**
     * Save user preferences
     */
    savePreferences() {
        try {
            const preferences = {
                mode: this.currentMode,
                autoBalance: false, // Default to false for now
                lastEquation: document.getElementById('equation-input')?.value || ''
            };
            
            localStorage.setItem('stoichiometry-calculator-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Could not save preferences:', error);
        }
    }

    /**
     * Apply loaded preferences
     */
    applyPreferences() {
        if (!this.preferences) return;

        // Set mode
        if (this.preferences.mode) {
            // Map legacy modes to new set
            let storedMode = this.preferences.mode;
            if (storedMode === 'balance' || storedMode === 'mass') {
                storedMode = 'standard';
            }
            if (storedMode !== 'standard' && storedMode !== 'redox') {
                storedMode = 'standard';
            }
            const modeInput = document.querySelector(`input[name="calculation-mode"][value="${storedMode}"]`);
            if (modeInput) {
                modeInput.checked = true;
                this.currentMode = storedMode;
                this.updateUIForMode();
            }
        }

        // Restore last equation (optional)
        if (this.preferences.lastEquation) {
            const equationInput = document.getElementById('equation-input');
            if (equationInput && !equationInput.value) {
                // Only restore if input is empty
                // equationInput.value = this.preferences.lastEquation;
            }
        }
    }
}

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check for modern browser features
    if (!window.fetch || !window.Promise || !Array.from) {
        alert('This application requires a modern web browser. Please update your browser for the best experience.');
        return;
    }

    // Initialize the calculator
    try {
        window.calculator = new StoichiometryCalculator();
        console.log('Stoichiometry Calculator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        alert('Failed to load the calculator. Please refresh the page and try again.');
    }
});

// Add error handling for unhandled errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.calculator) {
        window.calculator.showError('An unexpected error occurred. Please refresh the page.');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.calculator) {
        window.calculator.showError('An unexpected error occurred. Please refresh the page.');
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StoichiometryCalculator };
}

// Extract terminal charge token from a species string.
// Recognizes patterns (after normalization):
//   Fe3+, Fe+3, Fe^3+, Fe^+3, Fe2-, Fe^2-, Fe- , Fe+
//   SO4^2-, SO4^2+, SO4--, SO4++, Cl-, Cl+
// Rules:
//   1. A charge token must end the string.
//   2. Must contain at least one + or - sign (cannot be just trailing digits).
//   3. Optional leading caret '^'.
//   4. Digits may appear before or after the first sign, but not both sides (normalize to magnitude).
function extractCharge(input) {
    let core = input;
    let charge = 0;
    
    // Quick reject: no + or - at end
    if (!/[+-]$/.test(input)) {
        return { core, charge };
    }
    
    // Possible charge segment after the last element/paren/closing bracket
    // Capture optional caret, digits/sign order variations.
    const chargeRegex = /(.*?)(?:\^)?((?:\d+[+-]|[+-]\d+|[+-]{1,2}|\d*[+-]))$/;
    const m = input.match(chargeRegex);
    if (!m) return { core, charge };
    
    const candidateCore = m[1];
    const token = m[2];
    
    // Ensure core is not empty and still has a letter or bracket (avoid classifying whole string as charge)
    if (!/[A-Za-z\]]/.test(candidateCore)) return { core, charge };
    
    // Token must contain at least one sign
    if (!/[+-]/.test(token)) return { core, charge };
    
    // Normalize token forms
    let magnitude = 1;
    let sign = 0;
    
    // Patterns:
    //  digits+sign  (e.g., 2+  -> +2)
    //  sign+digits  (e.g., +2  -> +2)
    //  sign(s) only (e.g., ++  -> +2, -  -> -1)
    //  digits*sign (digits optional) handled above
    if (/^\d+[+-]$/.test(token)) {
        magnitude = parseInt(token.slice(0, -1));
        sign = token.endsWith('+') ? 1 : -1;
    } else if (/^[+-]\d+$/.test(token)) {
        sign = token[0] === '+' ? 1 : -1;
        magnitude = parseInt(token.slice(1));
    } else if (/^[+-]{1,2}$/.test(token)) {
        // Single or double signs like +, -, ++, --
        sign = token[0] === '+' ? 1 : -1;
        magnitude = token.length; // ++ -> 2, -- -> 2
    } else if (/^\d*[+-]$/.test(token)) { // fallback digits optional then sign
        const digits = token.slice(0, -1);
        if (digits) magnitude = parseInt(digits);
        sign = token.endsWith('+') ? 1 : -1;
    } else {
        return { core, charge };
    }
    
    charge = sign * magnitude;
    core = candidateCore;
    
    return { core: core.trim(), charge };
}

// Expose core balancer globally for external / batch usage
if (typeof window !== 'undefined') {
    window.balanceChemicalEquation = balanceChemicalEquation;
}

// Batch processing utility: run many equations with incremental yielding
function runBatchBalance(equations, options = {}) {
    const {
        mode = 'standard',
        chunkSize = 50,
        onProgress = null,
        onComplete = null,
        includeDiagnostics = true
    } = options;
    const results = [];
    const start = performance.now();
    let index = 0;
    function processChunk() {
        const chunkStart = performance.now();
        for (let c = 0; c < chunkSize && index < equations.length; c++, index++) {
            const eq = equations[index].trim();
            if (!eq) {
                results.push({ input: eq, skipped: true });
                continue;
            }
            let result;
            try {
                result = balanceChemicalEquation(eq, mode);
            } catch (e) {
                result = { success: false, error: 'Runtime error: ' + e.message };
            }
            const entry = {
                input: eq,
                success: result.success,
                balanced: result.success ? result.balanced : null,
                error: result.success ? null : result.error,
                timeMs: +(performance.now() - chunkStart).toFixed(3)
            };
            if (includeDiagnostics && result && !result.success && result.diagnostic) {
                entry.diagnostic = result.diagnostic;
            }
            results.push(entry);
        }
        if (onProgress) {
            onProgress({ processed: index, total: equations.length, results });
        }
        if (index < equations.length) {
            setTimeout(processChunk, 0); // yield
        } else {
            const totalMs = performance.now() - start;
            if (onComplete) onComplete({ results, totalMs });
        }
    }
    processChunk();
    return results; // returns immediately; results will fill asynchronously
}

if (typeof window !== 'undefined') {
    window.runBatchBalance = runBatchBalance;
}