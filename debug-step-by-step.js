// Debug the parsing and matrix construction for a failing equation
console.log("=== Debugging Matrix Construction ===");

// Test with a simple equation that's failing
const testEquation = "MnO4- + Fe+2 + H+ -> Mn+2 + Fe+3 + H2O";
console.log("Original equation:", testEquation);

// Test the normalization step
let normalized = testEquation
    .replace(/([A-Za-z0-9)\]]+)([+-])([0-9]*)/g, (match, species, sign, charge) => {
        const chargeNum = charge || '1';
        return species + '^' + sign + chargeNum;
    })
    .replace(/\^\^/g, '^')
    .replace(/(\([^)]+\))([+-])([0-9]*)/g, (match, species, sign, charge) => {
        const chargeNum = charge || '1';
        return species + '^' + sign + chargeNum;
    });

console.log("Normalized equation:", normalized);

// Parse the sides
const parts = normalized.split('->');
const leftSide = parts[0].trim();
const rightSide = parts[1].trim();

console.log("Left side:", leftSide);
console.log("Right side:", rightSide);

// Parse individual species
const leftTokens = leftSide.split(/\s+\+\s+/);
const rightTokens = rightSide.split(/\s+\+\s+/);

console.log("Left tokens:", leftTokens);
console.log("Right tokens:", rightTokens);

// Test parsing a single species
const testSpecies = "MnO4^-1";
console.log("Testing species:", testSpecies);

// Extract charge
function extractCharge(formula) {
    const chargeMatch = formula.match(/^(.+?)\^([+-])(\d*)$/);
    if (chargeMatch) {
        const core = chargeMatch[1];
        const sign = chargeMatch[2];  
        const magnitude = chargeMatch[3] || '1';
        const charge = parseInt(magnitude) * (sign === '+' ? 1 : -1);
        return { core, charge };
    }
    return { core: formula, charge: 0 };
}

const { core, charge } = extractCharge(testSpecies);
console.log("Extracted - Core:", core, "Charge:", charge);

// This should be: Core: "MnO4", Charge: -1