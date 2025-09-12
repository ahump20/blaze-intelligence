// Quick navigation link checker for dashboard URLs
import { execSync } from 'node:child_process';

const base = 'https://blaze-intelligence.netlify.app';
const navLinks = [
  '/',
  '/dashboard.html', 
  '/status.html',
  '/orioles-executive-intelligence.html',
  '/live-demo.html', 
  '/nil-calculator.html',
  '/get-started.html',
  '/blaze-vision-ai-scouting.html',
  '/longhorns-intelligence.html',
  '/titans-intelligence.html', 
  '/cardinals-intelligence.html'
];

const results = [];

for (const link of navLinks) {
  const url = `${base}${link}`;
  try {
    const output = execSync(`curl -I -sS -m 5 -o /dev/null -w "%{http_code}" "${url}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    const code = parseInt(output.trim(), 10);
    results.push({ link, url, code, status: (code >= 200 && code < 400) ? 'OK' : 'BROKEN' });
  } catch (e) {
    results.push({ link, url, code: 0, status: 'ERROR' });
  }
}

// Summary
const broken = results.filter(r => r.status !== 'OK');
console.log(`\n🔍 Navigation Link Check Results:`);
console.log(`Total links: ${results.length}`);
console.log(`Working: ${results.length - broken.length}`);
console.log(`Broken: ${broken.length}`);

if (broken.length > 0) {
  console.log('\n💥 BROKEN LINKS:');
  broken.forEach(r => console.log(`   ${r.code} - ${r.link}`));
} else {
  console.log('\n✅ All navigation links working!');
}

process.exit(broken.length > 0 ? 1 : 0);