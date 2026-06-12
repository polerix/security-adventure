/**
 * security-adventure Game Engine
 * Handles scenario rendering, choices, and scoring.
 * Data is loaded from scenarios.js
 */

let currentLanguage = localStorage.getItem('sa-lang') || 'en';

window.setLang = function (lang) {
  currentLanguage = lang;
  localStorage.setItem('sa-lang', lang);
  document.documentElement.setAttribute('lang', lang);

  // Re-render current module if active
  if (window.game && window.game.currentModule) {
    window.game.render();
  }
};

class SecurityGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentModule = null;
    this.currentNodeId = null;
    this.sessionScore = { integrity: 0, vigilance: 0, diplomacy: 0 };
    this.badges = [];
  }

  startModule(moduleId) {
    this.currentModule = SCENARIOS[moduleId];
    if (!this.currentModule) {
      console.error("Module not found:", moduleId);
      return;
    }
    
    // Set active class on navigation module cards
    document.querySelectorAll('.module-card').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-module') === moduleId) {
        btn.classList.add('active');
      }
    });

    this.currentNodeId = this.currentModule.startNode;
    this.sessionScore = { integrity: 0, vigilance: 0, diplomacy: 0 };
    this.badges = [];
    this.render();

    // Scroll to game container (in right scrollable panel if desktop)
    const rightPanel = document.getElementById('right-content-panel');
    if (rightPanel && window.innerWidth >= 900) {
      rightPanel.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.container.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetLeftVisual() {
    const leftTarget = document.getElementById('left-visual-target');
    if (leftTarget) {
      leftTarget.innerHTML = `<img id="welcome-banner" src="assets/banner_intro.png" data-src-en="assets/banner_intro.png" data-src-fr="assets/fr_banner_intro.png" alt="Smarty the Fox Greeting">`;
      const welcomeImg = document.getElementById('welcome-banner');
      if (welcomeImg) {
        welcomeImg.src = welcomeImg.getAttribute('data-src-' + currentLanguage);
      }
    }
  }

  render() {
    this.container.innerHTML = '';
    const node = this.currentModule.nodes[this.currentNodeId];

    const card = document.createElement('div');
    card.className = 'game-card animate-fade';

    // Header
    const header = document.createElement('h3');
    header.innerText = Array.isArray(this.currentModule.title) || typeof this.currentModule.title === 'string' ? this.currentModule.title : this.currentModule.title[currentLanguage];
    header.className = 'game-header';
    card.appendChild(header);

    // Image Targeting split-pane Left Panel on Desktop
    const leftTarget = document.getElementById('left-visual-target');
    if (node.image) {
      const img = document.createElement('img');
      img.src = typeof node.image === 'string' ? node.image : node.image[currentLanguage];
      img.className = 'scenario-image';
      img.alt = 'Scenario Illustration';
      
      if (leftTarget && window.innerWidth >= 900) {
        leftTarget.innerHTML = '';
        leftTarget.appendChild(img);
      } else {
        card.appendChild(img);
      }
    } else {
      if (leftTarget && window.innerWidth >= 900) {
        this.resetLeftVisual();
      }
    }

    // Text
    const textDiv = document.createElement('div');
    textDiv.className = 'scenario-text';
    textDiv.innerText = typeof node.text === 'string' ? node.text : node.text[currentLanguage];
    card.appendChild(textDiv);

    if (node.type === 'ending') {
      const resultDiv = document.createElement('div');
      resultDiv.className = `result-box ${node.outcome}`;

      let outcomeText = node.outcome.toUpperCase();
      if (currentLanguage === 'fr') {
        if (outcomeText === 'SUCCESS') outcomeText = 'SUCCÈS';
        if (outcomeText === 'FAILURE') outcomeText = 'ÉCHEC';
        if (outcomeText === 'NEUTRAL') outcomeText = 'NEUTRE';
      }

      resultDiv.innerText = outcomeText;
      card.appendChild(resultDiv);

      // Show Scorecard button or immediate scorecard
      this.renderScorecard(card);

      const backBtn = document.createElement('button');
      backBtn.className = 'game-btn secondary';
      backBtn.innerText = currentLanguage === 'fr' ? 'Retour au Menu' : 'Back to Menu';
      backBtn.onclick = () => {
        window.location.href = 'index.html';
      };
      card.appendChild(backBtn);
    } else {
      const choicesDiv = document.createElement('div');
      choicesDiv.className = 'choices-grid';

      node.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';

        const label = typeof choice.label === 'string' ? choice.label : choice.label[currentLanguage];
        const desc = typeof choice.description === 'string' ? choice.description : choice.description[currentLanguage];

        btn.innerHTML = `<strong>${label}</strong><br><span class="small">${desc}</span>`;
        btn.onclick = () => this.makeChoice(choice);
        choicesDiv.appendChild(btn);
      });
      card.appendChild(choicesDiv);
    }

    this.container.appendChild(card);
  }

  makeChoice(choice) {
    if (choice.score) {
      // Since these are single-step scenarios, we just take the score. 
      // In a longer game, we'd add to it.
      this.sessionScore = choice.score;
    }
    if (choice.badge) {
      this.badges.push(choice.badge);
    }
    // Check next node for extra badges logic if needed, but for now we trust the choice
    const nextNode = this.currentModule.nodes[choice.next];
    if (nextNode && nextNode.extra_badges) {
      this.badges.push(...nextNode.extra_badges);
    }

    this.currentNodeId = choice.next;
    this.render();
  }

  renderScorecard(container) {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'scorecard';

    scoreDiv.innerHTML = `
      <h4>${currentLanguage === 'fr' ? 'Fiche de Sécurité' : 'Security Scorecard'}</h4>
      <div class="metrics">
        <div class="metric">${currentLanguage === 'fr' ? 'Intégrité' : 'Integrity'}: ${this.renderStars(this.sessionScore.integrity)}</div>
        <div class="metric">${currentLanguage === 'fr' ? 'Vigilance' : 'Vigilance'}: ${this.renderStars(this.sessionScore.vigilance)}</div>
        <div class="metric">${currentLanguage === 'fr' ? 'Diplomatie' : 'Diplomacy'}: ${this.renderStars(this.sessionScore.diplomacy)}</div>
      </div>
      <div class="badges-section">
        ${this.badges.length > 0 ? `<strong>${currentLanguage === 'fr' ? 'Badges Obtenus' : 'Badges Earned'}:</strong>` : ''}
        <div class="badges-list">
          ${this.badges.map(b => `<span class="badge-pill">🏆 ${typeof b === 'string' ? b : b[currentLanguage]}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(scoreDiv);
  }

  renderStars(count) {
    return '⭐'.repeat(count) + '☆'.repeat(5 - count);
  }
}

// Initialize
const game = new SecurityGame('game-container');
