// -------------------------------------------------------------------------
// Lógica ITECO Ingeniería - Archivo script.js
// 1. Navegación Móvil
// 2. Calculadora / Configurador de Servidores
// 3. Chatbot IA (Simulado y Corregido)
// -------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================================
    // 1. Lógica de Navegación Móvil
    // =========================================================================
    const menuButton = document.getElementById('menu-button');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('a');

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


    // =========================================================================
    // 2. Lógica de Calculadora / Configurador de Servidores
    // =========================================================================
    let currentStep = 1;
    const totalSteps = 4;
    const form = document.getElementById('calculator-form');
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
        // Ocultar todos los pasos
        document.querySelectorAll('.calculator-step').forEach(el => el.classList.remove('active'));
        
        // Mostrar el paso actual
        const currentStepElement = document.getElementById(`step-${step}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Actualizar barra de progreso y título
        progressBar.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
        currentStepDisplay.textContent = step;
        stepTitle.textContent = stepTitles[step];

        // Manejo de botones
        prevBtn.disabled = step === 1;
        nextBtn.style.display = step === totalSteps ? 'none' : 'block';
        
        // El último paso siempre muestra el botón de Contactar, no el de Siguiente
        if (step === totalSteps) {
            updateSummaryAndPrice();
            nextBtn.style.display = 'none';
        }

        // Deshabilitar Siguiente si no hay una opción seleccionada en los pasos de pregunta
        if (step < totalSteps) {
            const selectedOption = form.querySelector(`#step-${step} input[name]:checked`);
            nextBtn.disabled = !selectedOption;
        } else {
            nextBtn.disabled = true; // Botón Siguiente siempre desactivado en el último paso
        }
    };

    // Función para verificar y avanzar/retroceder
    const navigate = (direction) => {
        if (direction === 'next') {
            // Guardar el estado antes de avanzar (excepto en el último paso)
            if (currentStep < totalSteps) {
                const stepElement = document.getElementById(`step-${currentStep}`);
                const input = stepElement.querySelector('input[name]:checked');
                
                if (!input) {
                    // Aunque está deshabilitado, es una capa de seguridad
                    console.error('Por favor, selecciona una opción para continuar.');
                    return;
                }
                
                // Actualizar el estado
                calculatorState[input.name] = input.value;
                currentStep = Math.min(currentStep + 1, totalSteps);
            }
        } else if (direction === 'prev' && currentStep > 1) {
            currentStep = Math.max(currentStep - 1, 1);
        }

        showStep(currentStep);
    };

    // Listener para los botones de navegación
    nextBtn.addEventListener('click', () => navigate('next'));
    prevBtn.addEventListener('click', () => navigate('prev'));

    // Listener para las opciones de radio (habilita el botón Siguiente)
    form.addEventListener('change', (e) => {
        const stepElement = e.target.closest('.calculator-step');
        if (stepElement && stepElement.id === `step-${currentStep}` && currentStep < totalSteps) {
            nextBtn.disabled = false;
        }
    });

    // Función para calcular el precio y actualizar el resumen
    const updateSummaryAndPrice = () => {
        const { platform, users, backup } = calculatorState;
        let basePrice = 0;
        let finalPrice = 0;
        let summaryHTML = '';

        if (platform && users) {
            // Manejar posibles valores nulos o no definidos
            const platformKey = platform in basePrices ? platform : 'Linux'; 
            const userKey = users in basePrices[platformKey] ? users : 'small'; 

            basePrice = basePrices[platformKey][userKey] || 0;
            const extraCost = backup in backupCost ? backupCost[backup] : 0;
            finalPrice = basePrice + extraCost;

            // Generar Resumen
            summaryHTML += `<p><strong class="font-bold">Plataforma:</strong> ${platform} (${platform === 'Windows' ? 'Incluye licencia base.' : 'Optimizado para Linux.'})</p>`;
            summaryHTML += `<p><strong class="font-bold">Usuarios:</strong> ${tierNames[users]} (Hasta ${users === 'small' ? '10' : users === 'medium' ? '30' : '+30'} usuarios)</p>`;
            summaryHTML += `<p><strong class="font-bold">Continuidad Operativa:</strong> ${backupNames[backup]}</p>`;
            
            if (backup === 'full') {
                 summaryHTML += `<p class="text-sm text-green-600 font-semibold mt-2">⭐ Recomendación: Incluye protección Antiransomware y DR.</p>`;
            } else if (backup === 'none') {
                 summaryHTML += `<p class="text-sm text-red-600 font-semibold mt-2">⚠️ Advertencia: No recomendado para sistemas ERP críticos.</p>`;
            }
        } else {
            summaryHTML = '<p class="text-red-500">Por favor, completa los pasos anteriores.</p>';
        }

        document.getElementById('summary-details').innerHTML = summaryHTML;
        document.getElementById('estimated-price').textContent = `$${finalPrice.toLocaleString('en-US')} USD`;
    };

    // Listener para el botón de Cotización Formal
    document.getElementById('contact-quote-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const quoteMessage = `Hola, me gustaría solicitar una cotización formal basada en mi configuración preliminar:\n\n` +
                             `Plataforma: ${calculatorState.platform}\n` +
                             `Usuarios: ${tierNames[calculatorState.users]}\n` +
                             `Respaldo: ${backupNames[calculatorState.backup]}\n` +
                             `Precio Estimado (IaaS+Admin): ${document.getElementById('estimated-price').textContent}\n\n` +
                             `Por favor, contáctenme.`;
        
        // Inyectar el mensaje en el formulario de contacto y hacer scroll
        const contactMessage = document.getElementById('message');
        contactMessage.value = quoteMessage;
        
        // Scroll suave al formulario de contacto
        document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
    });

    // Inicializar la calculadora
    showStep(currentStep);


    // =========================================================================
