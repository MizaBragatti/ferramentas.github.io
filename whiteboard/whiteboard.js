class Whiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboard');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'select';
        this.isDrawing = false;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        
        // Dragging properties
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // Resize properties
        this.isResizing = false;
        this.resizeHandle = null;
        this.resizeStartBounds = null;
        
        // Rotation properties
        this.isRotating = false;
        this.rotationStart = null;
        this.initialRotation = null;
        
        // Selection handles
        this.selectionHandles = [];
        
        // Selection box properties
        this.isSelectionBoxActive = false;
        this.selectionBoxStart = { x: 0, y: 0 };
        this.selectionBoxEnd = { x: 0, y: 0 };
        this.selectedObjects = [];
        
        // Undo/Redo system
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySize = 50;
        
        // Canvas properties
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.minScale = 0.1;
        this.maxScale = 5;
        
        // Drawing properties
        this.strokeColor = '#000000';
        this.strokeWidth = 3;
        this.fillColor = 'transparent';
        
        // Objects storage
        this.objects = [];
        this.selectedObject = null;
        this.clipboard = null;
        
        // Note properties
        this.selectedNoteColor = '#ffeb3b';
        
        this.initCanvas();
        this.bindEvents();
        this.initMobileFeatures();
        this.updateCanvasSize();
    }
    
    initCanvas() {
        this.updateCanvasSize();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.saveState(); // Save initial empty state
        this.redraw();
        // Touch tracking properties
        this.lastTouchDistance = 0;
        this.lastTouchCenter = { x: 0, y: 0 };
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.isMultiTouch = false;
        this.lastTapTime = 0;
        this.tapCount = 0;
    }
    
    updateCanvasSize() {
        const container = document.querySelector('.canvas-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    bindEvents() {
        // Toolbar events
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTool(e.target.closest('.tool-btn').dataset.tool);
            });
        });
        
        // Canvas events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        
        // Click event listener for canvas container to clear note selections
        document.querySelector('.canvas-container').addEventListener('click', (e) => {
            if (e.target === this.canvas || e.target.classList.contains('canvas-container')) {
                // Clear note selections when clicking on empty area
                document.querySelectorAll('.sticky-note').forEach(note => {
                    note.style.boxShadow = '';
                });
                if (this.selectedObject && this.selectedObject.type === 'sticky-note') {
                    this.selectedObject = null;
                    this.showPropertiesPanel(null);
                }
            }
        });
        
        // Color and stroke events
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.strokeColor = e.target.value;
            document.querySelector('.color-preview').style.background = e.target.value;
        });
        
        document.getElementById('strokeWidth').addEventListener('input', (e) => {
            this.strokeWidth = parseInt(e.target.value);
            document.querySelector('.stroke-value').textContent = e.target.value + 'px';
        });
        
        // Note color selection
        document.querySelectorAll('.note-color').forEach(color => {
            color.addEventListener('click', (e) => {
                document.querySelectorAll('.note-color').forEach(c => c.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedNoteColor = e.target.dataset.color;
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Properties panel events
        document.getElementById('propColor').addEventListener('change', (e) => {
            if (this.selectedObject) {
                this.selectedObject.color = e.target.value;
                this.redraw();
            }
        });
        
        document.getElementById('propStroke').addEventListener('input', (e) => {
            if (this.selectedObject) {
                this.selectedObject.width = parseInt(e.target.value);
                document.getElementById('propStrokeValue').textContent = e.target.value + 'px';
                this.redraw();
            }
        });
        
        document.getElementById('propOpacity').addEventListener('input', (e) => {
            if (this.selectedObject) {
                this.selectedObject.opacity = parseFloat(e.target.value);
                document.getElementById('propOpacityValue').textContent = e.target.value;
                this.redraw();
            }
        });
        
        document.getElementById('propWidth').addEventListener('input', (e) => {
            if (this.selectedObject && e.target.value) {
                this.resizeObjectToPixels(this.selectedObject, parseInt(e.target.value), null);
                this.redraw();
            }
        });
        
        document.getElementById('propHeight').addEventListener('input', (e) => {
            if (this.selectedObject && e.target.value) {
                this.resizeObjectToPixels(this.selectedObject, null, parseInt(e.target.value));
                this.redraw();
            }
        });
        
        document.getElementById('propFontSize').addEventListener('input', (e) => {
            if (this.selectedObject && this.selectedObject.type === 'text' && e.target.value) {
                this.selectedObject.fontSize = parseInt(e.target.value);
                this.redraw();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
            this.redraw();
        });
    }
    
    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Update cursor
        const container = document.querySelector('.canvas-container');
        container.className = `canvas-container ${tool}-tool`;
        
        // Provide haptic feedback on mobile
        if (this.isMobile()) {
            this.vibrate(20);
            this.showToolSelectionFeedback(tool);
        }
        
        // Handle special tools
        if (tool === 'text') {
            document.getElementById('textModal').style.display = 'flex';
        } else if (tool === 'note') {
            document.getElementById('noteModal').style.display = 'flex';
        }
    }
    
    showToolSelectionFeedback(tool) {
        // Create temporary visual feedback for mobile
        const feedback = document.createElement('div');
        feedback.className = 'tool-feedback';
        feedback.textContent = this.getToolDisplayName(tool);
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(33, 150, 243, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            pointer-events: none;
            font-size: 16px;
            backdrop-filter: blur(10px);
            opacity: 0;
            animation: toolFeedbackShow 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 800);
    }
    
    getToolDisplayName(tool) {
        const names = {
            'select': 'Selecionar',
            'pen': 'Caneta',
            'eraser': 'Borracha',
            'hand': 'Mover',
            'rectangle': 'Retângulo',
            'rounded-rectangle': 'Retângulo Arredondado',
            'circle': 'Círculo',
            'oval': 'Oval',
            'triangle': 'Triângulo',
            'diamond': 'Losango',
            'line': 'Linha',
            'arrow': 'Seta',
            'text': 'Texto',
            'note': 'Nota',
            'parallelogram': 'Paralelogramo',
            'trapezoid': 'Trapézio',
            'pentagon': 'Pentágono',
            'hexagon': 'Hexágono',
            'octagon': 'Octógono',
            'star': 'Estrela'
        };
        return names[tool] || tool.charAt(0).toUpperCase() + tool.slice(1);
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Simple coordinate conversion
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Convert to logical coordinates based on current transform
        return {
            x: x / this.scale - this.offsetX / this.scale,
            y: y / this.scale - this.offsetY / this.scale
        };
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        const pos = this.getMousePos(e);
        this.startX = pos.x;
        this.startY = pos.y;
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        if (e.button === 1 || (e.button === 0 && e.ctrlKey) || this.currentTool === 'hand') {
            // Middle mouse, Ctrl+click, or hand tool for panning
            this.isPanning = true;
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Check if clicking on a resize or rotation handle
        if (this.currentTool === 'select' && this.selectedObject) {
            const handle = this.getResizeHandleAt(pos);
            if (handle) {
                if (handle === 'rotate') {
                    this.isRotating = true;
                    this.rotationStart = this.calculateAngle(pos, this.getObjectCenter(this.selectedObject));
                    this.initialRotation = this.selectedObject.rotation || 0;
                } else {
                    this.isResizing = true;
                    this.resizeHandle = handle;
                    this.resizeStartBounds = JSON.parse(JSON.stringify(this.getObjectBounds(this.selectedObject)));
                }
                return;
            }
        }
        
        switch (this.currentTool) {
            case 'select':
                const objectAtPos = this.findObjectAt(pos);
                if (objectAtPos) {
                    this.handleSelect(pos);
                } else {
                    // Start selection box if clicking in empty space
                    this.startSelectionBox(pos);
                }
                break;
            case 'hand':
                this.isPanning = true;
                this.canvas.style.cursor = 'grabbing';
                break;
            case 'pen':
                this.startDrawing(pos);
                break;
            case 'eraser':
                this.startErasing(pos);
                break;
            case 'rectangle':
            case 'rounded-rectangle':
            case 'circle':
            case 'oval':
            case 'triangle':
            case 'diamond':
            case 'parallelogram':
            case 'trapezoid':
            case 'pentagon':
            case 'hexagon':
            case 'octagon':
            case 'star':
            case 'line':
            case 'arrow':
                this.startShape(pos);
                break;
        }
    }
    
    handleMouseMove(e) {
        e.preventDefault();
        const pos = this.getMousePos(e);
        
        // Update cursor based on position
        if (this.currentTool === 'select' && this.selectedObject && !this.isResizing && !this.isDragging && !this.isRotating) {
            const handle = this.getResizeHandleAt(pos);
            if (handle) {
                if (handle === 'rotate') {
                    this.canvas.style.cursor = 'grab';
                } else {
                    this.canvas.style.cursor = this.getResizeCursor(handle);
                }
            } else if (this.isPointInObject(pos, this.selectedObject)) {
                this.canvas.style.cursor = 'move';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
        
        if (this.isPanning) {
            const deltaX = (pos.x - this.lastX) * this.scale;
            const deltaY = (pos.y - this.lastY) * this.scale;
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            this.redraw();
        } else if (this.isSelectionBoxActive) {
            // Update selection box
            this.updateSelectionBox(pos);
            this.redraw();
        } else if (this.isRotating && this.selectedObject) {
            // Handle rotation
            const center = this.getObjectCenter(this.selectedObject);
            const currentAngle = this.calculateAngle(pos, center);
            const angleDelta = currentAngle - this.rotationStart;
            this.selectedObject.rotation = this.initialRotation + angleDelta;
            this.redraw();
        } else if (this.isResizing && this.selectedObject && this.resizeHandle) {
            // Handle resizing
            this.resizeObject(this.selectedObject, this.resizeHandle, pos);
            this.redraw();
        } else if (this.isDragging && this.currentTool === 'select') {
            // Move selected object(s)
            const deltaX = pos.x - this.dragStartX;
            const deltaY = pos.y - this.dragStartY;
            
            if (this.selectedObject) {
                this.moveObject(this.selectedObject, deltaX, deltaY);
            } else if (this.selectedObjects.length > 0) {
                // Move all selected objects
                this.selectedObjects.forEach(obj => {
                    this.moveObject(obj, deltaX, deltaY);
                });
            }
            
            this.dragStartX = pos.x;
            this.dragStartY = pos.y;
            this.redraw();
        } else if (this.isDrawing) {
            switch (this.currentTool) {
                case 'pen':
                    this.continuePen(pos);
                    break;
                case 'eraser':
                    this.continueErasing(pos);
                    break;
                case 'rectangle':
                case 'rounded-rectangle':
                case 'circle':
                case 'oval':
                case 'triangle':
                case 'diamond':
                case 'parallelogram':
                case 'trapezoid':
                case 'pentagon':
                case 'hexagon':
                case 'octagon':
                case 'star':
                case 'line':
                case 'arrow':
                    this.updateShape(pos);
                    break;
            }
        }
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    getResizeCursor(direction) {
        const cursors = {
            'nw': 'nw-resize',
            'n': 'n-resize',
            'ne': 'ne-resize',
            'e': 'e-resize',
            'se': 'se-resize',
            's': 's-resize',
            'sw': 'sw-resize',
            'w': 'w-resize'
        };
        return cursors[direction] || 'default';
    }
    
    handleMouseUp(e) {
        e.preventDefault();
        
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = '';
            return;
        }
        
        if (this.isSelectionBoxActive) {
            this.finishSelectionBox();
            return;
        }
        
        if (this.isRotating) {
            this.isRotating = false;
            this.rotationStart = null;
            this.initialRotation = null;
            this.saveState(); // Save state for undo/redo
            return;
        }
        
        if (this.isResizing) {
            this.isResizing = false;
            this.resizeHandle = null;
            this.resizeStartBounds = null;
            this.saveState(); // Save state for undo/redo
            return;
        }
        
        if (this.isDragging) {
            this.isDragging = false;
            this.saveState(); // Save state for undo/redo
            return;
        }
        
        if (this.isDrawing) {
            this.finishDrawing();
        }
        
        this.isDrawing = false;
    }
    
    handleWheel(e) {
        e.preventDefault();
        const pos = this.getMousePos(e);
        
        if (e.ctrlKey || e.metaKey) {
            // Zoom with Ctrl+Scroll
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * scaleFactor));
            
            if (newScale !== this.scale) {
                const scaleChange = newScale / this.scale;
                this.offsetX = pos.x * (1 - scaleChange) * this.scale + this.offsetX * scaleChange;
                this.offsetY = pos.y * (1 - scaleChange) * this.scale + this.offsetY * scaleChange;
                this.scale = newScale;
                
                this.updateZoomDisplay();
                this.redraw();
            }
        } else {
            // Pan with regular scroll
            const panSpeed = 30;
            if (e.shiftKey) {
                // Horizontal pan with Shift+Scroll
                this.offsetX -= e.deltaY > 0 ? panSpeed : -panSpeed;
            } else {
                // Vertical pan
                this.offsetY -= e.deltaY > 0 ? panSpeed : -panSpeed;
            }
            this.redraw();
        }
    }
    
    handleKeyDown(e) {
        // Track Ctrl key state
        this.ctrlKey = e.ctrlKey || e.metaKey;
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 'c':
                    e.preventDefault();
                    this.copy();
                    break;
                case 'v':
                    e.preventDefault();
                    this.paste();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveCanvas();
                    break;
                case 'a':
                    e.preventDefault();
                    this.selectAll();
                    break;
            }
        } else {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    this.deleteSelected();
                    break;
                case 'Escape':
                    this.selectedObject = null;
                    this.selectedObjects = [];
                    this.clearSelectionHandles();
                    this.showPropertiesPanel(null);
                    this.redraw();
                    break;
            }
        }
    }
    
    handleKeyUp(e) {
        // Track Ctrl key state
        this.ctrlKey = e.ctrlKey || e.metaKey;
    }
    
    // Touch events
    handleTouchStart(e) {
        e.preventDefault();
        const touches = e.touches;
        this.touchStartTime = Date.now();
        
        if (touches.length === 1) {
            // Single touch - drawing or selection
            const touch = touches[0];
            this.touchStartPos = { x: touch.clientX, y: touch.clientY };
            this.isMultiTouch = false;
            
            // Convert to mouse event for existing logic
            this.handleMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
                preventDefault: () => {}
            });
        } else if (touches.length === 2) {
            // Two-finger touch - start pinch/zoom or pan
            this.isMultiTouch = true;
            this.lastTouchDistance = this.getTouchDistance(touches[0], touches[1]);
            this.lastTouchCenter = this.getTouchCenter(touches[0], touches[1]);
            
            // Show visual feedback for multi-touch
            this.showMultiTouchFeedback(true);
            
            // Stop any current drawing
            if (this.isDrawing) {
                this.finishDrawing();
                this.isDrawing = false;
            }
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touches = e.touches;
        
        if (touches.length === 1 && !this.isMultiTouch) {
            // Single touch movement
            const touch = touches[0];
            
            // Check if this is a long press (for right-click simulation)
            const moveDistance = Math.sqrt(
                Math.pow(touch.clientX - this.touchStartPos.x, 2) + 
                Math.pow(touch.clientY - this.touchStartPos.y, 2)
            );
            
            if (moveDistance > 10) {
                // Movement detected, treat as normal mouse move
                this.handleMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => {}
                });
            }
        } else if (touches.length === 2) {
            // Two-finger gesture
            this.isMultiTouch = true;
            const currentDistance = this.getTouchDistance(touches[0], touches[1]);
            const currentCenter = this.getTouchCenter(touches[0], touches[1]);
            
            // Pinch to zoom
            if (this.lastTouchDistance > 0) {
                const scaleFactor = currentDistance / this.lastTouchDistance;
                const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * scaleFactor));
                
                if (newScale !== this.scale) {
                    // Get canvas position for zoom center
                    const rect = this.canvas.getBoundingClientRect();
                    const zoomCenterX = (currentCenter.x - rect.left) * (this.canvas.width / rect.width);
                    const zoomCenterY = (currentCenter.y - rect.top) * (this.canvas.height / rect.height);
                    
                    // Adjust offset to zoom around touch center
                    this.offsetX = zoomCenterX - (zoomCenterX - this.offsetX) * (newScale / this.scale);
                    this.offsetY = zoomCenterY - (zoomCenterY - this.offsetY) * (newScale / this.scale);
                    
                    this.scale = newScale;
                    this.updateZoomDisplay();
                    this.redraw();
                }
            }
            
            // Two-finger pan
            if (this.lastTouchCenter.x !== 0 && this.lastTouchCenter.y !== 0) {
                const deltaX = (currentCenter.x - this.lastTouchCenter.x) * this.scale;
                const deltaY = (currentCenter.y - this.lastTouchCenter.y) * this.scale;
                this.offsetX += deltaX;
                this.offsetY += deltaY;
                this.redraw();
            }
            
            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        const touches = e.touches;
        const currentTime = Date.now();
        
        if (touches.length === 0) {
            // All fingers lifted
            const touchDuration = currentTime - this.touchStartTime;
            
            if (!this.isMultiTouch) {
                const moveDistance = Math.sqrt(
                    Math.pow(e.changedTouches[0].clientX - this.touchStartPos.x, 2) + 
                    Math.pow(e.changedTouches[0].clientY - this.touchStartPos.y, 2)
                );
                
                // Check for double tap
                if (touchDuration < 300 && moveDistance < 10) {
                    if (currentTime - this.lastTapTime < 300) {
                        // Double tap detected
                        this.handleDoubleTap(e.changedTouches[0]);
                        this.tapCount = 0;
                        this.lastTapTime = 0;
                        return;
                    } else {
                        this.tapCount = 1;
                        this.lastTapTime = currentTime;
                        
                        // Wait to see if there's a second tap
                        setTimeout(() => {
                            if (this.tapCount === 1) {
                                // Single tap - check for long press
                                if (touchDuration > 500) {
                                    this.handleLongPress(e.changedTouches[0]);
                                    return;
                                }
                            }
                            this.tapCount = 0;
                        }, 300);
                    }
                }
                
                // Check for long press (if not double tap)
                if (touchDuration > 500 && moveDistance < 10 && this.tapCount === 0) {
                    this.handleLongPress(e.changedTouches[0]);
                    return;
                }
            }
            
            this.handleMouseUp({ preventDefault: () => {} });
            this.isMultiTouch = false;
            this.lastTouchDistance = 0;
            this.lastTouchCenter = { x: 0, y: 0 };
            this.showMultiTouchFeedback(false);
        } else if (touches.length === 1 && this.isMultiTouch) {
            // One finger still down after multi-touch
            this.isMultiTouch = false;
            this.lastTouchDistance = 0;
            this.lastTouchCenter = { x: 0, y: 0 };
            this.showMultiTouchFeedback(false);
        }
    }
    
    handleDoubleTap(touch) {
        // Provide haptic feedback
        this.vibrate(30);
        
        // Double tap to zoom
        const pos = this.getMousePos({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        // Toggle between 100% and 200% zoom
        const targetScale = this.scale === 1 ? 2 : 1;
        const scaleFactor = targetScale / this.scale;
        
        // Get canvas position for zoom center
        const rect = this.canvas.getBoundingClientRect();
        const zoomCenterX = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const zoomCenterY = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Adjust offset to zoom around touch center
        this.offsetX = zoomCenterX - (zoomCenterX - this.offsetX) * scaleFactor;
        this.offsetY = zoomCenterY - (zoomCenterY - this.offsetY) * scaleFactor;
        
        this.scale = targetScale;
        this.updateZoomDisplay();
        this.redraw();
    }
    
    getTouchDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    getTouchCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    handleLongPress(touch) {
        // Provide haptic feedback if available
        this.vibrate(50);
        
        // Long press functionality - could be used for selection or context menu
        const pos = this.getMousePos({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        // If there's an object at this position, select it
        const objectAtPos = this.findObjectAt(pos);
        if (objectAtPos && this.currentTool === 'select') {
            this.selectedObject = objectAtPos;
            this.selectedObjects = [objectAtPos];
            this.clearSelectionHandles();
            this.createSelectionHandles(objectAtPos);
            this.showPropertiesPanel(objectAtPos);
            this.redraw();
        }
    }
    
    vibrate(duration = 50) {
        // Haptic feedback for mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Detect if device is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    showMultiTouchFeedback(show) {
        // Add visual feedback for multi-touch gestures
        if (show) {
            this.canvas.style.filter = 'brightness(1.1)';
            // Add haptic feedback
            this.vibrate(20);
        } else {
            this.canvas.style.filter = '';
        }
    }
    
    // Initialize mobile-specific features
    initMobileFeatures() {
        if (this.isMobile()) {
            // Disable context menu on long press
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            // Prevent default touch behaviors
            document.addEventListener('touchstart', (e) => {
                if (e.target === this.canvas) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('touchmove', (e) => {
                if (e.target === this.canvas) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('touchend', (e) => {
                if (e.target === this.canvas) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Setup mobile menu toggle
            this.setupMobileMenu();
        }
    }
    
    setupMobileMenu() {
        const menuToggle = document.getElementById('mobileMenuToggle');
        const toolbar = document.getElementById('toolbar');
        
        if (menuToggle && toolbar) {
            menuToggle.addEventListener('click', () => {
                const isOpen = toolbar.classList.contains('mobile-open');
                
                if (isOpen) {
                    toolbar.classList.remove('mobile-open');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                } else {
                    toolbar.classList.add('mobile-open');
                    menuToggle.innerHTML = '<i class="fas fa-times"></i>';
                }
                
                // Haptic feedback
                this.vibrate(30);
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!toolbar.contains(e.target) && !menuToggle.contains(e.target)) {
                    toolbar.classList.remove('mobile-open');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Close menu when tool is selected
            document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (this.isMobile()) {
                        setTimeout(() => {
                            toolbar.classList.remove('mobile-open');
                            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        }, 300);
                    }
                });
            });
        }
    }
    
    // Drawing methods
    startDrawing(pos) {
        this.isDrawing = true;
        this.currentPath = [{
            x: pos.x,
            y: pos.y,
            type: 'pen',
            color: this.strokeColor,
            width: this.strokeWidth,
            points: [{ x: pos.x, y: pos.y }]
        }];
    }
    
    continuePen(pos) {
        if (this.currentPath && this.currentPath.length > 0) {
            this.currentPath[0].points.push({ x: pos.x, y: pos.y });
            this.redraw();
            this.drawTempPath();
        }
    }
    
    startErasing(pos) {
        this.isDrawing = true;
        this.eraseAt(pos);
    }
    
    continueErasing(pos) {
        this.eraseAt(pos);
    }
    
    eraseAt(pos) {
        const eraseRadius = this.strokeWidth * 2;
        this.objects = this.objects.filter(obj => {
            if (obj.type === 'pen' && obj.points) {
                return !obj.points.some(point => 
                    Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)) < eraseRadius
                );
            }
            return true;
        });
        this.redraw();
    }
    
    startShape(pos) {
        this.isDrawing = true;
        this.currentShape = {
            type: this.currentTool,
            startX: pos.x,
            startY: pos.y,
            endX: pos.x,
            endY: pos.y,
            color: this.strokeColor,
            width: this.strokeWidth
        };
    }
    
    updateShape(pos) {
        if (this.currentShape) {
            this.currentShape.endX = pos.x;
            this.currentShape.endY = pos.y;
            this.redraw();
            this.drawTempShape();
        }
    }
    
    finishDrawing() {
        if (this.currentPath) {
            // Ensure the path has proper properties
            this.currentPath.forEach(path => {
                if (!path.width) path.width = this.strokeWidth;
                if (!path.color) path.color = this.strokeColor;
                if (!path.opacity) path.opacity = 1;
                if (!path.rotation) path.rotation = 0;
            });
            this.objects.push(...this.currentPath);
            this.currentPath = null;
            this.saveState(); // Save state for undo/redo
        }
        if (this.currentShape) {
            // Ensure the shape has proper properties
            if (!this.currentShape.width) this.currentShape.width = this.strokeWidth;
            if (!this.currentShape.color) this.currentShape.color = this.strokeColor;
            if (!this.currentShape.opacity) this.currentShape.opacity = 1;
            if (!this.currentShape.rotation) this.currentShape.rotation = 0;
            this.objects.push(this.currentShape);
            this.currentShape = null;
            this.saveState(); // Save state for undo/redo
        }
        this.redraw();
    }
    
    drawTempPath() {
        if (this.currentPath && this.currentPath[0].points.length > 1) {
            const path = this.currentPath[0];
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.strokeStyle = path.color;
            this.ctx.lineWidth = path.width;
            this.ctx.beginPath();
            this.ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
                this.ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    drawTempShape() {
        if (this.currentShape) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.strokeStyle = this.currentShape.color;
            this.ctx.lineWidth = this.currentShape.width;
            this.drawShape(this.currentShape);
            this.ctx.restore();
        }
    }
    
    drawShape(shape) {
        const { type, startX, startY, endX, endY } = shape;
        
        switch (type) {
            case 'rectangle':
                this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                break;
                
            case 'rounded-rectangle':
                this.drawRoundedRectangle(startX, startY, endX - startX, endY - startY, 10);
                break;
                
            case 'circle':
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                this.ctx.beginPath();
                this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
                
            case 'oval':
                this.drawOval(startX, startY, endX - startX, endY - startY);
                break;
                
            case 'triangle':
                this.drawTriangle(startX, startY, endX, endY);
                break;
                
            case 'diamond':
                this.drawDiamond(startX, startY, endX, endY);
                break;
                
            case 'parallelogram':
                this.drawParallelogram(startX, startY, endX, endY);
                break;
                
            case 'trapezoid':
                this.drawTrapezoid(startX, startY, endX, endY);
                break;
                
            case 'pentagon':
                this.drawPolygon(startX, startY, endX, endY, 5);
                break;
                
            case 'hexagon':
                this.drawPolygon(startX, startY, endX, endY, 6);
                break;
                
            case 'octagon':
                this.drawPolygon(startX, startY, endX, endY, 8);
                break;
                
            case 'star':
                this.drawStar(startX, startY, endX, endY);
                break;
                
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
                break;
                
            case 'arrow':
                this.drawArrow(startX, startY, endX, endY);
                break;
        }
    }
    
    drawArrow(fromX, fromY, toX, toY) {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        // Draw arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
    }
    
    drawRoundedRectangle(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawOval(x, y, width, height) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radiusX = Math.abs(width) / 2;
        const radiusY = Math.abs(height) / 2;
        
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    drawTriangle(startX, startY, endX, endY) {
        const centerX = (startX + endX) / 2;
        const width = endX - startX;
        const height = endY - startY;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, startY); // Top point
        this.ctx.lineTo(startX, endY); // Bottom left
        this.ctx.lineTo(endX, endY); // Bottom right
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawDiamond(startX, startY, endX, endY) {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, startY); // Top
        this.ctx.lineTo(endX, centerY); // Right
        this.ctx.lineTo(centerX, endY); // Bottom
        this.ctx.lineTo(startX, centerY); // Left
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawParallelogram(startX, startY, endX, endY) {
        const width = endX - startX;
        const height = endY - startY;
        const skew = width * 0.3; // 30% skew
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX + skew, startY); // Top left
        this.ctx.lineTo(endX, startY); // Top right
        this.ctx.lineTo(endX - skew, endY); // Bottom right
        this.ctx.lineTo(startX, endY); // Bottom left
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawTrapezoid(startX, startY, endX, endY) {
        const width = endX - startX;
        const height = endY - startY;
        const topIndent = width * 0.2; // 20% indent on top
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX + topIndent, startY); // Top left
        this.ctx.lineTo(endX - topIndent, startY); // Top right
        this.ctx.lineTo(endX, endY); // Bottom right
        this.ctx.lineTo(startX, endY); // Bottom left
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawPolygon(startX, startY, endX, endY, sides) {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radius = Math.min(Math.abs(endX - startX), Math.abs(endY - startY)) / 2;
        
        this.ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawStar(startX, startY, endX, endY) {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const outerRadius = Math.min(Math.abs(endX - startX), Math.abs(endY - startY)) / 2;
        const innerRadius = outerRadius * 0.4;
        const spikes = 5;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    handleSelect(pos) {
        // Find object at position
        const selected = this.findObjectAt(pos);
        
        if (this.ctrlKey && selected) {
            // Ctrl+Click: Add/remove from selection
            if (this.selectedObjects.includes(selected)) {
                // Remove from selection
                this.selectedObjects = this.selectedObjects.filter(obj => obj !== selected);
                if (this.selectedObject === selected) {
                    this.selectedObject = null;
                    this.clearSelectionHandles();
                }
            } else {
                // Add to selection
                this.selectedObjects.push(selected);
            }
            this.redraw();
        } else if (selected) {
            // Regular click on object
            if (this.selectedObjects.includes(selected) && this.selectedObjects.length > 1) {
                // Clicked on an object in multiple selection - start dragging all
                this.isDragging = true;
                this.dragStartX = pos.x;
                this.dragStartY = pos.y;
            } else {
                // Select single object
                this.selectedObject = selected;
                this.selectedObjects = [selected];
                this.clearSelectionHandles();
                this.createSelectionHandles(selected);
                this.showPropertiesPanel(selected);
                this.redraw();
                
                // Start dragging
                this.isDragging = true;
                this.dragStartX = pos.x;
                this.dragStartY = pos.y;
            }
        }
    }
    
    findObjectAt(pos) {
        // Check objects in reverse order (top to bottom)
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (this.isPointInObject(pos, obj)) {
                return obj;
            }
        }
        return null;
    }
    
    isPointInObject(pos, obj) {
        if (obj.type === 'sticky-note') {
            // For sticky notes, check if point is within the note bounds
            const noteX = obj.x + (obj.offsetX || 0);
            const noteY = obj.y + (obj.offsetY || 0);
            return pos.x >= noteX && pos.x <= noteX + obj.width && 
                   pos.y >= noteY && pos.y <= noteY + obj.height;
        } else if (obj.type === 'pen' && obj.points) {
            return obj.points.some(point => 
                Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)) < obj.width * 2
            );
        } else if (obj.type === 'rectangle' || obj.type === 'rounded-rectangle') {
            const minX = Math.min(obj.startX, obj.endX);
            const maxX = Math.max(obj.startX, obj.endX);
            const minY = Math.min(obj.startY, obj.endY);
            const maxY = Math.max(obj.startY, obj.endY);
            return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
        } else if (obj.type === 'circle') {
            const radius = Math.sqrt(Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2));
            const distance = Math.sqrt(Math.pow(pos.x - obj.startX, 2) + Math.pow(pos.y - obj.startY, 2));
            return distance <= radius;
        } else if (obj.type === 'oval') {
            const centerX = (obj.startX + obj.endX) / 2;
            const centerY = (obj.startY + obj.endY) / 2;
            const radiusX = Math.abs(obj.endX - obj.startX) / 2;
            const radiusY = Math.abs(obj.endY - obj.startY) / 2;
            
            if (radiusX === 0 || radiusY === 0) return false;
            
            const normalizedX = (pos.x - centerX) / radiusX;
            const normalizedY = (pos.y - centerY) / radiusY;
            return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
        } else if (obj.type === 'triangle') {
            // For triangle, use bounding box for simplicity (could be improved with actual triangle detection)
            const minX = Math.min(obj.startX, obj.endX);
            const maxX = Math.max(obj.startX, obj.endX);
            const minY = Math.min(obj.startY, obj.endY);
            const maxY = Math.max(obj.startY, obj.endY);
            return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
        } else if (obj.type === 'diamond' || obj.type === 'parallelogram' || obj.type === 'trapezoid' || 
                   obj.type === 'pentagon' || obj.type === 'hexagon' || obj.type === 'octagon' || obj.type === 'star') {
            // For complex shapes, use bounding box approximation
            const minX = Math.min(obj.startX, obj.endX);
            const maxX = Math.max(obj.startX, obj.endX);
            const minY = Math.min(obj.startY, obj.endY);
            const maxY = Math.max(obj.startY, obj.endY);
            return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
        } else if (obj.type === 'line' || obj.type === 'arrow') {
            // Distance from point to line
            const A = pos.x - obj.startX;
            const B = pos.y - obj.startY;
            const C = obj.endX - obj.startX;
            const D = obj.endY - obj.startY;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) param = dot / lenSq;
            
            let xx, yy;
            if (param < 0) {
                xx = obj.startX;
                yy = obj.startY;
            } else if (param > 1) {
                xx = obj.endX;
                yy = obj.endY;
            } else {
                xx = obj.startX + param * C;
                yy = obj.startY + param * D;
            }
            
            const dx = pos.x - xx;
            const dy = pos.y - yy;
            return Math.sqrt(dx * dx + dy * dy) <= (obj.width || 3) * 2;
        } else if (obj.type === 'text') {
            // Approximate text bounds
            const textWidth = obj.text.length * obj.fontSize * 0.6;
            const textHeight = obj.fontSize;
            return pos.x >= obj.x && pos.x <= obj.x + textWidth && 
                   pos.y >= obj.y - textHeight && pos.y <= obj.y;
        }
        return false;
    }
    
    moveObject(obj, deltaX, deltaY) {
        if (obj.type === 'pen' && obj.points) {
            obj.points.forEach(point => {
                point.x += deltaX;
                point.y += deltaY;
            });
        } else if (obj.type === 'rectangle' || obj.type === 'rounded-rectangle' || obj.type === 'circle' || 
                   obj.type === 'oval' || obj.type === 'triangle' || obj.type === 'diamond' || 
                   obj.type === 'parallelogram' || obj.type === 'trapezoid' || obj.type === 'pentagon' || 
                   obj.type === 'hexagon' || obj.type === 'octagon' || obj.type === 'star' || 
                   obj.type === 'line' || obj.type === 'arrow') {
            obj.startX += deltaX;
            obj.startY += deltaY;
            obj.endX += deltaX;
            obj.endY += deltaY;
        } else if (obj.type === 'text') {
            obj.x += deltaX;
            obj.y += deltaY;
        }
    }
    
    getObjectBounds(obj) {
        if (obj.type === 'sticky-note') {
            const noteX = obj.x + (obj.offsetX || 0);
            const noteY = obj.y + (obj.offsetY || 0);
            return {
                minX: noteX,
                maxX: noteX + obj.width,
                minY: noteY,
                maxY: noteY + obj.height
            };
        } else if (obj.type === 'pen' && obj.points) {
            const xs = obj.points.map(p => p.x);
            const ys = obj.points.map(p => p.y);
            return {
                minX: Math.min(...xs) - obj.width,
                maxX: Math.max(...xs) + obj.width,
                minY: Math.min(...ys) - obj.width,
                maxY: Math.max(...ys) + obj.width
            };
        } else if (obj.type === 'rectangle' || obj.type === 'rounded-rectangle' || obj.type === 'oval' ||
                   obj.type === 'triangle' || obj.type === 'diamond' || obj.type === 'parallelogram' ||
                   obj.type === 'trapezoid' || obj.type === 'pentagon' || obj.type === 'hexagon' ||
                   obj.type === 'octagon' || obj.type === 'star') {
            return {
                minX: Math.min(obj.startX, obj.endX),
                maxX: Math.max(obj.startX, obj.endX),
                minY: Math.min(obj.startY, obj.endY),
                maxY: Math.max(obj.startY, obj.endY)
            };
        } else if (obj.type === 'circle') {
            const radius = Math.sqrt(Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2));
            return {
                minX: obj.startX - radius,
                maxX: obj.startX + radius,
                minY: obj.startY - radius,
                maxY: obj.startY + radius
            };
        } else if (obj.type === 'line' || obj.type === 'arrow') {
            return {
                minX: Math.min(obj.startX, obj.endX) - obj.width,
                maxX: Math.max(obj.startX, obj.endX) + obj.width,
                minY: Math.min(obj.startY, obj.endY) - obj.width,
                maxY: Math.max(obj.startY, obj.endY) + obj.width
            };
        } else if (obj.type === 'text') {
            const textWidth = obj.text.length * obj.fontSize * 0.6;
            return {
                minX: obj.x,
                maxX: obj.x + textWidth,
                minY: obj.y - obj.fontSize,
                maxY: obj.y
            };
        }
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    
    calculateAngle(pos, center) {
        return Math.atan2(pos.y - center.y, pos.x - center.x);
    }
    
    getObjectCenter(obj) {
        const bounds = this.getObjectBounds(obj);
        return {
            x: (bounds.minX + bounds.maxX) / 2,
            y: (bounds.minY + bounds.maxY) / 2
        };
    }
    
    rotateObject(obj, angle) {
        obj.rotation = (obj.rotation || 0) + angle;
        // Normalize angle to 0-360 degrees
        while (obj.rotation < 0) obj.rotation += Math.PI * 2;
        while (obj.rotation >= Math.PI * 2) obj.rotation -= Math.PI * 2;
    }
    
    showPropertiesPanel(obj) {
        const panel = document.getElementById('propertiesPanel');
        if (obj) {
            panel.style.display = 'block';
            
            // Set current values
            document.getElementById('propColor').value = obj.color || '#000000';
            document.getElementById('propStroke').value = obj.width || 3;
            document.getElementById('propStrokeValue').textContent = (obj.width || 3) + 'px';
            document.getElementById('propOpacity').value = obj.opacity || 1;
            document.getElementById('propOpacityValue').textContent = (obj.opacity || 1).toString();
            
            // Set size values
            const size = this.getObjectPixelSize(obj);
            document.getElementById('propWidth').value = size.width;
            document.getElementById('propHeight').value = size.height;
            
            // Show/hide font size for text objects
            const fontSizeGroup = document.getElementById('fontSizeGroup');
            if (obj.type === 'text') {
                fontSizeGroup.style.display = 'block';
                document.getElementById('propFontSize').value = obj.fontSize || 16;
            } else {
                fontSizeGroup.style.display = 'none';
            }
        } else {
            panel.style.display = 'none';
        }
    }
    
    createSelectionHandles(obj) {
        // We'll draw handles directly on canvas instead of DOM elements
        this.clearSelectionHandles();
    }
    
    clearSelectionHandles() {
        // Clear any DOM handles if they exist
        this.selectionHandles.forEach(handle => {
            if (handle.parentNode) {
                handle.parentNode.removeChild(handle);
            }
        });
        this.selectionHandles = [];
    }
    
    updateSelectionHandles() {
        // Handles are now drawn directly on canvas, no need to update DOM
    }
    
    getResizeHandleAt(pos) {
        if (!this.selectedObject) return null;
        
        const bounds = this.getObjectBounds(this.selectedObject);
        const handleSize = this.isMobile() ? 25 / this.scale : 15 / this.scale; // Larger touch targets on mobile
        
        // Resize handles
        const handles = [
            { direction: 'nw', x: bounds.minX, y: bounds.minY },
            { direction: 'n', x: (bounds.minX + bounds.maxX) / 2, y: bounds.minY },
            { direction: 'ne', x: bounds.maxX, y: bounds.minY },
            { direction: 'e', x: bounds.maxX, y: (bounds.minY + bounds.maxY) / 2 },
            { direction: 'se', x: bounds.maxX, y: bounds.maxY },
            { direction: 's', x: (bounds.minX + bounds.maxX) / 2, y: bounds.maxY },
            { direction: 'sw', x: bounds.minX, y: bounds.maxY },
            { direction: 'w', x: bounds.minX, y: (bounds.minY + bounds.maxY) / 2 }
        ];
        
        // Rotation handle (above the top center)
        const rotationHandle = {
            direction: 'rotate',
            x: (bounds.minX + bounds.maxX) / 2,
            y: bounds.minY - (this.isMobile() ? 40 / this.scale : 30 / this.scale)
        };
        
        // Check rotation handle first
        const rotationDistance = Math.sqrt(
            Math.pow(pos.x - rotationHandle.x, 2) + Math.pow(pos.y - rotationHandle.y, 2)
        );
        if (rotationDistance <= handleSize) {
            return 'rotate';
        }
        
        // Check resize handles
        for (let handle of handles) {
            const distance = Math.sqrt(
                Math.pow(pos.x - handle.x, 2) + Math.pow(pos.y - handle.y, 2)
            );
            if (distance <= handleSize) {
                return handle.direction;
            }
        }
        
        return null;
    }
    
    resizeObject(obj, direction, currentPos) {
        if (!this.resizeStartBounds) return;
        
        const startBounds = this.resizeStartBounds;
        let newBounds = { ...startBounds };
        
        // Calculate new bounds based on resize direction
        switch (direction) {
            case 'nw':
                newBounds.minX = Math.min(currentPos.x, startBounds.maxX - 20);
                newBounds.minY = Math.min(currentPos.y, startBounds.maxY - 20);
                break;
            case 'n':
                newBounds.minY = Math.min(currentPos.y, startBounds.maxY - 20);
                break;
            case 'ne':
                newBounds.maxX = Math.max(currentPos.x, startBounds.minX + 20);
                newBounds.minY = Math.min(currentPos.y, startBounds.maxY - 20);
                break;
            case 'e':
                newBounds.maxX = Math.max(currentPos.x, startBounds.minX + 20);
                break;
            case 'se':
                newBounds.maxX = Math.max(currentPos.x, startBounds.minX + 20);
                newBounds.maxY = Math.max(currentPos.y, startBounds.minY + 20);
                break;
            case 's':
                newBounds.maxY = Math.max(currentPos.y, startBounds.minY + 20);
                break;
            case 'sw':
                newBounds.minX = Math.min(currentPos.x, startBounds.maxX - 20);
                newBounds.maxY = Math.max(currentPos.y, startBounds.minY + 20);
                break;
            case 'w':
                newBounds.minX = Math.min(currentPos.x, startBounds.maxX - 20);
                break;
        }
        
        // Apply the new bounds to the object
        this.applyBoundsToObject(obj, newBounds);
    }
    
    applyBoundsToObject(obj, bounds) {
        if (obj.type === 'rectangle' || obj.type === 'rounded-rectangle' || obj.type === 'oval' || 
            obj.type === 'triangle' || obj.type === 'diamond' || obj.type === 'parallelogram' || 
            obj.type === 'trapezoid' || obj.type === 'pentagon' || obj.type === 'hexagon' || 
            obj.type === 'octagon' || obj.type === 'star') {
            obj.startX = bounds.minX;
            obj.startY = bounds.minY;
            obj.endX = bounds.maxX;
            obj.endY = bounds.maxY;
        } else if (obj.type === 'line' || obj.type === 'arrow') {
            obj.startX = bounds.minX;
            obj.startY = bounds.minY;
            obj.endX = bounds.maxX;
            obj.endY = bounds.maxY;
        } else if (obj.type === 'circle') {
            const centerX = (bounds.minX + bounds.maxX) / 2;
            const centerY = (bounds.minY + bounds.maxY) / 2;
            const radiusX = Math.abs(bounds.maxX - bounds.minX) / 2;
            const radiusY = Math.abs(bounds.maxY - bounds.minY) / 2;
            const radius = Math.max(radiusX, radiusY); // Use the larger radius to maintain circle shape
            
            obj.startX = centerX;
            obj.startY = centerY;
            obj.endX = centerX + radius;
            obj.endY = centerY;
        } else if (obj.type === 'text') {
            obj.x = bounds.minX;
            obj.y = bounds.maxY;
            // Scale font size based on height change
            const originalHeight = this.resizeStartBounds.maxY - this.resizeStartBounds.minY;
            const newHeight = bounds.maxY - bounds.minY;
            if (originalHeight > 0) {
                const heightRatio = newHeight / originalHeight;
                obj.fontSize = Math.max(8, Math.min(200, obj.fontSize * heightRatio));
            }
        } else if (obj.type === 'pen' && obj.points && obj.points.length > 0) {
            // Scale pen points proportionally
            const originalWidth = this.resizeStartBounds.maxX - this.resizeStartBounds.minX;
            const originalHeight = this.resizeStartBounds.maxY - this.resizeStartBounds.minY;
            const newWidth = bounds.maxX - bounds.minX;
            const newHeight = bounds.maxY - bounds.minY;
            
            if (originalWidth > 0 && originalHeight > 0) {
                const scaleX = newWidth / originalWidth;
                const scaleY = newHeight / originalHeight;
                
                obj.points.forEach(point => {
                    const relativeX = (point.x - this.resizeStartBounds.minX) / originalWidth;
                    const relativeY = (point.y - this.resizeStartBounds.minY) / originalHeight;
                    
                    point.x = bounds.minX + relativeX * newWidth;
                    point.y = bounds.minY + relativeY * newHeight;
                });
            }
        }
    }
    
    startSelectionBox(pos) {
        this.isSelectionBoxActive = true;
        this.selectionBoxStart = { x: pos.x, y: pos.y };
        this.selectionBoxEnd = { x: pos.x, y: pos.y };
        
        // Clear previous selection unless Ctrl is held
        if (!this.ctrlKey) {
            this.selectedObjects = [];
            this.selectedObject = null;
            this.clearSelectionHandles();
            this.showPropertiesPanel(null);
        }
    }
    
    updateSelectionBox(pos) {
        if (this.isSelectionBoxActive) {
            this.selectionBoxEnd = { x: pos.x, y: pos.y };
        }
    }
    
    finishSelectionBox() {
        if (this.isSelectionBoxActive) {
            this.isSelectionBoxActive = false;
            
            // Find objects within selection box
            const selectionBounds = this.getSelectionBoxBounds();
            const objectsInSelection = this.getObjectsInBounds(selectionBounds);
            
            if (objectsInSelection.length > 0) {
                if (objectsInSelection.length === 1) {
                    // Single object selected
                    this.selectedObject = objectsInSelection[0];
                    this.selectedObjects = [objectsInSelection[0]];
                    this.createSelectionHandles(objectsInSelection[0]);
                    this.showPropertiesPanel(objectsInSelection[0]);
                } else {
                    // Multiple objects selected
                    this.selectedObjects = objectsInSelection;
                    this.selectedObject = null;
                    this.clearSelectionHandles();
                    this.showPropertiesPanel(null);
                }
            } else {
                // No objects selected
                this.selectedObjects = [];
                this.selectedObject = null;
                this.clearSelectionHandles();
                this.showPropertiesPanel(null);
            }
            
            this.redraw();
        }
    }
    
    getSelectionBoxBounds() {
        return {
            minX: Math.min(this.selectionBoxStart.x, this.selectionBoxEnd.x),
            maxX: Math.max(this.selectionBoxStart.x, this.selectionBoxEnd.x),
            minY: Math.min(this.selectionBoxStart.y, this.selectionBoxEnd.y),
            maxY: Math.max(this.selectionBoxStart.y, this.selectionBoxEnd.y)
        };
    }
    
    getObjectsInBounds(bounds) {
        return this.objects.filter(obj => {
            const objBounds = this.getObjectBounds(obj);
            
            // Check if object overlaps with selection bounds
            return !(objBounds.maxX < bounds.minX || 
                    objBounds.minX > bounds.maxX || 
                    objBounds.maxY < bounds.minY || 
                    objBounds.minY > bounds.maxY);
        });
    }
    
    drawSelectionBox() {
        if (this.isSelectionBoxActive) {
            const bounds = this.getSelectionBoxBounds();
            
            this.ctx.save();
            this.ctx.strokeStyle = '#2196f3';
            this.ctx.lineWidth = 1 / this.scale;
            this.ctx.setLineDash([5 / this.scale, 5 / this.scale]);
            this.ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
            
            // Draw selection rectangle
            this.ctx.fillRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
            this.ctx.strokeRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
            
            this.ctx.restore();
        }
    }
    
    drawMultipleSelection(obj) {
        const bounds = this.getObjectBounds(obj);
        const padding = 3;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#ff9800';
        this.ctx.lineWidth = 1.5 / this.scale;
        this.ctx.setLineDash([3 / this.scale, 3 / this.scale]);
        
        // Draw selection rectangle
        this.ctx.strokeRect(
            bounds.minX - padding,
            bounds.minY - padding,
            bounds.maxX - bounds.minX + padding * 2,
            bounds.maxY - bounds.minY + padding * 2
        );
        
        this.ctx.restore();
    }
    
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX / this.scale, this.offsetY / this.scale);
        
        // Draw all objects
        this.objects.forEach(obj => {
            this.ctx.save();
            this.ctx.strokeStyle = obj.color || '#000000';
            this.ctx.lineWidth = obj.width || 3;
            this.ctx.globalAlpha = obj.opacity || 1;
            
            // Apply rotation if the object has a rotation property
            if (obj.rotation && obj.rotation !== 0) {
                const center = this.getObjectCenter(obj);
                this.ctx.translate(center.x, center.y);
                this.ctx.rotate(obj.rotation);
                this.ctx.translate(-center.x, -center.y);
            }
            
            if (obj.type === 'pen' && obj.points) {
                if (obj.points.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(obj.points[0].x, obj.points[0].y);
                    for (let i = 1; i < obj.points.length; i++) {
                        this.ctx.lineTo(obj.points[i].x, obj.points[i].y);
                    }
                    this.ctx.stroke();
                }
            } else if (obj.type === 'text') {
                this.ctx.fillStyle = obj.color || '#000000';
                this.ctx.font = `${obj.fontSize}px Arial`;
                this.ctx.fillText(obj.text, obj.x, obj.y);
            } else {
                this.drawShape(obj);
            }
            
            this.ctx.restore();
        });
        
        // Draw selection highlights
        if (this.selectedObject) {
            this.drawSelection(this.selectedObject);
        } else if (this.selectedObjects.length > 0) {
            // Draw selection for multiple objects
            this.selectedObjects.forEach(obj => {
                this.drawMultipleSelection(obj);
            });
        }
        
        // Draw selection box if active
        this.drawSelectionBox();
        
        this.ctx.restore();
    }
    
    drawSelection(obj) {
        const bounds = this.getObjectBounds(obj);
        const padding = 5;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#2196f3';
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.setLineDash([5 / this.scale, 5 / this.scale]);
        
        // Draw selection rectangle
        this.ctx.strokeRect(
            bounds.minX - padding,
            bounds.minY - padding,
            bounds.maxX - bounds.minX + padding * 2,
            bounds.maxY - bounds.minY + padding * 2
        );
        
        // Draw resize handles
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#2196f3';
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2 / this.scale;
        
        const handleSize = this.isMobile() ? 12 / this.scale : 8 / this.scale; // Larger handles on mobile
        const handlePositions = [
            { x: bounds.minX, y: bounds.minY }, // nw
            { x: (bounds.minX + bounds.maxX) / 2, y: bounds.minY }, // n
            { x: bounds.maxX, y: bounds.minY }, // ne
            { x: bounds.maxX, y: (bounds.minY + bounds.maxY) / 2 }, // e
            { x: bounds.maxX, y: bounds.maxY }, // se
            { x: (bounds.minX + bounds.maxX) / 2, y: bounds.maxY }, // s
            { x: bounds.minX, y: bounds.maxY }, // sw
            { x: bounds.minX, y: (bounds.minY + bounds.maxY) / 2 } // w
        ];
        
        handlePositions.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, handleSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        });
        
        // Draw rotation handle
        const rotationHandleDistance = this.isMobile() ? 40 / this.scale : 30 / this.scale;
        const rotationHandlePos = {
            x: (bounds.minX + bounds.maxX) / 2,
            y: bounds.minY - rotationHandleDistance
        };
        
        // Draw line connecting to rotation handle
        this.ctx.beginPath();
        this.ctx.moveTo((bounds.minX + bounds.maxX) / 2, bounds.minY);
        this.ctx.lineTo(rotationHandlePos.x, rotationHandlePos.y);
        this.ctx.stroke();
        
        // Draw rotation handle (circular with arrow icon)
        this.ctx.beginPath();
        this.ctx.arc(rotationHandlePos.x, rotationHandlePos.y, handleSize / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#4CAF50'; // Green color for rotation handle
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    updateZoomDisplay() {
        document.querySelector('.zoom-level').textContent = Math.round(this.scale * 100) + '%';
    }
    
    // Utility methods
    clear() {
        this.objects = [];
        this.selectedObject = null;
        this.selectedObjects = [];
        this.clearSelectionHandles();
        this.saveState(); // Save state for undo/redo
        this.redraw();
    }
    
    save() {
        const data = {
            objects: this.objects,
            scale: this.scale,
            offsetX: this.offsetX,
            offsetY: this.offsetY
        };
        const dataStr = JSON.stringify(data);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'whiteboard.json';
        link.click();
    }
    
    load(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.objects = data.objects || [];
                this.scale = data.scale || 1;
                this.offsetX = data.offsetX || 0;
                this.offsetY = data.offsetY || 0;
                this.updateZoomDisplay();
                this.redraw();
            } catch (error) {
                alert('Erro ao carregar arquivo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    copy() {
        if (this.selectedObject) {
            this.clipboard = [JSON.parse(JSON.stringify(this.selectedObject))];
        } else if (this.selectedObjects.length > 0) {
            this.clipboard = this.selectedObjects.map(obj => JSON.parse(JSON.stringify(obj)));
        }
    }
    
    paste() {
        if (this.clipboard && this.clipboard.length > 0) {
            const pastedObjects = [];
            
            this.clipboard.forEach(clipObj => {
                const newObj = JSON.parse(JSON.stringify(clipObj));
                
                // Offset the pasted object
                if (newObj.points) {
                    newObj.points = newObj.points.map(p => ({ x: p.x + 20, y: p.y + 20 }));
                } else if (newObj.type === 'text') {
                    newObj.x += 20;
                    newObj.y += 20;
                } else {
                    newObj.startX += 20;
                    newObj.startY += 20;
                    newObj.endX += 20;
                    newObj.endY += 20;
                }
                
                this.objects.push(newObj);
                pastedObjects.push(newObj);
            });
            
            // Select the pasted objects
            if (pastedObjects.length === 1) {
                this.selectedObject = pastedObjects[0];
                this.selectedObjects = [pastedObjects[0]];
                this.createSelectionHandles(pastedObjects[0]);
                this.showPropertiesPanel(pastedObjects[0]);
            } else {
                this.selectedObjects = pastedObjects;
                this.selectedObject = null;
                this.clearSelectionHandles();
                this.showPropertiesPanel(null);
            }
            
            this.redraw();
            this.saveState(); // Save state for undo/redo
        }
    }
    
    selectNote(noteObject) {
        // Clear previous selections
        this.selectedObjects = [];
        this.selectedObject = noteObject;
        this.clearSelectionHandles();
        
        // Add visual indication for selected note
        const noteElement = noteObject.element;
        document.querySelectorAll('.sticky-note').forEach(note => {
            note.style.boxShadow = '';
        });
        noteElement.style.boxShadow = '0 0 0 2px #007acc';
        
        this.showPropertiesPanel(noteObject);
    }
    
    deleteSelected() {
        if (this.selectedObject) {
            const index = this.objects.indexOf(this.selectedObject);
            if (index > -1) {
                // If it's a sticky note, remove the DOM element
                if (this.selectedObject.type === 'sticky-note') {
                    const noteElement = this.selectedObject.element;
                    if (noteElement && noteElement.parentNode) {
                        noteElement.parentNode.removeChild(noteElement);
                    }
                }
                this.objects.splice(index, 1);
                this.selectedObject = null;
                this.clearSelectionHandles();
                this.showPropertiesPanel(null);
                this.saveState(); // Save state for undo/redo
                this.redraw();
            }
        } else if (this.selectedObjects.length > 0) {
            // Delete multiple selected objects
            this.selectedObjects.forEach(obj => {
                const index = this.objects.indexOf(obj);
                if (index > -1) {
                    // If it's a sticky note, remove the DOM element
                    if (obj.type === 'sticky-note') {
                        const noteElement = obj.element;
                        if (noteElement && noteElement.parentNode) {
                            noteElement.parentNode.removeChild(noteElement);
                        }
                    }
                    this.objects.splice(index, 1);
                }
            });
            this.selectedObjects = [];
            this.selectedObject = null;
            this.clearSelectionHandles();
            this.showPropertiesPanel(null);
            this.saveState(); // Save state for undo/redo
            this.redraw();
        }
    }
    
    selectAll() {
        this.selectedObjects = [...this.objects];
        this.selectedObject = null;
        this.clearSelectionHandles();
        this.showPropertiesPanel(null);
        this.redraw();
    }
    
    saveState() {
        // Remove any states after current step (when user made changes after undo)
        this.history = this.history.slice(0, this.historyStep + 1);
        
        // Add current state
        const state = {
            objects: JSON.parse(JSON.stringify(this.objects)),
            timestamp: Date.now()
        };
        
        this.history.push(state);
        this.historyStep++;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyStep--;
        }
        
        this.updateUndoRedoButtons();
    }
    
    updateUndoRedoButtons() {
        // This will be called to update button states
        const canUndo = this.historyStep > 0;
        const canRedo = this.historyStep < this.history.length - 1;
        
        // Update button appearances if they exist
        const undoBtn = document.querySelector('[onclick="undo()"]');
        const redoBtn = document.querySelector('[onclick="redo()"]');
        
        if (undoBtn) {
            undoBtn.style.opacity = canUndo ? '1' : '0.5';
            undoBtn.disabled = !canUndo;
        }
        if (redoBtn) {
            redoBtn.style.opacity = canRedo ? '1' : '0.5';
            redoBtn.disabled = !canRedo;
        }
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const state = this.history[this.historyStep];
            this.objects = JSON.parse(JSON.stringify(state.objects));
            this.selectedObject = null;
            this.selectedObjects = [];
            this.clearSelectionHandles();
            this.showPropertiesPanel(null);
            this.redraw();
            this.updateUndoRedoButtons();
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const state = this.history[this.historyStep];
            this.objects = JSON.parse(JSON.stringify(state.objects));
            this.selectedObject = null;
            this.selectedObjects = [];
            this.clearSelectionHandles();
            this.showPropertiesPanel(null);
            this.redraw();
            this.updateUndoRedoButtons();
        }
    }
    
    resizeObjectToPixels(obj, width, height) {
        const bounds = this.getObjectBounds(obj);
        const currentWidth = bounds.maxX - bounds.minX;
        const currentHeight = bounds.maxY - bounds.minY;
        
        let newWidth = width !== null ? width : currentWidth;
        let newHeight = height !== null ? height : currentHeight;
        
        // Maintain aspect ratio if only one dimension is provided
        if (width !== null && height === null) {
            const aspectRatio = currentHeight / currentWidth;
            newHeight = newWidth * aspectRatio;
        } else if (height !== null && width === null) {
            const aspectRatio = currentWidth / currentHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        const newBounds = {
            minX: bounds.minX,
            minY: bounds.minY,
            maxX: bounds.minX + newWidth,
            maxY: bounds.minY + newHeight
        };
        
        // Store original bounds for resizing
        this.resizeStartBounds = bounds;
        this.applyBoundsToObject(obj, newBounds);
        this.resizeStartBounds = null;
    }
    
    getObjectPixelSize(obj) {
        const bounds = this.getObjectBounds(obj);
        return {
            width: Math.round(bounds.maxX - bounds.minX),
            height: Math.round(bounds.maxY - bounds.minY)
        };
    }
}

// Initialize whiteboard
let whiteboard;

document.addEventListener('DOMContentLoaded', () => {
    whiteboard = new Whiteboard();
    
    // Set default note color as selected
    document.querySelector('.note-color[data-color="#ffeb3b"]').classList.add('selected');
});

// Global functions for toolbar buttons
function clearCanvas() {
    if (confirm('Tem certeza que deseja limpar todo o whiteboard?')) {
        whiteboard.clear();
    }
}

function saveCanvas() {
    whiteboard.save();
}

function loadCanvas() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            whiteboard.load(file);
        }
    };
    input.click();
}

