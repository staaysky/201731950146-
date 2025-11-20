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

function currentSlideFunc(index) {
    currentSlide = index - 1;
    showSlide(currentSlide);
}

// 自动轮播
let slideInterval = setInterval(nextSlide, 5000);

// 鼠标悬停时暂停自动轮播
const carousel = document.querySelector('.carousel-container');
carousel.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

carousel.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
});

// 音乐播放器功能
class MusicPlayer {
    constructor() {
        this.songs = [
            {
                title: '夏日微风',
                artist: '未知艺术家',
                duration: '3:45',
                cover: 'https://picsum.photos/seed/album1/300/300.jpg'
            },
            {
                title: '星空漫步',
                artist: '梦幻乐队',
                duration: '4:12',
                cover: 'https://picsum.photos/seed/album2/300/300.jpg'
            },
            {
                title: '雨后彩虹',
                artist: '自然之声',
                duration: '3:28',
                cover: 'https://picsum.photos/seed/album3/300/300.jpg'
            }
        ];
        
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 225; // 默认3:45，以秒为单位
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePlayerUI();
        this.loadSong(this.currentSongIndex);
    }

    setupEventListeners() {
        // 播放/暂停按钮
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        // 上一首/下一首按钮
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.prevSong();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextSong();
        });

        // 进度条
        const progressBar = document.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seekTo(percent);
        });

        // 音量控制
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // 播放列表
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach(item => {
            item.addEventListener('click', () => {
                const songIndex = parseInt(item.dataset.song);
                this.loadSong(songIndex);
                this.play();
            });
        });
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        // 模拟播放进度
        this.startProgressSimulation();
    }

    pause() {
        this.isPlaying = false;
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        // 停止进度模拟
        this.stopProgressSimulation();
    }

    prevSong() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    loadSong(index) {
        this.currentSongIndex = index;
        const song = this.songs[index];
        
        // 更新播放器UI
        document.getElementById('song-title').textContent = song.title;
        document.getElementById('artist-name').textContent = song.artist;
        document.getElementById('album-cover').src = song.cover;
        document.getElementById('total-time').textContent = song.duration;
        
        // 重置进度
        this.currentTime = 0;
        this.updateProgress();
        
        // 更新播放列表高亮
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    seekTo(percent) {
        this.currentTime = this.duration * percent;
        this.updateProgress();
    }

    setVolume(value) {
        // 这里可以实际控制音量
        console.log('音量设置为:', value);
    }

    updateProgress() {
        const percent = (this.currentTime / this.duration) * 100;
        document.getElementById('progress').style.width = percent + '%';
        
        // 更新时间显示
        const currentMinutes = Math.floor(this.currentTime / 60);
        const currentSeconds = Math.floor(this.currentTime % 60);
        document.getElementById('current-time').textContent = 
            `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }

    updatePlayerUI() {
        // 初始化播放器UI
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    startProgressSimulation() {
        // 清除之前的定时器
        this.stopProgressSimulation();
        
        // 模拟播放进度
        this.progressInterval = setInterval(() => {
            if (this.currentTime < this.duration) {
                this.currentTime += 0.1;
                this.updateProgress();
            } else {
                // 歌曲播放结束，播放下一首
                this.nextSong();
            }
        }, 100);
    }

    stopProgressSimulation() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
}

// 平滑滚动
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

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化轮播图
    showSlide(0);
    
    // 初始化音乐播放器
    const musicPlayer = new MusicPlayer();
    
    // 添加页面加载动画
    const elements = document.querySelectorAll('.blog-card, .music-player, .playlist');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
});

// 添加淡入动画
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);