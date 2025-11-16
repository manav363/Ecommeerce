# capstone

# UrbenShop (README)

## Live demo

Deployed site: https://capstone-mocha-eight.vercel.app/

---

## Project Overview

**UrbenShop** is a small e-commerce front-end demo that showcases a luxury shopping experience with featured products, categories, a promotions section, and basic navigation (Home, Shop, About, Contact, Cart).

The live site includes promotional banners (e.g. "Summer Sale - Up to 50% Off"), a featured products section (watch, handbag, sunglasses, perfume), and a footer with contact information and newsletter subscription.

---

## Key Features

- Landing / Home page with hero banner and call-to-action buttons
- Featured products grid with product cards and "View Details" actions
- Shop-by-category blocks (Watches, Bags, Accessories)
- Promotions / Special offers section
- Navigation: Home, Shop, About, Contact, Cart
- Footer with contact information and newsletter subscribe form

---

## Pages (as seen in the live site)

- **Home** — hero, featured products, categories, special offers
- **Shop** — collection listing and product tiles
- **About** — information about the brand
- **Contact** — contact details and a form
- **Cart** — shopping cart overview

---

## Tech (assumptions & recommended checks)

The site is deployed on Vercel (capstone-mocha-eight.vercel.app). The exact tech stack is not directly visible from the rendered HTML. It likely uses standard web technologies (HTML/CSS/JavaScript) and may be built with a React/Next.js stack given the Vercel deployment, but you should inspect the project repository (package.json) to confirm.

---

## Local development (two approaches)

### If the project is a Node/React/Next app (recommended)

1. Clone the repository:

```bash
git clone <repo-url>
cd <repo-folder>
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn
```

3. Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Build for production:

```bash
npm run build
npm run start
```

### If the project is a static site (HTML/CSS/JS)

1. Clone the repo and open `index.html` in a browser, or serve it with a static server:

```bash
npx http-server ./ -p 8080
# or
python3 -m http.server 8080
```

---

## Project structure (example)

```
/ (project root)
├─ public/           # static assets (images, fonts)
├─ src/              # source files (components, pages, styles)
├─ pages/            # (if Next.js) page routes
├─ styles/           # global and component styles
├─ package.json
└─ README.md
```

---

## Accessibility & Improvements (suggestions)

- Add `alt` text on all images and ensure semantic HTML for better accessibility
- Improve form validation and error states on the contact/newsletter forms
- Add product detail pages and persistent cart state (localStorage or backend)
- Implement responsive image sizes and lazy-loading for performance
- Add unit/integration tests for key UI components

---

## Deployment

- The site is currently deployed to Vercel. To deploy yourself, connect the Git repository to Vercel and configure the build command (`npm run build` / `next build`) and output directory (if static) as needed.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes and push to your fork
4. Open a pull request describing your changes

---

## License

Add a license file to the repository (e.g., MIT) or update this README with the chosen license.

---

## Contact

For questions about this demo site, the footer on the live site lists contact info (email: info@urbenshop.com).
