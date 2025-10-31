// Miro Deliverables App - Image Calculator
class ImageCalculator {
    constructor() {
        this.uploadedImages = [];
        this.selectedImages = [];
        this.canvas = null;
        this.ctx = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File input change
        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.addEventListener('change', this.handleFileUpload.bind(this));
        }

        // Calculate button
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', this.performCalculation.bind(this));
        }

        // Measurement type change
        const measurementType = document.getElementById('measurement-type');
        if (measurementType) {
            measurementType.addEventListener('change', this.updateCalculateButton.bind(this));
        }
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        const uploadArea = document.getElementById('image-upload-area');
        const imagesGrid = document.getElementById('images-grid');

        for (const file of files) {
            if (this.validateFile(file)) {
                try {
                    const imageData = await this.processImage(file);
                    this.uploadedImages.push(imageData);
                } catch (error) {
                    console.error('Error processing image:', error);
                    this.showError(`Failed to process ${file.name}`);
                }
            }
        }

        if (this.uploadedImages.length > 0) {
            uploadArea.style.display = 'none';
            imagesGrid.style.display = 'grid';
            this.renderImagesGrid();
            this.updateCalculateButton();
        }

        // Clear input
        event.target.value = '';
    }

    validateFile(file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select only image files');
            return false;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            return false;
        }

        return true;
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const img = new Image();

            reader.onload = (e) => {
                img.onload = () => {
                    // Create canvas for analysis
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: file.size,
                        width: img.width,
                        height: img.height,
                        src: e.target.result,
                        canvas: canvas,
                        ctx: ctx,
                        file: file
                    };

                    resolve(imageData);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    renderImagesGrid() {
        const grid = document.getElementById('images-grid');
        if (!grid) return;

        grid.innerHTML = this.uploadedImages.map(image => `
            <div class="image-item ${this.selectedImages.includes(image.id) ? 'selected' : ''}" 
                 data-id="${image.id}" 
                 onclick="imageCalculator.toggleImageSelection('${image.id}')">
                <img src="${image.src}" alt="${image.name}">
                <button class="remove-btn" onclick="imageCalculator.removeImage('${image.id}', event)">×</button>
                <div class="image-info">${image.width}×${image.height}</div>
            </div>
        `).join('');
    }

    toggleImageSelection(imageId) {
        const index = this.selectedImages.indexOf(imageId);
        if (index > -1) {
            this.selectedImages.splice(index, 1);
        } else {
            this.selectedImages.push(imageId);
        }
        
        this.renderImagesGrid();
        this.updateCalculateButton();
    }

    removeImage(imageId, event) {
        event.stopPropagation();
        
        // Remove from uploaded images
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);
        
        // Remove from selected images
        const selectedIndex = this.selectedImages.indexOf(imageId);
        if (selectedIndex > -1) {
            this.selectedImages.splice(selectedIndex, 1);
        }

        // Update UI
        if (this.uploadedImages.length === 0) {
            document.getElementById('image-upload-area').style.display = 'block';
            document.getElementById('images-grid').style.display = 'none';
            document.getElementById('calculation-results').style.display = 'none';
        } else {
            this.renderImagesGrid();
        }

        this.updateCalculateButton();
    }

    updateCalculateButton() {
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            calculateBtn.disabled = this.selectedImages.length === 0;
        }
    }

    async performCalculation() {
        const measurementType = document.getElementById('measurement-type').value;
        const scaleFactor = parseFloat(document.getElementById('scale-factor').value) || 1;
        
        const selectedImageData = this.uploadedImages.filter(img => 
            this.selectedImages.includes(img.id)
        );

        if (selectedImageData.length === 0) {
            this.showError('Please select at least one image');
            return;
        }

        const results = [];

        for (const image of selectedImageData) {
            let result = {};

            switch (measurementType) {
                case 'area':
                    result = this.calculateArea(image, scaleFactor);
                    break;
                case 'perimeter':
                    result = this.calculatePerimeter(image, scaleFactor);
                    break;
                case 'dimensions':
                    result = this.calculateDimensions(image, scaleFactor);
                    break;
                case 'color-analysis':
                    result = this.analyzeColors(image);
                    break;
            }

            results.push({
                imageName: image.name,
                ...result
            });
        }

        this.displayResults(results, measurementType);
    }

    calculateArea(image, scaleFactor) {
        const pixelArea = image.width * image.height;
        const scaledArea = pixelArea / (scaleFactor * scaleFactor);
        
        return {
            pixelArea: pixelArea,
            scaledArea: scaledArea.toFixed(2),
            unit: 'units²'
        };
    }

    calculatePerimeter(image, scaleFactor) {
        // Simple rectangular perimeter
        const pixelPerimeter = 2 * (image.width + image.height);
        const scaledPerimeter = pixelPerimeter / scaleFactor;
        
        return {
            pixelPerimeter: pixelPerimeter,
            scaledPerimeter: scaledPerimeter.toFixed(2),
            unit: 'units'
        };
    }

    calculateDimensions(image, scaleFactor) {
        const scaledWidth = image.width / scaleFactor;
        const scaledHeight = image.height / scaleFactor;
        
        return {
            pixelWidth: image.width,
            pixelHeight: image.height,
            scaledWidth: scaledWidth.toFixed(2),
            scaledHeight: scaledHeight.toFixed(2),
            aspectRatio: (image.width / image.height).toFixed(3),
            unit: 'units'
        };
    }

    analyzeColors(image) {
        const imageData = image.ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        const colorMap = new Map();
        const sampleRate = 10; // Sample every 10th pixel for performance

        // Sample colors
        for (let i = 0; i < data.length; i += 4 * sampleRate) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a > 128) { // Only count non-transparent pixels
                const colorKey = `${Math.floor(r/32)*32},${Math.floor(g/32)*32},${Math.floor(b/32)*32}`;
                colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
            }
        }

        // Get top 5 colors
        const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color, count]) => {
                const [r, g, b] = color.split(',').map(Number);
                return {
                    rgb: `rgb(${r}, ${g}, ${b})`,
                    hex: this.rgbToHex(r, g, b),
                    percentage: ((count / (data.length / 4 / sampleRate)) * 100).toFixed(1)
                };
            });

        return {
            dominantColors: sortedColors,
            totalPixels: image.width * image.height
        };
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    displayResults(results, measurementType) {
        const resultsContainer = document.getElementById('calculation-results');
        if (!resultsContainer) return;

        let html = '';

        results.forEach((result, index) => {
            html += `<div class="result-group">`;
            html += `<h4>${result.imageName}</h4>`;

            switch (measurementType) {
                case 'area':
                    html += `
                        <div class="result-item">
                            <span class="result-label">Pixel Area:</span>
                            <span class="result-value">${result.pixelArea.toLocaleString()} px²</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Scaled Area:</span>
                            <span class="result-value">${result.scaledArea} ${result.unit}</span>
                        </div>
                    `;
                    break;

                case 'perimeter':
                    html += `
                        <div class="result-item">
                            <span class="result-label">Pixel Perimeter:</span>
                            <span class="result-value">${result.pixelPerimeter} px</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Scaled Perimeter:</span>
                            <span class="result-value">${result.scaledPerimeter} ${result.unit}</span>
                        </div>
                    `;
                    break;

                case 'dimensions':
                    html += `
                        <div class="result-item">
                            <span class="result-label">Pixel Size:</span>
                            <span class="result-value">${result.pixelWidth} × ${result.pixelHeight} px</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Scaled Size:</span>
                            <span class="result-value">${result.scaledWidth} × ${result.scaledHeight} ${result.unit}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Aspect Ratio:</span>
                            <span class="result-value">${result.aspectRatio}:1</span>
                        </div>
                    `;
                    break;

                case 'color-analysis':
                    html += `
                        <div class="result-item">
                            <span class="result-label">Total Pixels:</span>
                            <span class="result-value">${result.totalPixels.toLocaleString()}</span>
                        </div>
                    `;
                    result.dominantColors.forEach((color, i) => {
                        html += `
                            <div class="result-item">
                                <span class="result-label">
                                    <span class="color-swatch" style="background-color: ${color.rgb}"></span>
                                    Color ${i + 1}:
                                </span>
                                <span class="result-value">${color.hex} (${color.percentage}%)</span>
                            </div>
                        `;
                    });
                    break;
            }

            html += `</div>`;
            if (index < results.length - 1) {
                html += `<hr style="margin: 12px 0; border: none; border-top: 1px solid #e1e5e9;">`;
            }
        });

        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';

        // Save results to deliverable if needed
        this.saveCalculationResults(results, measurementType);
    }

    async saveCalculationResults(results, measurementType) {
        // Create a summary for the deliverable
        const summary = {
            type: 'image_calculation',
            measurementType: measurementType,
            timestamp: new Date().toISOString(),
            results: results.map(r => ({
                imageName: r.imageName,
                summary: this.getResultSummary(r, measurementType)
            }))
        };

        // You could save this to Supabase or attach to a deliverable
        console.log('Calculation results:', summary);
        
        // Optionally, create a sticky note on the Miro board with results
        if (typeof miro !== 'undefined') {
            await this.createResultStickyNote(summary);
        }
    }

    getResultSummary(result, measurementType) {
        switch (measurementType) {
            case 'area':
                return `Area: ${result.scaledArea} ${result.unit}`;
            case 'perimeter':
                return `Perimeter: ${result.scaledPerimeter} ${result.unit}`;
            case 'dimensions':
                return `${result.scaledWidth} × ${result.scaledHeight} ${result.unit}`;
            case 'color-analysis':
                return `${result.dominantColors.length} dominant colors analyzed`;
            default:
                return 'Calculation completed';
        }
    }

    async createResultStickyNote(summary) {
        try {
            const content = `📐 Image Calculation Results\n\n` +
                `Type: ${summary.measurementType}\n` +
                `Images: ${summary.results.length}\n\n` +
                summary.results.map(r => `• ${r.imageName}: ${r.summary}`).join('\n');

            await miro.board.createStickyNote({
                content: content,
                style: {
                    fillColor: '#e3f2fd',
                    textAlign: 'left'
                },
                x: Math.random() * 1000,
                y: Math.random() * 1000
            });

            console.log('Created result sticky note on Miro board');
        } catch (error) {
            console.error('Failed to create sticky note:', error);
        }
    }

    showError(message) {
        // Show error in a simple way
        if (typeof miro !== 'undefined') {
            miro.board.notifications.showError(message);
        } else {
            alert(message);
        }
    }

    // Reset calculator
    reset() {
        this.uploadedImages = [];
        this.selectedImages = [];
        
        document.getElementById('image-upload-area').style.display = 'block';
        document.getElementById('images-grid').style.display = 'none';
        document.getElementById('calculation-results').style.display = 'none';
        document.getElementById('image-input').value = '';
        
        this.updateCalculateButton();
    }
}

// Initialize image calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageCalculator = new ImageCalculator();
});