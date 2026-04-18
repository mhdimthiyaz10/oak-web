document.addEventListener('DOMContentLoaded', () => {

    // ── Navbar ────────────────────────────────────────────────────
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
    }, { passive: true });

    // ── Text Reveal Effect ────────────────────────────────────────────────────
    const revealText = document.getElementById('reveal-text');
    const aboutContainer = document.querySelector('.about-us-container');

    if (revealText && aboutContainer) {
        const words = revealText.innerText.split(" ");
        revealText.innerHTML = "";
        
        const wordSpans = words.map(word => {
            const span = document.createElement("span");
            span.innerText = word + " ";
            span.style.transition = "opacity 0.1s ease";
            span.style.opacity = "0.2";
            revealText.appendChild(span);
            return span;
        });

        window.addEventListener('scroll', () => {
            const rect = aboutContainer.getBoundingClientRect();
            // Start when top of container hits top of viewport
            const scrollDistance = rect.height - window.innerHeight; 
            
            // Calculate progress (multiplied by 3.0 for a balanced, medium speed)
            let progress = (-rect.top / scrollDistance) * 3.0; 
            progress = Math.max(0, Math.min(1, progress));

            wordSpans.forEach((span, i) => {
                const start = i / wordSpans.length;
                const end = start + (1 / wordSpans.length);
                
                let opacity = 0.2;
                if (progress >= end) {
                    opacity = 1;
                } else if (progress > start) {
                    opacity = 0.2 + 0.8 * ((progress - start) / (end - start));
                }
                span.style.opacity = opacity;
            });
        }, { passive: true });
        
        // Initial trigger
        window.dispatchEvent(new Event('scroll'));
    }

});
