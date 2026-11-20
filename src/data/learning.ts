/**
 * AI certifications, courses and learning sites for developers, testers, architects
 * and forward deployed engineers.
 *
 * Every URL, title, exam code and status below was checked against the provider's own
 * page on LEARNING_VERIFIED_ON (retired certifications such as Microsoft AI-102 were
 * removed). Exam codes, prices and availability change often, so the page tells
 * readers to confirm on the provider's site.
 */

export const LEARNING_VERIFIED_ON = "2026-11-21";

export type LearningRole = "developer" | "tester" | "architect" | "fde" | "starter";
export type LearningKind = "certification" | "course" | "reference";
/** free: learning and any certificate of completion cost nothing.
 *  free-learn: free to study; the certificate or exam is paid.
 *  exam: a proctored or paid certification exam (check the provider for fees). */
export type LearningCost = "free" | "free-learn" | "exam";
export type LearningLevel = "beginner" | "intermediate" | "advanced";

export interface LearningItem {
  id: string;
  title: string;
  provider: string;
  url: string;
  kind: LearningKind;
  cost: LearningCost;
  level: LearningLevel;
  roles: LearningRole[];
  note: string;
  examCode?: string;
  beta?: boolean;
}

export const LEARNING_ROLES: { id: LearningRole; label: string; short: string; description: string; path: string[]; tip?: string }[] = [
  {
    id: "developer",
    label: "Developers",
    short: "Developer",
    description: "Build features on top of models: APIs, tool use, agents, MCP and AI pair-programming.",
    path: ["anthropic-api", "anthropic-mcp-intro", "anthropic-claude-code-action", "ms-gh-300", "ms-ai-103"],
  },
  {
    id: "tester",
    label: "Testers & QA",
    short: "Tester",
    description: "Test AI features and use AI to test: evals, red-teaming, LLM risks and AI-assisted testing.",
    path: ["anthropic-capabilities", "promptfoo", "owasp-llm", "istqb-genai", "istqb-ai"],
  },
  {
    id: "architect",
    label: "Architects",
    short: "Architect",
    description: "Design reliable, secure, cost-aware AI systems: agent patterns, reference architectures and governance.",
    path: ["anthropic-effective-agents", "aws-genai-lens", "anthropic-mcp-advanced", "anthropic-architect", "ms-ai-500"],
  },
  {
    id: "fde",
    label: "Forward deployed engineers",
    short: "FDE",
    description: "Ship AI into customers' real environments: prototype fast, integrate with their data and tools, and own the outcome.",
    path: ["anthropic-api", "anthropic-claude-code-action", "anthropic-mcp-intro", "palantir-learn", "anthropic-architect"],
    tip: "Anthropic Academy also lists a Claude Forward Deployed Engineer learning path (sign in to Anthropic Academy to see it).",
  },
  {
    id: "starter",
    label: "Getting started",
    short: "Starter",
    description: "New to AI? Learn how models work, what they're good at, and how to use them well — no maths required.",
    path: ["anthropic-ai-fluency", "google-ml-crash", "coursera-genai-everyone", "ms-ai-901"],
  },
];

