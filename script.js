document.addEventListener("DOMContentLoaded", () => {
    const docElement = document.documentElement;
    const storage = localStorage;

    // Helper: Determine current theme
    const getCurrentTheme = () => {
        return docElement.getAttribute("data-theme") || storage.getItem("theme") || "light";
    };

    // Helper: Set theme to DOM and Storage
    const setTheme = (themeName) => {
        docElement.setAttribute("data-theme", themeName);
        storage.setItem("theme", themeName);
        updateTextLabels(themeName);
    };

    // Helper: Update text labels (Mobile only)
    // Helper: Update text labels (Mobile only)
    const updateTextLabels = (themeName) => {
        // Logic removed so text remains "Switch Theme" permanently
    };

    // 1. Set Initial Theme (This runs instantly)
    const initialTheme = getCurrentTheme();
    docElement.setAttribute("data-theme", initialTheme);

    // 2. Wait for DOM to update labels
    window.addEventListener("DOMContentLoaded", () => {
        updateTextLabels(initialTheme);

        // Click Listener
        document.addEventListener("click", (event) => {
            const button = event.target.closest("#theme-toggle, #mobile-theme-toggle, #footer-theme-btn");
            if (button) {
                event.preventDefault();
                const newTheme = getCurrentTheme() === "dark" ? "light" : "dark";
                setTheme(newTheme);
            }
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

    window.addEventListener('load', () => {
        document.body.classList.remove('no-transition');
        document.documentElement.classList.remove('no-transition');
    });
});