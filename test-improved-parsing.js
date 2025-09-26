// Test improved charge notation parsing
const testCases = [
    "MnO4- + Fe+2 + H+ -> Mn+2 + Fe+3 + H2O",
    "Cr2O7-2 + Fe+2 + H+ -> Cr+3 + Fe+3 + H2O", 
    "SO4-2 + H+",
    "[Fe(CN)6]-4 + Fe+3",
    "MnO4^- + Fe^+2"  // Already normalized
];

function improvedNormalization(equation) {
    console.log(`Original: ${equation}`);
    
    let normalized = equation
        // Pattern 1: Species ending with charge (MnO4-, Fe+2, SO4-2)
        .replace(/([A-Za-z0-9)\]]+)([+-])([0-9]*)/g, (match, species, sign, charge) => {
            const chargeNum = charge || '1';
            return species + '^' + sign + chargeNum;
        })
        // Pattern 2: Remove double ^ if any
        .replace(/\^\^/g, '^')
        // Pattern 3: Handle edge cases with parentheses
        .replace(/(\([^)]+\))([+-])([0-9]*)/g, (match, species, sign, charge) => {
            const chargeNum = charge || '1';
            return species + '^' + sign + chargeNum;
        });
        
    console.log(`Improved: ${normalized}`);
    console.log('---');
}

testCases.forEach(improvedNormalization);