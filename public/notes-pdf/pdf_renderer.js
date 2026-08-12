function dataUrlFromAscii(text, mimeType = "application/pdf") {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const batchSize = 0x8000;
  for (let index = 0; index < bytes.length; index += batchSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + batchSize));
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

const LATEX_SYMBOLS = {
  Alpha: "Α",
  Beta: "Β",
  Gamma: "Γ",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Theta: "Θ",
  Iota: "Ι",
  Kappa: "Κ",
  Lambda: "Λ",
  Mu: "Μ",
  Nu: "Ν",
  Xi: "Ξ",
  Omicron: "Ο",
  Pi: "Π",
  Rho: "Ρ",
  Sigma: "Σ",
  Tau: "Τ",
  Upsilon: "Υ",
  Phi: "Φ",
  Chi: "Χ",
  Psi: "Ψ",
  Omega: "Ω",
  Delta: "Δ",
  varepsilon: "ε",
  vartheta: "ϑ",
  varpi: "ϖ",
  varrho: "ϱ",
  varsigma: "ς",
  varphi: "φ",
  delta: "δ",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  times: "×",
  div: "÷",
  cdot: "·",
  ast: "∗",
  pm: "±",
  mp: "∓",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  neq: "≠",
  ne: "≠",
  equiv: "≡",
  approx: "≈",
  sim: "∼",
  simeq: "≃",
  cong: "≅",
  propto: "∝",
  partial: "∂",
  nabla: "∇",
  int: "∫",
  sum: "∑",
  prod: "∏",
  sqrt: "√",
  angle: "∠",
  perp: "⊥",
  parallel: "∥",
  therefore: "∴",
  because: "∵",
  degree: "°",
  circ: "°",
  rightarrow: "→",
  leftarrow: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  rightleftharpoons: "⇌",
  uparrow: "↑",
  downarrow: "↓",
  to: "→",
  infty: "∞",
  hbar: "ℏ",
  ell: "ℓ",
  top: "T",
  dots: "...",
  ldots: "...",
  cdots: "...",
  forall: "∀",
  exists: "∃",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  superset: "⊃",
  supseteq: "⊇",
  cup: "∪",
  cap: "∩",
  emptyset: "∅"
};

const SUPERSCRIPT_DIGITS = {
  0: "⁰",
  1: "¹",
  2: "²",
  3: "³",
  4: "⁴",
  5: "⁵",
  6: "⁶",
  7: "⁷",
  8: "⁸",
  9: "⁹",
  "+": "⁺",
  "-": "⁻"
};

const SUBSCRIPT_DIGITS = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉",
  "+": "₊",
  "-": "₋"
};

const MATH_WORD_SYMBOLS = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  sigma: "σ",
  phi: "φ",
  omega: "ω",
  Delta: "Δ",
  Sigma: "Σ",
  Omega: "Ω"
};

const PDF_GLYPH_REPLACEMENTS = {
  "→": "->",
  "←": "<-",
  "↔": "<->",
  "⇒": "=>",
  "⇐": "<=",
  "⇔": "<=>",
  "⇌": "<->",
  "↑": "up",
  "↓": "down",
  "×": "x",
  "÷": "/",
  "·": "*",
  "∗": "*",
  "±": "+/-",
  "∓": "-/+",
  "≤": "<=",
  "≥": ">=",
  "≠": "!=",
  "≡": "===",
  "≈": "~=",
  "≃": "~=",
  "≅": "~=",
  "∼": "~",
  "∝": "proportional to",
  "∂": "partial",
  "∇": "grad",
  "∫": "integral",
  "∑": "sum",
  "∏": "product",
  "√": "sqrt",
  "∠": "angle",
  "⊥": "perpendicular",
  "∥": "parallel",
  "∴": "therefore",
  "∵": "because",
  "∞": "infinity",
  "ℏ": "hbar",
  "ℓ": "ell",
  "∀": "for all",
  "∃": "exists",
  "∈": "in",
  "∉": "not in",
  "⊂": "subset",
  "⊆": "subset or equal",
  "⊃": "superset",
  "⊇": "superset or equal",
  "∪": "union",
  "∩": "intersection",
  "∅": "empty set"
};

const PDF_GREEK_NAMES = {
  Α: "Alpha",
  Β: "Beta",
  Γ: "Gamma",
  Δ: "Delta",
  Ε: "Epsilon",
  Ζ: "Zeta",
  Η: "Eta",
  Θ: "Theta",
  Ι: "Iota",
  Κ: "Kappa",
  Λ: "Lambda",
  Μ: "Mu",
  Ν: "Nu",
  Ξ: "Xi",
  Ο: "Omicron",
  Π: "Pi",
  Ρ: "Rho",
  Σ: "Sigma",
  Τ: "Tau",
  Υ: "Upsilon",
  Φ: "Phi",
  Χ: "Chi",
  Ψ: "Psi",
  Ω: "Omega",
  α: "alpha",
  β: "beta",
  γ: "gamma",
  δ: "delta",
  ε: "epsilon",
  ζ: "zeta",
  η: "eta",
  θ: "theta",
  ι: "iota",
  κ: "kappa",
  λ: "lambda",
  μ: "mu",
  ν: "nu",
  ξ: "xi",
  ο: "omicron",
  π: "pi",
  ρ: "rho",
  σ: "sigma",
  τ: "tau",
  υ: "upsilon",
  φ: "phi",
  χ: "chi",
  ψ: "psi",
  ω: "omega"
};

const PDF_SUPERSCRIPT_ASCII = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "-",
  "ᵀ": "T"
};

const PDF_SUBSCRIPT_ASCII = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  "₊": "+",
  "₋": "-"
};

function superscriptText(value) {
  return String(value || "").split("").map((char) => SUPERSCRIPT_DIGITS[char] || char).join("");
}

function subscriptText(value) {
  return String(value || "").split("").map((char) => SUBSCRIPT_DIGITS[char] || char).join("");
}

function readableChemistryFormula(value) {
  return String(value || "")
    .replace(/<[-=]>/g, "⇌")
    .replace(/->/g, "→")
    .replace(/<-/g, "←")
    .replace(/\^([0-9+\-]+)/g, (_match, charge) => superscriptText(charge))
    .replace(/([A-Z][a-z]?)(\d+)/g, (_match, element, digits) => `${element}${subscriptText(digits)}`)
    .replace(/([)\]])(\d+)/g, (_match, group, digits) => `${group}${subscriptText(digits)}`);
}

