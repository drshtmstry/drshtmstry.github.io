document.addEventListener("DOMContentLoaded", () => {
    const store = localStorage;
    const toggles = document.querySelectorAll("#theme-toggle, #footer-theme-btn");

    // Remove no-transition class that was added in HTML to prevent initial flash
    // We use requestAnimationFrame to ensure the paint has settled
    requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transition');
    });

    // Function to get current state
    const getTheme = () => document.documentElement.getAttribute("data-theme") || "light";

    // Function to update UI (Icons & Text)
    const updateUI = () => {
        const theme = getTheme();
        const isDark = theme === "dark";

        const iconClass = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        const btnText = isDark ? "Light Mode" : "Dark Mode";

        toggles.forEach(btn => {
            const i = btn.querySelector("i");
            if (i) i.className = iconClass;

            btn.setAttribute("data-theme-text", btnText);

            const span = btn.querySelector("span");
            if (span) span.textContent = btnText;
        });
    };

    // Initial UI Update (theme already set in HTML)
    updateUI();

    // Click Handlers
    toggles.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            // Add no-transition class to prevent flash during toggle
            document.documentElement.classList.add('no-transition');

            const current = getTheme();
            const next = current === "light" ? "dark" : "light";

            document.documentElement.setAttribute("data-theme", next);
            store.setItem("theme", next);
            updateUI();

            // Force reflow
            void document.documentElement.offsetWidth;

            // Remove class after a frame
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transition');
            });
        });
    });

    const yearSpan = document.getElementById("current-year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const blob1 = document.querySelector(".glow-1");
    const blob2 = document.querySelector(".glow-2");
    let ticking = false;
    if (window.innerWidth > 1024) {
        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    blob1.style.transform = `translateY(${scrollY * 0.15}px)`;
                    blob2.style.transform = `translateY(${scrollY * -0.15}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });
    document.querySelectorAll('.reveal').forEach(card => observer.observe(card));
});