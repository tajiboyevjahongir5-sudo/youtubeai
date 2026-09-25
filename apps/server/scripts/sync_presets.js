const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../../data/content_store.json');
const defaultDeepseek = {
  id: 'item_deepseek_vs_gemini',
  workspaceId: 'ws_j7ktjxw0',
  title: 'DeepSeek R1 vs OpenAI o3: Which AI Is ACTUALLY Smarter? #Shorts',
  status: 'review',
  videoFormat: 'shorts',
  contentPillar: 'educational',
  duration: '0:49',
  durationSeconds: 48.98,
  videoUrl: '/media/videos/item_deepseek_vs_gemini.mp4',
  thumbnailUrl: '/media/videos/item_deepseek_vs_gemini_thumb.jpg',
  brief: "DeepSeek R1 va OpenAI o3 o'rtasidagi real kodlash, mantiq va matematik taqqoslash benchmarki.",
  targetAudience: 'Tech Leaders, AI Engineers, Students',
  script: `[0:00 - 0:04] HOOK:
"Can a free open-source model like DeepSeek R1 beat a 200-dollar-a-month OpenAI o3 subscription? We ran 100 benchmark tests."

[0:05 - 0:17] ROUND 1 (Competitive Coding & LeetCode Hard):
"Round 1: Complex algorithmic DP optimization. DeepSeek solved it in 18 seconds using recursive chain-of-thought. OpenAI matched it with 2% fewer tokens."

[0:18 - 0:31] ROUND 2 (Cost & Open Source Privacy):
"Round 2: Economics. Running DeepSeek locally costs virtually zero dollars per million tokens, while cloud proprietary models drain your budget."

[0:32 - 0:43] THE VERDICT:
"OpenAI still edges out in raw edge-case reasoning, but DeepSeek is the indisputable champion of price-to-performance."

[0:44 - 0:54] OUTRO & CTA:
"Which model are you using in production? Comment below, subscribe to Neural Pulse AI, and see you tomorrow!"`,
  scenes: [
    { id: 'hook', title: '1. Shock Benchmark Hook', time: 0, tag: '🚨 DeepSeek vs o3' },
    { id: 'round1', title: '2. LeetCode Coding Test', time: 10, tag: '⚡ Kodlash Testi' },
    { id: 'round2', title: '3. Narx & Maxfiylik', time: 22, tag: '💰 Xarajat Tahlili' },
    { id: 'verdict', title: '4. Aniq Hukm', time: 33, tag: '🏆 G\'olib Model' },
    { id: 'outro', title: '5. Obuna & CTA', time: 45, tag: '🔔 Obuna CTA' }
  ],
  description: `DeepSeek R1 vs OpenAI o3 head-to-head benchmark comparison. Cost, coding reasoning, and local deployment.\n\n#deepseek #openai #benchmarks #ai #shorts #tech`,
  tags: ['deepseek r1', 'openai o3', 'gemini 2.5', 'ai benchmark', 'coding', 'shorts'],
  seoScore: 99,
  scheduledAt: new Date(Date.now() + 28800000).toISOString(),
  createdAt: new Date().toISOString()
};

let store = {};
if (fs.existsSync(storePath)) {
  try {
    store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } catch (e) {}
}
store['item_deepseek_vs_gemini'] = defaultDeepseek;
fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('✅ Content store synchronized successfully for item_deepseek_vs_gemini!');
