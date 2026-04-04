export interface QuizQuestion {
  id: string;
  section: string;
  type: 'true-false' | 'multiple-choice';
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export const PASS_THRESHOLD = 0.8;
export const TOTAL_QUESTIONS = 8;

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    section: 'section-1',
    type: 'multiple-choice',
    question:
      'When AI produces a factually incorrect response, what is the most accurate explanation for why this happens?',
    options: [
      'The model\'s training data contained incorrect information on that topic',
      'The model constructs responses that fit the pattern of a good answer, regardless of whether the content is true',
      'The model searched for the answer but connected to an unreliable source',
      'The model recognized it didn\'t have enough data and filled in the gaps with approximations',
    ],
    correct:
      'The model constructs responses that fit the pattern of a good answer, regardless of whether the content is true',
    explanation:
      'AI generates text by constructing what fits the pattern of a good response. It doesn\'t verify truth — it produces what statistically follows. This is why errors can look completely confident. The model isn\'t approximating or searching; it\'s generating based on learned patterns, with no mechanism to distinguish correct from incorrect.',
  },
  {
    id: 'q2',
    section: 'section-2',
    type: 'multiple-choice',
    question:
      'A colleague has both a personal ChatGPT Plus subscription and access to the agency\'s enterprise Copilot. They argue that since both use similar underlying models, the outputs are equivalent. What\'s the critical difference they\'re missing?',
    options: [
      'Enterprise tools produce higher-quality outputs because they\'re fine-tuned for professional work',
      'Personal subscriptions are slower and have lower usage limits than enterprise tools',
      'Enterprise agreements include negotiated data protections that prevent inputs from being used for training — personal subscriptions do not',
      'Enterprise tools have built-in fact-checking that personal subscriptions lack',
    ],
    correct:
      'Enterprise agreements include negotiated data protections that prevent inputs from being used for training — personal subscriptions do not',
    explanation:
      'The underlying model capability may be similar, but the contractual protections are entirely different. Enterprise agreements explicitly prevent your inputs from being used for training and ensure client data doesn\'t leave the environment. A personal subscription has none of those guarantees. The distinction is legal and contractual, not technical.',
  },
  {
    id: 'q3',
    section: 'section-3',
    type: 'multiple-choice',
    question:
      'Your team used Adobe Firefly (an approved, indemnified tool) to generate imagery for a campaign. A third party claims the output resembles their copyrighted work. What does indemnification actually cover in this situation?',
    options: [
      'It guarantees the output is original and no claim can succeed',
      'It means Adobe takes on the legal risk and defense costs for IP claims related to outputs from their native models, used within the terms of the agreement',
      'It covers any legal claim related to the campaign, including claims about the strategy or messaging',
      'It protects the agency only if the output is used exactly as generated, with no modifications',
    ],
    correct:
      'It means Adobe takes on the legal risk and defense costs for IP claims related to outputs from their native models, used within the terms of the agreement',
    explanation:
      'Indemnification is specific: the vendor assumes legal risk for IP infringement claims related to outputs from their tool, when used correctly within the agreement\'s terms. It doesn\'t guarantee originality, doesn\'t cover claims unrelated to the tool\'s output, and doesn\'t extend automatically to third-party models available within the platform. It\'s a meaningful protection with meaningful boundaries.',
  },
  {
    id: 'q4',
    section: 'section-4',
    type: 'multiple-choice',
    question:
      'You\'re preparing a competitive analysis using an approved enterprise AI tool. You have a full client strategy deck, market research with anonymized data, and a spreadsheet of customer contacts with names and email addresses. What\'s the correct approach?',
    options: [
      'Share only high-level summaries from each document to minimize what the tool processes',
      'Paste the strategy deck and anonymized research in full, but strip the customer contact details before sharing the spreadsheet',
      'All three documents can go in fully since the tool is approved and contractually protected',
      'Use the tool only for the anonymized research — the strategy deck and contacts are too sensitive for any AI tool',
    ],
    correct:
      'Paste the strategy deck and anonymized research in full, but strip the customer contact details before sharing the spreadsheet',
    explanation:
      'With approved tools, using full context is acceptable and often produces better output — AI can find connections you might not surface on your own. The strategy deck and anonymized research can go in fully. But personally identifiable information (names, email addresses) must be stripped regardless of the platform. PII handling is a data principle that applies everywhere, not a tool-specific restriction.',
  },
  {
    id: 'q5',
    section: 'section-4',
    type: 'multiple-choice',
    question:
      'You\'re using an approved AI image generation tool for a travel campaign. You need imagery evoking a famous European city\'s atmosphere. The tool accepts your prompt without any warnings. Which statement is most accurate?',
    options: [
      'If the tool accepted the prompt, the output is cleared for commercial use — that\'s what the safety rails are for',
      'You should name the city directly so the AI produces the most accurate and useful result',
      'The tool\'s acceptance doesn\'t determine legal safety — describe architectural qualities, light, and mood rather than naming protected landmarks',
      'Any real-world location is fine to reference by name since places can\'t be copyrighted',
    ],
    correct:
      'The tool\'s acceptance doesn\'t determine legal safety — describe architectural qualities, light, and mood rather than naming protected landmarks',
    explanation:
      'Safety rails in AI tools are helpful but imperfect. A tool accepting your prompt is not legal clearance. Some landmarks and buildings carry trademark protections that apply even to visual references. The correct approach is to describe the qualities you want — architectural style, density, light, mood — rather than naming specific protected locations. The tool\'s guardrails are a first filter, not the final word.',
  },
  {
    id: 'q6',
    section: 'section-5',
    type: 'multiple-choice',
    question:
      'Two team members prompt AI to review the same creative brief. One writes: "Review this brief and give feedback." The other writes: "You are a senior strategist. Review this brief for logical gaps between the audience insight and the proposed creative territory. Be specific about where the connection breaks down." Why does the second prompt produce fundamentally better output?',
    options: [
      'It\'s longer, and longer prompts always produce better results from AI',
      'The role assignment and specific evaluation criteria give the model a consistent perspective and a defined task, shaping what it prioritizes and how rigorously it analyzes',
      'It uses professional terminology that activates higher-quality training data in the model',
      'The first prompt is fine for initial feedback — the second is only necessary for final-stage review',
    ],
    correct:
      'The role assignment and specific evaluation criteria give the model a consistent perspective and a defined task, shaping what it prioritizes and how rigorously it analyzes',
    explanation:
      'Length alone doesn\'t improve output. What matters is that the role ("senior strategist") gives the model a lens that shapes vocabulary, rigor, and priorities, while the specific criteria ("logical gaps between audience insight and creative territory") tells it exactly what to evaluate. Together, they replace AI\'s generic pattern-matching with a focused analytical framework. The model isn\'t smarter — it\'s better directed.',
  },
  {
    id: 'q7',
    section: 'section-5',
    type: 'multiple-choice',
    question:
      'You ask AI to summarize recent project updates, then identify recurring themes and risks, then draft talking points for a client review, then write a meeting agenda — all within the same conversation thread. What is the primary advantage of this approach over asking each question in a separate conversation?',
    options: [
      'It saves time by keeping everything in one window instead of switching between tabs',
      'Each response builds on the accumulated context of the full thread, so the agenda is informed by the themes and risks identified earlier',
      'AI produces more creative output when conversations are longer because it has more examples to draw from',
      'It prevents the AI from contradicting itself, which happens frequently across separate conversations',
    ],
    correct:
      'Each response builds on the accumulated context of the full thread, so the agenda is informed by the themes and risks identified earlier',
    explanation:
      'This is knowledge compounding. In a single thread, AI carries the full context forward. The meeting agenda written in step four isn\'t generic — it\'s built on the themes from step two and the talking points from step three, which were built on the project summary from step one. Separate conversations would produce isolated outputs with no throughline. The compounding effect is the difference between AI as a search engine and AI as a working session.',
  },
  {
    id: 'q8',
    section: 'section-6',
    type: 'multiple-choice',
    question:
      'Campaign assets are due to the client tomorrow. You realize a reference image used in the AI generation process might have a licensing issue. What makes "raise it with your producer now" the right answer, rather than just replacing the image and moving on?',
    options: [
      'Producers need to approve all AI-generated assets before they go to clients',
      'Replacing the output doesn\'t resolve the underlying question about the input — the licensing issue is about the process, not just the final image',
      'Company policy requires documenting every AI interaction with a producer sign-off',
      'Replacing the image might feel like it solves the problem, but a licensing question about a reference used as input doesn\'t disappear when you swap the result — the producer needs to clear the process',
    ],
    correct:
      'Replacing the output doesn\'t resolve the underlying question about the input — the licensing issue is about the process, not just the final image',
    explanation:
      'The timing principle isn\'t just "ask your producer" — it\'s understanding why. Swapping the output is understandable instinct, and in some situations replacing the image might end up being part of the solution. But it doesn\'t address the core question: was the reference image properly licensed for use as an AI input? That\'s a process question, not an output question. Raising it with your producer means the right person can evaluate the full situation — and a five-minute conversation now prevents a five-alarm email later.',
  },
];
