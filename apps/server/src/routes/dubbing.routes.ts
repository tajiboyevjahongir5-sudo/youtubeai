import { Router } from 'express';
import { SUPPORTED_DUB_LANGUAGES, translateContentForDubbing } from '../services/dubbing.service';

const router = Router({ mergeParams: true });

// Get supported dubbing languages
router.get('/languages', (req, res) => {
  res.json({ success: true, languages: SUPPORTED_DUB_LANGUAGES });
});

// Translate and prepare dubbed version
router.post('/translate', async (req, res) => {
  const { targetLanguage, title, description, script, scenes, pinnedComment } = req.body;

  if (!targetLanguage || !title) {
    return res.status(400).json({ error: 'targetLanguage va title majburiy' });
  }

  try {
    const pkg = await translateContentForDubbing({
      title,
      description: description || '',
      script: script || '',
      scenes: scenes || [],
      pinnedComment
    }, targetLanguage);

    res.json({ success: true, dubbedPackage: pkg });
  } catch (err: any) {
    res.status(500).json({ error: 'Dublyaj tarjimasida xatolik yuz berdi: ' + err.message });
  }
});

export default router;
