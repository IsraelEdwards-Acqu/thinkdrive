/**
 * ThinkDrive — ChatSystem Module v3.0
 * Self-Learning Chat with Support/Community tabs
 */
window.ChatSystem = (function () {
    'use strict';

    const STORAGE_KEY = 'thinkdrive_chat_messages';
    let isOpen = false;
    let activeTab = 'support';

    function loadMessages(tab) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY + '_' + tab);
            return raw ? JSON.parse(raw) : getDefaultMessages(tab);
        } catch { return getDefaultMessages(tab); }
    }

    function saveMessages(tab, messages) {
        try { localStorage.setItem(STORAGE_KEY + '_' + tab, JSON.stringify(messages)); } catch {}
    }

    function getDefaultMessages(tab) {
        if (tab === 'support') {
            return [
                { id: 1, text: 'Welcome to ThinkDrive Support! How can we help you today?', sender: 'system', time: new Date().toISOString(), read: true }
            ];
        }
        return [
            { id: 1, text: 'Welcome to the ThinkDrive Community! Connect with fellow learners.', sender: 'system', time: new Date().toISOString(), read: true }
        ];
    }

    function formatTime(iso) {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function renderMessages() {
        const container = document.getElementById('td-chat-messages');
        if (!container) return;
        const messages = loadMessages(activeTab);
        container.innerHTML = messages.map(m => `
            <div class="td-chat-bubble ${m.sender === 'user' ? 'sent' : 'received'}">
                ${m.text}
                <div class="td-chat-time">${formatTime(m.time)}</div>
                ${m.sender === 'user' ? `<div class="td-chat-status ${m.read ? 'read' : ''}">${m.read ? '✓✓ Read' : '✓ Sent'}</div>` : ''}
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }

    function sendMessage(text) {
        if (!text.trim()) return;
        const messages = loadMessages(activeTab);
        messages.push({
            id: Date.now(),
            text: text.trim(),
            sender: 'user',
            time: new Date().toISOString(),
            read: false
        });
        saveMessages(activeTab, messages);
        renderMessages();

        // ✅ Process command with BrillAI
        setTimeout(async () => {
            const msgs = loadMessages(activeTab);
            const lastMsg = msgs.find(m => m.id === messages[messages.length - 1].id);
            if (lastMsg) lastMsg.read = true;

            let reply;
            
            // ✅ Use BrillAI for intelligent responses
            if (window.BrillAI && typeof window.BrillAI.parseCommand === 'function') {
                try {
                    const command = window.BrillAI.parseCommand(text);
                    const result = await window.BrillAI.executeCommand(command);
                    reply = result.message || result.toString();
                } catch (err) {
                    console.warn('[ChatSystem] BrillAI error:', err);
                    reply = activeTab === 'support' ? getSupportReply(text) : getCommunityReply(text);
                }
            } else {
                reply = activeTab === 'support' ? getSupportReply(text) : getCommunityReply(text);
            }

            msgs.push({
                id: Date.now() + 1,
                text: reply,
                sender: 'system',
                time: new Date().toISOString(),
                read: true
            });
            saveMessages(activeTab, msgs);
            renderMessages();
        }, 800);
    }

    function getSupportReply(text) {
        const lower = text.toLowerCase();
        if (lower.includes('payment') || lower.includes('pay') || lower.includes('fee')) {
            return 'For payment issues, ensure you\'re using valid mobile money or card. Student registration is GHS 40, School onboarding is GHS 100. Contact thinkingdrive@gmail.com for help.';
        }
        if (lower.includes('quiz') || lower.includes('test')) {
            return 'Our quiz covers 100 DVLA-style questions. Keep practicing to aim for 80%+ before your real test!';
        }
        if (lower.includes('school') || lower.includes('register')) {
            return 'Find accredited schools in our Marketplace. Filter by location, check ratings, and register directly!';
        }
        if (lower.includes('video') || lower.includes('lesson')) {
            return 'Browse our video library for lessons on all driving topics. Videos are categorized by difficulty!';
        }
        return 'Thanks for reaching out! Our support team typically responds within 24 hours. For urgent matters, email thinkingdrive@gmail.com.';
    }

    function getCommunityReply(text) {
        const replies = [
            'Great question! Other learners have found the quiz practice mode very helpful.',
            'Welcome to the community! Feel free to share your progress and tips.',
            'Many learners recommend watching at least 5 shorts per day for consistent improvement.',
            'Check out the Marketplace — other students have left helpful reviews of driving schools.',
            'Pro tip: Use BrillAI tips to identify your weak areas and focus your study there!'
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }

    function render() {
        console.log('[ChatSystem] Rendering drawer...');
        
        // Remove existing
        const existingDrawer = document.getElementById('td-chat-drawer');
        if (existingDrawer) existingDrawer.remove();

        // Create drawer
        const drawer = document.createElement('div');
        drawer.id = 'td-chat-drawer';
        drawer.className = 'td-chat-drawer';
        drawer.innerHTML = `
            <div class="td-chat-header">
                <span style="font-weight:700;color:#D4AF37;font-size:1.1rem;">
                    <i class="fas fa-comments"></i> BrillAI Chat
                </span>
                <button id="td-chat-close-btn" style="background:none;border:none;color:rgba(255,255,255,0.6);font-size:1.5rem;cursor:pointer;">&times;</button>
            </div>
            <div class="td-chat-tabs">
                <button class="td-chat-tab ${activeTab === 'support' ? 'active' : ''}" id="td-tab-support">
                    <i class="fas fa-headset"></i> Support
                </button>
                <button class="td-chat-tab ${activeTab === 'community' ? 'active' : ''}" id="td-tab-community">
                    <i class="fas fa-users"></i> Community
                </button>
            </div>
            <div class="td-chat-messages" id="td-chat-messages"></div>
            <div class="td-chat-input-area">
                <input class="td-chat-input" id="td-chat-input" placeholder="Type a message..." />
                <button class="td-chat-send" id="td-chat-send-btn" aria-label="Send message">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(drawer);

        // ✅ Attach event listeners AFTER drawer is added to DOM
        const closeBtn = document.getElementById('td-chat-close-btn');
        const supportTab = document.getElementById('td-tab-support');
        const communityTab = document.getElementById('td-tab-community');
        const sendBtn = document.getElementById('td-chat-send-btn');
        const input = document.getElementById('td-chat-input');

        if (closeBtn) closeBtn.onclick = toggle;
        if (supportTab) supportTab.onclick = () => switchTab('support');
        if (communityTab) communityTab.onclick = () => switchTab('community');
        if (sendBtn) sendBtn.onclick = handleSend;
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') handleSend();
            };
        }

        renderMessages();
        console.log('[ChatSystem] Drawer rendered with event listeners');
    }

    function toggle() {
        isOpen = !isOpen;
        const drawer = document.getElementById('td-chat-drawer');
        if (drawer) {
            drawer.classList.toggle('open', isOpen);
            console.log('[ChatSystem] Drawer toggled:', isOpen ? 'OPEN' : 'CLOSED');
        }
        if (isOpen) renderMessages();
    }

    function switchTab(tab) {
        activeTab = tab;
        console.log('[ChatSystem] Switched to tab:', tab);
        
        // Update tab styles
        document.querySelectorAll('.td-chat-tab').forEach(t => t.classList.remove('active'));
        const activeTabBtn = document.getElementById(`td-tab-${tab}`);
        if (activeTabBtn) activeTabBtn.classList.add('active');
        
        renderMessages();
    }

    function handleSend() {
        const input = document.getElementById('td-chat-input');
        if (input && input.value.trim()) {
            sendMessage(input.value);
            input.value = '';
        }
    }

    function init() {
        console.log('[ChatSystem] Initializing...');
        setTimeout(() => {
            render();
            console.log('[ChatSystem] Initialization complete');
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }

    // ✅ Export functions for BrillAI
    return { 
        toggle, 
        switchTab, 
        handleSend, 
        render,
        isOpen: () => isOpen
    };
})();
