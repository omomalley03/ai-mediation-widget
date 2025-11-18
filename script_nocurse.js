const aliceInput = document.getElementById('aliceInput');
const bobInput = document.getElementById('bobInput');
const aliceMessages = document.getElementById('aliceMessages');
const bobMessages = document.getElementById('bobMessages');
const aiStatus = document.getElementById('aiStatus');

const warningModal = document.getElementById('warningModal');
let conversationLog = "";

// Enter key listeners
aliceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage('alice');
});

bobInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage('bob');
});


// Add these new variables at the top with your other variables
const aliceMicBtn = document.getElementById('aliceMicBtn');
const bobMicBtn = document.getElementById('bobMicBtn');
const aliceTranscript = document.getElementById('aliceTranscript');
const bobTranscript = document.getElementById('bobTranscript');

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let aliceRecognition = null;
let bobRecognition = null;
let isAliceRecording = false;
let isBobRecording = false;

// Check if speech recognition is supported
if (SpeechRecognition) {
    aliceRecognition = new SpeechRecognition();
    bobRecognition = new SpeechRecognition();

    // Configure both recognitions
    [aliceRecognition, bobRecognition].forEach(recognition => {
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
    });

    // Alice's speech recognition
    aliceRecognition.onresult = (event) => handleSpeechResult(event, 'alice');
    aliceRecognition.onerror = (event) => handleSpeechError(event, 'alice');
    aliceRecognition.onend = () => handleSpeechEnd('alice');

    // Bob's speech recognition
    bobRecognition.onresult = (event) => handleSpeechResult(event, 'bob');
    bobRecognition.onerror = (event) => handleSpeechError(event, 'bob');
    bobRecognition.onend = () => handleSpeechEnd('bob');
} else {
    console.warn('Speech recognition not supported in this browser');
    if (aliceMicBtn) aliceMicBtn.disabled = true;
    if (bobMicBtn) bobMicBtn.disabled = true;
    if (aliceMicBtn) aliceMicBtn.title = 'Speech recognition not supported';
    if (bobMicBtn) bobMicBtn.title = 'Speech recognition not supported';
}

// Speech recognition functions
function toggleRecording(sender) {
    if (sender === 'alice') {
        if (isAliceRecording) {
            stopRecording('alice');
        } else {
            startRecording('alice');
        }
    } else {
        if (isBobRecording) {
            stopRecording('bob');
        } else {
            startRecording('bob');
        }
    }
}

function startRecording(sender) {
    const recognition = sender === 'alice' ? aliceRecognition : bobRecognition;
    const micBtn = sender === 'alice' ? aliceMicBtn : bobMicBtn;
    const input = sender === 'alice' ? aliceInput : bobInput;
    const transcriptDiv = sender === 'alice' ? aliceTranscript : bobTranscript;

    if (!recognition) return;

    try {
        recognition.start();
        if (sender === 'alice') {
            isAliceRecording = true;
        } else {
            isBobRecording = true;
        }

        micBtn.classList.add('recording');
        micBtn.textContent = '⏹️';
        input.placeholder = 'Listening...';
        input.disabled = true;
        transcriptDiv.textContent = 'Listening...';
        transcriptDiv.classList.add('active');

        console.log(`${sender} started recording`);
    } catch (error) {
        console.error('Error starting recognition:', error);
    }
}

function stopRecording(sender) {
    const recognition = sender === 'alice' ? aliceRecognition : bobRecognition;
    const micBtn = sender === 'alice' ? aliceMicBtn : bobMicBtn;
    const input = sender === 'alice' ? aliceInput : bobInput;
    const transcriptDiv = sender === 'alice' ? aliceTranscript : bobTranscript;

    if (!recognition) return;

    try {
        recognition.stop();
        if (sender === 'alice') {
            isAliceRecording = false;
        } else {
            isBobRecording = false;
        }

        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤';
        input.disabled = false;
        input.placeholder = 'Type or use microphone...';
        transcriptDiv.classList.remove('active');

        // Auto-send the message after stopping
        setTimeout(() => {
            if (input.value.trim()) {
                sendMessage(sender);
            }
            transcriptDiv.textContent = '';
        }, 100);

        console.log(`${sender} stopped recording`);
    } catch (error) {
        console.error('Error stopping recognition:', error);
    }
}

