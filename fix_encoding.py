import os
import re

files = ['index.html', 'module1.html', 'module2.html', 'tech.html']
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    content = re.sub(r'\.scenario-image\s*\{\s*display:\s*none;\s*/\*\s*Renders in Left Panel instead\s*\*/\s*\}', '.right-panel .scenario-image { display: none; /* Renders in Left Panel instead */ }', content)
    
    content = re.sub(r'padding: 24px;(\s*box-shadow: var\(--game-card-shadow\);)', r'padding: 16px;\1', content)
    content = re.sub(r'padding: 18px;(\s*border-radius: 12px;\s*font-size: )15px;', r'padding: 12px;\114px;', content)
    content = re.sub(r'line-height: 1\.6;(\s*margin-bottom: )20px;', r'line-height: 1.5;\112px;', content)
    content = re.sub(r'\.choice-btn\s*\{([^}]+)padding: 16px;', r'.choice-btn {\1padding: 10px;', content)
    
    if '⚙️' not in content and '🎮' not in content:
        btnHtml = '</div>\n    <span class="capsule-divider">|</span>\n    <button class="theme-btn" onclick="window.location.href=\'tech.html\'" style="font-size: 16px;" title="Tech Information">⚙️</button>'
        content = re.sub(r'</div>(\s*)<span class="capsule-divider">\|</span>(\s*)<div class="lang-controls">', btnHtml + r'\1<span class="capsule-divider">|</span>\2<div class="lang-controls">', content)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

with open('index.html', 'r', encoding='utf-8') as file:
    idxContent = file.read()
idxContent = re.sub(r'(?s)<!-- Technical Implementation Section -->.*?(?=<footer>)', '', idxContent)
idxContent = idxContent.replace('<a href="#cdps-scaling"', '<a href="tech.html#cdps-scaling"')
idxContent = idxContent.replace('<a href="#process-overview"', '<a href="tech.html#process-overview"')
idxContent = idxContent.replace('<a href="#ishikawa-discovery"', '<a href="tech.html#ishikawa-discovery"')
with open('index.html', 'w', encoding='utf-8') as file:
    file.write(idxContent)

for f in ['module1.html', 'module2.html']:
    with open(f, 'r', encoding='utf-8') as file:
        mContent = file.read()
    mContent = mContent.replace('<a href="#cdps-scaling"', '<a href="tech.html#cdps-scaling"')
    mContent = mContent.replace('<a href="#process-overview"', '<a href="tech.html#process-overview"')
    mContent = mContent.replace('<a href="#ishikawa-discovery"', '<a href="tech.html#ishikawa-discovery"')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(mContent)

with open('tech.html', 'r', encoding='utf-8') as file:
    techContent = file.read()
techContent = re.sub(r'(?s)<nav id="training-modules".*?</nav>', '<nav id="training-modules" class="module-nav-grid" style="display:none;"></nav>', techContent)
techContent = re.sub(r'(?s)<!-- Playable Game Container -->.*?(?=<!-- Technical Implementation Section -->)', '', techContent)
techContent = techContent.replace("window.location.href='tech.html'", "window.location.href='index.html'")
techContent = techContent.replace('⚙️', '🎮')
techContent = techContent.replace('Tech Information', 'Return to Game')
with open('tech.html', 'w', encoding='utf-8') as file:
    file.write(techContent)
