const startButton = document.getElementById("start");
const status = document.getElementById("status");

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.style.color = isError ? "#dc2626" : "#16a34a";
};

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  setStatus("Click an element on the page...");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error("No active tab found.");
    }

    await chrome.tabs.sendMessage(tab.id, { action: "start-selection" });
  } catch (error) {
    setStatus("Unable to start selection.", true);
    console.error(error);
  } finally {
    startButton.disabled = false;
  }
});
