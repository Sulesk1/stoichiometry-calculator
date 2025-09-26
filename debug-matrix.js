// Debug the matrix balancing for a specific equation
console.log("=== Debugging Matrix Balancing ===");

// Test equation: MnO4- + Fe+2 + H+ -> Mn+2 + Fe+3 + H2O
// After normalization: MnO4^-1 + Fe^+2 + H^+1 -> Mn^+2 + Fe^+3 + H2O

const testEquation = "MnO4^-1 + Fe^+2 + H^+1 -> Mn^+2 + Fe^+3 + H2O";

console.log("Testing equation:", testEquation);

// Expected matrix for elements:
// Species: MnO4^-1, Fe^+2, H^+1, Mn^+2, Fe^+3, H2O
// Elements: Mn, O, Fe, H
//
// Matrix should be:
//        MnO4  Fe   H   Mn  Fe  H2O
// Mn  [   1,   0,  0, -1,  0,   0 ]
// O   [   4,   0,  0,  0,  0,  -1 ]
// Fe  [   0,   1,  0,  0, -1,   0 ]
// H   [   0,   0,  1,  0,  0,  -2 ]
// 
// Plus charge balance:
// Charge [ -1,  +2, +1, +2, +3,   0 ]

// The solution should be: [1, 5, 8, 1, 5, 4]
// Which gives: 1 MnO4^- + 5 Fe^+2 + 8 H^+ -> 1 Mn^+2 + 5 Fe^+3 + 4 H2O

console.log("Expected coefficients: [1, 5, 8, 1, 5, 4]");
console.log("Expected result: MnO4^- + 5Fe^+2 + 8H^+ → Mn^+2 + 5Fe^+3 + 4H2O");