// Card types for the slide-based experience
export type CardType =
  | 'hero'           // Full-bleed image + title + subtitle
  | 'text'           // Heading + 1-2 short paragraphs (never more than ~80 words per card)
  | 'callout'        // Highlighted insight or key takeaway
  | 'scenario'       // Interactive "what would you do?" decision point
  | 'tool-grid'      // Grid of clickable tool cards (Section 3 only)
  | 'prompt-compare' // Side-by-side bad vs good prompt (Section 4B only)
  | 'example'        // Concrete example with label
  | 'summary'        // End-of-section key takeaways (bullet points)

export interface Card {
  id: string;
  type: CardType;
}

export interface InlineCallout {
  text: string;
  style?: 'insight' | 'warning' | 'tip';  // default 'insight'
}

export interface HeroCard extends Card {
  type: 'hero';
  image: string;
  title: string;
  subtitle: string;
}

export interface TextCard extends Card {
  type: 'text';
  heading?: string;
  body: string;  // Keep SHORT. Max ~80 words. This is one concept per card.
  callout?: InlineCallout;  // Optional inline callout rendered below the body
}

export interface CalloutCard extends Card {
  type: 'callout';
  text: string;
  style?: 'insight' | 'warning' | 'tip';  // default 'insight'
}

export interface ScenarioCard extends Card {
  type: 'scenario';
  situation: string;
  options: { text: string; correct: boolean; explanation: string }[];
}

export interface ToolGridCard extends Card {
  type: 'tool-grid';
  heading: string;
  tools: {
    name: string;
    icon: string;  // emoji or lucide icon name
    summary: string;  // One-liner
    detail: string;   // 2-3 sentences when expanded
    access: string;   // "Everyone" | "Managed access" | "Network-level"
  }[];
  callout?: InlineCallout;
}

export interface PromptCompareCard extends Card {
  type: 'prompt-compare';
  heading: string;
  bad: { prompt: string; output: string; label: string };
  good: { prompt: string; output: string; label: string };
}

export interface ExampleCard extends Card {
  type: 'example';
  label: string;
  text: string;
}

export interface SummaryCard extends Card {
  type: 'summary';
  heading: string;
  points: string[];
}

export type SectionCard = HeroCard | TextCard | CalloutCard | ScenarioCard | ToolGridCard | PromptCompareCard | ExampleCard | SummaryCard;

export interface Section {
  id: string;
  number: number;
  title: string;
  description: string;
  cards: SectionCard[];
}

