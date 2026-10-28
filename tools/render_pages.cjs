// Snapshot a guide's pages after their scripts have run, for guides whose pages draw their
// content live (panels, canvases). The output is a static copy of the guide folder that
// tools/guide_epub.py can turn into a book.
//
//   node tools/render_pages.cjs <guide-dir> <out-dir> [--width 480]
//
// Each page is opened in headless Chromium at the given width, in light mode (e-ink is
// paper). Then: every canvas becomes a PNG beside the page; custom elements become plain
// divs with what they drew; what the page hides, scripts, players and live readouts go. Needs Playwright; it is
// found through PLAYWRIGHT_DIR (default ~/repos/backlot), and Chromium through CHROMIUM
// (default the Playwright cache).
const { createRequire } = require('module');
const fs = require('fs');
const path = require('path');
const http = require('http');

const HOME = process.env.HOME;
const { chromium } = createRequire(path.join(process.env.PLAYWRIGHT_DIR ?? `${HOME}/repos/backlot`, 'package.json'))('playwright');
const CHROME = process.env.CHROMIUM ?? `${HOME}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`;

const [src, out] = process.argv.slice(2);
const width = Number(process.argv[process.argv.indexOf('--width') + 1]) || 480;
if (!src || !out) { console.error('usage: node tools/render_pages.cjs <guide-dir> <out-dir> [--width 480]'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav' };

(async () => {
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(src, out, { recursive: true });
  const guide = JSON.parse(fs.readFileSync(path.join(src, 'guide.json'), 'utf8'));
  // Serve the source folder so fetch() and modules work as they do in the app.
  const server = http.createServer((req, res) => {
    const root = path.resolve(src);
    const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}/`;

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width, height: 800 }, deviceScaleFactor: 1, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let pages = 0, canvases = 0;
  for (const s of guide.sections ?? []) for (const p of s.pages ?? []) {
    await page.goto(base + p.file, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600); // let panels lay out and draw their resting frame
    const shots = await page.evaluate(() => {
      const list = [];
      document.querySelectorAll('canvas').forEach((c, i) => {
        try { list.push({ i, data: c.toDataURL('image/png') }); } catch { list.push({ i, data: null }); }
      });
      return list;
    });
    const stem = path.basename(p.file, path.extname(p.file));
    const names = shots.map(({ i, data }) => {
      if (!data) return null;
      const name = `${stem}-fig${i + 1}.png`;
      fs.writeFileSync(path.join(out, path.dirname(p.file), name), Buffer.from(data.split(',')[1], 'base64'));
      canvases++;
      return name;
    });
    const html = await page.evaluate((names) => {
      document.querySelectorAll('canvas').forEach((c, i) => {
        if (!names[i]) return c.remove();
        const img = document.createElement('img');
        img.src = names[i]; img.alt = c.getAttribute('aria-label') ?? '';
        c.replaceWith(img);
      });
      // What the page itself hides (cursors, live-only marks) goes, and inline pieces that the
      // page spaces with margin or padding get a real space, so text doesn't run together.
      for (const e of [...document.body.querySelectorAll('*')]) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') { e.remove(); continue; }
        const pcs = e.parentElement && getComputedStyle(e.parentElement);
        const gapped = pcs && /flex|grid/.test(pcs.display) && parseFloat(pcs.columnGap) > 0;
        const spaced = cs.display.startsWith('inline') && (parseFloat(cs.marginLeft) > 0 || parseFloat(cs.paddingLeft) > 0);
        if ((gapped || spaced) && e.previousSibling && !/\s$/.test(e.previousSibling.textContent ?? '')) e.before(' ');
      }
      // Live-only parts: players, transports, "press Play" readouts, buttons.
      document.querySelectorAll('script, button, [aria-live], .m8-transport, .m8-readout').forEach((e) => e.remove());
      document.querySelectorAll('*').forEach((e) => {
        if (e.localName.includes('-')) {
          const d = document.createElement('div');
          d.className = e.className;
          while (e.firstChild) d.appendChild(e.firstChild);
          e.replaceWith(d);
        }
      });
      return '<!doctype html>\n' + document.documentElement.outerHTML;
    }, names);
    fs.writeFileSync(path.join(out, p.file), html);
    pages++;
  }
  await browser.close();
  server.close();
  console.log(`${out}: ${pages} pages rendered, ${canvases} drawings saved${errors.length ? `; page errors: ${errors.join(' | ')}` : ''}`);
})();
