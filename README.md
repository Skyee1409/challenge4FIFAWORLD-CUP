# ArenaMind: FIFA World Cup 2026 Stadium Operations & Fan Experience Command Center

**ArenaMind** is a premium, GenAI-enabled stadium operations and fan experience dashboard designed for the FIFA World Cup 2026. Built with modern, glassmorphic design aesthetics, it serves as a dual-portal application for both stadium attendees (Fans) and tournament operations teams (Venue Staff/Volunteers).

---

## 🌟 Key Features

### 1. Fan Experience Hub
*   **GenAI Assistant Concierge**: A multilingual chat bot that answers stadium questions (accessibility, transit, concessions) and translates commands. It features realistic text streaming typewriter animations and simulated speech dictation/playback.
*   **SVG Seat Navigation Wayfinding**: Interactive stadium map layout with pathfinding calculations. Fans can select their gate and destination block to highlight the route.
*   **♿ Accessible Pathing**: A dedicated toggle that charts step-free routes (using elevators and wheelchair-accessible ramps) highlighted in green.
*   **Green Goals Tracker**: Gamified carbon footprint tracker awarding Eco Points (XP) for sustainable actions (taking public transit, recycling smart bins, ordering plant-based meals) to redeem reward coupons.
*   **Live Services Wait Times**: Real-time crowd congestion indicators estimating queues at concessions, restrooms, and transit shuttles.

### 2. Operations Command Center
*   **Incident Feed Manager**: Real-time queue displaying safety, medical, maintenance, and hardware incident reports logged by volunteers on the field.
*   **Smart GenAI Dispatch Copilot**: Automatically evaluates active incident details and prints structured step-by-step dispatch guidelines.
*   **Multi-Agent Scenario Simulator**: A sandbox that allows managers to run predictive event simulations (e.g. Severe Thunderstorm, Subway Power Delay). Spawns coordination updates in parallel from a **Broadcast Agent**, **Transit Agent**, and **Crowd Control Agent**.
*   **Resource Tracker Maps**: Visual overlay highlighting security, medical, and volunteer deployments across stadium zones.

---

## 📂 File Structure

*   `index.html` - Core HTML layout, widget containers, and structures.
*   `style.css` - Design variable tokens, glassmorphism card panels, styling grid layouts, and animations.
*   `data.js` - Database store containing multilingual QAs, active incident records, match statuses, and simulation outcomes.
*   `map-svg.js` - SVG maps builder, BFS pathfinder, coordinates grid, and staff overlays.
*   `fan.js` - Chat bot matching, speech playback, points counters, and reward ticket claims.
*   `staff.js` - Incident logs dispatcher, map overlays filters, and multi-agent simulation sandbox triggers.
*   `app.js` - Main initialization script linking selectors, clock updates, and persona view toggles.
*   `DEPLOYMENT.md` - Deployment configurations guide.

---

## 🚀 Getting Started

### Run Locally
ArenaMind is fully self-contained and client-side (no Node modules, python builds, or API keys setup required).
Simply double-click the **`index.html`** file or open it directly in any standard web browser to launch it!

### Deploying to Render
1. Push this repository to your GitHub account.
2. Link the repository on the [Render Dashboard](https://dashboard.render.com/) as a **Static Site**.
3. Leave **Build Command** blank and set **Publish Directory** to `.`.
4. Click **Create Static Site** to deploy.
*(For more details, check out the [DEPLOYMENT.md](DEPLOYMENT.md) file)*
