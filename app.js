/**
 * Main Application Logic for Stoichiometry Calculator
 * Handles UI interactions, calculator integration, and user experience
 */

// Simple inline chemistry functions for immediate functionality
function parseSimpleEquation(equation) {
    // Basic equation parser for common reactions
    const parts = equation.split(/[=→]/);
    if (parts.length !== 2) return null;
    
    const reactants = parts[0].trim().split('+').map(s => s.trim()).filter(s => s);
    const products = parts[1].trim().split('+').map(s => s.trim()).filter(s => s);
    
    return { reactants, products };
}

function balanceSimpleEquation(reactants, products) {
    // Simple examples for demonstration
    const examples = {
        'H2+O2->H2O': '2H2 + O2 → 2H2O',
        'CH4+O2->CO2+H2O': 'CH4 + 2O2 → CO2 + 2H2O',
        'Fe+HCl->FeCl2+H2': 'Fe + 2HCl → FeCl2 + H2',
        'C2H6+O2->CO2+H2O': '2C2H6 + 7O2 → 4CO2 + 6H2O'
    };
    
    const key = (reactants.join('+') + '->' + products.join('+')).replace(/\s/g, '');
    return examples[key] || null;
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

        // Example button
        const exampleBtn = document.getElementById('example-btn');
        if (exampleBtn) {
            exampleBtn.addEventListener('click', this.handleExample.bind(this));
        }

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
     * Balance chemical equation
     * @param {string} equation
     * @returns {Promise<Object>}
     */
    async balanceEquation(equation) {
        try {
            // Parse equation
            const parsed = parseSimpleEquation(equation);
            if (!parsed) {
                return { success: false, error: 'Invalid equation format. Use = or → to separate reactants and products.' };
            }

            // Try to balance with simple examples
            const balanced = balanceSimpleEquation(parsed.reactants, parsed.products);
            
            if (balanced) {
                return {
                    success: true,
                    original: equation,
                    balanced: balanced,
                    reactants: parsed.reactants,
                    products: parsed.products
                };
            } else {
                // Provide a helpful response for unsupported equations
                return { 
                    success: false, 
                    error: 'This equation is not in our simple examples database. Try: H2 + O2 = H2O, CH4 + O2 = CO2 + H2O, or Fe + HCl = FeCl2 + H2' 
                };
            }
        } catch (error) {
            return { success: false, error: error.message };
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

        let detailsHTML = '';

        if (result.matrix) {
            detailsHTML += `
                <h4>Matrix Representation:</h4>
                <div class="matrix-display">${this.formatMatrix(result.matrix)}</div>
            `;
        }

        if (result.details) {
            detailsHTML += `
                <h4>Solution Details:</h4>
                <pre class="matrix-display">${result.details}</pre>
            `;
        }

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