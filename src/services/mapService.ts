export interface MapNode {
  name: string;
  x: number;
  y: number;
  type: 'gate' | 'seating' | 'service';
  accessible?: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  dist: number;
  accessible: boolean;
}

export interface StaffResource {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'security' | 'medical' | 'volunteer';
}

export const MAP_NODES: Record<string, MapNode> = {
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
};

export const MAP_EDGES: MapEdge[] = [
  { from: "Gate_A", to: "Sec_101", dist: 120, accessible: false },
  { from: "Gate_A", to: "Sec_102", dist: 60, accessible: true },
  { from: "Gate_A", to: "Sec_103", dist: 120, accessible: false },
  
  { from: "Gate_B", to: "Sec_103", dist: 110, accessible: false },
  { from: "Gate_B", to: "Restroom_1", dist: 65, accessible: true },
  { from: "Gate_B", to: "Sec_104", dist: 110, accessible: false },
  
  { from: "Gate_C", to: "Sec_104", dist: 120, accessible: false },
  { from: "Gate_C", to: "Sec_105", dist: 60, accessible: true },
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
];

export const STAFF_RESOURCES: StaffResource[] = [
  { id: "sec-1", label: "🛡️ Security 1", x: 80, y: 180, type: "security" },
  { id: "sec-2", label: "🛡️ Security 2", x: 420, y: 220, type: "security" },
  { id: "sec-3", label: "🛡️ Security 3", x: 230, y: 70, type: "security" },
  { id: "med-1", label: "🩺 Medic A", x: 235, y: 165, type: "medical" },
  { id: "med-2", label: "🩺 Medic B", x: 265, y: 165, type: "medical" },
  { id: "vol-1", label: "🙋 Volunteer 1", x: 130, y: 90, type: "volunteer" },
  { id: "vol-2", label: "🙋 Volunteer 2", x: 370, y: 270, type: "volunteer" },
  { id: "vol-3", label: "🙋 Volunteer 3", x: 270, y: 320, type: "volunteer" }
];

export const MapService = {
  // Dijkstra pathfinder (finds shortest path by distance weights)
  findPath: (startId: string, endId: string, accessibleOnly: boolean = false): { path: string[] | null; accessible: boolean } => {
    if (!MAP_NODES[startId] || !MAP_NODES[endId]) return { path: null, accessible: false };

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const nodes = new Set<string>();

    Object.keys(MAP_NODES).forEach(nodeId => {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
      nodes.add(nodeId);
    });

    distances[startId] = 0;

    while (nodes.size > 0) {
      let smallest: string | null = null;
      nodes.forEach(nodeId => {
        if (smallest === null || distances[nodeId] < distances[smallest]) {
          smallest = nodeId;
        }
      });

      if (smallest === null || distances[smallest] === Infinity) {
        break;
      }

      if (smallest === endId) {
        break;
      }

      nodes.delete(smallest);

      const currentNode = smallest;
      const adjacentEdges = MAP_EDGES.filter(edge => {
        const connects = (edge.from === currentNode || edge.to === currentNode);
        const accessCheck = !accessibleOnly || edge.accessible;
        return connects && accessCheck;
      });

      adjacentEdges.forEach(edge => {
        const neighbor = edge.from === currentNode ? edge.to : edge.from;
        if (!nodes.has(neighbor)) return;

        const alt = distances[currentNode] + edge.dist;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = currentNode;
        }
      });
    }

    if (distances[endId] !== Infinity) {
      const path: string[] = [];
      let curr: string | null = endId;
      while (curr !== null) {
        path.unshift(curr);
        curr = previous[curr];
      }

      let isFullyAccessible = true;
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = MAP_EDGES.find(e => 
          (e.from === from && e.to === to) || (e.from === to && e.to === from)
        );
        if (!edge || !edge.accessible) {
          isFullyAccessible = false;
          break;
        }
      }

      return { path, accessible: isFullyAccessible };
    }

    if (accessibleOnly) {
      const fallback = MapService.findPath(startId, endId, false);
      return { path: fallback.path, accessible: false };
    }

    return { path: null, accessible: false };
  }
};

