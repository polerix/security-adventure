const SCENARIOS = {
  module1: {
    title: {
      en: "The Curious Case of the Lost Drive",
      fr: "L'Étrange Affaire de la Clé USB Perdue"
    },
    startNode: "parking_lot",
    nodes: {
      parking_lot: {
        text: {
          en: "The office parking lot. Justin the Beaver spots a shiny USB drive near the entrance.\n\n\"Oh no!\" Justin thinks. \"Someone must have dropped this. It might have their important work on it!\" He heads to Smarty the Fox’s desk. \"Hey Smarty, I found this in the lot. Can you plug it in so we can see whose name is on the files?\"\n\nWhat should Smarty do?",
          fr: "Le stationnement du bureau. Justin le castor aperçoit une clé USB brillante près de l'entrée.\n\n«Oh non!» pense Justin. «Quelqu'un a dû faire tomber ça. Il y a peut-être son travail important dessus!» Il se dirige vers le bureau de Smarty le renard. «Salut Smarty, j'ai trouvé ça dans le stationnement. Peux-tu la brancher pour voir à qui appartiennent les fichiers?»\n\nQue devrait faire Smarty?"
        },
        image: { en: "assets/m1_start.png", fr: "assets/fr_m1_start.png" },
        choices: [
          {
            label: {
              en: "Option A: Plug it in.",
              fr: "Option A: La brancher."
            },
            description: {
              en: "Help a colleague by identifying the owner immediately.",
              fr: "Aider un collègue en identifiant le propriétaire immédiatement."
            },
            next: "m1_fail_a",
            score: { integrity: 5, vigilance: 1, diplomacy: 5 }
          },
          {
            label: {
              en: "Option B: Take it to IT.",
              fr: "Option B: L'apporter aux TI."
            },
            description: {
              en: "Politely decline and hand it over to the Security Department.",
              fr: "Refuser poliment et la remettre au service de sécurité (TI)."
            },
            next: "m1_success_b",
            score: { integrity: 5, vigilance: 5, diplomacy: 5 },
            badge: {
              en: "Data Guardian",
              fr: "Gardien des données"
            }
          },
          {
            label: {
              en: "Option C: Leave it in the Breakroom.",
              fr: "Option C: La laisser dans la salle de repos."
            },
            description: {
              en: "Place it on the \"Lost and Found\" table for anyone to claim.",
              fr: "La placer sur la table des objets perdus pour que quelqu'un la réclame."
            },
            next: "m1_fail_c",
            score: { integrity: 3, vigilance: 2, diplomacy: 4 }
          }
        ]
      },
      m1_fail_a: {
        text: {
          en: "⚠️ NETWORK COMPROMISED! Justin’s act of kindness gave a hacker a \"backdoor\" into the company’s financial records. Curiosity (or kindness) killed the network.",
          fr: "⚠️ RÉSEAU COMPROMIS! L'acte de gentillesse de Justin a donné à un pirate informatique une «porte dérobée» vers les dossiers financiers de l'entreprise. La curiosité (ou la gentillesse) a détruit le réseau."
        },
        image: { en: "assets/m1_fail_a.png", fr: "assets/fr_m1_fail_a.png" },
        type: "ending",
        outcome: "failure"
      },
      m1_success_b: {
        text: {
          en: "🛡️ SECURITY CHAMPIONS! IT discovers the drive was a \"Rubber Ducky\" script designed to steal passwords. You protected the den!",
          fr: "🛡️ CHAMPIONS DE LA SÉCURITÉ! Les TI découvrent que la clé était un script «Rubber Ducky» conçu pour voler des mots de passe. Vous avez protégé la tanière!"
        },
        image: { en: "assets/m1_success_b.png", fr: "assets/fr_m1_success_b.png" },
        type: "ending",
        outcome: "success"
      },
      m1_fail_c: {
        text: {
          en: "☣️ SPREADING THE RISK! An intern picks it up and plugs it in later. Leaving a threat in a common area is just as dangerous as using it yourself.",
          fr: "☣️ PROPAGER LE RISQUE! Un stagiaire la ramasse et la branche plus tard. Laisser une menace dans une aire commune est tout aussi dangereux que de l'utiliser soi-même."
        },
        image: { en: "assets/m1_fail_c.png", fr: "assets/fr_m1_fail_c.png" },
        type: "ending",
        outcome: "failure"
      }
    }
  },
  module2: {
    title: {
      en: "The Doorway Dilemma",
      fr: "Le Dilemme de la Porte"
    },
    startNode: "entrance",
    nodes: {
      entrance: {
        text: {
          en: "The secure badge-access side entrance.\n\nJustin is about to badge in when Wanda the Weasel approaches. Wanda is a company veteran known for her intimidating, \"Karen-esque\" attitude. Justin holds the door open for her. Smarty is right behind them, feeling the pressure of Wanda’s glare.\n\nWhat is the safest move for the team?",
          fr: "L'entrée latérale sécurisée par carte d'accès.\n\nJustin est sur le point de badger quand Wanda la belette s'approche. Wanda est une vétérante de l'entreprise reconnue pour son attitude intimidante. Justin lui tient la porte. Smarty est juste derrière eux, ressentant la pression du regard noir de Wanda.\n\nQuelle est la décision la plus sécuritaire pour l'équipe?"
        },
        image: { en: "assets/m2_start.png", fr: "assets/fr_m2_start.png" },
        choices: [
          {
            label: {
              en: "Option A: Let Wanda pass.",
              fr: "Option A: Laisser passer Wanda."
            },
            description: {
              en: "She’s worked here for years; it’s fine.",
              fr: "Elle travaille ici depuis des années; tout va bien."
            },
            next: "m2_fail_a",
            score: { integrity: 2, vigilance: 1, diplomacy: 5 }
          },
          {
            label: {
              en: "Option B: Insist on the scan.",
              fr: "Option B: Insister pour la validation de la carte."
            },
            description: {
              en: "Justin holds the door but says, \"Sorry, Wanda! Policy says everyone has to scan.\"",
              fr: "Justin tient la porte mais dit: «Désolé, Wanda! La politique dit que tout le monde doit badger.»"
            },
            next: "m2_success_b",
            score: { integrity: 5, vigilance: 5, diplomacy: 4 },
            badge: {
              en: "The Iron Gate",
              fr: "La Porte de Fer"
            }
          },
          {
            label: {
              en: "Option C: Close the door.",
              fr: "Option C: Fermer la porte."
            },
            description: {
              en: "Smarty slips in and lets the door click shut before Wanda can enter.",
              fr: "Smarty se faufile et laisse la porte se refermer avant que Wanda puisse entrer."
            },
            next: "m2_neutral_c",
            score: { integrity: 5, vigilance: 5, diplomacy: 1 }
          }
        ]
      },
      m2_fail_a: {
        text: {
          en: "🚪 SECURITY BREACH! This is \"Tailgating.\" Because Wanda didn't scan, there is no digital record of who is in the building. Accountability is lost.",
          fr: "🚪 FAILLE DE SÉCURITÉ! C'est de l'«accès non autorisé à la suite d'une personne autorisée» (Tailgating). Parce que Wanda n'a pas badgé, il n'y a aucune trace numérique de qui est dans le bâtiment. L'imputabilité est perdue."
        },
        image: { en: "assets/m2_fail_a.png", fr: "assets/fr_m2_fail_a.png" },
        type: "ending",
        outcome: "failure"
      },
      m2_success_b: {
        text: {
          en: "🔑 GOLD STANDARD SECURE! You balanced being a \"gentle-beaver\" with being a security pro. Every scan counts!",
          fr: "🔑 NORME D'OR DE LA SÉCURITÉ! Vous avez trouvé l'équilibre entre être un castor gentil et un pro de la sécurité. Chaque scan compte!"
        },
        image: { en: "assets/m2_success_b.png", fr: "assets/fr_m2_success_b.png" },
        type: "ending",
        outcome: "success",
        extra_badges: [
          {
            en: "The Gentle-Beaver",
            fr: "Le Gentil Castor"
          }
        ]
      },
      m2_neutral_c: {
        text: {
          en: "🧊 THE COLD SHOULDER. The building is safe, but the vibes are chilly! It's better to hold the door while politely requiring the scan.",
          fr: "🧊 ATTITUDE GLACIALE. Le bâtiment est en sécurité, mais l'ambiance est mauvaise! Il vaut mieux tenir la porte tout en exigeant poliment le scan de la carte."
        },
        image: { en: "assets/m2_neutral_c.png", fr: "assets/fr_m2_neutral_c.png" },
        type: "ending",
        outcome: "neutral"
      }
    }
  }
};
