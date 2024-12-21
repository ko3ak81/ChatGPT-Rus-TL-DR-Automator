document.getElementById("run").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "runAutomation" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
      } else if (response && response.success) {
        console.log("Automation started:", response.message);
      } else {
        console.error("Failed to start automation:", response.message);
      }
    });
  });