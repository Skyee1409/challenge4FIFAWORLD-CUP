/* ArenaMind - Fan Portal & GenAI Concierge Logic */

const FanPortal = {
  currentPoints: 250,
  selectedLanguage: "en",
  isTyping: false,

  // Default greetings per language
  greetings: {
    en: "👋 Hello! I am **ArenaMind**, your GenAI Concierge for the FIFA World Cup 2026. I can assist you with multilingual translations, wheelchair-accessible routing, sustainable transit, and live wait times. What can I help you find today?",
    es: "👋 ¡Hola! Soy **ArenaMind**, tu Asistente de IA para la Copa Mundial de la FIFA 2026. Te puedo ayudar con traducciones, rutas accesibles, transporte ecológico y tiempos de espera. ¿En qué te puedo ayudar hoy?",
    fr: "👋 Bonjour! Je suis **ArenaMind**, votre assistant IA pour la Coupe du Monde de la FIFA 2026. Je peux vous aider avec les traductions, les itinéraires accessibles, les transports durables et les temps d'attente. Que puis-je faire pour vous aujourd'hui?",
    pt: "👋 Olá! Sou o **ArenaMind**, seu assistente GenAI para a Copa do Mundo FIFA 2026. Posso ajudar com rotas acessíveis, transporte sustentável e tempos de espera. Como posso te ajudar hoje?"
  },

  // Initialize Fan Portal
  init: function() {
    this.setupEventListeners();
    this.loadGreeting();
    this.updatePointsUI();
  },

  // Setup UI Listeners
  setupEventListeners: function() {
    // Chat Send button
    const btnSend = document.getElementById("btn-send-message");
    if (btnSend) {
      btnSend.addEventListener("click", () => this.handleUserMessageSubmit());
    }

    // Chat input enter key
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleUserMessageSubmit();
      });
    }

    // Prompt Chips click handlers
    const chips = document.querySelectorAll(".prompt-chips .chip");
    chips.forEach(chip => {
      chip.addEventListener("click", (e) => {
        const prompt = e.currentTarget.getAttribute("data-prompt");
        if (chatInput) {
          chatInput.value = prompt;
          this.handleUserMessageSubmit();
        }
      });
    });

    // Voice dictation simulation
    const btnVoice = document.getElementById("btn-voice-input");
    if (btnVoice) {
      btnVoice.addEventListener("click", () => this.simulateVoiceInput());
    }

    // Eco Checklist toggles
    const chkBottle = document.getElementById("chk-bottle");
    if (chkBottle) {
      chkBottle.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.addPoints(50);
        } else {
          this.addPoints(-50);
        }
      });
    }

    const chkFood = document.getElementById("chk-food");
    if (chkFood) {
      chkFood.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.addPoints(50);
        } else {
          this.addPoints(-50);
        }
      });
    }

    // Rewards claim buttons
    const btnCup = document.getElementById("claim-cup");
    if (btnCup) {
      btnCup.addEventListener("click", () => this.claimReward("claim-cup", 200, "🥤 Free Eco Cup"));
    }

    const btnMerch = document.getElementById("claim-merch");
    if (btnMerch) {
      btnMerch.addEventListener("click", () => this.claimReward("claim-merch", 400, "🧣 15% Off Scarf"));
    }

    // Accessibility Toggle redraws routes
    const toggleAccess = document.getElementById("toggle-accessibility");
    if (toggleAccess) {
      toggleAccess.addEventListener("change", () => {
        StadiumMap.drawNavigationRoute(false);
      });
    }

    // Refresh Wait Times Button
    const refreshBtn = document.getElementById("refresh-services");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshWaitTimes());
    }
  },

  // Set selected language from dropdown
  setLanguage: function(lang) {
    this.selectedLanguage = lang;
    this.loadGreeting(true);
  },

  // Load greeting message
  loadGreeting: function(clearFirst = false) {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    if (clearFirst) {
      container.innerHTML = "";
    }

    // Avoid loading greeting if chat already has history
    if (container.children.length === 0) {
      this.appendMessage("bot", this.greetings[this.selectedLanguage]);
    }
  },

  // Append a message to the chat display area
  appendMessage: function(sender, text) {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${sender}`;

    // Simple markdown wrapper for bold text
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Replace linebreaks with <br>
    formattedText = formattedText.replace(/\n/g, "<br>");

    msgDiv.innerHTML = `
      <div class="msg-content">${formattedText}</div>
      <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;

    // Add audio text-to-speech option for bot messages
    if (sender === "bot") {
      const audioBtn = document.createElement("button");
      audioBtn.className = "msg-audio-btn";
      audioBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-top:2px;">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      audioBtn.title = "Listen to translation";
      audioBtn.style = "position:absolute; right:10px; top:10px; background:none; border:none; color:var(--text-muted); cursor:pointer;";
      audioBtn.addEventListener("click", () => this.simulateVoiceOutput(text));
      msgDiv.appendChild(audioBtn);
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  },

  // Append a typewriter streaming message
  appendStreamingMessage: function(text) {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg bot";
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "msg-content";
    msgDiv.appendChild(contentDiv);

    const timeSpan = document.createElement("span");
    timeSpan.className = "msg-time";
    timeSpan.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgDiv.appendChild(timeSpan);

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        // Stream text char by char, parse basic tags
        let char = text.charAt(index);
        let partialText = text.substring(0, index + 1);
        
        let formatted = partialText
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");
          
        contentDiv.innerHTML = formatted;
        container.scrollTop = container.scrollHeight;
        index++;
      } else {
        clearInterval(interval);
        // Add speech play button
        const audioBtn = document.createElement("button");
        audioBtn.className = "msg-audio-btn";
        audioBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-top:2px;">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        `;
        audioBtn.style = "position:absolute; right:10px; top:10px; background:none; border:none; color:var(--text-muted); cursor:pointer;";
        audioBtn.addEventListener("click", () => this.simulateVoiceOutput(text));
        msgDiv.appendChild(audioBtn);
      }
    }, 12);
  },

  // Show typing bubble indicators
  showTypingIndicator: function() {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-msg bot chat-loading";
    typingDiv.id = "chat-typing-indicator";
    typingDiv.innerHTML = `<span></span><span></span><span></span>`;
    
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    this.isTyping = true;
  },

  // Hide typing bubble indicators
  hideTypingIndicator: function() {
    const indicator = document.getElementById("chat-typing-indicator");
    if (indicator) {
      indicator.remove();
    }
    this.isTyping = false;
  },

  // Handle user inputs submit
  handleUserMessageSubmit: function() {
    if (this.isTyping) return;

    const input = document.getElementById("chat-input");
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    this.appendMessage("user", text);
    input.value = "";

    this.showTypingIndicator();

    // GenAI response calculation delay
    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.resolveGenAIQuery(text);
      this.appendStreamingMessage(response);
    }, 900);
  },

  // Context-Aware client-side semantic matching responder (The GenAI Brain)
  resolveGenAIQuery: function(query) {
    const cleanedQuery = query.toLowerCase();
    const db = ARENA_DATA.qaDatabase[this.selectedLanguage] || ARENA_DATA.qaDatabase["en"];
    
    // 1. Search for keyword matches in selected language
    for (let qa of db) {
      for (let kw of qa.keywords) {
        if (cleanedQuery.includes(kw)) {
          // If query mentions Section 105 or accessible route, auto trigger map route drawing
          if (kw === "105" || kw === "accessible" || kw === "wheelchair") {
            setTimeout(() => {
              const selectStart = document.getElementById("route-start");
              const selectEnd = document.getElementById("route-end");
              const chkAccess = document.getElementById("toggle-accessibility");
              
              if (selectStart && selectEnd && chkAccess) {
                selectStart.value = "Gate_B";
                selectEnd.value = "Sec_105";
                chkAccess.checked = true;
                StadiumMap.drawNavigationRoute(false);
              }
            }, 1000);
          }
          return qa.answer;
        }
      }
    }

    // 2. Multilingual translation resolver
    if (cleanedQuery.includes("translate") || cleanedQuery.includes("traduc")) {
      return `🗣️ **Translation Hub**:\nHere is your translation to Spanish:\n\n*"¿Dónde está la estación médica más cercana?"* (Where is the nearest medical station?)\n\n*Press the audio speaker button on this bubble to hear the local pronunciation!*`;
    }

    // 3. Fallback: GenAI simulation engine generates context-appropriate stadium response
    return `🤖 **ArenaMind GenAI Assistant**:\nI analyzed your query: *"${query}"*. 

While I don't have direct records matching that in the stadium handbook, here is what my operational database recommends:
- Check the **Gate A Information Hub** for lost items or specific ticketing concerns.
- Ask any roaming steward (in **Neon Green vests**) who have real-time links to stadium safety.
- For transit issues, visit the Gate C Shuttles desk.

Can I help you calculate a map route or show concession wait times instead?`;
  },

  // Simulate dictating text via microphone button
  simulateVoiceInput: function() {
    const voicePrompts = [
      "Find wheelchair access to my seat in Section 105.",
      "How do I get to Restrooms A from Gate B?",
      "Translate 'I need a bottle of water' to Spanish.",
      "What is the most eco-friendly transport option available?",
      "Which concession stand has the shortest line right now?"
    ];

    const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
    const input = document.getElementById("chat-input");
    const voiceBtn = document.getElementById("btn-voice-input");

    if (input && voiceBtn) {
      voiceBtn.style.color = "var(--neon-magenta)";
      voiceBtn.style.boxShadow = "0 0 10px var(--neon-magenta-glow)";
      input.placeholder = "Listening...";
      
      setTimeout(() => {
        input.value = randomPrompt;
        voiceBtn.style.color = "";
        voiceBtn.style.boxShadow = "";
        input.placeholder = "Ask ArenaMind...";
        
        // Auto trigger submit
        this.handleUserMessageSubmit();
      }, 1500);
    }
  },

  // Simulate text-to-speech voice playback
  simulateVoiceOutput: function(text) {
    // Strip markdown formatting for cleaner speech reading
    const cleanText = text.replace(/[*#_]/g, "");
    
    // Simulate browser speech synthesis if supported
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Select correct voice language
      if (this.selectedLanguage === "es") utterance.lang = "es-MX";
      else if (this.selectedLanguage === "fr") utterance.lang = "fr-FR";
      else if (this.selectedLanguage === "pt") utterance.lang = "pt-BR";
      else utterance.lang = "en-US";

      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`🔊 Simulating Audio Readout:\n"${cleanText}"`);
    }
  },

  // Add or subtract green points
  addPoints: function(amount) {
    this.currentPoints = Math.max(0, this.currentPoints + amount);
    this.updatePointsUI();
  },

  // Update Points display counter, bar and claim eligibility
  updatePointsUI: function() {
    const pointsSpan = document.getElementById("eco-points");
    if (pointsSpan) {
      pointsSpan.innerText = this.currentPoints;
      // Trigger simple pop scale animation
      pointsSpan.parentElement.style.transform = "scale(1.15)";
      setTimeout(() => {
        pointsSpan.parentElement.style.transform = "";
      }, 200);
    }

    // Update progress fill
    const progressFill = document.querySelector(".eco-progress-fill");
    const progressLbl = document.querySelector(".progress-lbl");
    if (progressFill && progressLbl) {
      let percent = Math.min(100, Math.floor((this.currentPoints / 500) * 100));
      progressFill.style.width = `${percent}%`;

      if (this.currentPoints >= 400) {
        progressLbl.innerText = "Lv. 4 Elite Eco Champion";
      } else if (this.currentPoints >= 200) {
        progressLbl.innerText = "Lv. 3 Eco Ambassador";
      } else {
        progressLbl.innerText = "Lv. 1 Eco Supporter";
      }
    }

    // Enable/disable rewards buttons
    ARENA_DATA.ecoRewards.forEach(reward => {
      const btn = document.getElementById(reward.id);
      if (btn) {
        if (this.currentPoints >= reward.cost) {
          btn.disabled = false;
        } else {
          btn.disabled = true;
        }
      }
    });
  },

  // Claim a green reward ticket
  claimReward: function(rewardId, cost, name) {
    if (this.currentPoints < cost) return;

    this.addPoints(-cost);
    
    // Popup simulated claim coupon
    const code = `WC2026-ECO-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const message = `🎉 **Reward Claimed!**\nYou unlocked **${name}**.\nPresent code to the concession steward:\n` +
      `\`\`\`\nCode: ${code}\n\`\`\`\n` +
      `Thank you for keeping FIFA 2026 green! ♻️`;
      
    this.appendMessage("bot", message);
  },

  // Refresh concession and services queue densities
  refreshWaitTimes: function() {
    const btn = document.getElementById("refresh-services");
    if (btn) btn.classList.add("animate-spin");

    setTimeout(() => {
      if (btn) btn.classList.remove("animate-spin");
      
      const listContainer = document.querySelector(".services-list");
      if (!listContainer) return;

      listContainer.innerHTML = "";

      // Randomize wait times slightly to make it feel "live"
      ARENA_DATA.services.forEach(serv => {
        let change = Math.floor(Math.random() * 5) - 2; // -2 to +2 min
        let newWait = Math.max(0, serv.wait + change);
        
        let statusClass = "text-green";
        if (newWait > 15) statusClass = "text-red";
        else if (newWait > 8) statusClass = "text-orange";

        const item = document.createElement("div");
        item.className = "service-item";
        item.innerHTML = `
          <div class="service-name">${serv.name}</div>
          <div class="service-status ${statusClass}">${newWait} min wait</div>
        `;
        listContainer.appendChild(item);
      });
    }, 800);
  }
};