function readableLatexMath(value) {
  let text = String(value || "");
  text = text
    .replace(/\\(?:left|right)\s*(?=[()[\]{}|.])/g, "")
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "($1/$2)")
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, "√($1)")
    .replace(/\\ce\s*\{([^{}]+)\}/g, (_match, formula) => readableChemistryFormula(formula))
    .replace(/\\text\s*\{([^{}]+)\}/g, "$1")
    .replace(/\\(?:mathrm|mathbf|mathit|operatorname)\s*\{([^{}]+)\}/g, "$1")
    .replace(/\\{1,2}([A-Za-z]+)/g, (match, name) => LATEX_SYMBOLS[name] || match.replace(/^\\+/, ""))
    .replace(/\^\{([0-9+\-]+)\}/g, (_match, digits) => superscriptText(digits))
    .replace(/_\{([0-9+\-]+)\}/g, (_match, digits) => subscriptText(digits))
    .replace(/\^([0-9+\-])/g, (_match, digit) => superscriptText(digit))
    .replace(/_([0-9+\-])/g, (_match, digit) => subscriptText(digit))
    .replace(/\^\{°\}/g, "°")
    .replace(/\^\s*°/g, "°")
    .replace(/[{}]/g, "")
    .replace(/\b(alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|omega|Delta|Sigma|Omega)\b/g, (match) => MATH_WORD_SYMBOLS[match] || match)
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

function replaceInlineMath(value) {
  return String(value || "")
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expression) => readableLatexMath(expression))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expression) => readableLatexMath(expression))
    .replace(/\$([^$\n]+)\$/g, (_match, expression) => readableLatexMath(expression));
}

function prepareMarkdownForPdf(value) {
  const lines = String(value || "").split(/\r?\n/);
  const output = [];
  let pendingMarkdown = [];
  let fenced = false;

  function flushPendingMarkdown() {
    if (!pendingMarkdown.length) {
      return;
    }
    output.push(replaceInlineMath(pendingMarkdown.join("\n")));
    pendingMarkdown = [];
  }

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (!fenced) {
        flushPendingMarkdown();
      }
      fenced = !fenced;
      output.push(line);
      continue;
    }
    if (fenced) {
      output.push(line);
    } else {
      pendingMarkdown.push(line);
    }
  }
  flushPendingMarkdown();

  return output.join("\n");
}

function normalizePdfGlyphs(value) {
  return String(value || "")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ᵀ]+/g, (match) =>
      `^${match.split("").map((char) => PDF_SUPERSCRIPT_ASCII[char] || char).join("")}`)
    .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋]+/g, (match) =>
      match.split("").map((char) => PDF_SUBSCRIPT_ASCII[char] || char).join(""))
    .replace(/[\u0391-\u03a9\u03b1-\u03c9]/g, (match) => PDF_GREEK_NAMES[match] || match)
    .replace(/[\u2190-\u21ff\u2200-\u22ff\u00b1\u00b7\u00d7\u00f7\u2100-\u214f]/g, (match) =>
      PDF_GLYPH_REPLACEMENTS[match] || "");
}

// Mathematical Alphanumeric Symbols (U+1D400-1D7FF, e.g. blackboard-bold \ud835\udd3c) are outside
// DejaVu Sans' repertoire, so map them back to their plain ASCII base to avoid missing-
// glyph boxes. Everything else (Greek, operators, arrows, sub/superscripts, accents,
// currency) is rendered directly by DejaVu, so we no longer strip or transliterate it.
const MATH_ALNUM_BLOCKS = [
  [0x1d400, 0x1d419, 65], [0x1d41a, 0x1d433, 97], [0x1d434, 0x1d44d, 65], [0x1d44e, 0x1d467, 97],
  [0x1d468, 0x1d481, 65], [0x1d482, 0x1d49b, 97], [0x1d49c, 0x1d4b5, 65], [0x1d4b6, 0x1d4cf, 97],
  [0x1d4d0, 0x1d4e9, 65], [0x1d4ea, 0x1d503, 97], [0x1d504, 0x1d51d, 65], [0x1d51e, 0x1d537, 97],
  [0x1d538, 0x1d551, 65], [0x1d552, 0x1d56b, 97], [0x1d56c, 0x1d585, 65], [0x1d586, 0x1d59f, 97],
  [0x1d5a0, 0x1d5b9, 65], [0x1d5ba, 0x1d5d3, 97], [0x1d5d4, 0x1d5ed, 65], [0x1d5ee, 0x1d607, 97],
  [0x1d608, 0x1d621, 65], [0x1d622, 0x1d63b, 97], [0x1d63c, 0x1d655, 65], [0x1d656, 0x1d66f, 97],
  [0x1d670, 0x1d689, 65], [0x1d68a, 0x1d6a3, 97],
  [0x1d7ce, 0x1d7d7, 48], [0x1d7d8, 0x1d7e1, 48], [0x1d7e2, 0x1d7eb, 48], [0x1d7ec, 0x1d7f5, 48], [0x1d7f6, 0x1d7ff, 48]
];

function mathAlnumFallback(ch) {
  const cp = ch.codePointAt(0);
  for (const [start, end, base] of MATH_ALNUM_BLOCKS) {
    if (cp >= start && cp <= end) {
      return String.fromCharCode(base + (cp - start));
    }
  }
  return ch;
}

function normalizePdfText(value) {
  return replaceInlineMath(value)
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[\u{1d400}-\u{1d7ff}]/gu, mathAlnumFallback);
}

function inlineTokenText(tokens = []) {
  return tokens.map((token) => {
    if (token.type === "text" || token.type === "escape" || token.type === "codespan") {
      return token.text || "";
    }
    if (token.type === "strong" || token.type === "em" || token.type === "del") {
      return inlineTokenText(token.tokens || []);
    }
    if (token.type === "link") {
      return inlineTokenText(token.tokens || []) || token.href || "";
    }
    if (token.type === "image") {
      return token.text ? `[image: ${token.text}]` : "[image]";
    }
    if (token.type === "br") {
      return "\n";
    }
    return token.raw || token.text || "";
  }).join("");
}

