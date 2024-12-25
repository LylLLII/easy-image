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
        
        // 创建下载链接
        const dataUrl = canvas.toDataURL('image/png');
        downloadBtn.href = dataUrl;
        downloadBtn.download = 'resized-image.png';
        downloadBtn.style.display = 'block';
    });
}); 