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

    // Remove transition block
    requestAnimationFrame(() => {
        docElement.classList.remove('no-transition');
    });

    // Theme toggle click listener (covers theme-toggle-btn and mobile-theme-toggle)
    document.addEventListener("click", (event) => {
        const button = event.target.closest("#theme-toggle, #mobile-theme-toggle");
        if (button) {
            event.preventDefault();
            const newTheme = getCurrentTheme() === "dark" ? "light" : "dark";
            setTheme(newTheme);
        }
    });

    // --- 2. MOBILE DRAWER INTERACTION ---

    const menuToggle = document.querySelector(".menu-toggle");
    const closeDrawer = document.querySelector(".close-drawer");
    const mobileDrawer = document.querySelector(".mobile-nav-drawer");
    const mobileNavItems = document.querySelectorAll(".mobile-nav-item");

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener("click", () => {
            mobileDrawer.classList.add("open");
        });
    }

    if (closeDrawer && mobileDrawer) {
        closeDrawer.addEventListener("click", () => {
            mobileDrawer.classList.remove("open");
        });
    }

    // Close drawer when link clicked
    mobileNavItems.forEach(item => {
        item.addEventListener("click", () => {
            if (mobileDrawer) {
                mobileDrawer.classList.remove("open");
            }
        });
    });

    // --- 3. SCROLL REVEAL ANIMATION ---

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // --- 4. FOOTER YEAR ---

    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 5. DYNAMIC ACCENT COLOR CYCLE ---
    const accentColors = [
        { hex: '#00b87c', rgb: '0, 184, 124' },  // Emerald
        { hex: '#3b82f6', rgb: '59, 130, 246' },  // Electric Blue
        { hex: '#8b5cf6', rgb: '139, 92, 246' },  // Purple
        { hex: '#ec4899', rgb: '236, 72, 153' },  // Pink
        { hex: '#14b8a6', rgb: '20, 184, 166' }   // Teal
    ];
    let currentColorIndex = 0;
    
    setInterval(() => {
        currentColorIndex = (currentColorIndex + 1) % accentColors.length;
        const color = accentColors[currentColorIndex];
        docElement.style.setProperty('--primary', color.hex);
        docElement.style.setProperty('--primary-rgb', color.rgb);
    }, 7000);

    // --- 6. SCROLL ORBIT FOR HERO DOTS ---
    const dotsContainer = document.querySelector(".image-open-container");
    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll(".floating-dot");
        const baseAngles = [0, 120, 240];
        
        const updateOrbit = () => {
            const scrollTop = window.scrollY;
            // 1px of scroll = 0.2 degrees of rotation
            const rotation = scrollTop * 0.2;
            
            const width = dotsContainer.clientWidth || 320;
            const height = dotsContainer.clientHeight || 380;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = width / 2 + 15; // 15px offset outside the container border
            
            dots.forEach((dot, index) => {
                if (index < 3) {
                    const angleDeg = baseAngles[index] + rotation;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    
                    const x = centerX + radius * Math.cos(angleRad) - 6; // Subtract 6px (half of 12px dot width) to center it
                    const y = centerY + radius * Math.sin(angleRad) - 6;
                    
                    dot.style.left = `${x}px`;
                    dot.style.top = `${y}px`;
                }
            });
        };
        
        window.addEventListener("scroll", updateOrbit, { passive: true });
        window.addEventListener("resize", updateOrbit, { passive: true });
        updateOrbit(); // Initial position setup
    }
});