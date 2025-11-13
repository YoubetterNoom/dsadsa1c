document.addEventListener('DOMContentLoaded', function() {
    // 加载页面逻辑
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress-bar');
    const loadingStatus = document.getElementById('loading-status');
    const loadingCancel = document.getElementById('loading-cancel');
    const mainContainer = document.querySelector('.container');
    
    // 初始隐藏主内容
    mainContainer.style.display = 'none';
    
    // 加载状态消息
    const loadingMessages = [
        "Initializing system components...",
        "Loading user interface...",
        "Preparing JAKOS elements...",
        "Loading assets...",
        "Configuring JAKOS environment...",
        "Starting $JAK Setup...",
        "Almost there..."
    ];
    
    let progress = 0;
    let messageIndex = 0;
    
    // 模拟加载进度
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 3 + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // 加载完成后短暂延迟，然后显示主内容
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                mainContainer.style.display = 'block';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
        
        // 更新进度条
        progressBar.style.width = `${progress}%`;
        
        // 更新加载消息
        if (progress > (messageIndex + 1) * (100 / loadingMessages.length)) {
            messageIndex = Math.min(messageIndex + 1, loadingMessages.length - 1);
            loadingStatus.textContent = loadingMessages[messageIndex];
        }
    }, 200);
    
    // 取消按钮功能
    loadingCancel.addEventListener('click', () => {
        const confirmCancel = confirm("Are you sure you want to cancel loading?");
        if (confirmCancel) {
            clearInterval(loadingInterval);
            loadingStatus.textContent = "Loading canceled. Click anywhere to continue anyway.";
            loadingScreen.addEventListener('click', () => {
                loadingScreen.style.opacity = '0';
                mainContainer.style.display = 'block';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            });
        }
    });
    
    // DOM Elements
    const categories = document.querySelectorAll('.category');
    const imagesContainer = document.getElementById('images-container');
    const canvas = document.getElementById('canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas');
    const saveCanvasBtn = document.getElementById('save-canvas');
    const addTextBtn = document.getElementById('add-text');
    const helpBtn = document.getElementById('help-btn');
    const previewCanvasBtn = document.getElementById('preview-canvas');
    const downloadCanvasBtn = document.getElementById('download-canvas');
    const communityBtn = document.getElementById('community-btn');
    const chartBtn = document.getElementById('chart-btn');
    
    // Layer control buttons
    const bringForwardBtn = document.getElementById('bring-forward');
    const sendBackwardBtn = document.getElementById('send-backward');
    const bringToFrontBtn = document.getElementById('bring-to-front');
    const sendToBackBtn = document.getElementById('send-to-back');
    const flipHorizontalBtn = document.getElementById('flip-horizontal');
    const flipVerticalBtn = document.getElementById('flip-vertical');
    
    // State variables
    let activeCategory = 'people'; // 默认激活people类别
    let selectedImage = null;
    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
    let startX, startY;
    let currentX, currentY;
    let offsetX, offsetY;
    let currentZIndex = 1;
    let resizeHandle = null;
    let originalWidth, originalHeight, originalAngle, originalLeft, originalTop;
    let highestZIndex = 0;
    
    // Layers management
    let layers = []; // Array to store all canvas layers
    let selectedLayerId = null;
    let layerIdCounter = 1;
    
    // Initialize
    loadImages(activeCategory);
    
    // 添加水印到画布
    addWatermark();
    
    // Set the first category as active
    categories.forEach(category => {
        if (category.dataset.category === activeCategory) {
            category.classList.add('active');
        } else {
            category.classList.remove('active');
        }
    });
    
    // Help button functionality
    const helpDialog = document.getElementById('help-dialog');
    const closeBtn = document.querySelector('.close-btn');
    
    helpBtn.addEventListener('click', function() {
        helpDialog.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        helpDialog.style.display = 'none';
    });
    
    // Close dialog when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === helpDialog) {
            helpDialog.style.display = 'none';
        }
    });
    
    // Window control buttons functionality (for Windows 95 style)
    const windowButtons = document.querySelectorAll('.window-button');
    
    windowButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Just for visual effect - no actual functionality
            if (this.classList.contains('minimize')) {
                // Flash effect for minimize
                const parentWindow = this.closest('.sidebar, .canvas-container');
                const originalOpacity = parentWindow.style.opacity || 1;
                parentWindow.style.opacity = 0.5;
                setTimeout(() => {
                    parentWindow.style.opacity = originalOpacity;
                }, 200);
            } else if (this.classList.contains('maximize')) {
                // Toggle "maximized" class for maximize
                const parentWindow = this.closest('.sidebar, .canvas-container');
                parentWindow.classList.toggle('maximized');
            } else if (this.classList.contains('close')) {
                // Flash effect for close
                const parentWindow = this.closest('.sidebar, .canvas-container');
                const originalOpacity = parentWindow.style.opacity || 1;
                parentWindow.style.opacity = 0.5;
                setTimeout(() => {
                    parentWindow.style.opacity = originalOpacity;
                }, 200);
            }
        });
    });
    
    // Event Listeners for Categories
    categories.forEach(category => {
        category.addEventListener('click', function(e) {
            // 移除对上传按钮的检查，因为我们将禁用上传功能
            
            // Remove active class from all categories
            categories.forEach(cat => cat.classList.remove('active'));
            
            // Add active class to clicked category
            this.classList.add('active');
            
            // Update active category
            activeCategory = this.dataset.category;
            
            // Load images for this category
            loadImages(activeCategory);
        });
    });
    
    // 移除文件上传相关的事件监听器和函数
    
    // Clear Canvas Button
    clearCanvasBtn.addEventListener('click', function() {
        canvas.innerHTML = '';
        currentZIndex = 1;
        highestZIndex = 0;
        
        // Clear layers panel
        layers = [];
        selectedLayerId = null;
        selectedImage = null;
        renderLayersPanel();
        
        // 重新添加水印
        addWatermark();
    });
    
    // Save Canvas Button - 使用真正的保存功能
    saveCanvasBtn.addEventListener('click', function() {
        // 临时隐藏所有控制元素
        const allControls = canvas.querySelectorAll('.transform-controls');
        allControls.forEach(control => {
            control.style.visibility = 'hidden';
        });
        
        // 临时隐藏图层控制菜单
        const layerControlsMenu = document.getElementById('layer-controls-menu');
        const originalDisplayStyle = layerControlsMenu.style.display;
        layerControlsMenu.style.display = 'none';
        
        // 使用html2canvas库将画布转换为图像
        html2canvasPromise(canvas).then(function(canvasElement) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'jakcanvas-' + new Date().toISOString().slice(0, 10) + '.png';
            link.href = canvasElement.toDataURL('image/png');
            link.click();
            
            // 恢复控制元素
            allControls.forEach(control => {
                if (control.parentElement.classList.contains('selected')) {
                    control.style.visibility = 'visible';
                }
            });
            
            // 恢复图层控制菜单
            layerControlsMenu.style.display = originalDisplayStyle;
        });
    });
    
    // Layer Control Buttons
    bringForwardBtn.addEventListener('click', function() {
        if (selectedImage) {
            const zIndex = parseInt(selectedImage.style.zIndex || 1);
            selectedImage.style.zIndex = zIndex + 1;
            highestZIndex = Math.max(highestZIndex, zIndex + 1);
            updateLayerZIndex(selectedImage, zIndex + 1);
        }
    });
    
    sendBackwardBtn.addEventListener('click', function() {
        if (selectedImage && parseInt(selectedImage.style.zIndex || 1) > 1) {
            const zIndex = parseInt(selectedImage.style.zIndex || 1);
            const newZIndex = Math.max(1, zIndex - 1);
            selectedImage.style.zIndex = newZIndex;
            updateLayerZIndex(selectedImage, newZIndex);
        }
    });
    
    bringToFrontBtn.addEventListener('click', function() {
        if (selectedImage) {
            highestZIndex += 1;
            selectedImage.style.zIndex = highestZIndex;
            updateLayerZIndex(selectedImage, highestZIndex);
        }
    });
    
    sendToBackBtn.addEventListener('click', function() {
        if (selectedImage) {
            // Move all other images up one layer
            const canvasImages = document.querySelectorAll('.canvas-image');
            canvasImages.forEach(img => {
                if (img !== selectedImage && parseInt(img.style.zIndex || 1) === 1) {
                    img.style.zIndex = parseInt(img.style.zIndex || 1) + 1;
                    highestZIndex = Math.max(highestZIndex, parseInt(img.style.zIndex));
                    updateLayerZIndex(img, parseInt(img.style.zIndex));
                }
            });
            selectedImage.style.zIndex = 1;
            updateLayerZIndex(selectedImage, 1);
        }
    });
    
    // Flip Horizontal Button
    flipHorizontalBtn.addEventListener('click', function() {
        if (selectedImage) {
            const currentTransform = selectedImage.style.transform || '';
            let scaleX = 1;
            let scaleY = 1;
            let rotation = 0;
            
            // Parse existing transform values
            const scaleXMatch = currentTransform.match(/scaleX\(([-\d.]+)\)/);
            const scaleYMatch = currentTransform.match(/scaleY\(([-\d.]+)\)/);
            const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
            
            if (scaleXMatch) scaleX = parseFloat(scaleXMatch[1]);
            if (scaleYMatch) scaleY = parseFloat(scaleYMatch[1]);
            if (rotateMatch) rotation = parseFloat(rotateMatch[1]);
            
            // Flip horizontal by inverting scaleX
            scaleX = -scaleX;
            
            // Apply the new transform
            selectedImage.style.transform = `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotation}deg)`;
            
            // Store the flip state for future reference
            selectedImage.dataset.flippedX = scaleX < 0 ? 'true' : 'false';
        }
    });
    
    // Flip Vertical Button
    flipVerticalBtn.addEventListener('click', function() {
        if (selectedImage) {
            const currentTransform = selectedImage.style.transform || '';
            let scaleX = 1;
            let scaleY = 1;
            let rotation = 0;
            
            // Parse existing transform values
            const scaleXMatch = currentTransform.match(/scaleX\(([-\d.]+)\)/);
            const scaleYMatch = currentTransform.match(/scaleY\(([-\d.]+)\)/);
            const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
            
            if (scaleXMatch) scaleX = parseFloat(scaleXMatch[1]);
            if (scaleYMatch) scaleY = parseFloat(scaleYMatch[1]);
            if (rotateMatch) rotation = parseFloat(rotateMatch[1]);
            
            // Flip vertical by inverting scaleY
            scaleY = -scaleY;
            
            // Apply the new transform
            selectedImage.style.transform = `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotation}deg)`;
            
            // Store the flip state for future reference
            selectedImage.dataset.flippedY = scaleY < 0 ? 'true' : 'false';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && selectedImage) {
            // Remove from layers panel
            const layerId = selectedImage.dataset.layerId;
            if (layerId) {
                deleteLayer(layerId);
            } else {
                selectedImage.remove();
                selectedImage = null;
            }
        }
        
        // Flip shortcuts - H for horizontal, V for vertical
        if (e.key.toLowerCase() === 'h' && selectedImage && !e.ctrlKey && !e.altKey) {
            flipHorizontalBtn.click();
        }
        
        if (e.key.toLowerCase() === 'v' && selectedImage && !e.ctrlKey && !e.altKey) {
            flipVerticalBtn.click();
        }
    });
    
    // Add click event to canvas to deselect when clicking on empty space
    canvas.addEventListener('click', function(e) {
        // Only deselect if clicking directly on the canvas, not on any image
        if (e.target === canvas) {
            deselectCurrentImage();
        }
    });
    
    // Function to deselect the current image
    function deselectCurrentImage() {
        deselectImage();
    }
    
    // Function to load images for a category
    function loadImages(category) {
        // Clear current images
        imagesContainer.innerHTML = '';
        
        // 获取预设的图片
        const images = getPresetImagesForCategory(category);
        
        // 计算每行可以容纳的图片数量
        const containerWidth = imagesContainer.clientWidth;
        const itemWidth = 76; // 与CSS中的.image-item宽度保持一致
        const itemsPerRow = Math.floor(containerWidth / itemWidth);
        
        // Add images to the container
        images.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.draggable = true;
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt || 'Image';
            img.dataset.src = image.src;
            
            // 确保图片适当填充容器
            img.style.objectFit = 'contain';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            
            const imageName = document.createElement('div');
            imageName.className = 'image-name';
            imageName.textContent = image.alt || 'Image';
            imageName.title = image.alt || 'Image'; // 添加title属性，鼠标悬停时显示完整名称
            
            imageContainer.appendChild(img);
            imageItem.appendChild(imageContainer);
            imageItem.appendChild(imageName);
            imagesContainer.appendChild(imageItem);
            
            // Add drag start event
            imageItem.addEventListener('dragstart', handleDragStart);
            
            // Add click event to add image to canvas
            imageItem.addEventListener('click', function() {
                // Add image to center of canvas
                const canvasRect = canvas.getBoundingClientRect();
                const centerX = canvasRect.width / 2;
                const centerY = canvasRect.height / 2;
                addImageToCanvas(img.dataset.src, canvasRect.left + centerX, canvasRect.top + centerY);
            });
        });
    }
    
    // 获取预设的图片路径
    function getPresetImagesForCategory(category) {
        const images = [];
        
        // 根据类别返回对应文件夹中的图片路径
        switch(category) {
            case 'people':
                // 添加people文件夹中的图片
                for (let i = 1; i <= 38; i++) {
                    images.push({
                        src: `images/people/${i}.png`,
                        alt: `Person ${i}`
                    });
                }
                break;
            case 'face':
                // 添加face文件夹中的图片
                for (let i = 1; i <= 268; i++) {
                    images.push({
                        src: `images/face/${i}.png`,
                        alt: `Face ${i}`
                    });
                }
                break;
            case 'body_parts':
                // 添加body_parts文件夹中的图片
                for (let i = 1; i <= 8; i++) {
                    images.push({
                        src: `images/body_parts/${i}.png`,
                        alt: `Body Part ${i}`
                    });
                }
                break;
            case 'cloth':
                // 添加cloth文件夹中的图片
                for (let i = 1; i <= 177; i++) {
                    images.push({
                        src: `images/cloth/${i}.png`,
                        alt: `Clothing ${i}`
                    });
                }
                break;
            case 'accessories':
                // 添加accessories文件夹中的图片
                for (let i = 1; i <= 49; i++) {
                    images.push({
                        src: `images/accessories/${i}.png`,
                        alt: `Accessory ${i}`
                    });
                }
                break;
            case 'glass':
                // 添加glass文件夹中的图片
                for (let i = 1; i <= 20; i++) {
                    images.push({
                        src: `images/glass/${i}.png`,
                        alt: `Glass ${i}`
                    });
                }
                break;
            case 'hats':
                // 添加hats文件夹中的图片
                for (let i = 1; i <= 74; i++) {
                    images.push({
                        src: `images/hats/${i}.png`,
                        alt: `Hat ${i}`
                    });
                }
                break;
        }
        
        // 如果没有找到预设图片，创建占位符图片
        if (images.length === 0) {
            return createPlaceholderImages(category);
        }
        
        return images;
    }
    
    // 创建占位符图片
    function createPlaceholderImages(category) {
        // 默认占位符图片
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const images = [];
        
        // 创建描述性名称
        let namePrefix;
        switch(category) {
            case 'people':
                namePrefix = 'Person';
                break;
            case 'face':
                namePrefix = 'Face';
                break;
            case 'body_parts':
                namePrefix = 'Body Part';
                break;
            case 'cloth':
                namePrefix = 'Clothing';
                break;
            case 'accessories':
                namePrefix = 'Accessory';
                break;
            case 'glass':
                namePrefix = 'Glass';
                break;
            case 'hats':
                namePrefix = 'Hat';
                break;
            default:
                namePrefix = 'Item';
        }
        
        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(0, 0, 100, 100);
            
            images.push({
                src: canvas.toDataURL(),
                alt: `${namePrefix} ${i+1}`
            });
        }
        
        return images;
    }
    
    // Drag and Drop Functionality
    function handleDragStart(e) {
        const img = e.currentTarget.querySelector('.image-container img');
        e.dataTransfer.setData('text/plain', img.dataset.src);
        e.dataTransfer.effectAllowed = 'copy';
    }
    
    // Canvas Drop Event
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        
        const imgSrc = e.dataTransfer.getData('text/plain');
        
        if (imgSrc) {
            addImageToCanvas(imgSrc, e.clientX, e.clientY);
        }
    });
    
    // Function to add image to canvas
    function addImageToCanvas(imgSrc, clientX, clientY) {
        const canvasRect = canvas.getBoundingClientRect();
        
        // 取消当前选中的图片
        deselectImage();
        
        // Create image element
        const imgElement = document.createElement('div');
        imgElement.className = 'canvas-image';
        imgElement.style.left = (clientX - canvasRect.left) + 'px';
        imgElement.style.top = (clientY - canvasRect.top) + 'px';
        imgElement.style.zIndex = currentZIndex++;
        imgElement.style.transform = 'scaleX(1) scaleY(1) rotate(0deg)'; // Initialize transform for flip compatibility
        highestZIndex = Math.max(highestZIndex, currentZIndex - 1);
        
        // Assign unique layer ID
        const layerId = `layer_${layerIdCounter++}`;
        imgElement.dataset.layerId = layerId;
        
        // Create the actual image
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = 'Canvas Image';
        img.draggable = false; // Prevent default drag behavior
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Create transform controls
        const transformControls = document.createElement('div');
        transformControls.className = 'transform-controls';
        transformControls.style.display = 'none';
        
        // Create resize handles
        const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `transform-handle ${position}`;
            handle.dataset.handle = position;
            transformControls.appendChild(handle);
        });
        
        // Create rotate handle
        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotate-handle';
        transformControls.appendChild(rotateHandle);
        
        // Add image and controls to the container
        imgElement.appendChild(img);
        imgElement.appendChild(transformControls);
        canvas.appendChild(imgElement);
        
        // Wait for the image to load to set initial size
        img.onload = function() {
            const maxWidth = 300;
            const maxHeight = 300;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            
            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
            }
            
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
            
            imgElement.style.width = width + 'px';
            imgElement.style.height = height + 'px';
            
            // Center the image at the drop position
            imgElement.style.left = (parseInt(imgElement.style.left) - width/2) + 'px';
            imgElement.style.top = (parseInt(imgElement.style.top) - height/2) + 'px';
            
            // Set transform origin for rotation
            imgElement.style.transformOrigin = 'center center';
            
            // Update transform controls size
            updateTransformControlsPosition(imgElement);
            
            // Add to layers panel
            addLayerToPanel(layerId, imgSrc, imgElement);
        };
        
        // Add event listeners for the image
        imgElement.addEventListener('mousedown', handleImageMouseDown);
        
        // Add event listeners for resize handles
        const resizeHandles = imgElement.querySelectorAll('.transform-handle');
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', handleResizeMouseDown);
        });
        
        // Add event listener for rotate handle
        const imgRotateHandle = imgElement.querySelector('.rotate-handle');
        imgRotateHandle.addEventListener('mousedown', handleRotateMouseDown);
        
        // 选择新添加的图片
        selectImage(imgElement);
    }
    
    // Function to handle mouse down on image
    function handleImageMouseDown(e) {
        // Prevent if clicking on a handle
        if (e.target.classList.contains('transform-handle') || 
            e.target.classList.contains('rotate-handle')) {
            return;
        }
        
        // 如果是文本元素，检查是否可编辑
        if (e.currentTarget.classList.contains('canvas-text')) {
            // 如果文本正在编辑中，不触发拖动
            if (e.currentTarget.getAttribute('contenteditable') === 'true') {
                return;
            }
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        // 选择图片并显示控制菜单
        selectImage(e.currentTarget);
        
        // 获取当前图片的位置
        const imgRect = selectedImage.getBoundingClientRect();
        const imgLeft = parseInt(selectedImage.style.left) || 0;
        const imgTop = parseInt(selectedImage.style.top) || 0;
        
        // 计算鼠标在图片内的相对位置
        offsetX = e.clientX - imgRect.left;
        offsetY = e.clientY - imgRect.top;
        
        // 设置拖拽状态
        isDragging = true;
        
        // Add move and up listeners to document
        document.addEventListener('mousemove', handleImageMouseMove);
        document.addEventListener('mouseup', handleImageMouseUp);
    }
    
    // Function to handle mouse move for dragging image
    function handleImageMouseMove(e) {
        if (!isDragging || isResizing || isRotating) return;
        
        e.preventDefault();
        
        const canvasRect = canvas.getBoundingClientRect();
        
        // 计算新位置（鼠标位置减去在图片内的偏移）
        const newX = e.clientX - canvasRect.left - offsetX;
        const newY = e.clientY - canvasRect.top - offsetY;
        
        // 确保图片不会超出画布边界
        const maxX = canvasRect.width - selectedImage.offsetWidth;
        const maxY = canvasRect.height - selectedImage.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));
        
        // 更新位置
        selectedImage.style.left = boundedX + 'px';
        selectedImage.style.top = boundedY + 'px';
        
        // 更新变换控件位置
        updateTransformControlsPosition(selectedImage);
        
        // 更新图层控制菜单位置
        updateLayerControlsPosition();
    }
    
    // Function to handle mouse up after dragging
    function handleImageMouseUp() {
        isDragging = false;
        isResizing = false;
        isRotating = false;
        document.removeEventListener('mousemove', handleImageMouseMove);
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mousemove', handleRotateMouseMove);
        document.removeEventListener('mouseup', handleImageMouseUp);
    }
    
    // Function to handle mouse down on resize handle
    function handleResizeMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isResizing = true;
        resizeHandle = e.target.dataset.handle;
        
        // Store original dimensions
        const imgElement = e.target.closest('.canvas-image');
        originalWidth = imgElement.offsetWidth;
        originalHeight = imgElement.offsetHeight;
        originalLeft = parseInt(imgElement.style.left);
        originalTop = parseInt(imgElement.style.top);
        originalAngle = getRotationAngle(imgElement);
        
        startX = e.clientX;
        startY = e.clientY;
        
        // Add move and up listeners to document
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleImageMouseUp);
    }
    
    // Function to handle mouse move for resizing
    function handleResizeMouseMove(e) {
        if (!isResizing) return;
        
        e.preventDefault();
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const imgElement = selectedImage;
        let newWidth, newHeight, newLeft, newTop;
        
        // If the image is rotated, we need to adjust the resize behavior
        if (originalAngle !== 0) {
            // For simplicity, we'll just scale proportionally when rotated
            const scaleFactor = 1 + (deltaX + deltaY) / (originalWidth + originalHeight);
            newWidth = originalWidth * scaleFactor;
            newHeight = originalHeight * scaleFactor;
            
            // Adjust position to keep centered
            newLeft = originalLeft - (newWidth - originalWidth) / 2;
            newTop = originalTop - (newHeight - originalHeight) / 2;
        } else {
            // Handle different resize directions
            switch (resizeHandle) {
                case 'top-left':
                    newWidth = originalWidth - deltaX;
                    newHeight = originalHeight - deltaY;
                    newLeft = originalLeft + deltaX;
                    newTop = originalTop + deltaY;
                    break;
                case 'top-right':
                    newWidth = originalWidth + deltaX;
                    newHeight = originalHeight - deltaY;
                    newLeft = originalLeft;
                    newTop = originalTop + deltaY;
                    break;
                case 'bottom-left':
                    newWidth = originalWidth - deltaX;
                    newHeight = originalHeight + deltaY;
                    newLeft = originalLeft + deltaX;
                    newTop = originalTop;
                    break;
                case 'bottom-right':
                    newWidth = originalWidth + deltaX;
                    newHeight = originalHeight + deltaY;
                    newLeft = originalLeft;
                    newTop = originalTop;
                    break;
            }
        }
        
        // Enforce minimum size
        if (newWidth >= 20 && newHeight >= 20) {
            imgElement.style.width = newWidth + 'px';
            imgElement.style.height = newHeight + 'px';
            imgElement.style.left = newLeft + 'px';
            imgElement.style.top = newTop + 'px';
            
            // Update transform controls
            updateTransformControlsPosition(imgElement);
        }
    }
    
    // Function to handle mouse down on rotate handle
    function handleRotateMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isRotating = true;
        
        const imgElement = e.target.closest('.canvas-image');
        
        // Calculate center of the image
        const rect = imgElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Store original angle and start position
        originalAngle = getRotationAngle(imgElement);
        startX = e.clientX;
        startY = e.clientY;
        
        // Calculate initial angle from center to mouse
        const initialAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
        
        // Store for later use
        imgElement.dataset.initialAngle = initialAngle;
        imgElement.dataset.originalAngle = originalAngle;
        
        // Add move and up listeners to document
        document.addEventListener('mousemove', handleRotateMouseMove);
        document.addEventListener('mouseup', handleImageMouseUp);
    }
    
    // Function to handle mouse move for rotating
    function handleRotateMouseMove(e) {
        if (!isRotating) return;
        
        e.preventDefault();
        
        const imgElement = selectedImage;
        
        // Calculate center of the image
        const rect = imgElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate current angle from center to mouse
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        
        // Calculate rotation
        const initialAngle = parseFloat(imgElement.dataset.initialAngle);
        const originalAngle = parseFloat(imgElement.dataset.originalAngle);
        const rotation = originalAngle + (currentAngle - initialAngle);
        
        // Get current scale values for flip compatibility
        const currentTransform = imgElement.style.transform || '';
        let scaleX = 1;
        let scaleY = 1;
        
        const scaleXMatch = currentTransform.match(/scaleX\(([-\d.]+)\)/);
        const scaleYMatch = currentTransform.match(/scaleY\(([-\d.]+)\)/);
        
        if (scaleXMatch) scaleX = parseFloat(scaleXMatch[1]);
        if (scaleYMatch) scaleY = parseFloat(scaleYMatch[1]);
        
        // Apply rotation with existing scale values
        imgElement.style.transform = `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotation}deg)`;
        
        // Update transform controls
        updateTransformControlsPosition(imgElement);
    }
    
    // Function to get rotation angle from transform
    function getRotationAngle(element) {
        const transform = window.getComputedStyle(element).getPropertyValue('transform');
        
        if (transform === 'none') {
            return 0;
        }
        
        const values = transform.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        
        return angle;
    }
    
    // Function to update transform controls position
    function updateTransformControlsPosition(imgElement) {
        const transformControls = imgElement.querySelector('.transform-controls');
        
        transformControls.style.width = '100%';
        transformControls.style.height = '100%';
        transformControls.style.top = '0';
        transformControls.style.left = '0';
    }
    
    // 图层控制菜单元素
    const layerControlsMenu = document.getElementById('layer-controls-menu');
    
    // 图层控制按钮事件监听
    bringToFrontBtn.addEventListener('click', function() {
        if (selectedImage) {
            const highestZ = getHighestZIndex();
            selectedImage.style.zIndex = highestZ + 1;
            updateLayerControlsPosition();
        }
    });
    
    bringForwardBtn.addEventListener('click', function() {
        if (selectedImage) {
            const currentZ = parseInt(selectedImage.style.zIndex) || 1;
            selectedImage.style.zIndex = currentZ + 1;
            updateLayerControlsPosition();
        }
    });
    
    sendBackwardBtn.addEventListener('click', function() {
        if (selectedImage) {
            const currentZ = parseInt(selectedImage.style.zIndex) || 1;
            if (currentZ > 1) {
                selectedImage.style.zIndex = currentZ - 1;
                updateLayerControlsPosition();
            }
        }
    });
    
    sendToBackBtn.addEventListener('click', function() {
        if (selectedImage) {
            const images = canvas.querySelectorAll('.canvas-image');
            images.forEach(img => {
                const imgZ = parseInt(img.style.zIndex) || 1;
                if (img !== selectedImage && imgZ <= 1) {
                    img.style.zIndex = imgZ + 1;
                }
            });
            selectedImage.style.zIndex = 1;
            updateLayerControlsPosition();
        }
    });
    
    // 获取最高的z-index值
    function getHighestZIndex() {
        const images = canvas.querySelectorAll('.canvas-image');
        let highest = 0;
        
        images.forEach(img => {
            const zIndex = parseInt(img.style.zIndex) || 1;
            if (zIndex > highest) {
                highest = zIndex;
            }
        });
        
        return highest;
    }
    
    // 更新图层控制菜单位置 - 固定在画板内部的左上角
    function updateLayerControlsPosition() {
        // 确保图层控制菜单已经移动到画板内部
        if (layerControlsMenu.parentElement !== canvas) {
            // 将菜单从当前父元素中移除
            if (layerControlsMenu.parentElement) {
                layerControlsMenu.parentElement.removeChild(layerControlsMenu);
            }
            // 添加到画板中
            canvas.appendChild(layerControlsMenu);
        }
        
        // 设置菜单样式
        layerControlsMenu.style.display = 'flex';
        layerControlsMenu.style.position = 'absolute';
        layerControlsMenu.style.left = '10px';
        layerControlsMenu.style.top = '10px';
        layerControlsMenu.style.zIndex = '1000'; // 确保菜单在其他元素之上
    }
    
    // 选择图片时显示图层控制菜单
    function selectImage(img) {
        if (selectedImage) {
            selectedImage.classList.remove('selected');
            selectedImage.querySelector('.transform-controls').style.display = 'none';
        }
        
        selectedImage = img;
        selectedImage.classList.add('selected');
        selectedImage.querySelector('.transform-controls').style.display = 'block';
        updateTransformControlsPosition(selectedImage);
        updateLayerControlsPosition();
    }
    
    // 取消选择时不再隐藏图层控制菜单，因为它现在是固定显示的
    function deselectImage() {
        if (selectedImage) {
            selectedImage.classList.remove('selected');
            selectedImage.querySelector('.transform-controls').style.display = 'none';
            selectedImage = null;
        }
    }
    
    // 点击画布空白区域取消选择
    canvas.addEventListener('click', function(e) {
        if (e.target === canvas) {
            deselectImage();
        }
    });
    
    // 处理图片拖动，并更新图层控制菜单位置
    function handleDrag(e) {
        if (!isDragging || !selectedImage) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        selectedImage.style.left = startLeft + dx + 'px';
        selectedImage.style.top = startTop + dy + 'px';
        
        updateTransformControlsPosition(selectedImage);
        updateLayerControlsPosition();
    }
    
    // 预览模式
    let isPreviewMode = false;
    const previewOverlay = document.createElement('div');
    previewOverlay.className = 'preview-overlay';
    previewOverlay.style.position = 'fixed';
    previewOverlay.style.top = '0';
    previewOverlay.style.left = '0';
    previewOverlay.style.width = '100%';
    previewOverlay.style.height = '100%';
    previewOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    previewOverlay.style.zIndex = '9999';
    previewOverlay.style.display = 'none';
    previewOverlay.style.justifyContent = 'center';
    previewOverlay.style.alignItems = 'center';
    document.body.appendChild(previewOverlay);
    
    // 预览按钮功能
    previewCanvasBtn.addEventListener('click', function() {
        if (!isPreviewMode) {
            // 进入预览模式
            isPreviewMode = true;
            
            // 隐藏所有控制元素
            const allControls = canvas.querySelectorAll('.transform-controls');
            allControls.forEach(control => {
                control.style.visibility = 'hidden';
            });
            
            // 隐藏图层控制菜单
            const layerControlsMenu = document.getElementById('layer-controls-menu');
            layerControlsMenu.style.display = 'none';
            
            // 创建预览图像
            const previewImage = document.createElement('img');
            
            // 使用html2canvas库将画布转换为图像
            html2canvasPromise(canvas).then(function(canvasElement) {
                previewImage.src = canvasElement.toDataURL('image/png');
                previewImage.style.maxWidth = '90%';
                previewImage.style.maxHeight = '90%';
                previewImage.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
                
                // 清空并显示预览覆盖层
                previewOverlay.innerHTML = '';
                previewOverlay.appendChild(previewImage);
                previewOverlay.style.display = 'flex';
                
                // 点击预览覆盖层的任何区域退出预览模式
                previewOverlay.addEventListener('click', exitPreviewMode);
            });
        } else {
            exitPreviewMode();
        }
    });
    
    // 退出预览模式
    function exitPreviewMode() {
        isPreviewMode = false;
        previewOverlay.style.display = 'none';
        
        // 恢复所有控制元素
        const allControls = canvas.querySelectorAll('.transform-controls');
        allControls.forEach(control => {
            if (control.parentElement.classList.contains('selected')) {
                control.style.visibility = 'visible';
            }
        });
        
        // 恢复显示图层控制菜单
        const layerControlsMenu = document.getElementById('layer-controls-menu');
        layerControlsMenu.style.display = 'flex';
    }
    
    // 下载按钮功能
    downloadCanvasBtn.addEventListener('click', function() {
        // 临时隐藏所有控制元素
        const allControls = canvas.querySelectorAll('.transform-controls');
        allControls.forEach(control => {
            control.style.visibility = 'hidden';
        });
        
        // 临时隐藏图层控制菜单
        const layerControlsMenu = document.getElementById('layer-controls-menu');
        const originalDisplayStyle = layerControlsMenu.style.display;
        layerControlsMenu.style.display = 'none';
        
        // 使用html2canvas库将画布转换为图像
        html2canvasPromise(canvas).then(function(canvasElement) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'canvas-' + new Date().toISOString().slice(0, 10) + '.png';
            link.href = canvasElement.toDataURL('image/png');
            link.click();
            
            // 恢复控制元素
            allControls.forEach(control => {
                if (control.parentElement.classList.contains('selected')) {
                    control.style.visibility = 'visible';
                }
            });
            
            // 恢复图层控制菜单
            layerControlsMenu.style.display = originalDisplayStyle;
        });
    });
    
    // html2canvas Promise包装函数
    function html2canvasPromise(element) {
        return new Promise((resolve, reject) => {
            // 检查是否已加载html2canvas
            if (typeof html2canvas === 'undefined') {
                // 动态加载html2canvas
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                script.onload = () => {
                    // 加载完成后执行转换
                    html2canvas(element, {
                        allowTaint: true,
                        useCORS: true,
                        backgroundColor: null
                    }).then(resolve).catch(reject);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            } else {
                // 已加载，直接执行
                html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    backgroundColor: null
                }).then(resolve).catch(reject);
            }
        });
    }
    
    // 文字功能实现
    addTextBtn.addEventListener('click', function() {
        addTextToCanvas();
    });
    
    // 添加文字到画布
    function addTextToCanvas() {
        // 取消当前选中的元素
        deselectImage();
        
        // 创建文字元素
        const textElement = document.createElement('div');
        textElement.className = 'canvas-text canvas-image'; // 重用canvas-image类以便共享拖拽等功能
        textElement.setAttribute('contenteditable', 'false');
        textElement.innerHTML = 'Click to Edit Text';
        textElement.style.position = 'absolute';

        // 计算画布中心位置
        const canvasRect = canvas.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;

        // 设置初始位置为画布中心
        textElement.style.left = (centerX - 75) + 'px'; // 假设文本宽度约为150px
        textElement.style.top = (centerY - 20) + 'px';  // 假设文本高度约为40px

        textElement.style.color = '#000000';
        textElement.style.fontSize = '24px';
        textElement.style.fontFamily = 'Arial, sans-serif';
        textElement.style.padding = '10px';
        textElement.style.zIndex = currentZIndex++;
        highestZIndex = Math.max(highestZIndex, currentZIndex - 1);
        
        // Assign unique layer ID for text
        const layerId = `layer_${layerIdCounter++}`;
        textElement.dataset.layerId = layerId;
        
        // 添加到画布
        canvas.appendChild(textElement);
        
        // 创建变换控件
        const transformControls = document.createElement('div');
        transformControls.className = 'transform-controls';
        transformControls.style.display = 'none';
        
        // 创建调整大小的控件
        const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `transform-handle ${position}`;
            handle.dataset.handle = position;
            transformControls.appendChild(handle);
        });
        
        // 创建旋转控件
        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotate-handle';
        transformControls.appendChild(rotateHandle);
        
        // 创建文本格式控件
        const textControls = document.createElement('div');
        textControls.className = 'text-controls';
        textControls.style.position = 'absolute';
        textControls.style.bottom = '-40px';
        textControls.style.left = '0';
        textControls.style.display = 'flex';
        textControls.style.gap = '5px';
        textControls.style.backgroundColor = '#f0f0f0';
        textControls.style.padding = '5px';
        textControls.style.borderRadius = '3px';
        textControls.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        // 添加颜色选择器
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = '#000000';
        colorPicker.style.width = '25px';
        colorPicker.style.height = '25px';
        colorPicker.addEventListener('input', function() {
            textElement.style.color = this.value;
        });
        
        // 添加字体大小选择器
        const fontSizeSelect = document.createElement('select');
        [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].forEach(size => {
            const option = document.createElement('option');
            option.value = size + 'px';
            option.textContent = size;
            if (size === 24) option.selected = true;
            fontSizeSelect.appendChild(option);
        });
        fontSizeSelect.addEventListener('change', function() {
            textElement.style.fontSize = this.value;
        });
        
        // 添加字体选择器
        const fontSelect = document.createElement('select');
        ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS'].forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
        });
        fontSelect.addEventListener('change', function() {
            textElement.style.fontFamily = this.value;
        });
        
        // 添加粗体按钮
        const boldBtn = document.createElement('button');
        boldBtn.innerHTML = 'B';
        boldBtn.style.fontWeight = 'bold';
        boldBtn.addEventListener('click', function() {
            if (textElement.style.fontWeight === 'bold') {
                textElement.style.fontWeight = 'normal';
            } else {
                textElement.style.fontWeight = 'bold';
            }
        });
        
        // 添加斜体按钮
        const italicBtn = document.createElement('button');
        italicBtn.innerHTML = 'I';
        italicBtn.style.fontStyle = 'italic';
        italicBtn.addEventListener('click', function() {
            if (textElement.style.fontStyle === 'italic') {
                textElement.style.fontStyle = 'normal';
            } else {
                textElement.style.fontStyle = 'italic';
            }
        });
        
        // 添加控件到文本控件容器
        textControls.appendChild(colorPicker);
        textControls.appendChild(fontSizeSelect);
        textControls.appendChild(fontSelect);
        textControls.appendChild(boldBtn);
        textControls.appendChild(italicBtn);
        
        // 将文本控件添加到变换控件中
        transformControls.appendChild(textControls);
        
        // 添加变换控件到文本元素
        textElement.appendChild(transformControls);
        
        // 添加事件监听器
        textElement.addEventListener('mousedown', handleImageMouseDown);
        
        // 添加调整大小控件的事件监听器
        const resizeHandles = textElement.querySelectorAll('.transform-handle');
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', handleResizeMouseDown);
        });
        
        // 添加旋转控件的事件监听器
        const textRotateHandle = textElement.querySelector('.rotate-handle');
        textRotateHandle.addEventListener('mousedown', handleRotateMouseDown);
        
        // 添加双击编辑功能
        textElement.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            this.setAttribute('contenteditable', 'true');
            this.focus();
            document.execCommand('selectAll', false, null);
        });
        
        // 添加单击编辑功能
        textElement.addEventListener('click', function(e) {
            // 如果已经在拖动中，不触发编辑
            if (isDragging) return;
            
            // 如果点击的是控制元素，不触发编辑
            if (e.target.classList.contains('transform-handle') || 
                e.target.classList.contains('rotate-handle') ||
                e.target.closest('.text-controls')) {
                return;
            }
            
            e.stopPropagation();
            this.setAttribute('contenteditable', 'true');
            this.focus();
        });
        
        // 添加失焦保存功能
        textElement.addEventListener('blur', function() {
            if (this.textContent.trim() === '') {
                this.textContent = '点击编辑文字';
            }
            
            // Update layer panel when text content changes
            const layerId = this.dataset.layerId;
            const layer = layers.find(l => l.id === layerId);
            if (layer && layer.type === 'text') {
                layer.textContent = this.textContent;
                renderLayersPanel();
            }
            
            // 失焦后重新启用拖动功能
            setTimeout(() => {
                // 短暂延时确保其他事件处理完成
                this.setAttribute('contenteditable', 'false');
                // 确保文本控件可见
                if (this.classList.contains('selected')) {
                    const transformControls = this.querySelector('.transform-controls');
                    if (transformControls) {
                        transformControls.style.display = 'block';
                        updateTransformControlsPosition(this);
                    }
                }
            }, 100);
        });
        
        // 阻止键盘事件冒泡，以防止在编辑文本时触发画布快捷键
        textElement.addEventListener('keydown', function(e) {
            e.stopPropagation();
        });
        
        // Add text to layers panel with special text icon
        addTextLayerToPanel(layerId, textElement);
        
        // 选中新添加的文本
        selectImage(textElement);
    }
    
    // Community button functionality
    communityBtn.addEventListener('click', function() {
        window.open('https://x.com/JakOSfun', '_blank');
    });

    // Chart button functionality
    chartBtn.addEventListener('click', function() {
        window.open('https://pump.fun/coin/Bvtzt8iJfxeqimGrU4YYcciQaNgVNtr4fsiDTMs9pump', '_blank');
    });
    
    // 初始化时显示图层控制菜单
    updateLayerControlsPosition();
    
    // 水印功能
    function addWatermark() {
        // 创建水印元素
        const watermark = document.createElement('div');
        watermark.className = 'canvas-watermark';
        watermark.textContent = 'JAKOS -- $JAK';
        watermark.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            font-family: 'MS Sans Serif', sans-serif;
            font-size: 14px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.3);
            pointer-events: none;
            user-select: none;
            z-index: 999;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
            transform: rotate(-15deg);
        `;
        
        // 将水印添加到画布
        canvas.appendChild(watermark);
    }
    
    // Layers Panel Management Functions
    function addLayerToPanel(layerId, imageSrc, element) {
        const layerData = {
            id: layerId,
            name: `Image ${layers.length + 1}`,
            imageSrc: imageSrc,
            element: element,
            visible: true,
            zIndex: element.style.zIndex,
            type: 'image'
        };
        
        layers.push(layerData);
        renderLayersPanel();
        selectLayer(layerId);
    }
    
    function addTextLayerToPanel(layerId, element) {
        const layerData = {
            id: layerId,
            name: `Text ${layers.filter(l => l.type === 'text').length + 1}`,
            imageSrc: null,
            element: element,
            visible: true,
            zIndex: element.style.zIndex,
            type: 'text',
            textContent: element.textContent || 'Text'
        };
        
        layers.push(layerData);
        renderLayersPanel();
        selectLayer(layerId);
    }
    
    function renderLayersPanel() {
        const layersList = document.getElementById('layers-list');
        const layerCount = document.querySelector('.layer-count');
        
        // Update layer count
        layerCount.textContent = `${layers.length} layers`;
        
        if (layers.length === 0) {
            layersList.innerHTML = `
                <div class="empty-layers">
                    <div class="empty-icon">📄</div>
                    <p>No layers yet</p>
                    <small>Add images to see layers</small>
                </div>
            `;
            return;
        }
        
        // Sort layers by z-index (highest first)
        const sortedLayers = [...layers].sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
        
        layersList.innerHTML = sortedLayers.map(layer => `
            <div class="layer-item ${selectedLayerId === layer.id ? 'selected' : ''}" 
                 data-layer-id="${layer.id}"
                 draggable="true">
                <div class="layer-drag-handle">⋮⋮</div>
                <div class="layer-thumbnail">
                    ${layer.type === 'text' 
                        ? `<div style="display: flex; align-items: center; justify-content: center; font-size: 16px;">📝</div>`
                        : `<img src="${layer.imageSrc}" alt="${layer.name}">`
                    }
                </div>
                <div class="layer-info-container">
                    <div class="layer-name">${layer.name}</div>
                    <div class="layer-details">
                        ${layer.type === 'text' 
                            ? `"${(layer.textContent || 'Text').substring(0, 15)}${layer.textContent && layer.textContent.length > 15 ? '...' : ''}"` 
                            : `Z-index: ${layer.zIndex}`
                        }
                    </div>
                </div>
                <div class="layer-visibility ${layer.visible ? '' : 'hidden'}" 
                     data-layer-id="${layer.id}">
                    ${layer.visible ? '👁️' : '🚫'}
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        addLayerEventListeners();
        addLayerDragEventListeners();
    }
    
    function addLayerEventListeners() {
        const layerItems = document.querySelectorAll('.layer-item');
        const visibilityButtons = document.querySelectorAll('.layer-visibility');
        
        // Layer selection
        layerItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('layer-visibility') && 
                    !e.target.classList.contains('layer-drag-handle')) {
                    const layerId = item.dataset.layerId;
                    selectLayer(layerId);
                    
                    // Also select the image on canvas
                    const layer = layers.find(l => l.id === layerId);
                    if (layer) {
                        selectImage(layer.element);
                    }
                }
            });
        });
        
        // Visibility toggle
        visibilityButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const layerId = btn.dataset.layerId;
                toggleLayerVisibility(layerId);
            });
        });
    }
    
    function addLayerDragEventListeners() {
        const layerItems = document.querySelectorAll('.layer-item');
        let draggedElement = null;
        let draggedLayerId = null;
        
        layerItems.forEach(item => {
            // Drag start
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                draggedLayerId = item.dataset.layerId;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
            });
            
            // Drag end
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                document.querySelectorAll('.layer-item').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom');
                });
                draggedElement = null;
                draggedLayerId = null;
            });
            
            // Drag over
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (draggedElement && draggedElement !== item) {
                    const rect = item.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;
                    
                    // Clear all drag over classes
                    document.querySelectorAll('.layer-item').forEach(el => {
                        el.classList.remove('drag-over-top', 'drag-over-bottom');
                    });
                    
                    // Add appropriate class based on position
                    if (e.clientY < midpoint) {
                        item.classList.add('drag-over-top');
                    } else {
                        item.classList.add('drag-over-bottom');
                    }
                }
            });
            
            // Drag leave
            item.addEventListener('dragleave', (e) => {
                // Only remove classes if we're truly leaving the element
                if (!item.contains(e.relatedTarget)) {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                }
            });
            
            // Drop
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                
                if (draggedLayerId && draggedLayerId !== item.dataset.layerId) {
                    const targetLayerId = item.dataset.layerId;
                    const draggedLayer = layers.find(l => l.id === draggedLayerId);
                    const targetLayer = layers.find(l => l.id === targetLayerId);
                    
                    if (draggedLayer && targetLayer) {
                        const rect = item.getBoundingClientRect();
                        const midpoint = rect.top + rect.height / 2;
                        const isDropAbove = e.clientY < midpoint;
                        
                        reorderLayers(draggedLayerId, targetLayerId, isDropAbove);
                    }
                }
                
                // Clean up drag classes
                document.querySelectorAll('.layer-item').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom');
                });
            });
        });
    }
    
    function reorderLayers(draggedLayerId, targetLayerId, insertAbove) {
        const draggedLayer = layers.find(l => l.id === draggedLayerId);
        const targetLayer = layers.find(l => l.id === targetLayerId);
        
        if (!draggedLayer || !targetLayer) return;
        
        // Get all layers sorted by current z-index
        const sortedLayers = [...layers].sort((a, b) => parseInt(a.zIndex) - parseInt(b.zIndex));
        
        // Find target position in sorted array
        const targetIndex = sortedLayers.findIndex(l => l.id === targetLayerId);
        
        // Calculate new z-index for dragged layer
        let newZIndex;
        
        if (insertAbove) {
            // Insert above target (higher z-index)
            if (targetIndex === sortedLayers.length - 1) {
                // Target is the topmost layer
                newZIndex = parseInt(targetLayer.zIndex) + 1;
            } else {
                // Insert between target and the layer above it
                const layerAbove = sortedLayers[targetIndex + 1];
                newZIndex = Math.floor((parseInt(targetLayer.zIndex) + parseInt(layerAbove.zIndex)) / 2);
                
                // If there's no room between layers, shift all layers above
                if (newZIndex <= parseInt(targetLayer.zIndex)) {
                    newZIndex = parseInt(targetLayer.zIndex) + 1;
                    // Shift layers above target
                    for (let i = targetIndex + 1; i < sortedLayers.length; i++) {
                        const layer = sortedLayers[i];
                        if (layer.id !== draggedLayerId) {
                            layer.zIndex = parseInt(layer.zIndex) + 1;
                            layer.element.style.zIndex = layer.zIndex;
                        }
                    }
                }
            }
        } else {
            // Insert below target (lower z-index)
            if (targetIndex === 0) {
                // Target is the bottommost layer
                newZIndex = parseInt(targetLayer.zIndex) - 1;
                if (newZIndex < 1) {
                    // Shift all layers up
                    sortedLayers.forEach(layer => {
                        if (layer.id !== draggedLayerId) {
                            layer.zIndex = parseInt(layer.zIndex) + 1;
                            layer.element.style.zIndex = layer.zIndex;
                        }
                    });
                    newZIndex = 1;
                }
            } else {
                // Insert between target and the layer below it
                const layerBelow = sortedLayers[targetIndex - 1];
                newZIndex = Math.floor((parseInt(targetLayer.zIndex) + parseInt(layerBelow.zIndex)) / 2);
                
                // If there's no room between layers, shift all layers below
                if (newZIndex >= parseInt(targetLayer.zIndex)) {
                    newZIndex = parseInt(targetLayer.zIndex) - 1;
                    if (newZIndex < 1) {
                        // Shift all layers up
                        for (let i = 0; i < targetIndex; i++) {
                            const layer = sortedLayers[i];
                            if (layer.id !== draggedLayerId) {
                                layer.zIndex = parseInt(layer.zIndex) + 1;
                                layer.element.style.zIndex = layer.zIndex;
                            }
                        }
                        newZIndex = 1;
                    }
                }
            }
        }
        
        // Update dragged layer's z-index
        draggedLayer.zIndex = newZIndex;
        draggedLayer.element.style.zIndex = newZIndex;
        
        // Re-render layers panel
        renderLayersPanel();
    }
    
    function selectLayer(layerId) {
        selectedLayerId = layerId;
        renderLayersPanel();
        
        // Update layer control buttons
        const deleteBtn = document.getElementById('delete-layer');
        
        deleteBtn.disabled = !selectedLayerId;
    }
    
    function toggleLayerVisibility(layerId) {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            layer.element.style.display = layer.visible ? 'block' : 'none';
            renderLayersPanel();
        }
    }
    
    function deleteLayer(layerId) {
        const layerIndex = layers.findIndex(l => l.id === layerId);
        if (layerIndex !== -1) {
            const layer = layers[layerIndex];
            
            // Remove from canvas
            if (layer.element.parentNode) {
                layer.element.parentNode.removeChild(layer.element);
            }
            
            // Remove from layers array
            layers.splice(layerIndex, 1);
            
            // Update selection
            if (selectedLayerId === layerId) {
                selectedLayerId = null;
                deselectImage();
            }
            
            renderLayersPanel();
        }
    }
    

    // Layer control button event listeners
    document.getElementById('delete-layer').addEventListener('click', () => {
        if (selectedLayerId) {
            deleteLayer(selectedLayerId);
        }
    });
    

    // Update layer z-index when image is selected
    function updateLayerZIndex(element, newZIndex) {
        const layerId = element.dataset.layerId;
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            layer.zIndex = newZIndex;
            renderLayersPanel();
        }
    }
    
    // Initialize layers panel
    renderLayersPanel();
}); 