// 3. Lógica del Chatbot IA (Simulado y Corregido)
// =========================================================================

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatBody = document.getElementById('chat-body');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
let isTyping = false; // Estado para evitar spam de mensajes

// *** ¡ESTA ES LA LÍNEA QUE FALTABA! ***
// Conecta el botón flotante (chatToggle) a la función toggleChat.
chatToggle.addEventListener('click', toggleChat);

// La función que estaba dando error, ahora declarada globalmente (window.)
// Esta función es llamada por el botón 'X' (onclick) Y ahora también por el botón flotante.
window.toggleChat = () => {
    // Usamos 'flex' porque así está definido en tu HTML (flex-col)
    // Si usaras 'block', el layout interno se rompería.
    const isChatOpen = chatWindow.style.display === 'flex';
    
    chatWindow.style.display = isChatOpen ? 'none' : 'flex';
    chatToggle.style.display = isChatOpen ? 'flex' : 'none'; // Oculta el botón flotante si el chat está abierto
    
    if (!isChatOpen) {
        chatInput.focus();
    }
};

// Función para crear un nuevo mensaje
const createMessage = (text, isUser) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3 max-w-[80%] text-sm rounded-xl shadow-md ${isUser ? 'message-user self-end' : 'message-iteco self-start'}`;
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
    return msgDiv; // Retornar el elemento creado
};

// Función para crear el indicador de 'Escribiendo...'
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

// Función para eliminar el indicador de 'Escribiendo...'
const removeTypingIndicator = (indicator) => {
    if (indicator) {
        indicator.remove();
    }
    isTyping = false;
};

// Simulación de respuesta de IA basada en keywords
const getSimulatedIAResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('servidor') || msg.includes('hosting')) {
        return "Nuestros Servidores Administrados en Chile garantizan Soporte Local y redundancia. Son ideales para ERPs. ¿Necesitas Linux o Windows?";
    }
    if (msg.includes('erp') || msg.includes('softland') || msg.includes('sap')) {
        return "Somos especialistas en Cloud ERP, incluyendo Softland y SAP B1. Podemos hostear tu plataforma y ofrecer consultoría. ¿Cuál es el ERP que usas actualmente?";
    }
    if (msg.includes('precio') || msg.includes('costo') || msg.includes('cotizar')) {
        return "Para darte un precio exacto, usa nuestro Configurador de Servidores (la sección de 'Configurador' arriba). Es la forma más rápida de obtener un estimado de IaaS. ¡Es un servicio gratuito!";
    }
    if (msg.includes('seguridad') || msg.includes('ransomware') || msg.includes('continuidad')) {
        return "Ofrecemos Continuidad Operativa Cloud con Antiransomware y reversión automática. Garantizamos el Respaldo de datos y cumplimiento ISO 27001. ¿Te preocupa algún riesgo específico?";
    }
    if (msg.includes('contacto') || msg.includes('llamada')) {
        return "Puedes llenar el formulario en la sección Contacto o llamar al (569) 3452 3370. Nuestro equipo te atenderá de inmediato.";
    }
    
    return "Gracias por tu pregunta. Soy tu especialista ITECO. ¿Podrías ser más específico sobre tu necesidad de infraestructura, ERP o seguridad para poder ayudarte mejor?";
};

// Manejo del formulario de chat
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (userMessage === '' || isTyping) return;

    createMessage(userMessage, true);
    chatInput.value = '';

    // 1. Mostrar indicador de "Escribiendo..."
    const indicator = createTypingIndicator();

    // 2. Simular tiempo de espera para la respuesta de la IA
    setTimeout(() => {
        const iaResponse = getSimulatedIAResponse(userMessage);
        
        // 3. Eliminar indicador y mostrar respuesta
        removeTypingIndicator(indicator);
        createMessage(iaResponse, false);
    }, 1200); // 1.2 segundos para simular la respuesta
});

// Corrección extra: Ocultar el botón flotante cuando el chat está abierto, para no molestar al usuario mientras navega (ajÁ)
// (Modifiqué la función toggleChat arriba para incluir esto)
