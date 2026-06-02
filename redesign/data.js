// Mock use case data + helpers — mirrors the Supabase schema in App.jsx
// In production the real fetch from Supabase replaces window.MOCK_DATA

const industryColors = {
  "Automotive & Logistics": "#ffb547",
  "Business & Professional Services": "#9a6bff",
  "Consumer Packaged Goods": "#ff3da8",
  "Education": "#c084fc",
  "Financial Services": "#4dffb8",
  "Healthcare & Life Sciences": "#00e5ff",
  "Manufacturing": "#ff7a18",
  "Media & Entertainment": "#ff5cc4",
  "Public Sector": "#5ab2ff",
  "Retail": "#ff5470",
  "Technology": "#00d4ff",
  "Telecommunications": "#2dd4bf",
  "General": "#94a3b8"
};

const providers = ["Anthropic", "Google Cloud", "AWS", "Microsoft", "OpenAI"];
const industries = Object.keys(industryColors).filter(i => i !== "General");
const categories = [
  "Customer Service Agents",
  "Code Agents",
  "Creative Agents",
  "Data Agents",
  "Security Agents",
  "Employee Productivity",
  "General"
];

const companyNames = [
  "Mercedes-Benz","FedEx","DHL","UPS","Volkswagen","Toyota","BMW","Ford",
  "JPMorgan Chase","Goldman Sachs","Visa","Mastercard","Stripe","BlackRock","Citi","HSBC",
  "Pfizer","Moderna","Novartis","Bayer","UnitedHealth","Cleveland Clinic","Bupa","Roche",
  "Walmart","Amazon Retail","Target","Carrefour","Tesco","Ikea","Zara","Nike",
  "Coca-Cola","PepsiCo","Unilever","P&G","Nestle","L'Oréal","Heineken","Diageo",
  "Disney","Netflix","Warner Bros","Spotify","Sony","Universal","BBC","Paramount",
  "Vodafone","Verizon","AT&T","Deutsche Telekom","Orange","Telefónica","NTT","Telstra",
  "NASA","DOD","US Census","UK NHS","EU Commission","City of LA","Singapore Gov",
  "Salesforce","ServiceNow","SAP","Oracle","Adobe","Atlassian","HubSpot","Snowflake",
  "Shell","BP","Exxon","Schneider Electric","Siemens","Honeywell","ABB","GE",
  "Marriott","Hilton","Hyatt","Booking","Airbnb","Uber","Lyft","DoorDash"
];

const tagWords = ["automation","triage","forecasting","summarization","retrieval","classification","optimization","detection","copilot","extraction","grading","monitoring"];

const descTemplates = {
  "Customer Service Agents": (c) => `${c} deployed a multi-modal customer support agent that resolves Tier-1 inquiries autonomously, deflecting 38% of inbound contacts while preserving CSAT. The architecture pairs a routing classifier with a retrieval-augmented generation layer over the entire knowledge base, plus a confidence gate that hands off to humans on ambiguous intents.`,
  "Code Agents": (c) => `Engineering teams at ${c} adopted an internal coding agent integrated with their CI/CD pipeline. It autonomously opens pull requests for dependency upgrades, surfaces test-coverage gaps, and translates legacy stored procedures into modern services — cutting boilerplate work by an estimated 22%.`,
  "Creative Agents": (c) => `${c} built a brand-locked creative agent that ideates campaign concepts, generates copy variants for A/B testing, and produces motion-design briefs aligned with their style guide. Marketers report a 4× increase in concept-to-launch velocity for digital placements.`,
  "Data Agents": (c) => `A natural-language analytics surface at ${c} lets business users query the warehouse without SQL. The agent constructs and validates queries against a semantic layer, returns chartable answers, and persists reusable definitions back into the metric store.`,
  "Security Agents": (c) => `${c} deployed an autonomous SOC analyst that triages alerts, correlates signals across SIEM and EDR feeds, drafts incident reports, and recommends containment actions. Mean-time-to-acknowledge on critical alerts dropped from 12 minutes to 90 seconds.`,
  "Employee Productivity": (c) => `${c} rolled out a horizontal productivity copilot embedded in their workspace suite — summarizing meetings, drafting follow-ups, surfacing relevant prior work, and automating expense and timesheet workflows for 40,000 employees.`,
  "General": (c) => `${c} is operationalizing GenAI across multiple internal workstreams, with an emphasis on knowledge management, document understanding, and process orchestration. Production deployments span legal, finance, and operations functions.`
};

function seeded(i, mod) { return (i * 9301 + 49297) % (mod || 233280); }

window.MOCK_DATA = companyNames.flatMap((company, idx) => {
  const variants = 1 + (seeded(idx) % 3); // each company has 1–3 use cases
  return Array.from({ length: variants }).map((_, v) => {
    const industry = industries[seeded(idx + v * 7) % industries.length];
    const category = categories[seeded(idx + v * 13) % categories.length];
    const provider = providers[seeded(idx + v * 17) % providers.length];
    return {
      company,
      industry,
      category,
      provider,
      description: descTemplates[category](company),
    };
  });
});

window.INDUSTRY_COLORS = industryColors;
window.PROVIDER_LIST = providers;
window.CATEGORY_LIST = categories;
