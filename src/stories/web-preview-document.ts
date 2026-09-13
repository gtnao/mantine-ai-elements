/** Deterministic document executed only inside the preview iframe. */
export function previewDocument(title: string) {
  const safeTitle = title
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle}</title><style>body{font:16px system-ui;padding:20px;background:#f8f9fa;color:#212529}button{padding:8px 14px;border:1px solid #7950f2;border-radius:6px;background:#7950f2;color:white}p{line-height:1.5}</style><h1>${safeTitle}</h1><p>This document runs inside the iframe.</p><button id="counter">Count: 0</button><p id="boundary"></p><script>let count=0;document.getElementById('counter').onclick=()=>{document.getElementById('counter').textContent='Count: '+(++count)};try{void parent.document.body;document.getElementById('boundary').textContent='Parent DOM accessible'}catch{document.getElementById('boundary').textContent='Parent DOM isolated'}</script></html>`;
}
