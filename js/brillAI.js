/**
 * ThinkDrive — BrillAI Module v5.0 - Advanced Intelligent AI Assistant
 * Created by ThinkDrive Team
 * Features:
 * - Voice command activation ("Hey Brill") - Manual activation only
 * - Left sidebar chat interface with smooth animations
 * - Self-learning and optimization
 * - Device permissions (contacts, location, camera)
 * - Natural language understanding
 * - Context awareness
 * - Personalized recommendations
 */

window.BrillAI = (function () {
    'use strict';

    // ===================================
    // CONFIGURATION
    // ===================================
    const CONFIG = {
        STORAGE_KEY: 'thinkdrive_brill_data',
        LEARNING_KEY: 'thinkdrive_brill_learning',
        PERMISSIONS_KEY: 'thinkdrive_brill_permissions',
        VOICE_ACTIVE_KEY: 'thinkdrive_brill_voice_active',
        VOICE_WAKE_WORDS: ['hey brill', 'ok brill', 'brill', 'hey brilliant'],
        AI_IDENTITY: {
            name: 'Brill',
            fullName: 'BrillAI',
            creator: 'ThinkDrive',
            purpose: 'Intelligent driving education assistant',
            version: '5.0'
        },
        LEARNING_RATE: 0.1,
        OPTIMIZATION_THRESHOLD: 0.8
    };

    // ===================================
    // STATE MANAGEMENT
    // ===================================
    let state = {
        isListening: false,
        isProcessing: false,
        voiceEnabled: false,
        sidebarOpen: false,
        permissions: {
            contacts: false,
            location: false,
            camera: false,
            microphone: false,
            notifications: false
        },
        recognition: null,
        synthesis: null,
        currentContext: null,
        userProfile: null
    };

    // ===================================
    // DATA STRUCTURE
    // ===================================
    function getDefaultData() {
        return {
            quizScores: [],
            quizCategories: {},
            shortsWatched: [],
            pagesVisited: {},
            userInteractions: [],
            lastActive: null,
            totalSessions: 0,
            knowledgeBase: {
                roadSigns: {},
                drivingRules: {},
                safetyTips: {},
                vehicleMaintenance: {},
                userPreferences: {}
            },
            learningPatterns: {
                bestStudyTime: null,
                averageSessionDuration: 0,
                preferredContent: [],
                improvementRate: 0,
                weakTopics: [],
                strongTopics: [],
                learningStyle: 'visual'
            },
            optimizationMetrics: {
                accuracyRate: 0,
                responseSpeed: 0,
                userSatisfaction: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                conversationQuality: 0
            },
            commandHistory: [],
            conversationHistory: [],
            deviceData: {
                contacts: [],
                location: null,
                studyReminders: []
            },
            recommendations: []
        };
    }

    function loadData() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
            return raw ? { ...getDefaultData(), ...JSON.parse(raw) } : getDefaultData();
        } catch {
            return getDefaultData();
        }
    }

    function saveData(data) {
        try {
            data.lastActive = new Date().toISOString();
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
            optimizeSelf(data);
        } catch (e) {
            console.warn('[BrillAI] Could not save data', e);
        }
    }

    // ===================================
    // VOICE RECOGNITION & SYNTHESIS
    // ===================================
    function initializeVoice() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            state.recognition = new SpeechRecognition();
            state.recognition.continuous = true;
            state.recognition.interimResults = true;
            state.recognition.lang = 'en-US';

            state.recognition.onstart = () => {
                console.log('[BrillAI] Voice recognition started');
                state.isListening = true;
                showVoiceIndicator(true);
                updateVoiceButton(true);
            };

            state.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                handleVoiceInput(transcript);
            };

            state.recognition.onerror = (event) => {
                console.error('[BrillAI] Voice recognition error:', event.error);
                if (event.error === 'no-speech') {
                    setTimeout(() => {
                        if (state.voiceEnabled) startVoiceListening();
                    }, 1000);
                }
            };

            state.recognition.onend = () => {
                state.isListening = false;
                if (state.voiceEnabled) {
                    setTimeout(() => startVoiceListening(), 500);
                } else {
                    showVoiceIndicator(false);
                    updateVoiceButton(false);
                }
            };
        }

        state.synthesis = window.speechSynthesis;
        console.log('[BrillAI] Voice systems initialized');
    }

    function startVoiceListening() {
        if (state.recognition && !state.isListening) {
            try {
                state.recognition.start();
                state.voiceEnabled = true;
                localStorage.setItem(CONFIG.VOICE_ACTIVE_KEY, 'true');
                console.log('[BrillAI] Voice listening activated');
            } catch (e) {
                console.warn('[BrillAI] Voice start error:', e);
            }
        }
    }

    function stopVoiceListening() {
        if (state.recognition) {
            state.recognition.stop();
            state.voiceEnabled = false;
            state.isListening = false;
            localStorage.removeItem(CONFIG.VOICE_ACTIVE_KEY);
            showVoiceIndicator(false);
            updateVoiceButton(false);
            console.log('[BrillAI] Voice listening deactivated');
        }
    }

    function toggleVoiceListening() {
        if (state.voiceEnabled) {
            stopVoiceListening();
            addChatMessage('Voice commands deactivated. Click the button to reactivate.', 'brill');
        } else {
            startVoiceListening();
            addChatMessage('Voice commands activated! Say "Hey Brill" followed by your command.', 'brill');
        }
    }

    function handleVoiceInput(transcript) {
        const lower = transcript.toLowerCase();
        const wakeWordDetected = CONFIG.VOICE_WAKE_WORDS.some(word => lower.includes(word));
        
        if (wakeWordDetected) {
            let command = transcript;
            CONFIG.VOICE_WAKE_WORDS.forEach(word => {
                command = command.replace(new RegExp(word, 'gi'), '').trim();
            });
            
            if (command.length > 0) {
                console.log('[BrillAI] Voice command detected:', command);
                playSound('activation');
                processCommand(command, 'voice');
            }
        }
    }

    function speak(text) {
        if (state.synthesis) {
            state.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            const voices = state.synthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;
            
            state.synthesis.speak(utterance);
        }
    }

    // ===================================
    // SIDEBAR UI MANAGEMENT
    // ===================================
    function toggleSidebar() {
        state.sidebarOpen = !state.sidebarOpen;
        const sidebar = document.getElementById('brill-sidebar');
        const overlay = document.getElementById('brill-overlay');
        const fab = document.getElementById('brill-fab');
        
        if (sidebar && overlay && fab) {
            if (state.sidebarOpen) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                fab.classList.add('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                fab.classList.remove('hidden');
                document.body.style.overflow = '';
            }
        }
    }

    function closeSidebar() {
        if (state.sidebarOpen) {
            toggleSidebar();
        }
    }

    function addChatMessage(text, sender = 'brill') {
        const chatMessages = document.getElementById('brill-chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `brill-message brill-message-${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'brill-message-bubble';
        bubble.textContent = text;
        
        const time = document.createElement('div');
        time.className = 'brill-message-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function displayResponse(text) {
        addChatMessage(text, 'brill');
    }

    function showVoiceIndicator(active) {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.style.display = active ? 'flex' : 'none';
        }
    }

    function updateVoiceButton(active) {
        const button = document.getElementById('brill-voice-toggle');
        if (button) {
            if (active) {
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                button.title = 'Deactivate Voice Commands';
            } else {
                button.classList.remove('active');
                button.innerHTML = '<i class="fas fa-microphone"></i>';
                button.title = 'Activate Voice Commands';
            }
        }
    }

    function playSound(type) {
        const sounds = {
            activation: '/sounds/brill-activate.mp3',
            success: '/sounds/brill-success.mp3',
            error: '/sounds/brill-error.mp3'
        };
        
        if (sounds[type]) {
            const audio = new Audio(sounds[type]);
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }

    // ===================================
    // DEVICE PERMISSIONS
    // ===================================
    async function requestPermissions(permissionType) {
        try {
            switch (permissionType) {
                case 'microphone':
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    state.permissions.microphone = true;
                    speak("Microphone access granted. You can now use voice commands.");
                    return true;

                case 'camera':
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoStream.getTracks().forEach(track => track.stop());
                    state.permissions.camera = true;
                    speak("Camera access granted.");
                    return true;

                case 'location':
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    state.permissions.location = true;
                    
                    const data = loadData();
                    data.deviceData.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };
                    saveData(data);
                    
                    speak("Location access granted. I can now find nearby driving schools for you.");
                    return true;

                case 'notifications':
                    const permission = await Notification.requestPermission();
                    state.permissions.notifications = permission === 'granted';
                    if (state.permissions.notifications) {
                        speak("Notifications enabled. I'll remind you of study sessions.");
                    }
                    return state.permissions.notifications;

                default:
                    return false;
            }
        } catch (error) {
            console.error('[BrillAI] Permission error:', error);
            speak(`Permission denied for ${permissionType}. You can enable it later in settings.`);
            return false;
        }
    }

    async function requestAllPermissions() {
        speak("I'd like to request some permissions to serve you better. Starting with microphone for voice commands.");
        
        await requestPermissions('microphone');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await requestPermissions('location');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await requestPermissions('notifications');
        
        savePermissions();
    }

    function savePermissions() {
        localStorage.setItem(CONFIG.PERMISSIONS_KEY, JSON.stringify(state.permissions));
    }

    function loadPermissions() {
        try {
            const saved = localStorage.getItem(CONFIG.PERMISSIONS_KEY);
            if (saved) {
                state.permissions = { ...state.permissions, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('[BrillAI] Could not load permissions');
        }
    }

    // ===================================
    // SELF-LEARNING & OPTIMIZATION
    // ===================================
    function learnFromInteraction(interaction) {
        const data = loadData();
        
        data.userInteractions.push({
            type: interaction.type,
            content: interaction.content,
            timestamp: new Date().toISOString(),
            context: state.currentContext,
            success: interaction.success || true
        });

        if (interaction.type === 'quiz_answer') {
            const category = interaction.category || 'general';
            if (!data.knowledgeBase.drivingRules[category]) {
                data.knowledgeBase.drivingRules[category] = [];
            }
            data.knowledgeBase.drivingRules[category].push({
                question: interaction.question,
                answer: interaction.answer,
                correct: interaction.correct,
                timestamp: new Date().toISOString()
            });
        }

        if (interaction.feedback) {
            data.optimizationMetrics.userSatisfaction = 
                (data.optimizationMetrics.userSatisfaction * 0.9) + (interaction.feedback * 0.1);
        }

        saveData(data);
        console.log('[BrillAI] Learned from interaction:', interaction.type);
    }

    function optimizeSelf(data) {
        try {
            if (data.optimizationMetrics.totalQuestions > 0) {
                data.optimizationMetrics.accuracyRate = 
                    data.optimizationMetrics.correctAnswers / data.optimizationMetrics.totalQuestions;
            }

            analyzeLearningPatterns(data);
            identifyWeakTopics(data);
            generateRecommendations(data);

            if (data.optimizationMetrics.accuracyRate < CONFIG.OPTIMIZATION_THRESHOLD) {
                console.log('[BrillAI] Self-optimization triggered. Current accuracy:', 
                    data.optimizationMetrics.accuracyRate);
                improveResponseQuality(data);
            }
        } catch (error) {
            console.warn('[BrillAI] Optimization error:', error);
        }
    }

    function analyzeLearningPatterns(data) {
        try {
            if (!data.userInteractions || data.userInteractions.length < 10) return;

            const hourCounts = {};
            data.userInteractions.forEach(interaction => {
                const hour = new Date(interaction.timestamp).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
            
            const bestHour = Object.keys(hourCounts).reduce((a, b) => 
                hourCounts[a] > hourCounts[b] ? a : b
            );
            data.learningPatterns.bestStudyTime = `${bestHour}:00`;
        } catch (error) {
            console.warn('[BrillAI] Pattern analysis error:', error);
        }
    }

    function identifyWeakTopics(data) {
        try {
            if (!data.learningPatterns.weakTopics) {
                data.learningPatterns.weakTopics = [];
            }
            if (!data.learningPatterns.strongTopics) {
                data.learningPatterns.strongTopics = [];
            }

            Object.keys(data.quizCategories || {}).forEach(category => {
                const scores = data.quizCategories[category] || [];
                if (scores.length > 0) {
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    if (avg < 70 && !data.learningPatterns.weakTopics.includes(category)) {
                        data.learningPatterns.weakTopics.push(category);
                    } else if (avg > 85 && !data.learningPatterns.strongTopics.includes(category)) {
                        data.learningPatterns.strongTopics.push(category);
                    }
                }
            });
        } catch (error) {
            console.warn('[BrillAI] Weak topics identification error:', error);
        }
    }

    function generateRecommendations(data) {
        try {
            if (!data.recommendations) {
                data.recommendations = [];
            }

            data.recommendations = [];

            if (!data.learningPatterns) {
                data.learningPatterns = {
                    bestStudyTime: null,
                    averageSessionDuration: 0,
                    preferredContent: [],
                    improvementRate: 0,
                    weakTopics: [],
                    strongTopics: [],
                    learningStyle: 'visual'
                };
            }

            if (data.learningPatterns.weakTopics && data.learningPatterns.weakTopics.length > 0) {
                data.recommendations.push({
                    type: 'practice',
                    topic: data.learningPatterns.weakTopics[0],
                    message: `Practice more on ${data.learningPatterns.weakTopics[0]} to improve your score.`
                });
            }

            if (data.learningPatterns.bestStudyTime) {
                data.recommendations.push({
                    type: 'timing',
                    message: `You learn best around ${data.learningPatterns.bestStudyTime}. Schedule your study sessions then.`
                });
            }

            if (data.recommendations.length === 0) {
                data.recommendations.push({
                    type: 'general',
                    message: 'Keep practicing to improve your driving knowledge!'
                });
            }
        } catch (error) {
            console.warn('[BrillAI] Recommendation generation error:', error);
            data.recommendations = [];
        }
    }

    function improveResponseQuality(data) {
        try {
            console.log('[BrillAI] Improving response quality...');
            const adjustedRate = CONFIG.LEARNING_RATE * 1.2;
            data.optimizationMetrics.conversationQuality += adjustedRate;
        } catch (error) {
            console.warn('[BrillAI] Quality improvement error:', error);
        }
    }

    // ===================================
    // NATURAL LANGUAGE PROCESSING
    // ===================================
    function parseCommand(input) {
        const lower = input.toLowerCase().trim();

        if (lower.includes('who made you') || lower.includes('who created you') || 
            lower.includes('who built you') || lower.includes('your creator')) {
            return {
                type: 'identity',
                response: `I am ${CONFIG.AI_IDENTITY.fullName}, an intelligent AI assistant created by ${CONFIG.AI_IDENTITY.creator}. I was designed by the ThinkDrive team to help you learn driving skills faster and smarter. My purpose is to be your personal driving education companion!`
            };
        }

        if (lower.includes('what are you') || lower.includes('who are you')) {
            return {
                type: 'identity',
                response: `I'm ${CONFIG.AI_IDENTITY.name}, your intelligent driving assistant created by ${CONFIG.AI_IDENTITY.creator}. I can help you with quizzes, finding driving schools, tracking your progress, and much more. I learn from our interactions to serve you better!`
            };
        }

        if (lower.includes('what can you do') || lower.includes('help me') || lower.includes('your features')) {
            return {
                type: 'capabilities',
                response: `As ${CONFIG.AI_IDENTITY.name} by ${CONFIG.AI_IDENTITY.creator}, I can:
                    • Answer driving quiz questions
                    • Navigate the app with voice commands
                    • Track your learning progress
                    • Find nearby driving schools
                    • Provide personalized study recommendations
                    • Learn from your patterns to optimize your experience
                    • Set study reminders
                    Just say "Hey Brill" and tell me what you need!`
            };
        }

        if (lower.includes('open') || lower.includes('go to') || lower.includes('navigate') || lower.includes('show')) {
            if (lower.includes('home')) return { type: 'navigate', target: '/home', page: 'Home' };
            if (lower.includes('quiz')) return { type: 'navigate', target: '/quiz', page: 'Quiz' };
            if (lower.includes('short')) return { type: 'navigate', target: '/short', page: 'Shorts' };
            if (lower.includes('school')) return { type: 'navigate', target: '/schools', page: 'Schools' };
            if (lower.includes('library') || lower.includes('book')) return { type: 'navigate', target: '/library', page: 'Library' };
            if (lower.includes('profile')) return { type: 'navigate', target: '/profile', page: 'Profile' };
        }

        if (lower.includes('my score') || lower.includes('my progress') || lower.includes('how am i doing')) {
            return { type: 'stats' };
        }

        if (lower.includes('find school') || lower.includes('nearby school') || lower.includes('driving school')) {
            return { type: 'find_schools' };
        }

        if (lower.includes('quiz') && (lower.includes('help') || lower.includes('answer'))) {
            return { type: 'quiz_help' };
        }

        if (lower.includes('recommend') || lower.includes('what should i') || lower.includes('suggest')) {
            return { type: 'recommend' };
        }

        if (lower.includes('permission') || lower.includes('access')) {
            return { type: 'permissions' };
        }

        return { type: 'chat', message: input };
    }

    async function processCommand(input, source = 'text') {
        state.isProcessing = true;
        const command = parseCommand(input);
        const data = loadData();

        data.commandHistory.push({
            input,
            command: command.type,
            timestamp: new Date().toISOString(),
            source
        });

        let response = '';

        try {
            switch (command.type) {
                case 'identity':
                case 'capabilities':
                    response = command.response;
                    break;

                case 'navigate':
                    response = `Opening ${command.page} for you...`;
                    setTimeout(() => window.location.href = command.target, 1000);
                    break;

                case 'stats':
                    response = generateStatsResponse(data);
                    break;

                case 'find_schools':
                    if (state.permissions.location) {
                        response = "Finding driving schools near you...";
                        setTimeout(() => window.location.href = '/schools', 1000);
                    } else {
                        response = "I need location permission to find nearby schools. Would you like to grant it?";
                    }
                    break;

                case 'recommend':
                    response = generateRecommendationResponse(data);
                    break;

                case 'permissions':
                    response = "I can request permissions for microphone, camera, location, and notifications. Which would you like to enable?";
                    break;

                case 'quiz_help':
                    response = "I'm here to help! Take the quiz and I'll guide you through difficult questions.";
                    break;

                default:
                    response = generateChatResponse(input, data);
            }

            learnFromInteraction({
                type: command.type,
                content: input,
                response,
                success: true
            });

            data.optimizationMetrics.totalQuestions++;
            if (command.type !== 'chat') {
                data.optimizationMetrics.correctAnswers++;
            }

            saveData(data);

            if (source === 'voice') {
                speak(response);
            }
            
            displayResponse(response);

        } catch (error) {
            console.error('[BrillAI] Command processing error:', error);
            response = "I encountered an error. Please try again.";
            if (source === 'voice') speak(response);
        } finally {
            state.isProcessing = false;
        }

        return response;
    }

    function generateStatsResponse(data) {
        const avgScore = data.quizScores.length > 0 
            ? Math.round(data.quizScores.reduce((a, b) => a + b, 0) / data.quizScores.length)
            : 0;
        
        return `Here's your progress: You've taken ${data.quizScores.length} quizzes with an average score of ${avgScore}%. You've watched ${data.shortsWatched.length} educational shorts. ${data.recommendations && data.recommendations.length > 0 ? 'I have some recommendations to improve your performance!' : 'Keep up the great work!'}`;
    }

    function generateRecommendationResponse(data) {
        if (!data.recommendations || data.recommendations.length === 0) {
            return "You're doing great! Keep practicing to maintain your skills.";
        }
        
        return `Based on my analysis: ${data.recommendations[0].message}`;
    }

    function generateChatResponse(input, data) {
        const lower = input.toLowerCase();
        
        if (lower.includes('hello') || lower.includes('hi')) {
            return `Hello! I'm Brill, your ThinkDrive assistant. How can I help you learn today?`;
        }
        
        if (lower.includes('thank')) {
            return `You're welcome! That's what I'm here for. ThinkDrive built me to help you succeed!`;
        }
        
        if (lower.includes('good') || lower.includes('great')) {
            return `I'm glad to hear that! ThinkDrive's mission is to make your learning experience exceptional.`;
        }
        
        return `Interesting! I'm learning more about you every day to provide better assistance through ThinkDrive's platform.`;
    }

    // ===================================
    // INITIALIZATION
    // ===================================
    function initialize() {
        console.log('[BrillAI] Initializing Advanced AI Assistant...');
        console.log(`[BrillAI] I am ${CONFIG.AI_IDENTITY.fullName}, created by ${CONFIG.AI_IDENTITY.creator}`);
        
        loadPermissions();
        initializeVoice();
        
        const data = loadData();
        data.totalSessions++;
        saveData(data);

        localStorage.removeItem(CONFIG.VOICE_ACTIVE_KEY);
        state.voiceEnabled = false;

        console.log('[BrillAI] Ready to assist! Click the Brill button to open chat or activate voice commands.');
    }

    // ===================================
    // PUBLIC API
    // ===================================
    return {
        init: initialize,
        processCommand,
        speak,
        startVoice: startVoiceListening,
        stopVoice: stopVoiceListening,
        toggleVoice: toggleVoiceListening,
        toggleSidebar,
        closeSidebar,
        requestPermissions,
        requestAllPermissions,
        getStats: () => loadData(),
        learnFromInteraction,
        getIdentity: () => CONFIG.AI_IDENTITY,
        isVoiceActive: () => state.voiceEnabled,
        getPermissions: () => state.permissions,
        sendMessage: (message) => {
            addChatMessage(message, 'user');
            return processCommand(message, 'text');
        }
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.BrillAI.init(), 1500);
    });
} else {
    setTimeout(() => window.BrillAI.init(), 1500);
}
