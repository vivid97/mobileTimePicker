/**
 * 时间选择器插件 - 优化版本
 * 支持日期时间、日期、年月、年份、时间五种格式
 * 优化：减少月份切换时日期列的刷新和滑动变化
 */
(function() {
    'use strict';
    
    class TimePicker {
        constructor(options) {
            this.options = Object.assign({
                trigger: null,
                type: 'datetime',
                minDate: '1900-01-01',
                maxDate: '2099-12-31',
                defaultValue: null,
                onConfirm: null,
                onCancel: null
            }, options);
            
            this.selectedDateTime = new Date();
            this.init();
        }
        
        init() {
            // 解析最小和最大日期
            this.parseMinMaxDates();
            
            // 设置默认值
            if (this.options.defaultValue) {
                this.parseDefaultValue();
            }
            
            // 创建DOM结构
            this.createDOM();
            
            // 绑定事件
            this.bindEvents();
        }
        
        parseMinMaxDates() {
            const minArr = this.options.minDate.split('-');
            const maxArr = this.options.maxDate.split('-');
            
            this.minDate = {
                year: parseInt(minArr[0]),
                month: parseInt(minArr[1]) || 1,
                day: parseInt(minArr[2]) || 1
            };
            
            this.maxDate = {
                year: parseInt(maxArr[0]),
                month: parseInt(maxArr[1]) || 12,
                day: parseInt(maxArr[2]) || 31
            };
        }
        
        parseDefaultValue() {
            const defaultValue = this.options.defaultValue;
            
            if (this.options.type === 'datetime') {
                const match = defaultValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2})$/);
                if (match) {
                    this.selectedDateTime = new Date(
                        parseInt(match[1]),
                        parseInt(match[2]) - 1,
                        parseInt(match[3]),
                        parseInt(match[4]),
                        parseInt(match[5])
                    );
                }
            } else if (this.options.type === 'date') {
                const match = defaultValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                if (match) {
                    this.selectedDateTime = new Date(
                        parseInt(match[1]),
                        parseInt(match[2]) - 1,
                        parseInt(match[3])
                    );
                }
            } else if (this.options.type === 'year-month') {
                const match = defaultValue.match(/^(\d{4})-(\d{1,2})$/);
                if (match) {
                    this.selectedDateTime = new Date(
                        parseInt(match[1]),
                        parseInt(match[2]) - 1,
                        1
                    );
                }
            } else if (this.options.type === 'year') {
                this.selectedDateTime = new Date(parseInt(defaultValue), 0, 1);
            } else if (this.options.type === 'time') {
                const match = defaultValue.match(/^(\d{1,2}):(\d{1,2})$/);
                if (match) {
                    const now = new Date();
                    this.selectedDateTime = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                        parseInt(match[1]),
                        parseInt(match[2])
                    );
                }
            }
        }
        
        // 获取某年某月的天数
        getDaysInMonth(year, month) {
            return new Date(year, month + 1, 0).getDate();
        }
        
        createDOM() {
            // 创建遮罩层
            this.overlay = document.createElement('div');
            this.overlay.className = 'time-picker-overlay';
            document.body.appendChild(this.overlay);
            
            // 创建弹出层
            this.popup = document.createElement('div');
            this.popup.className = 'time-picker-popup';
            this.popup.innerHTML = `
                <div class="time-picker-header">
                    <button class="time-picker-cancel">取消</button>
                    <button class="time-picker-confirm">确认</button>
                </div>
                <div class="time-picker-wrapper">
                    <div class="time-picker-columns" id="time-picker-columns"></div>
                    <div class="time-picker-indicator"></div>
                </div>
            `;
            document.body.appendChild(this.popup);
            
            this.columnsContainer = this.popup.querySelector('#time-picker-columns');
            this.cancelBtn = this.popup.querySelector('.time-picker-cancel');
            this.confirmBtn = this.popup.querySelector('.time-picker-confirm');
        }
        
        bindEvents() {
            // 绑定触发元素事件
            const trigger = document.querySelector(this.options.trigger);
            if (trigger) {
                trigger.addEventListener('click', () => this.show());
            }
            
            // 绑定取消按钮事件
            this.cancelBtn.addEventListener('click', () => {
                this.hide();
                if (this.options.onCancel) {
                    this.options.onCancel();
                }
            });
            
            // 绑定确认按钮事件
            this.confirmBtn.addEventListener('click', () => {
                this.confirmSelection();
                this.hide();
            });
            
            // 绑定遮罩层事件
            this.overlay.addEventListener('click', () => {
                this.hide();
                if (this.options.onCancel) {
                    this.options.onCancel();
                }
            });
        }
        
        show() {
            this.renderColumns();
            this.overlay.classList.add('show');
            this.popup.classList.add('show');
        }
        
        hide() {
            this.overlay.classList.remove('show');
            this.popup.classList.remove('show');
        }
        
        renderColumns() {
            this.columnsContainer.innerHTML = '';
            
            switch(this.options.type) {
                case 'datetime':
                    this.renderDateTimeColumns();
                    break;
                case 'date':
                    this.renderDateColumns();
                    break;
                case 'year-month':
                    this.renderYearMonthColumns();
                    break;
                case 'year':
                    this.renderYearColumns();
                    break;
                case 'time':
                    this.renderTimeColumns();
                    break;
            }
            
            // 绑定滚动事件
            setTimeout(() => {
                const columns = this.columnsContainer.querySelectorAll('.time-picker-column');
                columns.forEach(column => {
                    // 使用防抖优化滚动事件
                    let scrollTimer;
                    column.addEventListener('scroll', () => {
                        clearTimeout(scrollTimer);
                        scrollTimer = setTimeout(() => {
                            this.adjustSelection(column);
                            
                            // 如果年份或月份变化，更新日期列
                            if (column.dataset.type === 'year' || column.dataset.type === 'month') {
                                // 使用延迟更新，减少视觉闪烁
                                setTimeout(() => {
                                    this.updateDayColumn();
                                }, 10);
                            }
                        }, 50);
                    });
                    
                    // 滚动结束事件
                    let scrollEndTimer;
                    column.addEventListener('scroll', () => {
                        clearTimeout(scrollEndTimer);
                        scrollEndTimer = setTimeout(() => {
                            this.snapToClosestItem(column);
                        }, 100);
                    });
                });
            }, 100);
        }
        
        // 优化：更新日期列时减少视觉变化
        updateDayColumn() {
            if (this.options.type !== 'datetime' && this.options.type !== 'date') return;
            
            // 获取当前选中的年份和月份
            const yearColumn = this.columnsContainer.querySelector('.time-picker-column[data-type="year"]');
            const monthColumn = this.columnsContainer.querySelector('.time-picker-column[data-type="month"]');
            const dayColumn = this.columnsContainer.querySelector('.time-picker-column[data-type="day"]');
            
            if (!yearColumn || !monthColumn || !dayColumn) return;
            
            const selectedYear = parseInt(yearColumn.querySelector('.time-picker-column-item.selected').dataset.value);
            const selectedMonth = parseInt(monthColumn.querySelector('.time-picker-column-item.selected').dataset.value);
            const selectedDayItem = dayColumn.querySelector('.time-picker-column-item.selected');
            const selectedDay = selectedDayItem ? parseInt(selectedDayItem.dataset.value) : 1;
            
            // 计算该月的天数
            const daysInMonth = this.getDaysInMonth(selectedYear, selectedMonth - 1);
            
            // 如果当前选中的日期大于新的月份天数，则调整为最大天数
            const newSelectedDay = Math.min(selectedDay, daysInMonth);
            
            // 检查是否需要更新日期列
            const currentItems = dayColumn.querySelectorAll('.time-picker-column-item[data-value]');
            const currentMaxDay = currentItems.length > 0 ? 
                parseInt(currentItems[currentItems.length - 1].dataset.value) : 0;
            
            // 如果天数没有变化，不需要更新
            if (currentMaxDay === daysInMonth) return;
            
            // 保存当前滚动位置
            const currentScrollTop = dayColumn.scrollTop;
            
            // 重新渲染日期列
            const newDayColumn = this.createColumn('day', 1, daysInMonth, newSelectedDay);
            this.columnsContainer.replaceChild(newDayColumn, dayColumn);
            
            // 恢复滚动位置（近似值）
            const itemHeight = 44; // 每个选项的高度
            const targetScrollTop = Math.min(
                currentScrollTop, 
                (daysInMonth - 1) * itemHeight
            );
            newDayColumn.scrollTop = targetScrollTop;
            
            // 重新绑定事件
            let scrollTimer;
            newDayColumn.addEventListener('scroll', () => {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    this.adjustSelection(newDayColumn);
                }, 50);
            });
            
            let scrollEndTimer;
            newDayColumn.addEventListener('scroll', () => {
                clearTimeout(scrollEndTimer);
                scrollEndTimer = setTimeout(() => {
                    this.snapToClosestItem(newDayColumn);
                }, 100);
            });
        }
        
        renderDateTimeColumns() {
            const currentYear = new Date().getFullYear();
            // 年列 (当前年份-50到当前年份+50)
            const yearColumn = this.createColumn('year', 
                Math.max(this.minDate.year, currentYear - 50), 
                Math.min(this.maxDate.year, currentYear + 50), 
                this.selectedDateTime.getFullYear()
            );
            this.columnsContainer.appendChild(yearColumn);
            
            // 月列
            const monthColumn = this.createColumn('month', 1, 12, this.selectedDateTime.getMonth() + 1);
            this.columnsContainer.appendChild(monthColumn);
            
            // 日列 - 根据当前选中的年份和月份计算天数
            const daysInMonth = this.getDaysInMonth(this.selectedDateTime.getFullYear(), this.selectedDateTime.getMonth());
            const dayColumn = this.createColumn('day', 1, daysInMonth, this.selectedDateTime.getDate());
            this.columnsContainer.appendChild(dayColumn);
            
            // 时列
            const hourColumn = this.createColumn('hour', 0, 23, this.selectedDateTime.getHours());
            this.columnsContainer.appendChild(hourColumn);
            
            // 分列
            const minuteColumn = this.createColumn('minute', 0, 59, this.selectedDateTime.getMinutes());
            this.columnsContainer.appendChild(minuteColumn);
        }
        
        renderDateColumns() {
            const currentYear = new Date().getFullYear();
            // 年列 (当前年份-50到当前年份+50)
            const yearColumn = this.createColumn('year', 
                Math.max(this.minDate.year, currentYear - 50), 
                Math.min(this.maxDate.year, currentYear + 50), 
                this.selectedDateTime.getFullYear()
            );
            this.columnsContainer.appendChild(yearColumn);
            
            // 月列
            const monthColumn = this.createColumn('month', 1, 12, this.selectedDateTime.getMonth() + 1);
            this.columnsContainer.appendChild(monthColumn);
            
            // 日列 - 根据当前选中的年份和月份计算天数
            const daysInMonth = this.getDaysInMonth(this.selectedDateTime.getFullYear(), this.selectedDateTime.getMonth());
            const dayColumn = this.createColumn('day', 1, daysInMonth, this.selectedDateTime.getDate());
            this.columnsContainer.appendChild(dayColumn);
        }
        
        renderYearMonthColumns() {
            const currentYear = new Date().getFullYear();
            // 年列 (当前年份-50到当前年份+50)
            const yearColumn = this.createColumn('year', 
                Math.max(this.minDate.year, currentYear - 50), 
                Math.min(this.maxDate.year, currentYear + 50), 
                this.selectedDateTime.getFullYear()
            );
            this.columnsContainer.appendChild(yearColumn);
            
            // 月列
            const monthColumn = this.createColumn('month', 1, 12, this.selectedDateTime.getMonth() + 1);
            this.columnsContainer.appendChild(monthColumn);
        }
        
        renderYearColumns() {
            const currentYear = new Date().getFullYear();
            // 年列 (当前年份-50到当前年份+50)
            const yearColumn = this.createColumn('year', 
                Math.max(this.minDate.year, currentYear - 50), 
                Math.min(this.maxDate.year, currentYear + 50), 
                this.selectedDateTime.getFullYear()
            );
            this.columnsContainer.appendChild(yearColumn);
        }
        
        renderTimeColumns() {
            // 时列
            const hourColumn = this.createColumn('hour', 0, 23, this.selectedDateTime.getHours());
            this.columnsContainer.appendChild(hourColumn);
            
            // 分列
            const minuteColumn = this.createColumn('minute', 0, 59, this.selectedDateTime.getMinutes());
            this.columnsContainer.appendChild(minuteColumn);
        }
        
        createColumn(type, start, end, selectedValue) {
            const column = document.createElement('div');
            column.className = 'time-picker-column';
            column.dataset.type = type;
            
            // 添加额外的填充项以确保首尾项可选中
            for (let i = 0; i < 3; i++) {
                const paddingItem = document.createElement('div');
                paddingItem.className = 'time-picker-column-item';
                paddingItem.textContent = '';
                paddingItem.style.height = '44px';
                column.appendChild(paddingItem);
            }
            
            for (let i = start; i <= end; i++) {
                const item = document.createElement('div');
                item.className = 'time-picker-column-item';
                item.textContent = this.formatColumnValue(type, i);
                item.dataset.value = i;
                
                if (i === selectedValue) {
                    item.classList.add('selected');
                }
                
                column.appendChild(item);
            }
            
            // 添加额外的填充项以确保首尾项可选中
            for (let i = 0; i < 4; i++) {
                const paddingItem = document.createElement('div');
                paddingItem.className = 'time-picker-column-item';
                paddingItem.textContent = '';
                paddingItem.style.height = '44px';
                column.appendChild(paddingItem);
            }
            
            // 滚动到选中位置
            setTimeout(() => {
                this.scrollToSelected(column);
            }, 150);
            
            return column;
        }
        
        formatColumnValue(type, value) {
            switch(type) {
                case 'year':
                    return value + '年';
                case 'month':
                    return value.toString().padStart(2, '0') + '月';
                case 'day':
                    return value.toString().padStart(2, '0') + '日';
                case 'hour':
                    return value.toString().padStart(2, '0') + '时';
                case 'minute':
                    return value.toString().padStart(2, '0') + '分';
                default:
                    return value;
            }
        }
        
        scrollToSelected(column) {
            const selectedItem = column.querySelector('.time-picker-column-item.selected');
            if (selectedItem) {
                const containerHeight = column.offsetHeight;
                const itemHeight = selectedItem.offsetHeight;
                const scrollTop = selectedItem.offsetTop - (containerHeight - itemHeight) / 2;
                column.scrollTop = scrollTop;
            }
        }
        
        adjustSelection(column) {
            const items = column.querySelectorAll('.time-picker-column-item');
            if (items.length === 0) return;
            
            const containerHeight = column.offsetHeight;
            const itemHeight = items[0].offsetHeight;
            const scrollTop = column.scrollTop;
            
            // 计算中间位置
            const middlePosition = scrollTop + containerHeight / 2;
            
            // 找到最接近中间位置的项目
            let closestItem = null;
            let minDistance = Infinity;
            
            items.forEach(item => {
                // 跳过填充项
                if (!item.dataset.value) return;
                
                const itemCenter = item.offsetTop + itemHeight / 2;
                const distance = Math.abs(itemCenter - middlePosition);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestItem = item;
                }
            });
            
            // 更新选中状态
            if (closestItem) {
                items.forEach(item => {
                    if (item === closestItem) {
                        item.classList.add('selected');
                    } else {
                        item.classList.remove('selected');
                    }
                });
            }
        }
        
        snapToClosestItem(column) {
            const items = column.querySelectorAll('.time-picker-column-item');
            if (items.length === 0) return;
            
            const containerHeight = column.offsetHeight;
            const itemHeight = items[0].offsetHeight;
            const scrollTop = column.scrollTop;
            
            // 计算中间位置
            const middlePosition = scrollTop + containerHeight / 2;
            
            // 找到最接近中间位置的项目
            let closestItem = null;
            let minDistance = Infinity;
            
            items.forEach(item => {
                // 跳过填充项
                if (!item.dataset.value) return;
                
                const itemCenter = item.offsetTop + itemHeight / 2;
                const distance = Math.abs(itemCenter - middlePosition);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestItem = item;
                }
            });
            
            // 更新选中状态
            if (closestItem) {
                items.forEach(item => {
                    if (item === closestItem) {
                        item.classList.add('selected');
                    } else {
                        item.classList.remove('selected');
                    }
                });
                
                // 平滑滚动到选中项
                const targetScrollTop = closestItem.offsetTop - (containerHeight - itemHeight) / 2;
                column.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }
        
        confirmSelection() {
            const columns = this.columnsContainer.querySelectorAll('.time-picker-column');
            const selectedValues = {};
            
            columns.forEach(column => {
                const type = column.dataset.type;
                const selectedItem = column.querySelector('.time-picker-column-item.selected');
                if (selectedItem) {
                    selectedValues[type] = parseInt(selectedItem.dataset.value);
                }
            });
            
            let value = '';
            
            switch(this.options.type) {
                case 'datetime':
                    value = `${selectedValues.year}-${selectedValues.month.toString().padStart(2, '0')}-${selectedValues.day.toString().padStart(2, '0')} ${selectedValues.hour.toString().padStart(2, '0')}:${selectedValues.minute.toString().padStart(2, '0')}`;
                    break;
                case 'date':
                    value = `${selectedValues.year}-${selectedValues.month.toString().padStart(2, '0')}-${selectedValues.day.toString().padStart(2, '0')}`;
                    break;
                case 'year-month':
                    value = `${selectedValues.year}-${selectedValues.month.toString().padStart(2, '0')}`;
                    break;
                case 'year':
                    value = selectedValues.year.toString();
                    break;
                case 'time':
                    value = `${selectedValues.hour.toString().padStart(2, '0')}:${selectedValues.minute.toString().padStart(2, '0')}`;
                    break;
            }
            
            if (this.options.onConfirm) {
                this.options.onConfirm(value);
            }
        }
        
        // 销毁方法
        destroy() {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            if (this.popup && this.popup.parentNode) {
                this.popup.parentNode.removeChild(this.popup);
            }
        }
    }
    
    // 暴露到全局
    window.TimePicker = TimePicker;
})();