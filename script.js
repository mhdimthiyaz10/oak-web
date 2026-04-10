document.addEventListener('DOMContentLoaded', () => {
    // Sticky Navbar
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
            navbar.style.boxShadow = 'none';
        }
    });
    // Frame by Frame Canvas Scroll Logic
    const videoCanvas = document.getElementById('video-canvas');
    if (videoCanvas) {
        const context = videoCanvas.getContext('2d');
        
        // ----------------------------------------------------
        // Configuration mapped to your 'frame-by-frame' directory
        // ----------------------------------------------------
        const frameCount = 240;
        const currentFrame = index => (
            `frame-by-frame/ezgif-frame-${index.toString().padStart(3, '0')}.png`
        );

        // Preload images for smooth animation without flicker
        const images = [];
        let loadedFrames = 0;
        
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedFrames++;
                // Draw first frame immediately when it's loaded as the placeholder
                if (i === 1) {
                    videoCanvas.width = img.width || 1920;
                    videoCanvas.height = img.height || 1080;
                    context.drawImage(img, 0, 0);
                }
            };
            images.push(img);
        }

        const scrollVideoSection = document.getElementById('scroll-video-section');

        function mapRangeVideo(value, inMin, inMax, outMin, outMax) {
            if (value <= inMin) return outMin;
            if (value >= inMax) return outMax;
            return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
        }

        // ── Arc Cards Setup ──────────────────────────────────────
        const TOTAL_ARC_CARDS = 15;
        const arcCards = [];
        for (let i = 0; i < TOTAL_ARC_CARDS; i++) {
            arcCards.push(document.getElementById(`arc-card-${i}`));
        }

        // Stagger between cards in radians (~16°) — creates visible gaps
        const ARC_STAGGER   = 0.28;
        const EXTRA_BEFORE  = 0.5;   // radians off-screen right at start
        const EXTRA_AFTER   = (TOTAL_ARC_CARDS - 1) * ARC_STAGGER + 0.5; // off-screen left at end
        const ARC_TOTAL_RANGE = Math.PI + EXTRA_BEFORE + EXTRA_AFTER;

        function positionArcCards(scrollFraction) {
            const W  = window.innerWidth;
            const H  = window.innerHeight;
            // Ellipse centred at bottom-centre: arc goes right-edge → centre → left-edge
            const CX = W / 2;
            const CY = H;
            const RX = W / 2 + 160;  // slightly beyond right/left edges
            const RY = H / 2 + 60;   // high enough to pass through screen centre

            // theta for the leading card (card 0) sweeps the full arc range
            const theta0 = scrollFraction * ARC_TOTAL_RANGE - EXTRA_BEFORE;

            // Section is active only while scroll-video-section is pinned
            const sectionActive = scrollFraction > 0 && scrollFraction < 1;

            arcCards.forEach((card, i) => {
                if (!card) return;

                const theta = theta0 - i * ARC_STAGGER;

                // x/y on the ellipse
                const x = CX + RX * Math.cos(theta);
                const y = CY - RY * Math.sin(theta);

                card.style.left = x + 'px';
                card.style.top  = y + 'px';

                // Fade in/out smoothly near screen edges (theta 0 → π visible range)
                const edgeFade = 0.25; // radians
                const fadeIn  = Math.min(1, Math.max(0, (theta)             / edgeFade));
                const fadeOut = Math.min(1, Math.max(0, (Math.PI - theta)   / edgeFade));
                const alpha   = sectionActive ? Math.min(fadeIn, fadeOut) : 0;

                card.style.opacity = alpha;
            });
        }

        let lastFrameIndex = 0;
        window.addEventListener('scroll', () => {
            if (!scrollVideoSection || loadedFrames === 0) return;

            const rect = scrollVideoSection.getBoundingClientRect();
            const maxScroll = scrollVideoSection.scrollHeight - window.innerHeight;
            
            let scrollFraction = 0;
            // Negative top means it has hit the top of viewport and started scrolling past
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                // Determine completion ratio
                scrollFraction = -rect.top / maxScroll; 
            } else if (rect.bottom < window.innerHeight) {
                // Section is completely scrolled past
                scrollFraction = 1;
            } else if (rect.top > 0) {
                // Section hasn't reached the top of viewport yet
                scrollFraction = 0;
            }
            
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );
            
            // Only draw if frame changes to save resources
            if (frameIndex !== lastFrameIndex && images[frameIndex] && images[frameIndex].complete) {
                // Set initial canvas dimension bounds based on original footage aspect
                if (videoCanvas.width === 300) {
                    videoCanvas.width = images[frameIndex].width || 1920;
                    videoCanvas.height = images[frameIndex].height || 1080;
                }
                context.drawImage(images[frameIndex], 0, 0, videoCanvas.width, videoCanvas.height);
                lastFrameIndex = frameIndex;
            }

            // Circular Mask Reveal Logic for Earth Animation
            const canvasContainer = document.querySelector('.canvas-container');
            const venturesHeading = document.querySelector('.ventures-active-heading');
            
            if (canvasContainer) {
                // Starts as a 0% circle at progress=0, expands to ~150% (full screen) by progress=0.3
                const maskRadius = mapRangeVideo(scrollFraction, 0, 0.3, 0, 150);
                canvasContainer.style.clipPath = `circle(${maskRadius}% at 50% 50%)`;
            }

            // Show/Hide "Our Ventures" heading based on scroll
            if (venturesHeading) {
                if (scrollFraction > 0.05 && scrollFraction < 0.95) {
                    venturesHeading.classList.add('visible');
                } else {
                    venturesHeading.classList.remove('visible');
                }
            }

            // ── Animate arc cards along the circular path ──
            positionArcCards(scrollFraction);
        });
    }

});
