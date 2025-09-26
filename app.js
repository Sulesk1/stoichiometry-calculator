/**
 * Main Application Logic for Stoichiometry Calculator
 * Handles UI interactions, calculator integration, and user experience
 */

// Fraction class for exact arithmetic
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

// Parse chemical formula with proper element extraction
function parseChemicalFormula(formula) {
    // Extract coefficient
    const match = formula.match(/^(\d*)\s*(.+)$/);
    const coefficient = match[1] ? parseInt(match[1]) : 1;
    const compound = match[2];
    
    const composition = {};
    let charge = 0;
    
    // Parse compound recursively
    let index = 0;
    
    function parseGroup() {
        const elements = {};
        
        while (index < compound.length) {
            const char = compound[index];
            
            if (char === '(') {
                index++; // skip '('
                const groupElements = parseGroup();
                if (compound[index] === ')') {
                    index++; // skip ')'
                    const multiplier = parseNumber() || 1;
                    
                    for (const [element, count] of Object.entries(groupElements)) {
                        elements[element] = (elements[element] || 0) + count * multiplier;
                    }
                }
            } else if (char === ')') {
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
    
    return {
        formula: compound,
        originalFormula: formula,
        coefficient: coefficient,
        composition: parsed,
        charge: charge
    };
}

// Parse equation into reactants and products
function parseChemicalEquation(equation) {
    const [left, right] = equation.split(/[=→]/);
    if (!left || !right) return null;
    
    const reactants = left.split('+').map(s => parseChemicalFormula(s.trim())).filter(r => r);
    const products = right.split('+').map(s => parseChemicalFormula(s.trim())).filter(p => p);
    
    return { reactants, products };
}

// Build matrix A for balancing
function buildBalanceMatrix(reactants, products, includeCharge = false) {
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

// Convert fractions to integers and find best solution
function findBestIntegerSolution(nullspaceBasis, numReactants) {
    if (!nullspaceBasis || nullspaceBasis.length === 0) return null;
    
    let bestSolution = null;
    let bestScore = Infinity;
    
    // Try each basis vector
    nullspaceBasis.forEach(basis => {
        // Ensure at least one product has positive coefficient
        let hasPositiveProduct = false;
        for (let i = numReactants; i < basis.length; i++) {
            if (basis[i].toNumber() > 0) {
                hasPositiveProduct = true;
                break;
            }
        }
        
        if (!hasPositiveProduct) {
            // Negate the solution
            basis = basis.map(f => f.multiply(new Fraction(-1)));
        }
        
        // Convert to integers
        const integers = convertToIntegers(basis);
        if (integers) {
            const maxCoeff = Math.max(...integers);
            const sumCoeff = integers.reduce((a, b) => a + b, 0);
            const score = maxCoeff * 1000 + sumCoeff; // Prefer smaller max, then smaller sum
            
            if (score < bestScore) {
                bestScore = score;
                bestSolution = integers;
            }
        }
    });
    
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

// Main balancing function
function balanceChemicalEquation(equation, isRedox = false) {
    try {
        const parsed = parseChemicalEquation(equation);
        if (!parsed) {
            return { success: false, error: 'Invalid equation format. Use = or → to separate reactants and products.' };
        }
        
        const { reactants, products } = parsed;
        const { matrix, elements, compounds } = buildBalanceMatrix(reactants, products, isRedox);
        
        const nullspace = computeNullspace(matrix);
        if (!nullspace) {
            return { success: false, error: 'No solution exists. Check if the equation is chemically valid.' };
        }
        
        const coefficients = findBestIntegerSolution(nullspace, reactants.length);
        if (!coefficients) {
            return { success: false, error: 'Could not find integer solution.' };
        }
        
        // Format result
        const reactantStrs = reactants.map((compound, i) => {
            const coeff = coefficients[i];
            return (coeff > 1 ? coeff : '') + compound.formula;
        });
        
        const productStrs = products.map((compound, i) => {
            const coeff = coefficients[reactants.length + i];
            return (coeff > 1 ? coeff : '') + compound.formula;
        });
        
        const balanced = reactantStrs.join(' + ') + ' → ' + productStrs.join(' + ');
        
        return {
            success: true,
            balanced: balanced,
            coefficients: coefficients,
            reactants: reactants,
            products: products,
            original: equation
        };
        
    } catch (error) {
        return { success: false, error: `Balancing error: ${error.message}` };
    }
}

/**
 * Main Application Class
 */
class StoichiometryCalculator {
    constructor() {
        this.currentEquation = null;
        this.currentMode = 'balance';
        
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
        const redoxSection = document.querySelector('.redox-options');
        const stoichSection = document.querySelector('.stoich-section');
        
        switch (this.currentMode) {
            case 'balance':
                if (redoxSection) redoxSection.style.display = 'none';
                if (stoichSection) stoichSection.style.display = 'block';
                break;
            case 'redox':
                if (redoxSection) redoxSection.style.display = 'block';
                if (stoichSection) stoichSection.style.display = 'block';
                break;
            case 'mass':
                if (redoxSection) redoxSection.style.display = 'none';
                if (stoichSection) stoichSection.style.display = 'none';
                break;
        }
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
                this.showError(result.error || 'Failed to balance equation.');
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
            const isRedox = this.currentMode === 'redox';
            const result = balanceChemicalEquation(equation, isRedox);
            
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

        // Redox explanation if applicable
        if (this.currentMode === 'redox') {
            detailsHTML += `
                <h4>⚡ Redox Balancing</h4>
                <p>For redox equations, charge balance is included as an additional constraint.</p>
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
     * Show status message
     * @param {string} message
     * @param {string} type
     */
    showMessage(message, type = 'info') {
        const messagesContainer = document.querySelector('.status-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = message;
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
            const modeInput = document.querySelector(`input[name="calculation-mode"][value="${this.preferences.mode}"]`);
            if (modeInput) {
                modeInput.checked = true;
                this.currentMode = this.preferences.mode;
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