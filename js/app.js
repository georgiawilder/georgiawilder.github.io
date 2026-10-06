/**
 * Georgia Essig Personal Portfolio - App Controller
 * Manages tab switching, typing effect, and launches the Connections game.
 */

class AppController {
    constructor() {
        this.tabs = null;
        this.panels = null;
        this.yearSpan = null;
        this.typedGreeting = null;
        this.typingCursor = null;
    }

    init() {
        this.cacheElements();
        this.setupTabs();
        this.setupFooterYear();
        this.setupTypingEffect();
        
        // Launch Connections game on load
        if (window.Connections) {
            window.Connections.init();
        }
    }

    cacheElements() {
        this.tabs = document.querySelectorAll('.nav-tab');
        this.panels = document.querySelectorAll('.tab-panel');
        this.yearSpan = document.getElementById('year');
        this.typedGreeting = document.getElementById('typed-greeting');
        this.typingCursor = document.getElementById('typing-cursor');
    }

    setupTabs() {
        if (!this.tabs || !this.panels) return;

        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTabName = tab.getAttribute('data-tab');
                
                // Update active state on tab buttons
                this.tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Update active state on panels
                this.panels.forEach(panel => {
                    if (panel.id === `tab-${targetTabName}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });
    }

    setupTypingEffect() {
        if (!this.typedGreeting) return;

        const textToType = "Hi, I'm Georgia.";
        let charIndex = 0;
        const typingSpeed = 100; // ms per character

        const type = () => {
            if (charIndex < textToType.length) {
                this.typedGreeting.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(type, typingSpeed);
            } else {
                // Fade out cursor when typing is done
                if (this.typingCursor) {
                    this.typingCursor.style.animation = 'none';
                    this.typingCursor.style.opacity = '0';
                    setTimeout(() => {
                        this.typingCursor.style.display = 'none';
                    }, 300);
                }
            }
        };

        // Clear initial text in case of fast reload
        this.typedGreeting.textContent = "";
        setTimeout(type, 500); // Small initial delay
    }

    setupFooterYear() {
        if (this.yearSpan) {
            this.yearSpan.textContent = new Date().getFullYear();
        }
    }
}

// Launch application controller on page load
window.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
    window.App = app;
});
