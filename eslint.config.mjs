// ESLint flat config. `next lint` was removed in Next 16, so lint runs through
// the ESLint CLI directly (`npm run lint` -> `eslint .`).
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// `eslint-config-next/typescript` already ignores .next/, out/, build/ and
// next-env.d.ts. These are the extra build outputs and vendored third-party
// bundles (mermaid/pdfmake/marked/fonts, shipped as-is for the PDF renderer)
// that this project keeps in-tree but doesn't author.
const ignores = [
  ".open-next/**",
  ".wrangler/**",
  ".wrangler-dev/**",
  "cloudflare-env.d.ts",
  "public/notes-pdf/vendor/**"
];

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores },
  {
    // Scripts under public/ are injected with a plain <script src> tag (see
    // app/dashboard/components/richPdfDownload.ts), not imported as modules, so
    // they must be scope-analyzed as scripts rather than ES modules.
    files: ["public/**/*.js"],
    languageOptions: { sourceType: "script" }
  },
  {
    // Inherited from the production portal: a handful of panels sync derived
    // state inside an effect (WalletPanel's package/gateway defaults,
    // TrialClaimControl, the dashboard's ?section= handling). React would
    // rather these were computed during render. They work, so they are warnings
    // rather than build-stopping errors — and cleaning them up is a genuinely
    // useful first task.
    rules: {
      "react-hooks/set-state-in-effect": "warn"
    }
  }
];

export default config;
