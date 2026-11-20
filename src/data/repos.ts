import { REPO_SNAPSHOT } from "./repoSnapshot";

/**
 * Hand-picked AI repositories for developers. Live stars, descriptions and activity
 * come from the GitHub API at runtime; REPO_SNAPSHOT (refresh with
 * `npm run repos:snapshot`) is the offline fallback.
 */

export type RepoCategory = "agents" | "learn" | "courses" | "frameworks" | "models" | "mcp";

export const REPO_CATEGORIES: { id: RepoCategory; label: string; description: string }[] = [
  { id: "agents", label: "Coding agents", description: "AI pair-programmers, agent skills and the configs that make them better." },
  { id: "learn", label: "LLMs from scratch", description: "Build and train language models yourself to really understand them." },
  { id: "courses", label: "Courses & cookbooks", description: "Structured lessons and copy-paste recipes from the model makers." },
  { id: "frameworks", label: "Agent frameworks", description: "Libraries for building multi-step, tool-using AI applications." },
  { id: "models", label: "Run & fine-tune", description: "Serve open models locally or at scale, and fine-tune them cheaply." },
  { id: "mcp", label: "MCP", description: "The Model Context Protocol: connect models to tools and data." },
];

export interface CuratedRepo {
  /** owner/name exactly as on GitHub */
  fullName: string;
  category: RepoCategory;
  /** Why it's worth a developer's time (our words, not GitHub's description). */
  note: string;
  /** Shown first in "Start here". */
  featured?: boolean;
}

