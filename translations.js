/* ==========================================================
   Modal
========================================================== */

.modal {

    border: none;

    border-radius: var(--radius-card);

    padding: 0;

    max-width: 520px;

    width: calc(100% - 32px);

    margin: auto;

    background: transparent;

}

.modal::backdrop {

    background: rgba(0,0,0,.35);

    backdrop-filter: blur(6px);

}

.modal-content {

    position: relative;

    background: white;

    border-radius: var(--radius-card);

    padding: 28px;

    box-shadow: var(--shadow-hover);

}

.modal-close {

    position: absolute;

    top: 16px;

    right: 16px;

    width: 38px;

    height: 38px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    background: white;

    border: 1px solid var(--border);

    transition: var(--transition-fast);

}

.modal-close:hover {

    transform: rotate(90deg);

}

.modal-close img {

    width: 18px;

    height: 18px;

}

.help-image {

    width: 100%;

    border-radius: 16px;

    margin-bottom: 20px;

}

.modal h3 {

    margin-bottom: 12px;

    font-size: 1.25rem;

    font-weight: 700;

}

.modal p {

    line-height: 1.7;

    color: var(--text-light);

}

/* ==========================================================
   Language Dropdown
========================================================== */

.language-dropdown {

    position: absolute;

    top: 82px;

    right: 22px;

    width: 220px;

    background: white;

    border-radius: 18px;

    border: 1px solid var(--border);

    box-shadow: var(--shadow-hover);

    overflow: hidden;

    z-index: 500;

}

.language-option {

    display: flex;

    align-items: center;

    gap: 12px;

    padding: 14px 18px;

    cursor: pointer;

    transition: var(--transition-fast);

}

.language-option:hover {

    background: rgba(255,95,162,.08);

}

/* ==========================================================
   Toast
========================================================== */

.toast {

    position: fixed;

    bottom: 28px;

    left: 50%;

    transform: translateX(-50%) translateY(120px);

    background: rgba(38,40,58,.96);

    color: white;

    padding: 14px 22px;

    border-radius: var(--radius-pill);

    font-weight: 600;

    box-shadow: var(--shadow-hover);

    opacity: 0;

    transition: .35s ease;

    z-index: 1000;

}

.toast.show {

    opacity: 1;

    transform: translateX(-50%) translateY(0);

}

/* ==========================================================
   Footer
========================================================== */

.app-footer {

    text-align: center;

    padding: 36px 20px;

    color: var(--text-light);

    font-size: .9rem;

}

.heart {

    color: var(--color-archers);

}

.version {

    display: block;

    margin-top: 10px;

    font-size: .8rem;

}

/* ==========================================================
   Responsive
========================================================== */

@media (max-width: 700px) {

    .army-grid,
    .statistics-grid {

        grid-template-columns: 1fr;

    }

    .setting-row {

        flex-direction: column;

        align-items: stretch;

    }

    .setting-row select {

        width: 100%;

    }

    .formation-troops {

        flex-direction: column;

        gap: 12px;

    }

}

/* ==========================================================
   Micro Interactions
========================================================== */

button,
input,
select,
.card,
.army-card,
.stat-card,
.formation-card {

    transition: var(--transition-fast);

}

button:active {

    transform: scale(.97);

}

input:hover,
select:hover {

    border-color: var(--color-primary);

}

.card:hover {

    transform: translateY(-3px);

}

.formation-card:hover {

    transform: translateY(-4px);

}

.stat-card:hover {

    transform: translateY(-3px);

}

.army-card:hover {

    transform: translateY(-3px);

}
























/* ==========================================================
   Available Languages
========================================================== */