function handleSpeechResult(event, sender) {
    const input = sender === 'alice' ? aliceInput : bobInput;
    const transcriptDiv = sender === 'alice' ? aliceTranscript : bobTranscript;

    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }

    if (finalTranscript) {
        input.value = (input.value + ' ' + finalTranscript).trim();
    }

    // Show interim results
    if (interimTranscript) {
        transcriptDiv.textContent = 'Hearing: "' + interimTranscript + '"';
    }
}

function handleSpeechError(event, sender) {
    console.error(`Speech recognition error for ${sender}:`, event.error);
    const transcriptDiv = sender === 'alice' ? aliceTranscript : bobTranscript;
    
    if (event.error === 'no-speech') {
        transcriptDiv.textContent = 'No speech detected. Try again.';
    } else if (event.error === 'not-allowed') {
        transcriptDiv.textContent = 'Microphone access denied';
    } else {
        transcriptDiv.textContent = `Error: ${event.error}`;
    }
    
    stopRecording(sender);
}

function handleSpeechEnd(sender) {
    const isRecording = sender === 'alice' ? isAliceRecording : isBobRecording;
    
    // If we're supposed to be recording but it ended, restart it
    if (isRecording) {
        const recognition = sender === 'alice' ? aliceRecognition : bobRecognition;
        try {
            recognition.start();
        } catch (error) {
            console.log('Recognition restart not needed');
        }
    }
}

async function sendMessage(sender) {
    const input = sender === 'alice' ? aliceInput : bobInput;
    const messagesDiv = sender === 'alice' ? aliceMessages : bobMessages;
    const message = input.value.trim();

    conversationLog += `${sender === 'alice' ? 'Alice' : 'Bob'}: ${message}\n`;

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

    if (window.PAGE_VERSION === "nocurse") {
        await profanityCheck(message, sender);
    }
    if (window.PAGE_VERSION === "mediator") {
        await mediateLLM(message, sender);
    }
    
}

async function profanityCheck(message, sender) {
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

async function mediateLLM(message, sender) {
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
                    content: 'You are an AI mediator monitoring a conversation between Alice and Bob on a polarizing political topic. At each turn, you receive the current dialogue and must output exactly one of two things: “[silence]” if no mediation is needed, or “[prompt]: <your facilitating prompt>” if intervention would improve the discussion. If the conversation is empty (no messages yet), you must begin by briefly stating ground rules—respect, turn-taking, and a focus on understanding rather than winning—and then invite Alice to start; this initial output must use the “[prompt]: …” format. After the conversation begins, you should output “[prompt]” when the discussion becomes hostile or personal (insults, contempt, personal attacks), when one person dominates and the other is not being heard, when Alice and Bob misunderstand or talk past each other, when emotions escalate and clarity drops, when the discussion becomes stuck or circular, or when misinterpretation or unclear terminology needs correction. A facilitation prompt should be brief, neutral, and aimed at restoring respect, balance, clarity, or shared understanding. You should output “[silence]” when the conversation is respectful, balanced, calm, and progressing constructively on its own, or when a pause would be productive. The default is silence unless there is a clear reason to intervene. Your output must always be exactly “[silence]” or “[prompt]: <message>” with no additional commentary. The conversation will be given in the format "Dialogue: ...". Respond "[silence]" if the input does not begin with "Dialogue". Begin by responding "[silence]" to confirm you understand.'
                }, {
                    role: 'user',
                    content: `Dialogue:"${message}"\n\nRespond with ONLY "YES" or "NO".`
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
        const mediatorOutput = data.choices[0].message.content.trim();
        conversationLog += `Mediator: ${mediatorOutput}\n`;
        console.log('Current conversation log: '+conversationLog)
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
            aiStatus.textContent = 'AI Mediator: +aiResponse';
        }

    } catch (error) {
        console.error('💥 AI check error:', error);
        console.error('💥 Error details:', error.message);
        
        aiStatus.className = 'ai-status';
        aiStatus.textContent = 'AI Mediator: ❌ Error - Check console';
    }
}

function showModal(message="Watch your profanity!") {
    const modalText = document.getElementById('modalMessage');
    modalText.textContent = message;
    warningModal.classList.add('show');
}

function closeModal() {
    warningModal.classList.remove('show');
}