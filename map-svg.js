/* ArenaMind - SVG Stadium Map & Pathfinding System */

const StadiumMap = {
  // Nodes in our pathfinding graph
  nodes: {
    "Gate_A": { name: "Gate A (North Entrance)", x: 250, y: 50, type: "gate" },
    "Gate_B": { name: "Gate B (East Entrance)", x: 450, y: 200, type: "gate" },
    "Gate_C": { name: "Gate C (South Entrance)", x: 250, y: 350, type: "gate" },
    "Gate_D": { name: "Gate D (West Entrance)", x: 50, y: 200, type: "gate" },
    
    "Sec_101": { name: "Section 101 (North-West Seating)", x: 140, y: 110, type: "seating" },
    "Sec_102": { name: "Section 102 (North Seating)", x: 250, y: 95, type: "seating" },
    "Sec_103": { name: "Section 103 (North-East Seating)", x: 360, y: 110, type: "seating" },
    "Sec_104": { name: "Section 104 (South-East Seating)", x: 360, y: 290, type: "seating" },
    "Sec_105": { name: "Section 105 (Wheelchair Seating)", x: 250, y: 305, type: "seating", accessible: true },
    "Sec_106": { name: "Section 106 (South-West Seating)", x: 140, y: 290, type: "seating" },
    
    "Concession_1": { name: "Food Court (West Corridor)", x: 95, y: 150, type: "service" },
    "Restroom_1": { name: "Restrooms A (East Corridor)", x: 405, y: 150, type: "service" },
    "FirstAid": { name: "First Aid Center", x: 250, y: 160, type: "service", accessible: true }
  },

  // Bidirectional connections with weights (distance) and accessibility flags
  edges: [
    { from: "Gate_A", to: "Sec_101", dist: 120, accessible: false },
    { from: "Gate_A", to: "Sec_102", dist: 60, accessible: true }, // Elevator at Gate A
    { from: "Gate_A", to: "Sec_103", dist: 120, accessible: false },
    
    { from: "Gate_B", to: "Sec_103", dist: 110, accessible: false },
    { from: "Gate_B", to: "Restroom_1", dist: 65, accessible: true },
    { from: "Gate_B", to: "Sec_104", dist: 110, accessible: false },
    
    { from: "Gate_C", to: "Sec_104", dist: 120, accessible: false },
    { from: "Gate_C", to: "Sec_105", dist: 60, accessible: true }, // Wheelchair ramp at Gate C
    { from: "Gate_C", to: "Sec_106", dist: 120, accessible: false },
    
    { from: "Gate_D", to: "Sec_106", dist: 110, accessible: false },
    { from: "Gate_D", to: "Concession_1", dist: 65, accessible: true },
    { from: "Gate_D", to: "Sec_101", dist: 110, accessible: false },
    
    { from: "Sec_101", to: "Sec_102", dist: 110, accessible: false },
    { from: "Sec_102", to: "Sec_103", dist: 110, accessible: false },
    { from: "Sec_104", to: "Sec_105", dist: 110, accessible: true },
    { from: "Sec_105", to: "Sec_106", dist: 110, accessible: true },
    
    { from: "FirstAid", to: "Sec_102", dist: 65, accessible: true },
    { from: "FirstAid", to: "Restroom_1", dist: 155, accessible: true },
    { from: "FirstAid", to: "Concession_1", dist: 155, accessible: true },
    { from: "FirstAid", to: "Sec_105", dist: 145, accessible: true },
    
    { from: "Concession_1", to: "Sec_101", dist: 50, accessible: true },
    { from: "Restroom_1", to: "Sec_103", dist: 50, accessible: true }
  ],

  // Personnel details for the Staff Map
  staffResources: [
    { id: "sec-1", label: "🛡️ Security 1", x: 80, y: 180, type: "security" },
    { id: "sec-2", label: "🛡️ Security 2", x: 420, y: 220, type: "security" },
    { id: "sec-3", label: "🛡️ Security 3", x: 230, y: 70, type: "security" },
    { id: "med-1", label: "🩺 Medic A", x: 235, y: 165, type: "medical" },
    { id: "med-2", label: "🩺 Medic B", x: 265, y: 165, type: "medical" },
    { id: "vol-1", label: "🙋 Volunteer 1", x: 130, y: 90, type: "volunteer" },
    { id: "vol-2", label: "🙋 Volunteer 2", x: 370, y: 270, type: "volunteer" },
    { id: "vol-3", label: "🙋 Volunteer 3", x: 270, y: 320, type: "volunteer" }
  ],

  // Generate the main SVG layout string
  generateSVG: function(isStaffView = false) {
    const width = 500;
    const height = 400;

    let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#050810; display:block;">`;
    
    // Grid background indicators for techy appearance
    svg += `<defs>
      <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
      </pattern>
      <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>`;
    
    svg += `<rect width="100%" height="100%" fill="url(#map-grid)" />`;

    // Outer Stadium Oval
    svg += `<ellipse cx="250" cy="200" rx="220" ry="170" class="stadium-outline" />`;
    svg += `<ellipse cx="250" cy="200" rx="190" ry="140" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />`;

    // Seating Sections Background Rings
    svg += `<ellipse cx="250" cy="200" rx="160" ry="110" fill="none" stroke="rgba(0,114,255,0.15)" stroke-width="30" />`;

    // The Football Pitch in the center
    svg += `<rect x="185" y="150" width="130" height="100" rx="4" class="pitch-green" />`;
    // Pitch lines
    svg += `<rect x="190" y="155" width="120" height="90" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />`;
    svg += `<line x1="250" y1="155" x2="250" y2="245" stroke="rgba(255,255,255,0.3)" stroke-width="1" />`;
    svg += `<circle cx="250" cy="200" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />`;

    // Draw graph connection corridors (subtle lines)
    this.edges.forEach(edge => {
      const fromNode = this.nodes[edge.from];
      const toNode = this.nodes[edge.to];
      if (fromNode && toNode) {
        const color = edge.accessible ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.04)";
        const dash = edge.accessible ? "2 2" : "none";
        svg += `<line x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}" stroke="${color}" stroke-width="2" stroke-dasharray="${dash}" />`;
      }
    });

    // Draw seating sections
    Object.keys(this.nodes).forEach(key => {
      const node = this.nodes[key];
      if (node.type === "seating") {
        const isAccess = node.accessible;
        const colorClass = isAccess ? "seating-sec accessibility-sec" : "seating-sec";
        svg += `<circle cx="${node.x}" cy="${node.y}" r="14" class="${colorClass}" id="${isStaffView ? 'staff-' : ''}map-node-${key}" onclick="StadiumMap.selectNode('${key}', ${isStaffView})"/>`;
        svg += `<text x="${node.x}" y="${node.y + 4}" text-anchor="middle" class="map-node-label" style="font-size:7px; fill:rgba(255,255,255,0.85); pointer-events:none;">${key.split('_')[1]}</text>`;
      }
    });

    // Draw gates (entrances)
    Object.keys(this.nodes).forEach(key => {
      const node = this.nodes[key];
      if (node.type === "gate") {
        svg += `<rect x="${node.x - 12}" y="${node.y - 12}" width="24" height="24" rx="4" class="stadium-gate" id="${isStaffView ? 'staff-' : ''}map-node-${key}" onclick="StadiumMap.selectNode('${key}', ${isStaffView})"/>`;
        svg += `<text x="${node.x}" y="${node.y + 4}" text-anchor="middle" class="map-node-label" style="font-size:8px; font-weight:bold; fill:var(--neon-cyan);">${key.charAt(5)}</text>`;
      }
    });

    // Draw services (Concessions, Restrooms, FirstAid)
    Object.keys(this.nodes).forEach(key => {
      const node = this.nodes[key];
      if (node.type === "service") {
        let symbol = "🔹";
        if (key === "FirstAid") symbol = "🩺";
        if (key === "Concession_1") symbol = "🍔";
        if (key === "Restroom_1") symbol = "🚾";
        
        svg += `<circle cx="${node.x}" cy="${node.y}" r="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" id="${isStaffView ? 'staff-' : ''}map-node-${key}" onclick="StadiumMap.selectNode('${key}', ${isStaffView})" style="cursor:pointer;"/>`;
        svg += `<text x="${node.x}" y="${node.y + 4}" text-anchor="middle" class="map-node-label" style="font-size:9px;">${symbol}</text>`;
      }
    });

    // Dynamic Route Path placeholder (drawn by pathfinder)
    svg += `<polyline id="${isStaffView ? 'staff-' : ''}nav-route-line" points="" class="wayfinding-path" />`;

    // Staff Resources Overlay (Only on Staff view)
    if (isStaffView) {
      this.staffResources.forEach(res => {
        let markerColor = "#00f2fe"; // Security
        if (res.type === "medical") markerColor = "#ffbe1a";
        if (res.type === "volunteer") markerColor = "#05d5a1";
        
        svg += `<g id="resource-${res.id}" class="resource-pin" transform="translate(${res.x}, ${res.y})">
          <circle cx="0" cy="0" r="7" fill="${markerColor}" stroke="#050810" stroke-width="1.5" />
          <title>${res.label}</title>
        </g>`;
      });

      // Incident Indicators Overlay (will draw pulsing triangles at incident locations)
      svg += `<g id="staff-incidents-overlay-group"></g>`;
    }

    svg += `</svg>`;
    return svg;
  },

  // BFS Pathfinding Algorithm that supports Accessibility restriction
  findPath: function(startId, endId, accessibleOnly = false) {
    if (!this.nodes[startId] || !this.nodes[endId]) return null;

    let queue = [[startId]];
    let visited = new Set();
    visited.add(startId);

    while (queue.length > 0) {
      let path = queue.shift();
      let node = path[path.length - 1];

      if (node === endId) {
        return path;
      }

      // Find neighbors
      let neighbors = this.edges
        .filter(edge => {
          // Check connections both ways
          const matches = (edge.from === node || edge.to === node);
          // If accessibleOnly is checked, only traverse accessible edges
          const accessCheck = !accessibleOnly || edge.accessible;
          return matches && accessCheck;
        })
        .map(edge => (edge.from === node ? edge.to : edge.from));

      for (let neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          let newPath = [...path, neighbor];
          queue.push(newPath);
        }
      }
    }

    // Fallback: If no accessible path found, search again without restriction
    if (accessibleOnly) {
      return this.findPath(startId, endId, false);
    }
    return null;
  },

  // Selection trigger from map click
  selectNode: function(nodeId, isStaffView) {
    if (isStaffView) {
      // Set incident form location
      const selectLoc = document.getElementById("new-inc-loc");
      if (selectLoc) {
        for (let i = 0; i < selectLoc.options.length; i++) {
          if (selectLoc.options[i].value === nodeId) {
            selectLoc.selectedIndex = i;
            break;
          }
        }
      }
    } else {
      // Set fan destination selection
      const selectEnd = document.getElementById("route-end");
      if (selectEnd) {
        let found = false;
        for (let i = 0; i < selectEnd.options.length; i++) {
          if (selectEnd.options[i].value === nodeId) {
            selectEnd.selectedIndex = i;
            found = true;
            break;
          }
        }
        // Switch start and end if same
        const selectStart = document.getElementById("route-start");
        if (found && selectStart && selectStart.value === nodeId) {
          selectStart.selectedIndex = (selectStart.selectedIndex + 1) % selectStart.options.length;
        }
        // Calculate route automatically
        this.drawNavigationRoute(false);
      }
    }
  },

  // Calculate and draw the navigational routing lines on the SVG
  drawNavigationRoute: function(isStaffView = false) {
    const prefix = isStaffView ? "staff-" : "";
    const startSelect = document.getElementById(isStaffView ? "new-inc-loc" : "route-start");
    const endSelect = document.getElementById(isStaffView ? "new-inc-loc" : "route-end"); // Wait, staff does dispatch routing
    
    let startNodeId, endNodeId;
    let accessibilityChecked = false;

    if (!isStaffView) {
      startNodeId = document.getElementById("route-start").value;
      endNodeId = document.getElementById("route-end").value;
      accessibilityChecked = document.getElementById("toggle-accessibility").checked;
    } else {
      // For staff, we path from First Aid (medical hub) or closest resource to the incident
      startNodeId = "FirstAid";
      const selectedItem = document.querySelector(".incident-item.selected");
      if (selectedItem) {
        const incId = selectedItem.getAttribute("data-id");
        const inc = ARENA_DATA.incidents.find(i => i.id === incId);
        if (inc) {
          endNodeId = inc.loc;
        }
      }
    }

    if (!startNodeId || !endNodeId) return;

    const path = this.findPath(startNodeId, endNodeId, accessibilityChecked);
    const polyline = document.getElementById(`${prefix}nav-route-line`);

    if (path && polyline) {
      let pointsStr = path.map(nodeId => {
        const node = this.nodes[nodeId];
        return `${node.x},${node.y}`;
      }).join(" ");

      polyline.setAttribute("points", pointsStr);
      
      // Set styling
      if (accessibilityChecked && !isStaffView) {
        polyline.classList.add("accessible");
      } else {
        polyline.classList.remove("accessible");
      }
      
      // Flash destination node
      const destCircle = document.getElementById(`${prefix}map-node-${endNodeId}`);
      if (destCircle) {
        destCircle.style.animation = "pulse 1.5s infinite";
        setTimeout(() => {
          destCircle.style.animation = "";
        }, 6000);
      }
    } else if (polyline) {
      polyline.setAttribute("points", "");
    }
  },

  // Set active incident overlays on staff map
  updateStaffIncidentMarkers: function() {
    const group = document.getElementById("staff-incidents-overlay-group");
    if (!group) return;

    group.innerHTML = ""; // Clear existing markers

    ARENA_DATA.incidents.forEach(inc => {
      if (inc.status === "resolved") return; // Don't show resolved incidents on map
      
      const node = this.nodes[inc.loc];
      if (!node) return;

      const color = inc.status === "pending" ? "var(--neon-magenta)" : "var(--neon-orange)";
      
      // Draw pulsing triangular alert icon
      let triangle = `<g class="incident-marker" style="cursor:pointer;" onclick="StaffOps.selectIncidentById('${inc.id}')">
        <polygon points="${node.x},${node.y - 12} ${node.x - 10},${node.y + 6} ${node.x + 10},${node.y + 6}" 
                 fill="${color}" stroke="#050810" stroke-width="1.5" filter="url(#glow-red)" />
        <text x="${node.x}" y="${node.y + 3}" text-anchor="middle" font-family="Outfit" font-size="9px" font-weight="900" fill="white">!</text>
        <circle cx="${node.x}" cy="${node.y + 2}" r="15" fill="none" stroke="${color}" stroke-width="1.5" style="animation: pulse 1.8s infinite;">
          <animate attributeName="r" values="5;20" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>`;
      
      group.innerHTML += triangle;
    });
  }
};
