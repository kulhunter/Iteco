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
        // Toggle para menú hamburguesa
        menuButton.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
        });

        // Cierra el menú después de hacer click en un enlace (en móvil)
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
    
    // Ejecutar solo si el formulario de la calculadora existe en la página
    if (form) {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const progressBar = document.getElementById('progress-bar');
        const currentStepDisplay = document.getElementById('current-step-display');
        const stepTitle = document.getElementById('step-title');

        // Títulos de los pasos
        const stepTitles = {
            1: "Tipo de Plataforma",
            2: "Usuarios / Carga",
            3: "Servicio de Respaldo",
            4: "Resultado Preliminar"
        };

        // Objeto para almacenar las respuestas del usuario
        let calculatorState = {
            platform: null,
            users: null,
            backup: null
        };

        // Precios base (valores en USD, simplificados para el demo)
        const basePrices = {
            Linux: { small: 80, medium: 150, large: 300 },
            Windows: { small: 120, medium: 220, large: 450 }
        };
        const backupCost = { full: 80, basic: 30, none: 0 };
        const tierNames = { small: "PYME Básica", medium: "PYME en Crecimiento", large: "Empresa Consolidada" };
        const backupNames = { full: "Sí, Completo (DR + Antiransomware)", basic: "Básico (Disco Diario)", none: "No" };

        // Función principal para mostrar el paso actual
        const showStep = (step) => {
            if (!document.getElementById(`step-${step}`)) return;
            document.querySelectorAll('.calculator-step').forEach(el => el.classList.remove('active'));
            const currentStepElement = document.getElementById(`step-${step}`);
            if (currentStepElement) {
                currentStepElement.classList.add('active');
            }
            progressBar.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
            currentStepDisplay.textContent = step;
            stepTitle.textContent = stepTitles[step];
            prevBtn.disabled = step === 1;
            nextBtn.style.display = step === totalSteps ? 'none' : 'block';
            if (step === totalSteps) {
                updateSummaryAndPrice();
                nextBtn.style.display = 'none';
            }
            if (step < totalSteps) {
                const selectedOption = form.querySelector(`#step-${step} input[name]:checked`);
                nextBtn.disabled = !selectedOption;
            } else {
                nextBtn.disabled = true;
            }
        };

        // Función para verificar y avanzar/retroceder
        const navigate = (direction) => {
            if (direction === 'next') {
                if (currentStep < totalSteps) {
                    const stepElement = document.getElementById(`step-${currentStep}`);
                    const input = stepElement.querySelector('input[name]:checked');
                    if (!input) return;
                    calculatorState[input.name] = input.value;
                    currentStep = Math.min(currentStep + 1, totalSteps);
                }
            } else if (direction === 'prev' && currentStep > 1) {
                currentStep = Math.max(currentStep - 1, 1);
            }
            showStep(currentStep);
        };

        // Función para calcular el precio y actualizar el resumen
        const updateSummaryAndPrice = () => {
            if (!document.getElementById('summary-details') || !document.getElementById('estimated-price')) {
                return;
            }
            const { platform, users, backup } = calculatorState;
            let summaryHTML = '';
            if (platform && users && backup) {
                const platformKey = platform in basePrices ? platform : 'Linux'; 
                const userKey = users in basePrices[platformKey] ? users : 'small';
                let basePrice = basePrices[platformKey][userKey] || 0;
                let extraCost = backup in backupCost ? backupCost[backup] : 0;
                let finalPrice = basePrice + extraCost;
                summaryHTML = `
                    <p><strong class="font-bold">Plataforma:</strong> ${platform} (${platform === 'Windows' ? 'Incluye licencia base.' : 'Optimizado para Linux.'})</p>
                    <p><strong class="font-bold">Usuarios:</strong> ${tierNames[users]} (Hasta ${users === 'small' ? '10' : users === 'medium' ? '30' : '+30'} usuarios)</p>
                    <p><strong class="font-bold">Continuidad Operativa:</strong> ${backupNames[backup]}</p>
                    ${backup === 'full' ? `<p class="text-sm text-green-600 font-semibold mt-2">⭐ Recomendación: Incluye protección Antiransomware y DR.</p>` : ''}
                    ${backup === 'none' ? `<p class="text-sm text-red-600 font-semibold mt-2">⚠️ Advertencia: No recomendado para sistemas ERP críticos.</p>` : ''}
                `;
                document.getElementById('estimated-price').textContent = `$${finalPrice.toLocaleString('en-US')} USD`;
            } else {
                summaryHTML = '<p class="text-red-500">Por favor, completa los pasos anteriores.</p>';
            }
            document.getElementById('summary-details').innerHTML = summaryHTML;
        };

        // --- Listeners para la Calculadora ---
        nextBtn.addEventListener('click', () => navigate('next'));
        prevBtn.addEventListener('click', () => navigate('prev'));
        form.addEventListener('change', (e) => {
            const stepElement = e.target.closest('.calculator-step');
            if (stepElement && stepElement.id === `step-${currentStep}` && currentStep < totalSteps) {
                nextBtn.disabled = false;
            }
        });

        document.getElementById('contact-quote-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const contactMessage = document.getElementById('message');
            if (contactMessage) {
                const quoteMessage = `Hola, me gustaría solicitar una cotización formal basada en mi configuración preliminar:\n\n` +
                             `Plataforma: ${calculatorState.platform}\n` +
                             `Usuarios: ${tierNames[calculatorState.users]}\n` +
                             `Respaldo: ${backupNames[calculatorState.backup]}\n` +
                             `Precio Estimado (IaaS+Admin): ${document.getElementById('estimated-price').textContent}\n\n` +
                             `Por favor, contáctenme.`;
                contactMessage.value = quoteMessage;
                document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Inicializar la calculadora
        showStep(currentStep);
    } // Fin del 'if (form)'


    // =========================================================================
    // 3. Lógica del Chatbot IA (CONECTADO A IA REAL)
    // =========================================================================

    // --- URL de tu intermediario (Apps Script) ---
    const YOUR_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwguteU6czzhSoSIgus14ygBtjj1EPZPJyeHQkXR3_0vvkQgJ3aRx7nIBG2uBkPDoS1/exec';
    // ----------------------------------------------------

    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    let isTyping = false;

    // 1. DEFINIR LA FUNCIÓN PRIMERO
    const toggleChat = () => {
        if (!chatWindow || !chatToggle) return;
        const isChatOpen = chatWindow.style.display === 'flex';

        if (isChatOpen) {
            chatWindow.style.display = 'none';
            chatToggle.style.display = 'flex';
        } else {
            chatWindow.style.display = 'flex';
            chatToggle.style.display = 'none';
            if (chatInput) chatInput.focus();
        }
    };

    // 2. ASIGNARLA A 'window' (para el botón 'X' del HTML)
    window.toggleChat = toggleChat;

    // 3. CONECTAR EL BOTÓN FLOTANTE
    if (chatToggle) {
        chatToggle.addEventListener('click', toggleChat);
    }

    // --- Lógica del Chat ---

    // Función para crear un nuevo mensaje
    const createMessage = (text, isUser) => {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 max-w-[80%] text-sm rounded-xl shadow-md ${isUser ? 'message-user self-end' : 'message-iteco self-start'}`;
        // Convertir saltos de línea (\n) de la IA en <br>
        if (!isUser) {
            msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        } else {
            msgDiv.textContent = text;
        }
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };
    
    // Función para crear el indicador de 'Escribiendo...'
    const createTypingIndicator = () => {
        if (!chatBody) return;
        const indicatorDiv = document.createElement('div');
        indicatorDiv.id = 'typing-indicator';
        indicatorDiv.className = 'message-iteco p-3 max-w-[80%] text-sm rounded-xl shadow-md self-start';
        indicatorDiv.innerHTML = '<span class="animate-pulse">Escribiendo...</span>';
        chatBody.appendChild(indicatorDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        isTyping = true;
        return indicatorDiv;
    };
    
    // Función para eliminar el indicador de 'Escribiendo...'
    const removeTypingIndicator = (indicator) => {
        if (indicator) indicator.remove();
        isTyping = false;
    };

    // *** NUEVA FUNCIÓN PARA LLAMAR A LA IA REAL ***
    async function getRealAIResponse(userMessage) {
        if (YOUR_WEB_APP_URL === 'PEGA_AQUÍ_LA_URL_DE_IMPLEMENTACIÓN') {
            return "Error: La URL del Web App de Google no ha sido configurada en script.js.";
        }
        
        try {
            const response = await fetch(YOUR_WEB_APP_URL, {
                method: 'POST',
                mode: 'cors', // Necesario para llamar a Apps Script
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script prefiere text/plain para doPost simple
                body: JSON.stringify({ message: userMessage }) 
            });

            if (!response.ok) {
                return "Lo siento, el especialista de IA no está disponible (Error de red).";
            }

            const data = await response.json();
            return data.reply; // 'reply' es lo que definimos en el Apps Script

        } catch (error) {
            console.error('Error llamando a la IA:', error);
            return "Error de conexión con el especialista de IA.";
        }
    }

    // Manejo del formulario de chat (Modificado con 'async')
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => { // <- 'async' es nuevo
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            if (userMessage === '' || isTyping) return;

            createMessage(userMessage, true);
            chatInput.value = '';

            // 1. Mostrar indicador de "Escribiendo..."
            const indicator = createTypingIndicator();

            // 2. Llamar a la IA real (esto es nuevo)
            const iaResponse = await getRealAIResponse(userMessage);
            
            // 3. Eliminar indicador y mostrar respuesta
trim         removeTypingIndicator(indicator);
            createMessage(iaResponse, false);
        });
    }

}); // Fin del 'DOMContentLoaded'
