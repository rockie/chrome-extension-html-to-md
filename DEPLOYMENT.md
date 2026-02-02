# Deployment Guide

This guide explains how to load and use the extension in Chrome for local testing.

## Prerequisites

- Google Chrome (or Chromium-based browser).

## Load the extension

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked**.
4. Select the project folder:
   `/workspace/chrome-extension-html-to-md`.
5. Confirm the extension appears in the list.

## Use the extension

1. Open any web page that contains content you want to convert (for example, a table).
2. Click the **HTML Element to Markdown** extension icon.
3. Click **Select element** in the popup.
4. Hover to highlight the element you want to convert, then click it.
5. Copy the Markdown from the output panel.

## Update the extension

After code changes:

1. Return to `chrome://extensions`.
2. Click **Reload** on the extension card.

## Troubleshooting

- If the popup button does nothing, refresh the page and try again.
- If clipboard copy fails, click inside the Markdown box and copy manually.
