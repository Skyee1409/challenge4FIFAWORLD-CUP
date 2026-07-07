import { ARENA_DATA, SimulationScenario } from '../data/arenaData';

export const SimulationService = {
  // Fetch scenario data by key
  getScenario: (key: string): SimulationScenario | undefined => {
    return ARENA_DATA.simulations[key];
  }
};
