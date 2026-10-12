const menuButton = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
        nav.classList.toggle("open");
        menuButton.setAttribute(
            "aria-expanded",
            nav.classList.contains("open") ? "true" : "false"
        );
    });

    document.addEventListener("click", (event) => {
        if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
            nav.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        }
    });
}

document.querySelectorAll(".nav a").forEach((link) => {
    const current = window.location.pathname.split("/").pop() || "index.html";
    const target = link.getAttribute("href")?.split("/").pop();

    if (target === current) {
        link.classList.add("active");
    }
});

document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
});

let clickAudioContext;

document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    const ripple = document.createElement("span");
    const buttonBounds = button.getBoundingClientRect();
    const clickX = event.detail === 0 ? buttonBounds.left + buttonBounds.width / 2 : event.clientX;
    const clickY = event.detail === 0 ? buttonBounds.top + buttonBounds.height / 2 : event.clientY;
    ripple.className = "button-click-ripple";
    ripple.style.left = `${clickX}px`;
    ripple.style.top = `${clickY}px`;
    document.body.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;

    clickAudioContext ??= new AudioContextConstructor();
    if (clickAudioContext.state === "suspended") void clickAudioContext.resume();

    const oscillator = clickAudioContext.createOscillator();
    const gain = clickAudioContext.createGain();
    const startTime = clickAudioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, startTime + 0.04);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.018, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);
    oscillator.connect(gain);
    gain.connect(clickAudioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.12);
});

/* ---------------------------------------------------------
   Homepage welcome popup
   It now appears every time the homepage itself is loaded.
   --------------------------------------------------------- */
const welcome = document.querySelector("#welcome-overlay");
const closeWelcomeButtons = document.querySelectorAll("[data-close-welcome]");

function hideWelcome() {
    if (!welcome) return;

    welcome.classList.remove("show");
    document.body.classList.remove("modal-open");
}

if (welcome) {
    welcome.classList.add("show");
    document.body.classList.add("modal-open");

    welcome.addEventListener("click", (event) => {
        if (event.target === welcome) {
            hideWelcome();
        }
    });
}

closeWelcomeButtons.forEach((button) => {
    button.addEventListener("click", hideWelcome);
});

/* ---------------------------------------------------------
   Personnel category popup and switching
   --------------------------------------------------------- */
const personnelPicker = document.querySelector("#personnel-picker-overlay");
const personnelChoiceButtons = document.querySelectorAll("[data-personnel-choice]");
const personnelPanels = document.querySelectorAll("[data-personnel-panel]");
const personnelPickerOpenButtons = document.querySelectorAll("[data-open-personnel-picker]");
const personnelTitle = document.querySelector("#personnel-category-title");
const personnelDescription = document.querySelector("#personnel-category-description");

const personnelCategoryCopy = {
    teaching: {
        title: "Teaching Personnel",
        description:
            "Faculty members directly involved in classroom instruction and academic leadership."
    },
    "teaching-related": {
        title: "Teaching-Related Personnel",
        description:
            "Personnel who support instructional programs, learning services, and teaching-related school functions."
    },
    "non-teaching": {
        title: "Non-Teaching Personnel",
        description:
            "Administrative, technical, clerical, and support personnel who help keep school services operating."
    }
};

function showPersonnelCategory(category) {
    personnelPanels.forEach((panel) => {
        panel.classList.toggle(
            "active",
            panel.getAttribute("data-personnel-panel") === category
        );
    });

    const copy = personnelCategoryCopy[category];

    if (copy && personnelTitle && personnelDescription) {
        personnelTitle.textContent = copy.title;
        personnelDescription.textContent = copy.description;
    }

    if (personnelPicker) {
        personnelPicker.classList.remove("show");
    }

    document.body.classList.remove("modal-open");
}

personnelChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showPersonnelCategory(button.getAttribute("data-personnel-choice"));
    });
});

personnelPickerOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!personnelPicker) return;

        personnelPicker.classList.add("show");
        document.body.classList.add("modal-open");
    });
});

if (personnelPicker) {
    document.body.classList.add("modal-open");
}

/* ---------------------------------------------------------
   Survey evaluation reminder
   Appears at the top-right every 60 seconds.
   --------------------------------------------------------- */
const surveyUrl = "https://forms.gle/BQADoaQvHX5dyZUE6";
let surveyReminder;

