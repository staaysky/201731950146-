class DynamicCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.backgroundImages = [
            'https://picsum.photos/seed/calendar1/1920/1080.jpg',
            'https://picsum.photos/seed/calendar2/1920/1080.jpg',
            'https://picsum.photos/seed/calendar3/1920/1080.jpg',
            'https://picsum.photos/seed/calendar4/1920/1080.jpg',
            'https://picsum.photos/seed/calendar5/1920/1080.jpg',
            'https://picsum.photos/seed/calendar6/1920/1080.jpg',
            'https://picsum.photos/seed/calendar7/1920/1080.jpg',
            'https://picsum.photos/seed/calendar8/1920/1080.jpg',
            'https://picsum.photos/seed/calendar9/1920/1080.jpg',
            'https://picsum.photos/seed/calendar10/1920/1080.jpg'
        ];
        this.currentImageIndex = 0;
        
        this.init();
    }

    init() {
        this.renderCalendar();
        this.attachEventListeners();
        this.updateCurrentTime();
        this.updateBackground();
        
        // 每分钟更新背景
        setInterval(() => {
            this.updateBackground();
        }, 60000);
        
        // 每秒更新时间
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份标题
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        document.getElementById('current-month').textContent = `${year}年 ${monthNames[month]}`;
        
        // 获取月份的第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const firstDayOfWeek = firstDay.getDay();
        const lastDayDate = lastDay.getDate();
        const prevLastDayDate = prevLastDay.getDate();
        
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';
        
        // 添加上个月的日期
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = this.createDayElement(prevLastDayDate - i, true, false);
            daysContainer.appendChild(dayElement);
        }
        
        // 添加当前月的日期
        const today = new Date();
        for (let day = 1; day <= lastDayDate; day++) {
            const isToday = year === today.getFullYear() && 
                           month === today.getMonth() && 
                           day === today.getDate();
            const dayElement = this.createDayElement(day, false, isToday);
            daysContainer.appendChild(dayElement);
        }
        
        // 添加下个月的日期
        const remainingDays = 42 - (firstDayOfWeek + lastDayDate);
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = this.createDayElement(day, true, false);
            daysContainer.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth, isToday) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        dayElement.addEventListener('click', () => {
            // 移除之前的选中状态
            document.querySelectorAll('.day.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 添加选中状态
            if (!isOtherMonth) {
                dayElement.classList.add('selected');
                this.selectedDate = new Date(
                    this.currentDate.getFullYear(),
                    this.currentDate.getMonth(),
                    day
                );
            }
        });
        
        return dayElement;
    }

    attachEventListeners() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        document.getElementById('current-time').textContent = timeString;
    }

    updateBackground() {
        const backgroundContainer = document.getElementById('background-container');
        const nextImageIndex = (this.currentImageIndex + 1) % this.backgroundImages.length;
        
        // 创建新的图片元素
        const newImage = new Image();
        newImage.onload = () => {
            // 淡出当前背景
            backgroundContainer.style.opacity = '0';
            
            setTimeout(() => {
                backgroundContainer.style.backgroundImage = `url(${this.backgroundImages[nextImageIndex]})`;
                // 淡入新背景
                backgroundContainer.style.opacity = '1';
                this.currentImageIndex = nextImageIndex;
            }, 1000);
        };
        
        newImage.src = this.backgroundImages[nextImageIndex];
        
        // 如果是第一次加载，直接设置背景
        if (backgroundContainer.style.backgroundImage === '') {
            backgroundContainer.style.backgroundImage = `url(${this.backgroundImages[0]})`;
            backgroundContainer.style.opacity = '1';
        }
    }
}

// 初始化日历
document.addEventListener('DOMContentLoaded', () => {
    new DynamicCalendar();
});