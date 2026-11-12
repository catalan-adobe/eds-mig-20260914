import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from 'cheerio';
import { createCleaner } from '../lib/clean.mjs';
import { rewriteLink } from '../lib/links.mjs';

function clean(html) {
  const $ = load(`<div id="root">${html}</div>`);
  const warnings = [];
  const cleaner = createCleaner({
    $,
    link: (href) => rewriteLink(href, '/a.html'),
    image: (node) => `<img src="${node.attribs.src}" alt="${node.attribs.alt ?? ''}">`,
    warn: (message) => warnings.push(message),
  });
  return { html: cleaner.parts($('#root')[0]).join(''), warnings };
}

const cases = [
  ['drops class, style, span and empty paragraphs',
    '<p class="x" style="color:red"><span>Text</span> <b>bold</b> <i>it</i></p><p>&nbsp;</p>',
    '<p>Text <strong>bold</strong> <em>it</em></p>'],
  ['wraps loose text and keeps headings and lists',
    'Loose<h3>Head</h3><ul><div><li>One</li><li><p>Two</p><ul><li>Deep</li></ul></li></div></ul>',
    '<p>Loose</p><h3>Head</h3><ul><li>One</li><li>Two<ul><li>Deep</li></ul></li></ul>'],
  ['primary and secondary buttons',
    '<div class="buttons"><a class="component-button primary" href="/x.html">Go</a><a class="btn btn-secondary" href="/y.html"><span>More</span></a></div>',
    '<p><strong><a href="/f52-synopsys-1211-02/x">Go</a></strong></p><p><em><a href="/f52-synopsys-1211-02/y">More</a></em></p>'],
  ['call-to-action link with its icon',
    '<a href="/x.html" class="cta-link"><span class="cta-text">Learn</span> <i class="arrow-icon fa-regular fa-chevron-right"></i></a>',
    '<p><a href="/f52-synopsys-1211-02/x">Learn :chevron-right:</a></p>'],
  ['a button with has-arrow',
    '<a class="component-button primary has-arrow" href="/x.html">Go</a>',
    '<p><strong><a href="/f52-synopsys-1211-02/x">Go :chevron-right:</a></strong></p>'],
  ['a bold link alone in a paragraph is not a button',
    '<p><b><a href="/x.html">Body link</a></b></p>',
    '<p><a href="/f52-synopsys-1211-02/x">Body link</a></p>'],
  ['a linked image: image paragraph, then the link with its URL as text',
    '<a href="/x.html"><img src="/a.png" alt="A"></a>',
    '<p><img src="/a.png" alt="A"></p><p><a href="/f52-synopsys-1211-02/x">/f52-synopsys-1211-02/x</a></p>'],
  ['a protected email becomes a mailto link',
    '<p><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="2a43444c456a595344455a59535904494547">[email&#160;protected]</a></p>',
    '<p><a href="mailto:info@synopsys.com">info@synopsys.com</a></p>'],
  ['spaces at the edge of a link stay between the words',
    '<p>see <a href="/x.html">this </a>page</p>',
    '<p>see <a href="/f52-synopsys-1211-02/x">this</a> page</p>'],
  ['no script, style, rule or form control',
    '<p>a</p><script>x()</script><style>p{}</style><hr><input value="v"><p>b</p>',
    '<p>a</p><p>b</p>'],
];
cases.forEach(([name, html, expected]) => {
  test(`clean: ${name}`, () => assert.equal(clean(html).html, expected));
});

test('clean: an iframe is a link, with a warning', () => {
  const { html, warnings } = clean('<iframe src="https://www.youtube.com/embed/x"></iframe>');
  assert.equal(html, '<p><a href="https://www.youtube.com/embed/x">https://www.youtube.com/embed/x</a></p>');
  assert.equal(warnings.length, 1);
});
