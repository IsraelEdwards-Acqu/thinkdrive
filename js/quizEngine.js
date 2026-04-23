/**
 * ThinkDrive — Enhanced Quiz Engine v2.0 (normalized)
 * Loads questions from /data/questions.json
 * Supports questions where the answer can be a string (option text) or an index.
 */
window.ThinkDriveQuiz = (function () {
    'use strict';

    let questions = [];
    let currentIndex = 0;
    let score = 0;
    let answers = [];
    let isLoaded = false;

    // Normalize a single question to a consistent shape:
    // { id, category, text, options[], answerIndex, correctText }
    function normalizeQuestion(q) {
        if (!q) return null;
        const opts = Array.isArray(q.options) ? q.options.slice() : [];
        const text = q.question ?? q.text ?? '';
        let answerIndex = -1;
        let correctText = null;

        // If JSON provides 'answer' as a number (index)
        if (typeof q.answer === 'number') {
            answerIndex = q.answer;
            correctText = opts[answerIndex];
        }
        // If 'answer' is a string, find the option index that matches
        else if (typeof q.answer === 'string') {
            // Prefer exact match (case-sensitive), fallback to case-insensitive
            answerIndex = opts.findIndex(o => o === q.answer);
            if (answerIndex === -1) {
                answerIndex = opts.findIndex(o => typeof o === 'string' && o.toLowerCase() === q.answer.toLowerCase());
            }
            correctText = opts[answerIndex] ?? q.answer;
        }

        // If no valid index found but options exist and answer isn't provided, attempt last-resort mapping
        if (answerIndex === -1 && opts.length > 0) {
            // leave as -1 (unknown); UI/consumer should handle
        }

        return {
            id: q.id ?? null,
            category: q.category ?? 'General',
            text: String(text),
            options: opts,
            answerIndex,
            correctText
        };
    }

    // Load questions from JSON and normalize them
    async function loadQuestions() {
        if (isLoaded && questions.length > 0) return questions;
        const candidates = ['/data/questions.json', 'data/questions.json'];
        for (const path of candidates) {
            try {
                const resp = await fetch(path);
                if (!resp.ok) throw new Error('Failed to load questions from ' + path + ' (status ' + resp.status + ')');
                const raw = await resp.json();
                questions = (Array.isArray(raw) ? raw : []).map(normalizeQuestion).filter(Boolean);
                isLoaded = true;
                return questions;
            } catch (e) {
                // If JSON parse error or fetch failed, continue to next candidate
                console.warn('ThinkDriveQuiz: load attempt failed for', path, e);
            }
        }

        // final fallback: set empty questions and return
        console.error('ThinkDriveQuiz: Could not load questions from any candidate path.');
        questions = [];
        return [];
    }

    // Get questions by category
    function getByCategory(category) {
        if (!category) return questions.slice();
        return questions.filter(q => String(q.category).toLowerCase() === String(category).toLowerCase());
    }

    // Get random subset
    function getRandomSet(count) {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // Start a new quiz session (returns the question set to use)
    function startSession(questionSet) {
        currentIndex = 0;
        score = 0;
        answers = [];
        return questionSet || getRandomSet(20);
    }

    // Check an answer and provide immediate feedback.
    // Accepts either selectedIndex (number) or selectedText (string).
    function checkAnswer(question, selected) {
        if (!question) return { isCorrect: false, correctAnswer: question?.correctText ?? null };

        let isCorrect = false;
        const q = question;

        // If selected is a number => compare index
        if (typeof selected === 'number') {
            if (typeof q.answerIndex === 'number' && q.answerIndex >= 0) {
                isCorrect = selected === q.answerIndex;
            } else {
                // If answerIndex unknown, compare option text
                const selText = q.options[selected];
                isCorrect = selText && selText === q.correctText;
            }
        }
        // If selected is string => compare normalized text
        else if (typeof selected === 'string') {
            const sel = selected.trim();
            if (q.correctText) {
                isCorrect = sel === q.correctText || sel.toLowerCase() === (q.correctText || '').toLowerCase();
            } else if (Array.isArray(q.options)) {
                isCorrect = q.options.some(o => o === sel || (typeof o === 'string' && o.toLowerCase() === sel.toLowerCase()));
            }
        }

        if (isCorrect) score++;

        answers.push({
            question: q.text,
            selected: selected,
            correct: q.correctText,
            isCorrect,
            category: q.category
        });

        // Track in BrillAI if available
        if (window.BrillAI && typeof window.BrillAI.trackQuiz === 'function') {
            try { window.BrillAI.trackQuiz(isCorrect ? 1 : 0, 1, q.category); } catch (e) { /* ignore */ }
        }

        return { isCorrect, correctAnswer: q.correctText };
    }

    // Generate visual scorecard data
    function generateScorecard(totalQuestions) {
        const total = totalQuestions || answers.length;
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;
        const passed = pct >= 70; // Ghana DVLA pass mark

        // Category breakdown
        const categories = {};
        answers.forEach(a => {
            if (!categories[a.category]) categories[a.category] = { correct: 0, total: 0 };
            categories[a.category].total++;
            if (a.isCorrect) categories[a.category].correct++;
        });

        return {
            score,
            total,
            percentage: pct,
            passed,
            grade: passed ? (pct >= 90 ? 'Excellent' : pct >= 80 ? 'Very Good' : 'Pass') : 'Needs Improvement',
            categories,
            answers,
            timestamp: new Date().toISOString()
        };
    }

    // Render scorecard HTML (keeps same markup you used)
    function renderScorecard(containerId) {
        const card = generateScorecard();
        const container = document.getElementById(containerId);
        if (!container) return;

        const catHTML = Object.entries(card.categories).map(([cat, stats]) => {
            const catPct = Math.round((stats.correct / stats.total) * 100);
            return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-weight:600;">${cat}</span>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div style="width:80px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
                            <div style="width:${catPct}%;height:100%;background:${catPct >= 70 ? '#22c55e' : '#ef4444'};border-radius:3px;"></div>
                        </div>
                        <span style="font-size:0.8rem;color:rgba(255,255,255,0.6);">${stats.correct}/${stats.total}</span>
                    </div>
                </div>
            `;
        }).join('');
        container.innerHTML = `
            <div class="td-scorecard td-animate-scale">
                <div class="td-score-circle">
                    <div class="td-score-number">${card.percentage}%</div>
                    <div class="td-score-total">${card.score}/${card.total}</div>
                </div>
                <div class="td-score-grade ${card.passed ? 'pass' : 'fail'}">
                    ${card.passed ? '<i class="fas fa-trophy"></i>' : '<i class="fas fa-redo"></i>'} ${card.grade}
                </div>
                <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;margin-bottom:1.5rem;">
                    ${card.passed ? "Congratulations! You're on track for the DVLA exam." : 'Keep practicing — review your weak areas below.'}
                </p>
                <div style="text-align:left;margin-top:1rem;">
                    <div style="font-weight:700;margin-bottom:0.5rem;color:rgba(255,255,255,0.8);font-size:0.9rem;">Category Breakdown</div>
                    ${catHTML}
                </div>
                <div style="margin-top:1.5rem;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
                    <button class="td-gold-btn" onclick="ThinkDriveQuiz.restart()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="td-navy-btn" onclick="ThinkDriveQuiz.shareScore()">
                        <i class="fas fa-share-alt"></i> Share Score
                    </button>
                </div>
            </div>
            `;
    }

    // Share score
    function shareScore() {
        const card = generateScorecard();
        const text = `I scored ${card.percentage}% (${card.score}/${card.total}) on ThinkDrive DVLA Quiz! ${card.passed ? '🎉' : '📚'} #ThinkDrive #DrivingTest #Ghana`;
        if (navigator.share) {
            navigator.share({ title: 'ThinkDrive Quiz Score', text }).catch(() => {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Score copied to clipboard!');
            }).catch(() => {});
        } else {
            alert(text);
        }
    }

    // Restart
    function restart() {
        currentIndex = 0;
        score = 0;
        answers = [];
        // Trigger page reload or re-render
        window.location.reload();
    }

    // Get all categories
    function getCategories() {
        return [...new Set(questions.map(q => q.category))];
    }

    // Initialize
    loadQuestions();

    return {
        loadQuestions,
        getByCategory,
        getRandomSet,
        getCategories,
        startSession,
        checkAnswer,
        generateScorecard,
        renderScorecard,
        shareScore,
        restart,
        get questions() { return questions; },
        get score() { return score; },
        get currentIndex() { return currentIndex; }
    };
})();
