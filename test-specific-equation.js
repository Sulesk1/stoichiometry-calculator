// Test a specific failing equation
const equation = "MnO4- + Fe+2 + H+ -> Mn+2 + Fe+3 + H2O";

console.log("Testing equation:", equation);

// Test the normalization
let normalized = equation
    .replace(/([A-Za-z0-9)\]]+)([+-])([0-9]*)/g, (match, species, sign, charge) => {
        const chargeNum = charge || '1';
        return species + '^' + sign + chargeNum;
    })
    .replace(/\^\^/g, '^')
    .replace(/(\([^)]+\))([+-])([0-9]*)/g, (match, species, sign, charge) => {
        const chargeNum = charge || '1';
        return species + '^' + sign + chargeNum;
    });

console.log("Normalized:", normalized);

// This should now be: "MnO4^-1 + Fe^+2 + H^+1 -> Mn^+2 + Fe^+3 + H2O"
// Let's see if we can balance this manually:
// Reactants: MnO4^-1, Fe^+2, H^+1  
// Products: Mn^+2, Fe^+3, H2O

// MnO4^- + 5Fe^+2 + 8H^+ → Mn^+2 + 5Fe^+3 + 4H2O
console.log("Expected balanced equation: MnO4^- + 5Fe^+2 + 8H^+ → Mn^+2 + 5Fe^+3 + 4H2O");