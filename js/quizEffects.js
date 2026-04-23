window.quizEffects = {
    sounds: {},
    muted: false,

    preloadSounds(names) {
        names.forEach(name => {
            const audio = new Audio(`/sounds/${name}.mp3`);
            audio.volume = 0.8;
            audio.preload = 'auto';
            this.sounds[name] = audio;
        });
    },

    playSound(name, volume = 0.8) {
        if (this.muted) return;

        const sound = this.sounds[name];
        const audio = sound || new Audio(`/sounds/${name}.mp3`);
        audio.volume = volume;
        audio.currentTime = 0;

        audio.play().catch(err => {
            console.warn(`Audio play failed for "${name}":`, err);
        });

        if (!sound) this.sounds[name] = audio;
    },

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },

    showSplash(options = {}) {
        const {
            count = 10,
            colors = ['#ffd700', '#4caf50', '#2196f3', '#ff5722'],
            sound = 'correct',
            volume = 0.5,
            duration = 1200,
            containerSelector = '.quiz-container'
        } = options;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        this.playSound(sound, volume);

        for (let i = 0; i < count; i++) {
            const splash = document.createElement('div');
            splash.className = 'correct-splash';
            splash.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            const angle = (360 / count) * i + Math.random() * 20;
            const radius = 60 + Math.random() * 60;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            splash.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.5) rotate(${Math.random() * 360}deg)`;
            splash.style.opacity = "1";
            splash.style.position = "absolute";

            container.appendChild(splash);

            setTimeout(() => {
                splash.style.transition = "transform 0.9s ease, opacity 0.9s ease";
                splash.style.transform = `translate(calc(-50% + ${x * 1.8}px), calc(-50% + ${y * 1.8}px)) scale(1.3)`;
                splash.style.opacity = "0";
            }, 50);

            setTimeout(() => {
                splash.remove();
            }, duration);
        }

        if (window.confetti) {
            window.confetti({
                particleCount: 40,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    },

    showCompletion(options = {}) {
        const {
            sound = 'level-complete',
            volume = 0.8
        } = options;

        this.playSound(sound, volume);

        if (window.confetti) {
            window.confetti({
                particleCount: 120,
                spread: 120,
                origin: { y: 0.6 }
            });
        }

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
};