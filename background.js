chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: extractTextFromPage,
        },
        (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error injecting script:", chrome.runtime.lastError.message);
                return;
            }

            if (results && results[0] && results[0].result) {
                const text = results[0].result;

                chrome.tabs.create({ url: "https://chat.openai.com" }, (newTab) => {
                    setTimeout(() => {
                        chrome.scripting.executeScript({
                            target: { tabId: newTab.id },
                            func: sendToChatGPT,
                            args: [text],
                        });
                    }, 1000); // 1-second delay before sending text
                });
            } else {
                console.error("No text extracted from page");
            }
        }
    );
});

function extractTextFromPage() {
    return document.body.innerText || "";
}

function sendToChatGPT(text) {
    const prompt = `
tl;dr
По пунктам
По русский

${text}
    `;

    const waitForInputField = setInterval(() => {
        const placeholder = document.querySelector("p[data-placeholder='Message ChatGPT']");
        if (placeholder) {
            clearInterval(waitForInputField); // Stop checking once the input field is found

            placeholder.textContent = prompt;

            // Trigger the "input" event to notify ChatGPT of the change
            const inputEvent = new Event("input", { bubbles: true });
            placeholder.dispatchEvent(inputEvent);

            // Add a 1-second delay before clicking the send button
            setTimeout(() => {
                const sendButton = document.querySelector("button[data-testid='send-button']");
                if (sendButton) {
                    sendButton.click();
                    console.log("Send button clicked successfully");
                } else {
                    console.error("Send button not found. Retrying...");
                    retryClickSendButton(); // Retry if the button is not found
                }
            }, 1000); // 1-second delay
        }
    }, 100); // Check every 100ms for the input field
}

function retryClickSendButton() {
    const retryInterval = setInterval(() => {
        const sendButton = document.querySelector("button[data-testid='send-button']");
        if (sendButton) {
            clearInterval(retryInterval); // Stop retrying once the button is found
            sendButton.click();
            console.log("Send button clicked successfully after retry");
        }
    }, 500); // Retry every 500ms
}