function stripMarkdownArtifacts(value) {
  return normalizePdfText(value)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/"([^"]+)"/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownTokenText(token) {
  if (!token) {
    return "";
  }
  if (token.tokens) {
    return stripMarkdownArtifacts(inlineTokenText(token.tokens));
  }
  if (token.text) {
    return stripMarkdownArtifacts(token.text);
  }
  return stripMarkdownArtifacts(token.raw || "");
}

function plainInlineText(tokens = []) {
  return normalizePdfText(inlineTokenText(tokens));
}

function pdfMakeTextFragmentsWithInlineMath(value, style = {}) {
  const source = String(value || "");
  const mathPattern = /\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g;
  const fragments = [];
  let lastIndex = 0;
  let match;

  function pushFragment(text, fragmentStyle) {
    const normalized = normalizePdfText(text);
    if (!normalized) {
      return;
    }
    fragments.push({
      text: normalized,
      ...style,
      ...fragmentStyle
    });
  }

  while ((match = mathPattern.exec(source))) {
    pushFragment(source.slice(lastIndex, match.index), {});
    pushFragment(readableLatexMath(match[1] || match[2] || ""), { italics: true });
    lastIndex = match.index + match[0].length;
  }

  pushFragment(source.slice(lastIndex), {});
  return fragments;
}

function decodeBasicHtmlEntities(value) {
  return String(value || "").replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_match, entity) => {
    const key = String(entity || "").toLowerCase();
    if (key === "amp") return "&";
    if (key === "lt") return "<";
    if (key === "gt") return ">";
    if (key === "quot") return '"';
    if (key === "apos") return "'";
    if (key.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(key.slice(2), 16) || 0);
    }
    if (key.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(key.slice(1), 10) || 0);
    }
    return "";
  });
}

