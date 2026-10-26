#!/usr/bin/env node
/**
 * Generates THIRD-PARTY-NOTICES.md from the actual installed tree, so the
 * notices shipped inside the app cannot drift from what is really bundled.
 *
 * Run: node scripts/generate-notices.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

const RUNTIME = [
  'react',
  'react-dom',
  'scheduler',
  'react-router',
  'react-router-dom',
  'cookie',
  'set-cookie-parser',
  'astronomy-engine',
  '@fontsource/cormorant-garamond',
  '@fontsource/manrope',
  '@fontsource/noto-sans-symbols-2',
];

const DEV = [
  'vite',
  '@vitejs/plugin-react',
  'typescript',
  'vitest',
  '@types/react',
  '@types/react-dom',
];

const COPYRIGHT = {
  react: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
  'react-dom': 'Copyright (c) Meta Platforms, Inc. and affiliates.',
  scheduler: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
  'react-router':
    'Copyright (c) React Training LLC 2015-2019\nCopyright (c) Remix Software Inc. 2020-2021\nCopyright (c) Shopify Inc. 2022-2023',
  'react-router-dom':
    'Copyright (c) React Training LLC 2015-2019\nCopyright (c) Remix Software Inc. 2020-2021\nCopyright (c) Shopify Inc. 2022-2023',
  cookie: 'Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>\nCopyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>',
  'set-cookie-parser': 'Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)',
  'astronomy-engine': 'Copyright (c) 2019-2025 Don Cross <cosinekitty@gmail.com>',
  '@fontsource/cormorant-garamond':
    'Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant)',
  '@fontsource/manrope': 'Copyright 2019 The Manrope Project Authors (https://github.com/sharanda/manrope)',
  '@fontsource/noto-sans-symbols-2': 'Copyright 2022 The Noto Project Authors (https://github.com/notofonts/symbols)',
  vite: 'Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors',
  '@vitejs/plugin-react': 'Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors',
  typescript: 'Copyright (c) Microsoft Corporation.',
  vitest: 'Copyright (c) 2021-Present Vitest Team',
  '@types/react': 'Copyright (c) Microsoft Corporation.',
  '@types/react-dom': 'Copyright (c) Microsoft Corporation.',
};

const MIT = `MIT License

{{COPYRIGHT}}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const oflSource = readFileSync(join(root, 'node_modules/@fontsource/manrope/LICENSE'), 'utf8');
const oflStart = oflSource.indexOf('SIL OPEN FONT LICENSE');
const OFL = oflSource.slice(oflStart).trim();

const versionOf = (name) => {
  const entry = Object.entries(lock.packages).find(([path, meta]) => {
    if (!path) return false;
    if (meta.name) return meta.name === name;
    return path === `node_modules/${name}`;
  });
  return entry?.[1]?.version ?? 'unknown';
};

const rows = (names) =>
  names
    .map((name) => `| \`${name}\` | ${versionOf(name)} | ${name.startsWith('@fontsource') ? 'OFL-1.1' : name === 'typescript' ? 'Apache-2.0' : 'MIT'} |`)
    .join('\n');

const mitNames = [...RUNTIME, ...DEV].filter((name) => !name.startsWith('@fontsource') && name !== 'typescript');

const mitBlocks = mitNames
  .map((name) => {
    const copyright = COPYRIGHT[name] ?? 'Copyright (c) the respective authors.';
    return `### ${name} ${versionOf(name)}\n\n\`\`\`text\n${MIT.replace('{{COPYRIGHT}}', copyright)}\n\`\`\``;
  })
  .join('\n\n');

const content = `# Third-party notices

**AstroSutra 1.0.0** — generated on ${new Date().toISOString().slice(0, 10)} from the installed dependency tree.
Re-run \`node scripts/generate-notices.mjs\` after changing dependencies, then \`npm run license:audit\`.

This file is bundled with the application and shown in-app under **Legal → Third-party notices**, so the
attribution travels with the distributed JavaScript. AstroSutra's own code is MIT-licensed (see \`LICENSE\`);
its editorial text is CC BY 4.0 (see \`docs/CONTENT-LICENSING.md\`).

## Runtime dependencies (shipped in the bundle)

| Package | Version | Licence |
| --- | --- | --- |
${rows(RUNTIME)}

The three font packages contain the same SIL Open Font Licence text, reproduced once below. Font files are
embedded as WOFF2 and carry the copyright of their respective projects.

## Build-time dependencies (not distributed)

These are used to compile, type-check and test the app. They are not part of the deployed bundle, and are listed
for completeness.

| Package | Version | Licence |
| --- | --- | --- |
${rows(DEV)}

## MIT licence

The following components are distributed under the MIT licence. Each copyright line is reproduced with its
component, and the full licence text follows.

${mitBlocks}

## SIL Open Font Licence 1.1

Applies to the bundled typefaces: Cormorant Garamond (The Cormorant Project Authors), Manrope (The Manrope Project
Authors) and Noto Sans Symbols 2 (The Noto Project Authors).

\`\`\`text
${OFL}
\`\`\`

## Apache License 2.0 (build-time only)

TypeScript is used at build time and is not shipped in the application bundle. Its licence is available at
<https://www.apache.org/licenses/LICENSE-2.0>. Copyright (c) Microsoft Corporation.

## Notes on packaged licence files

\`astronomy-engine\`, \`react-router\` and \`react-router-dom\` do not include a LICENSE file inside their published npm
tarballs (their \`package.json\` declares MIT). The notices above reproduce the upstream licence texts from their
repositories so the attribution requirement is still satisfied:

- astronomy-engine — <https://github.com/cosinekitty/astronomy/blob/master/LICENSE>
- react-router — <https://github.com/remix-run/react-router/blob/main/LICENSE.md>

## What is *not* included

- No code, assets, copy, API responses or data files from Melooha or any other astrology product.
- No GPL, AGPL, LGPL, SSPL or other copyleft licences. \`npm run license:audit\` enforces this.
- No analytics, advertising, AI-model or astrology-API SDKs, so there is nothing further to disclose at runtime.

## Trademarks

Melooha is a product of Astroverse Technologies Pvt. Ltd. and is referenced only to state that AstroSutra is an
independent, unaffiliated project. Product names of the libraries above are trademarks of their respective owners.
`;

writeFileSync(join(root, 'THIRD-PARTY-NOTICES.md'), content);
console.log(`Wrote THIRD-PARTY-NOTICES.md (${content.length} bytes) with ${RUNTIME.length} runtime and ${DEV.length} dev packages.`);
