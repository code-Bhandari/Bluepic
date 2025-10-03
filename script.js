// ============================================
// CONFIGURATION - Change these values as needed
// ============================================

const CONFIG = {
    // FREE API OPTIONS:
    // 1. Pollinations.AI (FREE, NO API KEY) - Currently enabled by default
    // 2. Your own backend proxy for Stability AI, Replicate, OpenAI, etc.
    
    // Pollinations.AI - Free image generation (no signup required!)
    USE_POLLINATIONS: true,
    POLLINATIONS_API: 'https://image.pollinations.ai/prompt/',
    
    // Alternative: Your own backend endpoint
    API_ENDPOINT: '/api/generate',
    
    // Enable mock mode for testing UI only
    MOCK_MODE: false,
    
    // Image size mappings
    IMAGE_SIZES: {
        small: { width: 512, height: 512 },
        medium: { width: 1024, height: 1024 },
        large: { width: 1536, height: 1536 }
    },
    
    // Aspect ratio mappings
    ASPECT_RATIOS: {
        '1:1': { width: 1, height: 1 },
        '3:2': { width: 3, height: 2 },
        '16:9': { width: 16, height: 9 },
        '2:3': { width: 2, height: 3 }
    },
    
    // Style preset suffixes to append to prompts
    STYLE_PRESETS: {
        photorealistic: ', photorealistic, highly detailed, 8k, professional photography',
        illustration: ', digital illustration, artstation trending, concept art',
        cyberpunk: ', cyberpunk style, neon lights, futuristic, blade runner aesthetic',
        anime: ', anime style, manga art, cel shaded, studio ghibli quality',
        minimal: ', minimalist design, clean, simple, flat colors, modern',
        watercolor: ', watercolor painting, soft colors, artistic, hand-painted'
    },
    
    // Pollinations specific models
    POLLINATIONS_MODELS: {
        flux: 'flux',  // High quality, slower
        turbo: 'turbo' // Faster, good quality
    },
    
    // Gallery settings
    MAX_GALLERY_ITEMS: 6
};

// ============================================
// STATE MANAGEMENT
// ============================================

let currentState = {
    isGenerating: false,
    currentImage: null,
    selectedStyle: null,
    lastPrompt: null,
    lastOptions: null
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    promptInput: document.getElementById('prompt-input'),
    helperButtons: document.querySelectorAll('.helper-btn'),
    styleButtons: document.querySelectorAll('.preset-pill'),
    aspectRatio: document.getElementById('aspect-ratio'),
    imageSize: document.getElementById('image-size'),
    advancedToggle: document.getElementById('advanced-toggle'),
    advancedSettings: document.getElementById('advanced-settings'),
    seedInput: document.getElementById('seed'),
    guidanceInput: document.getElementById('guidance'),
    guidanceValue: document.getElementById('guidance-value'),
    stepsInput: document.getElementById('steps'),
    stepsValue: document.getElementById('steps-value'),
    negativePrompt: document.getElementById('negative-prompt'),
    generateBtn: document.getElementById('generate-btn'),
    btnText: document.querySelector('.btn-text'),
    btnLoader: document.querySelector('.btn-loader'),
    progressContainer: document.getElementById('progress-container'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    errorToast: document.getElementById('error-toast'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    previewSection: document.getElementById('preview-section'),
    previewImage: document.getElementById('preview-image'),
    previewMeta: document.getElementById('preview-meta'),
    downloadBtn: document.getElementById('download-btn'),
    regenerateBtn: document.getElementById('regenerate-btn'),
    newPromptBtn: document.getElementById('new-prompt-btn'),
    galleryGrid: document.getElementById('gallery-grid')
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadGallery();
    updateRangeValues();
    showAPIStatus();
});

function showAPIStatus() {
    console.log(`🎨 Bluepic Image Generator Ready!`);
    if (CONFIG.USE_POLLINATIONS) {
        console.log(`✅ Using FREE Pollinations.AI API (no signup required)`);
    } else if (CONFIG.MOCK_MODE) {
        console.log(`⚠️ Running in MOCK mode`);
    } else {
        console.log(`🔧 Using custom API: ${CONFIG.API_ENDPOINT}`);
    }
}

function initializeEventListeners() {
    // Prompt helpers
    elements.helperButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.promptInput.value = btn.dataset.prompt;
            elements.promptInput.focus();
        });
    });
    
    // Style presets
    elements.styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentState.selectedStyle = btn.dataset.style;
        });
    });
    
    // Advanced settings toggle
    elements.advancedToggle.addEventListener('click', () => {
        const isExpanded = elements.advancedToggle.getAttribute('aria-expanded') === 'true';
        elements.advancedToggle.setAttribute('aria-expanded', !isExpanded);
        elements.advancedSettings.hidden = isExpanded;
    });
    
    // Range inputs
    elements.guidanceInput.addEventListener('input', updateRangeValues);
    elements.stepsInput.addEventListener('input', updateRangeValues);
    
    // Generate button
    elements.generateBtn.addEventListener('click', handleGenerate);
    
    // Preview actions
    elements.downloadBtn.addEventListener('click', handleDownload);
    elements.regenerateBtn.addEventListener('click', handleRegenerate);
    elements.newPromptBtn.addEventListener('click', handleNewPrompt);
    elements.retryBtn.addEventListener('click', handleGenerate);
}

