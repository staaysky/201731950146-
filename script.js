// 博客交互功能和主题切换
class TechBlog {
    constructor() {
        this.currentTheme = 'cyber';
        this.themes = ['cyber', 'minimal', 'neon'];
        this.init();
    }

    init() {
        this.setupThemeSwitcher();
        this.setupNavigation();
        this.setupSmoothScrolling();
        this.setupAnimations();
        this.setupInteractiveElements();
        this.setupParallaxEffect();
        this.createFloatingParticles();
    }

    // 主题切换功能
    setupThemeSwitcher() {
        const themeBtn = document.getElementById('theme-btn');
        const themeIcon = themeBtn.querySelector('.theme-icon');
        
        themeBtn.addEventListener('click', () => {
            this.switchTheme();
        });

        // 从本地存储加载主题
        const savedTheme = localStorage.getItem('blog-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    switchTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const nextTheme = this.themes[nextIndex];
        
        this.setTheme(nextTheme);
    }

    setTheme(theme) {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        // 移除所有主题类
        body.classList.remove('cyber-theme', 'minimal-theme', 'neon-theme');
        
        // 添加新主题类
        if (theme === 'minimal') {
            body.classList.add('minimal-theme');
            themeIcon.textContent = '☀️';
        } else if (theme === 'neon') {
            body.classList.add('neon-theme');
            themeIcon.textContent = '✨';
        } else {
            body.classList.add('cyber-theme');
            themeIcon.textContent = '🌙';
        }
        
        this.currentTheme = theme;
        localStorage.setItem('blog-theme', theme);
        
        // 添加切换动画
        body.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 500);
    }

    // 导航功能
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    this.scrollToSection(targetSection);
                    this.updateActiveNavLink(link);
                }
            });
        });

        // 滚动时更新活动导航链接
        window.addEventListener('scroll', () => {
            this.updateActiveNavOnScroll();
        });
    }

    scrollToSection(section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = section.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const scrollPosition = window.scrollY + navHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // 平滑滚动
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 动画效果
    setupAnimations() {
        // 元素进入视口时的动画
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

        // 观察需要动画的元素
        document.querySelectorAll('.article-card, .project-card, .skill-category').forEach(el => {
            observer.observe(el);
        });
    }

    // 交互元素
    setupInteractiveElements() {
        // 文章卡片悬停效果
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });

        // 项目卡片点击效果
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                this.addClickEffect(card);
            });
        });

        // 按钮点击效果
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });
        });
    }

    addHoverEffect(element) {
        element.style.transform = 'translateY(-10px) scale(1.02)';
        element.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.3)';
    }

    removeHoverEffect(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
    }

    addClickEffect(element) {
        element.style.transform = 'scale(0.98)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }

    createRippleEffect(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // 视差效果
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-background');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // 创建浮动粒子效果
    createFloatingParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle(particlesContainer);
            }, i * 200);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机大小和位置
        const size = Math.random() * 4 + 2;
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.background = getComputedStyle(document.body)
            .getPropertyValue('--current-primary').trim();
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        particle.style.opacity = '0.6';
        particle.style.boxShadow = `0 0 ${size * 2}px ${getComputedStyle(document.body)
            .getPropertyValue('--current-primary').trim()}`;
        
        container.appendChild(particle);
        
        // 动画
        this.animateParticle(particle);
    }

    animateParticle(particle) {
        const duration = Math.random() * 10000 + 10000;
        const keyframes = [
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 0.6
            },
            {
                transform: `translate(${Math.random() * 200 - 100}px, ${-Math.random() * 200 - 100}px) scale(0.5)`,
                opacity: 0
            }
        ];

        particle.animate(keyframes, {
            duration: duration,
            easing: 'ease-out',
            iterations: 1
        }).onfinish = () => {
            particle.remove();
            // 创建新粒子
            const container = document.querySelector('.floating-particles');
            if (container) {
                setTimeout(() => {
                    this.createParticle(container);
                }, Math.random() * 2000);
            }
        };
    }

    // 打字机效果
    typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // 代码高亮效果
    highlightCode() {
        const codeBlocks = document.querySelectorAll('.code-content');
        
        codeBlocks.forEach(block => {
            const code = block.textContent;
            const lines = code.split('\n');
            
            block.innerHTML = lines.map((line, index) => {
                const highlighted = this.highlightLine(line);
                return `<div class="code-line" data-line="${index + 1}">${highlighted}</div>`;
            }).join('');
        });
    }

    highlightLine(line) {
        // 简单的语法高亮
        return line
            .replace(/\b(const|let|var|function|return|if|else|for|while)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null|undefined)\b/g, '<span class="boolean">$1</span>')
            .replace(/\b\d+\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$&</span>')
            .replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
    }
}

// 添加CSS动画样式
const additionalStyles = `
    .animate-in {
        animation: fadeInUp 0.8s ease forwards;
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

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .code-line {
        display: block;
        padding: 0.125rem 0;
        transition: background-color 0.2s ease;
    }

    .code-line:hover {
        background-color: rgba(0, 212, 255, 0.1);
    }

    .keyword { color: #ff79c6; }
    .string { color: #f1fa8c; }
    .number { color: #bd93f9; }
    .boolean { color: #ff79c6; }
    .comment { color: #6272a4; font-style: italic; }

    /* 导航栏滚动效果 */
    .navbar.scrolled {
        background: rgba(10, 10, 15, 0.98);
        backdrop-filter: blur(20px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    /* 加载动画 */
    .loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--current-bg);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    }

    .loading.hide {
        opacity: 0;
        pointer-events: none;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid var(--current-border);
        border-top: 3px solid var(--current-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建加载屏幕
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading';
    loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingScreen);

    // 初始化博客
    setTimeout(() => {
        const blog = new TechBlog();
        
        // 隐藏加载屏幕
        loadingScreen.classList.add('hide');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);

        // 添加导航栏滚动效果
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // 代码高亮
        blog.highlightCode();

        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            // T 键切换主题
            if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    blog.switchTheme();
                }
            }
        });

        console.log('🚀 TechVista 博客已加载完成');
        console.log('💡 提示：按 T 键可以快速切换主题');
    }, 1000);
});

// 性能优化：使用 requestAnimationFrame 进行节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            requestAnimationFrame(() => inThrottle = false);
        }
    };
}

// 优化滚动事件
window.addEventListener('scroll', throttle(() => {
    // 滚动相关的优化处理
}, 16)); // 约 60fps