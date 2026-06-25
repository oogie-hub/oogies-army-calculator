'use strict';
/* ==========================================================
   Oogie's Army Calculator v2
   Source File: 00-app-state.js
   Purpose:
   Defines the single source of truth for all application data.
   This file contains no business logic.
   ========================================================== */
const appState = {
    /* ======================================================
       Application
       ====================================================== */
    version: '2.0.0',
    initialized: false,
    language: 'en',
    /* ======================================================
       User Inputs
       ====================================================== */
    inputs: {
        infantry: 0,
        cavalry: 0,
        archers: 0,
        deploymentCapacity: 0,
        troopRatio: 'custom',
        customRatio: {
            infantry: 50,
            cavalry: 20,
            archers: 30
        },
        cityDeploymentBuff: 0,
        giantBisonBuff: 0,
        formationCount: 5,
        bearTrapLabels: false,
        fillCaptainFirst: false,
        respectJoinerLimit: false,
        joinerLimit: 0
    },
    /* ======================================================
       Calculated Values
       ====================================================== */
    calculated: {
        effectiveDeploymentCapacity: 0,
        totalTroops: 0,
        ratioValid: true,
        available: {
            infantry: 0,
            cavalry: 0,
            archers: 0
        },
        formations: []
    },
    /* ======================================================
       User Interface State
       ====================================================== */
    ui: {
        loading: true,
        deploymentCapacityModalOpen: false
    }
};










/* ==========================================================
   Oogie's Army Calculator v2
   Source File: 01-constants.js
   Purpose:
   Central location for all application constants.
   No business logic belongs in this file.
   ========================================================== */
/* ==========================================================
   Local Storage
   ========================================================== */
const STORAGE_KEYS = Object.freeze({
    LANGUAGE: 'oogie.language',
    SETTINGS: 'oogie.settings'
});
/* ==========================================================
   Formation Roles
   ========================================================== */
const FORMATION_ROLE = Object.freeze({
    CAPTAIN: 'captain',
    JOINER: 'joiner'
});
/* ==========================================================
   Formation Status
   ========================================================== */
const FORMATION_STATUS = Object.freeze({
    FULL: 'full',
    LIMITED: 'limited',
    EMPTY: 'empty'
});
/* ==========================================================
   Formation Limitation Reasons
   ========================================================== */
const LIMITATION = Object.freeze({
    NONE: null,
    INFANTRY: 'infantry',
    CAVALRY: 'cavalry',
    ARCHERS: 'archers',
    JOINER_LIMIT: 'joinerLimit',
    REMAINING_TROOPS: 'remainingTroops'
});
/* ==========================================================
   Default Custom Ratio
   ========================================================== */
const DEFAULT_CUSTOM_RATIO = Object.freeze({
    infantry: 50,
    cavalry: 20,
    archers: 30
});
/* ==========================================================
   Preset Ratios
   NOTE:
   Keys must exactly match the values used by
   the Troop Ratio <select> element in index.html.
   ========================================================== */
const PRESET_RATIOS = Object.freeze({
    balanced: {
        infantry: 50,
        cavalry: 20,
        archers: 30
    },
    infantry: {
        infantry: 60,
        cavalry: 20,
        archers: 20
    },
    cavalry: {
        infantry: 20,
        cavalry: 60,
        archers: 20
    },
    archers: {
        infantry: 20,
        cavalry: 20,
        archers: 60
    }
});
/* ==========================================================
   Default Values
   ========================================================== */
const DEFAULTS = Object.freeze({
    LANGUAGE: 'en',
    FORMATION_COUNT: 5,
    JOINER_LIMIT: 0,
    CITY_DEPLOYMENT_BUFF: 0,
    GIANT_BISON_BUFF: 0
});
/* ==========================================================
   CSS Classes
   ========================================================== */
const CSS_CLASS = Object.freeze({
    HIDDEN: 'hidden',
    MODAL_OPEN: 'is-open',
    FORMATION_CARD: 'formation-card',
    STATUS_FULL: 'full',
    STATUS_LIMITED: 'limited',
    STATUS_EMPTY: 'empty'
});










