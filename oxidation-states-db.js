// Comprehensive Oxidation States Database for Periodic Table Rows 1-2
const OXIDATION_STATES_DB = {
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
    }
};

// Transition metals with multiple oxidation states
const TRANSITION_METALS_DB = {
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

// Combined database
const COMPLETE_OXIDATION_DB = {
    ...OXIDATION_STATES_DB,
    ...TRANSITION_METALS_DB
};

export { COMPLETE_OXIDATION_DB, OXIDATION_STATES_DB, TRANSITION_METALS_DB };