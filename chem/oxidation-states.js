/**
 * Oxidation State Analysis Engine
 * Computes oxidation states for elements in compounds and detects redox reactions
 */

class OxidationStateEngine {
    constructor() {
        // Oxidation state rules in priority order
        this.rules = [
            { name: 'freeElement', priority: 100 },
            { name: 'ionicCompound', priority: 90 },
            { name: 'fluoride', priority: 80 },
            { name: 'alkaliMetal', priority: 70 },
            { name: 'alkalineEarth', priority: 60 },
            { name: 'hydrogen', priority: 50 },
            { name: 'oxygen', priority: 40 },
            { name: 'halogen', priority: 30 },
            { name: 'neutralCompound', priority: 10 }
        ];
        
        // Element group data
        this.elementGroups = {
            alkaliMetals: ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'],
            alkalineEarths: ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'],
            halogens: ['F', 'Cl', 'Br', 'I', 'At'],
            chalcogens: ['O', 'S', 'Se', 'Te', 'Po'],
            transitionMetals: [
                'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
                'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
                'La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg'
            ]
        };
        
        // Common oxidation states for elements
        this.commonOxidationStates = {
            'H': [+1, -1],
            'Li': [+1], 'Na': [+1], 'K': [+1], 'Rb': [+1], 'Cs': [+1],
            'Be': [+2], 'Mg': [+2], 'Ca': [+2], 'Sr': [+2], 'Ba': [+2],
            'B': [+3], 'Al': [+3], 'Ga': [+3],
            'C': [+4, +2, -4], 'Si': [+4, -4],
            'N': [+5, +4, +3, +2, +1, 0, -1, -2, -3],
            'P': [+5, +3, -3], 'As': [+5, +3, -3],
            'O': [-2, -1, 0], 'S': [+6, +4, +2, 0, -2],
            'F': [-1], 'Cl': [+7, +5, +3, +1, -1], 'Br': [+7, +5, +1, -1], 'I': [+7, +5, +1, -1],
            'Fe': [+3, +2], 'Cu': [+2, +1], 'Zn': [+2], 'Ag': [+1], 'Au': [+3, +1],
            'Cr': [+6, +3], 'Mn': [+7, +4, +2], 'Ni': [+2], 'Co': [+3, +2],
            'Pb': [+4, +2], 'Sn': [+4, +2]
        };
    }

    /**
     * Compute oxidation states for all elements in a compound
     * @param {Object} composition - Element counts from parser
     * @param {number} charge - Net charge of the species
     * @returns {Object} - Element -> oxidation state mapping
     */
    computeOxidationStates(composition, charge = 0) {
        const elements = Object.keys(composition);
        const oxidationStates = {};
        
        // Handle simple cases first
        if (elements.length === 1) {
            // Monatomic ion or element
            const element = elements[0];
            oxidationStates[element] = charge / composition[element];
            return oxidationStates;
        }
        
        // Apply rules in priority order
        const constraints = [];
        const assigned = new Set();
        
        for (const rule of this.rules) {
            this.applyRule(rule.name, composition, charge, oxidationStates, constraints, assigned);
        }
        
        // Solve remaining assignments using constraints
        this.solveConstraints(composition, charge, oxidationStates, constraints);
        
        return oxidationStates;
    }

