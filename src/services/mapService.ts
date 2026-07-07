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
  // BFS pathfinder
  findPath: (startId: string, endId: string, accessibleOnly: boolean = false): string[] | null => {
    if (!MAP_NODES[startId] || !MAP_NODES[endId]) return null;

    const queue: string[][] = [[startId]];
    const visited = new Set<string>();
    visited.add(startId);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];

      if (node === endId) {
        return path;
      }

      // Filter adjacent edges
      const neighbors = MAP_EDGES.filter(edge => {
        const connects = (edge.from === node || edge.to === node);
        const accessCheck = !accessibleOnly || edge.accessible;
        return connects && accessCheck;
      }).map(edge => (edge.from === node ? edge.to : edge.from));

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    // Fallback: search without accessibility constraint if not found
    if (accessibleOnly) {
      return MapService.findPath(startId, endId, false);
    }
    
    return null;
  }
};
