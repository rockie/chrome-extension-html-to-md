let selectionActive = false;
let hoverOutline = null;
let outputPanel = null;

const ensureStyleTag = () => {
  if (document.getElementById("md-selection-style")) return;
  const style = document.createElement("style");
  style.id = "md-selection-style";
  style.textContent = `
    .md-selection-highlight {
      outline: 2px solid #2f6fec !important;
      cursor: crosshair !important;
    }

    .md-output-panel {
      position: fixed;
      right: 16px;
      bottom: 16px;
      width: min(420px, 90vw);
      background: white;
      color: #0f172a;
      border-radius: 12px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
      z-index: 2147483647;
      padding: 12px;
      font-family: "Segoe UI", system-ui, sans-serif;
    }

    .md-output-panel textarea {
      width: 100%;
      height: 140px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid #cbd5f5;
      box-sizing: border-box;
    }

    .md-output-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .md-output-actions button {
      background: #2f6fec;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }

    .md-output-actions button.secondary {
      background: #e2e8f0;
      color: #0f172a;
    }
  `;
  document.head.appendChild(style);
};

const clearHighlight = () => {
  if (hoverOutline) {
    hoverOutline.classList.remove("md-selection-highlight");
    hoverOutline = null;
  }
};

const escapePipes = (text) => text.replace(/\|/g, "\\|");

const tableToMarkdown = (table) => {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (!rows.length) return "";

  const rowCells = rows.map((row) =>
    Array.from(row.children).map((cell) => cell.textContent.trim())
  );

  const header = rowCells[0];
  const divider = header.map(() => "---");
  const body = rowCells.slice(1);

  const formatRow = (cells) =>
    `| ${cells.map((cell) => escapePipes(cell)).join(" | ")} |`;

  return [formatRow(header), formatRow(divider), ...body.map(formatRow)].join(
    "\n"
  );
};

const listToMarkdown = (list) => {
  const isOrdered = list.tagName.toLowerCase() === "ol";
  return Array.from(list.children)
    .map((item, index) => {
      const prefix = isOrdered ? `${index + 1}.` : "-";
      return `${prefix} ${item.textContent.trim()}`;
    })
    .join("\n");
};

const elementToMarkdown = (element) => {
  if (element.tagName.toLowerCase() === "table") {
    return tableToMarkdown(element);
  }

  if (["ul", "ol"].includes(element.tagName.toLowerCase())) {
    return listToMarkdown(element);
  }

  const text = element.textContent.trim();
  return text ? text.replace(/\n{3,}/g, "\n\n") : "";
};

const showOutputPanel = (markdown) => {
  ensureStyleTag();

  if (outputPanel) {
    outputPanel.remove();
  }

  outputPanel = document.createElement("div");
  outputPanel.className = "md-output-panel";

  const label = document.createElement("div");
  label.textContent = "Markdown output";
  label.style.fontSize = "12px";
  label.style.fontWeight = "600";
  label.style.marginBottom = "6px";

  const textarea = document.createElement("textarea");
  textarea.value = markdown || "No content found for that element.";

  const actions = document.createElement("div");
  actions.className = "md-output-actions";

  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1500);
    } catch (error) {
      copyButton.textContent = "Copy failed";
      console.error(error);
    }
  });

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className = "secondary";
  closeButton.addEventListener("click", () => {
    outputPanel?.remove();
    outputPanel = null;
  });

  actions.append(copyButton, closeButton);
  outputPanel.append(label, textarea, actions);
  document.body.appendChild(outputPanel);
};

const onMouseMove = (event) => {
  if (!selectionActive) return;

  const target = event.target;
  if (target === outputPanel || outputPanel?.contains(target)) return;

  if (hoverOutline && hoverOutline !== target) {
    hoverOutline.classList.remove("md-selection-highlight");
  }

  hoverOutline = target;
  hoverOutline.classList.add("md-selection-highlight");
};

const onClick = (event) => {
  if (!selectionActive) return;
  event.preventDefault();
  event.stopPropagation();

  const target = event.target;
  if (!target || target === outputPanel || outputPanel?.contains(target)) {
    return;
  }

  const markdown = elementToMarkdown(target);
  showOutputPanel(markdown);
  stopSelection();
};

const stopSelection = () => {
  selectionActive = false;
  clearHighlight();
  document.removeEventListener("mousemove", onMouseMove, true);
  document.removeEventListener("click", onClick, true);
};

const startSelection = () => {
  ensureStyleTag();
  selectionActive = true;
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onClick, true);
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "start-selection") {
    startSelection();
  }
});