export const LEARNING_ITEMS: LearningItem[] = [
  // ── Certifications ──────────────────────────────────────────────────────────
  {
    id: "anthropic-architect", title: "Claude Certified Architect – Foundations", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/claude-certified-architect-foundations-certification",
    kind: "certification", cost: "exam", level: "intermediate", roles: ["architect", "fde", "developer"],
    note: "Validates trade-off decisions for real Claude solutions across Claude Code, the Agent SDK, the Claude API and MCP.",
  },
  {
    id: "ms-ai-901", title: "Azure AI Fundamentals", provider: "Microsoft", examCode: "AI-901",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
    kind: "certification", cost: "free-learn", level: "beginner", roles: ["starter", "tester"],
    note: "Entry-level: AI workloads, machine-learning principles, vision, language and generative AI on Azure.",
  },
  {
    id: "ms-ai-103", title: "Azure AI Apps and Agents Developer Associate", provider: "Microsoft", examCode: "AI-103",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/",
    kind: "certification", cost: "free-learn", level: "intermediate", roles: ["developer", "fde"],
    note: "Microsoft's current developer certification for building AI apps and agents on Azure (replaces the retired AI-102).",
  },
  {
    id: "ms-gh-300", title: "GitHub Copilot", provider: "GitHub · Microsoft", examCode: "GH-300",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/github-copilot/",
    kind: "certification", cost: "free-learn", level: "intermediate", roles: ["developer", "tester"],
    note: "Proves you can use Copilot effectively and responsibly across the development and testing workflow.",
  },
  {
    id: "ms-gh-600", title: "GitHub Certified: Agentic AI Developer", provider: "GitHub · Microsoft", examCode: "GH-600",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-developer/",
    kind: "certification", cost: "free-learn", level: "intermediate", roles: ["developer", "fde"],
    note: "For developers building and running agentic AI workflows with GitHub's tooling.",
  },
  {
    id: "ms-ai-500", title: "Multi-Agent AI Solutions Expert", provider: "Microsoft", examCode: "AI-500",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/multi-agent-ai-solutions-expert/",
    kind: "certification", cost: "free-learn", level: "advanced", roles: ["architect"],
    note: "Expert-level: designing and implementing multi-agent AI solutions.",
  },
  {
    id: "ms-ab-100", title: "Agentic AI Business Solutions Architect Expert", provider: "Microsoft", examCode: "AB-100",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-business-solutions-architect/",
    kind: "certification", cost: "free-learn", level: "advanced", roles: ["architect", "fde"],
    note: "Expert-level: architecting agentic AI solutions for business processes on Microsoft's platform.",
  },
  {
    id: "ms-ai-300", title: "Machine Learning Operations Engineer Associate", provider: "Microsoft", examCode: "AI-300",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/operationalizing-machine-learning-and-generative-ai-solutions/",
    kind: "certification", cost: "free-learn", level: "intermediate", roles: ["developer", "architect"],
    note: "Operationalising machine-learning and generative-AI solutions: deployment, monitoring and lifecycle.",
  },
  {
    id: "ms-sc-500", title: "Cloud and AI Security Engineer Associate", provider: "Microsoft", examCode: "SC-500",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/cloud-and-ai-security-engineer-associate/",
    kind: "certification", cost: "free-learn", level: "intermediate", roles: ["architect", "tester"],
    note: "Securing cloud and AI workloads — useful for anyone signing off AI systems for production.",
  },
  {
    id: "ms-az-401", title: "Agentic DevOps Engineer Expert", provider: "Microsoft", examCode: "AZ-401", beta: true,
    url: "https://learn.microsoft.com/en-us/credentials/certifications/agentic-devops-engineer-expert/",
    kind: "certification", cost: "free-learn", level: "advanced", roles: ["tester", "developer"],
    note: "Beta exam for DevOps with AI agents in the pipeline — build, test and release automation.",
  },
  {
    id: "google-pmle", title: "Professional Machine Learning Engineer", provider: "Google Cloud",
    url: "https://cloud.google.com/learn/certification/machine-learning-engineer",
    kind: "certification", cost: "exam", level: "advanced", roles: ["developer", "architect"],
    note: "Designing, building and productionising ML and generative-AI solutions on Google Cloud.",
  },
  {
    id: "google-genai-leader", title: "Generative AI Leader", provider: "Google Cloud",
    url: "https://cloud.google.com/learn/certification/generative-ai-leader",
    kind: "certification", cost: "exam", level: "beginner", roles: ["architect", "fde", "starter"],
    note: "Business-focused and non-technical: how generative AI creates value and how to lead adoption.",
  },
  {
    id: "aws-ai-practitioner", title: "AWS Certified AI Practitioner", provider: "AWS",
    url: "https://aws.amazon.com/certification/certified-ai-practitioner/",
    kind: "certification", cost: "exam", level: "beginner", roles: ["starter", "tester"],
    note: "Foundational knowledge of AI, ML and generative-AI concepts and AWS services.",
  },
  {
    id: "aws-mle", title: "AWS Certified Machine Learning Engineer – Associate", provider: "AWS",
    url: "https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/",
    kind: "certification", cost: "exam", level: "intermediate", roles: ["developer"],
    note: "Building, deploying and maintaining ML solutions and pipelines on AWS.",
  },
  {
    id: "aws-genai-dev", title: "AWS Certified Generative AI Developer – Professional", provider: "AWS",
    url: "https://aws.amazon.com/certification/certified-generative-ai-developer-professional/",
    kind: "certification", cost: "exam", level: "advanced", roles: ["developer", "fde", "architect"],
    note: "Professional-level: integrating foundation models, RAG and agents into production applications on AWS.",
  },
  {
    id: "istqb-ai", title: "Certified Tester AI Testing (CT-AI) v2.0", provider: "ISTQB", examCode: "CT-AI",
    url: "https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/",
    kind: "certification", cost: "exam", level: "intermediate", roles: ["tester"],
    note: "The testing profession's certification for testing AI-based systems. Version 2.0 replaces v1.",
  },
  {
    id: "istqb-genai", title: "Certified Tester Testing with Generative AI", provider: "ISTQB", examCode: "CT-GenAI",
    url: "https://istqb.org/certifications/gen-ai/",
    kind: "certification", cost: "exam", level: "intermediate", roles: ["tester"],
    note: "Using generative AI in day-to-day testing: prompting for test design, risks, and adoption in a test team.",
  },
  {
    id: "nvidia-genl", title: "NVIDIA-Certified Associate: Generative AI LLMs", provider: "NVIDIA", examCode: "NCA-GENL",
    url: "https://www.nvidia.com/en-us/learn/certification/generative-ai-llm-associate/",
    kind: "certification", cost: "exam", level: "intermediate", roles: ["developer"],
    note: "Associate-level: fundamentals of developing, integrating and maintaining LLM-based applications.",
  },
  {
    id: "databricks-genai", title: "Databricks Certified Generative AI Engineer Associate", provider: "Databricks",
    url: "https://www.databricks.com/learn/certification/genai-engineer-associate",
    kind: "certification", cost: "exam", level: "intermediate", roles: ["developer", "fde"],
    note: "Designing and deploying LLM applications, RAG and agents on the Databricks platform.",
  },

  // ── Courses ─────────────────────────────────────────────────────────────────
  {
    id: "anthropic-api", title: "Building with the Claude API", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/claude-with-the-anthropic-api",
    kind: "course", cost: "free", level: "intermediate", roles: ["developer", "fde"],
    note: "Anthropic Academy: build applications on the Claude API, from first request to production patterns.",
  },
  {
    id: "anthropic-claude-code-101", title: "Claude Code 101", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/claude-code-101",
    kind: "course", cost: "free", level: "beginner", roles: ["developer", "tester"],
    note: "Anthropic Academy: use Claude Code effectively in your daily development workflow.",
  },
  {
    id: "anthropic-claude-code-action", title: "Claude Code in Action", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/claude-code-in-action",
    kind: "course", cost: "free", level: "intermediate", roles: ["developer", "fde"],
    note: "Anthropic Academy: run long, hands-off Claude Code sessions you can trust — steer, configure, automate.",
  },
  {
    id: "anthropic-mcp-intro", title: "Introduction to Model Context Protocol", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/introduction-to-model-context-protocol",
    kind: "course", cost: "free", level: "intermediate", roles: ["developer", "fde", "architect"],
    note: "Anthropic Academy: build MCP servers and clients to connect models to tools and data.",
  },
  {
    id: "anthropic-mcp-advanced", title: "Model Context Protocol: Advanced Topics", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/model-context-protocol-advanced-topics",
    kind: "course", cost: "free", level: "advanced", roles: ["developer", "architect"],
    note: "Anthropic Academy: MCP topics beyond the basics, after the introductory course.",
  },
  {
    id: "anthropic-ai-fluency", title: "AI Fluency: Framework & Foundations", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/ai-fluency-framework-foundations",
    kind: "course", cost: "free", level: "beginner", roles: ["starter", "tester", "fde"],
    note: "Anthropic Academy: a practical framework for collaborating with AI effectively and responsibly.",
  },
  {
    id: "anthropic-capabilities", title: "AI Capabilities and Limitations", provider: "Anthropic",
    url: "https://anthropic.skilljar.com/ai-capabilities-and-limitations",
    kind: "course", cost: "free", level: "beginner", roles: ["starter", "tester"],
    note: "Anthropic Academy: how AI works and where it fails — essential context before you test it.",
  },
  {
    id: "openai-academy", title: "OpenAI Academy", provider: "OpenAI",
    url: "https://academy.openai.com/",
    kind: "course", cost: "free", level: "beginner", roles: ["starter", "developer"],
    note: "OpenAI's free learning hub with courses on using ChatGPT and building with OpenAI models.",
  },
  {
    id: "hf-agents", title: "AI Agents Course", provider: "Hugging Face",
    url: "https://huggingface.co/learn/agents-course",
    kind: "course", cost: "free", level: "intermediate", roles: ["developer", "fde"],
    note: "Free course from agent fundamentals to frameworks and a final project, with a certificate.",
  },
  {
    id: "hf-llm", title: "LLM Course", provider: "Hugging Face",
    url: "https://huggingface.co/learn/llm-course",
    kind: "course", cost: "free", level: "intermediate", roles: ["developer"],
    note: "Transformers, tokenizers, fine-tuning and sharing models with the Hugging Face ecosystem.",
  },
  {
    id: "dlai-courses", title: "DeepLearning.AI courses", provider: "DeepLearning.AI",
    url: "https://www.deeplearning.ai/courses",
    kind: "course", cost: "free-learn", level: "beginner", roles: ["developer", "starter", "fde"],
    note: "Andrew Ng's catalogue, including many short, hands-on courses made with leading AI companies.",
  },
  {
    id: "coursera-ml", title: "Machine Learning Specialization", provider: "Coursera · DeepLearning.AI",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    kind: "course", cost: "free-learn", level: "beginner", roles: ["developer", "starter"],
    note: "Andrew Ng's foundational ML course. Coursera certificates are paid; financial aid is available.",
  },
  {
    id: "coursera-dl", title: "Deep Learning Specialization", provider: "Coursera · DeepLearning.AI",
    url: "https://www.coursera.org/specializations/deep-learning",
    kind: "course", cost: "free-learn", level: "intermediate", roles: ["developer"],
    note: "Neural networks, CNNs, sequence models and transformers from Andrew Ng.",
  },
  {
    id: "coursera-genai-everyone", title: "Generative AI for Everyone", provider: "Coursera · DeepLearning.AI",
    url: "https://www.coursera.org/learn/generative-ai-for-everyone",
    kind: "course", cost: "free-learn", level: "beginner", roles: ["starter", "fde", "architect"],
    note: "Andrew Ng's non-technical intro: what generative AI can do and how to use it in work and projects.",
  },
  {
    id: "fastai", title: "Practical Deep Learning for Coders", provider: "fast.ai",
    url: "https://course.fast.ai/",
    kind: "course", cost: "free", level: "intermediate", roles: ["developer"],
    note: "Jeremy Howard's free, code-first course: train state-of-the-art models from lesson one.",
  },
  {
    id: "google-ml-crash", title: "Machine Learning Crash Course", provider: "Google",
    url: "https://developers.google.com/machine-learning/crash-course",
    kind: "course", cost: "free", level: "beginner", roles: ["starter", "developer"],
    note: "Google's free, fast-paced ML fundamentals with interactive visualisations and exercises.",
  },
  {
    id: "kaggle-learn", title: "Kaggle Learn", provider: "Kaggle",
    url: "https://www.kaggle.com/learn",
    kind: "course", cost: "free", level: "beginner", roles: ["starter", "developer"],
    note: "Short, free, hands-on courses (Python, ML, deep learning, and more) with certificates.",
  },
  {
    id: "ms-learn", title: "Microsoft Learn training", provider: "Microsoft",
    url: "https://learn.microsoft.com/en-us/training/",
    kind: "course", cost: "free", level: "beginner", roles: ["developer", "architect", "tester", "starter"],
    note: "Free learning paths for every Microsoft certification above, plus free Applied Skills assessments.",
  },
  {
    id: "google-skills", title: "Google Skills", provider: "Google Cloud",
    url: "https://www.skills.google/",
    kind: "course", cost: "free-learn", level: "beginner", roles: ["developer", "architect"],
    note: "Google Cloud's training platform (formerly Cloud Skills Boost): courses, hands-on labs and skill badges.",
  },
  {
    id: "aws-skill-builder", title: "AWS Skill Builder", provider: "AWS",
    url: "https://skillbuilder.aws/",
    kind: "course", cost: "free-learn", level: "beginner", roles: ["developer", "architect"],
    note: "AWS training with free courses and exam prep for the AWS certifications above.",
  },
  {
    id: "palantir-learn", title: "Palantir Learn", provider: "Palantir",
    url: "https://learn.palantir.com/",
    kind: "course", cost: "free", level: "intermediate", roles: ["fde"],
    note: "Training for Foundry and AIP from Palantir, the company that pioneered the forward deployed engineer role.",
  },

  // ── Learning sites & references ─────────────────────────────────────────────
  {
    id: "mdn", title: "MDN Web Docs", provider: "Mozilla",
    url: "https://developer.mozilla.org/en-US/",
    kind: "reference", cost: "free", level: "beginner", roles: ["developer", "tester", "starter"],
    note: "The reference for HTML, CSS, JavaScript and Web APIs — the foundation under every AI web app.",
  },
  {
    id: "webdev", title: "web.dev Learn", provider: "Google",
    url: "https://web.dev/learn",
    kind: "reference", cost: "free", level: "beginner", roles: ["developer", "tester"],
    note: "Structured courses on modern web development: performance, accessibility, CSS and more.",
  },
  {
    id: "freecodecamp", title: "freeCodeCamp", provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn",
    kind: "reference", cost: "free", level: "beginner", roles: ["starter", "developer"],
    note: "A free, project-based curriculum for learning to code.",
  },
  {
    id: "roadmap-ai", title: "AI Engineer Roadmap", provider: "roadmap.sh",
    url: "https://roadmap.sh/ai-engineer",
    kind: "reference", cost: "free", level: "beginner", roles: ["developer", "starter", "fde"],
    note: "A visual, community-maintained roadmap of what to learn to become an AI engineer.",
  },
  {
    id: "claude-docs", title: "Claude Platform Docs", provider: "Anthropic",
    url: "https://platform.claude.com/docs",
    kind: "reference", cost: "free", level: "intermediate", roles: ["developer", "fde"],
    note: "Official docs for the Claude API, tool use, prompt engineering, Agent SDK and Claude Code.",
  },
  {
    id: "anthropic-effective-agents", title: "Building effective agents", provider: "Anthropic",
    url: "https://www.anthropic.com/research/building-effective-agents",
    kind: "reference", cost: "free", level: "intermediate", roles: ["architect", "fde", "developer"],
    note: "Anthropic's widely cited guide to agent patterns — when to use workflows vs agents, and how to keep them simple.",
  },
  {
    id: "openai-docs", title: "OpenAI API docs", provider: "OpenAI",
    url: "https://developers.openai.com/api/docs",
    kind: "reference", cost: "free", level: "intermediate", roles: ["developer", "fde"],
    note: "Official guides and reference for building with OpenAI models.",
  },
  {
    id: "openai-cookbook", title: "OpenAI Cookbook", provider: "OpenAI",
    url: "https://developers.openai.com/cookbook",
    kind: "reference", cost: "free", level: "intermediate", roles: ["developer", "fde"],
    note: "Runnable examples for common tasks with the OpenAI API.",
  },
  {
    id: "azure-ai-architecture", title: "AI architecture design", provider: "Azure Architecture Center",
    url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/ai-get-started",
    kind: "reference", cost: "free", level: "advanced", roles: ["architect"],
    note: "Microsoft's reference architectures and guidance for designing AI and agent workloads.",
  },
  {
    id: "gcp-ai-architecture", title: "AI and ML architecture", provider: "Google Cloud Architecture Center",
    url: "https://docs.cloud.google.com/architecture/ai-ml",
    kind: "reference", cost: "free", level: "advanced", roles: ["architect"],
    note: "Google Cloud's reference architectures and best practices for AI and ML systems.",
  },
  {
    id: "aws-genai-lens", title: "Well-Architected Generative AI Lens", provider: "AWS",
    url: "https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html",
    kind: "reference", cost: "free", level: "advanced", roles: ["architect"],
    note: "Design principles for generative-AI workloads across reliability, security, cost and operations.",
  },
  {
    id: "owasp-llm", title: "OWASP Top 10 for LLM Applications", provider: "OWASP",
    url: "https://genai.owasp.org/llm-top-10/",
    kind: "reference", cost: "free", level: "intermediate", roles: ["tester", "architect"],
    note: "The top security risks in LLM apps — prompt injection, data leakage, excessive agency and more.",
  },
  {
    id: "nist-ai-rmf", title: "AI Risk Management Framework", provider: "NIST",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    kind: "reference", cost: "free", level: "advanced", roles: ["architect"],
    note: "The US standards body's framework for managing AI risk — widely used for governance.",
  },
  {
    id: "promptfoo", title: "Promptfoo", provider: "Promptfoo",
    url: "https://www.promptfoo.dev/docs/intro/",
    kind: "reference", cost: "free", level: "intermediate", roles: ["tester", "developer"],
    note: "Open-source tool to test prompts, evaluate LLM output and red-team AI apps in CI.",
  },
  {
    id: "deepeval", title: "DeepEval", provider: "Confident AI",
    url: "https://deepeval.com/docs/getting-started",
    kind: "reference", cost: "free", level: "intermediate", roles: ["tester", "developer"],
    note: "Open-source framework for unit-testing LLM outputs with metrics like faithfulness and relevance.",
  },
  {
    id: "playwright", title: "Playwright", provider: "Microsoft",
    url: "https://playwright.dev/",
    kind: "reference", cost: "free", level: "intermediate", roles: ["tester"],
    note: "Reliable end-to-end testing for web apps — the standard tool for testing AI-powered UIs.",
  },
];
