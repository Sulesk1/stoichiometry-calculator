// Test charge notation parsing
const testEquations = [
    "MnO4- + Fe+2 + H+ -> Mn+2 + Fe+3 + H2O",  // Original format from user
    "MnO4^- + Fe^+2 + H+ -> Mn^+2 + Fe^+3 + H2O"  // Expected format
];

// Current normalization regex
function testNormalization(equation) {
    console.log(`Original: ${equation}`);
    // Current regex: ([A-Za-z0-9)\]]+)([0-9]*)([+-])
    let normalized = equation.replace(/([A-Za-z0-9)\]]+)([0-9]*)([+-])/g, '$1^$2$3');
    console.log(`Current:  ${normalized}`);
    
    // Better regex to handle +2, -2 format
    normalized = equation.replace(/([A-Za-z0-9)\]]+)([+-])([0-9]*)/g, '$1^$2$3');
    console.log(`Better:   ${normalized}`);
    
    // Even more comprehensive
    normalized = equation.replace(/([A-Za-z0-9)\]]+)([+-])([0-9]+)/g, (match, species, sign, charge) => {
        return species + '^' + sign + charge;
    });
    console.log(`Comprehensive: ${normalized}`);
    console.log('---');
}

testEquations.forEach(testNormalization);