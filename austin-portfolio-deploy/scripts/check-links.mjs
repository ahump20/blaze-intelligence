// scripts/check-links.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';

const ROOTS = ['.', 'site'];               // scan your pages here
const EXTS  = new Set(['.html', '.htm']);  // add .md, .tsx, etc. if you embed links there
const TIMEOUT_SEC = 10;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith('.') && !e.name.includes('node_modules')) {
      yield* walk(p);
    } else if (EXTS.has(path.extname(e.name))) {
      yield p;
    }
  }
}

const linkRe = /(href|src)=["']([^"']+)["']/g;
const links = new Set();

// Function to validate URLs before checking
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Skip non-HTTP URLs, fragments, data URLs, etc.
  if (url.startsWith('mailto:') || url.startsWith('javascript:') || 
      url.startsWith('#') || url.startsWith('data:') || 
      url.startsWith('tel:') || url.startsWith('sms:')) return false;
  
  // Skip empty or whitespace-only URLs
  if (!url.trim()) return false;
  
  // Skip URLs with spaces (likely malformed)
  if (url.includes(' ')) return false;
  
  // Skip template/placeholder URLs
  if (url.includes('{{') || url.includes('{%') || url.includes('<%')) return false;
  
  return true;
}
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    const txt = fs.readFileSync(file,'utf8');
    for (const m of txt.matchAll(linkRe)) {
      const u = m[2];
      if (isValidUrl(u)) {
        links.add(u);
      }
    }
  }
}

const base = process.env.SITE_BASE ?? 'https://blaze-intelligence.netlify.app';
const results = [];
function curl(url) {
  try {
    // Escape the URL properly for shell execution
    const escapedUrl = url.replace(/"/g, '\\"');
    const out = execSync(`curl -I -sS -m ${TIMEOUT_SEC} -o /dev/null -w "%{http_code}" "${escapedUrl}"`, {
      stdio: 'pipe',
      encoding: 'utf8'
    }).toString().trim();
    const code = parseInt(out, 10);
    return isNaN(code) ? 0 : code;
  } catch (e) { 
    console.log(`Warning: Failed to check ${url} - ${e.message}`);
    return 0; 
  }
}

for (const u of links) {
  const target = /^https?:/i.test(u) ? u : (u.startsWith('/') ? base+u : `${base}/${u}`);
  const code = curl(target);
  results.push({u, target, code});
}

const broken = results.filter(r => !(r.code>=200 && r.code<400));
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/link-check.json', JSON.stringify({
  when: new Date().toISOString(),
  base, 
  totals: {all:results.length, broken:broken.length}, 
  results
}, null, 2));

console.log(`🔍 Checked ${results.length} links → broken: ${broken.length}. Report: reports/link-check.json`);

// Show broken links for quick fix
if (broken.length > 0) {
  console.log('\n💥 BROKEN LINKS FOUND:');
  broken.forEach(r => console.log(`   ${r.code} - ${r.u} → ${r.target}`));
}

process.exit(broken.length ? 1 : 0);