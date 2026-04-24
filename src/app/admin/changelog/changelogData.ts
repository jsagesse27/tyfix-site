export type ChangelogItem = {
  id: string;
  date: string;
  target: string;
  title: string;
  summary: string;
  sections: {
    title: string;
    items: {
      action: string;
      explanation: string;
    }[];
  }[];
  conclusion: string | null;
};

export const changelogs: ChangelogItem[] = [
  {
    id: 'apr-23-2026',
    date: 'April 23, 2026',
    target: 'Executive Leadership',
    title: 'TyFix Auto Sales Infrastructure & Application Upgrade',
    summary: 'Since the previous status report on April 9th, the engineering environment has undergone major architectural leaps. Our core focus over the last two weeks has targeted DevOps cost reduction, platform security hardening, and the deployment of new AI-enhanced commercial tooling to drastically speed up inventory workflows.\n\nWe have successfully engineered out major systemic cost-centers (Supabase Database/Storage) while simultaneously increasing the public platform\'s performance and security posture.',
    sections: [
      {
        title: '1. Cost Architecture & Infrastructure Optimization',
        items: [
          {
            action: 'Cloudflare CDN Integration: Routed 100% of public vehicle image traffic through a dedicated Cloudflare edge proxy (cdn.tyfixautosales.com), eliminating Supabase Storage Egress fees permanently.',
            explanation: 'Think of it like Costco buying in bulk — instead of paying every time a shopper looks at a car photo, Cloudflare stores copies for free and serves them. Stops the meter from running on image traffic.'
          },
          {
            action: 'Cloudflare Edge Worker Routing: Implemented a standalone Cloudflare Edge Worker to intercept CDN requests and bypass Vercel wildcard routing conflicts, securing direct edge-to-origin proxying.',
            explanation: 'Fixed a deep network routing conflict where Vercel was accidentally stealing image traffic. The new Worker acts as a dedicated traffic cop, guaranteeing images load instantly from the correct source with full caching.'
          },
          {
            action: 'On-Demand Next.js Cache Revalidation: Re-engineered deployment caching to operate "On-Demand" via webhooks, so the Admin Dashboard updates the public site in real-time without forcing expensive re-renders.',
            explanation: 'Before, the website rebuilt itself constantly "just in case" something changed. Now it only rebuilds when you actually change something — lower cost, and inventory updates go live instantly.'
          },
          {
            action: 'Database I/O Throttling: Restructured the VIN Extractor to use localStorage, eliminating 50+ redundant database calls per minute during active scanning.',
            explanation: 'Instead of running to the filing cabinet for every single VIN you scan, the tool now collects them on a clipboard and files them all at once. Same result, a fraction of the database charges.'
          }
        ]
      },
      {
        title: '2. Platform Security & Defense Hardening',
        items: [
          {
            action: 'Advanced Bot Mitigation: Outfitted all public intake forms with hidden Honeypot fields and Cloudflare Turnstile CAPTCHA to block spam/malicious inquiries before they hit lead trackers.',
            explanation: 'Two layers of protection — an invisible trap only bots fall into, plus a quick check to confirm real humans. Your sales team stops wasting time calling fake leads.'
          },
          {
            action: 'Next-Gen PIN Vault System: Created an encrypted session-lock inside the Admin Dashboard. Sensitive areas (File Cabinet, document generation) now require a PIN with automatic idle timeout.',
            explanation: 'Like a safe inside your office — even if someone walks up to an unlocked computer, they can\'t access customer documents or paperwork without the code. Auto-locks when left alone.'
          },
          {
            action: 'Global Rate Limiting & Header Security: Deployed a strict Content Security Policy (CSP) with HTTP routing headers to insulate the server from brute-forcing, XSS, and malicious iframe embedding.',
            explanation: 'Added a bouncer at the website\'s front door that turns away known attack patterns automatically. Protects the site from the common ways dealership sites get hacked or defaced.'
          }
        ]
      },
      {
        title: '3. AI-Powered Workflow Features',
        items: [
          {
            action: 'AI Computer Vision VIN Extractor: Integrated a "Groq Vision" AI model that uses the phone/desktop camera to scan Vehicle Door Stickers and instantly decodes them.',
            explanation: 'Point your phone at the door sticker and the AI reads every field automatically — VIN, trim, options, weight, everything. Replaces 5 minutes of typing per vehicle with 5 seconds.'
          },
          {
            action: 'Multi-Surface Extraction Deployment: Embedded the AI scanner into the bulk Admin context, single Vehicle Edit views, and the public-facing Trade-In Calculator.',
            explanation: 'The scanner works everywhere it\'s needed — adding a new car, editing an existing one, or letting customers scan their own trade-in from home. One tool, three use cases.'
          },
          {
            action: 'Automated Document Packaging: Completed the PDF Bill of Sale generation system inside the Admin dashboard.',
            explanation: 'Closed the last gap between the website and the paperwork. Click a button and the Bill of Sale prints out filled in — no retyping customer info or VIN from one system to another.'
          }
        ]
      },
      {
        title: '4. SEO & Content Marketing Controls',
        items: [
          {
            action: 'Internal Routing SEO Boost: Engineered programmatic SEO cross-linking between Blog, Inventory, Trade-in, and Vehicle Detail Pages to capture higher retention from Google crawlers.',
            explanation: 'Built a web of internal links so Google sees TyFix as a "full ecosystem" instead of scattered pages. Translation: better search rankings, more free traffic from buyers actively searching.'
          },
          {
            action: 'Marketing Administration Adjusters: Re-mapped the Admin Settings panel to dynamically control site-wide CTA popups.',
            explanation: 'You can now turn promotional popups (financing offers, holiday sales, etc.) on and off across the entire site from one toggle — no developer needed to run a campaign.'
          },
          {
            action: 'Secure Testimonial Extraction: Hardened how third-party review widgets (EmbedSocial) load, preventing client hydration crashes.',
            explanation: 'Fixed an issue where the Google/Facebook reviews section could crash the page on slow connections. Reviews now load smoothly, which matters because they\'re one of the top trust signals for buyers.'
          }
        ]
      }
    ],
    conclusion: 'The architecture has successfully transitioned from an early MVP build into a scalable, enterprise-hardened auto sales engine. Ongoing priorities involve monitoring Cloudflare caching rules against physical cost metrics at month-end, but no blockers remain for day-to-day commercial use.'
  },
  {
    id: 'apr-09-2026',
    date: 'April 9, 2026',
    target: 'Executive Leadership',
    title: 'Platform Foundation, SEO, & Lead Generation',
    summary: 'From April 7th to April 9th, engineering focused on establishing foundational SEO architecture, integrating the federal NHTSA API for automated data decoding, and implementing the Bill of Sale generator for internal workflow automation.',
    sections: [
      {
        title: '1. Foundation SEO & Technical Remediation',
        items: [
          {
            action: 'Dynamic OpenGraph & Canonical Tags: Implemented structural meta tags across all Vehicle Detail Pages and custom dynamic sitemap generation.',
            explanation: 'We gave Google the exact roadmap giving them clear, prioritized access to your inventory. This stops Google from getting confused and unilaterally dropping your car pages from search results.'
          }
        ]
      },
      {
        title: '2. Workflow Automation',
        items: [
          {
            action: 'Bill of Sale Generator MVP: Built a programmatic PDF rendering engine (jsPDF) directly into the Admin Dashboard with digital signature support.',
            explanation: 'You can now generate initial legal paperwork for a sale in 2 clicks. It automatically pulls the car and customer details without you having to retype anything.'
          }
        ]
      },
      {
        title: '3. Data Enrichment',
        items: [
          {
            action: 'NHTSA API Integration: Spliced the federal vehicle database automatically into the inventory creation form and leads form via direct API link.',
            explanation: 'Instead of manually typing "Toyota" and "Camry", the platform now auto-fills perfect, mistake-free specifications instantly based purely on the VIN.'
          }
        ]
      }
    ],
    conclusion: null
  }
];
