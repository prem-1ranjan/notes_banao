type NotesPdfRenderResult = {
  ok?: boolean;
  engine?: string;
  dataUrl?: string;
  error?: string;
  size?: number;
};

type NotesPdfFlow = "single" | "combined";

type NotesPdfRenderer = (input: {
  markdown: string;
  title: string;
  userEmail?: string;
  notesFlow?: NotesPdfFlow;
  billingMode?: string;
  billing_mode?: string;
}) => Promise<NotesPdfRenderResult>;

declare global {
  interface Window {
    renderNotesPdf?: NotesPdfRenderer;
    pdfMake?: unknown;
    marked?: unknown;
    mermaid?: unknown;
  }
}

const RENDERER_SCRIPTS = [
  "/notes-pdf/vendor/marked.umd.js",
  "/notes-pdf/vendor/mermaid.min.js",
  "/notes-pdf/vendor/pdfmake.min.js",
  "/notes-pdf/vendor/unicode_fonts.js",
  "/notes-pdf/pdf_renderer.js"
];

let rendererLoadPromise: Promise<NotesPdfRenderer> | null = null;

export async function renderAndDownloadNotesPdf(input: {
  markdown: string;
  title: string;
  userEmail?: string;
  notesFlow?: NotesPdfFlow;
  billingMode?: string;
}) {
  const renderer = await ensureNotesPdfRenderer();
  const result = await renderer({
    markdown: input.markdown,
    title: input.title,
    userEmail: input.userEmail,
    notesFlow: input.notesFlow,
    billingMode: input.billingMode,
    billing_mode: input.billingMode
  });
  if (!result?.ok || !result.dataUrl) {
    throw new Error(result?.error || "Could not render notes PDF.");
  }

  triggerDataUrlDownload(result.dataUrl, `${sanitizeFilename(input.title)}.pdf`);
  return {
    engine: result.engine || "pdfmake",
    size: result.size || 0
  };
}

export function downloadMarkdownText(markdown: string, title: string) {
  triggerBlobDownload(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    `${sanitizeFilename(title)}.md`
  );
}

export function sanitizeFilename(value: string) {
  return (value || "lecture-notes")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "lecture-notes";
}

async function ensureNotesPdfRenderer() {
  if (window.renderNotesPdf) {
    return window.renderNotesPdf;
  }

  rendererLoadPromise ||= loadRendererScripts()
    .then(() => {
      if (!window.renderNotesPdf) {
        throw new Error("Notes PDF renderer did not load.");
      }
      return window.renderNotesPdf;
    })
    .catch((error) => {
      rendererLoadPromise = null;
      throw error;
    });

  return rendererLoadPromise;
}

async function loadRendererScripts() {
  for (const src of RENDERER_SCRIPTS) {
    await loadScript(src);
  }
}

export function loadScript(src: string) {
  let existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing?.dataset.error === "true") {
    existing.remove();
    existing = null;
  }
  if (existing?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = existing || document.createElement("script");
    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
    const handleLoad = () => {
      script.dataset.loaded = "true";
      cleanup();
      resolve();
    };
    const handleError = () => {
      script.dataset.error = "true";
      script.remove();
      cleanup();
      reject(new Error(`Could not load ${src}.`));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existing) {
      script.src = src;
      script.async = false;
      document.head.appendChild(script);
    }
  });
}

function triggerDataUrlDownload(dataUrl: string, filename: string) {
  triggerBlobDownload(dataUrlToBlob(dataUrl), filename);
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function dataUrlToBlob(dataUrl: string) {
  const [metadata, encoded] = dataUrl.split(",", 2);
  if (!metadata || !encoded) {
    throw new Error("Renderer returned an invalid PDF payload.");
  }

  const mimeType = metadata.match(/^data:([^;]+)(?:;base64)?$/)?.[1] || "application/pdf";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}