const availableLanguages = [

    {
        code: "en",
        flag: "🇺🇸",
        name: "English"
    },

    {
        code: "fr",
        flag: "🇫🇷",
        name: "Français"
    },

    {
        code: "de",
        flag: "🇩🇪",
        name: "Deutsch"
    },

    {
        code: "it",
        flag: "🇮🇹",
        name: "Italiano"
    },

    {
        code: "es",
        flag: "🇪🇸",
        name: "Español"
    },

    {
        code: "pt",
        flag: "🇵🇹",
        name: "Português"
    },

    {
        code: "tr",
        flag: "🇹🇷",
        name: "Türkçe"
    },

    {
        code: "ru",
        flag: "🇷🇺",
        name: "Русский"
    },

    {
        code: "uk",
        flag: "🇺🇦",
        name: "Українська"
    },

    {
        code: "ko",
        flag: "🇰🇷",
        name: "한국어"
    },

    {
        code: "ja",
        flag: "🇯🇵",
        name: "日本語"
    },

    {
        code: "zh",
        flag: "🇨🇳",
        name: "中文"
    },

    {
        code: "th",
        flag: "🇹🇭",
        name: "ไทย"
    },

    {
        code: "vi",
        flag: "🇻🇳",
        name: "Tiếng Việt"
    },

    {
        code: "id",
        flag: "🇮🇩",
        name: "Bahasa Indonesia"
    },

    {
        code: "ar",
        flag: "🇸🇦",
        name: "العربية"
    },

    {
        code: "bg",
        flag: "🇧🇬",
        name: "Български"
    }

];

/* ==========================================================
   Default Language
========================================================== */

let currentLanguage = "en";






























/* ==========================================================
   Translate Entire Page
========================================================== */

function translatePage() {

    const dictionary = translations[currentLanguage];

    if (!dictionary) return;

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            if (dictionary[key]) {

                element.textContent =
                    dictionary[key];

            }

        });

}

/* ==========================================================
   Set Language
========================================================== */

function setLanguage(languageCode) {

    if (!translations[languageCode]) return;

    currentLanguage = languageCode;

    localStorage.setItem(
        "oogie-language",
        languageCode
    );

    translatePage();

    updateLanguageButton();

}

/* ==========================================================
   Update Language Button
========================================================== */

function updateLanguageButton() {

    const language =
        availableLanguages.find(
            item => item.code === currentLanguage
        );

    if (!language) return;

    const button =
        document.getElementById("languageButton");

    if (!button) return;

    button.innerHTML = `

        <span class="language-flag">
            ${language.flag}
        </span>

        <span id="currentLanguage">
            ${language.name}
        </span>

        <span class="dropdown-arrow">
            ▼
        </span>

    `;

}

/* ==========================================================
   Load Saved Language
========================================================== */

function loadLanguage() {

    const savedLanguage =
        localStorage.getItem(
            "oogie-language"
        );

    if (
        savedLanguage &&
        translations[savedLanguage]
    ) {

        currentLanguage = savedLanguage;

    }

    translatePage();

    updateLanguageButton();

}



















/* ==========================================================
   Build Language Menu
========================================================== */

function buildLanguageMenu() {

    const menu =
        document.getElementById("languageDropdown");

    if (!menu) return;

    menu.innerHTML = "";

    availableLanguages.forEach(language => {

        const option =
            document.createElement("button");

        option.className = "language-option";

        option.innerHTML = `
            <span class="language-flag">
                ${language.flag}
            </span>

            <span class="language-name">
                ${language.name}
            </span>
        `;

        option.addEventListener("click", () => {

            setLanguage(language.code);

            menu.classList.add("hidden");

        });

        menu.appendChild(option);

    });

}

/* ==========================================================
   Toggle Language Menu
========================================================== */

function toggleLanguageMenu() {

    const menu =
        document.getElementById("languageDropdown");

    if (!menu) return;

    menu.classList.toggle("hidden");

}

/* ==========================================================
   Close Menu When Clicking Outside
========================================================== */

document.addEventListener("click", event => {

    const menu =
        document.getElementById("languageDropdown");

    const button =
        document.getElementById("languageButton");

    if (!menu || !button) return;

    if (
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ) {

        menu.classList.add("hidden");

    }

});

/* ==========================================================
   Initialize Language System
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    buildLanguageMenu();

    loadLanguage();

    const languageButton =
        document.getElementById("languageButton");

    if (languageButton) {

        languageButton.addEventListener(
            "click",
            toggleLanguageMenu
        );

    }

});








































