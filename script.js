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












/* ==========================================================
   Input Handling
========================================================== */

/**
 * Read every value from the page into state.
 */
function updateStateFromInputs() {

    /* Army */

    state.army.infantry =
        toNumber(ui.infantry.value);

    state.army.cavalry =
        toNumber(ui.cavalry.value);

    state.army.archers =
        toNumber(ui.archers.value);

    state.deploymentCapacity =
        toNumber(ui.deploymentCapacity.value);

    /* Modifiers */

    state.troopRatio =
        ui.troopRatio.value;

    state.customRatio.infantry =
        toNumber(ui.customInfantry.value);

    state.customRatio.cavalry =
        toNumber(ui.customCavalry.value);

    state.customRatio.archers =
        toNumber(ui.customArchers.value);

    state.cityDeploymentBuff =
        toNumber(ui.cityBuff.value);

    state.giantBisonBuff =
        toNumber(ui.bisonBuff.value);

    state.formationCount =
        toNumber(ui.formationCount.value);

    /* Event */

    state.battleType =
        ui.battleType.value;

    state.captainMode =
        ui.captainMode.checked;

    state.respectJoinerLimit =
        ui.respectJoinerLimit.checked;

    state.joinerLimit =
        toNumber(ui.joinerLimit.value);

}

/* ==========================================================
   Show / Hide UI
========================================================== */

function updateInterface() {

    /* ---------- Custom Ratio ---------- */

    const customRatio =

        state.troopRatio === "custom";

    ui.customRatioSection.hidden =
        !customRatio;

    ui.customRatioError.hidden =
        customRatioIsValid();

    /* ---------- Event Options ---------- */

    const bearTrap =

        state.battleType === "bearTrap";

    ui.battleOptions.hidden =
        !bearTrap;

    ui.bearTrapOptions.hidden =
        !bearTrap;

    /* ---------- Joiner Limit ---------- */

    ui.joinerLimitSection.hidden =
        !state.respectJoinerLimit;

}

/* ==========================================================
   Refresh Application
========================================================== */

function refresh() {

    updateStateFromInputs();

    updateInterface();

    calculate();

}

/* ==========================================================
   Register Event Listeners
========================================================== */

function registerEventListeners() {

    const liveInputs = [

        ui.infantry,
        ui.cavalry,
        ui.archers,

        ui.deploymentCapacity,

        ui.troopRatio,

        ui.customInfantry,
        ui.customCavalry,
        ui.customArchers,

        ui.cityBuff,
        ui.bisonBuff,

        ui.formationCount,

        ui.battleType,

        ui.captainMode,

        ui.respectJoinerLimit,

        ui.joinerLimit

    ];

    liveInputs.forEach(element => {

        element.addEventListener(

            "input",

            refresh

        );

        element.addEventListener(

            "change",

            refresh

        );

    });

    /* Jump Button */

    ui.jumpButton.addEventListener(

        "click",

        scrollToFormations

    );

    /* Modal */

    ui.helpButton.addEventListener(

        "click",

        openModal

    );

    ui.closeModal.addEventListener(

        "click",

        closeModal

    );

}











