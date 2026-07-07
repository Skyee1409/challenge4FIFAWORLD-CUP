import { ARENA_DATA } from '../data/arenaData';

export const AIService = {
  // Query matching engine representing the GenAI concierge
  resolveConciergeQuery: (query: string, lang: string): string => {
    const cleaned = query.toLowerCase().trim();
    const db = ARENA_DATA.qaDatabase[lang] || ARENA_DATA.qaDatabase['en'];

    // 1. Search semantic keywords
    for (const qa of db) {
      for (const keyword of qa.keywords) {
        if (cleaned.includes(keyword)) {
          return qa.answer;
        }
      }
    }

    // 2. Multilingual translation commands
    if (cleaned.includes("translate") || cleaned.includes("traduc")) {
      return `🗣️ **Translation Hub**:\nHere is your translation to Spanish:\n\n*"¿Dónde está la estación médica más cercana?"* (Where is the nearest medical station?)\n\n*Press the audio speaker button on this bubble to hear the local pronunciation!*`;
    }

    // 3. Fallback simulated LLM response
    return `🤖 **ArenaMind GenAI Assistant**:\nI analyzed your query: *"${query}"*. \n\nWhile I don't have direct records matching that in the stadium handbook, here is what my operational database recommends:\n- Check the **Gate A Information Hub** for lost items or specific ticketing concerns.\n- Ask any roaming steward (in **Neon Green vests**) who have real-time links to stadium safety.\n- For transit issues, visit the Gate C Shuttles desk.\n\nCan I help you calculate a map route or show concession wait times instead?`;
  },

  // Generative dispatch builder
  generateDispatchRecommendation: (type: string, loc: string): string => {
    const cleanLoc = loc.replace('_', ' ');
    switch (type) {
      case 'Medical':
        return `🩺 **GenAI Dispatch Recommendation**:\n1. **Alert Medical Responder Team 2** (located at Central Hub) to deploy to **${cleanLoc}**.\n2. **Guide Volunteer steward** in **${cleanLoc}** to provide water and stay with the attendee.\n3. **Prepare elevators** near Gate B to be locked for medical evacuation priority if required.\n\n*Urgent Action Required.*`;
      case 'Crowd':
        return `🛡️ **GenAI Dispatch Recommendation**:\n1. **Deploy crowd control barriers** at **${cleanLoc}** to manage pedestrian corridors.\n2. **Instruct exit queue volunteers** to redirect traffic and guide fans to South gates where queues are minimal.`;
      case 'Security':
        return `🛡️ **GenAI Dispatch Recommendation**:\n1. **Alert Security officers** near **${cleanLoc}** to investigate potential hazard.\n2. Secure section border boundaries near **${cleanLoc}** to avoid crowd crush.`;
      case 'Maintenance':
        return `🧹 **GenAI Dispatch Recommendation**:\n1. **Dispatch cleaning team** (Sanitation Team-B) to **${cleanLoc}**.\n2. **Notify volunteer stewards** to place physical warning cones and guide fans around the spill.`;
      default:
        return `⚙️ **GenAI Dispatch Recommendation**:\n1. **Dispatch hardware technician** to review scanner nodes at **${cleanLoc}**.\n2. **Broadcast message to Gate volunteers** to switch to manual screen validation if queues build.`;
    }
  }
};
