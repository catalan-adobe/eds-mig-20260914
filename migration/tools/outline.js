() => {
  const out = [];
  const root = document.querySelector('.site-wrapper .aem-Grid .aem-Grid') || document.body;
  const walk = (el, d, max) => {
    if (d > max) return;
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.height < 1) continue;
      const cls = typeof c.className === 'string' ? c.className.trim().split(/\s+/).slice(0, 5).join('.') : '';
      const txt = (c.children.length === 0 ? c.textContent.trim().slice(0, 60) : '');
      out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}${c.id ? '#' + c.id : ''}${cls ? '.' + cls : ''} [${Math.round(r.left)},${Math.round(r.top + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}] ${txt}`);
      walk(c, d + 1, max);
    }
  };
  walk(root, 0, 3);
  return out.join('\n');
}