export const sections: Section[] = [
  {
    id: 'section-1',
    number: 1,
    title: 'What AI Actually Is',
    description: 'Cut through the hype, understand what these tools actually do, and see where this is heading.',
    cards: [
      {
        id: 's1-hero',
        type: 'hero',
        image: '/images/sections/section-1-hero.png',
        title: 'What AI Actually Is',
        subtitle: 'Cut through the hype.',
      },
      {
        id: 's1-text-1',
        type: 'text',
        heading: 'Yes, everyone has an opinion',
        body: 'Every meeting for the last two years has had someone say "what about AI?" Sometimes it\'s a genuine question. Sometimes it\'s a client who read a headline on a plane. Sometimes it\'s someone in leadership who watched a demo and now wants everything to be "AI-powered" by Thursday. AI is either going to replace everyone or it\'s just autocomplete with good PR, depending on who you talk to. Neither framing helps you use it well. Here\'s what\'s actually happening under the hood.',
      },
      {
        id: 's1-text-2',
        type: 'text',
        heading: 'It learned from an enormous amount of text and data',
        body: 'The AI tools in this course are called large language models or generative AI. They were built by training a system on billions of pages of text, images, audio, and video, and having it find patterns across all of it. Not reading it the way you would. Identifying statistical relationships at a scale no human could process. The foundation is pattern recognition, at massive scale, applied very fast.',
      },
      {
        id: 's1-text-3',
        type: 'text',
        heading: 'It generates, it doesn\'t retrieve',
        body: 'When you ask AI something, it doesn\'t look up an answer in a database. It constructs a response that fits the pattern of what a good answer looks like, based on everything it was trained on. Most of the time this is genuinely impressive. Sometimes it\'s wrong in ways that aren\'t obvious. The model itself has no way to flag the difference.',
        callout: {
          text: 'Think of it less like a librarian and more like a very confident improv performer. Usually great. Occasionally makes things up with total conviction.',
          style: 'insight',
        },
      },
      {
        id: 's1-trust-grid',
        type: 'tool-grid',
        heading: 'How we build trust around a system that can be wrong',
        tools: [
          {
            name: 'Human context in session',
            icon: '🧠',
            summary: 'Tell AI what you already know.',
            detail: 'Telling AI what you already know constrains its guessing. The more context you provide, the less room it has to fill with pattern-matched assumptions.',
            access: 'Your responsibility',
          },
          {
            name: 'Grounding in specific data',
            icon: '📎',
            summary: 'Give it real material to work from.',
            detail: 'When you give AI specific documents, briefs, or datasets to work from, it constrains itself to that material rather than generating from general patterns.',
            access: 'Your responsibility',
          },
          {
            name: 'Iterative validation',
            icon: '🔄',
            summary: 'Treat every output as a draft.',
            detail: 'Treat each output as a draft, not a final answer. Review, push back, refine. The human stays in the loop and maintains editorial control throughout.',
            access: 'Your responsibility',
          },
          {
            name: 'Built-in checkpoints',
            icon: '✅',
            summary: 'Design verification into the process.',
            detail: 'In more advanced setups like agentic workflows, validation steps can be designed into the process. AI checks its own work against criteria before moving forward.',
            access: 'Built into the process',
          },
          {
            name: 'Escalation patterns',
            icon: '🚩',
            summary: 'Surface doubt, don\'t bury it.',
            detail: 'When AI flags uncertainty or the output doesn\'t feel right, humans step in. The system is designed to surface doubt, not bury it. Knowing when to escalate is a skill.',
            access: 'Built into the culture',
          },
        ],
      },
      {
        id: 's1-text-4',
        type: 'text',
        heading: 'It has no memory, no agenda, and no judgment',
        body: 'Unless you\'re inside a system specifically built to give it context, AI doesn\'t remember your last conversation. It has no stake in whether your output is accurate, on-brand, or legally safe. It produces what fits the pattern. That\'s not a bug. That\'s the design. The value comes from how you direct it.',
      },
      {
        id: 's1-scenario-1',
        type: 'scenario',
        situation: 'Your colleague says AI "looked up" the answer to a client question and it\'s definitely right. What\'s the issue?',
        options: [
          {
            text: 'AI retrieves from a database so it should be accurate.',
            correct: false,
            explanation: 'AI doesn\'t retrieve from a database. It generates responses based on patterns. There is no "lookup" happening, so accuracy is never guaranteed by the mechanism itself.',
          },
          {
            text: 'AI constructs responses from patterns — it could be confidently wrong.',
            correct: true,
            explanation: 'Exactly. AI generates text that fits the pattern of a good answer. It has no way to verify whether what it\'s producing is factually correct. Knowing when to trust it and when to push back is a skill worth developing.',
          },
          {
            text: 'AI is always right if you use the enterprise version.',
            correct: false,
            explanation: 'Enterprise versions have data protections, not accuracy guarantees. The underlying generation mechanism is the same — the model constructs responses from patterns regardless of the version.',
          },
        ],
      },
      {
        id: 's1-text-5',
        type: 'text',
        heading: 'Where this is actually going',
        body: 'Right now, most people are layering AI on top of existing processes — using it to make individual steps faster. Summarize this document. Draft this email. Generate some headline options. That\'s useful, but it\'s limited. It\'s like giving someone a power drill and watching them use it to tap in nails. The real shift isn\'t about doing the same tasks faster. It\'s about what becomes possible when speed compounds across the way things actually get done.',
      },
      {
        id: 's1-text-6',
        type: 'text',
        heading: 'Speed compounds when the process lets it',
        body: 'AI can research a competitive landscape, draft a strategic brief, generate creative concepts against it, refine them based on feedback, and prepare a client-ready deck — in the time it currently takes to schedule a kickoff meeting. But the way most work gets done today has bottlenecks that exist for good reason: approval chains, handoff points, sequential processes designed to catch errors and maintain quality. Those structures prevent AI\'s speed from compounding. The opportunity isn\'t removing those safeguards. It\'s redesigning how we work so quality control and creative judgment work with the speed instead of against it.',
      },
      {
        id: 's1-text-7',
        type: 'text',
        heading: 'Crafting the future, not reacting to it',
        body: 'When we stop just using AI to accelerate individual tasks and start reimagining how things actually get done, that\'s when things change for an agency. Not "AI will take our jobs" panic. Not "AI is just a tool" dismissiveness. Something more practical: the people and teams who learn to see the whole arc from insight to output — who understand how work flows end to end — will build things that weren\'t possible before. This is also where agents come in: AI systems that don\'t just answer questions but take sequences of actions autonomously. That\'s coming, and it will matter. But the foundation is learning to use what\'s already here well.',
        callout: {
          text: 'This is mandatory training. But everything that follows builds on what you just read. This is the foundation for the rest of the course — and it\'s worth having it click now rather than later.',
          style: 'tip',
        },
      },
      {
        id: 's1-summary',
        type: 'summary',
        heading: 'Section 1 Key Takeaways',
        points: [
          'AI is pattern recognition at massive scale — it generates responses, it doesn\'t look things up.',
          'It can be confidently wrong. Knowing when to trust it and when to verify is a core skill.',
          'It has no memory, no agenda, and no judgment. The value comes from how you direct it.',
          'The real shift isn\'t faster tasks — it\'s reimagining how we work so AI\'s speed compounds across the whole process.',
          'Autonomous AI systems are coming. The foundation for all of it is learning to direct what\'s here now.',
        ],
      },
    ],
  },

  {
    id: 'section-2',
    number: 2,
    title: 'How AI Gets Built and Why It Matters What Goes In',
    description: 'Learn how AI models are trained and why using the right tool is the rule that matters.',
    cards: [
      {
        id: 's2-hero',
        type: 'hero',
        image: '/images/sections/section-2-hero.png',
        title: 'How AI Gets Built',
        subtitle: 'Your inputs have consequences.',
      },
      {
        id: 's2-text-1',
        type: 'text',
        heading: 'Why the "how it\'s built" part matters to you',
        body: 'To understand why there are rules about what you put into AI tools, it helps to understand how those tools got built in the first place. This isn\'t abstract computer science. It\'s the reason your IT team has opinions about which chat window you type client names into. Before you ever typed a single prompt, the AI you\'re using went through a process called training. Developers fed it enormous amounts of data — text, images, code — and the system adjusted itself over and over until it got good at generating useful outputs. That process took months, massive computing power, and in some cases billions of dollars.',
      },
      {
        id: 's2-text-2',
        type: 'text',
        heading: 'Some tools keep learning from what you type',
        body: 'Some AI tools, particularly free or consumer-grade ones, continue learning after they\'ve launched. When you type something in, that input can become part of future training data. Which means what you share with the tool doesn\'t necessarily stay between you and the tool. If you paste a client brief into a consumer version of ChatGPT to get a summary, that brief could be used to train a future version of the model. It could surface in someone else\'s output. You\'d never know. The client would never know. But the information would be out there. This is not a hypothetical. It\'s happened. Client data has leaked through consumer AI tools because someone took a shortcut. That\'s the kind of mistake that doesn\'t come with a second chance.',
      },
      {
        id: 's2-text-3',
        type: 'text',
        heading: 'Enterprise tools vs. consumer tools: one rule',
        body: 'The enterprise agreements that Stagwell has negotiated with our approved tool providers include data protection provisions. Your inputs are not used for training. Client information doesn\'t leave the environment. That protection exists because someone negotiated it explicitly into the contract. A $20 personal ChatGPT subscription doesn\'t come with that protection. The guardrail is which tool you use, not how much you paste into it. If you\'re in an approved tool with enterprise protections, paste the full brief. Give it everything it needs to do the job well. The agreement covers you. The protection is in the contract, not in self-censoring your inputs.',
        callout: {
          text: 'Your personal AI account and your work AI account are not the same thing, the way your personal Instagram and your work email are not the same thing. You wouldn\'t DM a client brief to your friends. Don\'t paste one into a tool that doesn\'t have enterprise protections.',
          style: 'insight',
        },
      },
      {
        id: 's2-scenario-1',
        type: 'scenario',
        situation: 'You need a quick summary of a client brief. You have a personal ChatGPT subscription and it\'s faster than Copilot right now. What do you do?',
        options: [
          {
            text: 'Use personal ChatGPT — it\'s the same AI.',
            correct: false,
            explanation: 'It may be the same underlying model, but the data protections are completely different. Your personal subscription has no enterprise agreement. Your inputs could be used for training, and client information could leak.',
          },
          {
            text: 'Use the approved DCP tool, even if it takes an extra minute.',
            correct: true,
            explanation: 'Correct. The extra minute is the cost of knowing your client\'s data is protected. Approved tools have negotiated agreements that prevent your inputs from being used for training. And once you\'re in the right tool, give it the full brief — that\'s what the protection is for.',
          },
          {
            text: 'Use ChatGPT but delete the conversation after.',
            correct: false,
            explanation: 'Deleting the conversation doesn\'t undo potential training data ingestion. Once information is submitted to a consumer tool, you\'ve lost control of it. Deletion from your view doesn\'t mean deletion from their systems.',
          },
        ],
      },
      {
        id: 's2-text-4',
        type: 'text',
        heading: 'The simple version',
        body: 'Use approved tools for work. That\'s the rule. Not because someone made an arbitrary policy, but because those are the tools where we actually know what happens to your data. The protection is in the agreement, not in how carefully you self-edit your prompts. Use the right tool, then use it fully.',
      },
      {
        id: 's2-summary',
        type: 'summary',
        heading: 'Section 2 Key Takeaways',
        points: [
          'AI models learn from training data — and some consumer tools keep learning from your inputs.',
          'Client data has leaked through consumer AI tools. This is not hypothetical.',
          'Enterprise tools have negotiated data protections. Personal subscriptions do not.',
          'The guardrail is which tool you use. In an approved tool, give it what it needs — the contract covers you.',
        ],
      },
    ],
  },

  {
    id: 'section-3',
    number: 3,
    title: 'The Tools We Use and Why They\'re Approved',
    description: 'Understand the approved tool stack and the legal protections that come with each one.',
    cards: [
      {
        id: 's3-hero',
        type: 'hero',
        image: '/images/sections/section-3-hero.png',
        title: 'The Tools We Use',
        subtitle: 'And why they\'re approved.',
      },
      {
        id: 's3-text-1',
        type: 'text',
        heading: 'These aren\'t arbitrary choices',
        body: 'Not all AI tools are equal. The ones available to you through DCP weren\'t picked because someone liked the demo. Each one comes with legal protections that matter for your work and our clients. The selection reflects capability, coverage, and contractual safety. Here\'s what you need to know about each.',
      },
      {
        id: 's3-text-2',
        type: 'text',
        heading: 'Indemnification: the word that pays for itself',
        body: 'When a vendor indemnifies us, they provide a written provision that protects the agency from legal claims related to our use of their tool. If someone claims that an AI-generated output infringes on their intellectual property, the vendor takes on that legal risk rather than leaving it with us. That protection only exists when we use tools correctly, within the terms of the agreement. Translation: if something goes sideways with an approved tool used correctly, the vendor has our back. Random tool from Reddit? You\'re on your own. This matters because an agency can\'t absorb the legal risk of IP claims on every AI-generated output across every client. Our intention is to use tools that generate within fair use — not to cut corners or cheat the system. Indemnification is how we operate responsibly at scale.',
      },
      {
        id: 's3-tool-grid',
        type: 'tool-grid',
        heading: 'The Approved Tool Stack',
        tools: [
          {
            name: 'Adobe Firefly',
            icon: '🎨',
            summary: 'Generative AI for images, built into Creative Cloud.',
            detail: 'Firefly was trained on licensed and public domain content specifically to make it commercially safe. Adobe built it that way because their customers are professional creators who can\'t afford IP exposure. Firefly offers a huge suite of tools including the ability to train custom models to recreate a specific style or subject, and Firefly Boards — a collaborative tool where you can explore and iterate with Firefly and other AI models. Our indemnification covers outputs from Firefly\'s native models — it does not automatically extend to third-party models available inside Firefly.',
            access: 'Everyone',
          },
          {
            name: 'Microsoft Copilot',
            icon: '🤖',
            summary: 'AI assistant integrated into Microsoft 365.',
            detail: 'Copilot lives inside the tools most of the agency uses for documents, email, and communication. Our enterprise agreement means your inputs are protected. Copilot uses ChatGPT and soon Claude as models you can select, in addition to their core model. It\'s primarily a text and productivity tool: summarizing, drafting, researching, organizing. The broadest access tool available, appropriate for most day-to-day AI-assisted work.',
            access: 'Everyone',
          },
          {
            name: 'Runway',
            icon: '🎬',
            summary: 'Specialized image and video generation.',
            detail: 'Access is managed and licensed individually because it carries more capability and more responsibility. Runway operates under a Stagwell-level master service agreement with full indemnification and data protection. Important nuance: Runway gives you access to third-party models too — use native Runway models for production work unless you\'ve confirmed the third-party coverage applies.',
            access: 'Managed access',
          },
          {
            name: 'Claude',
            icon: '💬',
            summary: 'Advanced reasoning, research, and workflow building.',
            detail: 'Built by Anthropic, Claude is the tool of choice for people at DCP who want to go beyond standard productivity. Better suited for complex reasoning, longer documents, research synthesis, and building AI-powered workflows. This certification course was built using Claude — it\'s a concrete example of what the tool can do beyond just answering questions. If you\'re starting to use AI to build things, not just ask questions, Claude is likely the tool you\'ll grow into. Access is managed.',
            access: 'Managed access',
          },
          {
            name: 'Figma',
            icon: '✏️',
            summary: 'Design tool with deep AI features built in.',
            detail: 'AI features inside Figma can generate layouts, suggest components, auto-annotate designs, and assist with copy — all within the same environment designers already work in. Using AI inside an enterprise tool you already have is different from finding a standalone AI design tool. The protections travel with the platform.',
            access: 'Managed access',
          },
          {
            name: 'Stagwell ID Graph',
            icon: '🔗',
            summary: 'Identity data infrastructure built with Palantir.',
            detail: 'Connects information about real people across different data sources — devices, behaviors, categories — without necessarily knowing their name. It\'s how you go from "someone visited this website" to "this type of person is likely interested in this category." For most people at DCP, it powers work rather than being something you interact with directly. Operates under Stagwell\'s data governance framework.',
            access: 'Network-level',
          },
          {
            name: 'The Machine',
            icon: '⚙️',
            summary: 'Stagwell\'s AI orchestration platform (emerging).',
            detail: 'Designed to connect AI capabilities across the network\'s agencies into a shared orchestration layer. It\'s early, and not something most people at DCP will interact with directly right now. Worth knowing it exists, it\'s where the network is heading, and DCP\'s AI infrastructure is designed to connect into it over time.',
            access: 'Network-level',
          },
        ],
        callout: {
          text: 'Yes, this certification was built with Claude. We practice what we preach.',
          style: 'tip',
        },
      },
      {
        id: 's3-scenario-1',
        type: 'scenario',
        situation: 'A freelancer on your team wants to use a free AI image generator they love for a client project. It makes great stuff. What\'s the issue?',
        options: [
          {
            text: 'No issue if the output is good.',
            correct: false,
            explanation: 'Output quality isn\'t the issue. Without an enterprise agreement, there\'s no IP protection, no indemnification, and no guarantee about what happens to the inputs. "It looks great" doesn\'t cover you in a legal dispute.',
          },
          {
            text: 'Free tools don\'t carry enterprise agreements — no IP protection for client work.',
            correct: true,
            explanation: 'Exactly. The approved tools come with negotiated legal protections. A free tool from the internet has none of that. Using it for client work means you\'re making a legal decision on behalf of a client who didn\'t authorize it.',
          },
          {
            text: 'It\'s fine as long as the freelancer owns the subscription.',
            correct: false,
            explanation: 'A personal subscription doesn\'t create enterprise protections. The issue isn\'t who\'s paying — it\'s whether the tool has the legal agreements that protect client work. Personal subscriptions don\'t.',
          },
        ],
      },
      {
        id: 's3-text-3',
        type: 'text',
        heading: 'The rule underneath all of this',
        body: 'If the tool isn\'t on the approved list, the protections don\'t exist. A personal ChatGPT subscription, a free image generator, a browser extension that uses AI — none of those carry enterprise agreements. Using them for client work means you\'re making a legal and ethical decision on behalf of a client who didn\'t authorize it. The approved tools exist so you don\'t have to make that call under pressure. Use them.',
      },
      {
        id: 's3-summary',
        type: 'summary',
        heading: 'Section 3 Key Takeaways',
        points: [
          'Indemnification means the vendor takes on legal risk when you use their tool correctly.',
          'Each approved tool has specific strengths: Copilot for productivity, Firefly for images, Runway for video, Claude for complex reasoning.',
          'Access levels vary — some tools are available to everyone, others require managed access.',
          'If it\'s not on the approved list, the protections don\'t exist. No exceptions.',
        ],
      },
    ],
  },

  {
    id: 'section-4',
    number: 4,
    title: 'Responsible Use',
    description: 'Master the rules for inputs and intellectual property that protect you and your clients.',
    cards: [
      {
        id: 's4-hero',
        type: 'hero',
        image: '/images/sections/section-4-hero.png',
        title: 'Responsible Use',
        subtitle: 'Inputs and IP.',
      },
      {
        id: 's4-text-1',
        type: 'text',
        body: 'Understanding the tools is only part of it. How you use them is where things can go wrong, and where your judgment actually matters. This section covers two areas: what you feed in, and intellectual property. Prompting gets its own section next — it deserves the depth.',
      },

      // ── Inputs ──
      {
        id: 's4-text-2',
        type: 'text',
        heading: 'Inputs: What You Feed Into AI',
        body: 'The guardrail on inputs isn\'t about how much you share — it\'s about which tool you share it with. If you\'re using an approved tool with an enterprise agreement, it\'s perfectly acceptable to paste the full brief or give it the whole deck. The more context AI has, the better the output — it often finds connections and patterns you didn\'t give it explicitly. The contractual protections are there precisely so you can work freely inside the environment. The rule is firm on one thing: the tool itself must be approved. If you wouldn\'t email it to a stranger, don\'t paste it into an unapproved AI tool.',
      },
      {
        id: 's4-text-3',
        type: 'text',
        heading: 'Approved tools: work freely, work fully',
        body: 'Enterprise agreements exist so you don\'t have to second-guess every paste. Client briefs, strategy decks, research data, creative territories — all of it can go into an approved tool. In fact, holding back context often makes the output worse. AI works best when it has the full picture. The protection is the agreement, not self-censorship.',
      },
      {
        id: 's4-text-4',
        type: 'text',
        heading: 'Unapproved tools: nothing goes in',
        body: 'Anything without an enterprise agreement is off limits for client work. That includes personal ChatGPT subscriptions, free image generators, browser extensions with AI features, and that tool your friend swore by last week. It doesn\'t matter how good the output is. Without contractual protection, you\'re exposing client data to systems where you have no control over what happens to it.',
      },
      {
        id: 's4-text-5',
        type: 'text',
        heading: 'The exception that still applies: PII',
        body: 'Even in approved tools, personally identifiable information requires care. Names, contact details, health data, anything that identifies a specific real person — strip it before processing. This isn\'t about the tool\'s security. It\'s about data handling principles that exist independent of any platform. Anonymize first, then use the approved tool with the rest of the data intact.',
      },
      {
        id: 's4-text-6',
        type: 'text',
        heading: 'Assets you don\'t own',
        body: 'If you\'re feeding an asset into an AI tool as a reference or input, you need rights to that asset. A client logo can be used in an approved environment with client permission. A stock image you found on Google cannot. This applies to images, audio, video, fonts, and any creative material that belongs to someone else. Check your rights before the asset goes in.',
      },
      {
        id: 's4-scenario-1',
        type: 'scenario',
        situation: 'You\'re working on a campaign strategy using Copilot (an approved tool). You have the full client brief, a competitive analysis with named executives and their contact details, and audience research with respondent names and demographics. What\'s the right approach?',
        options: [
          {
            text: 'Paste everything in — Copilot is approved, so all data is protected.',
            correct: false,
            explanation: 'Approved tools protect data from external exposure, but PII still requires care. The client brief and competitive analysis are fine to use fully, but named individuals\' contact details and respondent identifying information should be stripped first. The tool being approved doesn\'t override data handling principles for personal information.',
          },
          {
            text: 'Strip the personally identifiable information from the research and executive contacts, then paste everything else in full.',
            correct: true,
            explanation: 'Correct. The brief and competitive analysis can go in fully — that\'s exactly what approved tools are for. But PII (names, contact details, respondent identifiers) should be removed regardless of the platform. Anonymize the people, keep the substance.',
          },
          {
            text: 'Only share the minimum necessary information from each document to limit exposure.',
            correct: false,
            explanation: 'With approved tools, you don\'t need to minimize context — that actually makes the output worse. The enterprise agreement protects the data. The only thing that needs stripping is personally identifiable information. Give AI the full picture so it can do its best work.',
          },
        ],
      },

      // ── Intellectual Property ──
      {
        id: 's4-text-7',
        type: 'text',
        heading: 'Intellectual Property',
        body: 'The IP principle is straightforward: describe what you want, don\'t specify whose work you\'re borrowing to get there. This applies across every category — people, places, visual styles, fonts, and music. The line isn\'t always obvious, which is exactly why the principle needs to be clear.',
      },
      {
        id: 's4-text-8',
        type: 'text',
        heading: 'Celebrities, landmarks, and pop culture',
        body: 'Don\'t reference a specific person\'s name, likeness, voice, or identifiable traits in a prompt. Don\'t name specific buildings or landmarks that carry trademark protections. Don\'t reference specific films, artists, or cultural moments by name. In every case, the move is the same: describe the qualities you want. A vocal tone, an architectural style, a color palette and texture. You get the aesthetic without the IP exposure.',
      },
      {
        id: 's4-text-9',
        type: 'text',
        heading: 'Fonts and music',
        body: 'Fonts feel free and accessible — services like Google Fonts and Adobe Fonts make them easy to grab. But "free to download" doesn\'t always mean "cleared for commercial use," and licensing terms change. The agency has a licensed font library through Monotype — that\'s the source. Check before production, not after approval. AI-generated music is off the table for client work entirely. Music is one of the most heavily litigated areas of IP, and AI tools don\'t satisfy the musicologist verification that original compositions require.',
      },
      {
        id: 's4-text-10',
        type: 'text',
        heading: 'Safety rails are helpful but incomplete',
        body: 'Most AI tools have safeguards that reject prompts crossing obvious IP or content lines. That rejection is useful information. But acceptance doesn\'t mean you\'re legally clear. The safeguards are imperfect, inconsistent across tools, and not a substitute for your own judgment. If a tool lets you do something, that doesn\'t mean you should.',
      },
      {
        id: 's4-scenario-2',
        type: 'scenario',
        situation: 'You want AI to generate campaign imagery with a "retro Wes Anderson vibe." What\'s the right approach?',
        options: [
          {
            text: 'Reference Wes Anderson by name — AI needs to understand the reference.',
            correct: false,
            explanation: 'Naming a specific filmmaker in a prompt creates IP risk. Their visual style is a creative signature, and referencing it directly can produce outputs that infringe on their rights.',
          },
          {
            text: 'Describe the visual qualities: pastel palette, symmetrical composition, vintage texture, centered framing.',
            correct: true,
            explanation: 'Correct. Describe what you want in terms of visual properties — color, composition, texture, mood — rather than whose work you\'re drawing from. You get the aesthetic without the IP exposure.',
          },
          {
            text: 'Ask the AI tool whether the reference is legally safe before using it.',
            correct: false,
            explanation: 'AI cannot give legal opinions. If a tool accepts your prompt, that doesn\'t mean you\'re legally clear. The safeguards are imperfect and not a substitute for your own judgment.',
          },
        ],
      },
      {
        id: 's4-summary',
        type: 'summary',
        heading: 'Section 4 Key Takeaways',
        points: [
          'Approved tools with enterprise agreements: use them fully. Full context helps AI find connections you might not see.',
          'Unapproved tools: nothing goes in. No exceptions, regardless of output quality.',
          'PII must be stripped even in approved tools — that\'s a data principle, not a tool limitation.',
          'IP: describe what you want, don\'t name whose work you\'re borrowing. Applies to people, places, styles, fonts, and music.',
          'Safety rails in AI tools are helpful but imperfect — they don\'t replace your judgment.',
        ],
      },
    ],
  },

  {
    id: 'section-5',
    number: 5,
    title: 'How to Prompt Well',
    description: 'The most practically important skill in working with AI. Go deep on prompting, iteration, and knowledge compounding.',
    cards: [
      {
        id: 's5-hero',
        type: 'hero',
        image: '/images/sections/section-5-hero.png',
        title: 'How to Prompt Well',
        subtitle: 'The skill that makes everything else work.',
      },
      {
        id: 's5-text-1',
        type: 'text',
        body: 'Most people who feel like AI isn\'t that useful are prompting the wrong way. Not wrong in a technical sense — wrong in the sense that they\'re being too vague, too passive, or treating AI like a search engine rather than a capable collaborator who needs clear direction. This section goes deep because prompting is the single skill that determines whether AI is transformative or just okay.',
      },
      {
        id: 's5-text-2',
        type: 'text',
        heading: 'The core principle',
        body: 'AI fills gaps with whatever fits the pattern. If your prompt leaves a lot of room, AI uses that room. The output will be generic, hedged, or just not quite right. The more specific and intentional your prompt, the more the output reflects your actual thinking rather than AI\'s best guess at what you might have meant.',
      },

      // Core principle 1
      {
        id: 's5-text-3',
        type: 'text',
        heading: 'State your goal, not just your request',
        body: 'There\'s a difference between asking for a thing and explaining what you\'re trying to accomplish. "Write a headline" is a request. Explaining that you need to reposition a financial services brand toward younger audiences who find most financial advertising condescending — that\'s a goal. When AI understands the goal, it makes better decisions about tone, structure, and emphasis at every level of the output.',
      },

      // Core principle 2
      {
        id: 's5-text-4',
        type: 'text',
        heading: 'Give it a role or frame',
        body: 'AI responds well to being told who it\'s operating as or what lens to use. This isn\'t a gimmick. It gives the model a consistent perspective to filter every decision through. "You are a senior strategist reviewing this brief for logical gaps" produces something fundamentally different from "review this brief." The role shapes not just the content but the level of rigor, the vocabulary, and what the model prioritizes.',
      },

      // Core principle 3
      {
        id: 's5-text-5',
        type: 'text',
        heading: 'Constrain it deliberately',
        body: 'Constraints aren\'t limitations on creativity. They\'re instructions that focus the output. Format, length, tone, what to avoid, what to prioritize — the more you specify, the less AI has to invent on your behalf. "Give me three options, each under 20 words, avoiding corporate jargon" is dramatically more useful than "give me some options." Constraints are how you direct the creative energy instead of letting it scatter.',
      },

      // Core principle 4
      {
        id: 's5-text-6',
        type: 'text',
        heading: 'Iterate, don\'t restart',
        body: 'A first output is rarely the final answer. The most effective use of AI is treating it as a back and forth. React to what it gives you. Tell it what\'s close and what isn\'t. Push it in a specific direction. "The second option is closest but the tone is too formal — make it feel more like something a real person would say" is far more productive than generating a fresh batch. Each iteration narrows the gap between what you\'re imagining and what you\'re getting.',
      },

      // Prompt compare 1: Headlines
      {
        id: 's5-prompt-compare-1',
        type: 'prompt-compare',
        heading: 'The difference specificity makes',
        bad: {
          prompt: 'Write me a headline.',
          output: 'Innovating Tomorrow\'s Solutions Today',
          label: 'Vague prompt, generic output',
        },
        good: {
          prompt: 'Write a headline for a financial services brand repositioning toward younger audiences. Tone: confident but not corporate. Under 10 words. The audience finds most financial advertising condescending.',
          output: 'Your Money. Your Rules. No Lectures.',
          label: 'Specific goal, usable output',
        },
      },

      // Prompt compare 2: Strategy
      {
        id: 's5-prompt-compare-2',
        type: 'prompt-compare',
        heading: 'Roles transform the quality of feedback',
        bad: {
          prompt: 'Review this brief.',
          output: 'This brief covers the key points well. Consider adding more detail about the target audience and competitive landscape. Overall it\'s a solid foundation.',
          label: 'No role, surface-level feedback',
        },
        good: {
          prompt: 'You are a senior strategist. Review this brief for logical gaps between the audience insight and the proposed creative territory. Be specific about where the connection breaks down.',
          output: 'The brief identifies the audience as "value-conscious parents" but the creative territory leans on aspiration and premium cues. There\'s a disconnect at the bridge — nothing explains why this audience would respond to messaging that signals a price point above their stated priority. The insight needs a tension that resolves upward, or the territory needs to meet them where they are.',
          label: 'Role-framed, structurally useful feedback',
        },
      },

      // Knowledge compounding — combined into one card
      {
        id: 's5-text-7',
        type: 'text',
        heading: 'Knowledge compounding: AI gets smarter across a conversation',
        body: 'The real power of AI isn\'t in single prompts — it\'s in building context across a conversation. Each prompt builds on the last. You start broad and go deeper, all in one thread where AI carries the context forward. This is fundamentally different from using AI as a search engine. It\'s a working session where depth compounds with every step.\n\nImagine you\'re preparing for a quarterly client review:\n\n"Summarize the last 3 months of project updates from this document." → "Now identify recurring themes and any risks that show up more than once." → "Draft talking points for a quarterly review that address the risks proactively and highlight the strongest progress areas." → "Write a meeting agenda that puts the most important conversations first."\n\nEach step goes deeper. The summary gives AI raw material. The themes extract what matters. The talking points apply judgment. The agenda structures it for action. By step four, AI isn\'t working from a blank page — it\'s working from everything the conversation has built. That\'s not something you get from four separate conversations.',
      },

      // Bringing your POV — with the "author" insight as an inline callout
      {
        id: 's5-text-9',
        type: 'text',
        heading: 'The most common mistake isn\'t bad prompting — it\'s absent thinking',
        body: 'The biggest failure mode with AI isn\'t vague prompts. It\'s outsourcing your point of view. If you hand AI a task without your own perspective on what good looks like, you\'ll get something competent, pattern-matched, and generic. The people who get genuinely great output from AI are the ones who bring their own editorial judgment, taste, and strategic opinion into the conversation. AI amplifies whatever you bring. If you bring nothing, it amplifies nothing.',
        callout: {
          text: 'You are always the author. AI is the instrument, not the musician.',
          style: 'insight',
        },
      },

      // Scenario
      {
        id: 's5-scenario-1',
        type: 'scenario',
        situation: 'You\'ve been iterating with AI on a campaign concept for 20 minutes. The output is technically solid but feels generic — it could be for any brand. What\'s the most likely issue?',
        options: [
          {
            text: 'The AI model isn\'t creative enough for this kind of work.',
            correct: false,
            explanation: 'The model\'s capability isn\'t the bottleneck. AI can produce highly distinctive work — but only when given a distinctive point of view to work from. Generic input produces generic output regardless of how powerful the model is.',
          },
          {
            text: 'You haven\'t brought your own point of view into the conversation — you\'ve been reacting to AI\'s suggestions instead of directing them.',
            correct: true,
            explanation: 'Exactly. When output feels generic after sustained iteration, it usually means the conversation has been AI-led rather than human-led. The fix isn\'t a better prompt — it\'s injecting your own opinion about what makes this brand different, what the work should feel like, and what you\'d reject. AI amplifies your perspective. If you haven\'t provided one, it defaults to patterns.',
          },
          {
            text: 'You should start a new conversation — this thread has gotten too long and confused the AI.',
            correct: false,
            explanation: 'Long threads don\'t inherently confuse AI — in fact, that accumulated context is an advantage. Starting over throws away 20 minutes of built context. The issue is more likely about direction than thread length. Try asserting a stronger point of view within the existing conversation.',
          },
          {
            text: 'You need to add more constraints like word count and format requirements.',
            correct: false,
            explanation: 'Constraints help with structure and focus, but they don\'t solve for generic thinking. You can have a perfectly constrained prompt that still produces bland output because it lacks a distinctive strategic angle. The missing ingredient is your perspective, not more formatting rules.',
          },
        ],
      },

      // Summary
      {
        id: 's5-summary',
        type: 'summary',
        heading: 'Section 5 Key Takeaways',
        points: [
          'State your goal, not just your request. Context transforms output quality.',
          'Give AI a role or frame — it shapes rigor, vocabulary, and priorities.',
          'Constrain deliberately — format, tone, length, and what to avoid.',
          'Iterate within the conversation instead of starting over.',
          'Build compounding sessions: each step should go deeper into understanding, not just do the next task.',
          'The biggest failure mode is outsourcing your point of view. AI amplifies what you bring.',
          'You are always the author. AI is the instrument.',
        ],
      },
    ],
  },

  {
    id: 'section-6',
    number: 6,
    title: 'When to Ask for Help',
    description: 'Know when to trust your judgment and when to loop in your producer.',
    cards: [
      {
        id: 's6-hero',
        type: 'hero',
        image: '/images/sections/section-6-hero.png',
        title: 'When to Ask for Help',
        subtitle: 'Judgment calls and escalation.',
      },
      {
        id: 's6-text-1',
        type: 'text',
        body: 'Using AI well involves a lot of in-the-moment judgment. Most of the time you\'ll know what\'s right. But sometimes you\'ll hit a situation where something feels uncertain, and knowing what to do next matters more than knowing the answer yourself.',
        callout: {
          text: 'A five-minute conversation now prevents a five-alarm email later.',
          style: 'warning',
        },
      },
      {
        id: 's6-text-2',
        type: 'text',
        heading: 'Use your own judgment when:',
        body: 'The question is about whether a prompt is effective, whether the output is good enough, whether your approach is working. Those are creative and strategic calls — make them confidently. If the situation clearly fits something covered in this course and you already know the rule, apply it. You don\'t need permission to follow the guidelines you\'ve already learned.',
      },
      {
        id: 's6-text-3',
        type: 'text',
        heading: 'Ask your producer when:',
        body: 'You\'re unsure whether a specific asset, reference, or input is cleared for use in AI. The licensing situation is ambiguous. You\'re using a tool in a new way and something feels off. A client has asked about AI usage and you\'re not sure what to disclose. Producers understand the production and legal landscape — they\'re the right first stop and in most cases they\'ll have the answer.',
      },
      {
        id: 's6-text-4',
        type: 'text',
        heading: 'The key timing principle',
        body: 'Ask early. Not after the client has seen it. Not after it\'s in production. Not after legal is involved. The earlier a question gets raised, the easier it is to address. The later it surfaces, the more expensive the answer becomes — in time, money, and relationships. Nobody has ever been reprimanded for asking a question too soon. Plenty of people have regretted not asking one soon enough.',
      },
      {
        id: 's6-text-5',
        type: 'text',
        heading: 'The escalation chain exists — trust it',
        body: 'If you\'re about to take work to a client and something in the AI-assisted process is unresolved, don\'t let an open question become a client problem. Resolve it before it leaves the building. Producers will escalate to the right people when they need to. That chain exists precisely so you don\'t have to solve every edge case yourself.',
      },
      {
        id: 's6-scenario-1',
        type: 'scenario',
        situation: 'You\'re finalizing campaign assets that include AI-generated imagery. A reference image used in the generation process might have a licensing issue, but you\'re not sure. The work is due to the client tomorrow morning. What do you do?',
        options: [
          {
            text: 'Send it to the client and flag the concern in the delivery email so they\'re aware.',
            correct: false,
            explanation: 'Flagging a concern in a delivery email means the client now owns your unresolved problem. That\'s not escalation — it\'s passing the risk to the people who trusted you to manage it.',
          },
          {
            text: 'Raise it with your producer immediately, even though it\'s late in the process.',
            correct: true,
            explanation: 'Correct. A tight deadline makes the conversation more urgent, not less necessary. Producers can escalate quickly and often have answers faster than you\'d expect. The five-minute conversation now prevents the five-alarm email later.',
          },
          {
            text: 'Replace the image with a different AI-generated one and move on — problem solved.',
            correct: false,
            explanation: 'Replacing the output doesn\'t address the underlying question about the reference image. If there\'s a licensing issue with inputs used in the generation process, that question doesn\'t disappear by swapping the result. The process needs to be cleared, not just the output.',
          },
        ],
      },
      {
        id: 's6-summary',
        type: 'summary',
        heading: 'Section 6 Key Takeaways',
        points: [
          'Creative and strategic calls are yours to make. Use the rules from this course with confidence.',
          'Anything involving unclear rights, new territory, or unresolved questions goes to your producer.',
          'Ask early — before the client sees it, before it\'s in production, before legal is involved.',
          'The escalation chain exists. Trust it. Nobody gets in trouble for asking too soon.',
        ],
      },
    ],
  },
];
