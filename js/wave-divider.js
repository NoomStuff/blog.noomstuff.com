const waveConfig = {
    segments: 200, // number of segments to divide the wave into
    tilt: 0, // positive = lift right, negative = lift left
    flipped: false, // flip the wave upside down
    color: 'var(--background-color)', // CSS color or variable
    waves: [ // Multiple stacked wave layers
        { amplitude: 31, frequency: 0.0041, speed: 0.0001, phase: 0 },
        { amplitude: 12, frequency: 0.0212, speed: 0.0013, phase: 0 },
        { amplitude: 5, frequency: 0.0457, speed: 0.0076, phase: 0 },
        { amplitude: 2, frequency: 0.0937, speed: 0.0037, phase: 0 }
    ]
};

// Inject styles
if (!document.getElementById('wave-divider-styles')) {
    const style = document.createElement('style');
    style.id = 'wave-divider-styles';
    style.textContent = `
        .wave-divider {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            display: block;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }

        .wave-divider svg {
            display: block;
        }
    `;
    document.head.appendChild(style);
}

// Get configuration for a specific divider element
function getDividerConfig(element) {
    const config = {
        ...waveConfig,
        waves: waveConfig.waves.map(wave => ({ ...wave }))
    };
    
    // Override with data attributes
    if (element.hasAttribute('data-segments')) {
        config.segments = parseInt(element.getAttribute('data-segments'), 10);
    }
    if (element.hasAttribute('data-tilt')) {
        config.tilt = parseFloat(element.getAttribute('data-tilt'));
    }
    if (element.hasAttribute('data-flipped')) {
        config.flipped = element.getAttribute('data-flipped') !== 'false';
    }
    if (element.hasAttribute('data-color')) {
        config.color = element.getAttribute('data-color');
    }
    
    config.segments = Number.isFinite(config.segments) ? Math.max(2, Math.min(2000, config.segments)) : waveConfig.segments;
    config.tilt = Number.isFinite(config.tilt) ? config.tilt : waveConfig.tilt;

    return config;
}

// Initialize wave dividers
function initWaveDividers() {
    const dividers = document.querySelectorAll('.wave-divider');
    
    dividers.forEach(container => {
        const existingSvg = container.querySelector('svg');
        if (existingSvg) {
            existingSvg.remove();
        }
        
        const dividerConfig = getDividerConfig(container);

        // Add flipped class if needed
        if (dividerConfig.flipped) {
            container.classList.add('wave-divider--flipped');
        } else {
            container.classList.remove('wave-divider--flipped');
        }
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        
        // Create path for the wave
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'wave-path');
        path.setAttribute('fill', dividerConfig.color);
        path.setAttribute('data-config', JSON.stringify(dividerConfig));
        
        svg.appendChild(path);
        container.appendChild(svg);

    });
}

function generateWavePath() {
    const wavePaths = document.querySelectorAll('.wave-path');
    
    wavePaths.forEach(wavePath => {
        const svg = wavePath.ownerSVGElement;
        const container = svg?.parentElement;
        if (!svg || !container) return;

        // The parent affects only the SVG viewport. The path below is drawn
        // in the same CSS-pixel coordinate system, so it is never scaled.
        const viewportWidth = Math.max(1, container.clientWidth);
        const viewportHeight = Math.max(1, container.clientHeight);
        svg.setAttribute('width', viewportWidth);
        svg.setAttribute('height', viewportHeight);
        svg.setAttribute('viewBox', `0 0 ${viewportWidth} ${viewportHeight}`);

        let dividerConfig;
        try {
            dividerConfig = JSON.parse(wavePath.getAttribute('data-config'));
        } catch {
            return;
        }

        const segments = dividerConfig.segments;
        const tilt = dividerConfig.tilt;
        const isFlipped = dividerConfig.flipped;
        
        const midlineY = 0;
        
        // Define the baseline heights at left and right edges
        let leftBaselineY = midlineY + Math.min(tilt, 0);
        let rightBaselineY = midlineY - Math.max(tilt, 0);
        
        // Flip the baseline if needed
        if (isFlipped) {
            [leftBaselineY, rightBaselineY] = [-rightBaselineY, -leftBaselineY];
        }
        
        let pathPoints = [];

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * viewportWidth;
            const t = i / segments;
            
            // Linearly interpolate baseline from left to right
            let y = leftBaselineY + (rightBaselineY - leftBaselineY) * t;

            // Stack multiple waves together
            for (let waveLayer of dividerConfig.waves) {
                // Frequency is radians per CSS pixel, not per divider width.
                let waveOffset = Math.sin(x * waveLayer.frequency + waveLayer.phase) * waveLayer.amplitude;
                // Invert wave offset if flipped
                if (isFlipped) {
                    waveOffset = -waveOffset;
                }
                y += waveOffset;
            }

            pathPoints.push({ x, y });
        }

        // Anchor to the wave's lowest possible extreme.
        const waveRange = dividerConfig.waves.reduce(
            (total, waveLayer) => total + Math.abs(waveLayer.amplitude),
            0
        );
        const highestBaseline = Math.max(leftBaselineY, rightBaselineY);
        const lowestBaseline = Math.min(leftBaselineY, rightBaselineY);
        const translation = isFlipped
            ? -(lowestBaseline - waveRange)
            : viewportHeight - (highestBaseline + waveRange);
        for (const point of pathPoints) {
            point.y = Math.min(viewportHeight, Math.max(0, point.y + translation));
        }

        // Build path string
        let path = `M${pathPoints[0].x},${pathPoints[0].y}`;
        for (let i = 1; i < pathPoints.length; i++) {
            path += ` L${pathPoints[i].x},${pathPoints[i].y}`;
        }

        // Close the shape
        if (isFlipped) {
            path += ` L${viewportWidth},0 L0,0 Z`;
        } else {
            path += ` L${viewportWidth},${viewportHeight} L0,${viewportHeight} Z`;
        }
        
        wavePath.setAttribute('d', path);
    });
}

function animateWaves() {
    // Update phase for each wave layer in each divider
    const wavePaths = document.querySelectorAll('.wave-path');
    
    wavePaths.forEach(wavePath => {
        let dividerConfig;
        try {
            dividerConfig = JSON.parse(wavePath.getAttribute('data-config'));
        } catch {
            return;
        }

        if (!Array.isArray(dividerConfig.waves)) return;
        
        // Update phase for each wave layer
        for (let waveLayer of dividerConfig.waves) {
            if (!Number.isFinite(waveLayer.phase) || !Number.isFinite(waveLayer.speed)) continue;
            waveLayer.phase -= waveLayer.speed;
        }
        
        // Update the stored config
        wavePath.setAttribute('data-config', JSON.stringify(dividerConfig));
    });
    
    generateWavePath();
    requestAnimationFrame(animateWaves);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initWaveDividers();
        generateWavePath();
        animateWaves();
        
    });
} else {
    initWaveDividers();
    generateWavePath();
    animateWaves();
    
}
