class TechBlog {
    constructor() {
        this.currentTheme = 'neon';
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.setupThemeSelector();
        this.setupNavigation();
        this.setupSmoothScrolling();
        this.setupContactForm();
        this.setupAnimations();
        this.setupScrollEffects();
        this.loadSavedTheme();
    }

    setupThemeSelector() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                this.switchTheme(theme);
                
                // Update active state
                themeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    switchTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('minimal', 'cyberpunk', 'nature');
        
        // Add new theme class if not neon (default)
        if (theme !== 'neon') {
            document.body.classList.add(theme);
        }
        
        this.currentTheme = theme;
        this.saveTheme(theme);
        
        // Add transition effect
        document.body.style.transition = 'all 0.5s ease';
        
        // Trigger theme change animation
        this.animateThemeChange();
    }

    animateThemeChange() {
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, transparent, rgba(0, 255, 255, 0.1));
            pointer-events: none;
            z-index: 9999;
            animation: themePulse 0.5s ease-out;
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 500);
    }

    saveTheme(theme) {
        localStorage.setItem('techblog-theme', theme);
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('techblog-theme');
        if (savedTheme && savedTheme !== 'neon') {
            this.switchTheme(savedTheme);
            
            // Update active button
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.theme === savedTheme) {
                    btn.classList.add('active');
                }
            });
        }
    }

    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        navToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        });
    }

    toggleMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            navMenu.classList.add('active');
            navToggle.classList.add('active');
        } else {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupContactForm() {
        const form = document.querySelector('.contact-form');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        }
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '发送中...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.showNotification('消息发送成功！我会尽快回复您。', 'success');
            form.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary);
            color: var(--bg);
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    setupAnimations() {
        // Add intersection observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe article cards and sections
        document.querySelectorAll('.article-card, .about-text, .contact-info').forEach(el => {
            observer.observe(el);
        });
    }

    setupScrollEffects() {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navbar = document.querySelector('.navbar');
            
            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
            
            // Update active navigation based on scroll position
            this.updateActiveNavigation();
        });
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Add typing effect to hero title
    setupTypingEffect() {
        const heroTitle = document.querySelector('.glitch');
        if (heroTitle) {
            const text = heroTitle.getAttribute('data-text');
            heroTitle.textContent = '';
            let index = 0;
            
            const typeWriter = () => {
                if (index < text.length) {
                    heroTitle.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            setTimeout(typeWriter, 1000);
        }
    }

    // Add particle effect for tech feel
    createParticleEffect() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        `;
        
        heroSection.appendChild(particlesContainer);
        
        // Create particles
        for (let i = 0; i < 30; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: var(--primary);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.2};
            animation: float ${Math.random() * 10 + 10}s linear infinite;
        `;
        
        container.appendChild(particle);
    }

    // Add code typing animation
    setupCodeAnimation() {
        const codeElement = document.querySelector('.code-animation code');
        if (!codeElement) return;
        
        const code = codeElement.textContent;
        codeElement.textContent = '';
        let index = 0;
        
        const typeCode = () => {
            if (index < code.length) {
                codeElement.textContent += code.charAt(index);
                index++;
                setTimeout(typeCode, 50);
            }
        };
        
        // Start typing when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeCode();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(codeElement);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes themePulse {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: scale(1.2); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(120deg); }
        66% { transform: translateY(10px) rotate(240deg); }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .nav-menu.active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--surface);
        flex-direction: column;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border-top: 1px solid var(--primary);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .nav-link.active {
        color: var(--primary);
    }
    
    .navbar {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize the blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const blog = new TechBlog();
    
    // Initialize special effects
    setTimeout(() => {
        blog.setupTypingEffect();
        blog.createParticleEffect();
        blog.setupCodeAnimation();
    }, 500);
});

// Add some interactive hover effects
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.article-card');
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;
        
        const angleX = (mouseY - cardY) / 30;
        const angleY = (cardX - mouseX) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
    });
});

// Reset card transform on mouse leave
document.addEventListener('mouseleave', () => {
    const cards = document.querySelectorAll('.article-card');
    cards.forEach(card => {
        card.style.transform = '';
    });
});