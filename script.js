document.addEventListener("DOMContentLoaded", () => {
    const docElement = document.documentElement;
    const storage = localStorage;

    // --- 1. THEME LOGIC ---

    // Determine current theme
    const getCurrentTheme = () => {
        return docElement.getAttribute("data-theme") || storage.getItem("theme") || "light";
    };

    // Set theme to DOM and Storage
    const setTheme = (themeName) => {
        docElement.setAttribute("data-theme", themeName);
        storage.setItem("theme", themeName);
    };

    // Set Initial Theme
    const initialTheme = getCurrentTheme();
    docElement.setAttribute("data-theme", initialTheme);

    // Theme Toggle Click Listener
    document.addEventListener("click", (event) => {
        const button = event.target.closest("#theme-toggle, #mobile-theme-toggle, #footer-theme-btn");
        if (button) {
            event.preventDefault();
            const newTheme = getCurrentTheme() === "dark" ? "light" : "dark";
            setTheme(newTheme);
        }
    });

    // --- 2. UI UTILITIES ---

    // Footer Year Update
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Background Blob Parallax (Desktop Only)
    const blob1 = document.querySelector(".glow-1");
    const blob2 = document.querySelector(".glow-2");

    // Added safety check (&& blob1 && blob2) to prevent errors on pages without blobs
    if (window.innerWidth > 1024 && blob1 && blob2) {
        let ticking = false;
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

    // Scroll Reveal Animation
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

    // Enable Transitions After Page Load
    window.addEventListener('load', () => {
        document.body.classList.remove('no-transition');
        document.documentElement.classList.remove('no-transition');
    });
});