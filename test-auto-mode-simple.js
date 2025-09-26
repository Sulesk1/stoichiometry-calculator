// Quick test of the auto-mode detection fix
console.log("=== Testing Auto-Mode Detection Fix ===");

// Simulate the key part of the fix
function testAutoModeDetection(equation, initialMode = 'standard') {
    console.log(`\nTesting: ${equation}`);
    console.log(`Initial mode: ${initialMode}`);
    
    // Simulate parsing to check for charges
    const hasCharges = /[+-]\d|\^[+-]/.test(equation);
    console.log(`Has charges: ${hasCharges}`);
    
    let finalMode = initialMode;
    if (hasCharges && initialMode === 'standard') {
        finalMode = 'redox';
        console.log(`Auto-upgraded to: ${finalMode}`);
    } else {
        console.log(`Final mode: ${finalMode}`);
    }
    
    return finalMode;
}

const testCases = [
    "MnO4- + Fe+2 + H+ -> Mn+2 + Fe+3 + H2O",
    "Cr2O7-2 + Fe+2 + H+ -> Cr+3 + Fe+3 + H2O",
    "H2 + O2 -> H2O", // Should stay standard
    "Fe^+2 + MnO4^- -> Fe^+3 + Mn^+2"  // Already normalized charges
];

testCases.forEach(eq => testAutoModeDetection(eq));

console.log("\n✓ Auto-mode detection should now work!");