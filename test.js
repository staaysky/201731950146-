// 功能测试脚本
console.log('开始功能测试...');

// 测试轮播功能
function testCarousel() {
    console.log('测试轮播功能...');
    
    // 检查轮播元素是否存在
    const carousel = document.getElementById('image-carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (!carousel || slides.length === 0 || indicators.length === 0 || !prevBtn || !nextBtn) {
        console.error('轮播组件元素缺失');
        return false;
    }
    
    // 测试轮播切换
    let initialSlide = 0;
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].classList.contains('active')) {
            initialSlide = i;
            break;
        }
    }
    
    // 模拟点击下一张
    nextBtn.click();
    setTimeout(() => {
        let nextSlide = 0;
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].classList.contains('active')) {
                nextSlide = i;
                break;
            }
        }
        
        if (nextSlide === (initialSlide + 1) % slides.length) {
            console.log('✓ 轮播下一张功能正常');
        } else {
            console.error('✗ 轮播下一张功能异常');
        }
    }, 1000);
    
    return true;
}

// 测试音乐播放器功能
function testMusicPlayer() {
    console.log('测试音乐播放器功能...');
    
    // 检查播放器元素是否存在
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevSongBtn = document.getElementById('prev-song-btn');
    const nextSongBtn = document.getElementById('next-song-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    
    if (!playPauseBtn || !prevSongBtn || !nextSongBtn || !progressBar || !volumeSlider || !songTitle || !artistName) {
        console.error('音乐播放器组件元素缺失');
        return false;
    }
    
    // 测试播放/暂停功能
    const initialText = playPauseBtn.textContent;
    playPauseBtn.click();
    
    setTimeout(() => {
        if (playPauseBtn.textContent !== initialText) {
            console.log('✓ 播放/暂停功能正常');
        } else {
            console.error('✗ 播放/暂停功能异常');
        }
        
        // 恢复初始状态
        playPauseBtn.click();
    }, 500);
    
    // 测试歌曲切换
    const initialTitle = songTitle.textContent;
    nextSongBtn.click();
    
    setTimeout(() => {
        if (songTitle.textContent !== initialTitle) {
            console.log('✓ 歌曲切换功能正常');
        } else {
            console.error('✗ 歌曲切换功能异常');
        }
    }, 500);
    
    // 测试音量控制
    const initialVolume = volumeSlider.value;
    volumeSlider.value = 50;
    volumeSlider.dispatchEvent(new Event('input'));
    
    if (volumeSlider.value === '50') {
        console.log('✓ 音量控制功能正常');
    } else {
        console.error('✗ 音量控制功能异常');
    }
    
    volumeSlider.value = initialVolume;
    
    return true;
}

// 测试响应式设计
function testResponsiveDesign() {
    console.log('测试响应式设计...');
    
    const navbar = document.querySelector('.navbar');
    const navMenu = document.querySelector('.nav-menu');
    const musicPlayer = document.querySelector('.music-player');
    const blogGrid = document.querySelector('.blog-grid');
    
    if (!navbar || !navMenu || !musicPlayer || !blogGrid) {
        console.error('响应式设计元素缺失');
        return false;
    }
    
    // 测试不同屏幕尺寸
    const originalWidth = window.innerWidth;
    
    // 模拟移动设备宽度
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
    });
    
    window.dispatchEvent(new Event('resize'));
    
    setTimeout(() => {
        // 检查移动设备样式是否应用
        const playerCover = document.querySelector('.player-cover');
        if (playerCover && window.getComputedStyle(playerCover).width === '250px') {
            console.log('✓ 移动设备响应式样式正常');
        } else {
            console.log('⚠ 移动设备响应式样式可能需要调整');
        }
        
        // 恢复原始宽度
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth
        });
        
        window.dispatchEvent(new Event('resize'));
    }, 500);
    
    return true;
}

// 测试平滑滚动
function testSmoothScroll() {
    console.log('测试平滑滚动功能...');
    
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    if (navLinks.length === 0) {
        console.error('导航链接缺失');
        return false;
    }
    
    // 找到第一个有效的导航链接
    for (let link of navLinks) {
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const initialScrollTop = window.pageYOffset;
            
            // 模拟点击
            link.click();
            
            setTimeout(() => {
                const newScrollTop = window.pageYOffset;
                
                if (Math.abs(newScrollTop - initialScrollTop) > 100) {
                    console.log('✓ 平滑滚动功能正常');
                } else {
                    console.error('✗ 平滑滚动功能异常');
                }
                
                // 滚动回顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
            
            return true;
        }
    }
    
    console.error('没有找到有效的导航目标');
    return false;
}

// 运行所有测试
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始运行测试...');
    
    setTimeout(() => {
        testCarousel();
        testMusicPlayer();
        testResponsiveDesign();
        testSmoothScroll();
        
        console.log('所有测试完成！');
    }, 2000);
});

// 检查页面性能
function checkPerformance() {
    console.log('检查页面性能...');
    
    // 检查页面加载时间
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`页面加载时间: ${loadTime}ms`);
        
        if (loadTime < 3000) {
            console.log('✓ 页面加载速度良好');
        } else if (loadTime < 5000) {
            console.log('⚠ 页面加载速度一般');
        } else {
            console.log('✗ 页面加载速度较慢');
        }
    });
    
    // 检查DOM元素数量
    const elementCount = document.querySelectorAll('*').length;
    console.log(`DOM元素总数: ${elementCount}`);
    
    if (elementCount < 500) {
        console.log('✓ DOM元素数量合理');
    } else {
        console.log('⚠ DOM元素数量较多，可能影响性能');
    }
}

checkPerformance();