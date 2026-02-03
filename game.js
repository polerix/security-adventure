/**
 * SecurityAdventure Game Engine
 * Handles scenario rendering, choices, and scoring.
 */

const SCENARIOS = {
  module1: {
    title: "The Curious Case of the Lost Drive",
    startNode: "parking_lot",
    nodes: {
      parking_lot: {
        text: "The office parking lot. Justin the Beaver spots a shiny USB drive near the entrance.\n\n\"Oh no!\" Justin thinks. \"Someone must have dropped this. It might have their important work on it!\" He heads to Smarty the Fox’s desk. \"Hey Smarty, I found this in the lot. Can you plug it in so we can see whose name is on the files?\"\n\nWhat should Smarty do?",
        image: "assets/m1_start.png",
        choices: [
          {
            label: "Option A: Plug it in.",
            description: "Help a colleague by identifying the owner immediately.",
            next: "m1_fail_a",
            score: { integrity: 5, vigilance: 1, diplomacy: 5 }
          },
          {
            label: "Option B: Take it to IT.",
            description: "Politely decline and hand it over to the Security Department.",
            next: "m1_success_b",
            score: { integrity: 5, vigilance: 5, diplomacy: 5 },
            badge: "Data Guardian"
          },
          {
            label: "Option C: Leave it in the Breakroom.",
            description: "Place it on the \"Lost and Found\" table for anyone to claim.",
            next: "m1_fail_c",
            score: { integrity: 3, vigilance: 2, diplomacy: 4 }
          }
        ]
      },
      m1_fail_a: {
        text: "⚠️ NETWORK COMPROMISED! Justin’s act of kindness gave a hacker a \"backdoor\" into the company’s financial records. Curiosity (or kindness) killed the network.",
        image: "assets/m1_fail_a.png",
        type: "ending",
        outcome: "failure"
      },
      m1_success_b: {
        text: "🛡️ SECURITY CHAMPIONS! IT discovers the drive was a \"Rubber Ducky\" script designed to steal passwords. You protected the den!",
        image: "assets/m1_success_b.png",
        type: "ending",
        outcome: "success"
      },
      m1_fail_c: {
        text: "☣️ SPREADING THE RISK! An intern picks it up and plugs it in later. Leaving a threat in a common area is just as dangerous as using it yourself.",
        image: "assets/m1_fail_c.png",
        type: "ending",
        outcome: "failure"
      }
    }
  },
  module2: {
    title: "The Doorway Dilemma",
    startNode: "entrance",
    nodes: {
      entrance: {
        text: "The secure badge-access side entrance.\n\nJustin is about to badge in when Wanda the Weasel approaches. Wanda is a company veteran known for her intimidating, \"Karen-esque\" attitude. Justin holds the door open for her. Smarty is right behind them, feeling the pressure of Wanda’s glare.\n\nWhat is the safest move for the team?",
        image: "assets/m2_start.png",
        choices: [
          {
            label: "Option A: Let Wanda pass.",
            description: "She’s worked here for years; it’s fine.",
            next: "m2_fail_a",
            score: { integrity: 2, vigilance: 1, diplomacy: 5 } // High diplomacy, low vigilance
          },
          {
            label: "Option B: Insist on the scan.",
            description: "Justin holds the door but says, \"Sorry, Wanda! Policy says everyone has to scan.\"",
            next: "m2_success_b",
            score: { integrity: 5, vigilance: 5, diplomacy: 4 }, // Good all around
            badge: "The Iron Gate" // Also "The Gentle-Beaver" implied by descriptions
          },
          {
            label: "Option C: Close the door.",
            description: "Smarty slips in and lets the door click shut before Wanda can enter.",
            next: "m2_neutral_c",
            score: { integrity: 5, vigilance: 5, diplomacy: 1 } // rude but safe
          }
        ]
      },
      m2_fail_a: {
        text: "🚪 SECURITY BREACH! This is \"Tailgating.\" Because Wanda didn't scan, there is no digital record of who is in the building. Accountability is lost.",
        image: "assets/m2_fail_a.png",
        type: "ending",
        outcome: "failure"
      },
      m2_success_b: {
        text: "🔑 GOLD STANDARD SECURE! You balanced being a \"gentle-beaver\" with being a security pro. Every scan counts!",
        image: "assets/m2_success_b.png",
        type: "ending",
        outcome: "success",
        extra_badges: ["The Gentle-Beaver"]
      },
      m2_neutral_c: {
        text: "🧊 THE COLD SHOULDER. The building is safe, but the vibes are chilly! It's better to hold the door while politely requiring the scan.",
        image: "assets/m2_neutral_c.png",
        type: "ending",
        outcome: "neutral"
      }
    }
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
    this.currentNodeId = this.currentModule.startNode;
    this.sessionScore = { integrity: 0, vigilance: 0, diplomacy: 0 };
    this.badges = [];
    this.render();

    // Scroll to game container
    this.container.scrollIntoView({ behavior: 'smooth' });
  }

  render() {
    this.container.innerHTML = '';
    const node = this.currentModule.nodes[this.currentNodeId];

    const card = document.createElement('div');
    card.className = 'game-card animate-fade';

    // Header
    const header = document.createElement('h3');
    header.innerText = this.currentModule.title;
    header.className = 'game-header';
    card.appendChild(header);

    // Image
    if (node.image) {
      const img = document.createElement('img');
      img.src = node.image;
      img.className = 'scenario-image';
      img.alt = 'Scenario Illustration';
      card.appendChild(img);
    }

    // Text
    const textDiv = document.createElement('div');
    textDiv.className = 'scenario-text';
    textDiv.innerText = node.text;
    card.appendChild(textDiv);

    // Choices or Ending
    if (node.type === 'ending') {
      const resultDiv = document.createElement('div');
      resultDiv.className = `result-box ${node.outcome}`;
      resultDiv.innerText = node.outcome.toUpperCase();
      card.appendChild(resultDiv);

      // Show Scorecard button or immediate scorecard
      this.renderScorecard(card);

      // Reset/Back button
      const backBtn = document.createElement('button');
      backBtn.className = 'game-btn secondary';
      backBtn.innerText = 'Back to Menu';
      backBtn.onclick = () => {
        this.container.innerHTML = '<div class="placeholder-text">Select a training module above to begin.</div>';
      };
      card.appendChild(backBtn);

    } else {
      const choicesDiv = document.createElement('div');
      choicesDiv.className = 'choices-grid';

      node.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<strong>${choice.label}</strong><br><span class="small">${choice.description}</span>`;
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
      <h4>Security Scorecard</h4>
      <div class="metrics">
        <div class="metric">Integrity: ${this.renderStars(this.sessionScore.integrity)}</div>
        <div class="metric">Vigilance: ${this.renderStars(this.sessionScore.vigilance)}</div>
        <div class="metric">Diplomacy: ${this.renderStars(this.sessionScore.diplomacy)}</div>
      </div>
      <div class="badges-section">
        ${this.badges.length > 0 ? '<strong>Badges Earned:</strong>' : ''}
        <div class="badges-list">
          ${this.badges.map(b => `<span class="badge-pill">🏆 ${b}</span>`).join('')}
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