function htmlToPdfText(value) {
  return decodeBasicHtmlEntities(String(value || "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, ""))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitPipeTableRow(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed.includes("|")) {
    return [];
  }

  const inner = trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "");
  const cells = [];
  let cell = "";
  for (let index = 0; index < inner.length; index += 1) {
    const char = inner[index];
    if (char === "\\" && inner[index + 1] === "|") {
      cell += "|";
      index += 1;
      continue;
    }
    if (char === "|") {
      cells.push(cell.trim());
      cell = "";
      continue;
    }
    cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function isPipeTableLine(line) {
  const trimmed = String(line || "").trim();
  return trimmed.includes("|") && splitPipeTableRow(trimmed).length >= 2;
}

function isPipeTableSeparatorLine(line) {
  const cells = splitPipeTableRow(line);
  if (cells.length < 2) {
    return false;
  }
  return cells.every((cell) => /^:?-*:?$/.test(cell.replace(/\s+/g, ""))) &&
    cells.some((cell) => /[-:]/.test(cell));
}

function normalizePipeTableCells(cells, columnCount) {
  return Array.from({ length: columnCount }, (_value, index) =>
    stripMarkdownArtifacts(cells[index] || ""));
}

function parsePipeTableAt(lines, startIndex) {
  if (!isPipeTableLine(lines[startIndex]) || !isPipeTableSeparatorLine(lines[startIndex + 1])) {
    return null;
  }

  const rawRows = [];
  let index = startIndex + 2;
  while (index < lines.length && isPipeTableLine(lines[index]) && !isPipeTableSeparatorLine(lines[index])) {
    rawRows.push(splitPipeTableRow(lines[index]));
    index += 1;
  }

  const headerCells = splitPipeTableRow(lines[startIndex]);
  const columnCount = Math.max(
    headerCells.length,
    ...rawRows.map((row) => row.length),
    2
  );
  return {
    nextIndex: index,
    table: {
      header: normalizePipeTableCells(headerCells, columnCount),
      rows: rawRows.map((row) => normalizePipeTableCells(row, columnCount))
    }
  };
}

function pdfMakeTableFromParsed(table) {
  return pdfMakeTable({
    header: (table.header || []).map((text) => ({ text })),
    rows: (table.rows || []).map((row) => row.map((text) => ({ text })))
  });
}

function pdfMakeParagraphFromText(value, options = {}) {
  const text = stripMarkdownArtifacts(value);
  if (!text) {
    return null;
  }
  return {
    text: [{ text }],
    margin: options.margin || [0, 3, 0, 8],
    style: options.style || "paragraph"
  };
}

function pdfMakeBlocksFromRawText(value, options = {}) {
  const raw = normalizePdfText(value);
  if (!raw.trim()) {
    return [];
  }

  const content = [];
  const lines = raw.split(/\r?\n/);
  const pendingText = [];

  function flushText() {
    const chunks = pendingText
      .join("\n")
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    pendingText.length = 0;
    chunks.forEach((chunk) => {
      const paragraph = pdfMakeParagraphFromText(chunk, options);
      if (paragraph) {
        content.push(paragraph);
      }
    });
  }

  for (let index = 0; index < lines.length;) {
    const parsedTable = parsePipeTableAt(lines, index);
    if (parsedTable) {
      flushText();
      content.push(pdfMakeTableFromParsed(parsedTable.table));
      index = parsedTable.nextIndex;
      continue;
    }
    pendingText.push(lines[index]);
    index += 1;
  }

  flushText();
  return content;
}

function hasRawPipeTable(value) {
  const lines = normalizePdfText(value).split(/\r?\n/);
  return lines.some((_line, index) => parsePipeTableAt(lines, index));
}

function pdfWatermarkText(userEmail) {
  const email = stripMarkdownArtifacts(userEmail || "").slice(0, 120);
  return email ? `NotesBanao | ${email}` : "NotesBanao";
}

function resolveNotesFlow(input = {}) {
  const flow = String(input.notesFlow || "").trim().toLowerCase();
  if (flow === "combined" || flow === "single") {
    return flow;
  }
  if (input.continuous === true || input.continuousMode === true) {
    return "combined";
  }
  const billingMode = String(input.billingMode || input.billing_mode || "").trim().toLowerCase();
  if (billingMode === "continuous_notes") {
    return "combined";
  }
  return "single";
}

function pdfHeaderLabel(notesFlow) {
  return notesFlow === "combined" ? "Combined Notes" : "Single Notes";
}

function pdfMakeWatermark(userEmail) {
  const text = pdfWatermarkText(userEmail);
  return (_currentPage, pageSize) => ({
    text,
    color: "#0f172a",
    opacity: 0.035,
    fontSize: 18,
    bold: true,
    alignment: "center",
    width: pageSize.width,
    absolutePosition: {
      x: 0,
      y: Math.max(120, pageSize.height / 2 - 10)
    },
    angle: -35
  });
}

function pdfMakeInlineFragments(tokens = [], inherited = {}) {
  const fragments = [];

  function pushText(text, style = {}, parseInlineMath = true) {
    if (parseInlineMath) {
      fragments.push(...pdfMakeTextFragmentsWithInlineMath(text, { ...inherited, ...style }));
      return;
    }
    const normalized = normalizePdfText(text);
    if (!normalized) {
      return;
    }
    fragments.push({
      text: normalized,
      ...inherited,
      ...style
    });
  }

  tokens.forEach((token) => {
    if (token.type === "text" || token.type === "escape") {
      pushText(token.text || "");
      return;
    }
    if (token.type === "strong") {
      fragments.push(...pdfMakeInlineFragments(token.tokens || [], { ...inherited, bold: true }));
      return;
    }
    if (token.type === "em") {
      fragments.push(...pdfMakeInlineFragments(token.tokens || [], { ...inherited, italics: true }));
      return;
    }
    if (token.type === "codespan") {
      pushText(token.text || "", {
        color: "#24324a",
        background: "#eef3fb"
      }, false);
      return;
    }
    if (token.type === "link") {
      fragments.push(...pdfMakeInlineFragments(token.tokens || [], {
        ...inherited,
        color: "#2849b9",
        decoration: "underline",
        link: token.href
      }));
      return;
    }
    if (token.type === "image") {
      pushText(token.text ? `[image: ${token.text}]` : "[image]");
      return;
    }
    if (token.type === "br") {
      pushText("\n");
      return;
    }
    pushText(token.raw || token.text || "");
  });

  return fragments.length ? fragments : [{ text: "" }];
}

function emphasizeLeadingLabel(fragments) {
  if (!fragments.length || typeof fragments[0].text !== "string") {
    return fragments;
  }

  const match = fragments[0].text.match(/^([^:\n]{2,72}):\s*(.*)$/);
  if (!match) {
    return fragments;
  }

  const [, label, rest] = match;
  return [
    { ...fragments[0], text: `${label}:`, bold: true },
    ...(rest ? [{ ...fragments[0], text: ` ${rest}` }] : []),
    ...fragments.slice(1)
  ];
}

function pdfMakeCodeText(text) {
  const normalized = normalizePdfText(String(text || "")
    .replace(/\t/g, "  ")
    .replace(/\u00a0/g, " "));
  const lines = normalized.split(/\r?\n/);

  function treeLevelFromPrefix(prefix) {
    const pipeCount = (prefix.match(/\|/g) || []).length;
    if (pipeCount) {
      return pipeCount + 1;
    }
    if (prefix.length >= 4) {
      return Math.floor(prefix.length / 4) + 1;
    }
    return Math.floor(prefix.length / 2) + 1;
  }

  if (lines.some((line) => /[\u2500-\u257f]/.test(line))) {
    return lines.map((line) => {
      const leading = line.match(/^[\s\u2502]*/)?.[0] || "";
      const level = Math.floor(leading.replace(/\s/g, "").length + leading.replace(/[^\s]/g, "").length / 4);
      const cleaned = line
        .replace(/[\u2502]/g, " ")
        .replace(/[\u251c\u2514]\u2500\u2500\s*/g, "")
        .replace(/[\u2500-\u257f]/g, "")
        .trim();
      if (!cleaned) {
        return "";
      }
      return `${"  ".repeat(Math.max(0, level))}${level > 0 ? "- " : ""}${cleaned}`;
    }).join("\n");
  }

  const asciiTreeBranch = /^([ |`]*?)(?:\|--|`--|\+--)\s*(.+)$/;
  if (lines.filter((line) => asciiTreeBranch.test(line)).length >= 2) {
    return lines.map((line) => {
      const match = line.match(asciiTreeBranch);
      if (!match) {
        return line.trim();
      }
      const level = treeLevelFromPrefix(match[1] || "");
      return `${"  ".repeat(level)}- ${match[2].trim()}`;
    }).join("\n");
  }

  return normalized;
}

const CODE_BLOCK_LINE_HEIGHT = 10.5;
const CODE_BLOCK_MIN_START_LINES = 3;
const CODE_BLOCK_ROW_GROUP_LINES = 3;
const CODE_BLOCK_VERTICAL_PADDING = 11;
const CODE_BLOCK_MIN_START_HEIGHT = CODE_BLOCK_MIN_START_LINES * CODE_BLOCK_LINE_HEIGHT + CODE_BLOCK_VERTICAL_PADDING;

function codeBlockEstimatedHeight(lineCount) {
  return Math.max(21, Math.max(1, lineCount) * CODE_BLOCK_LINE_HEIGHT + CODE_BLOCK_VERTICAL_PADDING);
}

function pdfMakeCodeCell(text, isFirstRow, isLastRow) {
  return {
    text: text || " ",
    fontSize: 8.7,
    lineHeight: 1.12,
    color: "#14213d",
    preserveLeadingSpaces: true,
    preserveTrailingSpaces: true,
    margin: [8, isFirstRow ? 5 : 0, 8, isLastRow ? 5 : 0]
  };
}

function pdfMakeCodeTable(rows, startHeight, unbreakable) {
  const body = rows.map((row, index) => [
    pdfMakeCodeCell(row, index === 0, index === rows.length - 1)
  ]);
  return {
    table: {
      dontBreakRows: true,
      widths: ["*"],
      body
    },
    codeBlockStartHeight: startHeight,
    unbreakable,
    layout: {
      hLineColor: () => "#cbd6e6",
      vLineColor: () => "#cbd6e6",
      hLineWidth: (index, node) => (index === 0 || index === node.table.body.length ? 0.45 : 0),
      vLineWidth: () => 0.45,
      fillColor: () => "#f6f8fc"
    },
    margin: [0, 5, 0, 10]
  };
}

function pdfMakeCodeBlock(text) {
  const code = pdfMakeCodeText(text);
  const lines = code.split(/\r?\n/);
  const estimatedHeight = codeBlockEstimatedHeight(lines.length);
  if (lines.length <= CODE_BLOCK_MIN_START_LINES) {
    return pdfMakeCodeTable([code], estimatedHeight, true);
  }

  const rows = [];
  for (let index = 0; index < lines.length; index += CODE_BLOCK_ROW_GROUP_LINES) {
    rows.push(lines.slice(index, index + CODE_BLOCK_ROW_GROUP_LINES).join("\n"));
  }
  return pdfMakeCodeTable(rows, CODE_BLOCK_MIN_START_HEIGHT, estimatedHeight <= 180);
}

function pdfMakeParagraphFromToken(token, options = {}) {
  return {
    text: token.tokens
      ? pdfMakeInlineFragments(token.tokens)
      : [{ text: stripMarkdownArtifacts(token.text || token.raw || "") }],
    margin: options.margin || [0, 3, 0, 8],
    style: options.style || "paragraph"
  };
}

function pdfMakeListItem(item) {
  const children = item.tokens || [];
  const primaryIndex = children.findIndex((child) => child.type === "paragraph" || child.type === "text");
  const primary = primaryIndex >= 0 ? children[primaryIndex] : null;
  const extraChildren = primaryIndex >= 0
    ? children.filter((_child, index) => index !== primaryIndex)
    : children;
  const extraNodes = extraChildren.flatMap((child) =>
    child.type === "list" ? [pdfMakeList(child, true)] : pdfMakeContentFromTokens([child]));
  if (!primary) {
    return extraNodes.length ? { stack: extraNodes, margin: [0, 1, 0, 3] } : { text: stripMarkdownArtifacts(item.text || item.raw || "") };
  }

  const primaryFragments = primary?.tokens
    ? pdfMakeInlineFragments(primary.tokens)
    : [{ text: stripMarkdownArtifacts(item.text || item.raw || "") }];
  const textNode = {
    text: emphasizeLeadingLabel(primaryFragments),
    margin: [0, 1, 0, extraNodes.length ? 5 : 2]
  };

  if (!extraNodes.length) {
    return textNode;
  }

  return {
    stack: [textNode, ...extraNodes],
    margin: [0, 1, 0, 3]
  };
}

function pdfMakeList(token, nested = false) {
  const key = token.ordered ? "ol" : "ul";
  return {
    [key]: (token.items || []).map((item) => pdfMakeListItem(item)),
    margin: nested ? [12, 1, 0, 4] : [14, 2, 0, 10]
  };
}

// Table cells frequently pack multiple points as "* a<br>* b<br>* c". Convert <br> to real
// line breaks and leading list markers to bullets so cells render as multi-line lists
// instead of literal "<br>" / "*" text.
// A4 width (595.28pt) minus the 52pt side margins set in the doc definition.
const TABLE_CONTENT_WIDTH = 491;

// pdfmake cannot split a run of non-space characters. A cell holding something
// like {"name":"Riya","age":20} therefore forces its column wider than the page
// and the whole table is clipped at the right edge. Insert zero-width spaces
// (U+200B — a break opportunity the bundled line breaker honours) after natural
// punctuation inside long runs, then at a fixed stride for solid strings. The
// character has no width, so the visible text is unchanged.
function breakLongTokens(text) {
  return String(text || "").replace(/\S{16,}/g, (token) => {
    const atPunctuation = token.replace(/([/\\,;:&=?_.>}\])|-])(?=\S)/g, "$1​");
    return atPunctuation.replace(/([^​]{12})(?=[^​])/g, "$1​");
  });
}