function updateRangeValues() {
    elements.guidanceValue.textContent = elements.guidanceInput.value;
    elements.stepsValue.textContent = elements.stepsInput.value;
}

// ============================================
// IMAGE GENERATION - MAIN FUNCTION
// ============================================

/**
 * Generate image from prompt using Pollinations.AI (FREE!)
 * or your custom API backend
 */
async function generateImage(prompt, options) {
    // Use Pollinations.AI free API
    if (CONFIG.USE_POLLINATIONS) {
        return await generateWithPollinations(prompt, options);
    }
    
    // Use mock mode for testing
    if (CONFIG.MOCK_MODE) {
        return await mockGenerateImage(prompt, options);
    }
    
    // Use custom backend API
    return await generateWithCustomAPI(prompt, options);
}

/**
 * Generate image using FREE Pollinations.AI API
 * No API key required! No signup needed!
 * 
 * Pollinations.AI provides free AI image generation
 * API Documentation: https://image.pollinations.ai/
 */
async function generateWithPollinations(prompt, options) {
    try {
        updateProgress(10, 'Connecting to Pollinations.AI...');
        
        // Build URL with parameters
        // Format: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}&seed={s}&model={model}&nologo=true
        const encodedPrompt = encodeURIComponent(prompt);
        const params = new URLSearchParams({
            width: options.width.toString(),
            height: options.height.toString(),
            seed: (options.seed || Math.floor(Math.random() * 1000000)).toString(),
            model: CONFIG.POLLINATIONS_MODELS.flux,
            nologo: 'true',
            enhance: 'true' // Enhanced quality
        });
        
        // Add negative prompt if provided
        if (options.negativePrompt) {
            params.append('negative', options.negativePrompt);
        }
        
        const imageUrl = `${CONFIG.POLLINATIONS_API}${encodedPrompt}?${params.toString()}`;
        
        updateProgress(30, 'Sending request...');
        
        // Fetch the image
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.status}`);
        }
        
        updateProgress(60, 'Generating image...');
        
        // Convert to base64 for easier handling
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        
        updateProgress(90, 'Finalizing...');
        
        // Wait a moment for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateProgress(100, 'Complete!');
        
        return {
            image_base64: base64,
            image_url: imageUrl, // Keep URL for re-download
            meta: {
                seed: params.get('seed'),
                width: options.width,
                height: options.height,
                model: 'Pollinations.AI Flux',
                nsfw: false
            }
        };
        
    } catch (error) {
        console.error('Pollinations generation error:', error);
        throw new Error('Failed to generate image with Pollinations.AI. Please try again.');
    }
}

/**
 * Generate with custom backend API
 * Use this when you have your own server with Stability AI, Replicate, etc.
 */
async function generateWithCustomAPI(prompt, options) {
    try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                negative_prompt: options.negativePrompt,
                width: options.width,
                height: options.height,
                steps: options.steps,
                seed: options.seed,
                guidance: options.guidance
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check for NSFW content
        if (data.meta?.nsfw) {
            throw new Error('Content filtered: The generated image was flagged as inappropriate.');
        }
        
        return data;
        
    } catch (error) {
        console.error('Generation error:', error);
        throw error;
    }
}

/**
 * Mock image generation for testing UI
 */
async function mockGenerateImage(prompt, options) {
    await simulateProgress();
    
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const words = prompt.substring(0, 100).split(' ');
    let line = '';
    let y = canvas.height / 2 - 40;
    
    for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > canvas.width - 100 && line !== '') {
            ctx.fillText(line, canvas.width / 2, y);
            line = word + ' ';
            y += 40;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, canvas.width / 2, y);
    
    ctx.font = '20px sans-serif';
    ctx.fillText('[Mock Preview - Enable Pollinations.AI]', canvas.width / 2, canvas.height - 40);
    
    return {
        image_base64: canvas.toDataURL('image/png'),
        meta: {
            seed: options.seed || Math.floor(Math.random() * 1000000),
            width: options.width,
            height: options.height,
            nsfw: false
        }
    };
}

async function simulateProgress() {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
        updateProgress((i / steps) * 100, `Generating... ${Math.round((i / steps) * 100)}%`);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

// Helper function to convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ============================================
// UI HANDLERS
// ============================================

async function handleGenerate() {
    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        showError('Please enter a description for the image you want to generate.');
        elements.promptInput.focus();
        return;
    }
    
    if (currentState.isGenerating) return;
    
    const options = getGenerationOptions();
    
    // Apply style preset
    let finalPrompt = prompt;
    if (currentState.selectedStyle) {
        finalPrompt += CONFIG.STYLE_PRESETS[currentState.selectedStyle];
    }
    
    currentState.lastPrompt = finalPrompt;
    currentState.lastOptions = options;
    
    startGenerating();
    hideError();
    
    try {
        const result = await generateImage(finalPrompt, options);
        displayImage(result);
        saveToGallery(result, prompt);
    } catch (error) {
        showError(error.message || 'Failed to generate image. Please try again.');
    } finally {
        stopGenerating();
    }
}

function getGenerationOptions() {
    const aspectRatio = CONFIG.ASPECT_RATIOS[elements.aspectRatio.value];
    const sizeConfig = CONFIG.IMAGE_SIZES[elements.imageSize.value];
    
    let width = sizeConfig.width;
    let height = sizeConfig.height;
    
    if (aspectRatio) {
        const ratio = aspectRatio.width / aspectRatio.height;
        if (ratio > 1) {
            height = Math.round(width / ratio);
        } else {
            width = Math.round(height * ratio);
        }
    }
    
    return {
        width: width,
        height: height,
        seed: elements.seedInput.value ? parseInt(elements.seedInput.value) : null,
        guidance: parseFloat(elements.guidanceInput.value),
        steps: parseInt(elements.stepsInput.value),
        negativePrompt: elements.negativePrompt.value.trim()
    };
}

function startGenerating() {
    currentState.isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.btnText.hidden = true;
    elements.btnLoader.hidden = false;
    elements.progressContainer.hidden = false;
    elements.previewSection.hidden = true;
    updateProgress(0, 'Preparing...');
}

function stopGenerating() {
    currentState.isGenerating = false;
    elements.generateBtn.disabled = false;
    elements.btnText.hidden = false;
    elements.btnLoader.hidden = true;
    elements.progressContainer.hidden = true;
}

function updateProgress(percent, text) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = text;
}

function displayImage(result) {
    const imageSrc = result.image_base64 || result.image_url;
    
    elements.previewImage.src = imageSrc;
    elements.previewSection.hidden = false;
    
    currentState.currentImage = result;
    
    const meta = result.meta || {};
    elements.previewMeta.innerHTML = `
        <strong>Size:</strong> ${meta.width}×${meta.height}px | 
        <strong>Seed:</strong> ${meta.seed || 'N/A'} | 
        <strong>Model:</strong> ${meta.model || 'Pollinations.AI'}
    `;
    
    elements.previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorToast.hidden = false;
}

function hideError() {
    elements.errorToast.hidden = true;
}

// ============================================
// PREVIEW ACTIONS
// ============================================

function handleDownload() {
    if (!currentState.currentImage) return;
    
    const imageSrc = currentState.currentImage.image_base64 || currentState.currentImage.image_url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `Bluepic_${timestamp}.png`;
    
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleRegenerate() {
    if (!currentState.lastPrompt) return;
    
    // New seed for variation
    currentState.lastOptions.seed = Math.floor(Math.random() * 1000000);
    if (elements.seedInput.value) {
        elements.seedInput.value = currentState.lastOptions.seed;
    }
    
    startGenerating();
    hideError();
    
    generateImage(currentState.lastPrompt, currentState.lastOptions)
        .then(result => {
            displayImage(result);
            saveToGallery(result, currentState.lastPrompt);
        })
        .catch(error => {
            showError(error.message || 'Failed to regenerate image.');
        })
        .finally(() => {
            stopGenerating();
        });
}

function handleNewPrompt() {
    elements.promptInput.value = '';
    elements.promptInput.focus();
    elements.previewSection.hidden = true;
    currentState.selectedStyle = null;
    elements.styleButtons.forEach(btn => btn.classList.remove('active'));
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

function saveToGallery(result, prompt) {
    try {
        const gallery = getGalleryData();
        const imageSrc = result.image_base64 || result.image_url;
        
        gallery.unshift({
            image: imageSrc,
            prompt: prompt.substring(0, 100),
            timestamp: Date.now(),
            meta: result.meta
        });
        
        if (gallery.length > CONFIG.MAX_GALLERY_ITEMS) {
            gallery.splice(CONFIG.MAX_GALLERY_ITEMS);
        }
        
        window.galleryData = gallery;
        renderGallery();
        
    } catch (error) {
        console.error('Failed to save to gallery:', error);
    }
}

function getGalleryData() {
    return window.galleryData || [];
}

function loadGallery() {
    window.galleryData = [];
    renderGallery();
}

function renderGallery() {
    const gallery = getGalleryData();
    
    if (gallery.length === 0) {
        elements.galleryGrid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); grid-column: 1/-1;">No images yet. Generate your first image!</p>';
        return;
    }
    
    elements.galleryGrid.innerHTML = gallery.map((item, index) => `
        <div class="gallery-item" onclick="loadFromGallery(${index})" role="button" tabindex="0" aria-label="Load gallery image ${index + 1}">
            <img src="${item.image}" alt="${item.prompt}" />
        </div>
    `).join('');
}

function loadFromGallery(index) {
    const gallery = getGalleryData();
    const item = gallery[index];
    
    if (item) {
        displayImage({
            image_base64: item.image,
            meta: item.meta
        });
        currentState.currentImage = { image_base64: item.image, meta: item.meta };
    }
}

window.loadFromGallery = loadFromGallery;

// ============================================
// KEYBOARD ACCESSIBILITY
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('gallery-item') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
    }
});