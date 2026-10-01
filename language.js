(() => {
  let language = 'en';
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const englishDescription = document.querySelector('meta[name="description"]').content;
  const isolateTerms = text => text.replace(/\.?[A-Za-z0-9][A-Za-z0-9 .+#%/&—–-]*/g, value => { const core = value.replace(/[ .\/—–-]+$/, ''); return '\u2066' + core + '\u2069' + value.slice(core.length); });
  function translate(value) {
    const key = value.trim();
    const match = key.match(/^STEP (\d+) OF (\d+)$/);
    const arabic = match ? `الخطوة ${match[1]} من ${match[2]}` : arabicTranslations[key];
    return arabic ? value.replace(key, isolateTerms(arabic)) : value;
  }
  function update() {
    observer.disconnect();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script,style,noscript,[data-no-translate]')) continue;
      const previous = originals.get(node);
      const current = node.nodeValue;
      // Dynamic renderers write English source text; preserve it before translating.
      if (!previous || (current !== previous.en && current !== previous.ar)) {
        originals.set(node, {en: current, ar: translate(current)});
      }
      const entry = originals.get(node);
      const next = language === 'ar' ? entry.ar : entry.en;
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    document.querySelectorAll('[aria-label]:not([data-no-translate])').forEach(el => {
      if (!attributes.has(el)) attributes.set(el, el.getAttribute('aria-label'));
      const value = attributes.get(el);
      el.setAttribute('aria-label', language === 'ar' ? translate(value) : value);
    });
    observer.observe(document.body, {childList: true, subtree: true, characterData: true});
  }
  const observer = new MutationObserver(update);
  function setLanguage(next) {
    if (!['en', 'ar'].includes(next)) return;
    language = next;
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.title = next === 'ar' ? 'يوسف خالد — مهندس برمجيات | Fintech' : 'Youssef Khaled — Software Engineer';
    document.querySelector('meta[name="description"]').content = next === 'ar'
      ? 'يوسف خالد، مهندس برمجيات أول متخصص في Fintech والخدمات المالية باستخدام .NET وAngular. استكشف الخبرات والمشاريع وفرص التعاون.' : englishDescription;
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === next)));
    update();
    try { localStorage.setItem('portfolio-language', next); } catch { /* Language switching works without storage. */ }
  }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  let saved = 'en';
  try { saved = localStorage.getItem('portfolio-language') || 'en'; } catch { /* Default to English. */ }
  setLanguage(saved === 'ar' ? 'ar' : 'en');
})();
