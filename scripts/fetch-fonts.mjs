// One-off: downloads the latin variable WOFF2 files and their OFL licences. Not part of the build.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public/fonts');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const families = [
  {file: 'schibsted-grotesk', query: 'Schibsted+Grotesk:wght@400..900', ofl: 'schibstedgrotesk'},
  {file: 'public-sans', query: 'Public+Sans:wght@100..900', ofl: 'publicsans'}
];

await fs.mkdir(dir, {recursive: true});
for (const f of families) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${f.query}&display=optional`, {headers: {'User-Agent': UA}})).text();
  const latin = css.split('/* latin */')[1];
  if (!latin) throw new Error(`No latin subset for ${f.file}`);
  const url = latin.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error(`No woff2 URL for ${f.file}`);
  const font = Buffer.from(await (await fetch(url)).arrayBuffer());
  await fs.writeFile(path.join(dir, `${f.file}-latin.woff2`), font);
  const licence = await (await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${f.ofl}/OFL.txt`)).text();
  if (!licence.includes('SIL OPEN FONT LICENSE')) throw new Error(`Unexpected licence for ${f.file}`);
  await fs.writeFile(path.join(dir, `${f.file}-OFL.txt`), licence);
  console.log(`${f.file}: ${font.length} bytes`);
}
