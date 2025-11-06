// -------------------------------------------------------------------------
// script.js - Versión final final final esta sí que sí, te lo juro
// - Navegación móvil
// - Calculadora / Configurador (4 pasos)
// - Chatbot conectado a Apps Script (URL ya configurada)
// -------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------
  // 1) Navegación Móvil
  // ---------------------------
  const menuButton = document.getElementById('menu-button');
  const navMenu = document.getElementById('nav-menu');
  if (menuButton && navMenu) {
    menuButton.addEventListener('click', () => {
      navMenu.classList.toggle('hidden');
    });
    // Cerrar al hacer click en link (solo si hay links)
    const navLinks = navMenu.querySelectorAll('a');
    if (navLinks && navLinks.length) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (!navMenu.classList.contains('hidden') && window.innerWidth < 768) {
            navMenu.classList.add('hidden');
          }
        });
      });
    }
  }

  // ---------------------------
  // 2) Calculadora / Configurador
  // ---------------------------
  (function initCalculator() {
    const form = document.getElementById('calculator-form');
    if (!form) return;

    let currentStep = 1;
    const totalSteps = 4;

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

    const calculatorState = {
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

    const safeSetProgress = (pct) => {
      if (progressBar) progressBar.style.width = pct;
    };

    const showStep = (step) => {
      const stepEl = document.getElementById(`step-${step}`);
      if (!stepEl) return;
      document.querySelectorAll('.calculator-step').forEach(el => el.classList.remove('active'));
      stepEl.classList.add('active');

      safeSetProgress(`${((step - 1) / (totalSteps - 1)) * 100}%`);
      if (currentStepDisplay) currentStepDisplay.textContent = String(step);
      if (stepTitle) stepTitle.textContent = stepTitles[step] || '';
      if (prevBtn) prevBtn.disabled = step === 1;
      if (nextBtn) nextBtn.style.display = step === totalSteps ? 'none' : 'block';

      if (step === totalSteps) {
        updateSummaryAndPrice();
        if (nextBtn) nextBtn.style.display = 'none';
      }

      if (step < totalSteps) {
        const selectedOption = form.querySelector(`#step-${step} input[name]:checked`);
        if (nextBtn) nextBtn.disabled = !selectedOption;
      } else if (nextBtn) {
        nextBtn.disabled = true;
      }
    };

    const navigate = (direction) => {
      if (direction === 'next') {
        if (currentStep < totalSteps) {
          const stepElement = document.getElementById(`step-${currentStep}`);
          const input = stepElement ? stepElement.querySelector('input[name]:checked') : null;
          if (!input) return;
          calculatorState[input.name] = input.value;
          currentStep = Math.min(currentStep + 1, totalSteps);
        }
      } else if (direction === 'prev' && currentStep > 1) {
        currentStep = Math.max(currentStep - 1, 1);
      }
      showStep(currentStep);
    };

    const updateSummaryAndPrice = () => {
      const summary = document.getElementById('summary-details');
      const priceElement = document.getElementById('estimated-price');
      if (!summary || !priceElement) return;

      const { platform, users, backup } = calculatorState;
      let summaryHTML = '';

      if (platform && users && backup) {
        const platformKey = platform in basePrices ? platform : 'Linux';
        const userKey = users in basePrices[platformKey] ? users : 'small';
        const basePrice = basePrices[platformKey][userKey] || 0;
        const extraCost = backup in backupCost ? backupCost[backup] : 0;
        const finalPrice = basePrice + extraCost;

        summaryHTML = `
          <p><strong>Plataforma:</strong> ${escapeHtml(platform)} (${platform === 'Windows' ? 'Incluye licencia base.' : 'Optimizado para Linux.'})</p>
          <p><strong>Usuarios:</strong> ${escapeHtml(tierNames[users] || users)} (Hasta ${users === 'small' ? '10' : users === 'medium' ? '30' : '+30'} usuarios)</p>
          <p><strong>Continuidad Operativa:</strong> ${escapeHtml(backupNames[backup] || backup)}</p>
          ${backup === 'full' ? `<p class="text-sm font-semibold mt-2">⭐ Recomendación: Incluye protección Antiransomware y DR.</p>` : ''}
          ${backup === 'none' ? `<p class="text-sm font-semibold mt-2">⚠️ Advertencia: No recomendado para sistemas ERP críticos.</p>` : ''}
        `;
        priceElement.textContent = `$${finalPrice.toLocaleString('en-US')} USD`;
      } else {
        summaryHTML = '<p>Por favor, completa los pasos anteriores.</p>';
        priceElement.textContent = '—';
      }

      summary.innerHTML = summaryHTML;
    };

    // Helpers
    function escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str.replace(/[&<>"'`=\/]/g, function (s) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '/': '&#x2F;',
          '`': '&#x60;',
          '=': '&#x3D;'
        })[s];
      });
    }

    if (nextBtn) nextBtn.addEventListener('click', () => navigate('next'));
    if (prevBtn) prevBtn.addEventListener('click', () => navigate('prev'));

    form.addEventListener('change', (e) => {
      const stepElement = e.target.closest('.calculator-step');
      if (stepElement && stepElement.id === `step-${currentStep}` && currentStep < totalSteps) {
        if (nextBtn) nextBtn.disabled = false;
      }
    });

    const contactQuoteBtn = document.getElementById('contact-quote-btn');
    if (contactQuoteBtn) {
      contactQuoteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const contactMessage = document.getElementById('message');
        const priceEl = document.getElementById('estimated-price');
        if (!contactMessage) return;
        const quoteMessage =
          `Hola, me gustaría solicitar una cotización formal basada en mi configuración preliminar:\n\n` +
          `Plataforma: ${calculatorState.platform || 'No definida'}\n` +
          `Usuarios: ${calculatorState.users ? tierNames[calculatorState.users] : 'No definido'}\n` +
          `Respaldo: ${calculatorState.backup ? backupNames[calculatorState.backup] : 'No definido'}\n` +
          `Precio Estimado (IaaS+Admin): ${priceEl ? priceEl.textContent : '—'}\n\n` +
          `Por favor, contáctenme.`;
        contactMessage.value = quoteMessage;
        const contactoEl = document.getElementById('contacto');
        if (contactoEl) contactoEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Init
    showStep(currentStep);
  })();

  // ---------------------------
  // 3) Chatbot (Apps Script como intermediario)
  // ---------------------------
  (function initChat() {
    // REEMPLAZADA: tu URL real de Apps Script (ya configurada)
    const YOUR_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwguteU6czzhSoSIgus14ygBtjj1EPZPJyeHQkXR3_0vvkQgJ3aRx7nIBG2uBkPDoS1/exec';

    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    let isTyping = false;

    if (chatWindow) chatWindow.style.display = 'none';
    if (chatToggle) chatToggle.style.display = 'flex';

    const toggleChat = () => {
      if (!chatWindow || !chatToggle) return;
      const isOpen = chatWindow.style.display === 'flex';
      if (isOpen) {
        chatWindow.style.display = 'none';
        chatToggle.style.display = 'flex';
      } else {
        chatWindow.style.display = 'flex';
        chatToggle.style.display = 'none';
        if (chatInput) chatInput.focus();
      }
    };

    window.toggleChat = toggleChat;
    if (chatToggle) chatToggle.addEventListener('click', toggleChat);

    const createMessage = (text, isUser) => {
      if (!chatBody) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = `p-3 max-w-[80%] text-sm rounded-xl shadow-md ${isUser ? 'message-user self-end' : 'message-iteco self-start'}`;
      if (isUser) {
        msgDiv.textContent = text;
      } else {
        // IA puede devolver saltos de línea; sanitizamos reemplazando < y >
        const safe = String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        msgDiv.innerHTML = safe;
      }
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    const createTypingIndicator = () => {
      if (!chatBody) return null;
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
      if (indicator && indicator.remove) indicator.remove();
      isTyping = false;
    };

    async function getRealAIResponse(userMessage) {
      if (!YOUR_WEB_APP_URL) {
        return "Error: La URL del Web App de Google no ha sido configurada en script.js.";
      }

      try {
        const response = await fetch(YOUR_WEB_APP_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
          return "Lo siento, el especialista de IA no está disponible (Error de red).";
        }

        const data = await response.json();
        if (data && typeof data.reply === 'string') return data.reply;
        return "Respuesta inválida desde el especialista de IA.";
      } catch (err) {
        console.error('Error llamando a la IA:', err);
        return "Error de conexión con el especialista de IA.";
      }
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value ? chatInput.value.trim() : '';
        if (!userMessage || isTyping) return;

        createMessage(userMessage, true);
        chatInput.value = '';

        const indicator = createTypingIndicator();
        const iaResponse = await getRealAIResponse(userMessage);
        removeTypingIndicator(indicator);
        createMessage(iaResponse, false);
      });
    }
  })();

}); // DOMContentLoaded end