function createSurveyReminder() {
    if (surveyReminder) return surveyReminder;

    surveyReminder = document.createElement("aside");
    surveyReminder.className = "survey-reminder";
    surveyReminder.setAttribute("role", "dialog");
    surveyReminder.setAttribute("aria-label", "Website evaluation reminder");

    surveyReminder.innerHTML = `
        <div class="survey-reminder-top">
            <div>
                <div class="eyebrow">Website Evaluation</div>
                <h3>Help us improve the SPRCNHS website</h3>
            </div>
            <button
                class="survey-reminder-close"
                type="button"
                aria-label="Close survey reminder"
            >×</button>
        </div>

        <p>
            Share your experience through the website evaluation form.
            Your feedback will help guide future improvements.
        </p>

        <div class="survey-reminder-actions">
            <a
                class="survey-reminder-link"
                href="${surveyUrl}"
                target="_blank"
                rel="noopener noreferrer"
            >Open Evaluation Form</a>
        </div>
    `;

    document.body.appendChild(surveyReminder);

    const closeButton = surveyReminder.querySelector(".survey-reminder-close");

    closeButton.addEventListener("click", () => {
        surveyReminder.classList.remove("show");
    });

    return surveyReminder;
}

function showSurveyReminder() {
    const reminder = createSurveyReminder();

    reminder.classList.remove("show");

    window.requestAnimationFrame(() => {
        reminder.classList.add("show");
    });
}

window.setTimeout(() => {
    showSurveyReminder();
    window.setInterval(showSurveyReminder, 60000);
}, 60000);

/* ---------------------------------------------------------
   Copy-contact buttons
   --------------------------------------------------------- */
document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
        const value = button.getAttribute("data-copy");
        const status = document.getElementById(button.getAttribute("data-status"));

        try {
            await navigator.clipboard.writeText(value);

            if (status) {
                status.textContent = `Copied: ${value}`;
            }

            const original = button.textContent;
            button.textContent = "Copied";

            window.setTimeout(() => {
                button.textContent = original;
            }, 1400);
        } catch {
            if (status) {
                status.textContent = `Contact: ${value}`;
            }
        }
    });
});

/* Escape closes the active modal, but not the repeating survey reminder. */
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (welcome?.classList.contains("show")) {
        hideWelcome();
        return;
    }

    if (personnelPicker?.classList.contains("show")) {
        personnelPicker.classList.remove("show");
        document.body.classList.remove("modal-open");
    }
});


/* ---------------------------------------------------------
   Homepage announcement rotator
   --------------------------------------------------------- */
document.querySelectorAll("[data-rotator]").forEach((rotator) => {
    const slides = Array.from(rotator.querySelectorAll(".rotator-slide"));
    const controls = rotator.querySelector(".rotator-controls");
    const interval = Number(rotator.getAttribute("data-interval")) || 10000;

    if (slides.length <= 1) return;

    let current = Math.max(
        0,
        slides.findIndex((slide) => slide.classList.contains("active"))
    );

    const dots = slides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "rotator-dot" + (index === current ? " active" : "");
        dot.setAttribute("aria-label", `Show item ${index + 1}`);
        dot.addEventListener("click", () => {
            show(index);
            restart();
        });
        controls?.appendChild(dot);
        return dot;
    });

    function show(index) {
        slides[current].classList.remove("active");
        dots[current]?.classList.remove("active");
        current = (index + slides.length) % slides.length;
        slides[current].classList.add("active");
        dots[current]?.classList.add("active");
    }

    let timer = window.setInterval(() => show(current + 1), interval);

    function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(current + 1), interval);
    }

    rotator.addEventListener("mouseenter", () => window.clearInterval(timer));
    rotator.addEventListener("mouseleave", restart);
});

