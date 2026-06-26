/**
 * script.js
 * ---------
 * Oogie's Army Calculator — application logic.
 *
 * Organized in five sections:
 *   1. CONFIG          - constant values, no magic numbers in logic below
 *   2. STATE           - single centralized application state object
 *   3. I18N             - language switching, translation lookup, persistence
 *   4. CALCULATOR        - pure functions, no DOM access (UI-independent)
 *   5. UI / RENDER        - DOM rendering and event wiring
 */

(function () {
  "use strict";

  /* ===================================================================
     1. CONFIG
     =================================================================== */
  const CONFIG = {
    STORAGE_KEY_LANG: "oogiesArmy.language",
    DEFAULT_LANG: "en",
    LOADING_SCREEN_MIN_MS: 900,

    // Flat capacity bonuses granted by modifiers, applied per formation.
    // (Kingshot city buffs and the Giant Bison pet both add flat rally
    // capacity; values below are the commonly used baseline amounts.)
    CITY_BUFF_BONUS: 30000,
    GIANT_BISON_BONUS: 5000,

    // Formation ratio presets: relative parts of infantry / cavalry / archers.
    RATIO_PRESETS: {
      equalize: { infantry: 1, cavalry: 1, archers: 1 },
      "523": { infantry: 5, cavalry: 2, archers: 3 },
      "7030": { infantry: 7, cavalry: 3, archers: 0 },
    },

    DEFAULT_FORMATION_COUNT: 5,
    DEFAULT_CAPACITY: 300000,
    MIN_FORMATION_COUNT: 1,
    MAX_FORMATION_COUNT: 50,
  };

  /* ===================================================================
     2. STATE
     A single object holds every input value and the last calculation
     result. UI rendering always reads from here - never from raw DOM.
     =================================================================== */
  const state = {
    language: CONFIG.DEFAULT_LANG,

    troops: { infantry: 0, cavalry: 0, archers: 0 },

    event: "standard",          // standard | beartrap | castle
    ratioKey: "equalize",        // equalize | 523 | 7030
    distributionMode: "fill",     // fill | equalize

    modifiers: {
      cityBuff: false,
      giantBison: false,
      captainMode: false,
    },

    formationCount: CONFIG.DEFAULT_FORMATION_COUNT,
    baseCapacity: CONFIG.DEFAULT_CAPACITY,

    // Populated by runCalculation()
    result: null,
  };

  /* ===================================================================
     3. I18N
     =================================================================== */
  function t(key) {
    const lang = TRANSLATIONS[state.language] || TRANSLATIONS[CONFIG.DEFAULT_LANG];
    return (lang.strings && lang.strings[key]) || key;
  }

  // Replaces `{value}` / `{n}` placeholders in a translated string.
  function tFormat(key, replacements) {
    let str = t(key);
    Object.keys(replacements || {}).forEach((token) => {
      str = str.replace(`{${token}}`, replacements[token]);
    });
    return str;
  }

  function loadStoredLanguage() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_LANG);
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch (e) {
      /* localStorage unavailable - fall back silently */
    }
    // Try to match the browser language to a supported one.
    const browserLang = (navigator.language || "en").toLowerCase();
    const match = SUPPORTED_LANGUAGES.find((code) =>
      browserLang.startsWith(code.toLowerCase())
    );
    return match || CONFIG.DEFAULT_LANG;
  }

  function storeLanguage(code) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_LANG, code);
    } catch (e) {
      /* ignore persistence errors */
    }
  }

  function setLanguage(code) {
    if (!TRANSLATIONS[code]) return;
    state.language = code;
    storeLanguage(code);
    document.documentElement.lang = code;
    document.documentElement.dir = TRANSLATIONS[code].dir || "ltr";
    applyTranslations();
    refreshDynamicHints();
    renderAll();
  }

  // Walks every [data-i18n] element and fills in the translated string.
  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    const langInfo = TRANSLATIONS[state.language];
    document.getElementById("langButtonLabel").textContent = langInfo.nativeName;
    buildLanguageMenu();
  }

  function buildLanguageMenu() {
    const menu = document.getElementById("langMenu");
    menu.innerHTML = "";
    SUPPORTED_LANGUAGES.forEach((code) => {
      const li = document.createElement("li");
      li.className = "lang-option" + (code === state.language ? " is-active" : "");
      li.setAttribute("role", "option");
      li.setAttribute("data-lang", code);
      li.textContent = TRANSLATIONS[code].nativeName;
      li.addEventListener("click", () => {
        setLanguage(code);
        toggleLangMenu(false);
      });
      menu.appendChild(li);
    });
  }

  function toggleLangMenu(force) {
    const menu = document.getElementById("langMenu");
    const button = document.getElementById("langButton");
    const willShow = typeof force === "boolean" ? force : menu.hidden;
    menu.hidden = !willShow;
    button.setAttribute("aria-expanded", String(willShow));
  }

  /* ===================================================================
     4. CALCULATOR (pure - no DOM access)
     =================================================================== */

  // Returns deployment capacity for one formation after modifiers.
  function getEffectiveCapacity() {
    let capacity = state.baseCapacity;
    if (state.modifiers.cityBuff) capacity += CONFIG.CITY_BUFF_BONUS;
    if (state.modifiers.giantBison) capacity += CONFIG.GIANT_BISON_BONUS;
    return capacity;
  }

  // Normalizes the active ratio preset into fractions that sum to 1.
  function getRatioFractions() {
    const preset = CONFIG.RATIO_PRESETS[state.ratioKey];
    const total = preset.infantry + preset.cavalry + preset.archers;
    return {
      infantry: preset.infantry / total,
      cavalry: preset.cavalry / total,
      archers: preset.archers / total,
    };
  }

  /**
   * Builds the formation allocation array.
   * Returns:
   *  {
   *    formations: [{ index, isCaptain, infantry, cavalry, archers, capacity }],
   *    remaining: { infantry, cavalry, archers },
   *    capacityUsedTotal, capacityGrandTotal
   *  }
   */
  function calculateFormations() {
    const count = clamp(
      Math.round(state.formationCount) || CONFIG.MIN_FORMATION_COUNT,
      CONFIG.MIN_FORMATION_COUNT,
      CONFIG.MAX_FORMATION_COUNT
    );
    const capacity = getEffectiveCapacity();
    const fractions = getRatioFractions();

    // Mutable pool of remaining troops, decremented as formations are filled.
    const pool = { ...state.troops };

    const formations = [];
    for (let i = 0; i < count; i++) {
      formations.push({
        index: i + 1,
        isCaptain: state.modifiers.captainMode && i === 0,
        infantry: 0,
        cavalry: 0,
        archers: 0,
        capacity: capacity,
      });
    }

    if (state.distributionMode === "fill") {
      // Fill Each Formation: go formation by formation, draw as much as the
      // ratio calls for from whatever troops remain in the pool.
      formations.forEach((formation) => {
        ["infantry", "cavalry", "archers"].forEach((type) => {
          const desired = capacity * fractions[type];
          const taken = Math.min(desired, pool[type]);
          formation[type] = taken;
          pool[type] -= taken;
        });
      });
    } else {
      // Equalize: spread the total deployable amount of each troop type
      // evenly across every formation, instead of front-loading.
      ["infantry", "cavalry", "archers"].forEach((type) => {
        const maxAcrossAll = count * capacity * fractions[type];
        const deployable = Math.min(pool[type], maxAcrossAll);
        const perFormation = deployable / count;
        formations.forEach((formation) => {
          formation[type] = perFormation;
        });
        pool[type] -= deployable;
      });
    }

    const capacityUsedTotal = formations.reduce(
      (sum, f) => sum + f.infantry + f.cavalry + f.archers,
      0
    );
    const capacityGrandTotal = formations.reduce((sum, f) => sum + f.capacity, 0);

    return {
      formations,
      remaining: { infantry: pool.infantry, cavalry: pool.cavalry, archers: pool.archers },
      capacityUsedTotal,
      capacityGrandTotal,
    };
  }

  function runCalculation() {
    state.result = calculateFormations();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /* ===================================================================
     5. UI / RENDER
     =================================================================== */

  function formatNumber(value) {
    return Math.round(value).toLocaleString("en-US");
  }

  // Strip everything but digits so the troop/capacity inputs always parse.
  function parseNumberInput(rawValue) {
    const digitsOnly = String(rawValue).replace(/[^\d]/g, "");
    return digitsOnly ? parseInt(digitsOnly, 10) : 0;
  }

  function refreshDynamicHints() {
    document.getElementById("cityBuffHint").textContent = tFormat("modCityBuffHint", {
      value: formatNumber(CONFIG.CITY_BUFF_BONUS),
    });
    document.getElementById("bisonHint").textContent = tFormat("modGiantBisonHint", {
      value: formatNumber(CONFIG.GIANT_BISON_BONUS),
    });
  }

  function renderStats() {
    const result = state.result;
    if (!result) return;
    document.getElementById("statRemainingInfantry").textContent = formatNumber(result.remaining.infantry);
    document.getElementById("statRemainingCavalry").textContent = formatNumber(result.remaining.cavalry);
    document.getElementById("statRemainingArchers").textContent = formatNumber(result.remaining.archers);
    document.getElementById("statCapacityUsed").textContent =
      `${formatNumber(result.capacityUsedTotal)} / ${formatNumber(result.capacityGrandTotal)}`;
  }

  function buildFormationCard(formation) {
    const card = document.createElement("div");
    card.className = "formation-card" + (formation.isCaptain ? " is-captain" : "");

    const total = formation.infantry + formation.cavalry + formation.archers;
    const pctOfCapacity = formation.capacity > 0 ? (total / formation.capacity) * 100 : 0;
    const pctRounded = Math.round(pctOfCapacity);

    // Composition fractions for the segmented bar (proportion of troop
    // TYPES within this formation - independent from how full it is).
    const compInfantry = total > 0 ? (formation.infantry / total) * 100 : 0;
    const compCavalry = total > 0 ? (formation.cavalry / total) * 100 : 0;
    const compArchers = total > 0 ? (formation.archers / total) * 100 : 0;

    card.innerHTML = `
      <div class="formation-top">
        <span class="formation-badge">
          ${
            formation.isCaptain
              ? `<img src="assets/icons/crown.svg" class="icon icon-orange" alt="${t("captainLabel")}" />`
              : ""
          }
          <span>${tFormat("formationLabel", { n: formation.index })}</span>
        </span>
        <span class="formation-number">${formation.index}</span>
      </div>

      <div class="formation-troops">
        <span class="troop-infantry">${formatNumber(formation.infantry)}</span>
        <span class="troop-cavalry">${formatNumber(formation.cavalry)}</span>
        <span class="troop-archers">${formatNumber(formation.archers)}</span>
      </div>

      <div class="composition-bar" role="img" aria-label="Troop composition">
        <span class="composition-segment segment-infantry" style="width:${compInfantry}%"></span>
        <span class="composition-segment segment-cavalry" style="width:${compCavalry}%"></span>
        <span class="composition-segment segment-archers" style="width:${compArchers}%"></span>
      </div>

      <div class="formation-bottom">
        <span>${formatNumber(total)} / ${formatNumber(formation.capacity)}</span>
        <span class="${pctRounded >= 100 ? "capacity-check" : "capacity-percent"}">
          ${pctRounded >= 100 ? "✓100%" : pctRounded + "%"}
        </span>
      </div>
    `;
    return card;
  }

  function renderFormations() {
    const grid = document.getElementById("formationsGrid");
    const result = state.result;
    grid.innerHTML = "";

    if (!result || result.formations.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.id = "emptyState";
      empty.setAttribute("data-i18n", "emptyFormations");
      empty.textContent = t("emptyFormations");
      grid.appendChild(empty);
      return;
    }

    result.formations.forEach((formation) => {
      grid.appendChild(buildFormationCard(formation));
    });
  }

  function renderAll() {
    renderStats();
    renderFormations();
  }

  /* ----------------------- Segmented control wiring ---------------------- */
  function wireSegmented(elementId, onSelect) {
    const container = document.getElementById(elementId);
    container.querySelectorAll(".segmented-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".segmented-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        onSelect(btn.getAttribute("data-value"));
      });
    });
  }

  /* ------------------------------- Init ---------------------------------- */
  function wireInputs() {
    document.getElementById("inputInfantry").addEventListener("input", (e) => {
      state.troops.infantry = parseNumberInput(e.target.value);
      e.target.value = state.troops.infantry === 0 ? "0" : formatNumber(state.troops.infantry);
    });
    document.getElementById("inputCavalry").addEventListener("input", (e) => {
      state.troops.cavalry = parseNumberInput(e.target.value);
      e.target.value = state.troops.cavalry === 0 ? "0" : formatNumber(state.troops.cavalry);
    });
    document.getElementById("inputArchers").addEventListener("input", (e) => {
      state.troops.archers = parseNumberInput(e.target.value);
      e.target.value = state.troops.archers === 0 ? "0" : formatNumber(state.troops.archers);
    });
    document.getElementById("inputFormationCount").addEventListener("input", (e) => {
      state.formationCount = parseNumberInput(e.target.value);
    });
    document.getElementById("inputCapacity").addEventListener("input", (e) => {
      state.baseCapacity = parseNumberInput(e.target.value);
      e.target.value = state.baseCapacity === 0 ? "0" : formatNumber(state.baseCapacity);
    });

    wireSegmented("eventSegmented", (value) => { state.event = value; });
    wireSegmented("ratioSegmented", (value) => { state.ratioKey = value; });
    wireSegmented("distributionSegmented", (value) => { state.distributionMode = value; });

    document.getElementById("toggleCityBuff").addEventListener("change", (e) => {
      state.modifiers.cityBuff = e.target.checked;
    });
    document.getElementById("toggleGiantBison").addEventListener("change", (e) => {
      state.modifiers.giantBison = e.target.checked;
    });
    document.getElementById("toggleCaptainMode").addEventListener("change", (e) => {
      state.modifiers.captainMode = e.target.checked;
    });

    document.getElementById("btnCalculate").addEventListener("click", () => {
      runCalculation();
      renderAll();
    });

    document.getElementById("btnReset").addEventListener("click", resetApp);

    document.getElementById("langButton").addEventListener("click", () => toggleLangMenu());
    document.addEventListener("click", (e) => {
      const switcher = document.querySelector(".lang-switcher");
      if (switcher && !switcher.contains(e.target)) toggleLangMenu(false);
    });
  }

  function resetApp() {
    state.troops = { infantry: 0, cavalry: 0, archers: 0 };
    state.event = "standard";
    state.ratioKey = "equalize";
    state.distributionMode = "fill";
    state.modifiers = { cityBuff: false, giantBison: false, captainMode: false };
    state.formationCount = CONFIG.DEFAULT_FORMATION_COUNT;
    state.baseCapacity = CONFIG.DEFAULT_CAPACITY;
    state.result = null;

    document.getElementById("inputInfantry").value = "0";
    document.getElementById("inputCavalry").value = "0";
    document.getElementById("inputArchers").value = "0";
    document.getElementById("inputFormationCount").value = String(CONFIG.DEFAULT_FORMATION_COUNT);
    document.getElementById("inputCapacity").value = formatNumber(CONFIG.DEFAULT_CAPACITY);
    document.getElementById("toggleCityBuff").checked = false;
    document.getElementById("toggleGiantBison").checked = false;
    document.getElementById("toggleCaptainMode").checked = false;

    ["eventSegmented", "ratioSegmented", "distributionSegmented"].forEach((id) => {
      const container = document.getElementById(id);
      container.querySelectorAll(".segmented-btn").forEach((b, idx) => {
        b.classList.toggle("is-active", idx === 0);
      });
    });

    renderAll();
  }

  function hideLoadingScreen() {
    const screen = document.getElementById("loadingScreen");
    const app = document.getElementById("app");
    app.hidden = false;
    screen.classList.add("is-hidden");
    setTimeout(() => { screen.style.display = "none"; }, 650);
  }

  function init() {
    state.language = loadStoredLanguage();
    document.documentElement.lang = state.language;
    document.documentElement.dir = TRANSLATIONS[state.language].dir || "ltr";

    applyTranslations();
    refreshDynamicHints();
    wireInputs();
    runCalculation();
    renderAll();

    const startedAt = Date.now();
    window.addEventListener("load", () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(CONFIG.LOADING_SCREEN_MIN_MS - elapsed, 0);
      setTimeout(hideLoadingScreen, remaining);
    });
    // Fallback in case the load event already fired before this script ran.
    if (document.readyState === "complete") {
      setTimeout(hideLoadingScreen, CONFIG.LOADING_SCREEN_MIN_MS);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
