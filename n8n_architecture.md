# Government Gamification Engine (Powered by n8n)

This document outlines the sophisticated workflow that bridges **Enterprise Content Management** (Microsoft 365) with **Generative AI** and **Gamification** to further develop the security-adventure project. 

For a Canadian Federal Government context, this system prioritizes **Bilingualism (Official Languages Act)**, **Accessibility (WCAG)**, and **Data Sovereignty**.

---

## 1. The n8n Workflow Architecture

This workflow transforms dry policy documents into interactive "Micro-Learning Modules."

### Phase A: Ingestion (The Trigger)
* **Trigger Node:** `Microsoft SharePoint` or `OneDrive` Trigger.
  * *Event:* A Training Officer uploads a file (e.g., `Telework_Policy_2026.docx`) to a specific "Input" folder.
* **Data Extraction Node:** `Read Binary File` / `Extract Text`.
  * *Action:* n8n pulls the raw text from the MS Word document or MS Form responses.

### Phase B: The "Screenwriter" Engine (GenAI Transformation)
This is the core intelligence. Multiple LLM calls (via Azure OpenAI to keep data in Canada) are chained to process the raw text.

1. **Node: The Analyst (LLM Agent 1)**
   * *Prompt:* "Analyze this text. Extract the top 3 'Learning Objectives' and the 3 most common 'Failure Modes' (mistakes employees make)."
2. **Node: The Scriptwriter (LLM Agent 2)**
   * *Prompt:* "Using the extracted objectives, write a 'Choose Your Own Adventure' script. Use the characters Justin (Beaver), Smarty (Fox), and Wanda (Weasel). Create a setup, a conflict based on the failure modes, and 3 choices (Safe, Unsafe, Neutral)."
3. **Node: The Translator (LLM Agent 3)**
   * *Requirement:* **Mandatory Bilingualism.**
   * *Prompt:* "Translate the script into Canadian French. Ensure terminology matches standard federal government glossaries."

### Phase C: Asset & JSON Construction
1. **Node: Image Matcher/Generator**
   * *Action:* Based on the script tags (e.g., `[Office]`, `[Conflict]`), the workflow selects images from the pre-approved "Character Model Sheet" database or generates new specific props if allowed.
2. **Node: JSON Formatter**
   * *Action:* Structure the English script, French script, and Image URLs into the standardized JSON format required by the "Antigravity" renderer (the frontend MVP).

### Phase D: Distribution & Badging (Microsoft Ecosystem)
1. **Node: Database Write**
   * *Action:* Save the new Module JSON to a SharePoint List or SQL Database.
2. **Node: Microsoft Teams Bot**
   * *Action:* Post a card to the "Training Channel."
   * *Message:* "New Micro-Learning Module Available: 'Telework Security'. Play now to earn your 'Remote Ranger' badge!"

---

## 2. The Player Experience (Micro-Learning & Badging)

Once the user clicks "Play" on the JSON-rendered module:
1. **The Game:** They play through the scenario (e.g., Justin vs. Wanda) in the web renderer MVP.
2. **The Completion:** Upon reaching a "Success" ending, the web app sends a webhook back to n8n.
3. **The Badge (n8n -> MS Teams):**
   * n8n triggers a `Microsoft Graph API` call.
   * It updates the user's profile in a SharePoint list or issues a digital badge image to their private Teams chat.
   * *Example:* "Congratulations! You earned the **Data Guardian** badge. Display it on your profile!"

---

## 3. Agile Development Proposal

To build this "Transformation Appliance," we use an Agile methodology (Scrum), broken into 2-week sprints.

### Phase 1: Discovery & Alpha (Sprints 1-3)
* **Goal:** Prove the "Text-to-Game" concept works.
* **Activities:**
  * Set up the n8n environment (Self-hosted or Cloud).
  * Connect Azure OpenAI.
  * **The MVP (Minimum Viable Product):** The static game rendered in the browser (what is currently built). This proves that with a prompt, you can generate a structured game.
  * *User Story:* "As a user, I want to see a static game rendered in a browser so I can understand the UI."

### Phase 2: Beta (The "Appliance" Build) (Sprints 4-8)
* **Goal:** Automate the pipeline.
* **Activities:**
  * Build the SharePoint Ingestion trigger in n8n.
  * Refine the "Screenwriter" prompts to handle boring government docs reliably.
  * Implement the English-to-French translation node.
  * *User Story:* "As a Training Officer, I want to upload a Word Doc and get a JSON game file without writing code."

### Phase 3: Live (Integration & Tracking) (Sprints 9-12)
* **Goal:** Connect to MS Teams and Badging.
* **Activities:**
  * Build the MS Teams Adaptive Card integration.
  * Create the "Badging Database" in SharePoint.
  * Security Audit (ensure Protected B compliance).

---

## Source Code for the Engine's Brain

To kickstart the n8n AI Agent node, use the following logic in the **System Prompt** of the *Scriptwriter* node (Phase B, Step 2). This logic was used to generate the initial "Justin, Smarty, and Wanda" MVP content:

```text
You are an expert interactive fiction writer and instructional designer.
Your task is to convert the provided learning objectives and failure modes into a "Choose Your Own Adventure" script for a micro-learning module.

Guidelines:
1. Use the pre-established characters:
   - Justin (Beaver): Well-meaning but sometimes naive.
   - Smarty (Fox): Vigilant, diplomatic, and security-conscious.
   - Wanda (Weasel): Intimidating, traditional, and sometimes bypasses rules.
2. Create a brief setup outlining the situation.
3. Introduce a conflict based on the provided failure modes.
4. Present exactly 3 choices for the user to make:
   - A Safe choice (often balancing vigilance and diplomacy).
   - An Unsafe choice (yielding a security breach).
   - A Neutral choice (technically safe but poorly executed, e.g., low diplomacy).
5. For each choice, provide an outcome node describing the consequences and assigning a success/failure/neutral status.
6. Output the final scenario in a clean JSON structure that matches our renderer's schema.
```
