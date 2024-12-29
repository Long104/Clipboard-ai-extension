export {}; // Avoid polluting the global namespace

// document.addEventListener("keydown", (event) => {
//    let  keyBuffer += event.key.toLowerCase(); // Capture the pressed key in lowercase
//
//      if (keyBuffer.endsWith("ai")) {
//      }
// keyBuffer = "";
// if (keyBuffer.length > 10) {
//        keyBuffer = keyBuffer.slice(-2);
//      }
// }

// document.addEventListener("mouseup", async () => {
document.addEventListener("copy", async (event) => {
	// const selectedText = window.getSelection()?.toString().trim();
	const selectedText = document.getSelection().toString();
	const limitData = await new Promise<{ limit?: number }>((resolve) => {
		//event.clipboardData.setData("text/plain", modifiedText);
		//event.preventDefault(); // Prevent the default copy action
		chrome.storage.local.get(["limit"], resolve);
	});
	if (limitData.limit === undefined) {
		await new Promise<void>((resolve) => {
			chrome.storage.local.set({ limit: 0 }, resolve);
		});
	}
	let limit = limitData.limit || 0;

	if (selectedText) {
		// Send the selected text to the background script
		chrome.runtime.sendMessage(
			{ type: "SELECTED_TEXT", text: selectedText, isLimit: limit },
			(response) => {
				if (response?.modifiedText) {
					// Use Clipboard API in the content script
					navigator.clipboard
						.writeText(response.modifiedText)
						.then(async () => {
							console.log("Copied to clipboard:", response.modifiedText);
							limit = limit + 1;
							await chrome.storage.local.set({ limit });
							// for this part, you can use chrome.storage.local.get to get the chatRoom data
							const chatHistory = await new Promise<any[]>((resolve) => {
								chrome.storage.local.get("chatRoom", (data) =>
									resolve(data.chatRoom || []),
								);
							});
							chatHistory.push(
								{ message: selectedText, sender: "user" },
								{ message: response.modifiedText, sender: "bot" },
							);
							chrome.storage.local.set({ chatRoom: chatHistory });
						})
						.catch((err) => {
							console.error("Failed to copy text:", err);
						});
				} else {
					console.error("No modified text received");
				}
			},
		);
	}
});
