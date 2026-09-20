export interface CodeSnippetAnimation {
  id: string;
  language: 'typescript' | 'python' | 'dockerfile' | 'bash';
  title: string;
  theme: 'tokyo_night' | 'dracula' | 'one_dark_pro' | 'cyberpunk_neon';
  typingSpeedWpm: number;
  highlightLines: number[];
  codeContent: string;
  terminalOutput?: {
    command: string;
    stdout: string[];
    status: 'success' | 'error' | 'healed';
    executionTimeMs: number;
  };
}

export interface CodeAnimatorPackage {
  contentId: string;
  snippets: CodeSnippetAnimation[];
  renderSettings: {
    fps: 60;
    resolution: '1920x1080' | '3840x2160';
    fontFamily: 'Fira Code' | 'JetBrains Mono';
    showLineNumbers: boolean;
    windowFrame: 'mac_dots' | 'minimal_sleek';
  };
}

export class TerminalCodeAnimatorService {
  public generateCodeSnippets(contentId: string): CodeAnimatorPackage {
    const snippets: CodeSnippetAnimation[] = [
      {
        id: `code_${contentId}_orchestrator`,
        language: "typescript",
        title: "src/agents/orchestrator.ts (Self-Healing Loop)",
        theme: "cyberpunk_neon",
        typingSpeedWpm: 160,
        highlightLines: [4, 7, 8],
        codeContent: `export async function runSelfHealingAgent(task: string) {
  const sandbox = await DockerSandbox.create({ memory: '4GB' });
  try {
    return await sandbox.execute(task);
  } catch (error) {
    // ⚡ DeepSeek R1 ga stacktrace yuborib avtomatik tuzatamiz
    const patch = await deepseek.repairCode({ error, task });
    await sandbox.applyPatch(patch);
    return await sandbox.execute(task); // [OK] Muvaffaqiyatli tiklandi
  }
}`,
        terminalOutput: {
          command: "pnpm run start:agent --task=\"scrape-and-analyze\"",
          stdout: [
            "⚡ [INFO] Docker sandbox starting on port 8080...",
            "⚠️ [WARN] Memory spike detected at 3.2GB!",
            "❌ [ERROR] Segmentation fault in sub-worker #3",
            "🤖 [AUTO-HEAL] Sending diagnostic memory dump to DeepSeek R1...",
            "✅ [PATCH APPLIED] Garbage collection thresholds adjusted.",
            "🚀 [SUCCESS] Task completed in 4.12s. 0 data loss."
          ],
          status: "healed",
          executionTimeMs: 4120
        }
      },
      {
        id: `code_${contentId}_docker`,
        language: "dockerfile",
        title: "Dockerfile (Isolated Agent Environment)",
        theme: "tokyo_night",
        typingSpeedWpm: 140,
        highlightLines: [1, 5, 8],
        codeContent: `FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache chromium git bash
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
ENV AGENT_MODE=autonomous
CMD ["pnpm", "start:production"]`,
        terminalOutput: {
          command: "docker build -t neural-pulse/agent:v2.6 .",
          stdout: [
            "[+] Building 2.4s (10/10) FINISHED",
            " => [internal] load build definition from Dockerfile",
            " => => naming to docker.io/neural-pulse/agent:v2.6",
            "Successfully tagged neural-pulse/agent:v2.6"
          ],
          status: "success",
          executionTimeMs: 2400
        }
      }
    ];

    return {
      contentId,
      snippets,
      renderSettings: {
        fps: 60,
        resolution: "1920x1080",
        fontFamily: "JetBrains Mono",
        showLineNumbers: true,
        windowFrame: "mac_dots"
      }
    };
  }
}

export const terminalCodeAnimatorService = new TerminalCodeAnimatorService();
