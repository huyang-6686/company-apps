'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeHtml, renderShareCards } = require('../../demo/shareView');

test('escapeHtml renders share content as text instead of markup', () => {
  const input = '<script>alert("x")</script> & "quoted"';
  assert.equal(
    escapeHtml(input),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &quot;quoted&quot;'
  );
});

test('escapeHtml handles nullish values without exposing markup', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});

test('share rendering escapes content and omits actions for unsafe session ids', () => {
  const html = renderShareCards([{
    id: "x');alert(1);//",
    type: '<svg onload=alert(1)>',
    input: '<img src=x onerror=alert(1)>',
    status: 'analyzed',
    timeout_flag: 'normal',
    summary: '<script>alert(1)</script>',
    archive_suggestion: 'A & B'
  }]);

  assert.match(html, /&lt;svg onload=alert\(1\)&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /A &amp; B/);
  assert.doesNotMatch(html, /onclick="shareAdvance\('x/);
  assert.doesNotMatch(html, /alert\(1\);\/\//);
});

test('share rendering keeps actions for generated session ids', () => {
  const html = renderShareCards([{
    id: 'sh12', type: '链接', input: 'https://example.test', status: 'analyzed', timeout_flag: 'normal'
  }]);
  assert.match(html, /onclick="shareAdvance\('sh12','asked'\)"/);
});
