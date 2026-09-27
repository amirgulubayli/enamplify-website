import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMarkdown,inline} from '../src/markdown.mjs';
test('renders editorial Markdown',()=>{const h=renderMarkdown('## Context\n\nA **clear** brief.\n\n- One\n- Two\n\n> A thought');assert.ok(h.includes('<h2>Context</h2>'));assert.ok(h.includes('<strong>clear</strong>'));assert.ok(h.includes('<ul>'));assert.ok(h.includes('<blockquote>'));});
test('renders safe links and emphasis',()=>assert.equal(inline('[Programme](/approach/)'),'<'+'a href="/approach/">Programme</a>'));
test('escapes raw HTML',()=>assert.equal(renderMarkdown('<script>alert(1)</script>'),'<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'));
test('rejects unsafe links and duplicate H1',()=>{assert.throws(()=>renderMarkdown('[bad](javascript:alert)'));assert.throws(()=>renderMarkdown('# Another heading'));});
test('code and external links render safely',()=>{assert.ok(renderMarkdown('```\n<x>\n```').includes('&lt;x&gt;'));assert.ok(inline('[Source](https://example.com)').includes('noopener noreferrer'));});
