# Time Picker

一个轻量级、高性能的移动端时间选择器插件，支持多种时间格式选择。

## 特性

- **移动端优化** - 专为移动设备设计，支持触摸滑动
- **多种格式** - 支持日期时间、日期、年月、年份、时间五种格式
- **高性能** - 优化渲染逻辑，减少不必要的DOM操作
- **平滑滚动** - 惯性滚动和自动吸附效果
- **易于使用** - 简单的API和灵活的配置选项
- **无依赖** - 纯JavaScript实现，不依赖任何第三方库

## 安装

直接将 `time-picker.css` 和 `time-picker.js` 文件引入到你的项目中：

```html
<link rel=\"stylesheet\" href=\"path/to/time-picker.css\">
<script src=\"path/to/time-picker.js\"></script>
```

## 快速开始

### 基本使用

```html
<input type=\"text\" id=\"timeInput\" placeholder=\"选择时间\">

<script>
// 初始化时间选择器
const picker = new TimePicker({
    trigger: '#timeInput',
    type: 'datetime',
    onConfirm: function(value) {
        document.getElementById('timeInput').value = value;
    }
});
</script>
```

### 更多示例

```javascript
// 日期选择
const datePicker = new TimePicker({
    trigger: '#dateInput',
    type: 'date',
    minDate: '2020-01-01',
    maxDate: '2030-12-31',
    defaultValue: '2023-06-15',
    onConfirm: function(value) {
        console.log('选择的日期:', value);
    }
});

// 年月选择
const monthPicker = new TimePicker({
    trigger: '#monthInput',
    type: 'year-month',
    onConfirm: function(value) {
        console.log('选择的年月:', value);
    }
});

// 时间选择
const timePicker = new TimePicker({
    trigger: '#timeInput',
    type: 'time',
    onConfirm: function(value) {
        console.log('选择的时间:', value);
    }
});
```

## 配置选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| trigger | string | null | 触发元素的选择器 |
| type | string | 'datetime' | 选择器类型：datetime、date、year-month、year、time |
| minDate | string | '1900-01-01' | 最小日期 |
| maxDate | string | '2099-12-31' | 最大日期 |
| defaultValue | string | null | 默认值 |
| onConfirm | function | null | 确认回调函数 |
| onCancel | function | null | 取消回调函数 |

## 类型格式说明

| 类型 | 格式 | 示例 |
|------|------|------|
| datetime | YYYY-MM-DD HH:mm | 2023-06-15 14:30 |
| date | YYYY-MM-DD | 2023-06-15 |
| year-month | YYYY-MM | 2023-06 |
| year | YYYY | 2023 |
| time | HH:mm | 14:30 |

## API 方法

### show()
显示时间选择器

```javascript
picker.show();
```

### hide()
隐藏时间选择器

```javascript
picker.hide();
```

### destroy()
销毁时间选择器实例

```javascript
picker.destroy();
```

## 自定义样式

你可以通过CSS变量或直接修改CSS类来自定义样式：

```css
/* 修改主题色 */
.time-picker-confirm {
    color: #007bff; /* 修改确认按钮颜色 */
}

.time-picker-column-item.selected {
    color: #007bff; /* 修改选中项颜色 */
}

/* 修改弹出层背景 */
.time-picker-popup {
    background: #ffffff;
    border-radius: 12px 12px 0 0;
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 问题反馈

如果你遇到任何问题，请通过以下方式反馈：

1. 在 GitHub 提交 Issue
2. 描述问题的详细步骤
3. 提供相关的代码片段
4. 注明浏览器版本和设备信息