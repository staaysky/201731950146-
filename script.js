class MusicPlayer {
    constructor() {
        this.songs = [
            {
                title: "夏日微风",
                artist: "轻音乐团",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                cover: "https://picsum.photos/seed/summer/300/300.jpg",
                duration: "4:35"
            },
            {
                title: "星空漫步",
                artist: "梦想乐队",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                cover: "https://picsum.photos/seed/stars/300/300.jpg",
                duration: "3:42"
            },
            {
                title: "雨后彩虹",
                artist: "自然之声",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                cover: "https://picsum.photos/seed/rainbow/300/300.jpg",
                duration: "5:18"
            },
            {
                title: "晨曦初现",
                artist: "黎明组合",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                cover: "https://picsum.photos/seed/dawn/300/300.jpg",
                duration: "4:02"
            },
            {
                title: "海浪轻语",
                artist: "海洋音乐",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
                cover: "https://picsum.photos/seed/ocean/300/300.jpg",
                duration: "3:56"
            }
        ];
        
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isRepeat = false;
        this.isShuffle = false;
        this.audio = new Audio();
        
        this.init();
    }

    init() {
        this.loadSong(this.currentSongIndex);
        this.renderPlaylist();
        this.attachEventListeners();
        this.updatePlayerDisplay();
    }

    loadSong(index) {
        const song = this.songs[index];
        this.audio.src = song.src;
        
        document.getElementById('song-title').textContent = song.title;
        document.getElementById('artist-name').textContent = song.artist;
        document.getElementById('album-cover').src = song.cover;
        
        this.updateActiveSong();
    }

    renderPlaylist() {
        const playlistElement = document.getElementById('playlist-songs');
        playlistElement.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            
            if (index === this.currentSongIndex) {
                li.classList.add('active');
            }
            
            li.innerHTML = `
                <span>${song.title} - ${song.artist}</span>
                <span class="song-duration">${song.duration}</span>
            `;
            
            li.addEventListener('click', () => {
                this.currentSongIndex = index;
                this.loadSong(index);
                this.play();
            });
            
            playlistElement.appendChild(li);
        });
    }

    updateActiveSong() {
        const playlistItems = document.querySelectorAll('#playlist-songs li');
        playlistItems.forEach((item, index) => {
            if (index === this.currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    attachEventListeners() {
        // 播放/暂停按钮
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // 上一首按钮
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.playPrevious();
        });

        // 下一首按钮
        document.getElementById('next-btn').addEventListener('click', () => {
            this.playNext();
        });

        // 随机播放按钮
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.toggleShuffle();
        });

        // 循环播放按钮
        document.getElementById('repeat-btn').addEventListener('click', () => {
            this.toggleRepeat();
        });

        // 音量控制
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });

        // 进度条控制
        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            const progressBar = e.currentTarget;
            const clickX = e.offsetX;
            const width = progressBar.offsetWidth;
            const percentage = clickX / width;
            this.audio.currentTime = percentage * this.audio.duration;
        });

        // 音频事件监听
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTimeDisplay();
        });

        this.audio.addEventListener('ended', () => {
            this.handleSongEnd();
        });

        // 设置初始音量
        this.audio.volume = 0.7;
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play();
        this.isPlaying = true;
        document.getElementById('play-pause-btn').textContent = '⏸️';
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        document.getElementById('play-pause-btn').textContent = '▶️';
    }

    playPrevious() {
        if (this.isShuffle) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        }
        
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    playNext() {
        if (this.isShuffle) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        }
        
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const shuffleBtn = document.getElementById('shuffle-btn');
        
        if (this.isShuffle) {
            shuffleBtn.style.color = '#667eea';
            shuffleBtn.style.background = 'rgba(102, 126, 234, 0.1)';
        } else {
            shuffleBtn.style.color = '';
            shuffleBtn.style.background = '';
        }
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const repeatBtn = document.getElementById('repeat-btn');
        
        if (this.isRepeat) {
            repeatBtn.style.color = '#667eea';
            repeatBtn.style.background = 'rgba(102, 126, 234, 0.1)';
        } else {
            repeatBtn.style.color = '';
            repeatBtn.style.background = '';
        }
    }

    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
        
        const currentMinutes = Math.floor(this.audio.currentTime / 60);
        const currentSeconds = Math.floor(this.audio.currentTime % 60);
        document.getElementById('current-time').textContent = 
            `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }

    updateTimeDisplay() {
        const totalMinutes = Math.floor(this.audio.duration / 60);
        const totalSeconds = Math.floor(this.audio.duration % 60);
        document.getElementById('total-time').textContent = 
            `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }

    handleSongEnd() {
        if (this.isRepeat) {
            this.audio.currentTime = 0;
            this.play();
        } else {
            this.playNext();
        }
    }

    updatePlayerDisplay() {
        // 初始化显示
        document.getElementById('current-time').textContent = '0:00';
        document.getElementById('total-time').textContent = '0:00';
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

// 初始化音乐播放器
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});