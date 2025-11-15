const aliceInput = document.getElementById('aliceInput');
const bobInput = document.getElementById('bobInput');
const aliceMessages = document.getElementById('aliceMessages');
const bobMessages = document.getElementById('bobMessages');
const aiStatus = document.getElementById('aiStatus');
const warningModal = document.getElementById('warningModal');

// Enter key listeners
aliceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage('alice');
});

bobInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage('bob');
});

async function sendMessage(sender) {
    const input = sender === 'alice' ? aliceInput : bobInput;
    const messagesDiv = sender === 'alice' ? aliceMessages : bobMessages;
    const message = input.value.trim();

    if (!message) return;

    // Display the message immediately
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message`;
    messageEl.textContent = message;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Clear input
    input.value = '';

    // Check message with AI
    await checkMessageWithAI(message, sender);
}

async function checkMessageWithAI(message, sender) {
    console.log('🤖 Starting AI check for message:', message);
    
    // Update status
    aiStatus.className = 'ai-status analyzing';
    aiStatus.innerHTML = 'AI Mediator: Analyzing message<span class="loading"></span>';

    try {
        console.log('📡 Making API request to OpenAI...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'system',
                    content: 'You are a profanity detector. Your only job is to detect curse words, swear words, and profanity. Be strict and catch ALL inappropriate language. Respond with ONLY the word YES or NO, nothing else.'
                }, {
                    role: 'user',
                    content: `Does this message contain any curse words, swear words, or profanity? Message: "${message}"\n\nRespond with ONLY "YES" or "NO".`
                }],
                temperature: 1,
                max_completion_tokens: 10
            })
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ API Response data:', data);
        
        const aiResponse = data.choices[0].message.content.trim().toUpperCase();
        console.log('🔍 AI Decision:', aiResponse);
        console.log('🔍 Raw AI response:', data.choices[0].message.content);

        if (aiResponse.includes('YES')) {
            console.log('⚠️ Curse words detected!');
            showModal();
            aiStatus.className = 'ai-status';
            aiStatus.textContent = 'AI Mediator: ⚠️ Inappropriate language detected';
        } else {
            console.log('✅ Message is clean');
            aiStatus.className = 'ai-status';
            aiStatus.textContent = 'AI Mediator: Ready and monitoring';
        }

    } catch (error) {
        console.error('💥 AI check error:', error);
        console.error('💥 Error details:', error.message);
        
        aiStatus.className = 'ai-status';
        aiStatus.textContent = 'AI Mediator: ❌ Error - Check console';
    }
}

function showModal() {
    warningModal.classList.add('show');
}

function closeModal() {
    warningModal.classList.remove('show');
}