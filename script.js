// -------------------------------------------------------------------------
// Lógica ITECO Ingeniería - Archivo script.js
// 1. Navegación Móvil
// 2. Calculadora / Configurador de Servidores
// 3. Chatbot IA (CONECTADO A IA REAL)
// -------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. Lógica de Navegación Móvil
    // =========================================================================
    const menuButton = document.getElementById('menu-button');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!navMenu.classList.contains('hidden') && window.innerWidth < 768) {
                    navMenu.classList.add('hidden');
                }
            });
        });
    }

    // =========================================================================
    // 2. Lógica de Calculadora / Configurador de Servidores
    // =========================================================================
    let currentStep = 1;
    const totalSteps = 4;
    const form = document.getElementById('calculator-form');
    
    if (form) {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const progressBar = document.getElementById('progress-bar');
        const currentStepDisplay = document.getElementById('current-step-display');
        const stepTitle = document.getElementById('step-title');

        const stepTitles = {
            1: "Tipo de Plataforma",
            2: "Usuarios / Carga",
            3: "Servicio de Respaldo",
            4: "Resultado Preliminar"
        };

        let calculatorState = {
            platform: null,
            users: null,
            backup: null
        };

        const basePrices = {
            Linux: { small: 80, medium: 150, large: 300 },
            Windows: { small: 120, medium: 220, large: 450 }
        };
        const backupCost = { full: 80, basic: 30, none: 0 };
        const tierNames = { small: "PYME Básica", medium: "PYME en Crecimiento", large: "Empresa Consolidada" };
        const backupNames = { full: "Sí, Completo (DR + Antiransomware)", basic: "Básico (Disco Diario)", none: "No" };

        const showStep = (step) => {
            document.querySelectorAll('.calculator-step').forEach(el => el.classList.remove('active'));
            const currentStepElement = document.getElementById(`step-${step}`);
            if (currentStepElement) currentStepElement.classList.add('active');
            progressBar.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
            currentStepDisplay.textContent = step;
            stepTitle.textContent = stepTitles[step];
            prevBtn.disabled = step === 1;
            nextBtn.style.display = step === totalSteps ? 'none' : 'block';
            if (step === totalSteps) {
                updateSummaryAndPrice();
            }
            if (step < totalSteps) {
                const selectedOption = form.querySelector(`#step-${step} input[name]:checked`);
                nextBtn.disabled = !selectedOption;
            } else {
                nextBtn.disabled = true;
            }
        };

        const navigate = (direction) => {
            if (direction === 'next') {
                const stepElement = document.getElementById(`step-${currentStep}`);
                const input = stepElement.querySelector('input[name]:checked');
                if (!input) return;
                calculatorState[input.name] = input.value;
                currentStep = Math.min(currentStep + 1, totalSteps);
            } else if (direction === 'prev' && currentStep > 1) {
                currentStep = Math.max(currentStep - 1, 1);
            }
            showStep(currentStep);
        };

        const updateSummaryAndPrice = () => {
            const { platform, users, backup } = calculatorState;
            const summaryDetails = document.getElementById('summary-details');
            const estimatedPrice = document.getElementById('estimated-price');
            if (!summaryDetails || !estimatedPrice) return;

            if (platform && users && backup) {
                const basePrice = basePrices[platform][users] || 0;
                const extraCost = backupCost[backup] || 0;
                const finalPrice = basePrice + extraCost;

                summaryDetails.innerHTML = `
                    <p><strong>Plataforma:</strong> ${platform}</p>
                    <p><strong>Usuarios:</strong> ${tierNames[users]}</p>
                    <p><strong>Respaldo:</strong> ${backupNames[backup]}</p>
                `;
                estimatedPrice.textContent = `$${finalPrice.toLocaleString('en-US')} USD`;
            } else {
                summaryDetails.innerHTML = '<p class="text-red-500">Por favor completa todos los pasos.</p>';
            }
        };

        nextBtn.addEventListener('click', () => navigate('next'));
        prevBtn.addEventListener('click', () => navigate('prev'));

        form.addEventListener('change', () => {
            const stepElement = document.getElementById(`step-${currentStep}`);
            const selectedOption = stepElement.querySelector('input[name]:checked');
            nextBtn.disabled = !selectedOption;
        });

        document.getElementById('contact-quote-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const contactMessage = document.getElementById('message');
            if (contactMessage) {
                const quoteMessage = `
Hola, me gustaría solicitar una cotización formal basada en mi configuración preliminar:

Plataforma: ${calculatorState.platform}
Usuarios: ${tierNames[calculatorState.users]}
Respaldo: ${backupNames[calculatorState.backup]}
Precio Estimado: ${document.getElementById('estimated-price').textContent}

Por favor, contáctenme.`;
                contactMessage.value = quoteMessage;
                document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
            }
        });

        showStep(currentStep);
    }

    // =========================================================================
    // 3. Chatbot IA (Conectado a Apps Script)
    // =========================================================================
    const YOUR_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwguteU6czzhSoSIgus14ygBtjj1EPZPJyeHQkXR3_0vvkQgJ3aRx7nIBG2uBkPDoS1/exec';

    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    let isTyping = false;

    const toggleChat = () => {
        if (!chatWindow || !chatToggle) return;
        const isChatOpen = chatWindow.style.display === 'flex';
        chatWindow.style.display = isChatOpen ? 'none' : 'flex';
        chatToggle.style.display = isChatOpen ? 'flex' : 'none';
        if (!isChatOpen && chatInput) chatInput.focus();
    };
    window.toggleChat = toggleChat;
    chatToggle?.addEventListener('click', toggleChat);

    const createMessage = (text, isUser) => {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 max-w-[80%] text-sm rounded-xl shadow-md ${isUser ? 'message-user self-end' : 'message-iteco self-start'}`;
        msgDiv.innerHTML = isUser ? text : text.replace(/\n/g, '<br>');
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const createTypingIndicator = () => {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.id = 'typing-indicator';
        indicatorDiv.className = 'message-iteco p-3 max-w-[80%] text-sm rounded-xl shadow-md self-start';
        indicatorDiv.innerHTML = '<span class="animate-pulse">Escribiendo...</span>';
        chatBody.appendChild(indicatorDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        isTyping = true;
        return indicatorDiv;
    };

    const removeTypingIndicator = (indicator) => {
        indicator?.remove();
        isTyping = false;
    };

    async function getRealAIResponse(userMessage) {
        try {
            const response = await fetch(YOUR_WEB_APP_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Error de red');
            const data = await response.json();
            return data.reply || "No se recibió respuesta del servidor IA.";
        } catch (error) {
            console.error('Error en chatbot:', error);
            return "Error al conectar con el especialista de IA.";
        }
    }

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage || isTyping) return;
        createMessage(userMessage, true);
        chatInput.value = '';
        const indicator = createTypingIndicator();
        const iaResponse = await getRealAIResponse(userMessage);
        removeTypingIndicator(indicator);
        createMessage(iaResponse, false);
    });
});
