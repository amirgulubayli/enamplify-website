// One-off: downloads the oxblood-world WOFF2 subsets (latin + latin-ext) and their OFL licences. Not part of the build.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public/fonts');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const families = [
  {
    file: 'libre-caslon-display-400',
    query: 'Libre+Caslon+Display',
    ofl: 'librecaslondisplay',
    oflOut: 'libre-caslon-display-OFL.txt'
  },
  {
    file: 'libre-caslon-text-400italic',
    query: 'Libre+Caslon+Text:ital,wght@1,400',
    ofl: 'librecaslontext',
    oflOut: 'libre-caslon-text-OFL.txt'
  },
  {
    file: 'dm-sans-var',
    query: 'DM+Sans:opsz,wght@9..40,400..700',
    ofl: 'dmsans',
    oflOut: 'dm-sans-OFL.txt'
  }
];

const SUBSETS = ['latin', 'latin-ext'];

await fs.mkdir(dir, {recursive: true});

const unicodeRanges = {};

for (const f of families) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${f.query}&display=optional`, {headers: {'User-Agent': UA}})).text();

  for (const subset of SUBSETS) {
    const marker = `/* ${subset} */`;
    const parts = css.split(marker);
    if (parts.length < 2) throw new Error(`No ${subset} subset for ${f.file}`);
    // The block for this subset is everything after the marker up to the next '/*' comment (or end of string).
    const rest = parts[1];
    const nextCommentIdx = rest.indexOf('/*');
    const block = nextCommentIdx === -1 ? rest : rest.slice(0, nextCommentIdx);

    const url = block.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    if (!url) throw new Error(`No woff2 URL for ${f.file} (${subset})`);

    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
    if (!range) throw new Error(`No unicode-range for ${f.file} (${subset})`);

    const font = Buffer.from(await (await fetch(url)).arrayBuffer());
    const outName = `${f.file}-${subset}.woff2`;
    await fs.writeFile(path.join(dir, outName), font);
    unicodeRanges[outName] = range;
    console.log(`${f.file} (${subset}): ${font.length} bytes`);
  }

  const licence = await (await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${f.ofl}/OFL.txt`)).text();
  if (!licence.includes('SIL OPEN FONT LICENSE')) throw new Error(`Unexpected licence for ${f.file} (dir: ${f.ofl})`);
  await fs.writeFile(path.join(dir, f.oflOut), licence);
}

await fs.writeFile(path.join(dir, 'unicode-ranges.json'), JSON.stringify(unicodeRanges, null, 2) + '\n');
console.log('Wrote unicode-ranges.json');
