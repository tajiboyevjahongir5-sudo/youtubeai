const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(process.cwd(), '../web/dist')
];

const dest = path.resolve(__dirname, '../public/dist');

for (const src of candidates) {
  if (fs.existsSync(src) && fs.existsSync(path.join(src, 'index.html'))) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`✅ [Build] Web frontend dist nusxalandi: ${src} -> ${dest}`);
    break;
  }
}
