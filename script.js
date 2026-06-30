/* ==========================================================
   Oogie's Army Calculator v2
   script.js
========================================================== */

/* ==========================================================
   Constants
========================================================== */

const EVENTS = {
    STANDARD:      "standard",
    BEAR_TRAP:     "bearTrap",
    CRAZY_JOE:     "crazyJoe",
    CASTLE_BATTLE: "castleBattle",
    SUNFIRE:       "sunfire",
    FROST_DRAGON:  "frostDragon",
    FOUNDRY:       "foundry"
};

const DISTRIBUTION = {
    FILL:     "fill",
    EQUALIZE: "equalize"
};

const RATIOS = {
    EQUALIZE:       "equalize",
    BALANCED:       "balanced",
    FIVE_TWO_THREE: "523",
    SEVENTY_THIRTY: "70300"
};

/* ==========================================================
   Application State
========================================================== */

const state = {

    /* Army */
    infantry:           0,
    cavalry:            0,
    archers:            0,
    deploymentCapacity: 0,

    /* Modifiers */
    cityBuff:        0,
    giantBison:      false,
    formationCount:  5,
    formationRatio:  RATIOS.FIVE_TWO_THREE,
    distributionMode: DISTRIBUTION.FILL,

    /* Event */
    event:       EVENTS.STANDARD,
    captainMode: false,

    /* Generated */
    formations: [],
    remainingTroops: {
        infantry: 0,
        cavalry:  0,
        archers:  0
    },
    deploymentUsed: 0

};

/* ==========================================================
   DOM Elements
========================================================== */

const ui = {

    /* Army */
    infantry:           document.getElementById("infantry"),
    cavalry:            document.getElementById("cavalry"),
    archers:            document.getElementById("archers"),
    deploymentCapacity: document.getElementById("deploymentCapacity"),

    /* Modifiers */
    formationRatio:  document.getElementById("formationRatio"),
    cityBuff:        document.getElementById("cityBuff"),
    giantBison:      document.getElementById("giantBison"),
    formationCount:  document.getElementById("formationCount"),
    distributionMode: document.getElementById("distributionMode"),

    /* Event */
    eventType:    document.getElementById("eventType"),
    captainMode:  document.getElementById("captainMode"),
    eventOptions: document.getElementById("eventOptions"),

    /* Buttons */
    viewFormations: document.getElementById("viewFormationsButton"),
    copyAll:        document.getElementById("copyFormationsButton"),

    /* Statistics */
    remainingInfantry: document.getElementById("remainingInfantry"),
    remainingCavalry:  document.getElementById("remainingCavalry"),
    remainingArchers:  document.getElementById("remainingArchers"),
    deploymentUsed:    document.getElementById("deploymentUsed"),

    /* Formations */
    formationsContainer: document.getElementById("formationsContainer"),
    emptyState:          document.getElementById("emptyState"),

    /* UI */
    loadingScreen:       document.getElementById("loading-screen"),
    toastContainer:      document.getElementById("toastContainer"),
    deploymentHelp:      document.getElementById("deploymentHelp"),
    closeHelpModal:      document.getElementById("closeHelpModal"),
    deploymentHelpModal: document.getElementById("deploymentHelpModal")

};

/* ==========================================================
   Initialize
========================================================== */

function init() {
    attachEventListeners();
    syncState();
    updateLiveStatistics();
    hideLoadingScreen();
}

/* ==========================================================
   Event Listeners
========================================================== */

