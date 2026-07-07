/* ArenaMind - Staff Command Center & Multi-Agent Simulator */

const StaffOps = {
  selectedIncidentId: null,
  activeFilters: {
    security: true,
    medical: true,
    volunteer: true,
    incident: true
  },

  // Initialize Command Center
  init: function() {
    this.setupEventListeners();
    this.renderIncidents();
    StadiumMap.updateStaffIncidentMarkers();
  },

  // Setup Event Listeners
  setupEventListeners: function() {
    // Incident Report Submit
    const btnSubmit = document.getElementById("btn-submit-incident");
    if (btnSubmit) {
      btnSubmit.addEventListener("click", () => this.handleNewIncidentSubmit());
    }

    // Simulation trigger
    const btnSim = document.getElementById("btn-trigger-simulation");
    if (btnSim) {
      btnSim.addEventListener("click", () => this.runSimulation());
    }

    // Resource Map Filtering
    const chkSec = document.getElementById("show-security");
    if (chkSec) {
      chkSec.addEventListener("change", (e) => this.toggleResourceFilter("security", e.target.checked));
    }
    const chkMed = document.getElementById("show-medical");
    if (chkMed) {
      chkMed.addEventListener("change", (e) => this.toggleResourceFilter("medical", e.target.checked));
    }
    const chkVol = document.getElementById("show-volunteers");
    if (chkVol) {
      chkVol.addEventListener("change", (e) => this.toggleResourceFilter("volunteer", e.target.checked));
    }
    const chkInc = document.getElementById("show-incidents");
    if (chkInc) {
      chkInc.addEventListener("change", (e) => this.toggleResourceFilter("incident", e.target.checked));
    }
  },

  // Render operations incident feed list
  renderIncidents: function() {
    const container = document.getElementById("incident-feed-list");
    if (!container) return;

    container.innerHTML = "";

    let activeCount = 0;

    ARENA_DATA.incidents.forEach(inc => {
      if (inc.status !== "resolved") activeCount++;

      const div = document.createElement("div");
      div.className = `incident-item ${this.selectedIncidentId === inc.id ? 'selected' : ''}`;
      div.setAttribute("data-id", inc.id);
      div.addEventListener("click", () => this.selectIncidentById(inc.id));

      let typeEmoji = "⚠️";
      if (inc.type === "Medical") typeEmoji = "🩺";
      if (inc.type === "Maintenance") typeEmoji = "🧹";
      if (inc.type === "Security") typeEmoji = "🛡️";
      if (inc.type === "Hardware") typeEmoji = "⚙️";

      div.innerHTML = `
        <div class="incident-meta">
          <span class="inc-type">${typeEmoji} ${inc.type} Report</span>
          <span class="inc-time">${inc.time}</span>
        </div>
        <div class="inc-desc">${inc.desc}</div>
        <div class="inc-status-row">
          <span class="inc-loc">📍 Location: ${inc.loc.replace('_', ' ')}</span>
          <span class="inc-status-lbl ${inc.status}">${inc.status}</span>
        </div>
      `;

      container.appendChild(div);
    });

    // Update Counter badge
    const badge = document.getElementById("active-incidents-count");
    if (badge) {
      badge.innerText = activeCount;
    }
  },

  // Select incident to display details and pathfind route
  selectIncidentById: function(incId) {
    this.selectedIncidentId = incId;
    this.renderIncidents();

    const inc = ARENA_DATA.incidents.find(i => i.id === incId);
    const dispatchPanel = document.getElementById("dispatch-rec-body");
    
    if (inc && dispatchPanel) {
      let formattedRec = inc.recommendation
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");

      let buttonHtml = "";
      if (inc.status === "pending") {
        buttonHtml = `
          <div class="dispatch-actions">
            <button class="btn-action-primary" onclick="StaffOps.dispatchResources('${inc.id}')">Approve & Dispatch Personnel</button>
            <button class="btn-action" style="background:rgba(255, 42, 95, 0.05); border-color:var(--neon-magenta); color:var(--neon-magenta);" onclick="StaffOps.resolveIncident('${inc.id}')">Resolve Alert</button>
          </div>
        `;
      } else if (inc.status === "dispatched") {
        buttonHtml = `
          <div class="dispatch-actions">
            <button class="btn-action-primary" style="background:var(--neon-green); box-shadow: 0 0 10px var(--neon-green-glow);" onclick="StaffOps.resolveIncident('${inc.id}')">Resolve Alert</button>
          </div>
        `;
      }

      dispatchPanel.innerHTML = `
        <p>${formattedRec}</p>
        ${buttonHtml}
      `;

      // Trigger map drawing route to this incident
      StadiumMap.drawNavigationRoute(true);
    }
  },

  // Submit and log new field incidents
  handleNewIncidentSubmit: function() {
    const selectType = document.getElementById("new-inc-type");
    const selectLoc = document.getElementById("new-inc-loc");
    const inputDesc = document.getElementById("new-inc-desc");

    if (!selectType || !selectLoc || !inputDesc) return;

    const desc = inputDesc.value.trim();
    if (!desc) {
      alert("Please provide incident descriptions details.");
      return;
    }

    const type = selectType.value;
    const loc = selectLoc.value;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `inc-${Date.now().toString().slice(-4)}`;

    // Simulated LLM dispatch recommendation builder
    let aiRec = "";
    if (type === "Medical") {
      aiRec = `🩺 **GenAI Dispatch Recommendation**:\n1. **Dispatch emergency medical team** from center hub to **${loc.replace('_', ' ')}**.\n2. Volunteer supervisor to make room clearance at site.\n\n*Urgent Action Required.*`;
    } else if (type === "Crowd") {
      aiRec = `🛡️ **GenAI Dispatch Recommendation**:\n1. **Deploy crowd monitors** to manage pedestrian corridors.\n2. Open safety doors at **${loc.replace('_', ' ')}** exit points.`;
    } else if (type === "Security") {
      aiRec = `🛡️ **GenAI Dispatch Recommendation**:\n1. **Alert Security officers** near Gate corridors.\n2. Secure section border boundaries near **${loc.replace('_', ' ')}**.`;
    } else {
      aiRec = `⚙️ **GenAI Dispatch Recommendation**:\n1. **Dispatch IT technician** to review connectivity at **${loc.replace('_', ' ')}**.\n2. Manual visual overrides active.`;
    }

    const newIncident = {
      id: id,
      type: type,
      desc: desc,
      loc: loc,
      time: time,
      status: "pending",
      recommendation: aiRec
    };

    ARENA_DATA.incidents.unshift(newIncident);
    inputDesc.value = "";

    this.renderIncidents();
    StadiumMap.updateStaffIncidentMarkers();
    
    // Automatically select the newly logged incident
    this.selectIncidentById(id);
  },

  // Dispatch resources to an incident (update states, animate map changes)
  dispatchResources: function(incId) {
    const inc = ARENA_DATA.incidents.find(i => i.id === incId);
    if (!inc) return;

    inc.status = "dispatched";
    inc.recommendation = `🚀 **Resources Dispatched**\nField team is en-route to **${inc.loc.replace('_', ' ')}**.\n\n*Deployment log: Security unit dispatched at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.*`;
    
    this.selectIncidentById(incId);
    StadiumMap.updateStaffIncidentMarkers();

    // Trigger visual flash of dispatch resource moving
    const startNode = StadiumMap.nodes["FirstAid"];
    const targetNode = StadiumMap.nodes[inc.loc];
    
    // Animate medic pin movement or flash target
    const pulseCircle = document.getElementById(`staff-map-node-${inc.loc}`);
    if (pulseCircle) {
      pulseCircle.style.animation = "pulse 0.5s infinite";
      setTimeout(() => {
        pulseCircle.style.animation = "";
      }, 5000);
    }
  },

  // Resolve incident (remove alerts, clear paths)
  resolveIncident: function(incId) {
    const inc = ARENA_DATA.incidents.find(i => i.id === incId);
    if (!inc) return;

    inc.status = "resolved";
    this.selectedIncidentId = null;
    this.renderIncidents();
    StadiumMap.updateStaffIncidentMarkers();

    // Clear route path
    const polyline = document.getElementById("staff-nav-route-line");
    if (polyline) polyline.setAttribute("points", "");

    // Clear dispatch recommendation panel
    const dispatchPanel = document.getElementById("dispatch-rec-body");
    if (dispatchPanel) {
      dispatchPanel.innerHTML = `<p class="placeholder-text">Select an active incident from the feed above to generate GenAI dispatch recommendations.</p>`;
    }
  },

  // Toggle resource pins visibility on Map
  toggleResourceFilter: function(type, isVisible) {
    this.activeFilters[type] = isVisible;

    // Toggle specific pins visibility on map
    if (type === "incident") {
      const overlay = document.getElementById("staff-incidents-overlay-group");
      if (overlay) {
        overlay.style.display = isVisible ? "block" : "none";
      }
    } else {
      // Security, Medical, Volunteer pins
      StadiumMap.staffResources.forEach(res => {
        if (res.type === type) {
          const pin = document.getElementById(`resource-${res.id}`);
          if (pin) {
            pin.style.display = isVisible ? "block" : "none";
          }
        }
      });
    }
  },

  // Multi-Agent Simulation Sandbox Trigger
  runSimulation: function() {
    const select = document.getElementById("select-simulation-scenario");
    const statusBox = document.getElementById("sim-status-box");
    const resultsBox = document.getElementById("sim-results");
    const logFeed = document.getElementById("sim-agent-logs");
    const impactText = document.getElementById("sim-impact-assessment");

    if (!select || !statusBox || !resultsBox || !logFeed || !impactText) return;

    const scenarioKey = select.value;
    const scenario = ARENA_DATA.simulations[scenarioKey];

    if (!scenario) return;

    // 1. Hide current results, show loading status
    resultsBox.classList.add("hidden");
    statusBox.classList.remove("hidden");
    logFeed.innerHTML = "";

    // 2. Delay to represent simulation analysis calculations
    setTimeout(() => {
      statusBox.classList.add("hidden");
      resultsBox.classList.remove("hidden");

      // Set Impact risk summary text
      let formattedImpact = scenario.impact
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
      impactText.innerHTML = formattedImpact;

      // 3. Sequentially print agent coordination actions one-by-one to represent dialogue streams
      scenario.actions.forEach((act, idx) => {
        setTimeout(() => {
          const item = document.createElement("div");
          item.className = `agent-log-item ${act.role}`;
          
          item.innerHTML = `
            <div class="agent-log-header ${act.role}">
              <span class="agent-name">🤖 ${act.agent}</span>
              <span class="agent-time">Active</span>
            </div>
            <div class="agent-action-taken">${act.text}</div>
          `;
          
          logFeed.appendChild(item);
          logFeed.scrollTop = logFeed.scrollHeight;
        }, idx * 1000); // 1-second interval between agent actions
      });
    }, 1500);
  }
};
