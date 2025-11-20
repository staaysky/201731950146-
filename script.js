class MusicPlayer {
    constructor() {
        this.tracks = [
            {
                title: "夏日微风",
                artist: "轻音乐团",
                cover: "https://picsum.photos/seed/music1/300/300.jpg",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            },
            {
                title: "星空漫步",
                artist: "梦想乐队",
                cover: "https://picsum.photos/seed/music2/300/300.jpg",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
            },
            {
                title: "雨后彩虹",
                artist: "自然之声",
                cover: "https://picsum.photos/seed/music3/300/300.jpg",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
            },
            {
                title: "晨曦之光",
                artist: "希望组合",
                cover: "https://picsum.photos/seed/music4/300/300.jpg",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
            },
            {
                title: "秋叶飘零",
                artist: "时光乐队",
                cover: "https://picsum.photos/seed/music5/300/300.jpg",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
            }
        ];
        
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isRepeat = false;
        this.isShuffle = false;
        this.audio = new Audio();
        
        this.init();
    }

    init() {
        this.loadTrack(0);
        this.renderPlaylist();
        this.attachEventListeners();
        this.setupAudioEvents();
    }

    loadTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        
        this.audio.src = track.url;
        document.getElementById('track-title').textContent = track.title;
        document.getElementById('track-artist').textContent = track.artist;
        document.getElementById('album-cover-img').src = track.cover;
        
        this.updatePlaylistHighlight();
        this.resetProgress();
    }

    renderPlaylist() {
        const playlistElement = document.getElementById('playlist');
        playlistElement.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            li.dataset.index = index;
            
            if (index === this.currentTrackIndex) {
                li.classList.add('active');
            }
            
            li.innerHTML = `
                <div class="playlist-item-info">
                    <span class="playlist-item-title">${track.title}</span>
                    <span class="playlist-item-artist">${track.artist}</span>
                </div>
                <span class="playlist-item-duration">0:00</span>
            `;
            
            li.addEventListener('click', () => {
                this.loadTrack(index);
                this.play();
            });
            
            playlistElement.appendChild(li);
        });
    }

    updatePlaylistHighlight() {
        const items = document.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            if (index === this.currentTrackIndex) {
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

        document.getElementById('main-play-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // 上一首/下一首
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.playPrevious();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.playNext();
        });

        // 循环播放
        document.getElementById('repeat-btn').addEventListener('click', () => {
            this.toggleRepeat();
        });

        // 随机播放
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.toggleShuffle();
        });

        // 音量控制
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // 进度条控制
        const progressBar = document.getElementById('progress-bar');
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seekTo(percent);
        });
    }

    setupAudioEvents() {
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });

        this.audio.addEventListener('ended', () => {
            this.handleTrackEnd();
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
        this.audio.play();
        this.isPlaying = true;
        this.updatePlayButton();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    updatePlayButton() {
        const playBtns = document.querySelectorAll('#play-pause-btn i, #main-play-btn i');
        playBtns.forEach(btn => {
            if (this.isPlaying) {
                btn.classList.remove('fa-play');
                btn.classList.add('fa-pause');
            } else {
                btn.classList.remove('fa-pause');
                btn.classList.add('fa-play');
            }
        });
    }

    playPrevious() {
        let prevIndex;
        if (this.isShuffle) {
            do {
                prevIndex = Math.floor(Math.random() * this.tracks.length);
            } while (prevIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else {
            prevIndex = this.currentTrackIndex - 1;
            if (prevIndex < 0) {
                prevIndex = this.tracks.length - 1;
            }
        }
        
        this.loadTrack(prevIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    playNext() {
        let nextIndex;
        if (this.isShuffle) {
            do {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            } while (nextIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else {
            nextIndex = this.currentTrackIndex + 1;
            if (nextIndex >= this.tracks.length) {
                nextIndex = 0;
            }
        }
        
        this.loadTrack(nextIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const repeatBtn = document.getElementById('repeat-btn');
        if (this.isRepeat) {
            repeatBtn.classList.add('active');
        } else {
            repeatBtn.classList.remove('active');
        }
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (this.isShuffle) {
            shuffleBtn.classList.add('active');
        } else {
            shuffleBtn.classList.remove('active');
        }
    }

    setVolume(value) {
        this.audio.volume = value / 100;
        document.getElementById('volume-value').textContent = `${value}%`;
    }

    seekTo(percent) {
        if (this.audio.duration) {
            this.audio.currentTime = this.audio.duration * percent;
        }
    }

    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress').style.width = `${percent}%`;
            document.getElementById('current-time').textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        document.getElementById('total-time').textContent = this.formatTime(this.audio.duration);
    }

    resetProgress() {
        document.getElementById('progress').style.width = '0%';
        document.getElementById('current-time').textContent = '0:00';
    }

    handleTrackEnd() {
        if (this.isRepeat) {
            this.audio.currentTime = 0;
            this.play();
        } else {
            this.playNext();
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// 平滑滚动
document.addEventListener('DOMContentLoaded', () => {
    // 初始化音乐播放器
    new MusicPlayer();
    
    // 平滑滚动导航
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
});