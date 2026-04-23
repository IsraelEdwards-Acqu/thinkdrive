// ✅ Enhanced Quiz Audio Controller with better error handling

window.quizAudio = {
    thinkingAudio: null,
    correctAudio: null,
    wrongAudio: null,
    clickAudio: null,
    completeAudio: null,
    initialized: false,

    init: function() {
        try {
            this.thinkingAudio = document.getElementById('quiz-thinking-audio');
            this.correctAudio = document.getElementById('quiz-correct-audio');
            this.wrongAudio = document.getElementById('quiz-wrong-audio');
            this.clickAudio = document.getElementById('quiz-click-audio');
            this.completeAudio = document.getElementById('quiz-complete-audio');

            // Preload all audio
            if (this.thinkingAudio) {
                this.thinkingAudio.volume = 0.3;
                this.thinkingAudio.loop = true;
                this.thinkingAudio.load();
            }
            if (this.correctAudio) {
                this.correctAudio.volume = 0.5;
                this.correctAudio.load();
            }
            if (this.wrongAudio) {
                this.wrongAudio.volume = 0.5;
                this.wrongAudio.load();
            }
            if (this.clickAudio) {
                this.clickAudio.volume = 0.3;
                this.clickAudio.load();
            }
            if (this.completeAudio) {
                this.completeAudio.volume = 0.4;
                this.completeAudio.load();
            }

            this.initialized = true;
            console.log('[QuizAudio] Initialized successfully');
        } catch (error) {
            console.error('[QuizAudio] Initialization error:', error);
        }
    },

    playThinking: async function() {
        if (this.thinkingAudio && this.initialized) {
            try {
                this.thinkingAudio.currentTime = 0;
                await this.thinkingAudio.play();
                console.log('[QuizAudio] Playing thinking music');
            } catch (error) {
                console.warn('[QuizAudio] Thinking play error:', error);
            }
        }
    },

    playCorrect: async function() {
        if (this.correctAudio && this.initialized) {
            try {
                this.correctAudio.currentTime = 0;
                await this.correctAudio.play();
            } catch (error) {
                console.warn('[QuizAudio] Correct play error:', error);
            }
        }
    },

    playWrong: async function() {
        if (this.wrongAudio && this.initialized) {
            try {
                this.wrongAudio.currentTime = 0;
                await this.wrongAudio.play();
            } catch (error) {
                console.warn('[QuizAudio] Wrong play error:', error);
            }
        }
    },

    playClick: async function() {
        if (this.clickAudio && this.initialized) {
            try {
                this.clickAudio.currentTime = 0;
                await this.clickAudio.play();
            } catch (error) {
                console.warn('[QuizAudio] Click play error:', error);
            }
        }
    },

    playComplete: async function() {
        if (this.completeAudio && this.initialized) {
            try {
                this.stopAll(); // Stop other sounds first
                this.completeAudio.currentTime = 0;
                await this.completeAudio.play();
            } catch (error) {
                console.warn('[QuizAudio] Complete play error:', error);
            }
        }
    },

    stopAll: function() {
        try {
            if (this.thinkingAudio) this.thinkingAudio.pause();
            if (this.correctAudio) this.correctAudio.pause();
            if (this.wrongAudio) this.wrongAudio.pause();
            if (this.clickAudio) this.clickAudio.pause();
            if (this.completeAudio) this.completeAudio.pause();
        } catch (error) {
            console.warn('[QuizAudio] Stop error:', error);
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.quizAudio.init(), 1000);
    });
} else {
    setTimeout(() => window.quizAudio.init(), 1000);
}