    /**
     * Apply a specific oxidation state rule
     */
    applyRule(ruleName, composition, charge, oxidationStates, constraints, assigned) {
        switch (ruleName) {
            case 'freeElement':
                // Free elements have OS = 0
                if (Object.keys(composition).length === 1 && charge === 0) {
                    const element = Object.keys(composition)[0];
                    oxidationStates[element] = 0;
                    assigned.add(element);
                }
                break;
                
            case 'alkaliMetal':
                // Group 1 metals always +1 (except in special compounds)
                for (const element of this.elementGroups.alkaliMetals) {
                    if (composition[element] && !assigned.has(element)) {
                        oxidationStates[element] = +1;
                        assigned.add(element);
                    }
                }
                break;
                
            case 'alkalineEarth':
                // Group 2 metals always +2
                for (const element of this.elementGroups.alkalineEarths) {
                    if (composition[element] && !assigned.has(element)) {
                        oxidationStates[element] = +2;
                        assigned.add(element);
                    }
                }
                break;
                
            case 'fluoride':
                // Fluorine always -1
                if (composition['F'] && !assigned.has('F')) {
                    oxidationStates['F'] = -1;
                    assigned.add('F');
                }
                break;
                
            case 'hydrogen':
                // H is +1 in acids and most compounds, -1 in hydrides with metals
                if (composition['H'] && !assigned.has('H')) {
                    const hasMetals = Object.keys(composition).some(el => 
                        this.elementGroups.alkaliMetals.includes(el) || 
                        this.elementGroups.alkalineEarths.includes(el)
                    );
                    oxidationStates['H'] = hasMetals ? -1 : +1;
                    assigned.add('H');
                }
                break;
                
            case 'oxygen':
                // O is usually -2, except in peroxides (-1) and compounds with F
                if (composition['O'] && !assigned.has('O') && !composition['F']) {
                    // Detect peroxides (H2O2, Na2O2, etc.)
                    const isPeroxide = (composition['H'] === 2 && composition['O'] === 2) ||
                                     (Object.keys(composition).length === 2 && composition['O'] > 1);
                    oxidationStates['O'] = isPeroxide ? -1 : -2;
                    assigned.add('O');
                }
                break;
                
            case 'halogen':
                // Halogens are -1 when in ionic compounds (but not in oxoacids)
                for (const halogen of this.elementGroups.halogens.slice(1)) { // Skip F
                    if (composition[halogen] && !assigned.has(halogen) && !composition['O']) {
                        oxidationStates[halogen] = -1;
                        assigned.add(halogen);
                    }
                }
                break;
        }
    }

    /**
     * Solve remaining oxidation states using charge constraint
     */
    solveConstraints(composition, charge, oxidationStates, constraints) {
        // Calculate total charge from known oxidation states
        let knownCharge = 0;
        const unknownElements = [];
        
        for (const [element, count] of Object.entries(composition)) {
            if (oxidationStates[element] !== undefined) {
                knownCharge += oxidationStates[element] * count;
            } else {
                unknownElements.push(element);
            }
        }
        
        const remainingCharge = charge - knownCharge;
        
        // For single unknown element, calculate directly
        if (unknownElements.length === 1) {
            const element = unknownElements[0];
            const count = composition[element];
            oxidationStates[element] = remainingCharge / count;
        }
        // For multiple unknowns, use common oxidation states
        else if (unknownElements.length > 1) {
            this.assignCommonOxidationStates(unknownElements, composition, remainingCharge, oxidationStates);
        }
    }

    /**
     * Assign common oxidation states to unknown elements
     */
    assignCommonOxidationStates(unknownElements, composition, remainingCharge, oxidationStates) {
        // Try combinations of common oxidation states
        const assignments = this.findValidAssignment(unknownElements, composition, remainingCharge);
        
        if (assignments) {
            for (const [element, os] of Object.entries(assignments)) {
                oxidationStates[element] = os;
            }
        } else {
            // Fallback: distribute charge evenly or use most common OS
            for (const element of unknownElements) {
                const commonOS = this.commonOxidationStates[element];
                if (commonOS && commonOS.length > 0) {
                    // Use most common (first in list)
                    oxidationStates[element] = commonOS[0];
                } else {
                    // Last resort: assume reasonable OS based on position
                    oxidationStates[element] = this.guessOxidationState(element);
                }
            }
        }
    }

    /**
     * Find valid oxidation state assignment for multiple unknowns
     */
    findValidAssignment(elements, composition, targetCharge) {
        if (elements.length === 0) return {};
        if (elements.length > 3) return null; // Too complex for brute force
        
        const [element, ...rest] = elements;
        const count = composition[element];
        const commonOS = this.commonOxidationStates[element] || [-3, -2, -1, 0, +1, +2, +3, +4, +5, +6];
        
        for (const os of commonOS) {
            const contribution = os * count;
            const remaining = targetCharge - contribution;
            
            if (rest.length === 0) {
                return remaining === 0 ? { [element]: os } : null;
            }
            
            const restAssignment = this.findValidAssignment(rest, composition, remaining);
            if (restAssignment !== null) {
                return { [element]: os, ...restAssignment };
            }
        }
        
        return null;
    }

