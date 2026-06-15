document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Mobile Navigation Menu
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpened = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isOpened);
            navMenu.classList.toggle('open');
        });

        // Close menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('open');
                
                // Active link style update
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    /* ==========================================================================
       Sticky Header and Active Link on Scroll
       ========================================================================== */
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        // Sticky Header class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link based on scroll position
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initially

    /* ==========================================================================
       Scroll Reveal Animations (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       Fundraising Campaign & Donation Simulator
       ========================================================================== */
    const targetAmount = 6500; // USD
    const baseRaised = 2850;   // USD
    let currentRaised = 0;     // Starts at 0 for animation

    const progressPercentText = document.getElementById('progress-percent');
    const currentRaisedText = document.getElementById('current-raised');
    const currentRaisedUsdText = document.getElementById('current-raised-usd');
    const remainingAmountText = document.getElementById('remaining-amount');
    const progressBar = document.getElementById('progress-bar');
    const progressBarPreview = document.getElementById('progress-bar-preview');

    const simButtons = document.querySelectorAll('.sim-btn');
    const feedbackBox = document.getElementById('simulator-feedback');
    const feedbackTitle = document.getElementById('feedback-sum-title');
    const feedbackDesc = document.getElementById('feedback-sum-desc');
    
    let activeSimulationAmount = 0;

    // Format utility
    const formatUSD = (val) => {
        return '$' + Math.round(val).toLocaleString('es-AR');
    };

    // Update Campaign Dashboard UI
    const updateDashboard = (raisedVal, previewVal = null) => {
        const displayVal = previewVal !== null ? (raisedVal + previewVal) : raisedVal;
        const pct = (displayVal / targetAmount * 100).toFixed(1);
        
        progressPercentText.textContent = pct + '%';
        currentRaisedText.textContent = formatUSD(displayVal);
        currentRaisedUsdText.textContent = formatUSD(displayVal) + ' USD';
        
        const remaining = Math.max(0, targetAmount - displayVal);
        remainingAmountText.textContent = formatUSD(remaining) + ' USD';

        // Update main bar width
        const mainBarPct = (raisedVal / targetAmount * 100);
        progressBar.style.width = mainBarPct + '%';

        // Update preview bar width
        if (previewVal !== null && previewVal > 0) {
            const previewBarPct = (displayVal / targetAmount * 100);
            progressBarPreview.style.width = previewBarPct + '%';
            progressBarPreview.style.display = 'block';
        } else {
            progressBarPreview.style.width = mainBarPct + '%';
        }
    };

    // Animate base funding numbers on load/scroll
    let animationStarted = false;
    const animateCounter = () => {
        if (animationStarted) return;
        animationStarted = true;

        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function: easeOutQuad
            const easeProgress = progress * (2 - progress);
            currentRaised = baseRaised * easeProgress;
            
            updateDashboard(currentRaised);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                currentRaised = baseRaised;
                updateDashboard(currentRaised);
            }
        };

        requestAnimationFrame(step);
    };

    // Trigger animation when campaign section enters screen
    const campaignSection = document.getElementById('campana');
    if (campaignSection) {
        const campaignObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounter();
                campaignObserver.unobserve(campaignSection);
            }
        }, { threshold: 0.15 });

        campaignObserver.observe(campaignSection);
    } else {
        // Fallback
        animateCounter();
    }

    // Simulator Interactive Buttons
    simButtons.forEach(btn => {
        const amount = parseFloat(btn.getAttribute('data-amount'));
        const description = btn.getAttribute('data-desc');
        const label = btn.querySelector('.sim-btn-label').textContent;

        const setSimulationActive = (isActive) => {
            if (isActive) {
                // Deactivate others
                simButtons.forEach(b => b.classList.remove('active'));
                
                btn.classList.add('active');
                activeSimulationAmount = amount;
                
                feedbackBox.classList.add('simulated');
                feedbackTitle.textContent = `Sumando aporte para: ${label}`;
                feedbackDesc.textContent = description;

                // Preview bar growth
                updateDashboard(baseRaised, amount);
            } else {
                btn.classList.remove('active');
                activeSimulationAmount = 0;
                
                feedbackBox.classList.remove('simulated');
                feedbackTitle.textContent = "Simulá tu aporte";
                feedbackDesc.textContent = "Seleccioná un monto arriba para ver el impacto en la meta.";

                // Reset preview bar to base
                updateDashboard(baseRaised, 0);
            }
        };

        // Click interaction toggles simulation
        btn.addEventListener('click', () => {
            const isCurrentlyActive = btn.classList.contains('active');
            setSimulationActive(!isCurrentlyActive);
        });

        // Hover interaction previews without committing
        btn.addEventListener('mouseenter', () => {
            if (activeSimulationAmount === 0) {
                updateDashboard(baseRaised, amount);
                feedbackBox.classList.add('simulated');
                feedbackTitle.textContent = `Aportando para: ${label} (Previsualización)`;
                feedbackDesc.textContent = description;
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (activeSimulationAmount === 0) {
                updateDashboard(baseRaised, 0);
                feedbackBox.classList.remove('simulated');
                feedbackTitle.textContent = "Simulá tu aporte";
                feedbackDesc.textContent = "Seleccioná un monto arriba para ver el impacto en la meta.";
            } else if (activeSimulationAmount !== amount) {
                // If another button is active, restore that one's state
                const activeBtn = Array.from(simButtons).find(b => b.classList.contains('active'));
                if (activeBtn) {
                    const activeAmount = parseFloat(activeBtn.getAttribute('data-amount'));
                    const activeDesc = activeBtn.getAttribute('data-desc');
                    const activeLabel = activeBtn.querySelector('.sim-btn-label').textContent;
                    
                    updateDashboard(baseRaised, activeAmount);
                    feedbackBox.classList.add('simulated');
                    feedbackTitle.textContent = `Sumando aporte para: ${activeLabel}`;
                    feedbackDesc.textContent = activeDesc;
                }
            }
        });
    });

    /* ==========================================================================
       Copy to Clipboard Utility
       ========================================================================== */
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(btn => {
        const textToCopy = btn.getAttribute('data-clipboard');
        const tooltip = btn.querySelector('.tooltip');
        const originalTooltipText = tooltip ? tooltip.textContent : 'Copiar';

        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Success visual state
                btn.classList.add('copied');
                if (tooltip) {
                    tooltip.textContent = '¡Copiado!';
                }

                // Reset after delay
                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (tooltip) {
                        tooltip.textContent = originalTooltipText;
                    }
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
            });
        });
    });

    /* ==========================================================================
       Sponsorship Tiers Scroll & Dropdown Binder
       ========================================================================== */
    const selectTierButtons = document.querySelectorAll('.select-tier');
    const contactDropdown = document.getElementById('tier-select');

    selectTierButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTier = btn.getAttribute('data-tier');
            
            if (contactDropdown) {
                contactDropdown.value = selectedTier;
            }
        });
    });

    /* ==========================================================================
       Contact Form Submission (Mock backend)
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const formToastSuccess = document.getElementById('formToastSuccess');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && formToastSuccess) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Set loading state
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Enviando...</span>
                <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s infinite linear;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"/>
                </svg>
            `;

            // Simulate server network latency
            setTimeout(() => {
                // Reset submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;

                // Hide Form and Show Success Toast
                contactForm.classList.add('hidden');
                formToastSuccess.style.display = 'flex';
                
                // Clear Form inputs
                contactForm.reset();

                // Optional: scroll slightly to center the success box
                const contactSection = document.getElementById('contacto');
                if (contactSection) {
                    window.scrollTo({
                        top: contactSection.offsetTop - 60,
                        behavior: 'smooth'
                    });
                }
            }, 1500);
        });
    }
});

// Inline keyframe spin animation for JS generated spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
