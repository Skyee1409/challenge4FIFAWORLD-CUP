export interface Match {
  id: number;
  home: string;
  away: string;
  scoreHome: number;
  scoreAway: number;
  venue: string;
  time: string;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
}

export interface ServiceItem {
  id: string;
  name: string;
  wait: number;
  density: 'low' | 'medium' | 'high';
}

export interface EcoAction {
  id: string;
  label: string;
  points: number;
}

export interface EcoReward {
  id: string;
  name: string;
  cost: number;
}

export interface QAItem {
  keywords: string[];
  answer: string;
}

export interface Incident {
  id: string;
  type: 'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware';
  desc: string;
  loc: string;
  time: string;
  status: 'pending' | 'dispatched' | 'resolved';
  recommendation: string;
}

export interface SimAction {
  agent: string;
  role: 'broadcast' | 'transit' | 'crowd';
  text: string;
}

export interface SimulationScenario {
  name: string;
  impact: string;
  actions: SimAction[];
}

export interface ArenaDataType {
  matches: Match[];
  services: ServiceItem[];
  ecoActions: EcoAction[];
  ecoRewards: EcoReward[];
  qaDatabase: Record<string, QAItem[]>;
  incidents: Incident[];
  simulations: Record<string, SimulationScenario>;
}

export const ARENA_DATA: ArenaDataType = {
  matches: [
    { id: 14, home: "MEXICO", away: "USA", scoreHome: 2, scoreAway: 1, venue: "Estadio Azteca", time: "76'", status: "LIVE" },
    { id: 15, home: "CANADA", away: "MOROCCO", scoreHome: 0, scoreAway: 0, venue: "BC Place", time: "18:00", status: "UPCOMING" },
    { id: 16, home: "ARGENTINA", away: "SPAIN", scoreHome: 3, scoreAway: 2, venue: "MetLife Stadium", time: "FT", status: "COMPLETED" }
  ],

  services: [
    { id: "Concession_B", name: "🍔 Concessions (Gate B)", wait: 12, density: "medium" },
    { id: "Restroom_104", name: "🚾 Restrooms (Section 104)", wait: 2, density: "low" },
    { id: "Transit_Station", name: "🚊 Subway Shuttle Station", wait: 22, density: "high" },
    { id: "Ticket_GateA", name: "🎟️ Ticket Office (Gate A)", wait: 1, density: "low" },
    { id: "First_Aid_Hub", name: "🩺 First Aid Hub (Center)", wait: 0, density: "low" }
  ],

  ecoActions: [
    { id: "chk-transit", label: "Arrived via public transit (Subway/Bus)", points: 100 },
    { id: "chk-bottle", label: "Recycled plastic cup at smart bin", points: 50 },
    { id: "chk-food", label: "Bought plant-based concession meal", points: 50 }
  ],

  ecoRewards: [
    { id: "claim-cup", name: "🥤 Free Eco Cup", cost: 200 },
    { id: "claim-merch", name: "🧣 15% Off Scarf", cost: 400 }
  ],

  qaDatabase: {
    en: [
      {
        keywords: ["access", "wheelchair", "disabled", "handicap", "ramp", "elevator", "105"],
        answer: "♿ **Accessibility Guide**: Estadio Azteca provides full step-free accessibility. Elevators are located at Gates A & C. **Section 105** is a dedicated wheelchair-accessible viewing platform. An accessible pathway has been calculated on your map (marked in Green) which utilizes the elevator corridor near Gate B."
      },
      {
        keywords: ["transit", "transport", "bus", "subway", "metro", "car", "parking", "shuttle"],
        answer: "🌱 **Transit & Transportation**: The greenest way to travel is the Metro Subway (Line 2, Azteca Station). Shuttles run every 5 minutes from Gate C directly to the transit hub. Taking public transport reduces your carbon footprint by 82% and earns you **100 Eco Points**! Use the Eco Checklist in your panel to claim rewards."
      },
      {
        keywords: ["food", "concession", "eat", "drink", "beer", "water", "hungry", "hotdog", "soda"],
        answer: "🌭 **Concessions & Dining**: Standard concessions are open at all Gates. For shorter wait times, we recommend the Food Court near Gate D. To support sustainability, try the **Plant-based Avocado Wrap** at Concession 1 (Gate A Corridor) to reduce packaging waste and earn **50 Eco Points**."
      },
      {
        keywords: ["sustainability", "eco", "green", "points", "recycle", "reward", "carbon"],
        answer: "♻️ **Sustainability Program**: Earn Eco Points by adopting sustainable behaviors like recycling bottles (+50 XP), using public transit (+100 XP), or choosing vegan food (+50 XP). Points can be redeemed in the Green Tracker panel for rewards like a **Free Eco Cup** or a **15% discount on World Cup Merch**."
      },
      {
        keywords: ["gate", "ticket", "enter", "exit", "admission", "scan"],
        answer: "🎟️ **Gate Access**: Gates open 3 hours prior to kickoff. Ensure your digital ticket barcode is loaded in your mobile app before reaching the gate to speed up queueing. Check wait times in the 'Live Services Density' panel."
      },
      {
        keywords: ["medical", "doctor", "emergency", "hurt", "injury", "first aid", "dizzy", "sick"],
        answer: "🩺 **Medical Assistance**: The primary First Aid Hub is located in the Central Ring (Level 1). There are also roaming volunteers in green jackets equipped with basic medical kits. In case of emergency, contact the nearest volunteer immediately or ask us to dispatch assistance."
      }
    ],
    es: [
      {
        keywords: ["acces", "silla", "rueda", "discap", "rampa", "elevador", "105"],
        answer: "♿ **Guía de Accesibilidad**: El Estadio Azteca ofrece accesibilidad completa sin escalones. Los elevadores se ubican en las Puertas A y C. La **Sección 105** es una plataforma de visualización dedicada para sillas de ruedas. Se ha trazado una ruta accesible en verde en su mapa que utiliza el elevador de la Puerta B."
      },
      {
        keywords: ["transit", "transporte", "autobus", "metro", "coche", "estaciona", "camion"],
        answer: "🌱 **Tránsito y Transporte**: La opción más ecológica es la estación de Metro Azteca (Línea 2). Los autobuses lanzadera salen cada 5 minutos desde la Puerta C directo al centro de transporte. ¡Usar transporte público reduce su huella en un 82% y otorga **100 Puntos Eco**!"
      },
      {
        keywords: ["comida", "concesion", "comer", "beber", "cerveza", "hambre", "agua"],
        answer: "🌭 **Concesiones y Alimentos**: Las concesiones estándar están abiertas en todas las puertas. Recomendamos el patio de comidas en la Puerta D para tiempos de espera menores. Pruebe el **Wrap de Aguacate Vegano** en la Puerta A para sumar **50 Puntos Eco**."
      },
      {
        keywords: ["sustentab", "eco", "verde", "puntos", "recicla", "premio", "carbono"],
        answer: "♻️ **Programa de Sustentabilidad**: Acumule puntos por reciclar botellas (+50 XP), usar transporte público (+100 XP) o consumir alimentos veganos (+50 XP). Canjee sus puntos por un **Vaso Ecológico gratis** o **15% de descuento en Tienda**."
      }
    ],
    fr: [
      {
        keywords: ["acces", "fauteuil", "handicap", "rampe", "ascenseur", "105"],
        answer: "♿ **Guide d'Accessibilité**: Le stade Azteca offre une accessibilité totale sans marches. Les ascenseurs sont situés aux Portes A & C. La **Section 105** est une plateforme d'observation dédiée aux fauteuils roulants. Une rampe d'accès verte est affichée sur votre carte."
      },
      {
        keywords: ["transit", "transport", "bus", "metro", "voiture", "parking", "navette"],
        answer: "🌱 **Transports**: Le moyen le plus écologique est le métro (Ligne 2, Station Azteca). Les navettes partent toutes les 5 minutes de la Porte C vers le pôle de transit. Utiliser le métro réduit votre empreinte carbone et vous rapporte **100 Points Éco**!"
      }
    ],
    pt: [
      {
        keywords: ["acess", "cadeira", "rodas", "rampa", "elevador", "105"],
        answer: "♿ **Guia de Acessibilidade**: O Estádio Azteca oferece acessibilidade total sem degraus. Os elevadores ficam nos Portões A e C. A **Seção 105** é exclusiva para cadeirantes. Uma rota de acesso verde está destacada no seu mapa."
      },
      {
        keywords: ["transit", "transporte", "onibus", "metro", "carro", "estaciona", "shuttle"],
        answer: "🌱 **Transporte**: A opção mais verde é o metrô (Linha 2, Estação Azteca). Ônibus saem a cada 5 minutos do Portão C. Utilizar o transporte público reduz sua pegada e garante **100 Pontos Eco**!"
      }
    ]
  },

  incidents: [
    {
      id: "inc-101",
      type: "Hardware",
      desc: "Gate B ticket scanner reading outage. Volunteers reporting high queue building.",
      loc: "Gate_B",
      time: "12:20 PM",
      status: "pending",
      recommendation: "🛠️ **GenAI Dispatch Recommendation**:\n1. **Redeploy hardware technician** (Unit Tech-04) from First Aid corridor to Gate B.\n2. **Broadcast message to Gate B volunteers** to switch to manual screen validation for general tickets.\n3. **Redirect queue** overflow to adjacent Gate A scanners.\n\n*Estimated resolution time: 10 minutes.*"
    },
    {
      id: "inc-102",
      type: "Maintenance",
      desc: "Water spill reported on stairs at Section 103 entrance. Slip hazard warning.",
      loc: "Sec_103",
      time: "12:31 PM",
      status: "pending",
      recommendation: "🧹 **GenAI Dispatch Recommendation**:\n1. **Dispatch cleaning team** (Sanitation Team-B) to Section 103 corridor entrance.\n2. **Notify Section 103 volunteer stewards** to place physical warning cones and guide fans around the spill.\n\n*Estimated resolution time: 5 minutes.*"
    },
    {
      id: "inc-103",
      type: "Medical",
      desc: "Attendee feeling severe dizziness and faintness near wheelchair row in Section 105.",
      loc: "Sec_105",
      time: "12:34 PM",
      status: "pending",
      recommendation: "🩺 **GenAI Dispatch Recommendation**:\n1. **Alert Medical Responder Team 2** (located at Central Hub) to deploy to Section 105, Row W.\n2. **Guide Volunteer steward** in Section 105 to provide water and stay with the attendee.\n3. **Prepare elevators** near Gate B to be locked for medical evacuation priority if required.\n\n*Urgent priority: Deploying Team 2.*"
    }
  ],

  simulations: {
    thunderstorm: {
      name: "Severe Thunderstorm Warning",
      impact: "⚡ **High Risk Level**: Severe lightning forecast within 10 km of Estadio Azteca. Risk of outdoor crowd panic, wet surfaces creating slipping hazards, and potential disruption to transit services.",
      actions: [
        {
          agent: "Broadcast Agent",
          role: "broadcast",
          text: "📢 Sent emergency multilingual push notification: *'Weather warning: Please move inside covered concourses immediately. Stand clear of open roof areas.'*"
        },
        {
          agent: "Transit Agent",
          role: "transit",
          text: "🚌 Contacted Mexico City Transit authority. Deployed 15 additional covered shuttle buses to standby in covered tunnels. Extensively delayed outdoor pedestrian crossings."
        },
        {
          agent: "Crowd Control Agent",
          role: "crowd",
          text: "🛡️ Commenced phase-1 redirect. Volunteers redirected fans from open plazas into Gate B and C inner hallways. Elevated security presence near Gate entrance thresholds."
        }
      ]
    },
    subway_delay: {
      name: "Metro Subway Power Failure",
      impact: "🚇 **Critical Capacity Risk**: Azteca Station Subway line shut down due to municipal grid outage. Over 25,000 outgoing fans will lose primary transit source post-match.",
      actions: [
        {
          agent: "Broadcast Agent",
          role: "broadcast",
          text: "📢 Displayed subway shutdown announcements on all jumbo-screens and stadium video walls. Advised fans to enjoy post-match celebrations in the plaza to stagger exits."
        },
        {
          agent: "Transit Agent",
          role: "transit",
          text: "🚌 Activated Emergency Shuttle Fleet. Rerouted 45 city buses to Gate C transit hub. Opened free parking exits to encourage carpooling."
        },
        {
          agent: "Crowd Control Agent",
          role: "crowd",
          text: "🛡️ Stewards deployed crowd control barriers around Gates C & D exit lanes to control fan outflow speed and avoid bottleneck crushing."
        }
      ]
    },
    gate_card_reader: {
      name: "Gate B Ticket Scanner Outage",
      impact: "🎟️ **Medium Operational Risk**: Main optical fibers disrupted at Gate B. Seating access delayed for 4,000 fans currently in queue.",
      actions: [
        {
          agent: "Broadcast Agent",
          role: "broadcast",
          text: "📢 Updated outdoor digital display board: *'Gate B experiencing delay. Access available at Gate A and C.'*"
        },
        {
          agent: "Crowd Control Agent",
          role: "crowd",
          text: "🛡️ Instructed entry queue volunteers to inspect digital tickets visually. Authorized manual ticket barcode entry via offline mobile handsets."
        }
      ]
    },
    crowd_rush: {
      name: "Post-match Crowd Congestion",
      impact: "📣 **High Density Alert**: Match concluded. High congestion developing at Gate A (North) and Gate D (West). Restrooms and concessions corridors showing extreme capacity levels.",
      actions: [
        {
          agent: "Broadcast Agent",
          role: "broadcast",
          text: "📢 Programmed stadium audio guides to direct fans to South gates (Gate C) where queues are minimal."
        },
        {
          agent: "Crowd Control Agent",
          role: "crowd",
          text: "🛡️ Activated one-way exit systems in Section corridors. Directed venue safety staff to open auxiliary exit gates next to Gate D."
        },
        {
          agent: "Transit Agent",
          role: "transit",
          text: "🚌 Coordinated with transport dispatch to dispatch buses in high-frequency rotations from the transit hub."
        }
      ]
    }
  }
};