export const CURATED_REPOS: CuratedRepo[] = [
  // Coding agents
  { fullName: "github/awesome-copilot", category: "agents", featured: true, note: "Community instructions, custom agents, skills and configs to get far more out of GitHub Copilot." },
  { fullName: "addyosmani/agent-skills", category: "agents", featured: true, note: "Addy Osmani's production-grade engineering skills that make AI coding agents work like senior engineers." },
  { fullName: "anthropics/claude-code", category: "agents", note: "Anthropic's agentic coding tool that lives in your terminal and understands your codebase." },
  { fullName: "openai/codex", category: "agents", note: "OpenAI's lightweight open-source coding agent for the terminal, written in Rust." },
  { fullName: "google-gemini/gemini-cli", category: "agents", note: "Google's open-source agent that brings Gemini into your terminal." },
  { fullName: "anthropics/skills", category: "agents", note: "Anthropic's public Agent Skills: folders of instructions and scripts agents load on demand." },
  { fullName: "andrewyng/context-hub", category: "agents", note: "Andrew Ng's curated, versioned docs for coding agents so they stop hallucinating APIs (the chub CLI)." },
  { fullName: "hesreallyhim/awesome-claude-code", category: "agents", note: "A hand-picked list of the best commands, workflows, hooks and tools for Claude Code." },
  { fullName: "addyosmani/gemini-cli-tips", category: "agents", note: "Addy Osmani's practical tips and tricks for getting the most out of Gemini CLI." },

  // LLMs from scratch
  { fullName: "karpathy/nanochat", category: "learn", featured: true, note: "Karpathy's full-stack ChatGPT clone — tokenizer to web UI — that you can train for about $100." },
  { fullName: "karpathy/nanoGPT", category: "learn", note: "The simplest, fastest code for training and fine-tuning medium-sized GPTs. A classic." },
  { fullName: "rasbt/LLMs-from-scratch", category: "learn", featured: true, note: "Sebastian Raschka's step-by-step build of a ChatGPT-like model in PyTorch, from his book." },
  { fullName: "karpathy/nn-zero-to-hero", category: "learn", note: "Code for Karpathy's video course: neural networks built from the ground up to GPT." },
  { fullName: "mlabonne/llm-course", category: "learn", note: "Roadmaps and Colab notebooks covering LLM fundamentals, the scientist path and the engineer path." },
  { fullName: "karpathy/llm.c", category: "learn", note: "LLM training in simple, raw C/CUDA — see exactly what the frameworks hide." },
  { fullName: "karpathy/micrograd", category: "learn", note: "A tiny autograd engine: the clearest way to understand backpropagation." },
  { fullName: "karpathy/autoresearch", category: "learn", note: "AI agents that run research experiments on single-GPU nanochat training by themselves." },
  { fullName: "rasbt/reasoning-from-scratch", category: "learn", note: "Sebastian Raschka's follow-up: implement a reasoning LLM in PyTorch, step by step." },
  { fullName: "lucidrains/x-transformers", category: "learn", note: "Phil Wang's concise, complete transformer with many research tricks you can switch on and study." },
  { fullName: "mlabonne/llm-datasets", category: "learn", note: "Maxime Labonne's curated datasets and tools for post-training (fine-tuning) LLMs." },

  // Courses & cookbooks
  { fullName: "microsoft/generative-ai-for-beginners", category: "courses", featured: true, note: "Microsoft's 21-lesson course for building real applications with generative AI." },
  { fullName: "microsoft/ai-agents-for-beginners", category: "courses", note: "Microsoft's 18 lessons on designing and building AI agents." },
  { fullName: "huggingface/agents-course", category: "courses", note: "Hugging Face's free course on agents, from theory to deployed projects." },
  { fullName: "anthropics/claude-cookbooks", category: "courses", note: "Anthropic's notebooks and recipes: tool use, RAG, evals, prompt caching and more." },
  { fullName: "openai/openai-cookbook", category: "courses", note: "OpenAI's examples and guides for common tasks with the OpenAI API." },
  { fullName: "dair-ai/Prompt-Engineering-Guide", category: "courses", note: "Guides, papers and lessons on prompting, context engineering, RAG and agents." },
  { fullName: "f/prompts.chat", category: "courses", note: "Formerly Awesome ChatGPT Prompts: a huge, community-built prompt library." },
  { fullName: "fastai/fastbook", category: "courses", note: "Jeremy Howard's fast.ai book as runnable Jupyter notebooks — practical deep learning, top-down." },
  { fullName: "chiphuyen/aie-book", category: "courses", note: "Chip Huyen's resources for AI engineers, alongside her book AI Engineering." },
  { fullName: "HandsOnLLM/Hands-On-Large-Language-Models", category: "courses", note: "Code for Jay Alammar and Maarten Grootendorst's visual, hands-on O'Reilly book on LLMs." },
  { fullName: "swyxio/ai-notes", category: "courses", note: "swyx's running notes for software engineers getting up to speed on AI." },

  // Agent frameworks
  { fullName: "andrewyng/aisuite", category: "frameworks", featured: true, note: "Andrew Ng's simple, unified interface for calling many AI providers with one API." },
  { fullName: "andrewyng/openworker", category: "frameworks", note: "Andrew Ng's open-source AI coworker: a desktop app plus a harness SDK for building agentic apps." },
  { fullName: "andrewyng/translation-agent", category: "frameworks", note: "Andrew Ng's agentic translation workflow: translate, reflect on the result, then improve it." },
  { fullName: "langchain-ai/langgraph", category: "frameworks", note: "Build resilient, stateful agents as graphs, with persistence and human-in-the-loop." },
  { fullName: "openai/openai-agents-python", category: "frameworks", note: "OpenAI's lightweight framework for multi-agent workflows with handoffs and guardrails." },
  { fullName: "crewAIInc/crewAI", category: "frameworks", note: "Orchestrate teams of role-playing, autonomous agents that collaborate on tasks." },
  { fullName: "browser-use/browser-use", category: "frameworks", note: "Let AI agents control a real browser to complete tasks on the web." },
  { fullName: "run-llama/llama_index", category: "frameworks", note: "Connect LLMs to your documents and data: parsing, indexing and retrieval." },
  { fullName: "Shubhamsaboo/awesome-llm-apps", category: "frameworks", note: "100+ runnable agent, RAG and LLM app examples to learn from and fork." },

  // Run & fine-tune models
  { fullName: "ollama/ollama", category: "models", featured: true, note: "Run open models (Qwen, DeepSeek, gpt-oss, Gemma and more) locally with one command." },
  { fullName: "ggml-org/llama.cpp", category: "models", note: "Fast LLM inference in plain C/C++ on almost any hardware — the engine behind many local tools." },
  { fullName: "ggml-org/whisper.cpp", category: "models", note: "Georgi Gerganov's fast, local speech-to-text: OpenAI's Whisper in plain C/C++." },
  { fullName: "simonw/llm", category: "models", note: "Simon Willison's CLI and Python library for prompting cloud and local models, with logging to SQLite." },
  { fullName: "vllm-project/vllm", category: "models", note: "High-throughput, memory-efficient serving engine for LLMs in production." },
  { fullName: "unslothai/unsloth", category: "models", note: "Fine-tune and run open models faster with far less GPU memory." },
  { fullName: "huggingface/transformers", category: "models", note: "The standard library of model definitions for text, vision, audio and multimodal models." },

  // MCP
  { fullName: "modelcontextprotocol/servers", category: "mcp", featured: true, note: "Reference MCP servers (filesystem, git, fetch, memory…) to plug tools into any MCP client." },
  { fullName: "modelcontextprotocol/modelcontextprotocol", category: "mcp", note: "The MCP specification and documentation — start here to build your own server or client." },
  { fullName: "punkpeye/awesome-mcp-servers", category: "mcp", note: "A large, categorised directory of community MCP servers." },
];

