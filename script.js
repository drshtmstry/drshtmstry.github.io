document.addEventListener("DOMContentLoaded", () => {
    const docElement = document.documentElement;
    const storage = localStorage;

    let isNavScrolling = false;
    let navTargetSectionId = null;
    let activeScrollCleanup = null;

    // --- UTILITY: THROTTLE FUNCTION ---
    const throttle = (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Store event listeners for cleanup
    const eventListeners = [];
    const addEventListenerWithCleanup = (target, event, handler, options = false) => {
        target.addEventListener(event, handler, options);
        eventListeners.push({ target, event, handler, options });
    };

    // Cleanup function for memory efficiency
    const cleanup = () => {
        eventListeners.forEach(({ target, event, handler, options }) => {
            target.removeEventListener(event, handler, options);
        });
    };

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
    const handleThemeToggle = (event) => {
        const button = event.target.closest("#theme-toggle, #mobile-theme-toggle");
        if (button) {
            event.preventDefault();
            const newTheme = getCurrentTheme() === "dark" ? "light" : "dark";
            setTheme(newTheme);
        }
    };
    addEventListenerWithCleanup(document, "click", handleThemeToggle);

    // --- 2. MOBILE DRAWER INTERACTION ---

    const menuToggle = document.querySelector(".menu-toggle");
    const closeDrawer = document.querySelector(".close-drawer");
    const mobileDrawer = document.querySelector(".mobile-nav-drawer");
    const mobileNavItems = document.querySelectorAll(".mobile-nav-item");

    if (menuToggle && mobileDrawer) {
        const handleMenuToggle = () => {
            mobileDrawer.classList.add("open");
        };
        addEventListenerWithCleanup(menuToggle, "click", handleMenuToggle);
    }

    if (closeDrawer && mobileDrawer) {
        const handleCloseDrawer = () => {
            mobileDrawer.classList.remove("open");
        };
        addEventListenerWithCleanup(closeDrawer, "click", handleCloseDrawer);
    }

    // Close drawer when link clicked
    mobileNavItems.forEach(item => {
        const handleNavClick = () => {
            if (mobileDrawer) {
                mobileDrawer.classList.remove("open");
            }
        };
        addEventListenerWithCleanup(item, "click", handleNavClick);
    });

    // --- 3. SCROLL REVEAL ANIMATION ---

    const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-stagger';

    const observer = new IntersectionObserver((entries, obs) => {
        if (isNavScrolling) return; // Ignore observer during programmatic nav scrolls
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll(revealSelectors).forEach(el => observer.observe(el));

    // Immediately activate hero elements (already in viewport on load)
    document.querySelectorAll('.hero-section ' + revealSelectors.split(',').join(', .hero-section ')).forEach(el => {
        el.classList.add('active');
    });

    // --- 4. FOOTER YEAR ---

    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 5. SOCIAL LINKS (single source of truth) ---

    const SOCIALS = [
        {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/drshtmstry",
            icon: "fab fa-linkedin",
            label: "linkedin.com/in/drshtmstry",
        },
        {
            name: "GitHub",
            url: "https://github.com/drshtmstry",
            icon: "fab fa-github",
            label: "github.com/drshtmstry",
        },
    ];

    const renderSocials = () => {
        // Vertical sidebar only: icon-only links
        document.querySelectorAll('[data-socials="vertical"]').forEach(container => {
            container.innerHTML = SOCIALS.map(s =>
                `<a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}"><i class="${s.icon}"></i></a>`
            ).join("");
        });

        // Contact section: full cards
        document.querySelectorAll('[data-socials="contact"]').forEach(container => {
            container.innerHTML = SOCIALS.map(s =>
                `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="connect-card">
                    <div class="connect-icon"><i class="${s.icon}"></i></div>
                    <div class="connect-details">
                        <h3>${s.name}</h3>
                        <p>${s.label}</p>
                    </div>
                </a>`
            ).join("");
        });
    };

    renderSocials();

    const sectionColors = {
        about: { hex: '#3b82f6', rgb: '59, 130, 246' },      // Electric Blue (1st)
        skills: { hex: '#ec4899', rgb: '236, 72, 153' },     // Pink
        resume: { hex: '#14b8a6', rgb: '20, 184, 166' },     // Teal
        portfolio: { hex: '#8b5cf6', rgb: '139, 92, 246' },  // Purple (Projects)
        contact: { hex: '#00b87c', rgb: '0, 184, 124' }      // Emerald
    };

    // --- 6. SCROLL ORBIT FOR HERO DOTS ---
    const dotsContainer = document.querySelector(".image-open-container");
    let orbitRafId = null;

    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll(".floating-dot-wrapper");
        const baseAngles = [0, 120, 240];

        const updateOrbit = () => {
            const scrollTop = window.scrollY;
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

                    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                }
            });
        };

        const handleOrbitScroll = () => {
            if (orbitRafId) cancelAnimationFrame(orbitRafId);
            orbitRafId = requestAnimationFrame(updateOrbit);
        };

        addEventListenerWithCleanup(window, "scroll", handleOrbitScroll, { passive: true });
        addEventListenerWithCleanup(window, "resize", updateOrbit, { passive: true });
        updateOrbit(); // Initial position setup
    }

    // --- 7. ACTIVE NAV LINK TRACKING ---
    const navLinks = document.querySelectorAll(".nav-item[data-section], .mobile-nav-item[data-section]");
    const sections = document.querySelectorAll("section[id]");

    const updateActiveNav = throttle(() => {
        let currentSection = null;
        const scrollPosition = window.scrollY + 80; // Offset for header height

        sections.forEach(section => {
            if (section.offsetTop <= scrollPosition && section.offsetTop + section.offsetHeight > scrollPosition) {
                currentSection = section.getAttribute("id");
            }
        });

        if (currentSection && sectionColors[currentSection]) {
            const color = sectionColors[currentSection];
            docElement.style.setProperty('--primary', color.hex);
            docElement.style.setProperty('--primary-rgb', color.rgb);
        }

        navLinks.forEach(link => {
            if (link.getAttribute("data-section") === currentSection) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        const indicatorDots = document.querySelectorAll(".indicator-dot[data-section]");
        indicatorDots.forEach(dot => {
            if (dot.getAttribute("data-section") === currentSection) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }, 100);

    addEventListenerWithCleanup(window, "scroll", updateActiveNav, { passive: true });
    updateActiveNav(); // Initial call

    // --- 8. CARD TILT EFFECT (3D Perspective) + CONNECT CARD RADIAL GRADIENT ---
    const cards = document.querySelectorAll(".skill-card, .connect-card");

    cards.forEach(card => {
        const isConnectCard = card.classList.contains("connect-card");

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 5;
            const rotateY = ((centerX - x) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            if (isConnectCard) {
                card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
                card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
            }
        };

        const handleMouseLeave = () => {
            card.style.transform = "";
            if (isConnectCard) {
                card.style.setProperty("--mouse-x", "50%");
                card.style.setProperty("--mouse-y", "50%");
            }
        };

        addEventListenerWithCleanup(card, "mousemove", handleMouseMove, false);
        addEventListenerWithCleanup(card, "mouseleave", handleMouseLeave, false);
    });

    // --- 9. SMOOTH SCROLL FOR INTERNALS & ANIMATION SYNC ---
    const handleAnchorClick = (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute("href");
        if (targetId === "#") return;

        let targetElement;
        try {
            targetElement = document.querySelector(targetId);
        } catch (e) {
            return;
        }
        if (!targetElement) return;

        event.preventDefault();

        const startY = window.scrollY;
        const targetRect = targetElement.getBoundingClientRect();
        const targetTop = targetRect.top + startY;
        const targetY = targetTop - 64; // Header offset
        const totalDistance = Math.abs(targetY - startY);
        
        // If we are already extremely close, just update URL hash and activate immediately
        if (totalDistance < 10) {
            if (history.pushState) {
                history.pushState(null, null, targetId);
            } else {
                location.hash = targetId;
            }
            
            // Activate target section elements immediately
            const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-stagger';
            if (targetElement.matches(selectors)) {
                targetElement.classList.add('active');
            }
            targetElement.querySelectorAll(selectors).forEach(el => {
                el.classList.add('active');
            });
            return;
        }

        // Cancel any active scroll finalization from previous link clicks
        if (activeScrollCleanup) {
            activeScrollCleanup();
        }

        // Set scrolling flag and add layout override class
        isNavScrolling = true;
        navTargetSectionId = targetId;
        docElement.classList.add("nav-scrolling");

        // Scroll smoothly to target element
        targetElement.scrollIntoView({ behavior: 'smooth' });

        // Update URL hash without jumping
        if (history.pushState) {
            history.pushState(null, null, targetId);
        } else {
            location.hash = targetId;
        }

        let scrollTimeout = null;

        const cleanupScroll = () => {
            window.removeEventListener("scroll", onScrollFallback);
            window.removeEventListener("scrollend", onScrollEndEvent);
            clearTimeout(scrollTimeout);
            docElement.classList.remove("nav-scrolling");
            activeScrollCleanup = null;
        };

        activeScrollCleanup = cleanupScroll;

        const finalizeScroll = () => {
            cleanupScroll();
            isNavScrolling = false;
            navTargetSectionId = null;

            // Activate target section elements after landing
            const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-stagger';
            if (targetElement.matches(selectors)) {
                targetElement.classList.add('active');
            }
            targetElement.querySelectorAll(selectors).forEach(el => {
                el.classList.add('active');
            });
        };

        const onScrollFallback = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(finalizeScroll, 100);
        };

        const onScrollEndEvent = () => {
            finalizeScroll();
        };

        if ("onscrollend" in window) {
            window.addEventListener("scrollend", onScrollEndEvent);
        }
        
        window.addEventListener("scroll", onScrollFallback);
        // Safety timeout in case scroll doesn't happen or handles weirdly
        scrollTimeout = setTimeout(finalizeScroll, 1500);
    };

    // Register anchor click listener (covers all internal link navigations, navbar, drawer, buttons, dots)
    addEventListenerWithCleanup(document, "click", handleAnchorClick);

    // --- 10. PARALLAX EFFECT FOR DECORATIVE ELEMENTS ---
    const decorDots = document.querySelectorAll(".decor-dots");
    let rafId = null;
    const updateParallax = () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        decorDots.forEach(dot => {
            const parentSection = dot.closest("section");
            if (!parentSection) return;
            const sectionTop = parentSection.offsetTop;
            const sectionHeight = parentSection.offsetHeight;
            
            // Adjust speed: dots-left moves a bit more than dots-right
            const speed = dot.classList.contains("dots-left") ? 0.25 : 0.15;
            
            // Calculate how far the section center is from the viewport center
            const sectionCenter = sectionTop + sectionHeight / 2;
            const viewportCenter = scrollY + viewportHeight / 2;
            const relativeScroll = viewportCenter - sectionCenter;
            
            // Hardware accelerated 3D transform relative to viewport position
            dot.style.transform = `translate3d(0, ${relativeScroll * speed}px, 0)`;
        });
    };

    const handleParallaxScroll = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateParallax);
    };

    addEventListenerWithCleanup(window, "scroll", handleParallaxScroll, { passive: true });
    addEventListenerWithCleanup(window, "resize", updateParallax, { passive: true });
    updateParallax(); // Initial position setup

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (orbitRafId) cancelAnimationFrame(orbitRafId);
        cleanup();
    });
});