// 轮播图功能
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    // 隐藏所有幻灯片
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // 显示当前幻灯片
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

function changeSlide(direction) {
    if (direction === 1) {
        nextSlide();
    } else {
        prevSlide();
    }
}

function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
}

// 自动轮播
function startAutoSlide() {
    setInterval(nextSlide, 5000); // 每5秒切换一次
}

// 音乐播放器功能
class MusicPlayer {
    constructor() {
        this.tracks = [
            {
                title: '梦幻音乐之旅',
                artist: '未知艺术家',
                duration: '3:45',
                cover: 'https://picsum.photos/seed/album1/300/300.jpg'
            },
            {
                title: '星空下的旋律',
                artist: '夜空乐团',
                duration: '4:12',
                cover: 'https://picsum.photos/seed/album2/300/300.jpg'
            },
            {
                title: '雨后彩虹',
                artist: '自然之声',
                duration: '3:28',
                cover: 'https://picsum.photos/seed/album3/300/300.jpg'
            },
            {
                title: '城市节奏',
                artist: '都市节拍',
                duration: '4:05',
                cover: 'https://picsum.photos/seed/album4/300/300.jpg'
            },
            {
                title: '心灵之旅',
                artist: '冥想音乐团',
                duration: '5:30',
                cover: 'https://picsum.photos/seed/album5/300/300.jpg'
            }
        ];
        
        this.currentTrack = 0;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 225; // 默认时长（秒）
        this.volume = 70;
        this.isRepeat = false;
        this.isShuffle = false;
        this.timer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTrackInfo();
        this.updatePlaylist();
        this.startVisualizerAnimation();
    }
    
    setupEventListeners() {
        // 播放/暂停按钮
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // 上一曲/下一曲按钮
        document.getElementById('prev-btn').addEventListener('click', () => this.playPrevious());
        document.getElementById('next-btn').addEventListener('click', () => this.playNext());
        
        // 进度条
        const progressBar = document.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        // 音量控制
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 重复和随机播放
        document.getElementById('repeat-btn').addEventListener('click', () => this.toggleRepeat());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        
        // 播放列表点击
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach(item => {
            item.addEventListener('click', () => {
                const trackIndex = parseInt(item.dataset.track);
                this.playTrack(trackIndex);
            });
        });
    }
    
    togglePlayPause() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const icon = playPauseBtn.querySelector('i');
        
        if (this.isPlaying) {
            this.pause();
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        } else {
            this.play();
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
    }
    
    play() {
        this.isPlaying = true;
        this.startTimer();
        this.animateVisualizer(true);
    }
    
    pause() {
        this.isPlaying = false;
        this.stopTimer();
        this.animateVisualizer(false);
    }
    
    playNext() {
        if (this.isShuffle) {
            this.currentTrack = Math.floor(Math.random() * this.tracks.length);
        } else {
            this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        }
        this.loadTrack();
    }
    
    playPrevious() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack();
    }
    
    playTrack(index) {
        this.currentTrack = index;
        this.loadTrack();
    }
    
    loadTrack() {
        this.currentTime = 0;
        this.updateTrackInfo();
        this.updatePlaylist();
        this.updateProgress();
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    updateTrackInfo() {
        const track = this.tracks[this.currentTrack];
        document.getElementById('track-title').textContent = track.title;
        document.getElementById('track-artist').textContent = track.artist;
        document.getElementById('album-cover').src = track.cover;
        document.getElementById('total-time').textContent = track.duration;
        
        // 解析时长
        const [minutes, seconds] = track.duration.split(':').map(Number);
        this.duration = minutes * 60 + seconds;
    }
    
    updatePlaylist() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            if (index === this.currentTrack) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.currentTime++;
            this.updateProgress();
            
            if (this.currentTime >= this.duration) {
                this.handleTrackEnd();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateProgress() {
        const progress = (this.currentTime / this.duration) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
        
        const currentMinutes = Math.floor(this.currentTime / 60);
        const currentSeconds = this.currentTime % 60;
        document.getElementById('current-time').textContent = 
            `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }
    
    seekTo(event) {
        const progressBar = event.currentTarget;
        const clickX = event.offsetX;
        const width = progressBar.offsetWidth;
        const percentage = clickX / width;
        
        this.currentTime = Math.floor(this.duration * percentage);
        this.updateProgress();
    }
    
    setVolume(value) {
        this.volume = value;
        // 在实际应用中，这里会控制音频音量
    }
    
    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const repeatBtn = document.getElementById('repeat-btn');
        repeatBtn.style.color = this.isRepeat ? '#667eea' : '';
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const shuffleBtn = document.getElementById('shuffle-btn');
        shuffleBtn.style.color = this.isShuffle ? '#667eea' : '';
    }
    
    handleTrackEnd() {
        if (this.isRepeat) {
            this.currentTime = 0;
            this.updateProgress();
        } else {
            this.playNext();
        }
    }
    
    startVisualizerAnimation() {
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            bar.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    animateVisualizer(animate) {
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            if (animate) {
                bar.style.animationPlayState = 'running';
            } else {
                bar.style.animationPlayState = 'paused';
            }
        });
    }
}

// 平滑滚动
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // 考虑固定导航栏高度
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 导航栏滚动效果
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // 向下滚动 - 隐藏导航栏
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动 - 显示导航栏
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// 图片懒加载
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 图库灯箱效果
function setupGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const lightbox = createLightbox(img.src);
            document.body.appendChild(lightbox);
        });
    });
}

function createLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${imageSrc}" alt="放大图片">
        </div>
    `;
    
    // 添加样式
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const content = lightbox.querySelector('.lightbox-content');
    content.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
    `;
    
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        background: none;
        border: none;
    `;
    
    const img = lightbox.querySelector('img');
    img.style.cssText = `
        width: 100%;
        height: auto;
        border-radius: 10px;
    `;
    
    // 事件处理
    closeBtn.addEventListener('click', () => {
        lightbox.style.opacity = '0';
        setTimeout(() => document.body.removeChild(lightbox), 300);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.opacity = '0';
            setTimeout(() => document.body.removeChild(lightbox), 300);
        }
    });
    
    // 显示动画
    setTimeout(() => lightbox.style.opacity = '1', 10);
    
    return lightbox;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 启动轮播
    startAutoSlide();
    
    // 初始化音乐播放器
    const musicPlayer = new MusicPlayer();
    
    // 设置平滑滚动
    setupSmoothScrolling();
    
    // 设置导航栏滚动效果
    setupNavbarScroll();
    
    // 设置图片懒加载
    setupLazyLoading();
    
    // 设置图库灯箱效果
    setupGalleryLightbox();
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// 响应式菜单（如果需要）
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// 添加滚动显示动画
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.blog-card, .gallery-item, .about-text');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 初始化滚动动画
document.addEventListener('DOMContentLoaded', setupScrollAnimations);