    /**
     * Guess oxidation state based on element properties
     */
    guessOxidationState(element) {
        if (this.elementGroups.transitionMetals.includes(element)) {
            return +2; // Most common for transition metals
        }
        
        // Based on group number patterns
        const atomicNumber = this.getAtomicNumber(element);
        if (atomicNumber <= 2) return 0; // H, He
        if (atomicNumber <= 10) return atomicNumber - 2; // Li-Ne group trends
        
        return +2; // Reasonable default
    }

    /**
     * Detect redox reaction by analyzing oxidation state changes
     * @param {Array} reactants - Array of {composition, charge} objects
     * @param {Array} products - Array of {composition, charge} objects  
     * @returns {Object} - Redox analysis results
     */
    analyzeRedoxReaction(reactants, products) {
        // Compute OS for all species
        const reactantOS = reactants.map(species => 
            this.computeOxidationStates(species.composition, species.charge || 0)
        );
        const productOS = products.map(species =>
            this.computeOxidationStates(species.composition, species.charge || 0)
        );
        
        // Find elements that change oxidation state
        const osChanges = {};
        const allElements = new Set();
        
        // Collect all elements
        [...reactants, ...products].forEach(species => {
            Object.keys(species.composition).forEach(el => allElements.add(el));
        });
        
        for (const element of allElements) {
            const reactantOSValues = reactantOS
                .map(os => os[element])
                .filter(val => val !== undefined);
            const productOSValues = productOS
                .map(os => os[element])
                .filter(val => val !== undefined);
                
            const minReactant = Math.min(...reactantOSValues, Infinity);
            const maxReactant = Math.max(...reactantOSValues, -Infinity);
            const minProduct = Math.min(...productOSValues, Infinity);
            const maxProduct = Math.max(...productOSValues, -Infinity);
            
            if (minReactant !== minProduct || maxReactant !== maxProduct) {
                osChanges[element] = {
                    reactantRange: [minReactant, maxReactant],
                    productRange: [minProduct, maxProduct],
                    oxidized: minProduct > maxReactant,
                    reduced: maxProduct < minReactant
                };
            }
        }
        
        const isRedox = Object.keys(osChanges).length > 0;
        
        return {
            isRedox,
            osChanges,
            oxidizedSpecies: this.findSpeciesWithChangedOS(reactants, productOS, true),
            reducedSpecies: this.findSpeciesWithChangedOS(reactants, productOS, false),
            electronTransfer: this.calculateElectronTransfer(osChanges),
            reactantOS,
            productOS
        };
    }

    /**
     * Find species that were oxidized or reduced
     */
    findSpeciesWithChangedOS(species, targetOS, lookForOxidation) {
        const changedSpecies = [];
        
        species.forEach((compound, index) => {
            const hasChange = Object.entries(compound.composition).some(([element, count]) => {
                const currentOS = this.computeOxidationStates(compound.composition, compound.charge || 0);
                const targetOSForSpecies = targetOS[index];
                
                if (currentOS[element] !== undefined && targetOSForSpecies[element] !== undefined) {
                    const change = targetOSForSpecies[element] - currentOS[element];
                    return lookForOxidation ? change > 0 : change < 0;
                }
                return false;
            });
            
            if (hasChange) {
                changedSpecies.push({
                    formula: compound.formula,
                    index,
                    type: lookForOxidation ? 'oxidized' : 'reduced'
                });
            }
        });
        
        return changedSpecies;
    }

    /**
     * Calculate total electron transfer
     */
    calculateElectronTransfer(osChanges) {
        let totalElectrons = 0;
        
        for (const [element, change] of Object.entries(osChanges)) {
            if (change.oxidized) {
                totalElectrons += Math.abs(change.productRange[1] - change.reactantRange[0]);
            }
        }
        
        return totalElectrons;
    }

    /**
     * Get atomic number for element (simplified lookup)
     */
    getAtomicNumber(element) {
        const elements = {
            'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'Ne': 10,
            'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15, 'S': 16, 'Cl': 17, 'Ar': 18,
            'K': 19, 'Ca': 20, 'Fe': 26, 'Cu': 29, 'Zn': 30, 'Ag': 47, 'Au': 79
        };
        return elements[element] || 50; // Default for unknown
    }
}