function attachEventListeners() {

    const inputs = [
        ui.infantry,
        ui.cavalry,
        ui.archers,
        ui.deploymentCapacity,
        ui.cityBuff,
        ui.giantBison,
        ui.formationCount,
        ui.formationRatio,
        ui.distributionMode,
        ui.eventType,
        ui.captainMode
    ];

    inputs.forEach(input => {
        if (!input) return;
        input.addEventListener("input",  syncState);
        input.addEventListener("change", syncState);
    });

    ui.viewFormations?.addEventListener("click", onViewFormations);
    ui.copyAll?.addEventListener("click", copyAllFormations);

    ui.deploymentHelp?.addEventListener("click", () => {
        ui.deploymentHelpModal?.showModal();
    });

    ui.closeHelpModal?.addEventListener("click", () => {
        ui.deploymentHelpModal?.close();
    });

}

/* ==========================================================
   Synchronize UI → State
========================================================== */

function syncState() {

    state.infantry           = Number(ui.infantry.value)           || 0;
    state.cavalry            = Number(ui.cavalry.value)            || 0;
    state.archers            = Number(ui.archers.value)            || 0;
    state.deploymentCapacity = Number(ui.deploymentCapacity.value) || 0;

    state.cityBuff       = Number(ui.cityBuff.value) || 0;
    state.giantBison     = ui.giantBison.value === "5000";
    state.formationCount = Number(ui.formationCount.value) || 5;
    state.formationRatio = ui.formationRatio.value;
    state.distributionMode = ui.distributionMode.value;

    state.event       = ui.eventType.value;
    state.captainMode = ui.captainMode.checked;

    // Reset formations when settings change
    state.formations     = [];
    state.remainingTroops = {
        infantry: 0,
        cavalry:  0,
        archers:  0
    };
    state.deploymentUsed = 0;

    updateEventOptions();
    updateLiveStatistics();

    // Clear formation cards on input change
    if (ui.formationsContainer) {
        ui.formationsContainer.innerHTML = "";
    }
    if (ui.emptyState) {
        ui.emptyState.style.display = "";
    }

}

/* ==========================================================
   Event Options
   Controls visibility of Captain Mode and per-event tips.
========================================================== */

const captainModeRow =
    ui.captainMode?.closest(".toggle-row") || null;

function updateEventOptions() {

    /*
     * Captain Mode toggle is only meaningful for Bear Trap.
     * Hide it for all other events.
     */
    if (captainModeRow) {
        captainModeRow.style.display =
            state.event === EVENTS.BEAR_TRAP ? "" : "none";
    }

    /* Per-event contextual tips */
    const EVENT_TIPS = {
        [EVENTS.STANDARD]:      null,
        [EVENTS.BEAR_TRAP]:     "🐻 Archers deal the most damage to the Bear. Use an archer-heavy ratio (10/10/80 or 1/10/89) for maximum damage. Captain Mode generates the rally leader's formation.",
        [EVENTS.CRAZY_JOE]:     "🎲 Use your strongest offensive formation.",
        [EVENTS.CASTLE_BATTLE]: "🏰 Use 50/20/30 for attack rallies. Use 60/20/20 (Infantry heavy) for garrison holds.",
        [EVENTS.SUNFIRE]:       "☀️ Focus on high-damage offensive formations.",
        [EVENTS.FROST_DRAGON]:  "🐉 Maximize Lethality and Attack. Coordinate rally timing with your alliance.",
        [EVENTS.FOUNDRY]:       "⚒️ Coordinate with your alliance. Batch-heal between waves."
    };

    const tip = EVENT_TIPS[state.event];

    if (ui.eventOptions) {
        ui.eventOptions.innerHTML = tip
            ? `<div class="event-tip"><p>${tip}</p></div>`
            : "";
    }

}

/* ==========================================================
   Loading Screen
========================================================== */

function hideLoadingScreen() {
    window.setTimeout(() => {
        ui.loadingScreen?.classList.add("hidden");
    }, 900);
}

/* ==========================================================
   Utilities
========================================================== */

