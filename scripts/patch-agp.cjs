#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const AGP = process.env.AGP_VERSION || '8.7.2';
const roots = [
  'node_modules/@capacitor/android/capacitor/build.gradle',
  'node_modules/@capacitor/filesystem/android/build.gradle',
  'node_modules/@capacitor/share/android/build.gradle',
];

for (const rel of roots) {
  const p = path.resolve(process.cwd(), rel);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  const out = src.replace(/classpath\s+'com\.android\.tools\.build:gradle:[^']+'/g, `classpath 'com.android.tools.build:gradle:${AGP}'`);
  if (src !== out) {
    fs.writeFileSync(p, out, 'utf8');
    console.log(`[patch-agp] Updated ${rel} -> AGP ${AGP}`);
  } else {
    console.log(`[patch-agp] OK ${rel}`);
  }
}

