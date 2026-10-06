(function () {
  'use strict';
  const search = document.getElementById('search');
  const contents = document.getElementById('contents');
  const host = document.getElementById('sections');
  const status = document.getElementById('status');
  try {
    const nodes = Array.from(host.children);
    const data = nodes.map(node => ({title:node.getAttribute('data-title') || 'Overview',text:node.textContent}));
    if (!data.length) throw new Error('Missing reader content');
    document.getElementById('reader-tools').hidden = false;
    function filter() {
      const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      contents.replaceChildren();
      const placeholder = document.createElement('option');
      placeholder.value = ''; placeholder.textContent = 'Choose a section';
      contents.appendChild(placeholder);
      let count = 0;
      data.forEach((item, i) => {
        const show = terms.every(term => item.text.toLocaleLowerCase().includes(term));
        nodes[i].hidden = !show;
        if (show) {
          count++;
          const option = document.createElement('option');
          option.value = nodes[i].id; option.textContent = item.title;
          contents.appendChild(option);
        }
      });
      status.textContent = count ? count + ' of ' + data.length + ' sections shown.' : 'No matching sections. Try fewer words or clear the search.';
    }
    function jump(id) {
      const node = document.getElementById(id);
      if (node && nodes.includes(node)) {
        search.value = ''; filter(); node.focus(); node.scrollIntoView({block:'start'});
      }
    }
    search.addEventListener('input', filter);
    document.getElementById('clear').addEventListener('click', () => {search.value = ''; filter(); search.focus();});
    contents.addEventListener('change', () => {
      if (!contents.value) return;
      location.hash = contents.value;
      jump(contents.value);
    });
    window.addEventListener('hashchange', () => jump(location.hash.slice(1)));
    filter(); if (location.hash) jump(location.hash.slice(1));
  } catch (_) {
    const error = document.getElementById('error'); error.hidden = false;
    error.textContent = 'Search could not start. The complete document is available below; reload to try search again.';
    search.disabled = true; contents.disabled = true;
  }
})();
