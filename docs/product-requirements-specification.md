# Product Requirements Specification

**Product Title**: Half-Life Caffeine Tracker  
**Repository**: https://github.com/halflifecaffeine/halflifecaffeine.github.io  
**Domain**: [https://halflifecaffeine.com](https://halflifecaffeine.com)  
**Hosting**: GitHub Pages  
**PWA**: Yes (installable offline, no backend required)

---

## 1. Overview

A single-purpose static web app designed to visualize the degradation (half-life) of caffeine in the human body over time based on intake events. The app will support both graphical and tabular output to inform users of their caffeine levels, and educate them on healthy intake guidelines.

This application will:
- Allow users to enter caffeine intake events manually or via a time grid picker.
- Visualize decay using a rolling 24-hour half-life graph.
- Offer a lookup utility to find caffeine content in common drinks.
- Be fully responsive, accessible (WCAG compliant), and PWA-capable.
- Store all user data in LocalStorage.
- Be open-source and easily reusable (TypeScript engine as a standalone module).

---

## 2. Tech Stack

- **Frontend Framework**: React (Vite or CRA)
- **Styling/UI Framework**: Bootstrap 5, via `react-bootstrap`
- **Icons**: FontAwesome, via `react-fontawesome`
- **Charting**: `recharts` (or similar high-quality React charting library)
- **Testing**: `vitest` (or `jest`) + React Testing Library
- **CI/CD**: GitHub Actions (for linting, tests, building, deploying to GitHub Pages)
- **Language**: TypeScript only
- **State Management**: React hooks and Context API
- **Storage**: Browser LocalStorage
- **Accessibility**: Initial accessibility features implemented with WCAG 2.1 AA compliance as an ongoing goal
- **PWA**: Currently not implemented; planned for future development

---

## 3. Functional Requirements

### 3.1. Intake Entry

- Support two intake modes via tabbed interface:
  - Text Area: Each line in format `HH:MM <amount in mg>`
  - Grid Picker: Clickable 24-hour grid. Each hour opens modal to select drink & volume
- Allow input in oz, mL, cups, quarts, gallons and allow fractional quantities
- Auto-convert all input volumes to mg caffeine using drink data
- All inputs validated for syntax, sanity, and unit correctness
- Persist data in LocalStorage
- Interface for managing (edit, delete, clone) intake entries
- Clear error handling with form validation

### 3.2. Caffeine Metabolism Engine

- Pure TypeScript function/module that accepts:
```ts
  type CaffeineEvent = { datetime: string; mg: number };
  function computeLevels(events: CaffeineEvent[], now: Date): TimeSeriesData[];
```
- Calculates net caffeine over time using a 6-hour half-life
- Outputs hourly level data for last 24 hours (rolling, not midnight-reset)
- Treats all caffeine identically regardless of source
- Exposed as a standalone reusable module (MIT licensed)
- Fully covered with unit tests

### 3.3. Visualization

- Stacked area chart over 24 hours of current caffeine level
- Y-axis = mg caffeine, X-axis = time (24 hours)
- Tooltip shows amount and exact time on hover
- Data table below graph (hour-by-hour level in mg)
- Responsive layout for mobile/tablet
- Bootstrap theme integration (dark/light via user system or toggle)

### 3.4. Caffeine Lookup Tool

- Tab or slide-out panel
- Backed by static JSON file with fields:
```json
{
  "manufacturer": "Panera",
  "product": "Green Tea",
  "category": "tea",
  "volume_oz": 20,
  "caffeine_mg": 75,
  "labels": ["#sweet", "#green-tea"]
}
```
- Search bar (product name, manufacturer, label)
- Filters (by category, label)
- Allow user to add custom drinks (stored in LocalStorage)
- Volume conversions (user can input any amount, see effective caffeine)

### 3.5. Preferences & Settings

- Bootstrap 5 offcanvas slide-out (Settings)
- Options:
  - Theme: Auto / Light / Dark (persisted in LocalStorage)
  - Export/Import caffeine data (JSON, CSV, optional PDF)
  - Export/Import custom drink list
  - Clear all data
- Respect user theme unless manually overridden

---

## 4. Non-Functional Requirements

### 4.1. Accessibility (a11y)

- Initial accessibility features implemented with WCAG 2.1 AA compliance as an ongoing goal
- Semantic HTML and ARIA labels
- Fully keyboard-navigable
- Accessible color contrast and tab order

### 4.2. Performance

- Fast loading (target <500kb total bundle size)
- No backend/network dependencies
- Graph renders in under 200ms on low-power devices

### 4.3. Code Quality

- Modular component architecture
- Linting (ESLint + Prettier)
- Type-safe (no `any` or implicit types)
- Input validation and form error boundaries
- Unit + integration test coverage
- GitHub Actions: lint → test → build → deploy

### 4.4. PWA Capabilities

- Offline cache of all assets and data
- App install prompt (desktop and mobile)
- Web manifest, icons, and splash screens
- Fully functional without internet

---

## 5. File/Module Structure

```bash
/src
  /components
    IntakeTextForm.tsx
    TimeGridPicker.tsx
    CaffeineChart.tsx
    CaffeineTable.tsx
    DrinkLookup.tsx
    PreferencesPanel.tsx
  /engine
    caffeineCalculator.ts         # standalone module
  /data
    drinks.json                   # static database
  /hooks
    useLocalStorage.ts
    useTheme.ts
  /utils
    conversions.ts
    validators.ts
  /pages
    Home.tsx
    Lookup.tsx
/public
  manifest.json
  icons/
  robots.txt
/tests
  engine.test.ts
  components/*.test.tsx
```

---

## 6. Educational Component

- Banner: “400mg max/day for healthy adults”
- Banner: “>100mg near bedtime may disrupt sleep”
- Infobox explaining how caffeine half-life works
- Support links to reputable sources (CDC, Mayo Clinic, etc.)

---

## 7. Future Enhancements

- Add metabolism rate setting (slow, normal, fast)
- Allow user profiles to track day-by-day history
- Sync to wearable APIs (Apple Health, Fitbit, etc.)
- Cloud sync backup via GitHub or Dropbox
- AI-based caffeine alerting (e.g. “Don’t drink now, it’ll disrupt sleep”)

---

## 8. Glossary / Definitions

- **Half-Life**: Time for half the caffeine to metabolize (default: 6 hrs)
- **mg**: Milligrams, unit of caffeine
- **LocalStorage**: Browser’s local persistent store
- **WCAG**: Web Content Accessibility Guidelines
- **PWA**: Progressive Web App