function formatNumber(value) {
    return Number(value).toLocaleString();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/* ==========================================================
   ──────────────────────────────────────────────────────────
   CALCULATION ENGINE
   Pure functions only. No DOM access. No side effects.
   ──────────────────────────────────────────────────────────
========================================================== */

/**
 * getEffectiveDeploymentCapacity()
 *
 * City Buff is a user-selected percentage (0, 5, 10, 15, 20, 25).
 * It is NOT a flat 30,000 — it is a % of the base capacity.
 *
 * Giant Bison adds a flat +5,000 troops on top.
 *
 * @param {number} deploymentCapacity  - base deployment cap
 * @param {number} cityBuff            - percentage (e.g. 15 = 15%)
 * @param {boolean} giantBison         - whether Giant Bison is active
 * @returns {number}
 */
function getEffectiveDeploymentCapacity(deploymentCapacity, cityBuff, giantBison) {

    let capacity = deploymentCapacity;

    if (cityBuff > 0) {
        capacity += Math.floor(capacity * (cityBuff / 100));
    }

    if (giantBison) {
        capacity += 5000;
    }

    return capacity;

}

/**
 * getBaseRatio()
 *
 * Returns { infantry, cavalry, archers } as fractions that sum to ≤ 1.0.
 *
 * IMPORTANT — "equalize" does NOT mean 33% / 33% / 33%.
 * It means: preserve the player's own army composition.
 *
 * Example:
 *   800k Infantry, 400k Cavalry, 200k Archers (total 1.4M)
 *   Equalize ratio → 57.14% / 28.57% / 14.29%
 *   Each formation mirrors the player's actual army makeup.
 *
 * @param {string} ratioKey   - one of RATIOS.*
 * @param {object} available  - { infantry, cavalry, archers } current totals
 * @returns {{ infantry: number, cavalry: number, archers: number }}
 */
function getBaseRatio(ratioKey, available) {

    const total =
        available.infantry +
        available.cavalry  +
        available.archers;

    if (total === 0) {
        return { infantry: 0, cavalry: 0, archers: 0 };
    }

    switch (ratioKey) {

        case RATIOS.EQUALIZE:
            /* Mirror the player's army composition exactly */
            return {
                infantry: available.infantry / total,
                cavalry:  available.cavalry  / total,
                archers:  available.archers  / total
            };

        case RATIOS.BALANCED:
            /* Equal thirds */
            return {
                infantry: 1 / 3,
                cavalry:  1 / 3,
                archers:  1 / 3
            };

        case RATIOS.FIVE_TWO_THREE:
            /* 50% Infantry / 20% Cavalry / 30% Archers */
            return {
                infantry: 0.50,
                cavalry:  0.20,
                archers:  0.30
            };

        case RATIOS.SEVENTY_THIRTY:
            /* 70% Infantry / 30% Cavalry / 0% Archers */
            return {
                infantry: 0.70,
                cavalry:  0.30,
                archers:  0.00
            };

        default:
            return { infantry: 1 / 3, cavalry: 1 / 3, archers: 1 / 3 };

    }

}

/**
 * isRatioExhausted()
 *
 * Returns true when a troop type that the ratio requires (ratio > 0)
 * has been completely used up.
 *
 * When this happens, the ratio can no longer be honored —
 * the engine stops generating formations rather than
 * inventing troops or silently changing the ratio.
 *
 * @param {{ infantry, cavalry, archers }} ratio
 * @param {{ infantry, cavalry, archers }} remaining
 * @returns {boolean}
 */
function isRatioExhausted(ratio, remaining) {
    if (ratio.infantry > 0 && remaining.infantry <= 0) return true;
    if (ratio.cavalry  > 0 && remaining.cavalry  <= 0) return true;
    if (ratio.archers  > 0 && remaining.archers  <= 0) return true;
    return false;
}

/**
 * buildSingleFormation()
 *
 * Calculates one formation by applying the ratio to the target total,
 * then clamping each troop type to what is actually available.
 *
 * THE ENGINE NEVER INVENTS TROOPS.
 * If available < ideal, we use what we have.
 *
 * @param {{ infantry, cavalry, archers }} ratio   - fractions
 * @param {number} target                          - total troop goal
 * @param {{ infantry, cavalry, archers }} remaining
 * @returns {{ infantry, cavalry, archers, total }}
 */
function buildSingleFormation(ratio, target, remaining) {

    const inf = Math.min(
        Math.floor(target * ratio.infantry),
        Math.max(0, remaining.infantry)
    );

    const cav = Math.min(
        Math.floor(target * ratio.cavalry),
        Math.max(0, remaining.cavalry)
    );

    const arc = Math.min(
        Math.floor(target * ratio.archers),
        Math.max(0, remaining.archers)
    );

    return {
        infantry: inf,
        cavalry:  cav,
        archers:  arc,
        total:    inf + cav + arc
    };

}

/**
 * runCalculationEngine()
 *
 * The main formation engine.
 * Separated from all UI — returns plain data, touches no DOM.
 *
 * Distribution modes:
 *   FILL     → Fill formation 1 to capacity before starting formation 2.
 *   EQUALIZE → Spread total deployable troops evenly across all formations.
 *
 * Stopping conditions:
 *   - No troops remaining.
 *   - A required troop type is exhausted (ratio becomes impossible).
 *   - Formation total is 0.
 *
 * @returns {{
 *   formations:        Array,
 *   remaining:         { infantry, cavalry, archers },
 *   effectiveCapacity: number,
 *   totalDeployed:     number
 * }}
 */
function runCalculationEngine() {

    const {
        infantry, cavalry, archers,
        deploymentCapacity, cityBuff, giantBison,
        formationCount, formationRatio, distributionMode
    } = state;

    const capacity = getEffectiveDeploymentCapacity(
        deploymentCapacity,
        cityBuff,
        giantBison
    );

    const available = { infantry, cavalry, archers };
    const totalAvailable = infantry + cavalry + archers;

    const ratio = getBaseRatio(formationRatio, available);

    /*
     * EQUALIZE mode: pre-calculate how many troops each
     * formation receives. This is capped at both:
     *   - The effective deployment capacity per formation.
     *   - A fair share of total available troops.
     */
    let troopsPerFormation = 0;

    if (distributionMode === DISTRIBUTION.EQUALIZE) {
        const totalDeployable = Math.min(
            capacity * formationCount,
            totalAvailable
        );
        troopsPerFormation = Math.min(
            Math.floor(totalDeployable / formationCount),
            capacity
        );
    }

    const formations = [];
    const remaining  = { ...available };

    for (let i = 0; i < formationCount; i++) {

        const remainingTotal =
            remaining.infantry +
            remaining.cavalry  +
            remaining.archers;

        /* Stop: no troops left */
        if (remainingTotal <= 0) break;

        /* Stop: ratio is now impossible to honor */
        if (isRatioExhausted(ratio, remaining)) break;

        const target = distributionMode === DISTRIBUTION.FILL
            ? Math.min(capacity, remainingTotal)
            : Math.min(troopsPerFormation, remainingTotal);

        const formation = buildSingleFormation(ratio, target, remaining);

        /* Stop: formation came out empty */
        if (formation.total <= 0) break;

        formations.push({ index: i + 1, ...formation });

        remaining.infantry -= formation.infantry;
        remaining.cavalry  -= formation.cavalry;
        remaining.archers  -= formation.archers;

    }

    const totalDeployed =
        totalAvailable -
        remaining.infantry -
        remaining.cavalry  -
        remaining.archers;

    return {
        formations,
        remaining,
        effectiveCapacity: capacity,
        totalDeployed
    };

}

/* ==========================================================
   ──────────────────────────────────────────────────────────
   END CALCULATION ENGINE
   ──────────────────────────────────────────────────────────
========================================================== */

/* ==========================================================
   Validation
========================================================== */

function validateInputs() {

    if (state.deploymentCapacity <= 0) {
        showToast("⚠️ Enter your Deployment Capacity.", "error");
        return false;
    }

    if (
        state.infantry +
        state.cavalry  +
        state.archers === 0
    ) {
        showToast("⚠️ Enter your available troops.", "error");
        return false;
    }

    return true;

}

/* ==========================================================
   Generate Formations (UI Handler)
========================================================== */

function onViewFormations() {

    if (!validateInputs()) return;

    const result = runCalculationEngine();

    /* Persist results to state */
    state.formations      = result.formations;
    state.remainingTroops = result.remaining;
    state.deploymentUsed  = result.totalDeployed;

    updateLiveStatistics();
    renderFormations(result);

}

/* ==========================================================
   Formation Card Rendering
========================================================== */

/**
 * Renders one formation card as an HTML string.
 *
 * The progress bar represents troop COMPOSITION (inf/cav/arc ratio),
 * not deployment percentage.
 *
 * Captain label applies only on Formation 1 during Bear Trap
 * when Captain Mode is ON.
 */
function renderFormationCard(formation, effectiveCapacity) {

    const isCaptain =
        state.captainMode         &&
        state.event === EVENTS.BEAR_TRAP &&
        formation.index === 1;

    const title = isCaptain
        ? "👑 Captain"
        : `Formation ${formation.index}`;

    /* Composition percentages (for bar + labels) */
    const compTotal = formation.total || 1;

    const infPct = Math.round((formation.infantry / compTotal) * 100);
    const cavPct = Math.round((formation.cavalry  / compTotal) * 100);
    const arcPct = Math.round((formation.archers  / compTotal) * 100);

    /* Capacity used percentage */
    const capPct = effectiveCapacity > 0
        ? Math.min(100, Math.round((formation.total / effectiveCapacity) * 100))
        : 0;

    const isFull = formation.total >= effectiveCapacity;

    return `
        <div class="formation-card fade-in">

            <div class="formation-header">
                <span class="formation-title">${title}</span>
                <span class="formation-status ${isFull ? "status-full" : "status-partial"}">
                    ${isFull ? "✓ Full" : `${capPct}%`}
                </span>
            </div>

            <div class="formation-body">

                <div class="formation-row">
                    <span class="formation-label troop-infantry">
                        ⚔️ Infantry
                    </span>
                    <span class="formation-value">
                        ${formatNumber(formation.infantry)}
                    </span>
                </div>

                <div class="formation-row">
                    <span class="formation-label troop-cavalry">
                        🐴 Cavalry
                    </span>
                    <span class="formation-value">
                        ${formatNumber(formation.cavalry)}
                    </span>
                </div>

                <div class="formation-row">
                    <span class="formation-label troop-archers">
                        🏹 Archers
                    </span>
                    <span class="formation-value">
                        ${formatNumber(formation.archers)}
                    </span>
                </div>

                <!-- Troop Composition Bar -->
                <div
                    class="composition-bar"
                    title="${infPct}% Infantry · ${cavPct}% Cavalry · ${arcPct}% Archers">
                    <div class="bar-seg bar-inf" style="width:${infPct}%"></div>
                    <div class="bar-seg bar-cav" style="width:${cavPct}%"></div>
                    <div class="bar-seg bar-arc" style="width:${arcPct}%"></div>
                </div>

                <div class="bar-labels">
                    <span class="troop-infantry">${infPct}%</span>
                    <span class="troop-cavalry">${cavPct}%</span>
                    <span class="troop-archers">${arcPct}%</span>
                </div>

                <!-- Footer -->
                <div class="formation-divider"></div>

                <div class="formation-row">
                    <span class="formation-label">Total Troops</span>
                    <span class="formation-value formation-total-value">
                        ${formatNumber(formation.total)}
                    </span>
                </div>

                <div class="formation-row">
                    <span class="formation-label">Capacity Used</span>
                    <span class="formation-value">${capPct}%</span>
                </div>

            </div>

        </div>
    `;

}

/* ==========================================================
   Render Formations
========================================================== */

function renderFormations(result) {

    const { formations, effectiveCapacity } = result;

    if (formations.length === 0) {

        ui.emptyState.style.display      = "";
        ui.formationsContainer.innerHTML = "";

        showToast(
            "⚠️ No formations could be built — check your troop counts and ratio.",
            "error"
        );
        return;

    }

    ui.emptyState.style.display = "none";

    ui.formationsContainer.innerHTML = formations
        .map(f => renderFormationCard(f, effectiveCapacity))
        .join("");

}

/* ==========================================================
   Live Statistics
========================================================== */

/**
 * Before formations are generated:
 *   Show the full troop counts the player entered.
 *
 * After formations are generated:
 *   Show remaining (unused) troops.
 */
function updateLiveStatistics() {

    const hasFormations = state.formations.length > 0;

    const showInfantry = hasFormations
        ? state.remainingTroops.infantry
        : state.infantry;

    const showCavalry = hasFormations
        ? state.remainingTroops.cavalry
        : state.cavalry;

    const showArchers = hasFormations
        ? state.remainingTroops.archers
        : state.archers;

    ui.remainingInfantry.textContent = formatNumber(showInfantry);
    ui.remainingCavalry.textContent  = formatNumber(showCavalry);
    ui.remainingArchers.textContent  = formatNumber(showArchers);

    /* Deployment Used: total deployed ÷ (capacity × formations generated) */
    let pct = 0;

    if (hasFormations && state.deploymentCapacity > 0) {

        const effectiveCap = getEffectiveDeploymentCapacity(
            state.deploymentCapacity,
            state.cityBuff,
            state.giantBison
        );

        const maxPossible = effectiveCap * state.formations.length;

        pct = maxPossible > 0
            ? Math.min(100, Math.round((state.deploymentUsed / maxPossible) * 100))
            : 0;

    }

    ui.deploymentUsed.textContent = `${pct}%`;

}

/* ==========================================================
   Toast Notifications
========================================================== */

function showToast(message, type = "") {

    if (!ui.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = ["toast", type].filter(Boolean).join(" ");
    toast.textContent = message;

    ui.toastContainer.appendChild(toast);

    /* Animate in */
    requestAnimationFrame(() => toast.classList.add("show"));

    /* Auto-dismiss */
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 2500);

}

/* ==========================================================
   Copy All Formations
========================================================== */

function copyAllFormations() {

    if (state.formations.length === 0) {
        showToast("⚠️ Generate formations first.");
        return;
    }

    const effectiveCap = getEffectiveDeploymentCapacity(
        state.deploymentCapacity,
        state.cityBuff,
        state.giantBison
    );

    const lines = state.formations.map(f => {

        const isCaptain =
            state.captainMode         &&
            state.event === EVENTS.BEAR_TRAP &&
            f.index === 1;

        const header = isCaptain ? "👑 Captain" : `Formation ${f.index}`;

        const capPct = effectiveCap > 0
            ? Math.min(100, Math.round((f.total / effectiveCap) * 100))
            : 0;

        return [
            header,
            `  ⚔️ Infantry : ${formatNumber(f.infantry)}`,
            `  🐴 Cavalry  : ${formatNumber(f.cavalry)}`,
            `  🏹 Archers  : ${formatNumber(f.archers)}`,
            `  Total      : ${formatNumber(f.total)} (${capPct}% capacity)`
        ].join("\n");

    });

    const text = lines.join("\n\n");

    navigator.clipboard
        .writeText(text)
        .then(()  => showToast("✅ Formations copied to clipboard!"))
        .catch(() => showToast("❌ Copy failed. Please try manually.", "error"));

}

/* ==========================================================
   Start Application
========================================================== */

document.addEventListener("DOMContentLoaded", init);