function zoomIn() {
    const scaleFactor = 1.2;
    const newScale = Math.min(whiteboard.maxScale, whiteboard.scale * scaleFactor);
    if (newScale !== whiteboard.scale) {
        whiteboard.scale = newScale;
        whiteboard.updateZoomDisplay();
        whiteboard.redraw();
    }
}

function zoomOut() {
    const scaleFactor = 0.8;
    const newScale = Math.max(whiteboard.minScale, whiteboard.scale * scaleFactor);
    if (newScale !== whiteboard.scale) {
        whiteboard.scale = newScale;
        whiteboard.updateZoomDisplay();
        whiteboard.redraw();
    }
}

function resetZoom() {
    whiteboard.scale = 1;
    whiteboard.offsetX = 0;
    whiteboard.offsetY = 0;
    whiteboard.updateZoomDisplay();
    whiteboard.redraw();
}

function deleteSelected() {
    whiteboard.deleteSelected();
}

// Global functions for toolbar buttons
function undo() {
    whiteboard.undo();
}

function redo() {
    whiteboard.redo();
}

// Text modal functions
function addText() {
    const text = document.getElementById('textInput').value;
    if (text.trim()) {
        // Add text object to canvas
        const textObj = {
            type: 'text',
            text: text,
            x: whiteboard.canvas.width / 2 / whiteboard.scale - whiteboard.offsetX / whiteboard.scale,
            y: whiteboard.canvas.height / 2 / whiteboard.scale - whiteboard.offsetY / whiteboard.scale,
            color: whiteboard.strokeColor,
            fontSize: Math.max(16, whiteboard.strokeWidth * 4),
            opacity: 1
        };
        whiteboard.objects.push(textObj);
        whiteboard.selectedObject = textObj;
        whiteboard.saveState(); // Save state for undo/redo
        whiteboard.redraw();
        whiteboard.showPropertiesPanel(textObj);
    }
    closeTextModal();
}

