/**
 * Ultra-Smooth & Hyper-Interactive Physics Cursor
 * Features:
 * - Fluid Linear Interpolation (Lerp) with Momentum
 * - Velocity-Driven Squash & Stretch (Liquid Physics)
 * - Magnetic Attraction on Buttons, Links & Badges
 * - Dynamic Contextual Cursor Badges (VIEW, GO, CLICK)
 * - Subtle Glowing Stardust Particle Trail
 * - Dual-Ring Shockwave Ripple on Click
 */

document.addEventListener('DOMContentLoaded', () => {
    // Disable on touch / mobile devices for clean native touch UX
    if (window.matchMedia('(pointer: coarse)').matches) {
        return;
    }

    // Ensure cursor elements exist
    let cursorDot = document.getElementById('cursor-dot');
    let cursorOutline = document.getElementById('cursor-outline');

    if (!cursorDot) {
        cursorDot = document.createElement('div');
        cursorDot.id = 'cursor-dot';
        document.body.appendChild(cursorDot);
    }

    if (!cursorOutline) {
        cursorOutline = document.createElement('div');
        cursorOutline.id = 'cursor-outline';
        cursorOutline.innerHTML = '<span id="cursor-text"></span>';
        document.body.appendChild(cursorOutline);
    }

    const cursorText = document.getElementById('cursor-text');

    // Coordinates and physics parameters
    let mouseX = -100;
    let mouseY = -100;
    let targetX = -100;
    let targetY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let velX = 0;
    let velY = 0;
    let currentAngle = 0;
    let currentScaleX = 1;
    let currentScaleY = 1;
    let isVisible = false;
    let isMagnetic = false;
    let magneticTarget = null;

    // Particle throttling
    let lastParticleTime = 0;
    let lastParticleX = 0;
    let lastParticleY = 0;

    // Mouse movement listener
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
            outlineX = mouseX;
            outlineY = mouseY;
            targetX = mouseX;
            targetY = mouseY;
        }

        // Check if cursor is attracted to a magnetic element
        if (isMagnetic && magneticTarget) {
            const rect = magneticTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Weighted pull towards element center
            targetX = centerX + (mouseX - centerX) * 0.35;
            targetY = centerY + (mouseY - centerY) * 0.35;
            
            // Move the button slightly towards cursor for magnetic feedback
            const shiftX = (mouseX - centerX) * 0.22;
            const shiftY = (mouseY - centerY) * 0.22;
            magneticTarget.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
        } else {
            targetX = mouseX;
            targetY = mouseY;
        }

        // Inner dot tracks position immediately
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

        // Spawn subtle luminous stardust trail on movement
        spawnTrailParticle(mouseX, mouseY);
    });

    // 60-120fps Smooth Physics Loop
    function render() {
        // High-precision Lerp factor for liquid smoothness
        const easing = isMagnetic ? 0.22 : 0.18;
        
        velX = targetX - outlineX;
        velY = targetY - outlineY;

        outlineX += velX * easing;
        outlineY += velY * easing;

        // Calculate velocity and motion stretch angle
        const speed = Math.hypot(velX, velY);
        
        if (speed > 1.2 && !isMagnetic) {
            currentAngle = Math.atan2(velY, velX) * (180 / Math.PI);
            // Dynamic squash and stretch based on speed
            const stretch = Math.min(speed * 0.0022, 0.4);
            currentScaleX = 1 + stretch;
            currentScaleY = 1 - stretch * 0.7;
        } else {
            // Smoothly return to relaxed circular shape
            currentScaleX += (1 - currentScaleX) * 0.15;
            currentScaleY += (1 - currentScaleY) * 0.15;
        }

        // Apply hardware-accelerated 3D transform
        cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%) rotate(${currentAngle}deg) scale(${currentScaleX}, ${currentScaleY})`;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Subtle Stardust Trail Generator
    function spawnTrailParticle(x, y) {
        const now = performance.now();
        const dist = Math.hypot(x - lastParticleX, y - lastParticleY);

        // Throttle to every 35ms or at least 20px travel
        if (now - lastParticleTime > 35 && dist > 18) {
            lastParticleTime = now;
            lastParticleX = x;
            lastParticleY = y;

            const particle = document.createElement('div');
            particle.className = 'cursor-trail-particle';
            // Slight randomized drift
            const offsetX = (Math.random() - 0.5) * 8;
            const offsetY = (Math.random() - 0.5) * 8;
            particle.style.left = `${x + offsetX}px`;
            particle.style.top = `${y + offsetY}px`;
            
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 450);
        }
    }

    // Interactive & Magnetic Elements Setup
    function initInteractivity() {
        // 1. Magnetic Elements (Buttons, Nav items, Badges)
        const magneticElements = document.querySelectorAll('.nav-links a, .btn, .btn-primary, .btn-secondary, .section-badge, button');
        
        magneticElements.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                isMagnetic = true;
                magneticTarget = el;
                cursorOutline.classList.add('cursor-magnetic');
                cursorDot.classList.add('cursor-magnetic-dot');
            });

            el.addEventListener('mouseleave', () => {
                isMagnetic = false;
                if (magneticTarget) {
                    magneticTarget.style.transform = 'translate(0px, 0px)';
                    magneticTarget.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    setTimeout(() => {
                        if (magneticTarget) magneticTarget.style.transition = '';
                    }, 350);
                }
                magneticTarget = null;
                cursorOutline.classList.remove('cursor-magnetic');
                cursorDot.classList.remove('cursor-magnetic-dot');
            });
        });

        // 2. Interactive hover elements with contextual labels
        const imageFrames = document.querySelectorAll('.featured-image-frame');
        imageFrames.forEach((frame) => {
            frame.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('cursor-badge-mode');
                cursorText.textContent = 'EXPLORE';
            });
            frame.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('cursor-badge-mode');
                cursorText.textContent = '';
            });
        });

        // 3. Regular Interactive Elements (Links, Cards, Inputs, Tables)
        const generalInteractives = document.querySelectorAll('a:not(.nav-links a):not(.btn), input, select, textarea, .feature-box, .modern-table tbody tr');
        generalInteractives.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover-dot');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover-dot');
            });
        });
    }

    initInteractivity();

    // Click Shockwave Animation
    window.addEventListener('mousedown', (e) => {
        cursorOutline.classList.add('cursor-active');
        createShockwave(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
        cursorOutline.classList.remove('cursor-active');
    });

    // Window Visibility Handlers
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
        isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
        isVisible = true;
    });

    // Dual-Ring Shockwave
    function createShockwave(x, y) {
        const wave = document.createElement('div');
        wave.className = 'cursor-shockwave';
        wave.style.left = `${x}px`;
        wave.style.top = `${y}px`;
        document.body.appendChild(wave);

        const flash = document.createElement('div');
        flash.className = 'cursor-flash';
        flash.style.left = `${x}px`;
        flash.style.top = `${y}px`;
        document.body.appendChild(flash);

        setTimeout(() => {
            wave.remove();
            flash.remove();
        }, 550);
    }
});
