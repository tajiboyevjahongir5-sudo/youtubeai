import { Router } from 'express';
import {
  SUPPORTED_DUB_LANGUAGES,
  translateContentForDubbing,
  synthesizeVoicePreview,
  applyDubbingToContent,
  getSavedDubbingsForContent
} from '../services/dubbing.service';

const router = Router({ mergeParams: true });

// Get supported dubbing languages and voice models
router.get('/languages', (req, res) => {
  res.json({ success: true, languages: SUPPORTED_DUB_LANGUAGES });
});

// Synthesize or preview voice sample
router.post('/preview-audio', async (req, res) => {
  const { voiceModel, sampleText, rate, pitch } = req.body;
  if (!voiceModel) {
    return res.status(400).json({ error: 'voiceModel parametri majburiy' });
  }

  try {
    const result = await synthesizeVoicePreview(voiceModel, sampleText, rate, pitch);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Ovoz namunasini generatsiya qilishda xatolik: ' + err.message });
  }
});

// Translate and prepare dubbed version with full audio
router.post('/translate', async (req, res) => {
  const {
    targetLanguage,
    voiceModel,
    rate,
    pitch,
    title,
    description,
    script,
    scenes,
    pinnedComment
  } = req.body;

  if (!targetLanguage || !title) {
    return res.status(400).json({ error: 'targetLanguage va title majburiy' });
  }

  try {
    const pkg = await translateContentForDubbing(
      {
        title,
        description: description || '',
        script: script || '',
        scenes: scenes || [],
        pinnedComment
      },
      targetLanguage,
      voiceModel,
      rate || '+14%',
      pitch || '+0Hz',
      true
    );

    res.json({ success: true, dubbedPackage: pkg });
  } catch (err: any) {
    res.status(500).json({ error: 'Dublyaj tarjimasida xatolik yuz berdi: ' + err.message });
  }
});

// Save or apply dubbed package to content
router.post('/apply/:contentId', async (req, res) => {
  const { contentId } = req.params;
  const workspaceId = (req.params as any).workspaceId || 'ws_default';
  const { dubbedPackage } = req.body;

  if (!dubbedPackage) {
    return res.status(400).json({ error: 'dubbedPackage parametri majburiy' });
  }

  try {
    const result = await applyDubbingToContent(contentId, dubbedPackage, workspaceId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Dublyajni saqlashda xatolik: ' + err.message });
  }
});

// List saved dubbed versions for content
router.get('/content/:contentId', (req, res) => {
  const { contentId } = req.params;
  const workspaceId = (req.params as any).workspaceId || 'ws_default';
  try {
    const dubbings = getSavedDubbingsForContent(contentId, workspaceId);
    res.json({ success: true, dubbings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
