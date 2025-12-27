/**
 * 3D Animations for OathBreakers Game
 * Enhanced with Three.js-style 3D effects using CSS transforms
 */

document.addEventListener('alpine:init', () => {
    
    // Extend gameApp with 3D animation methods
    const originalGameApp = Alpine.data;
    
    Alpine.data('gameApp', () => ({
        // 3D Animation States
        d3: {
            rotation: { x: 0, y: 0, z: 0 },
            scale: 1,
            isHovering: false,
            cardTilt: { x: 0, y: 0 },
        },
        
        // Particle system for effects
        particles: [],
        particleId: 0,
        
        init() {
            // Initialize existing init
            this.originalInit();
            
            // Add 3D mouse tracking for cards
            this.setupCardTiltEffects();
            
            // Add scroll-based 3D parallax
            this.setupParallaxEffects();
            
            // Add entrance animations
            this.setupEntranceAnimations();
        },
        
        originalInit() {
            this.fetchProfile();
            
            this.$watch('currentTab', (value) => {
                if (value === 'market') this.fetchPacks();
                if (value === 'inventory') this.fetchMyCards();
                if (value === 'blackmarket') this.fetchMarketListings();
                if (value === 'leaderboard') this.fetchLeaderboard();
                if (value === 'profile') {
                    this.fetchAvatars();
                    this.settings.username = this.profile.username || '';
                    this.settings.avatar_id = this.profile.avatar_id ?? null;
                    this.settings.password = '';
                }
            });
            
            setInterval(() => {
                this.fetchProfile();
            }, 60000);
        },
        
        // ==================== 3D Card Tilt Effects ====================
        setupCardTiltEffects() {
            document.addEventListener('mousemove', (e) => {
                const cards = document.querySelectorAll('.card-tilt-3d');
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const deltaX = (e.clientX - centerX) / rect.width;
                    const deltaY = (e.clientY - centerY) / rect.height;
                    
                    const maxRotation = 15;
                    const rotateY = deltaX * maxRotation;
                    const rotateX = -deltaY * maxRotation;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                });
            });
            
            document.addEventListener('mouseleave', (e) => {
                const cards = document.querySelectorAll('.card-tilt-3d');
                cards.forEach(card => {
                    card.style.transform = '';
                });
            });
        },
        
        // ==================== Parallax Effects ====================
        setupParallaxEffects() {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.parallax-3d');
                parallaxElements.forEach(el => {
                    const speed = el.dataset.parallaxSpeed || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            });
        },
        
        // ==================== Entrance Animations ====================
        setupEntranceAnimations() {
            // Add stagger animation to cards when inventory loads
            this.$watch('myCards', (cards) => {
                if (cards && cards.length > 0) {
                    setTimeout(() => {
                        const cardElements = document.querySelectorAll('.inventory-card');
                        cardElements.forEach((el, index) => {
                            el.style.animationDelay = `${index * 0.05}s`;
                        });
                    }, 100);
                }
            });
            
            // Add stagger animation to market listings
            this.$watch('marketListings', (listings) => {
                if (listings && listings.length > 0) {
                    setTimeout(() => {
                        const listingElements = document.querySelectorAll('.market-card');
                        listingElements.forEach((el, index) => {
                            el.style.animationDelay = `${index * 0.05}s`;
                        });
                    }, 100);
                }
            });
        },
        
        // ==================== 3D Card Flip Animation ====================
        flipCard3D(cardId, duration = 600) {
            const card = document.getElementById(`card-${cardId}`);
            if (!card) return;
            
            card.style.transition = `transform ${duration}ms ease-out`;
            card.style.transform = 'rotateY(180deg)';
            
            return new Promise(resolve => {
                setTimeout(() => {
                    card.style.transform = 'rotateY(0deg)';
                    setTimeout(resolve, duration);
                }, duration * 2);
            });
        },
        
        // ==================== 3D Spin Animation ====================
        spinElement3D(elementId, duration = 1000) {
            const el = document.getElementById(elementId);
            if (!el) return;
            
            el.classList.add('animate-spin-3d');
            
            setTimeout(() => {
                el.classList.remove('animate-spin-3d');
            }, duration);
        },
        
        // ==================== Particle Effects ====================
        createParticles(x, y, color = '#a855f7', count = 10) {
            for (let i = 0; i < count; i++) {
                const particleId = `particle-${Date.now()}-${i}`;
                const angle = (Math.PI * 2 * i) / count;
                const velocity = 50 + Math.random() * 100;
                const size = 4 + Math.random() * 8;
                
                this.particles.push({
                    id: particleId,
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    size: size,
                    color: color,
                    life: 1,
                    decay: 0.02 + Math.random() * 0.02
                });
            }
        },
        
        updateParticles() {
            this.particles = this.particles.filter(p => {
                p.x += p.vx * 0.1;
                p.y += p.vy * 0.1;
                p.vy += 2; // gravity
                p.life -= p.decay;
                return p.life > 0;
            });
        },
        
        // ==================== 3D Hover Effect for Cards ====================
        getCardHoverClass(rarity) {
            const rarityClasses = {
                'COMMON': 'hover:border-gray-400 hover:shadow-[0_0_20px_rgba(156,163,175,0.4)]',
                'RARE': 'hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]',
                'EPIC': 'hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]',
                'LEGENDARY': 'hover:border-yellow-400 hover:shadow-[0_0_35px_rgba(234,179,8,0.7)]'
            };
            return rarityClasses[rarity] || rarityClasses['COMMON'];
        },
        
        // ==================== 3D Button Press Effect ====================
        createButtonRipple(event, button) {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: 100px;
                height: 100px;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple-effect 0.6s ease-out;
            `;
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        },
        
        // ==================== Success Animation ====================
        showSuccessAnimation(message = 'موفق!') {
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div class="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div class="bg-green-500 text-white px-8 py-4 rounded-2xl text-xl font-bold animate-bounce-3d shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                        ✅ ${message}
                    </div>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transition = 'opacity 0.5s';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }, 1500);
        },
        
        // ==================== 3D Tab Transition ====================
        transitionToTab(tabName) {
            const currentTabEl = document.querySelector('[x-show="currentTab === \\'currentTab\\'"]');
            if (currentTabEl) {
                currentTabEl.classList.add('tab-exit-3d');
            }
            
            this.currentTab = tabName;
            
            setTimeout(() => {
                const newTabEl = document.querySelector(`[x-show="currentTab === '${tabName}'"]`);
                if (newTabEl) {
                    newTabEl.classList.add('tab-enter-3d');
                    setTimeout(() => {
                        newTabEl.classList.remove('tab-enter-3d');
                    }, 300);
                }
            }, 150);
        },
        
        // ==================== Mining Claim Animation ====================
        async animateMiningClaim() {
            const btn = event.target.closest('button');
            if (!btn) return;
            
            // Create coin burst effect
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const coin = document.createElement('div');
                coin.innerHTML = '🪙';
                coin.style.cssText = `
                    position: fixed;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    font-size: 24px;
                    z-index: 1000;
                    pointer-events: none;
                    animation: coin-fly-${i} 1s ease-out forwards;
                `;
                
                const angleDeg = (angle * 180) / Math.PI;
                const distance = 100 + Math.random() * 50;
                
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes coin-fly-${i} {
                        0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
                        100% { transform: translate(
                            ${Math.cos(angle) * distance}px,
                            ${Math.sin(angle) * distance - 50}px
                        ) rotate(${angleDeg}deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                document.body.appendChild(coin);
                
                setTimeout(() => {
                    coin.remove();
                    style.remove();
                }, 1000);
            }
        },
        
        // ==================== Card Equip Animation ====================
        animateEquipCard(slotNumber) {
            const slot = document.getElementById(`slot-${slotNumber}`);
            if (slot) {
                slot.classList.add('slot-equip-animation');
                setTimeout(() => {
                    slot.classList.remove('slot-equip-animation');
                }, 600);
            }
        },
        
        // ==================== 3D Modal Animation ====================
        openModal3D(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('modal-open-3d');
            }
        },
        
        closeModal3D(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('modal-close-3d');
                setTimeout(() => {
                    modal.classList.remove('modal-close-3d');
                }, 300);
            }
        },
        
        // ==================== Glowing Effect for Rare Cards ====================
        startGlowEffect() {
            setInterval(() => {
                const glowCards = document.querySelectorAll('.glow-pulse');
                glowCards.forEach(card => {
                    card.classList.toggle('glow-pulse-active');
                });
            }, 2000);
        },
        
        // ==================== XP Bar Animation ====================
        animateXPBar(newXP, maxXP) {
            const xpBar = document.querySelector('.xp-bar-fill');
            if (xpBar) {
                const percentage = (newXP / maxXP) * 100;
                xpBar.style.width = `${percentage}%`;
            }
        },
        
        // ==================== Rarity Rainbow Effect ====================
        getRarityAnimation(rarity) {
            if (rarity === 'LEGENDARY') {
                return 'animate-legendary-shine';
            }
            if (rarity === 'EPIC') {
                return 'animate-epic-pulse';
            }
            return '';
        }
    }));
    
    // Add CSS for 3D animations to document
    add3DAnimationStyles();
});

/**
 * Add 3D Animation CSS Styles to Document
 */
function add3DAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* ==================== 3D Core Transforms ==================== */
        .perspective-1500 {
            perspective: 1500px;
        }
        
        .perspective-2000 {
            perspective: 2000px;
        }
        
        .transform-3d {
            transform-style: preserve-3d;
        }
        
        .backface-visible {
            backface-visibility: visible;
        }
        
        /* ==================== 3D Rotation Classes ==================== */
        .rotate-x-90 {
            transform: rotateX(90deg);
        }
        
        .rotate-y-90 {
            transform: rotateY(90deg);
        }
        
        .rotate-y-180 {
            transform: rotateY(180deg);
        }
        
        .rotate-3d {
            transform-style: preserve-3d;
            animation: rotate3d 10s linear infinite;
        }
        
        @keyframes rotate3d {
            from { transform: rotateY(360deg); }
            to { transform: rotateY(0deg); }
        }
        
        /* ==================== 3D Spin Animation ==================== */
        .animate-spin-3d {
            animation: spin3d 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes spin3d {
            from { transform: rotateY(0deg) rotateX(0deg); }
            to { transform: rotateY(360deg) rotateX(360deg); }
        }
        
        /* ==================== Card Flip Animation ==================== */
        .card-flip-3d {
            transform-style: preserve-3d;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-flip-3d.flipped {
            transform: rotateY(180deg);
        }
        
        .card-front-3d, .card-back-3d {
            backface-visibility: hidden;
            transform-style: preserve-3d;
        }
        
        .card-back-3d {
            transform: rotateY(180deg);
        }
        
        /* ==================== Hover 3D Lift Effect ==================== */
        .hover-lift-3d {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        
        .hover-lift-3d:hover {
            transform: translateY(-8px) perspective(1000px) rotateX(5deg);
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 30px rgba(168, 85, 247, 0.2);
        }
        
        /* ==================== Scale 3D Effect ==================== */
        .scale-3d {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .scale-3d:hover {
            transform: scale3d(1.05, 1.05, 1.05);
        }
        
        /* ==================== Tab Transitions ==================== */
        .tab-exit-3d {
            animation: tabExit3d 0.2s ease-in forwards;
        }
        
        @keyframes tabExit3d {
            from { 
                opacity: 1;
                transform: perspective(1000px) rotateX(0deg) translateZ(0);
            }
            to { 
                opacity: 0;
                transform: perspective(1000px) rotateX(-10deg) translateZ(-50px);
            }
        }
        
        .tab-enter-3d {
            animation: tabEnter3d 0.3s ease-out forwards;
        }
        
        @keyframes tabEnter3d {
            from { 
                opacity: 0;
                transform: perspective(1000px) rotateX(10deg) translateZ(-50px);
            }
            to { 
                opacity: 1;
                transform: perspective(1000px) rotateX(0deg) translateZ(0);
            }
        }
        
        /* ==================== Modal 3D Animation ==================== */
        .modal-open-3d {
            animation: modalOpen3d 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes modalOpen3d {
            from {
                opacity: 0;
                transform: perspective(1000px) scale(0.8) translateZ(-100px);
            }
            to {
                opacity: 1;
                transform: perspective(1000px) scale(1) translateZ(0);
            }
        }
        
        .modal-close-3d {
            animation: modalClose3d 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes modalClose3d {
            from {
                opacity: 1;
                transform: perspective(1000px) scale(1) translateZ(0);
            }
            to {
                opacity: 0;
                transform: perspective(1000px) scale(0.8) translateZ(-100px);
            }
        }
        
        /* ==================== Slot Equip Animation ==================== */
        .slot-equip-animation {
            animation: slotEquip3d 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slotEquip3d {
            0% { transform: scale(1); }
            25% { transform: scale(1.1) rotateY(180deg); }
            50% { transform: scale(1.2); }
            75% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* ==================== Legendary Card Shine Effect ==================== */
        .animate-legendary-shine {
            position: relative;
            overflow: hidden;
        }
        
        .animate-legendary-shine::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                45deg,
                transparent 30%,
                rgba(255, 215, 0, 0.3) 50%,
                transparent 70%
            );
            animation: legendaryShine 3s linear infinite;
            transform: rotate(45deg);
        }
        
        @keyframes legendaryShine {
            from { transform: translateX(-100%) rotate(45deg); }
            to { transform: translateX(100%) rotate(45deg); }
        }
        
        /* ==================== Epic Card Pulse ==================== */
        .animate-epic-pulse {
            animation: epicPulse 2s ease-in-out infinite;
        }
        
        @keyframes epicPulse {
            0%, 100% { 
                box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
            }
            50% { 
                box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.4);
            }
        }
        
        /* ==================== Glow Pulse ==================== */
        .glow-pulse {
            transition: all 0.3s ease;
        }
        
        .glow-pulse-active {
            filter: brightness(1.2);
            transform: scale(1.02);
        }
        
        /* ==================== Bounce 3D ==================== */
        .animate-bounce-3d {
            animation: bounce3d 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes bounce3d {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* ==================== Flip In Animation ==================== */
        @keyframes flipIn {
            from {
                transform: perspective(1000px) rotateY(-90deg);
                opacity: 0;
            }
            to {
                transform: perspective(1000px) rotateY(0deg);
                opacity: 1;
            }
        }
        
        .animate-flip-in {
            animation: flipIn 0.6s ease-out;
        }
        
        /* ==================== Card Entrance Animation ==================== */
        .inventory-card {
            opacity: 0;
            transform: translateY(30px) perspective(500px) rotateX(10deg);
            animation: cardEntrance 0.5s ease-out forwards;
        }
        
        @keyframes cardEntrance {
            to {
                opacity: 1;
                transform: translateY(0) rotateX(0);
            }
        }
        
        /* ==================== Market Card Entrance ==================== */
        .market-card {
            opacity: 0;
            transform: translateX(30px) perspective(500px) rotateY(10deg);
            animation: marketEntrance 0.5s ease-out forwards;
        }
        
        @keyframes marketEntrance {
            to {
                opacity: 1;
                transform: translateX(0) rotateY(0);
            }
        }
        
        /* ==================== Pack Opening Burst ==================== */
        @keyframes packBurst {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.2) rotate(-5deg); }
            50% { transform: scale(0.9) rotate(5deg); }
            75% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        
        .animate-pack-burst {
            animation: packBurst 0.6s ease-out;
        }
        
        /* ==================== Rarity Glow Border ==================== */
        .rarity-glow-COMMON {
            border-color: #9ca3af;
            box-shadow: 0 0 10px rgba(156, 163, 175, 0.3);
        }
        
        .rarity-glow-RARE {
            border-color: #3b82f6;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }
        
        .rarity-glow-EPIC {
            border-color: #a855f7;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }
        
        .rarity-glow-LEGENDARY {
            border-color: #eab308;
            box-shadow: 0 0 25px rgba(234, 179, 8, 0.7), 0 0 50px rgba(234, 179, 8, 0.3);
        }
        
        /* ==================== Avatar 3D Frame ==================== */
        .avatar-3d {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .avatar-3d:hover {
            transform: perspective(500px) rotateY(15deg) scale(1.05);
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
        }
        
        /* ==================== Navigation Active State ==================== */
        .nav-item-3d {
            transition: transform 0.2s ease;
        }
        
        .nav-item-3d:hover {
            transform: translateY(-3px);
        }
        
        .nav-item-3d.active {
            transform: translateY(-5px) scale(1.1);
        }
        
        /* ==================== Progress Bar 3D ==================== */
        .xp-bar-fill {
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
        }
        
        /* ==================== Button 3D Press ==================== */
        .btn-3d {
            transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        
        .btn-3d:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
        }
        
        /* ==================== Floating Animation ==================== */
        .float-3d {
            animation: float3d 3s ease-in-out infinite;
        }
        
        @keyframes float3d {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        /* ==================== Ripple Effect ==================== */
        @keyframes ripple-effect {
            to {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
            }
        }
        
        /* ==================== Particle Container ==================== */
        .particle-container {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
        }
        
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
        }
        
        /* ==================== Coin/Diamond Floating ==================== */
        .float-coin {
            animation: floatCoin 2s ease-in-out infinite;
        }
        
        @keyframes floatCoin {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(5deg); }
        }
        
        /* ==================== Card Stack Effect ==================== */
        .card-stack-3d {
            transform-style: preserve-3d;
        }
        
        .card-stack-3d:nth-child(1) { transform: translateZ(0); }
        .card-stack-3d:nth-child(2) { transform: translateZ(-10px); }
        .card-stack-3d:nth-child(3) { transform: translateZ(-20px); }
        
        /* ==================== Loading Spinner 3D ==================== */
        .spinner-3d {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(168, 85, 247, 0.2);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: spinner3d 0.8s linear infinite;
        }
        
        @keyframes spinner3d {
            to { transform: rotate(360deg); }
        }
        
        /* ==================== Skull 3D Animation (Black Market) ==================== */
        .skull-bounce {
            animation: skullBounce 1s ease-in-out infinite;
        }
        
        @keyframes skullBounce {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        /* ==================== Slot Hover 3D ==================== */
        .slot-3d {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .slot-3d:hover:not(.filled) {
            transform: perspective(500px) rotateX(10deg) scale(1.02);
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
        }
        
        .slot-3d.filled:hover {
            transform: perspective(500px) rotateX(5deg) scale(1.02);
        }
        
        /* ==================== Glitch Effect (Rare) ==================== */
        .glitch-effect {
            animation: glitch 0.5s ease-in-out;
        }
        
        @keyframes glitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
        }
    `;
    document.head.appendChild(style);
}
