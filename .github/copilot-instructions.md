# GitHub Copilot Instructions

These are project-level instructions for GitHub Copilot when working on this Vite-based React application.

## General Philosophy

- Always write **high-quality, professional, production-ready** code.
- **Avoid Technical Debt** at every opportunity. Prioritize maintainability and clear structure over shortcuts.
- Code should be **modular, testable, and scalable**. Prefer composition over monolithic design.
- Aim for code that is easy to understand, extend, and refactor.

## TypeScript & React Standards

- This project is a **TypeScript React application**. All code must be written in **TypeScript** with proper types and interfaces.
- Prefer explicit typing where possible. Avoid using `any`, and prefer strict types and discriminated unions.
- Use `React.FC<Props>` or equivalent for functional components.
- All React components should:
  - Be **small, modular**, and **single-responsibility**.
  - Be **self-contained in their own file(s)**. Never place multiple unrelated components in the same file.
  - Include **Prop validation** via TypeScript types or interfaces.
  - Be wrapped in or use an **Error Boundary** to catch unexpected runtime issues.
  - Include **input validation** and display **clear, actionable error messages** for the user.
  - Use **useEffect** and **useCallback** wisely—avoid unnecessary re-renders and tight coupling.

## Layout & File Structure

- The `App.tsx` file should only contain the **high-level layout and routing**. No application logic or deep component structure should exist there.
- Create and use a `components/` folder for atomic or reusable UI pieces, a `pages/` folder for route-level containers, and a `hooks/`, `types/`, `services/`, and `utils/` folder as needed.
- Follow the **"one component per file"** rule.
- Use **index.ts** files only for clean exports when it improves ergonomics—not as catch-alls.

## Error Handling

- Errors must be:
  - **Caught early**, and with useful detail.
  - **User-friendly** in UI, and **developer-meaningful** in logs.
  - **Granular**—avoid swallowing errors in large try/catch blocks.
- Validate inputs and state before acting on them.

## Testing & Code Quality

- Strive for **testable code**. Favor pure functions, injectable dependencies, and decoupled logic.
- Include basic **unit tests** and component tests for any complex logic or UI behavior.
- Use clear naming. Avoid abbreviations or unclear shorthand.

## Style & Tooling

- Follow best practices for modern React and TypeScript.
- Leverage ESLint, Prettier, and TypeScript strict mode to enforce code standards.
- Use React Router for routing, and manage state with built-in hooks or a dedicated state manager when complexity demands it.
- Prefer async/await over chained promises, and clean up all side effects.

## Final Notes

Copilot should **think like a senior engineer**—not just solve the task, but evaluate the design, anticipate future maintenance, and avoid introducing shortcuts that might lead to long-term issues.

