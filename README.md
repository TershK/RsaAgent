


RSA AGENT

<img width="1127" height="737" alt="image" src="https://github.com/user-attachments/assets/965e51d8-b0e0-4700-bcc3-7f6c13c07c25" />


A comprehensive safety and emergency response platform for South Africa, integrating AI‑powered threat detection, real‑time incident reporting, and biometric‑secured access.

🚀 Live Demo
👉https://rsa-agent.vercel.app/ 

🧠 About

RSA AGENT is a citizen‑focused safety platform built to address rising security concerns in South Africa. It provides individuals with tools to report emergencies, receive real‑time alerts, locate nearby safe zones, and authenticate securely using biometric or manual login—all within a single, intuitive interface.


What Problem It Solves
Lack of unified emergency response: Fragmented communication between civilians, police, and medical services.

Slow incident reporting: Manual and time‑consuming reporting processes.

Limited situational awareness: Citizens often unaware of nearby dangers or safe havens.

Identity verification gaps: Insecure or cumbersome authentication for accessing safety services.

Who It’s For
Civilians seeking real‑time safety information and emergency reporting.

First responders (police, hospitals, security teams) monitoring incidents.

Community safety groups managing local hubs and danger zones.

Government agencies coordinating large‑scale emergency responses.


Key Features
Biometric & Manual Authentication: Secure, multi‑method login using fingerprint/facial recognition or credentials.

Real‑Time Incident Dashboard: View and report emergencies (SOS, crime, medical, fire, danger) with severity levels.

Interactive Safety Map: Visualize police stations, hospitals, safe hubs, and danger zones with risk scores.

Profile & Medical Info: Store personal details, emergency contacts, and medical conditions for faster assistance.

Media Library: Upload and analyze images for threat detection using AI.

Encrypted Chat: Communicate securely with responders during incidents.


🛠️ Tech Stack
Technology	Purpose
React	Frontend framework
TypeScript	Type‑safe development
Tailwind CSS	Utility‑first styling
Vite	Build tool and dev server
Lucide React	Icon library
Vercel	Deployment and hosting
Gemini API	AI‑powered image/incident analysis
Custom Backend	(Planned) Node.js + MongoDB for data

📁 Project Structure
text
src/
├── components/

│   ├── Auth.tsx   # Biometric/login/registration UI

│   └── (other views)     # Dashboard, Map, SOS, Profile, Library

├── types.ts              # TypeScript interfaces & enums

├── vite.config.ts        # Build configuration

└── ...

🔐 Authentication Flow
Biometric Scan: Simulated fingerprint/facial recognition with RSA‑themed UI.

Manual Login: Email/password fallback for restricted hardware areas.

Registration: Collects user details + mandatory biometric enrollment.

Success States: Visual feedback for scan completion, provisioning, and login.


🚨 Incident Management
Types: SOS, Crime, Medical, Fire, Danger.

Severity: Low → Critical.

Status: Reported → Responding → Resolved.

Real‑time updates with confidence scoring and responder assignment.

🗺️ Safety Mapping
Location Types: Police stations, hospitals, safe hubs, danger zones.

Risk/Safety Scores: Numerical ratings (1‑10 risk, 0‑100 safety).

Interactive overlays for quick navigation and decision‑making.

🔧 Setup & Development
Clone the repository

bash
git clone https://github.com/your-org/rsa-agent.git
cd rsa-agent
Install dependencies

bash
npm install
Set environment variables

bash
cp .env.example .env
# Add your GEMINI_API_KEY and other secrets
Run locally

Deploy to Vercel
https://rsa-agent.vercel.app/ 
bash
vercel --prod
