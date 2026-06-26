const fs = require('fs');
const path = require('path');
const wrongClose = ['<', '/', 'm', 'o', 't', 'i', 'o', 'n', '.', 'd', 'i', 'v', '>'].join('');
const rightClose = ['<', '/', 'd', 'i', 'v', '>'].join('');
const wrongOpen = ['<', 'm', 'o', 't', 'i', 'o', 'n', '.', 'd', 'i', 'v'].join('');
const rightOpen = ['<', 'd', 'i', 'v'].join('');
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.jsx')) {
      let t = fs.readFileSync(p, 'utf8');
      const orig = t;
      t = t.split(wrongClose).join(rightClose).split(wrongOpen).join(rightOpen);
      if (t !== orig) { fs.writeFileSync(p, t); console.log('fixed', p); }
    }
  }
}
walk(path.join(__dirname, 'frontend', 'src'));
