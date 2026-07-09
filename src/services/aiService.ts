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
    const FALLBACKS: Record<string, string> = {
      en: `🤖 **ArenaMind GenAI Assistant**:\nI analyzed your query: *"{query}"*. \n\nWhile I don't have direct records matching that in the stadium handbook, here is what my operational database recommends:\n- Check the **Gate A Information Hub** for lost items or specific ticketing concerns.\n- Ask any roaming steward (in **Neon Green vests**) who have real-time links to stadium safety.\n- For transit issues, visit the Gate C Shuttles desk.\n\nCan I help you calculate a map route or show concession wait times instead?`,
      es: `🤖 **Asistente de IA ArenaMind**:\nAnalicé tu consulta: *"{query}"*. \n\nAunque no tengo registros directos sobre eso en el manual del estadio, esto es lo que recomienda mi base de datos operativa:\n- Visita el **Centro de Información de la Puerta A** para objetos perdidos o dudas de boletos.\n- Pregunta a cualquier auxiliar itinerante (con **chaleco verde neón**) que tenga comunicación en tiempo real con seguridad.\n- Para temas de tránsito, acude al mostrador de Shuttles en la Puerta C.\n\n¿Te ayudo a calcular una ruta en el mapa o ver los tiempos de espera de alimentos?`,
      fr: `🤖 **Assistant ArenaMind GenAI**:\nJ'ai analysé votre demande : *"{query}"*. \n\nBien que je n'aie pas de données directes dans le guide du stade, voici ce que ma base de données recommande :\n- Visitez le **Point Information Porte A** pour les objets trouvés ou les billets.\n- Adressez-vous à un agent (en **gilet vert néon**) connecté en temps réel avec la sécurité.\n- Pour les transports, allez au guichet Navettes de la Porte C.\n\nPuis-je vous aider à calculer un itinéraire ou afficher les temps d'attente aux concessions ?`,
      pt: `🤖 **Assistente GenAI ArenaMind**:\nAnalisei sua pergunta: *"{query}"*. \n\nEmbora eu não tenha registros diretos no guia do estádio, eis o que o banco de dados operacional sugere:\n- Vá ao **Ponto de Informações do Portão A** para achados e perdidos ou ingressos.\n- Pergunte a um orientador de colete **verde limão**, que tem contato direto com a segurança.\n- Para transporte, vá ao balcão de Shuttles no Portão C.\n\nPosso ajudar a traçar uma rota no mapa ou ver os tempos de espera das lanchonetes ?`
    };
    const fallbackTemplate = FALLBACKS[lang] || FALLBACKS['en'];
    return fallbackTemplate.replace("{query}", query);
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
