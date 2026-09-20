import fs from 'fs';
import path from 'path';

export interface BRollItem {
  id: string;
  title: string;
  category: 'datacenter' | 'cyberpunk' | 'neural_ai' | 'coding' | 'robotics';
  resolution: '1080p 60FPS' | '4K UHD';
  aspectRatio: '9:16' | '16:9';
  durationSec: number;
  previewVideoUrl: string;
  thumbnailUrl: string;
  tags: string[];
  recommendedScene: string;
  energyLevel: 'high_impact' | 'ambient' | 'steady';
}

export const BROLL_LIBRARY: BRollItem[] = [
  {
    id: 'broll_cyber_01',
    title: 'Cyberpunk Neon Metropolis Flythrough',
    category: 'cyberpunk',
    resolution: '1080p 60FPS',
    aspectRatio: '9:16',
    durationSec: 15,
    previewVideoUrl: '/media/cyberpunk_hailuo.webm',
    thumbnailUrl: '/media/coding_agents_verified_scene_1.jpg',
    tags: ['cyberpunk', 'city', 'neon', 'night', 'futuristic'],
    recommendedScene: '1. Hook (Pattern Interrupt)',
    energyLevel: 'high_impact'
  },
  {
    id: 'broll_datacenter_01',
    title: 'Hyperscale AI Server Racks & Fiber Flow',
    category: 'datacenter',
    resolution: '1080p 60FPS',
    aspectRatio: '9:16',
    durationSec: 18,
    previewVideoUrl: '/media/clip_datacenter.mp4',
    thumbnailUrl: '/media/coding_agents_verified_scene_2.jpg',
    tags: ['datacenter', 'servers', 'hardware', 'nvidia', 'cloud'],
    recommendedScene: '2. AutoFlow Core Tech',
    energyLevel: 'steady'
  },
  {
    id: 'broll_neural_01',
    title: '3D Glowing Neural Network Synaptic Sparks',
    category: 'neural_ai',
    resolution: '1080p 60FPS',
    aspectRatio: '9:16',
    durationSec: 16,
    previewVideoUrl: '/media/clip_ai.webm',
    thumbnailUrl: '/media/coding_agents_verified_scene_3.jpg',
    tags: ['ai', 'neural', 'brain', 'synapse', 'deep learning'],
    recommendedScene: '3. Neural Deep Dive',
    energyLevel: 'high_impact'
  },
  {
    id: 'broll_coding_01',
    title: 'Matrix Terminal Rain & Autopilot IDE',
    category: 'coding',
    resolution: '1080p 60FPS',
    aspectRatio: '9:16',
    durationSec: 20,
    previewVideoUrl: '/media/stormlight-over-fields.webm',
    thumbnailUrl: '/media/coding_agents_verified_scene_4.jpg',
    tags: ['coding', 'developer', 'terminal', 'matrix', 'python'],
    recommendedScene: '4. Autonomous Coding Agent',
    energyLevel: 'ambient'
  },
  {
    id: 'broll_robotics_01',
    title: 'Precision Microchip Assembly & Silicon Architecture',
    category: 'robotics',
    resolution: '1080p 60FPS',
    aspectRatio: '9:16',
    durationSec: 14,
    previewVideoUrl: '/media/1774861278.mp4',
    thumbnailUrl: '/media/coding_agents_verified_scene_5.jpg',
    tags: ['robotics', 'chip', 'silicon', 'hardware', 'assembly'],
    recommendedScene: '5. Architecture & Conclusion',
    energyLevel: 'steady'
  }
];

/**
 * Searches B-Roll clips by query or category
 */
export function searchBRoll(query?: string, category?: string): BRollItem[] {
  let list = BROLL_LIBRARY;
  if (category && category !== 'all') {
    list = list.filter(item => item.category === category);
  }
  if (query && query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  return list;
}

/**
 * Auto-assigns the best B-Roll footages for a given list of scenes
 */
export function matchBRollForScenes(scenes: any[]): Array<{ sceneId: string; broll: BRollItem }> {
  return (scenes || []).map((sc, idx) => {
    const broll = BROLL_LIBRARY[idx % BROLL_LIBRARY.length];
    return {
      sceneId: sc.id || `sc_${idx + 1}`,
      broll
    };
  });
}