function closeTextModal() {
    document.getElementById('textModal').style.display = 'none';
    document.getElementById('textInput').value = '';
    whiteboard.setTool('select');
}

// Note modal functions
function addNote() {
    const text = document.getElementById('noteInput').value;
    if (text.trim()) {
        // Create sticky note element
        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.style.background = whiteboard.selectedNoteColor;
        note.style.left = (whiteboard.canvas.width / 2 - 100) + 'px';
        note.style.top = (whiteboard.canvas.height / 2 - 75) + 'px';
        note.contentEditable = true;
        note.textContent = text;
        note.dataset.noteId = Date.now(); // Unique ID for the note
        
        // Add note to whiteboard objects array for selection/deletion
        const noteObject = {
            type: 'sticky-note',
            id: note.dataset.noteId,
            element: note,
            x: whiteboard.canvas.width / 2 - 100,
            y: whiteboard.canvas.height / 2 - 75,
            width: 200,
            height: 150,
            text: text,
            color: whiteboard.selectedNoteColor
        };
        whiteboard.objects.push(noteObject);
        
        // Make note draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        note.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        // Add click handler for selection
        note.addEventListener('click', function(e) {
            e.stopPropagation();
            whiteboard.selectNote(noteObject);
        });
        
        function dragStart(e) {
            if (e.target === note) {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                isDragging = true;
                whiteboard.selectNote(noteObject);
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                note.style.transform = `translate(${currentX}px, ${currentY}px)`;
                
                // Update note object position
                noteObject.x = noteObject.x + (currentX - (noteObject.offsetX || 0));
                noteObject.y = noteObject.y + (currentY - (noteObject.offsetY || 0));
                noteObject.offsetX = currentX;
                noteObject.offsetY = currentY;
            }
        }
        
        function dragEnd() {
            isDragging = false;
        }
        
        document.querySelector('.canvas-container').appendChild(note);
        whiteboard.saveState(); // Save state for undo/redo
    }
    closeNoteModal();
}

function closeNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
    document.getElementById('noteInput').value = '';
    whiteboard.setTool('select');
}