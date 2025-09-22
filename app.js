// Stoichiometry Calculator App
class StoichiometryCalculator {
    constructor() {
        this.balancedEquation = null;
        this.molecules = [];
        this.coefficients = [];
        this.reactants = [];
        this.products = [];
        this.oxidationStatesDB = null;
        this.initializeOxidationDatabase();
        this.initializeEventListeners();
        this.initializeFAQ();
    }

    async initializeOxidationDatabase() {
        // Load oxidation states database
        this.oxidationStatesDB = await this.loadOxidationStatesDB();
    }

    async loadOxidationStatesDB() {
        // Comprehensive oxidation states database for periods 1-3
        return {
            // First Row (Period 1)
            'H': {
                name: 'Hydrogen',
                commonStates: ['+1', '-1'],
                stateDetails: {
                    '+1': {
                        description: 'Most common in acids, water, and most compounds',
                        examples: ['H2O', 'HCl', 'H2SO4', 'NH3'],
                        conditions: 'Standard conditions'
                    },
                    '-1': {
                        description: 'In metal hydrides',
                        examples: ['NaH', 'CaH2', 'LiH'],
                        conditions: 'With metals (hydrides)'
                    }
                }
            },
            'He': {
                name: 'Helium',
                commonStates: ['0'],
                stateDetails: {
                    '0': {
                        description: 'Noble gas, does not form compounds under normal conditions',
                        examples: ['He'],
                        conditions: 'Unreactive'
                    }
                }
            },

            // Second Row (Period 2)
            'Li': {
                name: 'Lithium',
                commonStates: ['+1'],
                stateDetails: {
                    '+1': {
                        description: 'Alkali metal, always loses one electron',
                        examples: ['Li2O', 'LiCl', 'Li2CO3', 'LiOH'],
                        conditions: 'All compounds'
                    }
                }
            },
            'Be': {
                name: 'Beryllium',
                commonStates: ['+2'],
                stateDetails: {
                    '+2': {
                        description: 'Alkaline earth metal, always loses two electrons',
                        examples: ['BeO', 'BeCl2', 'Be(OH)2'],
                        conditions: 'All compounds'
                    }
                }
            },
            'B': {
                name: 'Boron',
                commonStates: ['+3'],
                stateDetails: {
                    '+3': {
                        description: 'Forms covalent compounds, electron deficient',
                        examples: ['B2O3', 'BCl3', 'BF3', 'H3BO3'],
                        conditions: 'All compounds'
                    }
                }
            },
            'C': {
                name: 'Carbon',
                commonStates: ['+4', '+2', '-4'],
                stateDetails: {
                    '+4': {
                        description: 'Most oxidized form, in CO2 and organic acids',
                        examples: ['CO2', 'CCl4', 'H2CO3'],
                        conditions: 'Complete combustion, with strong oxidizers'
                    },
                    '+2': {
                        description: 'Intermediate oxidation, in carbon monoxide',
                        examples: ['CO'],
                        conditions: 'Incomplete combustion, reducing conditions'
                    },
                    '-4': {
                        description: 'Most reduced form, in methane and hydrocarbons',
                        examples: ['CH4', 'C2H6', 'C3H8'],
                        conditions: 'With hydrogen, organic compounds'
                    }
                }
            },
            'N': {
                name: 'Nitrogen',
                commonStates: ['+5', '+4', '+3', '+2', '+1', '-1', '-2', '-3'],
                stateDetails: {
                    '+5': {
                        description: 'Highest oxidation state, in nitrates',
                        examples: ['HNO3', 'NO3-', 'N2O5'],
                        conditions: 'Strong oxidizing conditions'
                    },
                    '+4': {
                        description: 'In nitrogen dioxide',
                        examples: ['NO2', 'N2O4'],
                        conditions: 'Moderate oxidizing conditions'
                    },
                    '+3': {
                        description: 'In nitrites',
                        examples: ['HNO2', 'NO2-'],
                        conditions: 'Intermediate oxidation'
                    },
                    '+2': {
                        description: 'In nitric oxide',
                        examples: ['NO'],
                        conditions: 'High temperature reactions'
                    },
                    '+1': {
                        description: 'In nitrous oxide',
                        examples: ['N2O'],
                        conditions: 'Mild oxidizing conditions'
                    },
                    '-1': {
                        description: 'In hydroxylamine',
                        examples: ['NH2OH'],
                        conditions: 'Reducing conditions'
                    },
                    '-2': {
                        description: 'In hydrazine',
                        examples: ['N2H4'],
                        conditions: 'Strong reducing conditions'
                    },
                    '-3': {
                        description: 'Most reduced form, in ammonia',
                        examples: ['NH3', 'NH4+'],
                        conditions: 'Strong reducing conditions, Haber process'
                    }
                }
            },
            'O': {
                name: 'Oxygen',
                commonStates: ['-2', '-1', '0'],
                stateDetails: {
                    '-2': {
                        description: 'Most common in oxides, water, and most compounds',
                        examples: ['H2O', 'CO2', 'Fe2O3', 'CaO'],
                        conditions: 'Most compounds'
                    },
                    '-1': {
                        description: 'In peroxides',
                        examples: ['H2O2', 'Na2O2', 'BaO2'],
                        conditions: 'Peroxide formation'
                    },
                    '0': {
                        description: 'Elemental oxygen',
                        examples: ['O2', 'O3'],
                        conditions: 'Free element'
                    }
                }
            },
            'F': {
                name: 'Fluorine',
                commonStates: ['-1'],
                stateDetails: {
                    '-1': {
                        description: 'Most electronegative element, always -1 in compounds',
                        examples: ['HF', 'NaF', 'CaF2', 'SF6'],
                        conditions: 'All compounds'
                    }
                }
            },
            'Ne': {
                name: 'Neon',
                commonStates: ['0'],
                stateDetails: {
                    '0': {
                        description: 'Noble gas, does not form compounds under normal conditions',
                        examples: ['Ne'],
                        conditions: 'Unreactive'
                    }
                }
            },

            // Third Row (Period 3) - Common elements
            'Na': {
                name: 'Sodium',
                commonStates: ['+1'],
                stateDetails: {
                    '+1': {
                        description: 'Alkali metal, always loses one electron',
                        examples: ['Na2O', 'NaCl', 'Na2CO3', 'NaOH'],
                        conditions: 'All compounds'
                    }
                }
            },
            'Mg': {
                name: 'Magnesium',
                commonStates: ['+2'],
                stateDetails: {
                    '+2': {
                        description: 'Alkaline earth metal, always loses two electrons',
                        examples: ['MgO', 'MgCl2', 'Mg(OH)2', 'MgSO4'],
                        conditions: 'All compounds'
                    }
                }
            },
            'Al': {
                name: 'Aluminum',
                commonStates: ['+3'],
                stateDetails: {
                    '+3': {
                        description: 'Always loses three electrons',
                        examples: ['Al2O3', 'AlCl3', 'Al(OH)3', 'Al2(SO4)3'],
                        conditions: 'All compounds'
                    }
                }
            },
            'Si': {
                name: 'Silicon',
                commonStates: ['+4', '-4'],
                stateDetails: {
                    '+4': {
                        description: 'Most common in silicates and silicon dioxide',
                        examples: ['SiO2', 'SiCl4', 'H4SiO4'],
                        conditions: 'With oxygen and halogens'
                    },
                    '-4': {
                        description: 'In silanes (silicon hydrides)',
                        examples: ['SiH4', 'Si2H6'],
                        conditions: 'With hydrogen'
                    }
                }
            },
            'P': {
                name: 'Phosphorus',
                commonStates: ['+5', '+3', '-3'],
                stateDetails: {
                    '+5': {
                        description: 'In phosphates and phosphoric acid',
                        examples: ['H3PO4', 'PO43-', 'P2O5', 'PCl5'],
                        conditions: 'Oxidizing conditions'
                    },
                    '+3': {
                        description: 'In phosphites',
                        examples: ['H3PO3', 'PO33-', 'PCl3'],
                        conditions: 'Moderate oxidation'
                    },
                    '-3': {
                        description: 'In phosphine and phosphides',
                        examples: ['PH3', 'Ca3P2'],
                        conditions: 'Reducing conditions'
                    }
                }
            },
            'S': {
                name: 'Sulfur',
                commonStates: ['+6', '+4', '+2', '-2'],
                stateDetails: {
                    '+6': {
                        description: 'In sulfates and sulfuric acid',
                        examples: ['H2SO4', 'SO42-', 'SO3'],
                        conditions: 'Strong oxidizing conditions'
                    },
                    '+4': {
                        description: 'In sulfites and sulfur dioxide',
                        examples: ['SO2', 'SO32-', 'H2SO3'],
                        conditions: 'Moderate oxidation'
                    },
                    '+2': {
                        description: 'In some sulfur compounds',
                        examples: ['SCl2'],
                        conditions: 'Mild oxidation'
                    },
                    '-2': {
                        description: 'In sulfides and hydrogen sulfide',
                        examples: ['H2S', 'Na2S', 'FeS'],
                        conditions: 'Reducing conditions'
                    }
                }
            },
            'Cl': {
                name: 'Chlorine',
                commonStates: ['+7', '+5', '+3', '+1', '-1'],
                stateDetails: {
                    '+7': {
                        description: 'In perchlorates',
                        examples: ['HClO4', 'ClO4-'],
                        conditions: 'Strong oxidizing conditions'
                    },
                    '+5': {
                        description: 'In chlorates',
                        examples: ['HClO3', 'ClO3-'],
                        conditions: 'Oxidizing conditions'
                    },
                    '+3': {
                        description: 'In chlorites',
                        examples: ['HClO2', 'ClO2-'],
                        conditions: 'Moderate oxidation'
                    },
                    '+1': {
                        description: 'In hypochlorites',
                        examples: ['HClO', 'ClO-'],
                        conditions: 'Mild oxidation'
                    },
                    '-1': {
                        description: 'Most common in chlorides',
                        examples: ['HCl', 'NaCl', 'CaCl2'],
                        conditions: 'Most compounds'
                    }
                }
            },
            'Ar': {
                name: 'Argon',
                commonStates: ['0'],
                stateDetails: {
                    '0': {
                        description: 'Noble gas, does not form compounds under normal conditions',
                        examples: ['Ar'],
                        conditions: 'Unreactive'
                    }
                }
            },

            // Transition metals with multiple oxidation states
            'Fe': {
                name: 'Iron',
                commonStates: ['+2', '+3'],
                stateDetails: {
                    '+2': {
                        description: 'Iron(II) or ferrous compounds',
                        examples: ['FeO', 'FeCl2', 'FeSO4', 'Fe(OH)2'],
                        conditions: 'Reducing conditions, less oxygen'
                    },
                    '+3': {
                        description: 'Iron(III) or ferric compounds',
                        examples: ['Fe2O3', 'FeCl3', 'Fe2(SO4)3', 'Fe(OH)3'],
                        conditions: 'Oxidizing conditions, more oxygen'
                    }
                }
            },
            'Cu': {
                name: 'Copper',
                commonStates: ['+1', '+2'],
                stateDetails: {
                    '+1': {
                        description: 'Copper(I) or cuprous compounds',
                        examples: ['Cu2O', 'CuCl', 'Cu2S'],
                        conditions: 'Reducing conditions, limited oxygen'
                    },
                    '+2': {
                        description: 'Copper(II) or cupric compounds',
                        examples: ['CuO', 'CuCl2', 'CuSO4', 'Cu(OH)2'],
                        conditions: 'Oxidizing conditions, normal air'
                    }
                }
            },
            'Mn': {
                name: 'Manganese',
                commonStates: ['+2', '+4', '+7'],
                stateDetails: {
                    '+2': {
                        description: 'Manganese(II) compounds',
                        examples: ['MnO', 'MnCl2', 'MnSO4'],
                        conditions: 'Reducing conditions'
                    },
                    '+4': {
                        description: 'Manganese(IV) compounds',
                        examples: ['MnO2'],
                        conditions: 'Moderate oxidation'
                    },
                    '+7': {
                        description: 'Manganese(VII) compounds',
                        examples: ['Mn2O7', 'KMnO4'],
                        conditions: 'Strong oxidizing conditions'
                    }
                }
            },
            'Cr': {
                name: 'Chromium',
                commonStates: ['+3', '+6'],
                stateDetails: {
                    '+3': {
                        description: 'Chromium(III) compounds',
                        examples: ['Cr2O3', 'CrCl3', 'Cr(OH)3'],
                        conditions: 'Reducing conditions'
                    },
                    '+6': {
                        description: 'Chromium(VI) compounds',
                        examples: ['CrO3', 'K2Cr2O7', 'K2CrO4'],
                        conditions: 'Strong oxidizing conditions'
                    }
                }
            },
            'Ni': {
                name: 'Nickel',
                commonStates: ['+2'],
                stateDetails: {
                    '+2': {
                        description: 'Most common nickel compounds',
                        examples: ['NiO', 'NiCl2', 'NiSO4', 'Ni(OH)2'],
                        conditions: 'Standard conditions'
                    }
                }
            },
            'Zn': {
                name: 'Zinc',
                commonStates: ['+2'],
                stateDetails: {
                    '+2': {
                        description: 'Only stable oxidation state for zinc',
                        examples: ['ZnO', 'ZnCl2', 'ZnSO4', 'Zn(OH)2'],
                        conditions: 'All compounds'
                    }
                }
            },
            'Pb': {
                name: 'Lead',
                commonStates: ['+2', '+4'],
                stateDetails: {
                    '+2': {
                        description: 'More stable lead compounds',
                        examples: ['PbO', 'PbCl2', 'Pb(NO3)2'],
                        conditions: 'Standard conditions'
                    },
                    '+4': {
                        description: 'Less stable, strong oxidizing conditions',
                        examples: ['PbO2', 'PbCl4'],
                        conditions: 'Strong oxidizing conditions'
                    }
                }
            },
            'Sn': {
                name: 'Tin',
                commonStates: ['+2', '+4'],
                stateDetails: {
                    '+2': {
                        description: 'Tin(II) or stannous compounds',
                        examples: ['SnO', 'SnCl2'],
                        conditions: 'Reducing conditions'
                    },
                    '+4': {
                        description: 'Tin(IV) or stannic compounds',
                        examples: ['SnO2', 'SnCl4'],
                        conditions: 'Oxidizing conditions'
                    }
                }
            }
        };
    }

