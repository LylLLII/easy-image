document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const settings = document.getElementById('settings');
    const preview = document.getElementById('preview');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const maintainAspectRatio = document.getElementById('maintainAspectRatio');
    const resizeBtn = document.getElementById('resizeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const fileInfo = document.getElementById('fileInfo');
    const originalSizeSpan = document.getElementById('originalSize');
    const compressedSizeSpan = document.getElementById('compressedSize');
    const formatSelect = document.getElementById('format');
    const compressionPreset = document.getElementById('compressionPreset');

    let originalImage = null;

    // 处理文件拖放
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim();
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--border-color').trim();
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        }
    });

    // 处理点击上传
    dropZone.addEventListener('click', (e) => {
        // 阻止事件冒泡，只有当点击的不是 input 元素时才触发
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    });

    // 处理图片加载
    function handleImage(file) {
        const loading = document.getElementById('loading');
        loading.style.display = 'flex';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                preview.src = img.src;
                widthInput.value = img.width;
                heightInput.value = img.height;
                settings.style.display = 'block';
                dropZone.style.display = 'none';
                loading.style.display = 'none';
                updateFileInfo(file);
            };
            img.onerror = () => {
                alert('图片加载失败，请重试');
                loading.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            alert('文件读取失败，请重试');
            loading.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // 处理尺寸输入
    widthInput.addEventListener('input', () => {
        if (maintainAspectRatio.checked && originalImage) {
            const ratio = originalImage.height / originalImage.width;
            heightInput.value = Math.round(widthInput.value * ratio);
        }
    });

    heightInput.addEventListener('input', () => {
        if (maintainAspectRatio.checked && originalImage) {
            const ratio = originalImage.width / originalImage.height;
            widthInput.value = Math.round(heightInput.value * ratio);
        }
    });

    // 调整图片尺寸
    resizeBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = parseInt(widthInput.value);
        canvas.height = parseInt(heightInput.value);
        
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        // 获取压缩质量和格式
        const quality = qualitySlider.value / 100;
        const format = formatSelect.value;
        
        // 创建下载链接
        let dataUrl;
        switch(format) {
            case 'jpeg':
                dataUrl = canvas.toDataURL('image/jpeg', quality);
                break;
            case 'png':
                dataUrl = canvas.toDataURL('image/png');
                break;
            case 'webp':
                dataUrl = canvas.toDataURL('image/webp', quality);
                break;
            default:
                dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        downloadBtn.href = dataUrl;
        downloadBtn.download = `optimized-image.${format}`;
        downloadBtn.style.display = 'block';
    });

    // 更新质量显示
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        updateCompressedSize();
    });

    // 显示文件信息
    function updateFileInfo(file) {
        fileInfo.style.display = 'block';
        originalSizeSpan.textContent = formatFileSize(file.size);
        updateCompressedSize();
    }

    // 更新压缩后的预估大小
    function updateCompressedSize() {
        const originalSize = parseFloat(originalSizeSpan.textContent);
        const quality = qualitySlider.value / 100;
        const format = formatSelect.value;
        
        // 根据不同格式估算压缩后的大小
        let compressionRatio;
        switch(format) {
            case 'jpeg':
                compressionRatio = quality;
                break;
            case 'png':
                compressionRatio = 1; // PNG 是无损的
                break;
            case 'webp':
                compressionRatio = quality * 0.8; // WebP 通常比 JPEG 小 20%
                break;
            default:
                compressionRatio = quality;
        }
        
        const estimatedSize = originalSize * compressionRatio;
        compressedSizeSpan.textContent = formatFileSize(estimatedSize);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 修改图片处理函数
    function processImage(originalImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        canvas.width = parseInt(widthInput.value);
        canvas.height = parseInt(heightInput.value);
        
        // 绘制调整大小后的图片
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        // 获取压缩质量和格式
        const quality = qualitySlider.value / 100;
        const format = formatSelect.value;
        
        // 根据选择的格式返回相应的图片数据
        switch(format) {
            case 'jpeg':
                return canvas.toDataURL('image/jpeg', quality);
            case 'png':
                return canvas.toDataURL('image/png');
            case 'webp':
                return canvas.toDataURL('image/webp', quality);
            default:
                return canvas.toDataURL('image/jpeg', quality);
        }
    }

    // 添加压缩预设处理
    compressionPreset.addEventListener('change', function() {
        const preset = this.value;
        switch(preset) {
            case 'high':
                qualitySlider.value = 90;
                break;
            case 'medium':
                qualitySlider.value = 80;
                break;
            case 'low':
                qualitySlider.value = 60;
                break;
            case 'custom':
                // 保持当前值不变
                break;
        }
        qualityValue.textContent = qualitySlider.value + '%';
        updateCompressedSize();
    });
}); 