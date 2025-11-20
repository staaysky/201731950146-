class Calendar {
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
        this.updateTime();
        this.updateBackground();
        this.startBackgroundTimer();
        this.startTimeTimer();
    }

    renderCalendar() {
        this.updateHeader();
        this.renderDays();
    }

    updateHeader() {
        const monthNames = [
            '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'
        ];
        
        const monthYearElement = document.getElementById('current-month-year');
        monthYearElement.textContent = `${this.currentDate.getFullYear()}年 ${monthNames[this.currentDate.getMonth()]}`;
    }

    renderDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';
        
        const today = new Date();
        
        // 上个月的日期
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = this.createDayElement(daysInPrevMonth - i, 'other-month', false);
            daysContainer.appendChild(day);
        }
        
        // 当前月的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = year === today.getFullYear() && 
                           month === today.getMonth() && 
                           day === today.getDate();
            
            const dayElement = this.createDayElement(day, 'current-month', isToday);
            
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            daysContainer.appendChild(dayElement);
        }
        
        // 下个月的日期
        const totalCells = daysContainer.children.length;
        const remainingCells = 42 - totalCells; // 6周 * 7天
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, 'other-month', false);
            daysContainer.appendChild(dayElement);
        }
    }

    createDayElement(day, monthType, isToday) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;
        
        if (monthType === 'other-month') {
            dayElement.classList.add('other-month');
        }
        
        dayElement.addEventListener('click', () => {
            this.selectDate(day, monthType);
        });
        
        return dayElement;
    }

    selectDate(day, monthType) {
        // 移除之前选中的日期
        const previousSelected = document.querySelector('.day.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // 添加选中样式
        event.target.classList.add('selected');
        
        // 设置选中日期
        if (monthType === 'current-month') {
            this.selectedDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                day
            );
        } else {
            // 如果是其他月份的日期，切换到那个月份
            if (day > 15) {
                this.previousMonth();
            } else {
                this.nextMonth();
            }
        }
    }

    attachEventListeners() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.previousMonth();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.nextMonth();
        });
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('current-time');
        timeElement.textContent = timeString;
    }

    startTimeTimer() {
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateBackground() {
        const body = document.body;
        const imageUrl = this.backgroundImages[this.currentImageIndex];
        
        // 预加载图片
        const img = new Image();
        img.onload = () => {
            body.style.backgroundImage = `url(${imageUrl})`;
        };
        img.src = imageUrl;
        
        // 更新索引
        this.currentImageIndex = (this.currentImageIndex + 1) % this.backgroundImages.length;
        
        // 更新背景信息
        const infoElement = document.getElementById('background-info');
        const nextUpdateTime = new Date();
        nextUpdateTime.setMinutes(nextUpdateTime.getMinutes() + 1);
        infoElement.textContent = `背景图片每分钟自动更新 | 下次更新: ${nextUpdateTime.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    }

    startBackgroundTimer() {
        // 立即更新一次背景
        this.updateBackground();
        
        // 每分钟更新背景
        setInterval(() => {
            this.updateBackground();
        }, 60000); // 60秒 = 1分钟
    }
}

// 初始化日历
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});