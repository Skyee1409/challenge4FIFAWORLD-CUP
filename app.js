/* ArenaMind - Core Application Controller */

const ArenaApp = {
  activeView: "fan", // "fan" or "staff"

  // Start the Application
  init: function() {
    this.setupViewToggler();
    this.setupTimeWeatherWidget();
    this.renderStadiumMaps();
    this.setupRouteCalculator();
    this.setupLanguageSwitcher();

    // Initialize sub-controllers
    FanPortal.init();
    StaffOps.init();
  },

  // Setup persona view switcher
  setupViewToggler: function() {
    const btnFan = document.getElementById("btn-fan-persona");
    const btnStaff = document.getElementById("btn-staff-persona");
    const viewFan = document.getElementById("fan-view");
    const viewStaff = document.getElementById("staff-view");

    if (btnFan && btnStaff && viewFan && viewStaff) {
      btnFan.addEventListener("click", () => {
        this.switchView("fan");
      });

      btnStaff.addEventListener("click", () => {
        this.switchView("staff");
      });
    }
  },

  // Toggle layout views
  switchView: function(viewName) {
    this.activeView = viewName;
    const btnFan = document.getElementById("btn-fan-persona");
    const btnStaff = document.getElementById("btn-staff-persona");
    const viewFan = document.getElementById("fan-view");
    const viewStaff = document.getElementById("staff-view");

    if (viewName === "fan") {
      btnFan.classList.add("active");
      btnStaff.classList.remove("active");
      viewFan.classList.add("active");
      viewStaff.classList.remove("active");
    } else {
      btnFan.classList.remove("active");
      btnStaff.classList.add("active");
      viewFan.classList.remove("active");
      viewStaff.classList.add("active");
      
      // Auto-redraw incident overlays and sizing on show
      setTimeout(() => {
        StadiumMap.updateStaffIncidentMarkers();
      }, 50);
    }
  },

  // Setup digital clock updates
  setupTimeWeatherWidget: function() {
    const timeSpan = document.getElementById("widget-time");
    if (timeSpan) {
      const updateClock = () => {
        const now = new Date();
        timeSpan.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      };
      updateClock();
      setInterval(updateClock, 1000);
    }
  },

  // Render SVG map elements
  renderStadiumMaps: function() {
    const fanContainer = document.getElementById("stadium-svg-container");
    const staffContainer = document.getElementById("staff-svg-container");

    if (fanContainer) {
      fanContainer.innerHTML = StadiumMap.generateSVG(false);
    }

    if (staffContainer) {
      staffContainer.innerHTML = StadiumMap.generateSVG(true);
    }
  },

  // Wire up seat wayfinding controls
  setupRouteCalculator: function() {
    const calcBtn = document.getElementById("btn-calculate-route");
    const swapBtn = document.getElementById("btn-swap-route");
    const startSelect = document.getElementById("route-start");
    const endSelect = document.getElementById("route-end");

    if (calcBtn) {
      calcBtn.addEventListener("click", () => {
        StadiumMap.drawNavigationRoute(false);
      });
    }

    if (swapBtn && startSelect && endSelect) {
      swapBtn.addEventListener("click", () => {
        const startVal = startSelect.value;
        const endVal = endSelect.value;

        // Verify if destination is a valid gate or service to put as start
        startSelect.value = endVal;
        endSelect.value = startVal;
        
        StadiumMap.drawNavigationRoute(false);
      });
    }

    // Auto-draw initial route on loading
    setTimeout(() => {
      StadiumMap.drawNavigationRoute(false);
    }, 500);
  },

  // Language selectors triggers translation overlays
  setupLanguageSwitcher: function() {
    const langSelect = document.getElementById("select-lang");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        const lang = e.target.value;
        
        // Translate Fan AI concierges
        FanPortal.setLanguage(lang);

        // UI Header translations (simulate translation engine overlaying header components)
        const fanButtonText = document.getElementById("btn-fan-persona");
        const staffButtonText = document.getElementById("btn-staff-persona");
        const liveText = document.querySelector(".live-text");
        
        if (lang === "es") {
          if (fanButtonText) fanButtonText.innerHTML = `👤 Fan Portal`;
          if (staffButtonText) staffButtonText.innerHTML = `⚙️ Control`;
          if (liveText) liveText.innerText = "EN VIVO PARTIDO 14";
        } else if (lang === "fr") {
          if (fanButtonText) fanButtonText.innerHTML = `👤 Hub Fan`;
          if (staffButtonText) staffButtonText.innerHTML = `⚙️ Securité`;
          if (liveText) liveText.innerText = "EN DIRECT MATCH 14";
        } else {
          if (fanButtonText) fanButtonText.innerHTML = `👤 Fan Hub`;
          if (staffButtonText) staffButtonText.innerHTML = `⚙️ Command`;
          if (liveText) liveText.innerText = "LIVE MATCH 14";
        }
      });
    }
  }
};

// Start application when DOM is parsed
document.addEventListener("DOMContentLoaded", () => {
  ArenaApp.init();
});