/**
 * People who shape how developers build with AI. `owners` are the GitHub accounts
 * (personal or organisation) whose curated repos belong to them.
 */
export interface RepoPerson {
  id: string;
  name: string;
  /** GitHub login used for the avatar and profile link. */
  login: string;
  owners: string[];
  role: string;
}

export const REPO_PEOPLE: RepoPerson[] = [
  { id: "karpathy", name: "Andrej Karpathy", login: "karpathy", owners: ["karpathy"], role: "OpenAI founding member and former Tesla AI director; teaches LLMs from first principles." },
  { id: "andrewng", name: "Andrew Ng", login: "andrewyng", owners: ["andrewyng"], role: "Founder of DeepLearning.AI; co-founder of Coursera and Google Brain." },
  { id: "addyosmani", name: "Addy Osmani", login: "addyosmani", owners: ["addyosmani"], role: "Engineering leader at Google; writes on AI-assisted software engineering." },
  { id: "rasbt", name: "Sebastian Raschka", login: "rasbt", owners: ["rasbt"], role: "ML researcher; author of Build a Large Language Model (From Scratch)." },
  { id: "jph00", name: "Jeremy Howard", login: "jph00", owners: ["jph00", "fastai"], role: "Co-founder of fast.ai and Answer.AI; pioneer of practical deep learning education." },
  { id: "simonw", name: "Simon Willison", login: "simonw", owners: ["simonw"], role: "Co-creator of Django; builds open-source tools for working with LLMs." },
  { id: "chiphuyen", name: "Chip Huyen", login: "chiphuyen", owners: ["chiphuyen"], role: "Author of AI Engineering and Designing Machine Learning Systems." },
  { id: "ggerganov", name: "Georgi Gerganov", login: "ggerganov", owners: ["ggerganov", "ggml-org"], role: "Creator of llama.cpp, whisper.cpp and the ggml tensor library." },
  { id: "lucidrains", name: "Phil Wang", login: "lucidrains", owners: ["lucidrains"], role: "Prolific open-source implementer of AI research papers in PyTorch." },
  { id: "jalammar", name: "Jay Alammar", login: "jalammar", owners: ["jalammar", "HandsOnLLM"], role: "Author of The Illustrated Transformer; co-author of Hands-On Large Language Models." },
  { id: "mlabonne", name: "Maxime Labonne", login: "mlabonne", owners: ["mlabonne"], role: "LLM researcher; author of the LLM Course and LLM Engineer's Handbook." },
  { id: "hwchase17", name: "Harrison Chase", login: "hwchase17", owners: ["hwchase17", "langchain-ai"], role: "Co-founder and CEO of LangChain." },
  { id: "swyx", name: "swyx", login: "swyxio", owners: ["swyxio"], role: "Founder of Latent Space; popularised the term \"AI engineer\"." },
];

export function reposByPerson(person: RepoPerson): CuratedRepo[] {
  const owners = person.owners.map((owner) => owner.toLowerCase());
  return CURATED_REPOS.filter((repo) => owners.includes(repo.fullName.split("/")[0].toLowerCase()));
}

export { REPO_SNAPSHOT };
