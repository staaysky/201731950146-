class MusicPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audio-player');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.mainPlayBtn = document.getElementById('main-play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressBar = document.getElementById('progress');
        this.progressBarContainer = document.querySelector('.progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.totalTimeEl = document.getElementById('total-time');
        this.volumeSlider = document.getElementById('volume-slider');
        this.playlistItems = document.querySelectorAll('.playlist-item');
        this.trackTitle = document.getElementById('track-title');
        this.trackArtist = document.getElementById('track-artist');
        this.albumImage = document.getElementById('album-image');
        this.albumCover = document.querySelector('.album-cover');
        
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.tracks = [
            {
                title: '示例歌曲 1',
                artist: '示例艺术家',
                src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                duration: '3:45',
                image: 'https://picsum.photos/seed/music1/300/300.jpg'
            },
            {
                title: '示例歌曲 2',
                artist: '示例艺术家',
                src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                duration: '4:12',
                image: 'https://picsum.photos/seed/music2/300/300.jpg'
            },
            {
                title: '示例歌曲 3',
                artist: '示例艺术家',
                src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                duration: '5:30',
                image: 'https://picsum.photos/seed/music3/300/300.jpg'
            }
        ];
        
        this.init();
    }

    init() {
        this.loadTrack(this.currentTrackIndex);
        this.attachEventListeners();
        this.setVolume(70);
    }

    loadTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        
        this.audioPlayer.src = track.src;
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist;
        this.albumImage.src = track.image;
        
        // 更新播放列表高亮
        this.playlistItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 如果正在播放，自动播放新加载的歌曲
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }

    attachEventListeners() {
        // 播放/暂停按钮
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.mainPlayBtn.addEventListener('click', () => this.togglePlayPause());
        
        // 上一首/下一首按钮
        this.prevBtn.addEventListener('click', () => this.playPreviousTrack());
        this.nextBtn.addEventListener('click', () => this.playNextTrack());
        
        // 进度条
        this.progressBarContainer.addEventListener('click', (e) => this.seekTo(e));
        
        // 音量控制
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 播放列表项点击
        this.playlistItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.loadTrack(index);
                this.play();
            });
        });
        
        // 音频事件
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('ended', () => this.playNextTrack());
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audioPlayer.play();
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.albumCover.classList.add('playing');
    }

    pause() {
        this.audioPlayer.pause();
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.albumCover.classList.remove('playing');
    }

    updatePlayPauseButton() {
        const icon = this.playPauseBtn.querySelector('i');
        const mainIcon = this.mainPlayBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            mainIcon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
            mainIcon.className = 'fas fa-play';
        }
    }

    playPreviousTrack() {
        let prevIndex = this.currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.tracks.length - 1;
        }
        this.loadTrack(prevIndex);
        this.play();
    }

    playNextTrack() {
        let nextIndex = this.currentTrackIndex + 1;
        if (nextIndex >= this.tracks.length) {
            nextIndex = 0;
        }
        this.loadTrack(nextIndex);
        this.play();
    }

    seekTo(event) {
        const rect = this.progressBarContainer.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
    }

    updateProgress() {
        const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        this.progressBar.style.width = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audioPlayer.currentTime);
    }

    updateDuration() {
        this.totalTimeEl.textContent = this.formatTime(this.audioPlayer.duration);
    }

    setVolume(value) {
        this.audioPlayer.volume = value / 100;
        this.volumeSlider.value = value;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// 初始化音乐播放器
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});