function tableCellText(cell) {
  const raw = inlineTokenText(cell.tokens || [{ text: cell.text || "" }]);
  const text = decodeBasicHtmlEntities(String(raw || "").replace(/<\s*br\s*\/?\s*>/gi, "\n"));
  const lines = text.split(/\r?\n/).map((line) => line.replace(/^\s*[-*+]\s+/, "• ").replace(/\s+$/, ""));
  return breakLongTokens(normalizePdfText(lines.join("\n")).trim());
}

// Equal "*" columns give a one-word "Method" heading the same room as a long
// code example, which wastes width and makes the wide column very tall. Weight
// each column by its longest line instead, capped so a single huge cell cannot
// starve the others, and rescale so the row always fits the printable width.
function tableColumnWidths(body, columnCount) {
  const weights = Array.from({ length: columnCount }, (_value, index) => {
    let longest = 1;
    for (const row of body) {
      for (const line of String(row[index]?.text || "").split("\n")) {
        longest = Math.max(longest, line.replace(/​/g, "").length);
      }
    }
    return Math.max(4, Math.min(longest, 48));
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || columnCount;
  const available = TABLE_CONTENT_WIDTH - 1;
  const minWidth = Math.min(46, available / columnCount);
  const clamped = weights.map((weight) => Math.max(minWidth, (weight / totalWeight) * available));
  const clampedTotal = clamped.reduce((sum, width) => sum + width, 0);
  const factor = available / clampedTotal;
  return clamped.map((width) => Math.floor(width * factor * 100) / 100);
}

function pdfMakeTable(token) {
  const headers = (token.header || []).map((cell) => ({
    text: tableCellText(cell),
    bold: true,
    color: "#1f2a44",
    fillColor: "#eef3fb",
    margin: [5, 5, 5, 5]
  }));
  const rows = (token.rows || []).map((row) =>
    row.map((cell) => ({
      text: tableCellText(cell),
      margin: [5, 5, 5, 5]
    }))
  );
  const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const normalizeRow = (row) => Array.from({ length: columnCount }, (_value, index) => row[index] || { text: "" });
  const body = [];

  if (headers.length) {
    body.push(normalizeRow(headers));
  }
  rows.forEach((row) => body.push(normalizeRow(row)));

  return {
    table: {
      headerRows: headers.length ? 1 : 0,
      keepWithHeaderRows: headers.length ? 1 : 0,
      dontBreakRows: true,
      widths: tableColumnWidths(body, columnCount),
      body: body.length ? body : [[{ text: "" }]]
    },
    layout: {
      hLineColor: () => "#cbd6e6",
      vLineColor: () => "#cbd6e6",
      hLineWidth: () => 0.6,
      vLineWidth: () => 0.6,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0
    },
    fontSize: columnCount > 5 ? 8 : 9.2,
    margin: [0, 8, 0, 14]
  };
}

function mermaidSvgSize(svg) {
  const viewBox = String(svg || "").match(/\bviewBox=["']\s*([-0-9.]+)\s+([-0-9.]+)\s+([-0-9.]+)\s+([-0-9.]+)\s*["']/i);
  if (viewBox) {
    const width = Number(viewBox[3]);
    const height = Number(viewBox[4]);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }

  const widthMatch = String(svg || "").match(/\bwidth=["']\s*([-0-9.]+)(?:px)?\s*["']/i);
  const heightMatch = String(svg || "").match(/\bheight=["']\s*([-0-9.]+)(?:px)?\s*["']/i);
  const width = Number(widthMatch?.[1]);
  const height = Number(heightMatch?.[1]);
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }

  return { width: 980, height: 520 };
}

function mermaidDiagramFit(size) {
  const width = Number(size?.width);
  const height = Number(size?.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return [491, 260];
  }

  return [491, Math.min(330, Math.max(130, Math.round((491 * height) / width)))];
}

function pdfMakeMermaidDiagram(source) {
  if (source && typeof source === "object" && source.image) {
    const fit = mermaidDiagramFit(source);
    return {
      stack: [
        { text: "Diagram", style: "caption", margin: [0, 0, 0, 6] },
        {
          image: source.image,
          fit,
          alignment: "center",
          margin: [0, 2, 0, 12]
        }
      ],
      unbreakable: fit[1] <= 300,
      margin: [0, 8, 0, 12]
    };
  }

  if (source && typeof source === "object" && source.error) {
    return {
      stack: [
        { text: "Diagram", style: "caption", margin: [0, 0, 0, 6] },
        pdfMakeCodeBlock(`Mermaid render failed: ${source.error}\n\n${source.text || ""}`)
      ],
      margin: [0, 8, 0, 12]
    };
  }

  if (source && typeof source === "object" && source.svg) {
    const fit = mermaidDiagramFit(mermaidSvgSize(source.svg));
    return {
      stack: [
        { text: "Diagram", style: "caption", margin: [0, 0, 0, 6] },
        {
          svg: source.svg,
          fit,
          alignment: "center",
          margin: [0, 2, 0, 12]
        }
      ],
      unbreakable: fit[1] <= 300,
      margin: [0, 8, 0, 12]
    };
  }

  return {
    stack: [
      { text: "Diagram", style: "caption", margin: [0, 0, 0, 6] },
      pdfMakeCodeBlock(source)
    ],
    margin: [0, 8, 0, 12]
  };
}

let mermaidRenderCounter = 0;

function sanitizeMermaidLabel(label) {
  return String(label || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/"/g, "'");
}

function sanitizeMermaidSource(source) {
  let text = String(source || "").trim();
  if (!text) {
    return text;
  }

  // Auto-quote subgraph titles: `subgraph Control Plane (Master Node)` is a parse
  // error (unquoted parens), so unsafe titles become `subgraph NB_SG_n["title"]`.
  // Left alone: already-quoted titles, id["..."]/id[...] forms (the node pass below
  // quotes their inner label), and plain word/space titles, which are valid as-is.
  let subgraphCounter = 0;
  text = text.replace(/^(\s*subgraph\s+)(.+?)\s*$/gm, (match, prefix, title) => {
    if (/^"/.test(title) || /^[A-Za-z0-9_-]+\s*\[/.test(title) || /^[A-Za-z0-9_ -]+$/.test(title)) {
      return match;
    }
    const cleaned = sanitizeMermaidLabel(title);
    if (!cleaned) {
      return match;
    }
    return `${prefix}NB_SG_${subgraphCounter++}["${cleaned}"]`;
  });

  // Auto-quote node labels so special characters (parentheses, math, brackets) don't break
  // mermaid. Match a fully-quoted node as a whole and leave it intact — this consumes nodes
  // like Y["E[(y-ŷ)²]"] so the inner E[...] is NOT re-scanned and double-quoted. Only
  // genuinely unquoted labels (no nested brackets/quotes) get wrapped.
  text = text.replace(/(\b[A-Za-z0-9_-]+)\[(?:"((?:[^"\\]|\\.)*)"|([^"[\]]*))\]/g, (match, nodeId, quoted, unquoted) => {
    if (quoted !== undefined) {
      return match;
    }
    const cleaned = sanitizeMermaidLabel(unquoted);
    if (!cleaned) {
      return match;
    }
    return `${nodeId}["${cleaned}"]`;
  });

  return text;
}

function sanitizeMermaidSvg(svg) {
  const cleaned = String(svg || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\sfont-family="[^"]*"/gi, "")
    .replace(/font-family:[^;"]+;?/gi, "");
  const viewBox = cleaned.match(/\bviewBox=["']\s*([-0-9.]+)\s+([-0-9.]+)\s+([-0-9.]+)\s+([-0-9.]+)\s*["']/i);
  if (!viewBox) {
    return cleaned;
  }

  const width = Math.max(1, Math.round(Number(viewBox[3]) || 0));
  const height = Math.max(1, Math.round(Number(viewBox[4]) || 0));
  return cleaned
    .replace(/\swidth=["'][^"']*["']/i, ` width="${width}"`)
    .replace(/\sheight=["'][^"']*["']/i, ` height="${height}"`)
    .replace(/\sstyle=["'][^"']*max-width:[^"']*["']/i, "");
}

async function renderMermaidSvg(source) {
  if (!globalThis.mermaid?.render) {
    throw new Error("mermaid renderer is not loaded.");
  }

  if (!globalThis.__notesBanaoMermaidInitialized) {
    globalThis.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      theme: "base",
      themeVariables: {
        background: "#ffffff",
        primaryColor: "#f8fafc",
        primaryBorderColor: "#64748b",
        primaryTextColor: "#0f172a",
        lineColor: "#64748b",
        secondaryColor: "#eef3fb",
        tertiaryColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px"
      },
      flowchart: {
        curve: "basis",
        diagramPadding: 18,
        useMaxWidth: false
      }
    });
    globalThis.__notesBanaoMermaidInitialized = true;
  }

  const id = `notes-banao-mermaid-${Date.now()}-${mermaidRenderCounter++}`;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "980px";
  container.style.background = "#ffffff";
  document.body.appendChild(container);
  try {
    const diagramSource = sanitizeMermaidSource(source);
    const { svg } = await globalThis.mermaid.render(id, diagramSource, container);
    return svg;
  } finally {
    container.remove();
  }
}

function normalizeMermaidSvgForImage(svg) {
  const size = mermaidSvgSize(svg);
  return {
    svg: String(svg || "")
      .replace(/\swidth=["'][^"']*["']/i, ` width="${Math.round(size.width)}"`)
      .replace(/\sheight=["'][^"']*["']/i, ` height="${Math.round(size.height)}"`),
    size
  };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render Mermaid diagram image."));
    image.src = url;
  });
}

async function renderMermaidImage(source) {
  const rawSvg = await renderMermaidSvg(source);
  const { svg, size } = normalizeMermaidSvgForImage(rawSvg);
  const scale = Math.min(2.4, Math.max(1.5, 1100 / size.width));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(size.width * scale));
  canvas.height = Math.max(1, Math.round(size.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available for Mermaid diagrams.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const image = await loadImage(dataUrlFromAscii(svg, "image/svg+xml;charset=utf-8"));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    image: canvas.toDataURL("image/png"),
    svg: sanitizeMermaidSvg(rawSvg),
    width: size.width,
    height: size.height
  };
}

async function hydrateMermaidTokens(tokens = []) {
  for (const token of tokens) {
    if (token.type === "code" && String(token.lang || "").toLowerCase() === "mermaid") {
      try {
        const rendered = await renderMermaidImage(token.text || "");
        token.mermaidImage = rendered.image;
        token.mermaidSvg = rendered.svg;
        token.mermaidWidth = rendered.width;
        token.mermaidHeight = rendered.height;
      } catch (error) {
        token.mermaidSvgError = error.message || String(error);
      }
      continue;
    }

    if (token.items) {
      for (const item of token.items) {
        await hydrateMermaidTokens(item.tokens || []);
      }
    }
    if (token.tokens) {
      await hydrateMermaidTokens(token.tokens || []);
    }
  }
}

function pdfMakeMermaidSource(token) {
  if (token.mermaidImage) {
    return {
      image: token.mermaidImage,
      width: token.mermaidWidth,
      height: token.mermaidHeight
    };
  }
  if (token.mermaidSvg) {
    return { svg: token.mermaidSvg };
  }
  if (token.mermaidSvgError) {
    return {
      error: token.mermaidSvgError,
      text: token.text || ""
    };
  }
  return token.text || "";
}

function pdfMakeContentFromTokens(tokens = []) {
  const content = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    if (token.type === "space") {
      continue;
    }

    if ((token.type === "paragraph" || token.type === "text") && nextToken?.type === "code") {
      const codeLineCount = String(nextToken.text || "").split(/\r?\n/).length;
      const paragraphText = markdownTokenText(token);
      const shouldKeepTogether = codeLineCount <= 12 && paragraphText.length <= 90;
      if (shouldKeepTogether) {
        content.push({
          stack: [
            pdfMakeParagraphFromToken(token, { margin: [0, 3, 0, 4] }),
            String(nextToken.lang || "").toLowerCase() === "mermaid"
              ? pdfMakeMermaidDiagram(pdfMakeMermaidSource(nextToken))
              : pdfMakeCodeBlock(nextToken.text || "")
          ],
          unbreakable: true,
          margin: [0, 0, 0, 2]
        });
        index += 1;
        continue;
      }
    }

    if (token.type === "heading") {
      content.push({
        text: token.tokens ? pdfMakeInlineFragments(token.tokens) : markdownTokenText(token),
        style: token.depth === 1 ? "h1" : token.depth === 2 ? "h2" : "h3",
        headlineLevel: Math.min(token.depth || 2, 3)
      });
      continue;
    }

    if (token.type === "paragraph" || token.type === "text") {
      const rawText = token.raw || token.text || "";
      if (hasRawPipeTable(rawText) || !token.tokens) {
        content.push(...pdfMakeBlocksFromRawText(rawText));
        continue;
      }
      content.push(pdfMakeParagraphFromToken(token));
      continue;
    }

    if (token.type === "blockquote") {
      const blocks = pdfMakeBlocksFromRawText(token.raw || token.text || markdownTokenText(token), {
        margin: [10, 6, 0, 10],
        style: "blockquote"
      });
      content.push(...(blocks.length ? blocks : [{
        text: markdownTokenText(token),
        style: "blockquote",
        margin: [10, 6, 0, 10]
      }]));
      continue;
    }

    if (token.type === "hr") {
      content.push({
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 491, y2: 0, lineWidth: 0.7, lineColor: "#aeb8c8" }],
        margin: [0, 8, 0, 14]
      });
      continue;
    }

    if (token.type === "code") {
      content.push(String(token.lang || "").toLowerCase() === "mermaid"
        ? pdfMakeMermaidDiagram(pdfMakeMermaidSource(token))
        : pdfMakeCodeBlock(token.text || ""));
      continue;
    }

    if (token.type === "table") {
      content.push(pdfMakeTable(token));
      continue;
    }

    if (token.type === "list") {
      content.push(pdfMakeList(token));
      continue;
    }

    if (token.type === "html") {
      content.push(...pdfMakeBlocksFromRawText(htmlToPdfText(token.raw || token.text || "")));
      continue;
    }

    content.push(...pdfMakeBlocksFromRawText(token.raw || token.text || markdownTokenText(token)));
  }

  return content.filter(Boolean);
}

// DejaVu Sans has no Devanagari glyphs, and pdfmake/pdfkit does not auto-fallback across
// fonts within a text run. So we post-process the built content tree and re-tag any
// Devanagari spans with the NotoDevanagari family, leaving Latin/math spans on DejaVuSans.
// This makes mixed English+Hindi (Hinglish) notes render correctly in a single line.
const DEVANAGARI_PATTERN = /[ऀ-ॿ᳐-᳿꣠-ꣿ]/;
const DEVANAGARI_SPLIT = /([ऀ-ॿ᳐-᳿꣠-ꣿ][ऀ-ॿ᳐-᳿꣠-ꣿ‌‍\s]*)/;

function devanagariRuns(text) {
  return String(text)
    .split(DEVANAGARI_SPLIT)
    .filter((part) => part !== "")
    .map((part) => (DEVANAGARI_PATTERN.test(part) ? { text: part, font: "NotoDevanagari" } : part));
}

function applyDevanagariFonts(node) {
  if (typeof node === "string") {
    return DEVANAGARI_PATTERN.test(node) ? { text: devanagariRuns(node) } : node;
  }
  if (Array.isArray(node)) {
    return node.map(applyDevanagariFonts);
  }
  if (node && typeof node === "object") {
    const next = { ...node };
    if (typeof next.text === "string" && DEVANAGARI_PATTERN.test(next.text)) {
      next.text = devanagariRuns(next.text);
    } else if (Array.isArray(next.text)) {
      next.text = next.text.map(applyDevanagariFonts);
    }
    for (const key of ["stack", "columns", "ul", "ol"]) {
      if (Array.isArray(next[key])) {
        next[key] = next[key].map(applyDevanagariFonts);
      }
    }
    if (next.table && Array.isArray(next.table.body)) {
      next.table = {
        ...next.table,
        body: next.table.body.map((row) => (Array.isArray(row) ? row.map(applyDevanagariFonts) : row))
      };
    }
    return next;
  }
  return node;
}

// Drop trailing blank nodes and zero the final node's bottom margin so an empty/overflowing
// tail element doesn't spill into a blank extra page (header/footer/watermark only).
function isBlankPdfNode(node) {
  if (node == null || node === "") {
    return true;
  }
  if (typeof node === "string") {
    return node.trim() === "";
  }
  if (typeof node !== "object") {
    return false;
  }
  if (node.stack || node.table || node.image || node.svg || node.canvas || node.ul || node.ol || node.columns) {
    return false;
  }
  if (Array.isArray(node.text)) {
    return node.text.every(isBlankPdfNode);
  }
  if (typeof node.text === "string") {
    return node.text.trim() === "";
  }
  return true;
}

function trimTrailingPdfContent(content) {
  const result = Array.isArray(content) ? content.slice() : [];
  while (result.length && isBlankPdfNode(result[result.length - 1])) {
    result.pop();
  }
  const last = result[result.length - 1];
  if (last && typeof last === "object" && Array.isArray(last.margin)) {
    result[result.length - 1] = { ...last, margin: [last.margin[0] || 0, last.margin[1] || 0, last.margin[2] || 0, 0] };
  }
  return result;
}

async function renderPdfMakeNotesPdf({ markdown, title, userEmail, notesFlow, continuous, continuousMode, billingMode, billing_mode }) {
  if (!globalThis.pdfMake?.createPdf || !globalThis.marked?.lexer) {
    throw new Error("pdfmake or marked.js is not available.");
  }

  const resolvedFlow = resolveNotesFlow({ notesFlow, continuous, continuousMode, billingMode, billing_mode });
  const headerTitle = pdfHeaderLabel(resolvedFlow);
  const tokens = globalThis.marked.lexer(prepareMarkdownForPdf(markdown), {
    gfm: true,
    breaks: false
  });
  await hydrateMermaidTokens(tokens);
  const docDefinition = {
    pageSize: "A4",
    pageMargins: [52, 60, 52, 54],
    info: {
      title: headerTitle,
      creator: "NotesBanao"
    },
    background: pdfMakeWatermark(userEmail),
    header: () => ({
      stack: [
        { text: `${headerTitle} - NotesBanao`, color: "#52627a", fontSize: 8.5, margin: [52, 26, 52, 8] },
        { canvas: [{ type: "line", x1: 52, y1: 0, x2: 543, y2: 0, lineWidth: 0.5, lineColor: "#d8e0ee" }] }
      ]
    }),
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: "Generated by NotesBanao | notesbanao.in", alignment: "left" },
        { text: `${currentPage} / ${pageCount}`, alignment: "right" }
      ],
      color: "#8a96a8",
      fontSize: 8.5,
      margin: [52, 12, 52, 0]
    }),
    defaultStyle: {
      font: "DejaVuSans",
      fontSize: 10.8,
      lineHeight: 1.28,
      color: "#0f172a"
    },
    styles: {
      h1: { fontSize: 20, bold: true, lineHeight: 1.08, margin: [0, 8, 0, 10], color: "#071126" },
      h2: { fontSize: 15.5, bold: true, margin: [0, 12, 0, 7], color: "#071126" },
      h3: { fontSize: 12.8, bold: true, margin: [0, 10, 0, 6], color: "#071126" },
      paragraph: { margin: [0, 3, 0, 8] },
      blockquote: { color: "#334155", italics: true },
      caption: { fontSize: 9.5, bold: true, color: "#52627a" }
    },
    pageBreakBefore: (currentNode, followingNodesOnPage) => {
      if (currentNode.codeBlockStartHeight && currentNode.startPosition) {
        const remaining = currentNode.startPosition.pageInnerHeight - currentNode.startPosition.top;
        if (Number.isFinite(remaining) && remaining < currentNode.codeBlockStartHeight + 8) {
          return true;
        }
      }
      return currentNode.headlineLevel > 1 && followingNodesOnPage.length === 0;
    },
    content: applyDevanagariFonts(trimTrailingPdfContent(pdfMakeContentFromTokens(tokens)))
  };

  return new Promise((resolve, reject) => {
    try {
      globalThis.pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
        resolve({
          ok: true,
          engine: "pdfmake",
          dataUrl,
          size: Math.round((dataUrl.length * 3) / 4)
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function renderTextNotesPdf(input = {}) {
  if (!globalThis.pdfMake?.createPdf) {
    throw new Error("pdfmake is not loaded in the offscreen document. Reload the extension and try again.");
  }
  return renderPdfMakeNotesPdf(input);
}

async function renderNotesPdf(input = {}) {
  return renderTextNotesPdf(input);
}
