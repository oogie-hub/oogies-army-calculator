/* ==========================================
   Oogie's Army Calculator v2
   Script - Section 1
========================================== */

const $ = (id) => document.getElementById(id);

/* ---------- Elements ---------- */

const infantry = $("infantry");
const cavalry = $("cavalry");
const archer = $("archer");
const capacity = $("capacity");

const ratio = $("ratio");
const customRatio = $("customRatio");
const customRatioContainer = $("customRatioContainer");

const cityBonus = $("cityBonus");
const fearlessRoar = $("fearlessRoar");
const formations = $("formations");

const bearTrap = $("bearTrap");
const fillFirst = $("fillFirst");
const fillFirstContainer = $("fillFirstContainer");

const joinerLimitToggle = $("joinerLimitToggle");
const joinerLimitContainer = $("joinerLimitContainer");
const joinerLimit = $("joinerLimit");

const runningCapacity = $("runningCapacity");

const remainingInfantry = $("remainingInfantry");
const remainingCavalry = $("remainingCavalry");
const remainingArcher = $("remainingArcher");

const results = $("results");

const helpButton = $("helpButton");
const helpModal = $("helpModal");
const closeHelp = $("closeHelp");
const closeHelpButton = $("closeHelpButton");

const viewFormationsButton = $("viewFormationsButton");
const formationsSection = $("formationsSection");

/* ---------- Event Listeners ---------- */

document
    .querySelectorAll("input, select")
    .forEach(element => {

        element.addEventListener("input", calculate);
        element.addEventListener("change", calculate);

    });

ratio.addEventListener("change", () => {

    customRatioContainer.classList.toggle(
        "hidden",
        ratio.value !== "custom"
    );

});

bearTrap.addEventListener("change", () => {

    fillFirstContainer.classList.toggle(
        "hidden",
        !bearTrap.checked
    );

});

joinerLimitToggle.addEventListener("change", () => {

    joinerLimitContainer.classList.toggle(
        "hidden",
        !joinerLimitToggle.checked
    );

});

viewFormationsButton.addEventListener("click", () => {

    formationsSection.scrollIntoView({

        behavior: "smooth",
        block: "start"

    });

});

helpButton.addEventListener("click", () => {

    helpModal.classList.remove("hidden");

});

closeHelp.addEventListener("click", () => {

    helpModal.classList.add("hidden");

});

closeHelpButton.addEventListener("click", () => {

    helpModal.classList.add("hidden");

});

helpModal.addEventListener("click", e => {

    if (e.target === helpModal) {

        helpModal.classList.add("hidden");

    }

});

/* ---------- Helpers ---------- */

function getValue(element) {

    return Number(element.value || 0);

}

function getRatio() {

    let value = ratio.value;

    if (value === "custom") {

        value = customRatio.value || "5/20/75";

    }

    const parts = value
        .split("/")
        .map(Number);

    return {

        inf: parts[0] / 100,
        cav: parts[1] / 100,
        arch: parts[2] / 100

    };

}

/* ---------- Placeholder ---------- */

function calculate() {

    // Section 2

}

calculate();















function calculate() {

    const totalInf = getValue(infantry);
    const totalCav = getValue(cavalry);
    const totalArch = getValue(archer);

    const baseCapacity = getValue(capacity);

    const city = getValue(cityBonus);
    const bison = getValue(fearlessRoar);

    const marchCount = getValue(formations);

    const currentCapacity =
        Math.round(
            baseCapacity +
            (baseCapacity * city) +
            bison
        );

    runningCapacity.textContent =
        currentCapacity.toLocaleString();

    if (!marchCount) {

        results.innerHTML = "";

        remainingInfantry.textContent =
            totalInf.toLocaleString();

        remainingCavalry.textContent =
            totalCav.toLocaleString();

        remainingArcher.textContent =
            totalArch.toLocaleString();

        return;

    }

    const troopRatio = getRatio();

    let infRemaining = totalInf;
    let cavRemaining = totalCav;
    let archRemaining = totalArch;

    results.innerHTML = "";

    for (let march = 1; march <= marchCount; march++) {

        let inf;
        let cav;
        let arch;

        if (bearTrap.checked) {

            if (fillFirst.checked && march === 1) {

                inf = Math.min(
                    Math.round(currentCapacity * troopRatio.inf),
                    infRemaining
                );

                cav = Math.min(
                    Math.round(currentCapacity * troopRatio.cav),
                    cavRemaining
                );

                arch = Math.min(
                    Math.round(currentCapacity * troopRatio.arch),
                    archRemaining
                );

            } else {

                const marchesLeft =
                    fillFirst.checked
                        ? marchCount - 1
                        : marchCount;

                arch = Math.floor(
                    archRemaining / marchesLeft
                );

                const remainingCapacity =
                    currentCapacity - arch;

                const ratioTotal =
                    troopRatio.inf + troopRatio.cav;

                inf = Math.floor(
                    remainingCapacity *
                    (troopRatio.inf / ratioTotal)
                );

                cav = Math.floor(
                    remainingCapacity *
                    (troopRatio.cav / ratioTotal)
                );

                inf = Math.min(inf, infRemaining);
                cav = Math.min(cav, cavRemaining);

            }

        } else {

            inf = Math.floor(totalInf / marchCount);
            cav = Math.floor(totalCav / marchCount);
            arch = Math.floor(totalArch / marchCount);

        }

        infRemaining -= inf;
        cavRemaining -= cav;
        archRemaining -= arch;

                let title = `March ${march}`;

        if (bearTrap.checked) {

            title = `Joiner March ${march}`;

            if (fillFirst.checked) {

                title =
                    march === 1
                        ? "Rally Captain"
                        : `Joiner March ${march - 1}`;

            }

        }

        const card = document.createElement("div");

        card.className = "march fade-in";

        card.innerHTML = `

            <div class="march-title">

                ${title}

            </div>

            <div class="row">

                <span>

                    Infantry
                    <span class="percent">
                        ${Math.round(troopRatio.inf * 100)}%
                    </span>

                </span>

                <strong>

                    ${inf.toLocaleString()}

                </strong>

            </div>

            <div class="row">

                <span>

                    Cavalry
                    <span class="percent">
                        ${Math.round(troopRatio.cav * 100)}%
                    </span>

                </span>

                <strong>

                    ${cav.toLocaleString()}

                </strong>

            </div>

            <div class="row">

                <span>

                    Archers
                    <span class="percent">
                        ${Math.round(troopRatio.arch * 100)}%
                    </span>

                </span>

                <strong>

                    ${arch.toLocaleString()}

                </strong>

            </div>

        `;

        results.appendChild(card);
        
        
        
        
        
        

    }

    remainingInfantry.textContent =
        infRemaining.toLocaleString();

    remainingCavalry.textContent =
        cavRemaining.toLocaleString();

    remainingArcher.textContent =
        archRemaining.toLocaleString();

}









/* ==========================================
   Script - Section 4
========================================== */

/* ---------- Custom Ratio Formatting ---------- */

customRatio.addEventListener("input", (e) => {

    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 2 && value.length <= 4) {

        value =
            value.slice(0, 2) +
            "/" +
            value.slice(2);

    }

    if (value.length > 4) {

        value =
            value.slice(0, 2) +
            "/" +
            value.slice(2, 4) +
            "/" +
            value.slice(4, 6);

    }

    e.target.value = value;

    calculate();

});


/* ---------- Initialize ---------- */

calculate();