// Personnel directory search, filtering, and sorting.
document.querySelectorAll(".personnel-category-panel").forEach((panel) => {
    const input = panel.querySelector(".personnel-search");
    const sexFilter = panel.querySelector(".personnel-sex-filter");
    const sortSelect = panel.querySelector(".personnel-sort");
    const list = panel.querySelector(".directory-list");
    const count = panel.querySelector(".personnel-count");
    const empty = panel.querySelector(".personnel-empty");
    const records = [...panel.querySelectorAll(".personnel-record")];

    function updatePersonnelDirectory() {
        const query = (input?.value || "").trim().toLowerCase();
        const sex = sexFilter?.value || "all";
        const direction = sortSelect?.value || "az";

        records.sort((a, b) => {
            const an = a.dataset.personnelName || a.querySelector("h3")?.textContent.trim().toLowerCase() || "";
            const bn = b.dataset.personnelName || b.querySelector("h3")?.textContent.trim().toLowerCase() || "";
            return direction === "za" ? bn.localeCompare(an) : an.localeCompare(bn);
        });
        records.forEach((record) => list?.appendChild(record));

        let visible = 0;
        records.forEach((record) => {
            const haystack = (record.dataset.personnelSearch || record.textContent || "").toLowerCase();
            const recordSex = record.dataset.personnelSex || "";
            const matchesSearch = !query || haystack.includes(query);
            const matchesSex = sex === "all" || recordSex === sex;
            const show = matchesSearch && matchesSex;

            record.hidden = !show;
            record.classList.toggle("is-filtered-out", !show);
            if (show) visible++;
        });

        if (count) count.textContent = `${visible} ${visible === 1 ? "person" : "personnel"}`;
        if (empty) empty.hidden = visible !== 0;
    }

    input?.addEventListener("input", updatePersonnelDirectory);
    sexFilter?.addEventListener("change", updatePersonnelDirectory);
    sortSelect?.addEventListener("change", updatePersonnelDirectory);
    updatePersonnelDirectory();
});

// Homepage hero carousel and background music.
document.querySelectorAll("[data-hero-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll("[data-hero-slide]")];
    const dots = [...carousel.querySelectorAll("[data-hero-dot]")];
    const previousButton = carousel.querySelector("[data-hero-prev]");
    const nextButton = carousel.querySelector("[data-hero-next]");
    const pauseButton = carousel.querySelector("[data-hero-pause]");
    const musicButton = carousel.querySelector("[data-hero-music]");
    const audio = document.querySelector("#homepage-bgm");
    const interval = Math.max(3000, Number(carousel.dataset.interval) || 6500);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentSlide = 0;
    let carouselTimer = null;
    let carouselPaused = reduceMotion;
    let musicEnabled = false;

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === currentSlide);
            dot.setAttribute("aria-current", dotIndex === currentSlide ? "true" : "false");
        });
    }

    function stopCarousel() {
        if (carouselTimer !== null) {
            window.clearInterval(carouselTimer);
            carouselTimer = null;
        }
    }

    function startCarousel() {
        stopCarousel();
        if (!carouselPaused && !reduceMotion && slides.length > 1) {
            carouselTimer = window.setInterval(() => showSlide(currentSlide + 1), interval);
        }
    }

    function updateMusicState() {
        if (!audio) return;
        audio.muted = !musicEnabled;
        if (musicButton) {
            musicButton.textContent = musicEnabled ? "Stop music" : "Play music";
            musicButton.setAttribute("aria-pressed", String(musicEnabled));
            musicButton.setAttribute(
                "aria-label",
                musicEnabled ? "Stop homepage background music" : "Play homepage background music"
            );
        }
    }

    async function enableMusic() {
        if (!audio) return;
        musicEnabled = true;
        audio.volume = 0.18;
        audio.muted = false;
        updateMusicState();
        try {
            await audio.play();
        } catch {
            musicEnabled = false;
            updateMusicState();
        }
    }

    previousButton?.addEventListener("click", () => {
        showSlide(currentSlide - 1);
        startCarousel();
    });
    nextButton?.addEventListener("click", () => {
        showSlide(currentSlide + 1);
        startCarousel();
    });
    dots.forEach((dot, index) => dot.addEventListener("click", () => {
        showSlide(index);
        startCarousel();
    }));

    pauseButton?.addEventListener("click", () => {
        carouselPaused = !carouselPaused;
        pauseButton.innerHTML = carouselPaused
            ? '<span class="hero-control-icon hero-play-icon" aria-hidden="true">▶</span>'
            : '<span class="hero-control-icon" aria-hidden="true">⏸</span>';
        pauseButton.setAttribute("aria-label", carouselPaused ? "Play carousel" : "Pause carousel");
        pauseButton.setAttribute("aria-pressed", String(carouselPaused));
        if (carouselPaused) stopCarousel();
        else startCarousel();
    });

    // Keyboard focus pauses the slideshow; pointer hover does not.
    carousel.addEventListener("focusin", () => {
        if (!carouselPaused) stopCarousel();
    });
    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) startCarousel();
    });
    musicButton?.addEventListener("click", () => {
        if (musicEnabled) {
            musicEnabled = false;
            audio?.pause();
            updateMusicState();
        } else {
            void enableMusic();
        }
    });

    showSlide(0);
    startCarousel();
    updateMusicState();
});
