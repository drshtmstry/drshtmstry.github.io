document.addEventListener("DOMContentLoaded", () => {
    const docElement = document.documentElement;
    const storage = localStorage;

    // --- 1. THEME LOGIC ---

    const getCurrentTheme = () => {
        return docElement.getAttribute("data-theme") || storage.getItem("theme") || "light";
    };

    const setTheme = (themeName) => {
        docElement.setAttribute("data-theme", themeName);
        storage.setItem("theme", themeName);
    };

    // Set initial theme
    const initialTheme = getCurrentTheme();
    docElement.setAttribute("data-theme", initialTheme);

    // Remove transition block as early as possible (DOM ready, not window.load)
    // A single rAF ensures the theme attribute paint has committed first
    requestAnimationFrame(() => {
        docElement.classList.remove('no-transition');
    });

    // Theme toggle click listener
    document.addEventListener("click", (event) => {
        const button = event.target.closest("#theme-toggle, #mobile-theme-toggle, #footer-theme-btn");
        if (button) {
            event.preventDefault();
            const newTheme = getCurrentTheme() === "dark" ? "light" : "dark";
            setTheme(newTheme);
        }
    });

    // --- 2. UI UTILITIES ---

    // Footer year
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Background blob parallax (desktop only)
    const blob1 = document.querySelector(".glow-1");
    const blob2 = document.querySelector(".glow-2");

    if (window.innerWidth > 1024 && blob1 && blob2) {
        let ticking = false;
        // passive: true lets the browser optimise the scroll pipeline — prevents jank
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
        }, { passive: true });
    }

    // Scroll reveal animation
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.reveal').forEach(card => observer.observe(card));
});