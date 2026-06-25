/*
==========================================================

Oogie's Army Calculator v2.0

Made with ❤️ by Oogie & her pal ChatGPT

Created for Kingshot players.

==========================================================
*/

"use strict";

/* ==========================================================
   Application State
========================================================== */

const state = {

    battleType: "standard",

    captainMode: false,

    respectJoinerLimit: false,

    joinerLimit: 0,

    deploymentCapacity: 0,

    cityDeploymentBuff: 0,

    giantBisonBuff: 0,

    formationCount: 5,

    troopRatio: "33-33-34",

    customRatio: {

        infantry: 33,

        cavalry: 33,

        archers: 34

    },

    army: {

        infantry: 0,

        cavalry: 0,

        archers: 0

    },

    statistics: {

        deploymentUsed: 0,

        remainingInfantry: 0,

        remainingCavalry: 0,

        remainingArchers: 0,

        remainingTroops: 0

    },

    formations: []

};

/* ==========================================================
   Troop Ratio Presets
========================================================== */

const RATIOS = {

    "33-33-34": {

        infantry: 33,

        cavalry: 33,

        archers: 34

    },

    "50-20-30": {

        infantry: 50,

        cavalry: 20,

        archers: 30

    },

    "10-10-80": {

        infantry: 10,

        cavalry: 10,

        archers: 80

    },

    "5-10-85": {

        infantry: 5,

        cavalry: 10,

        archers: 85

    },

    "70-30-0": {

        infantry: 70,

        cavalry: 30,

        archers: 0

    }

};

/* ==========================================================
   DOM Elements
========================================================== */

const ui = {

    /* Army */

    infantry:

        document.getElementById("infantryInput"),

    cavalry:

        document.getElementById("cavalryInput"),

    archers:

        document.getElementById("archerInput"),

    deploymentCapacity:

        document.getElementById("deploymentCapacityInput"),

    /* Modifiers */

    troopRatio:

        document.getElementById("troopRatioSelect"),

    customRatioSection:

        document.getElementById("customRatioSection"),

    customInfantry:

        document.getElementById("customInfantryRatio"),

    customCavalry:

        document.getElementById("customCavalryRatio"),

    customArchers:

        document.getElementById("customArcherRatio"),

    customRatioError:

        document.getElementById("customRatioError"),

    cityBuff:

        document.getElementById("cityDeploymentBuff"),

    bisonBuff:

        document.getElementById("giantBisonBuff"),

    formationCount:

        document.getElementById("formationCount"),

    /* Event */

    battleType:

        document.getElementById("battleTypeSelect"),

    battleOptions:

        document.getElementById("battleOptionsSection"),

    bearTrapOptions:

        document.getElementById("bearTrapOptions"),

    captainMode:

        document.getElementById("fillFirstFormation"),

    respectJoinerLimit:

        document.getElementById("respectJoinerLimit"),

    joinerLimitSection:

        document.getElementById("joinerLimitSection"),

    joinerLimit:

        document.getElementById("joinerLimitInput"),

    /* Statistics */

    deploymentUsed:

        document.getElementById("deploymentUsedStat"),

    remainingInfantry:

        document.getElementById("remainingInfantryStat"),

    remainingCavalry:

        document.getElementById("remainingCavalryStat"),

    remainingArchers:

        document.getElementById("remainingArchersStat"),

    remainingTroops:

        document.getElementById("remainingTroopsStat"),

    /* Formations */

    formations:

        document.getElementById("formationsContainer"),

    emptyState:

        document.getElementById("emptyState"),

    jumpButton:

        document.getElementById("viewFormationsButton"),

    /* Modal */

    modal:

        document.getElementById("deploymentCapacityModal"),

    helpButton:

        document.getElementById("deploymentCapacityHelpButton"),

    closeModal:

        document.getElementById("closeDeploymentCapacityModal"),

    toastContainer:

        document.getElementById("toastContainer"),
    /* Loading */

    loadingOverlay:

        document.getElementById("loadingOverlay")

};
















/* ==========================================================
   Utility Functions
========================================================== */

/**
 * Safely convert any value to a number.
 */
function toNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}

/**
 * Clamp a value between a minimum and maximum.
 */
function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}

/**
 * Format numbers with commas.
 */
function formatNumber(value) {

    return Math.round(value).toLocaleString();

}

/**
 * Return the currently selected troop ratio.
 */
function getSelectedRatio() {

    if (state.troopRatio === "custom") {

        return {

            infantry: toNumber(
                state.customRatio.infantry
            ),

            cavalry: toNumber(
                state.customRatio.cavalry
            ),

            archers: toNumber(
                state.customRatio.archers
            )

        };

    }

    return RATIOS[state.troopRatio];

}

/**
 * Validate custom troop ratios.
 */
function customRatioIsValid() {

    if (state.troopRatio !== "custom") {

        return true;

    }

    const total =

        toNumber(state.customRatio.infantry)
        + toNumber(state.customRatio.cavalry)
        + toNumber(state.customRatio.archers);

    return total === 100;

}

/**
 * Calculate deployment capacity
 * after buffs.
 */
function getEffectiveDeploymentCapacity() {

    const cityMultiplier =

        1 + (state.cityDeploymentBuff / 100);

    return Math.floor(

        (state.deploymentCapacity * cityMultiplier)

        + state.giantBisonBuff

    );

}

/**
 * Scroll smoothly to formations.
 */
function scrollToFormations() {

    document
        .getElementById("formationsSection")
        .scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

}

/**
 * Show a toast notification.
 */
function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    ui.toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

/**
 * Open deployment modal.
 */
function openModal() {

    ui.modal.showModal();

}

/**
 * Close deployment modal.
 */
function closeModal() {

    ui.modal.close();

}













