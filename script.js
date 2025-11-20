// 图片轮播功能
class ImageCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.autoPlayDelay = 5000; // 5秒自动切换
        
        this.init();
    }

    init() {
        this.createIndicators();
        this.attachEventListeners();
        this.startAutoPlay();
        this.showSlide(0);
    }

    createIndicators() {
        const indicatorsContainer = document.getElementById('carousel-indicators');
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
        this.indicators = document.querySelectorAll('.indicator');
    }

    attachEventListeners() {
        document.getElementById('prev-btn').addEventListener('click', () => this.prevSlide());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());
        
        // 鼠标悬停时暂停自动播放
        const carousel = document.querySelector('.carousel-container');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
        this.resetAutoPlay();
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.slideInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// 音乐播放器功能
class MusicPlayer {
    constructor() {
        this.songs = [
            {
                title: '梦想的旋律',
                artist: '未知艺术家',
                duration: '3:45',
                cover: 'https://picsum.photos/seed/album1/300/300.jpg'
            },
            {
                title: '星空下的约定',
                artist: '星光乐队',
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
                title: '城市节拍',
                artist: '都市节奏',
                duration: '3:56',
                cover: 'https://picsum.photos/seed/album4/300/300.jpg'
            }
        ];
        
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 225; // 默认3:45的秒数
        this.volume = 70;
        this.isRepeat = false;
        this.isShuffle = false;
        this.progressInterval = null;
        
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.loadSong(this.currentSongIndex);
        this.updateVolumeDisplay();
    }

    attachEventListeners() {
        // 播放/暂停按钮
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlay());
        
        // 上一首/下一首
        document.getElementById('prev-song-btn').addEventListener('click', () => this.prevSong());
        document.getElementById('next-song-btn').addEventListener('click', () => this.nextSong());
        
        // 进度条
        const progressBar = document.getElementById('progress-bar');
        progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        // 音量控制
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 重复和随机播放
        document.getElementById('repeat-btn').addEventListener('click', () => this.toggleRepeat());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        
        // 播放列表点击
        const songItems = document.querySelectorAll('.song-item');
        songItems.forEach(item => {
            item.addEventListener('click', () => {
                const songIndex = parseInt(item.dataset.song);
                this.playSong(songIndex);
            });
        });
    }

    loadSong(index) {
        const song = this.songs[index];
        document.getElementById('song-title').textContent = song.title;
        document.getElementById('artist-name').textContent = song.artist;
        document.getElementById('album-cover').src = song.cover;
        document.getElementById('total-time').textContent = song.duration;
        
        // 更新播放列表高亮
        document.querySelectorAll('.song-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        // 重置进度
        this.currentTime = 0;
        this.updateProgress();
        this.duration = this.parseDuration(song.duration);
    }

    parseDuration(durationStr) {
        const [minutes, seconds] = durationStr.split(':').map(Number);
        return minutes * 60 + seconds;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        const playBtn = document.getElementById('play-pause-btn');
        playBtn.textContent = '⏸️';
        
        const vinyl = document.getElementById('vinyl');
        vinyl.classList.add('playing');
        
        // 模拟播放进度
        this.progressInterval = setInterval(() => {
            this.currentTime += 0.1;
            if (this.currentTime >= this.duration) {
                this.songEnded();
            }
            this.updateProgress();
        }, 100);
    }

    pause() {
        this.isPlaying = false;
        const playBtn = document.getElementById('play-pause-btn');
        playBtn.textContent = '▶️';
        
        const vinyl = document.getElementById('vinyl');
        vinyl.classList.remove('playing');
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    songEnded() {
        this.pause();
        if (this.isRepeat) {
            this.play();
        } else {
            this.nextSong();
        }
    }

    nextSong() {
        if (this.isShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.songs.length);
            } while (nextIndex === this.currentSongIndex && this.songs.length > 1);
            this.playSong(nextIndex);
        } else {
            const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
            this.playSong(nextIndex);
        }
    }

    prevSong() {
        const prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.playSong(prevIndex);
    }

    playSong(index) {
        this.currentSongIndex = index;
        this.loadSong(index);
        if (this.isPlaying) {
            this.play();
        }
    }

    seekTo(event) {
        const progressBar = document.getElementById('progress-bar');
        const clickX = event.offsetX;
        const width = progressBar.offsetWidth;
        const percentage = clickX / width;
        this.currentTime = percentage * this.duration;
        this.updateProgress();
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        const percentage = (this.currentTime / this.duration) * 100;
        progress.style.width = `${percentage}%`;
        
        document.getElementById('current-time').textContent = this.formatTime(this.currentTime);
    }

    setVolume(value) {
        this.volume = value;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        // 这里可以添加音量图标的更新逻辑
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const repeatBtn = document.getElementById('repeat-btn');
        repeatBtn.style.opacity = this.isRepeat ? '1' : '0.5';
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const shuffleBtn = document.getElementById('shuffle-btn');
        shuffleBtn.style.opacity = this.isShuffle ? '1' : '0.5';
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

// 页面滚动效果
function scrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // 向下滚动 - 隐藏header
            header.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动 - 显示header
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    new ImageCarousel();
    new MusicPlayer();
    smoothScroll();
    scrollEffects();
});