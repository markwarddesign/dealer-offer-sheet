# M.I.L.E.S.
### Monthly Investment & Lifetime Expense Savings

A modern dealership sales tool built for automotive finance & insurance professionals. M.I.L.E.S. helps sales teams configure vehicle deals, generate polished customer-facing offer sheets, and present transparent trade-in comparisons — all in one fast, printable web app.

---

## ✨ Features

- **Guided Deal Builder** — A multi-step form covering buyer info, vehicle details, pricing, fees, add-ons, trade-ins, and financing options
- **Live Calculations** — Profit, ROI, sales tax, net trade, and finance payment tables update in real time as data is entered
- **Customer Offer Sheet** — A clean, print-optimized summary prepared for the customer, including a financing matrix across multiple down payments and terms
- **Trade-In vs. Private Sale Report** — An interactive comparison tool that shows customers the true cost of selling privately versus trading in, accounting for taxes, carrying costs, dealer exclusives (WPFL, OCFL), and time-to-sell
- **VIN Lookup** — Auto-populates year, make, model, and MPG by decoding any VIN via the [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/)
- **Quick Entry Mode** — A condensed single-page layout for speed when walking a deal quickly
- **Settings Page** — Configure trade devalue presets, warranty protection options, oil change pricing, default finance terms, down payment options, and more
- **Persistent State** — All deal data and settings are saved to `localStorage` via Zustand middleware — no backend required
- **Dark Mode** — Full light/dark theme toggle
- **Auth** — Simple admin password login with a one-hour timed demo access mode

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 7](https://vitejs.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) (with `persist` middleware) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| External API | [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/) |
| Deployment | [GitHub Pages](https://pages.github.com/) via `gh-pages` |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (OfferSheet, Sidebar, forms, inputs)
├── pages/            # Top-level route pages (QuickEntryPage, SettingsPage)
├── steps/            # Individual steps of the deal builder form
├── utils/            # Pure utility functions (calculations, formatting, VIN lookup)
├── store.js          # Global Zustand store with all deal data and settings
├── formSteps.jsx     # Step definitions and ordering for the deal builder
└── App.jsx           # Root component with routing and auth gate
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 🧮 How Calculations Work

All deal math lives in [`src/utils/calculateOffer.js`](src/utils/calculateOffer.js) and runs reactively on every store update:

- **Base Investment** = Acquisition Cost + Reconditioning + Advertising + Flooring
- **Dealership Investment** = Base Investment + B/O Tax
- **Gross Profit** = Selling Price − Dealership Investment
- **ROI** = Gross Profit / Base Investment × 100
- **Sales Tax** = Taxable Amount × Tax Rate (trade-in excluded from taxable amount unless it's a lease)
- **Finance Table** — Monthly payments computed across all configured down payment / term combinations using the standard amortization formula

---

## 📄 License

This project is private and not open for redistribution.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