    initializeEventListeners() {
        const balanceBtn = document.getElementById('balance-btn');
        const calculateBtn = document.getElementById('calculate-btn');
        const equationInput = document.getElementById('equation-input');

        balanceBtn.addEventListener('click', () => this.balanceEquation());
        calculateBtn.addEventListener('click', () => this.calculateStoichiometry());
        
        // Allow Enter key to trigger balance
        equationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.balanceEquation();
            }
        });
    }

    initializeFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = question.getAttribute('aria-expanded') === 'true';
                
                // Close all other FAQ items
                faqQuestions.forEach(q => {
                    q.setAttribute('aria-expanded', 'false');
                    q.nextElementSibling.classList.remove('open');
                });
                
                // Toggle current item
                if (!isOpen) {
                    question.setAttribute('aria-expanded', 'true');
                    answer.classList.add('open');
                }
            });
        });
    }

    parseChemicalEquation(equation) {
        // Clean and normalize the equation
        equation = equation.replace(/\s+/g, ' ').trim();
        equation = equation.replace(/[=→]/g, '→');
        
        if (!equation.includes('→')) {
            throw new Error('Please use → or = to separate reactants and products');
        }

        const [reactantStr, productStr] = equation.split('→');
        
        const reactants = this.parseMolecules(reactantStr.trim());
        const products = this.parseMolecules(productStr.trim());
        
        return { reactants, products };
    }

    parseMolecules(moleculeString) {
        // Split by + and clean up
        const molecules = moleculeString.split('+').map(m => m.trim()).filter(m => m);
        return molecules.map(molecule => {
            // Extract coefficient if present
            const match = molecule.match(/^(\d*)\s*(.+)$/);
            if (match) {
                const coefficient = match[1] ? parseInt(match[1]) : 1;
                const formula = match[2];
                return { coefficient, formula, elements: this.parseElements(formula) };
            }
            return { coefficient: 1, formula: molecule, elements: this.parseElements(molecule) };
        });
    }

    parseElements(formula) {
        const elements = {};
        // Match element patterns: Capital letter + optional lowercase + optional number
        const elementPattern = /([A-Z][a-z]?)(\d*)/g;
        let match;
        
        while ((match = elementPattern.exec(formula)) !== null) {
            const element = match[1];
            const count = match[2] ? parseInt(match[2]) : 1;
            elements[element] = (elements[element] || 0) + count;
        }
        
        return elements;
    }

    // Advanced formula validation and suggestion system
    validateAndSuggestFormulas(reactants, products) {
        const warnings = [];
        const suggestions = [];
        let isValid = true;

        // Common formula corrections (enhanced)
        const formulaCorrections = {
            'HO': 'H2O',
            'OH': 'H2O',
            'CO': 'CO2',
            'SO': 'SO2',
            'NO': 'NO2',
            'H2SO': 'H2SO4',
            'HCL': 'HCl',
            'NAOH': 'NaOH',
            'NACL': 'NaCl',
            'MGCL': 'MgCl2',
            'CACL': 'CaCl2',
            'FEO2': 'Fe2O3',
            'CUO2': 'CuO',
            'ALO': 'Al2O3',
            'SIO': 'SiO2',
            'PO': 'P2O5'
        };

        // Validate all molecules
        [...reactants, ...products].forEach(molecule => {
            const formula = molecule.formula.toUpperCase();
            
            // Check for common mistakes
            if (formulaCorrections[formula]) {
                isValid = false;
                warnings.push(`"${molecule.formula}" should probably be "${formulaCorrections[formula]}"`);
                suggestions.push({
                    original: molecule.formula,
                    suggested: formulaCorrections[formula],
                    reason: 'Common chemical formula correction'
                });
            }
            
            // Check for impossible compounds using oxidation states
            const impossibilityCheck = this.checkChemicalValidity(molecule.formula);
            if (!impossibilityCheck.isValid) {
                isValid = false;
                warnings.push(`"${molecule.formula}" ${impossibilityCheck.reason}`);
                const alternatives = this.suggestAlternativeFormulas(molecule.formula);
                alternatives.forEach(alt => suggestions.push(alt));
            }
            
            // Check for uncommon but possible compounds
            const stabilityWarning = this.checkCompoundStability(molecule.formula);
            if (stabilityWarning) {
                warnings.push(`"${molecule.formula}" ${stabilityWarning}`);
            }
        });

        return { isValid, warnings, suggestions };
    }

    checkChemicalValidity(formula) {
        const elements = this.parseElements(formula);
        const elementKeys = Object.keys(elements);
        
        // Single element checks
        if (elementKeys.length === 1) {
            const element = elementKeys[0];
            const count = elements[element];
            
            // Check if element exists in our database
            if (!this.oxidationStatesDB || !this.oxidationStatesDB[element]) {
                return {
                    isValid: false,
                    reason: 'contains unknown element or element not in database'
                };
            }
            
            // Check for impossible single-element molecules
            if (count === 1 && !['H', 'F', 'Cl', 'Br', 'I'].includes(element)) {
                return {
                    isValid: false,
                    reason: 'is an unstable monatomic molecule'
                };
            }
        }
        
        // Binary compound checks
        if (elementKeys.length === 2) {
            const validity = this.checkBinaryCompoundValidity(elements);
            if (!validity.isValid) {
                return validity;
            }
        }
        
        // Check for impossible charge combinations
        const chargeBalance = this.checkChargeBalance(elements);
        if (!chargeBalance.isValid) {
            return chargeBalance;
        }
        
        return { isValid: true };
    }

    checkBinaryCompoundValidity(elements) {
        const elementKeys = Object.keys(elements);
        
        if (elementKeys.length !== 2) {
            return { isValid: true }; // Not a binary compound
        }
        
        const [element1, element2] = elementKeys;
        const [count1, count2] = [elements[element1], elements[element2]];
        
        // Check specific problematic combinations
        const problematicCombinations = [
            { elements: ['H', 'O'], counts: [1, 1], reason: 'HO is unstable; should be H2O' },
            { elements: ['C', 'O'], counts: [1, 3], reason: 'CO3 is not stable as a molecule; should be CO2' },
            { elements: ['S', 'O'], counts: [1, 5], reason: 'SO5 is not a stable compound' },
            { elements: ['N', 'O'], counts: [1, 4], reason: 'NO4 is not stable as a molecule' }
        ];
        
        for (const combo of problematicCombinations) {
            if ((combo.elements.includes(element1) && combo.elements.includes(element2)) &&
                ((count1 === combo.counts[0] && count2 === combo.counts[1]) ||
                 (count1 === combo.counts[1] && count2 === combo.counts[0]))) {
                return {
                    isValid: false,
                    reason: combo.reason
                };
            }
        }
        
        return { isValid: true };
    }

    checkChargeBalance(elements) {
        if (!this.oxidationStatesDB) {
            return { isValid: true }; // Can't check without database
        }
        
        // Try to balance charges using most common oxidation states
        const elementKeys = Object.keys(elements);
        let possibleBalance = false;
        
        // Generate all possible oxidation state combinations
        const possibleStates = elementKeys.map(element => {
            if (this.oxidationStatesDB[element]) {
                return this.oxidationStatesDB[element].commonStates.map(state => ({
                    element: element,
                    state: parseInt(state.replace('+', '').replace('-', '')),
                    sign: state.includes('-') ? -1 : 1
                }));
            }
            return [{ element: element, state: 0, sign: 1 }];
        });
        
        // Check if any combination gives charge balance
        const combinations = this.generateCombinations(possibleStates);
        
        for (const combination of combinations) {
            let totalCharge = 0;
            combination.forEach(stateInfo => {
                const count = elements[stateInfo.element];
                totalCharge += count * stateInfo.state * stateInfo.sign;
            });
            
            if (totalCharge === 0) {
                possibleBalance = true;
                break;
            }
        }
        
        if (!possibleBalance && elementKeys.length > 1) {
            return {
                isValid: false,
                reason: 'cannot achieve charge balance with known oxidation states'
            };
        }
        
        return { isValid: true };
    }

    generateCombinations(arrays) {
        if (arrays.length === 0) return [[]];
        if (arrays.length === 1) return arrays[0].map(item => [item]);
        
        const result = [];
        const firstArray = arrays[0];
        const remainingCombinations = this.generateCombinations(arrays.slice(1));
        
        firstArray.forEach(item => {
            remainingCombinations.forEach(combination => {
                result.push([item, ...combination]);
            });
        });
        
        return result;
    }

    checkCompoundStability(formula) {
        const elements = this.parseElements(formula);
        const elementKeys = Object.keys(elements);
        
        // Check for highly reactive combinations
        if (elementKeys.includes('F') && elementKeys.length > 2) {
            return 'may be highly reactive due to fluorine content';
        }
        
        // Check for unusual oxidation states
        if (this.oxidationStatesDB) {
            for (const element of elementKeys) {
                if (this.oxidationStatesDB[element]) {
                    const commonStates = this.oxidationStatesDB[element].commonStates;
                    if (commonStates.length === 1 && commonStates[0] === '0') {
                        return `contains ${this.oxidationStatesDB[element].name} which typically doesn't form compounds`;
                    }
                }
            }
        }
        
        return null; // No stability warnings
    }

    isImpossibleCompound(formula) {
        // List of impossible or highly unstable compounds
        const impossibleCompounds = [
            'HO', 'OH2', 'CO3', 'SO5', 'NO4', 'ClO5'
        ];
        
        return impossibleCompounds.includes(formula.toUpperCase());
    }

    suggestAlternativeFormulas(formula) {
        const suggestions = [];
        const upperFormula = formula.toUpperCase();
        const elements = this.parseElements(formula);
        
        // Specific suggestions based on common mistakes
        switch (upperFormula) {
            case 'HO':
                suggestions.push({
                    original: formula,
                    suggested: 'H2O',
                    reason: 'Water molecule - hydrogen has +1, oxygen has -2 oxidation state'
                });
                suggestions.push({
                    original: formula,
                    suggested: 'H2O2',
                    reason: 'Hydrogen peroxide - oxygen in -1 oxidation state'
                });
                break;
            case 'CO3':
                suggestions.push({
                    original: formula,
                    suggested: 'CO2',
                    reason: 'Carbon dioxide - carbon in +4, oxygen in -2 oxidation state'
                });
                suggestions.push({
                    original: formula,
                    suggested: 'CO32-',
                    reason: 'Carbonate ion (if part of ionic compound)'
                });
                break;
            default:
                // Generate suggestions based on oxidation states
                const dbSuggestions = this.generateSuggestionsFromDB(elements);
                suggestions.push(...dbSuggestions);
        }
        
        return suggestions;
    }

    generateSuggestionsFromDB(elements) {
        const suggestions = [];
        
        if (!this.oxidationStatesDB) {
            return suggestions;
        }
        
        const elementKeys = Object.keys(elements);
        
        // For binary compounds, suggest correct ratios
        if (elementKeys.length === 2) {
            const [element1, element2] = elementKeys;
            
            if (this.oxidationStatesDB[element1] && this.oxidationStatesDB[element2]) {
                const states1 = this.oxidationStatesDB[element1].commonStates;
                const states2 = this.oxidationStatesDB[element2].commonStates;
                
                // Try combinations of oxidation states
                states1.forEach(state1 => {
                    states2.forEach(state2 => {
                        const formula = this.generateBalancedFormula(element1, state1, element2, state2);
                        if (formula && formula !== `${element1}${elements[element1]}${element2}${elements[element2]}`) {
                            const state1Details = this.oxidationStatesDB[element1].stateDetails[state1];
                            const state2Details = this.oxidationStatesDB[element2].stateDetails[state2];
                            
                            suggestions.push({
                                original: `${element1}${elements[element1]}${element2}${elements[element2]}`,
                                suggested: formula,
                                reason: `${element1}(${state1}) + ${element2}(${state2}) - ${state1Details.description} with ${state2Details.description}`
                            });
                        }
                    });
                });
            }
        }
        
        // For single elements, suggest common molecular forms
        if (elementKeys.length === 1) {
            const element = elementKeys[0];
            if (this.oxidationStatesDB[element]) {
                const examples = [];
                
                // Collect examples from all oxidation states
                this.oxidationStatesDB[element].commonStates.forEach(state => {
                    const stateExamples = this.oxidationStatesDB[element].stateDetails[state].examples;
                    examples.push(...stateExamples);
                });
                
                // Filter relevant examples
                const relevantExamples = [...new Set(examples)].filter(example => 
                    this.parseElements(example)[element] !== undefined
                ).slice(0, 3); // Limit to 3 suggestions
                
                relevantExamples.forEach(example => {
                    suggestions.push({
                        original: formula,
                        suggested: example,
                        reason: `Common compound containing ${this.oxidationStatesDB[element].name}`
                    });
                });
            }
        }
        
        return suggestions.slice(0, 5); // Limit total suggestions
    }

    generateBalancedFormula(element1, state1, element2, state2) {
        const ox1 = parseInt(state1.replace('+', '').replace('-', ''));
        const ox2 = parseInt(state2.replace('+', '').replace('-', ''));
        const sign1 = state1.includes('-') ? -1 : 1;
        const sign2 = state2.includes('-') ? -1 : 1;
        
        // Calculate the ratio needed for charge balance
        const charge1 = ox1 * sign1;
        const charge2 = ox2 * sign2;
        
        if (charge1 + charge2 === 0) {
            // 1:1 ratio
            return `${element1}${element2}`;
        }
        
        // Find least common multiple for charge balance
        const absCharge1 = Math.abs(charge1);
        const absCharge2 = Math.abs(charge2);
        
        if (charge1 * charge2 < 0) { // Opposite charges
            const gcd = this.gcd(absCharge1, absCharge2);
            const count1 = absCharge2 / gcd;
            const count2 = absCharge1 / gcd;
            
            let formula = element1;
            if (count1 > 1) formula += count1;
            formula += element2;
            if (count2 > 1) formula += count2;
            
            return formula;
        }
        
        return null; // Cannot balance charges
    }

    // Generate multiple equation variations for metals with different oxidation states
    generateProductVariations(reactants, products) {
        const variations = [];
        
        // Check if we have metals that can form multiple oxides
        const metalVariations = this.findMetalOxidationVariations(reactants, products);
        
        if (metalVariations.length === 0) {
            // No variations needed, proceed with original
            const balanced = this.balanceAdvancedEquation(reactants, products);
            if (balanced) {
                variations.push({
                    equation: balanced,
                    description: 'Standard equation'
                });
            }
        } else {
            // Generate variations for different oxidation states
            metalVariations.forEach(variation => {
                const modifiedProducts = this.applyMetalVariation(products, variation);
                const balanced = this.balanceAdvancedEquation(reactants, modifiedProducts);
                if (balanced) {
                    variations.push({
                        equation: balanced,
                        description: variation.description,
                        oxidationState: variation.oxidationState
                    });
                }
            });
        }
        
        return variations;
    }

    findMetalOxidationVariations(reactants, products) {
        const variations = [];
        
        if (!this.oxidationStatesDB) {
            return variations; // Database not loaded yet
        }
        
        // Analyze reactants to find elements with multiple oxidation states
        const analysisResults = this.analyzeReactionElements(reactants, products);
        
        // Generate variations based on possible oxidation states
        analysisResults.forEach(analysis => {
            if (analysis.possibleStates.length > 1) {
                analysis.possibleStates.forEach(state => {
                    const possibleCompounds = this.generateCompoundsForState(
                        analysis.element, 
                        state, 
                        analysisResults
                    );
                    
                    if (possibleCompounds.length > 0) {
                        variations.push({
                            element: analysis.element,
                            elementName: this.oxidationStatesDB[analysis.element].name,
                            oxidationState: state.state,
                            possibleCompounds: possibleCompounds,
                            description: `${this.oxidationStatesDB[analysis.element].name}(${state.state.replace('+', '')}) compounds - ${state.description}`,
                            conditions: state.conditions
                        });
                    }
                });
            }
        });
        
        return variations;
    }

    analyzeReactionElements(reactants, products) {
        const elementAnalysis = [];
        const allElements = new Set();
        
        // Collect all elements from reactants and products
        [...reactants, ...products].forEach(molecule => {
            Object.keys(molecule.elements).forEach(element => allElements.add(element));
        });
        
        // Analyze each element
        allElements.forEach(element => {
            if (this.oxidationStatesDB[element]) {
                const elementData = this.oxidationStatesDB[element];
                const possibleStates = elementData.commonStates.map(state => ({
                    state: state,
                    description: elementData.stateDetails[state].description,
                    examples: elementData.stateDetails[state].examples,
                    conditions: elementData.stateDetails[state].conditions
                }));
                
                // Only include if element has multiple possible states
                if (possibleStates.length > 1) {
                    elementAnalysis.push({
                        element: element,
                        name: elementData.name,
                        possibleStates: possibleStates,
                        isInReactants: reactants.some(r => r.elements[element]),
                        isInProducts: products.some(p => p.elements[element])
                    });
                }
            }
        });
        
        return elementAnalysis;
    }

    generateCompoundsForState(targetElement, stateInfo, allElementsAnalysis) {
        const compounds = [];
        
        // Get examples from the database
        const examples = stateInfo.examples || [];
        
        // Filter examples that could be relevant to current reaction
        const relevantExamples = examples.filter(compound => {
            const elements = this.parseElements(compound);
            
            // Check if compound contains elements present in our reaction
            return Object.keys(elements).some(element => 
                allElementsAnalysis.some(analysis => analysis.element === element)
            );
        });
        
        // If no relevant examples, generate basic compounds
        if (relevantExamples.length === 0) {
            // Generate basic binary compounds
            const commonPartners = ['O', 'Cl', 'S', 'N']; // Common elements to form compounds with
            
            commonPartners.forEach(partner => {
                if (allElementsAnalysis.some(analysis => analysis.element === partner)) {
                    const compound = this.generateBinaryCompound(targetElement, partner, stateInfo.state);
                    if (compound) {
                        compounds.push(compound);
                    }
                }
            });
        } else {
            compounds.push(...relevantExamples);
        }
        
        return compounds;
    }

    generateBinaryCompound(element1, element2, oxidationState) {
        if (!this.oxidationStatesDB[element1] || !this.oxidationStatesDB[element2]) {
            return null;
        }
        
        const ox1 = parseInt(oxidationState.replace('+', ''));
        
        // Get most common oxidation state for second element
        const element2States = this.oxidationStatesDB[element2].commonStates;
        const element2State = element2States[0]; // Use most common state
        const ox2 = parseInt(element2State.replace('+', '').replace('-', ''));
        
        // Generate compound formula based on oxidation states
        if (element2 === 'O' && element2State === '-2') {
            // Oxide formation
            const ratio = this.calculateFormulaRatio(Math.abs(ox1), Math.abs(ox2));
            if (ratio.element1Count === 1 && ratio.element2Count === 1) {
                return `${element1}${element2}`;
            } else if (ratio.element1Count === 1) {
                return `${element1}${element2}${ratio.element2Count}`;
            } else if (ratio.element2Count === 1) {
                return `${element1}${ratio.element1Count}${element2}`;
            } else {
                return `${element1}${ratio.element1Count}${element2}${ratio.element2Count}`;
            }
        }
        
        // For other compounds, use similar logic
        return null; // Simplified for now
    }

    calculateFormulaRatio(ox1, ox2) {
        // Find least common multiple to balance charges
        const lcm = (a, b) => Math.abs(a * b) / this.gcd(a, b);
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        
        const totalCharge = lcm(ox1, ox2);
        
        return {
            element1Count: totalCharge / ox1,
            element2Count: totalCharge / ox2
        };
    }

    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    applyMetalVariation(products, variation) {
        // Replace or add compounds based on the oxidation state variation
        const modifiedProducts = [];
        let variationApplied = false;
        
        // Check if we need to replace existing products or add new ones
        products.forEach(product => {
            if (product.elements[variation.element]) {
                // Replace with compounds from this oxidation state
                variation.possibleCompounds.forEach(compoundFormula => {
                    modifiedProducts.push({
                        coefficient: 1,
                        formula: compoundFormula,
                        elements: this.parseElements(compoundFormula)
                    });
                });
                variationApplied = true;
            } else {
                // Keep products that don't contain the varied element
                modifiedProducts.push(product);
            }
        });
        
        // If no existing product contained the element, add new compounds
        if (!variationApplied && variation.possibleCompounds.length > 0) {
            variation.possibleCompounds.forEach(compoundFormula => {
                modifiedProducts.push({
                    coefficient: 1,
                    formula: compoundFormula,
                    elements: this.parseElements(compoundFormula)
                });
            });
        }
        
        return modifiedProducts;
    }

    // Advanced equation balancing using Gaussian elimination
    balanceAdvancedEquation(reactants, products) {
        const molecules = [...reactants, ...products];
        const elements = this.getAllElements(molecules);
        
        // Try multiple algorithms
        let balanced = this.balanceUsingGaussianElimination(reactants, products, elements);
        if (!balanced) {
            balanced = this.balanceUsingIterativeMethod(reactants, products, elements);
        }
        if (!balanced) {
            balanced = this.balanceSimpleEquation(reactants, products);
        }
        
        return balanced;
    }

    getAllElements(molecules) {
        const elements = new Set();
        molecules.forEach(molecule => {
            Object.keys(molecule.elements).forEach(element => elements.add(element));
        });
        return Array.from(elements);
    }

    balanceUsingGaussianElimination(reactants, products, elements) {
        const molecules = [...reactants, ...products];
        const numMolecules = molecules.length;
        const numElements = elements.length;
        
        // Create coefficient matrix (elements x molecules)
        const matrix = [];
        
        for (let i = 0; i < numElements; i++) {
            const row = [];
            const element = elements[i];
            
            // Reactants (positive coefficients)
            for (let j = 0; j < reactants.length; j++) {
                row.push(reactants[j].elements[element] || 0);
            }
            
            // Products (negative coefficients)
            for (let j = 0; j < products.length; j++) {
                row.push(-(products[j].elements[element] || 0));
            }
            
            matrix.push(row);
        }
        
        // Solve using reduced row echelon form
        const solution = this.solveHomogeneousSystem(matrix);
        
        if (solution && solution.every(coeff => coeff > 0)) {
            // Convert to integers
            const coefficients = this.toIntegerCoefficients(solution);
            
            return {
                reactants: reactants.map((r, i) => ({ ...r, coefficient: coefficients[i] })),
                products: products.map((p, i) => ({ ...p, coefficient: coefficients[reactants.length + i] }))
            };
        }
        
        return null;
    }

    solveHomogeneousSystem(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Add augmented column of zeros (homogeneous system)
        const augmented = matrix.map(row => [...row, 0]);
        
        // Gaussian elimination
        for (let i = 0; i < Math.min(rows, cols); i++) {
            // Find pivot
            let pivotRow = i;
            for (let j = i + 1; j < rows; j++) {
                if (Math.abs(augmented[j][i]) > Math.abs(augmented[pivotRow][i])) {
                    pivotRow = j;
                }
            }
            
            if (Math.abs(augmented[pivotRow][i]) < 1e-10) continue;
            
            // Swap rows
            if (pivotRow !== i) {
                [augmented[i], augmented[pivotRow]] = [augmented[pivotRow], augmented[i]];
            }
            
            // Eliminate column
            for (let j = 0; j < rows; j++) {
                if (j !== i && Math.abs(augmented[j][i]) > 1e-10) {
                    const factor = augmented[j][i] / augmented[i][i];
                    for (let k = 0; k <= cols; k++) {
                        augmented[j][k] -= factor * augmented[i][k];
                    }
                }
            }
        }
        
        // Back substitution with assumption (set last coefficient to 1)
        const solution = new Array(cols).fill(0);
        solution[cols - 1] = 1;
        
        for (let i = rows - 1; i >= 0; i--) {
            let sum = 0;
            let mainCoeff = 0;
            let mainVar = -1;
            
            for (let j = 0; j < cols; j++) {
                if (Math.abs(augmented[i][j]) > 1e-10) {
                    if (mainVar === -1) {
                        mainVar = j;
                        mainCoeff = augmented[i][j];
                    } else {
                        sum += augmented[i][j] * solution[j];
                    }
                }
            }
            
            if (mainVar !== -1 && Math.abs(mainCoeff) > 1e-10) {
                solution[mainVar] = -sum / mainCoeff;
            }
        }
        
        return solution.every(x => x >= 0) ? solution : null;
    }

    balanceUsingIterativeMethod(reactants, products, elements) {
        // Enhanced iterative method with better heuristics
        let bestCoefficients = null;
        let minError = Infinity;
        
        for (let attempt = 0; attempt < 10000; attempt++) {
            const coefficients = this.generateSmartCoefficients(reactants.length + products.length, attempt);
            const error = this.calculateBalanceError(reactants, products, coefficients, elements);
            
            if (error === 0) {
                return {
                    reactants: reactants.map((r, i) => ({ ...r, coefficient: coefficients[i] })),
                    products: products.map((p, i) => ({ ...p, coefficient: coefficients[reactants.length + i] }))
                };
            }
            
            if (error < minError) {
                minError = error;
                bestCoefficients = [...coefficients];
            }
        }
        
        // If close enough, try to adjust
        if (minError < elements.length && bestCoefficients) {
            const adjusted = this.fineAdjustCoefficients(reactants, products, bestCoefficients, elements);
            if (adjusted) return adjusted;
        }
        
        return null;
    }

    generateSmartCoefficients(count, attempt) {
        if (attempt < 1000) {
            // Try small integers first
            return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
        } else if (attempt < 5000) {
            // Try medium integers
            return Array.from({ length: count }, () => Math.floor(Math.random() * 15) + 1);
        } else {
            // Try larger range
            return Array.from({ length: count }, () => Math.floor(Math.random() * 30) + 1);
        }
    }

    calculateBalanceError(reactants, products, coefficients, elements) {
        let totalError = 0;
        
        for (const element of elements) {
            let leftCount = 0;
            let rightCount = 0;
            
            reactants.forEach((molecule, i) => {
                leftCount += (molecule.elements[element] || 0) * coefficients[i];
            });
            
            products.forEach((molecule, i) => {
                rightCount += (molecule.elements[element] || 0) * coefficients[reactants.length + i];
            });
            
            totalError += Math.abs(leftCount - rightCount);
        }
        
        return totalError;
    }

    fineAdjustCoefficients(reactants, products, coefficients, elements) {
        // Try small adjustments to near-solutions
        for (let adjustment = 1; adjustment <= 3; adjustment++) {
            for (let i = 0; i < coefficients.length; i++) {
                const original = coefficients[i];
                
                // Try increasing
                coefficients[i] = original + adjustment;
                if (this.calculateBalanceError(reactants, products, coefficients, elements) === 0) {
                    return {
                        reactants: reactants.map((r, j) => ({ ...r, coefficient: coefficients[j] })),
                        products: products.map((p, j) => ({ ...p, coefficient: coefficients[reactants.length + j] }))
                    };
                }
                
                // Try decreasing
                if (original > adjustment) {
                    coefficients[i] = original - adjustment;
                    if (this.calculateBalanceError(reactants, products, coefficients, elements) === 0) {
                        return {
                            reactants: reactants.map((r, j) => ({ ...r, coefficient: coefficients[j] })),
                            products: products.map((p, j) => ({ ...p, coefficient: coefficients[reactants.length + j] }))
                        };
                    }
                }
                
                // Reset
                coefficients[i] = original;
            }
        }
        
        return null;
    }

    toIntegerCoefficients(solution) {
        // Find the least common denominator and convert to integers
        const precision = 1000000;
        const integers = solution.map(x => Math.round(x * precision));
        const gcd = this.calculateGCD(integers);
        return integers.map(x => Math.max(1, x / gcd));
    }

    calculateGCD(numbers) {
        const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
        return numbers.reduce((acc, num) => gcd(acc, Math.abs(num)), 0);
    }

    balanceEquation() {
        const equationInput = document.getElementById('equation-input');
        const equation = equationInput.value.trim();
        
        if (!equation) {
            this.showError('Please enter a chemical equation');
            return;
        }

        try {
            const parsed = this.parseChemicalEquation(equation);
            this.reactants = parsed.reactants;
            this.products = parsed.products;
            
            // Validate chemical formulas first
            const validationResult = this.validateAndSuggestFormulas(parsed.reactants, parsed.products);
            if (!validationResult.isValid) {
                this.showFormulaWarnings(validationResult.warnings);
                if (validationResult.suggestions.length > 0) {
                    this.showFormulaSuggestions(validationResult.suggestions);
                    return;
                }
            }
            
            // Check for multiple possible products (oxidation states)
            const productVariations = this.generateProductVariations(parsed.reactants, parsed.products);
            
            if (productVariations.length > 1) {
                this.showMultipleEquationOptions(productVariations);
            } else {
                // Use advanced balancing algorithm
                const balanced = this.balanceAdvancedEquation(parsed.reactants, parsed.products);
                
                if (balanced) {
                    this.displayBalancedEquation(balanced);
                    this.showStoichiometryInputs(balanced);
                } else {
                    this.showError('Unable to balance this equation automatically. Please check the formula.');
                }
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    balanceSimpleEquation(reactants, products) {
        // Get all unique elements
        const allElements = new Set();
        [...reactants, ...products].forEach(molecule => {
            Object.keys(molecule.elements).forEach(element => allElements.add(element));
        });

        // Try to balance with coefficients 1-10
        for (let attempt = 0; attempt < 1000; attempt++) {
            const coefficients = this.generateCoefficients(reactants.length + products.length);
            
            if (this.checkBalance(reactants, products, coefficients, allElements)) {
                return {
                    reactants: reactants.map((r, i) => ({ ...r, coefficient: coefficients[i] })),
                    products: products.map((p, i) => ({ ...p, coefficient: coefficients[reactants.length + i] }))
                };
            }
        }
        
        // If simple balancing fails, try a basic matrix approach for common cases
        return this.tryMatrixBalancing(reactants, products, allElements);
    }

    generateCoefficients(count) {
        // Generate random coefficients between 1 and 10
        return Array.from({ length: count }, () => Math.floor(Math.random() * 10) + 1);
    }

    checkBalance(reactants, products, coefficients, elements) {
        for (const element of elements) {
            let leftCount = 0;
            let rightCount = 0;
            
            reactants.forEach((molecule, i) => {
                leftCount += (molecule.elements[element] || 0) * coefficients[i];
            });
            
            products.forEach((molecule, i) => {
                rightCount += (molecule.elements[element] || 0) * coefficients[reactants.length + i];
            });
            
            if (leftCount !== rightCount) {
                return false;
            }
        }
        return true;
    }

    tryMatrixBalancing(reactants, products, elements) {
        // Simple heuristic balancing for common cases
        const molecules = [...reactants, ...products];
        const elementArray = Array.from(elements);
        
        // Start with all coefficients as 1
        let coefficients = new Array(molecules.length).fill(1);
        
        // Try to balance each element iteratively
        for (let iterations = 0; iterations < 10; iterations++) {
            let balanced = true;
            
            for (const element of elementArray) {
                let leftCount = 0;
                let rightCount = 0;
                
                reactants.forEach((molecule, i) => {
                    leftCount += (molecule.elements[element] || 0) * coefficients[i];
                });
                
                products.forEach((molecule, i) => {
                    rightCount += (molecule.elements[element] || 0) * coefficients[reactants.length + i];
                });
                
                if (leftCount !== rightCount) {
                    balanced = false;
                    // Simple adjustment
                    if (leftCount < rightCount) {
                        // Increase reactant coefficients
                        for (let i = 0; i < reactants.length; i++) {
                            if (reactants[i].elements[element]) {
                                coefficients[i] = Math.ceil(coefficients[i] * (rightCount / leftCount));
                            }
                        }
                    } else {
                        // Increase product coefficients
                        for (let i = 0; i < products.length; i++) {
                            if (products[i].elements[element]) {
                                coefficients[reactants.length + i] = Math.ceil(coefficients[reactants.length + i] * (leftCount / rightCount));
                            }
                        }
                    }
                }
            }
            
            if (balanced) {
                return {
                    reactants: reactants.map((r, i) => ({ ...r, coefficient: coefficients[i] })),
                    products: products.map((p, i) => ({ ...p, coefficient: coefficients[reactants.length + i] }))
                };
            }
        }
        
        return null;
    }

    displayBalancedEquation(balanced) {
        const resultDiv = document.getElementById('balanced-result');
        const equationDiv = document.getElementById('balanced-equation');
        
        const reactantStr = balanced.reactants
            .map(r => `${r.coefficient > 1 ? r.coefficient : ''}${r.formula}`)
            .join(' + ');
        
        const productStr = balanced.products
            .map(p => `${p.coefficient > 1 ? p.coefficient : ''}${p.formula}`)
            .join(' + ');
        
        equationDiv.textContent = `${reactantStr} → ${productStr}`;
        resultDiv.style.display = 'block';
        
        this.balancedEquation = balanced;
    }

    showStoichiometryInputs(balanced) {
        const inputsDiv = document.getElementById('stoichiometry-inputs');
        const reactantInputsDiv = document.getElementById('reactant-inputs');
        
        reactantInputsDiv.innerHTML = '';
        
        balanced.reactants.forEach((reactant, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            inputGroup.innerHTML = `
                <label for="mass-${index}">Mass of ${reactant.formula} (grams):</label>
                <input type="number" id="mass-${index}" step="0.01" min="0" placeholder="0.00">
            `;
            reactantInputsDiv.appendChild(inputGroup);
        });
        
        inputsDiv.style.display = 'block';
    }

    calculateStoichiometry() {
        if (!this.balancedEquation) {
            this.showError('Please balance an equation first');
            return;
        }

        const masses = [];
        const molarMasses = [];
        
        // Get input masses and calculate molar masses
        this.balancedEquation.reactants.forEach((reactant, index) => {
            const massInput = document.getElementById(`mass-${index}`);
            const mass = parseFloat(massInput.value) || 0;
            masses.push(mass);
            molarMasses.push(this.calculateMolarMass(reactant.elements));
        });

        // Calculate moles for each reactant
        const moles = masses.map((mass, index) => mass / molarMasses[index]);
        
        // Calculate mole ratios
        this.displayMoleRatios(moles);
        
        // Find limiting reagent
        const limitingReagent = this.findLimitingReagent(moles);
        this.displayLimitingReagent(limitingReagent);
        
        // Calculate theoretical yield
        this.calculateTheoreticalYield(moles, limitingReagent, molarMasses);
        
        document.getElementById('calculations-result').style.display = 'block';
    }

    calculateMolarMass(elements) {
        // Atomic masses (simplified)
        const atomicMasses = {
            'H': 1.008, 'He': 4.003, 'Li': 6.941, 'Be': 9.012, 'B': 10.811, 'C': 12.011,
            'N': 14.007, 'O': 15.999, 'F': 18.998, 'Ne': 20.180, 'Na': 22.990, 'Mg': 24.305,
            'Al': 26.982, 'Si': 28.086, 'P': 30.974, 'S': 32.065, 'Cl': 35.453, 'Ar': 39.948,
            'K': 39.098, 'Ca': 40.078, 'Fe': 55.845, 'Cu': 63.546, 'Zn': 65.380, 'Br': 79.904,
            'I': 126.904, 'Pb': 207.2, 'Au': 196.967, 'Ag': 107.868
        };
        
        let molarMass = 0;
        for (const [element, count] of Object.entries(elements)) {
            molarMass += (atomicMasses[element] || 0) * count;
        }
        return molarMass;
    }

    displayMoleRatios(moles) {
        const ratiosDiv = document.getElementById('mole-ratios');
        const ratios = moles.map((mol, index) => {
            const reactant = this.balancedEquation.reactants[index];
            return `${reactant.formula}: ${mol.toFixed(4)} mol (ratio ${reactant.coefficient})`;
        });
        ratiosDiv.innerHTML = ratios.join('<br>');
    }

    findLimitingReagent(moles) {
        let limitingIndex = -1;
        let minRatio = Infinity;
        
        moles.forEach((mol, index) => {
            const coefficient = this.balancedEquation.reactants[index].coefficient;
            const ratio = mol / coefficient;
            if (ratio < minRatio && mol > 0) {
                minRatio = ratio;
                limitingIndex = index;
            }
        });
        
        return limitingIndex;
    }

    displayLimitingReagent(limitingIndex) {
        const limitingDiv = document.getElementById('limiting-reagent');
        if (limitingIndex >= 0) {
            const limitingReactant = this.balancedEquation.reactants[limitingIndex];
            limitingDiv.innerHTML = `<strong>${limitingReactant.formula}</strong> (limits the reaction)`;
        } else {
            limitingDiv.innerHTML = 'No limiting reagent identified (check input masses)';
        }
    }

    calculateTheoreticalYield(moles, limitingIndex, reactantMolarMasses) {
        const yieldDiv = document.getElementById('theoretical-yield');
        
        if (limitingIndex < 0) {
            yieldDiv.innerHTML = 'Cannot calculate without limiting reagent';
            return;
        }
        
        const limitingMoles = moles[limitingIndex];
        const limitingCoeff = this.balancedEquation.reactants[limitingIndex].coefficient;
        
        const yields = this.balancedEquation.products.map(product => {
            const productMoles = (limitingMoles / limitingCoeff) * product.coefficient;
            const productMolarMass = this.calculateMolarMass(product.elements);
            const productMass = productMoles * productMolarMass;
            
            return `${product.formula}: ${productMass.toFixed(3)} g (${productMoles.toFixed(4)} mol)`;
        });
        
        yieldDiv.innerHTML = yields.join('<br>');
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.style.cssText = `
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
            `;
            document.querySelector('.calculator-form').insertBefore(errorDiv, document.querySelector('.calculator-form').firstChild);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }

    showFormulaWarnings(warnings) {
        let warningDiv = document.getElementById('formula-warnings');
        if (!warningDiv) {
            warningDiv = document.createElement('div');
            warningDiv.id = 'formula-warnings';
            warningDiv.style.cssText = `
                background: #fef3c7;
                border: 1px solid #f59e0b;
                color: #92400e;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
            `;
            document.querySelector('.calculator-form').insertBefore(warningDiv, document.querySelector('.calculator-form').firstChild);
        }
        
        warningDiv.innerHTML = `
            <h4 style="margin-bottom: 0.5rem;">⚠️ Formula Warnings:</h4>
            ${warnings.map(warning => `<p>• ${warning}</p>`).join('')}
        `;
        warningDiv.style.display = 'block';
    }

    showFormulaSuggestions(suggestions) {
        let suggestionsDiv = document.getElementById('formula-suggestions');
        if (!suggestionsDiv) {
            suggestionsDiv = document.createElement('div');
            suggestionsDiv.id = 'formula-suggestions';
            suggestionsDiv.style.cssText = `
                background: #dbeafe;
                border: 1px solid #3b82f6;
                color: #1e40af;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
            `;
            document.querySelector('.calculator-form').insertBefore(suggestionsDiv, document.querySelector('.calculator-form').firstChild);
        }
        
        const suggestionsList = suggestions.map(suggestion => `
            <div style="margin: 0.5rem 0; padding: 0.5rem; background: white; border-radius: 4px;">
                <strong>${suggestion.original}</strong> → <strong style="color: #059669;">${suggestion.suggested}</strong>
                <br><small>${suggestion.reason}</small>
                <button class="suggestion-btn" data-original="${suggestion.original}" data-suggested="${suggestion.suggested}" 
                        style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Apply
                </button>
            </div>
        `).join('');
        
        suggestionsDiv.innerHTML = `
            <h4 style="margin-bottom: 0.5rem;">💡 Formula Suggestions:</h4>
            ${suggestionsList}
            <button id="ignore-suggestions" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Ignore and Continue
            </button>
        `;
        suggestionsDiv.style.display = 'block';
        
        // Add event listeners for suggestion buttons
        suggestionsDiv.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const original = e.target.dataset.original;
                const suggested = e.target.dataset.suggested;
                this.applySuggestion(original, suggested);
            });
        });
        
        // Add event listener for ignore button
        document.getElementById('ignore-suggestions').addEventListener('click', () => {
            this.hideFormulaMessages();
            this.proceedWithOriginalEquation();
        });
    }

    showMultipleEquationOptions(variations) {
        let optionsDiv = document.getElementById('equation-options');
        if (!optionsDiv) {
            optionsDiv = document.createElement('div');
            optionsDiv.id = 'equation-options';
            optionsDiv.style.cssText = `
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                color: #0c4a6e;
                padding: 1.5rem;
                border-radius: 8px;
                margin: 1rem 0;
            `;
            document.querySelector('.calculator-form').insertBefore(optionsDiv, document.querySelector('.calculator-form').firstChild);
        }
        
        const optionsList = variations.map((variation, index) => {
            const reactantStr = variation.equation.reactants
                .map(r => `${r.coefficient > 1 ? r.coefficient : ''}${r.formula}`)
                .join(' + ');
            
            const productStr = variation.equation.products
                .map(p => `${p.coefficient > 1 ? p.coefficient : ''}${p.formula}`)
                .join(' + ');
            
            return `
                <div style="margin: 1rem 0; padding: 1rem; background: white; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                    <h5 style="margin-bottom: 0.5rem; color: #0c4a6e;">${variation.description}</h5>
                    <div style="font-family: 'Courier New', monospace; font-size: 1.1rem; color: #1e40af; margin: 0.5rem 0;">
                        ${reactantStr} → ${productStr}
                    </div>
                    ${variation.oxidationState ? `<small>Oxidation state: ${variation.oxidationState}</small>` : ''}
                    <button class="option-btn" data-index="${index}" 
                            style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Select This Equation
                    </button>
                </div>
            `;
        }).join('');
        
        optionsDiv.innerHTML = `
            <h4 style="margin-bottom: 1rem;">🧪 Multiple Possible Equations Detected</h4>
            <p style="margin-bottom: 1rem;">This reaction can proceed in different ways depending on conditions. Choose the equation you want to use:</p>
            ${optionsList}
        `;
        optionsDiv.style.display = 'block';
        
        // Add event listeners for option buttons
        optionsDiv.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.selectEquationOption(variations[index]);
            });
        });
    }

    applySuggestion(original, suggested) {
        const equationInput = document.getElementById('equation-input');
        const currentEquation = equationInput.value;
        const correctedEquation = currentEquation.replace(new RegExp(original, 'gi'), suggested);
        equationInput.value = correctedEquation;
        
        this.hideFormulaMessages();
        this.balanceEquation();
    }

    proceedWithOriginalEquation() {
        // Force balance with original equation (ignoring warnings)
        const equationInput = document.getElementById('equation-input');
        const equation = equationInput.value.trim();
        
        try {
            const parsed = this.parseChemicalEquation(equation);
            const balanced = this.balanceAdvancedEquation(parsed.reactants, parsed.products);
            
            if (balanced) {
                this.displayBalancedEquation(balanced);
                this.showStoichiometryInputs(balanced);
            } else {
                this.showError('Unable to balance this equation. The chemical formulas may be incorrect.');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    selectEquationOption(selectedVariation) {
        this.hideFormulaMessages();
        this.displayBalancedEquation(selectedVariation.equation);
        this.showStoichiometryInputs(selectedVariation.equation);
    }

    hideFormulaMessages() {
        ['error-message', 'formula-warnings', 'formula-suggestions', 'equation-options'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StoichiometryCalculator();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add example equations for quick testing
    const exampleEquations = [
        'H2 + O2 → H2O',
        'CH4 + O2 → CO2 + H2O',
        'Fe + O2 → Fe2O3',
        'C2H6 + O2 → CO2 + H2O',
        'Na + Cl2 → NaCl'
    ];
    
    // Add example buttons (optional)
    const equationInput = document.getElementById('equation-input');
    equationInput.addEventListener('focus', () => {
        if (!equationInput.value) {
            equationInput.placeholder = 'Try: ' + exampleEquations[Math.floor(Math.random() * exampleEquations.length)];
        }
    });
});