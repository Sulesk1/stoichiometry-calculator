// Test the suggestion system
const testCases = [
    "MnO4 + Fe → Mn + Fe", // Should suggest MnO4^- + 5Fe^2+ + 8H+ → Mn^2+ + 5Fe^3+ + 4H2O
    "Cr2O7 + Fe → Cr + Fe", // Should suggest Cr2O7^2- + 6Fe^2+ + 14H+ → 2Cr^3+ + 6Fe^3+ + 7H2O
    "MnO4 + I → Mn + I2", // Should suggest 2MnO4^- + 10I^- + 16H+ → 2Mn^2+ + 5I2 + 8H2O
    "Random equation → No suggestion"
];

console.log("Testing Suggestion System\n");

testCases.forEach((equation, index) => {
    console.log(`Test ${index + 1}: ${equation}`);
    
    // Simulate the suggestion logic
    const parts = equation.split('→');
    if (parts.length === 2) {
        const reactants = parts[0].trim().split('+').map(s => ({formula: s.trim()}));
        const products = parts[1].trim().split('+').map(s => ({formula: s.trim()}));
        
        const rFormulas = reactants.map(r => r.formula);
        const pFormulas = products.map(p => p.formula);
        
        const suggestions = [];
        
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
        
        if (suggestions.length > 0) {
            console.log(`  ✓ Suggestion: ${suggestions[0]}`);
        } else {
            console.log(`  ✗ No suggestions found`);
        }
    }
    console.log('');
});