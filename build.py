# 把 index.src.html 與 lib/ 底下的元件合成「單一檔案」index.html（不需要另外下載任何檔案，公司網路擋 .js 檔時也能用）
import json, re, os
here = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(here, p), encoding='utf-8').read()
safe = lambda js: js.replace('</script', '<\/script').replace('<!--', '<\!--')
s = open(os.path.join(here, 'index.src.html'), encoding='utf-8', newline='').read()
for tag, f in [('xlsx', 'lib/xlsx.full.min.js'), ('exceljs', 'lib/exceljs.min.js'), ('pdf', 'lib/pdf.min.js')]:
    pat = f'<script defer src="{f}"></script>'
    assert pat in s, pat
    s = s.replace(pat, '<script>' + safe(rd(f)) + '</script>', 1)
worker = '<script>window.__pdfWorkerText=' + safe(json.dumps(rd('lib/pdf.worker.min.js'), ensure_ascii=False)) + ';</script>\n'
s = s.replace('<script>\nconst $ = id', worker + '<script>\nconst $ = id', 1) if '<script>\nconst $ = id' in s else s.replace('<script>\r\nconst $ = id', worker + '<script>\r\nconst $ = id', 1)
assert '__pdfWorkerText' in s
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8', newline='').write(s)
print('index.html', round(len(s.encode('utf-8')) / 1e6, 2), 'MB')
