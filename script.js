// 动图轮播功能
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.currentSlide = 0;
        this.slideInterval = null;
        
        this.init();
    }
    
    init() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.startAutoPlay();
        
        // 鼠标悬停时暂停自动播放
        const carousel = document.querySelector('.carousel-container');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    updateSlides() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlides();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlides();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlides();
    }
    
    startAutoPlay() {
        this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    }
    
    stopAutoPlay() {
        clearInterval(this.slideInterval);
    }
}

// 音乐播放器功能
class MusicPlayer {
    constructor() {
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevTrackBtn = document.querySelector('.prev-track-btn');
        this.nextTrackBtn = document.querySelector('.next-track-btn');
        this.shuffleBtn = document.querySelector('.shuffle-btn');
        this.repeatBtn = document.querySelector('.repeat-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progress = document.getElementById('progress');
        this.currentTimeEl = document.getElementById('current-time');
        this.totalTimeEl = document.getElementById('total-time');
        this.volumeSlider = document.getElementById('volume-slider');
        this.trackTitle = document.getElementById('track-title');
        this.trackArtist = document.getElementById('track-artist');
        this.albumImg = document.getElementById('album-img');
        
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 225; // 3:45 in seconds
        this.volume = 0.7;
        this.isRepeat = false;
        this.isShuffle = false;
        
        this.tracks = [
            {
                title: '夏日微风',
                artist: '轻音乐团',
                image: 'https://picsum.photos/seed/album1/300/300.jpg',
                duration: 225
            },
            {
                title: '星空漫步',
                artist: '梦想乐队',
                image: 'https://picsum.photos/seed/album2/300/300.jpg',
                duration: 198
            },
            {
                title: '雨后彩虹',
                artist: '自然之声',
                image: 'https://picsum.photos/seed/album3/300/300.jpg',
                duration: 267
            },
            {
                title: '城市霓虹',
                artist: '电子音乐组',
                image: 'https://picsum.photos/seed/album4/300/300.jpg',
                duration: 312
            },
            {
                title: '山间清泉',
                artist: '新世纪乐团',
                image: 'https://picsum.photos/seed/album5/300/300.jpg',
                duration: 189
            }
        ];
        
        this.currentTrackIndex = 0;
        
        this.init();
    }
    
    init() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevTrackBtn.addEventListener('click', () => this.prevTrack());
        this.nextTrackBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        this.loadTrack(this.currentTrackIndex);
        this.updateVisualizer();
    }
    
    loadTrack(index) {
        const track = this.tracks[index];
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist;
        this.albumImg.src = track.image;
        this.duration = track.duration;
        this.currentTime = 0;
        this.updateTimeDisplay();
        this.updateProgress();
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const icon = this.playPauseBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            this.startPlayback();
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            this.stopPlayback();
        }
    }
    
    startPlayback() {
        this.playbackInterval = setInterval(() => {
            this.currentTime++;
            this.updateTimeDisplay();
            this.updateProgress();
            
            if (this.currentTime >= this.duration) {
                this.handleTrackEnd();
            }
        }, 1000);
    }
    
    stopPlayback() {
        clearInterval(this.playbackInterval);
    }
    
    handleTrackEnd() {
        if (this.isRepeat) {
            this.currentTime = 0;
            this.updateTimeDisplay();
            this.updateProgress();
        } else {
            this.nextTrack();
        }
    }
    
    prevTrack() {
        this.currentTrackIndex = this.currentTrackIndex > 0 ? 
            this.currentTrackIndex - 1 : this.tracks.length - 1;
        this.loadTrack(this.currentTrackIndex);
        
        if (this.isPlaying) {
            this.stopPlayback();
            this.startPlayback();
        }
    }
    
    nextTrack() {
        if (this.isShuffle) {
            this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        this.loadTrack(this.currentTrackIndex);
        
        if (this.isPlaying) {
            this.stopPlayback();
            this.startPlayback();
        }
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn.style.color = this.isShuffle ? '#e74c3c' : '#333';
    }
    
    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        this.repeatBtn.style.color = this.isRepeat ? '#e74c3c' : '#333';
    }
    
    seekTo(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.currentTime = Math.floor(this.duration * percent);
        this.updateTimeDisplay();
        this.updateProgress();
    }
    
    setVolume(value) {
        this.volume = value / 100;
    }
    
    updateTimeDisplay() {
        this.currentTimeEl.textContent = this.formatTime(this.currentTime);
        this.totalTimeEl.textContent = this.formatTime(this.duration);
    }
    
    updateProgress() {
        const percent = (this.currentTime / this.duration) * 100;
        this.progress.style.width = `${percent}%`;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateVisualizer() {
        const bars = document.querySelectorAll('.player-visualizer .bar');
        bars.forEach(bar => {
            if (this.isPlaying) {
                bar.style.animationPlayState = 'running';
            } else {
                bar.style.animationPlayState = 'paused';
            }
        });
    }
}

// 平滑滚动
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 导航栏滚动效果
function navbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// 页面加载动画
function pageLoadAnimation() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.blog-card').forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
    new MusicPlayer();
    smoothScroll();
    navbarScroll();
    pageLoadAnimation();
    
    // 添加页面可见性API支持，当页面不可见时暂停轮播
    document.addEventListener('visibilitychange', () => {
        const carousel = document.querySelector('.carousel-container');
        if (document.hidden) {
            carousel.dispatchEvent(new Event('mouseenter'));
        } else {
            carousel.dispatchEvent(new Event('mouseleave'));
        }
    });
});