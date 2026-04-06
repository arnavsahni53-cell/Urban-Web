# Project Context

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

This project is a modern, minimalistic, and interactive website designed to help city leaders understand and explore new models for improving urban mobility systems.

The goal is to make complex system ideas intuitive, relatable, and actionable — without requiring prior technical knowledge.

The platform will evolve as use cases are refined (e.g., parking, multimodal journeys, ticketing, etc.).

---

# Core Principles

## 1. Clarity over Jargon
- Do not use technical terms, acronyms, or ecosystem-specific language (e.g., protocol names, industry jargon) unless absolutely necessary.
- Always prefer plain language.
- If a complex concept must be introduced, explain it using simple, real-world analogies.

## 2. Explain Concepts, Not Terminology
- Focus on what the system enables, not what it is called.
- Users should understand the value and functioning without needing to learn new vocabulary.

## 3. Minimal, Not Empty
- The design should feel modern and minimal, but not sterile.
- Use whitespace intentionally.
- Avoid unnecessary UI elements, animations, or decorative components.

## 4. Human, Not “AI-generated”
- Avoid generic layouts, predictable phrasing, and templated patterns.
- Write and design with intent.
- Every section should feel crafted and purposeful.

## 5. Interactive Understanding
- Interactivity should help users understand flows and outcomes.
- Avoid gimmicks; every interaction must add clarity.

## 6. Progressive Disclosure
- Start with simple ideas.
- Allow users to explore deeper layers only if they choose.
- Never overwhelm users upfront.

---

# Language Guidelines

## Use:
- Simple, direct sentences
- Real-world framing (e.g., “how a commuter finds a ride”)
- Concrete examples over abstract explanations

## Avoid:
- Terms like "protocol", "network architecture", "interoperability" unless explained
- Acronyms and internal terminology
- Buzzwords and consultant-style language

## If Technical Concepts Are Needed:
- Introduce them only after the user understands the problem
- Pair them with a clear explanation
- Make them optional, not required for understanding

---

# Design Guidelines

## Visual Style
- Clean, modern typography (high readability)
- Neutral base palette with restrained use of accent colors
- Consistent spacing and alignment

## Layout
- Clear hierarchy: headline → explanation → action
- Modular sections that can evolve over time

## Motion
- Subtle and purposeful
- Used to guide attention or explain transitions
- Never decorative for its own sake

---

# Interaction Philosophy

## Show How Things Work
- Focus on flows (e.g., how a journey is planned, how services connect)
- Highlight relationships between users, services, and systems

## Make It Exploratory
- Users should feel like they are uncovering how things work
- Use step-by-step flows, toggles, or scenario-based exploration

## Demonstrations (eventually agentic)
- Interactive demos may simulate real-world scenarios
- These should:
  - be intuitive and self-explanatory
  - focus on outcomes and benefits
  - avoid technical complexity in presentation
  - interactive
---

# Engineering Principles

## 1. Component-Driven Architecture
- Build reusable, composable components
- Keep structure flexible for evolving content

## 2. Performance First
- Fast load times and smooth interactions are critical
- Avoid heavy dependencies

## 3. Clean Code
- Clear naming, small functions, readable structure

## 4. Maintainability
- Separate content, logic, and presentation
- Ensure easy updates as use cases evolve

---

# Content Structure

## Narrative Flow
Each section should follow:
- A relatable problem
- A simple explanation of a better approach
- A clear outcome or benefit

## Writing Style
- Concise and scannable
- Avoid long paragraphs
- Use headings that communicate meaning, not labels

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.
- If something isn't available, use your own sense to use something which does not look out of place, use colours that go well and match the aesthetic. Use images that go well.In

---

# What to Avoid

- Technical jargon or insider language
- Overly complex explanations
- Feature-heavy descriptions without context
- Generic “innovation” or “AI” buzzwords
- Over-designed or flashy UI
- Interactions without clear purpose

---

# Success Criteria

The website should:
- Help a city leader understand the concept within minutes
- Make complex systems feel simple and intuitive
- Encourage exploration through interaction
- Build trust through clarity and thoughtful design
- Make it easy to express interest or continue engagement

---

# Notes for Future Expansion

- Use cases will evolve over time
- Interactive demos may become more advanced
- The system should support modular addition of new content and flows
- More detailed or technical layers can be added later, but should remain optional