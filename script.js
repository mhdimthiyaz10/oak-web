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

    // Story Tunnel Logic (Recreating Framer Motion functionality in Vanilla JS)
    const tunnelSection = document.getElementById('story-tunnel');
    if (tunnelSection) {
        const total = 7;
        const layers = [];
        for (let i = 0; i < total; i++) {
            layers.push({
                layerEl: document.getElementById(`tunnel-layer-${i}`),
                textEl: document.getElementById(`tt-${i}`),
                dotEl: document.getElementById(`pd-${i}`)
            });
        }
        const ctaEl = document.getElementById('tunnel-cta');

        function mapRange(value, inMin, inMax, outMin, outMax) {
            if (value <= inMin) return outMin;
            if (value >= inMax) return outMax;
            return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
        }

        function mapMulti(value, inputRanges, outputRanges) {
            for (let i = 0; i < inputRanges.length - 1; i++) {
                if (value >= inputRanges[i] && value <= inputRanges[i+1]) {
                    return mapRange(value, inputRanges[i], inputRanges[i+1], outputRanges[i], outputRanges[i+1]);
                }
            }
            if (value < inputRanges[0]) return outputRanges[0];
            if (value > inputRanges[inputRanges.length - 1]) return outputRanges[outputRanges.length - 1];
            return outputRanges[0];
        }

        let tickingTunnel = false;
        let currentProgress = 0;
        let targetProgress = 0;
        
        function updateTunnel() {
            // Smooth easing (spring-like damping)
            currentProgress += (targetProgress - currentProgress) * 0.06;
            
            // Apply to progress dots
            for (let i = 0; i < total; i++) {
                const scaleX = mapRange(currentProgress, i / total, (i + 1) / total, 0, 1);
                if (layers[i].dotEl) {
                    layers[i].dotEl.style.transform = `scaleX(${scaleX})`;
                }
            }

            // Apply to layers
            for (let i = 0; i < total; i++) {
                const start = i / total;
                const end = (i + 2) / total;
                const exit = (i + 1) / total;

                const scale = mapMulti(currentProgress, [start, exit, end], [0.1, 1, 25]);
                const opacity = mapMulti(currentProgress, [start, start + 0.05, exit, exit + 0.05], [0, 1, 1, 0]);
                const blur = mapRange(currentProgress, exit, end, 0, 40);

                const textOpacity = mapMulti(currentProgress, [start + 0.02, start + 0.05, exit - 0.05, exit], [0, 1, 1, 0]);
                const textY = mapRange(currentProgress, start, exit, 20, -20);
                
                if (layers[i].layerEl && layers[i].textEl) {
                    layers[i].layerEl.style.zIndex = i + 1;
                    layers[i].layerEl.style.transform = `scale(${scale})`;
                    layers[i].layerEl.style.opacity = opacity;
                    layers[i].layerEl.style.filter = `blur(${blur}px)`;

                    layers[i].textEl.style.opacity = textOpacity;
                    layers[i].textEl.style.transform = `translateY(${textY}px)`;
                }
            }

            // CTA logic
            if (ctaEl) {
                const ctaOpacity = mapRange(currentProgress, 0.95, 1, 0, 1);
                const ctaScale = mapRange(currentProgress, 0.95, 1, 0.8, 1);
                ctaEl.style.opacity = ctaOpacity;
                ctaEl.style.transform = `scale(${ctaScale})`;
                ctaEl.style.pointerEvents = ctaOpacity > 0.5 ? 'auto' : 'none';
            }

            if (Math.abs(targetProgress - currentProgress) > 0.001) {
                requestAnimationFrame(updateTunnel);
            } else {
                tickingTunnel = false;
            }
        }

        window.addEventListener('scroll', () => {
            const rect = tunnelSection.getBoundingClientRect();
            const maxScroll = rect.height - window.innerHeight;
            
            let p = 0;
            if (rect.top > 0) {
                p = 0;
            } else if (rect.bottom < window.innerHeight) {
                p = 1;
            } else {
                p = -rect.top / maxScroll;
            }
            
            targetProgress = Math.max(0, Math.min(1, p));
            
            if (!tickingTunnel) {
                tickingTunnel = true;
                requestAnimationFrame(updateTunnel);
            }
        });
        
        // Initial set based on scroll position
        setTimeout(() => {
            const initRect = tunnelSection.getBoundingClientRect();
            if(initRect.top <= 0) {
               let p = -initRect.top / (initRect.height - window.innerHeight);
               targetProgress = Math.max(0, Math.min(1, p));
               currentProgress = targetProgress;
            }
            updateTunnel();
        }, 100);
    }
});
