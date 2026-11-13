import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeEmail, rewriteLink, videoLink } from '../lib/links.mjs';

const SITE = '/f52-synopsys-1211-02';
const cases = [
  ['internal page, relative', '/ai/agentic-ai.html', `${SITE}/ai/agentic-ai`],
  ['internal page, absolute', 'https://www.synopsys.com/solutions/automotive.html', `${SITE}/solutions/automotive`],
  ['language tree', '/ja-jp/japan/company.html', `${SITE}/ja-jp/japan/company`],
  ['language home page', '/zh-cn.html', `${SITE}/zh-cn`],
  ['AEM content path, English', '/content/synopsys/en-us/newsroom.html', `${SITE}/newsroom`],
  ['AEM content path, Japanese', '/content/synopsys/ja-jp/japan.html', `${SITE}/ja-jp/japan`],
  ['home page', 'https://www.synopsys.com/', `${SITE}/`],
  ['home page, AEM content path', '/content/synopsys/en-us.html', `${SITE}/`],
  ['a path the preview refuses', '/support/training/locations/locations_austin.html', `${SITE}/support/training/locations/locations-austin`],
  ['query and anchor', '/contact-sales.html?cmp=x#form', `${SITE}/contact-sales?cmp=x#form`],
  ['doubled extension of the source', '/solutions/slm/avalon.html.html', `${SITE}/solutions/slm/avalon`],
  ['category selector', '/blogs/chip-design/category.5g-wireless.html', `${SITE}/blogs/chip-design/category?tag=5g-wireless`],
  ['anchor', '#overview', '#overview'],
  ['external', 'https://www.eda-express.com/2021/04/primesim.html', 'https://www.eda-express.com/2021/04/primesim.html'],
  ['other synopsys host', 'https://news.synopsys.com/2026-09-30-Investor-Day', 'https://news.synopsys.com/2026-09-30-Investor-Day'],
  ['PDF, relative', '/content/dam/synopsys/ds/primesim.pdf', 'https://www.synopsys.com/content/dam/synopsys/ds/primesim.pdf'],
  ['file with a script extension', '/cgi-bin/dwtb/req1.cgi', 'https://www.synopsys.com/cgi-bin/dwtb/req1.cgi'],
  ['zip, absolute', 'https://www.synopsys.com/news/pubs/all-files.zip', 'https://www.synopsys.com/news/pubs/all-files.zip'],
  ['mailto', 'mailto:info@synopsys.com', 'mailto:info@synopsys.com'],
  // eslint-disable-next-line no-script-url
  ['javascript', 'javascript:void(0)', ''],
  ['empty', '', ''],
];

cases.forEach(([name, href, expected]) => {
  test(`link: ${name}`, () => assert.equal(rewriteLink(href, '/ai/page.html'), expected));
});

test('link: relative to the page', () => {
  assert.equal(rewriteLink('sibling.html', '/ai/page.html'), `${SITE}/ai/sibling`);
});

test('video link: Brightcove player of the account, YouTube watch page', () => {
  const attribs = { 'data-video-id': '6379238357112', 'data-provider': 'Brightcove', 'data-video-lang': '5748441669001' };
  assert.equal(videoLink(attribs), 'https://players.brightcove.net/5748441669001/rka4xWwYG_default/index.html?videoId=6379238357112');
  assert.equal(videoLink({ ...attribs, 'data-player-id': 'abc' }), 'https://players.brightcove.net/5748441669001/abc_default/index.html?videoId=6379238357112');
  assert.equal(videoLink({ ...attribs, 'data-video-lang': '6024607096001' }), 'https://players.brightcove.net/6024607096001/k9ROJJb3q_default/index.html?videoId=6379238357112');
  assert.equal(videoLink({ 'data-video-id': 'dQw4', 'data-provider': 'YouTube' }), 'https://www.youtube.com/watch?v=dQw4');
  assert.equal(videoLink({}), '');
});

test('link: Cloudflare email protection', () => {
  const hex = '2a43444c456a595344455a59535904494547';
  assert.equal(decodeEmail(hex), 'info@synopsys.com');
  assert.equal(rewriteLink(`/cdn-cgi/l/email-protection#${hex}`), 'mailto:info@synopsys.com');
});
