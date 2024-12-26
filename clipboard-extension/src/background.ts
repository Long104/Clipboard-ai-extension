export {}; // Avoid polluting the global namespace

interface TranslationResponse {
	message: { response: string };
}

let isOn = true; // Track the toggle state

let isLimit = 0;

chrome.storage.local.get("isOn", (result) => {
	isOn = result.isOn ?? true; // Default to false if undefined
	console.log("Initial toggle state:", isOn);
});

chrome.storage.local.get("isLimit", (result) => {
	isLimit = result.isLimit;
});

function resetIsLimit() {
	isLimit = 0; // Reset the local variable
	chrome.storage.local.set({ isLimit: isLimit }, () => {
		console.log("isLimit reset to 0");
	});
}

// Start the interval to reset `isLimit` every 2 hours (7200000 ms)
setInterval(resetIsLimit, 2 * 60 * 60 * 1000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// Update the toggle state
	if (message.type === "TOGGLE_SWITCH") {
		isOn = message.isOn;
		return; // No need to process further
	}

	async function fetchTranslate(message: string): Promise<TranslationResponse> {
		const res = await fetch(
			`${process.env.PLASMO_PUBLIC_BASE_URL}/summarizeDocument`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					documentData: message,
				}),
			},
		);

		if (res.ok) {
			const data = await res.json();
			return data.message.response;
			// return translated_text;
		}

		return undefined;
	}

	if (
		(message.type === "SELECTED_TEXT" || message.type === "CHAT") &&
		// message.isLimit <= 10
		true
	) {
		if (!isOn) {
			// Toggle is off
			// sendResponse({
			// 	modifiedText:
			// 		"The toggle is off. Please turn it on to use this feature.",
			// });
			return;
		}
		fetchTranslate(message.text || message.chatMessage)
			.then((translatedText) => {
				sendResponse({
					modifiedText: translatedText,
				});
				chrome.storage.local.get("chatRoom", (data) => {
					const chatHistory = [
						...(data.chatRoom || []),
						{ message: message.text || message.chatMessage, sender: "user" },
						{ message: translatedText, sender: "bot" },
					];
					chrome.storage.local.set({ chatRoom: chatHistory });
				});
				// chrome.runtime.sendMessage({
				// 	type: "AI",
				// 	text: translatedText,
				// });
			})
			.catch((err) => {
				console.error("Translation API error:", err);
				sendResponse({ modifiedText: undefined });
			});

		return true; // Keep the message channel open for async response
	} else {
		sendResponse({
			modifiedText: "Your limit is reached Please look for the paid plan",
		});
	}
});
