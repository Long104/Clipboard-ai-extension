import React, { useEffect, useState } from "react";
import "@/style.css";
import "@mantine/core/styles.css";
import { Suspense } from "react";
import { MantineProvider } from "@mantine/core";
import { Button } from "@mantine/core";
const IndexSidepanel = () => {
	const [chatRoom, setChatRoom] = useState([]);
	const [chat, setChat] = useState<string>("");
	const [isLimit, setIsLimit] = useState<number>(0);

	async function sendChat() {
		const userMessage = { message: chat, sender: "user" };
		setChatRoom((prev) => [...prev, userMessage]);
		chrome.runtime.sendMessage(
			{ type: "CHAT", chatMessage: chat, isLimit: isLimit },
			(response) => {
				if (response?.modifiedText) {
					const botMessage = { message: response.modifiedText, sender: "bot" };
					setChatRoom((prev) => [...prev, botMessage]);

					// Save the bot response to the clipboard
					navigator.clipboard.writeText(response.modifiedText).catch((err) => {
						console.error("Failed to copy text:", err);
					});
					// Update chat history in storage
					chrome.storage.local.get("chatRoom", (data) => {
						const updatedChatRoom = [
							...(data.chatRoom || []),
							userMessage,
							botMessage,
						];
						chrome.storage.local.set({ chatRoom: updatedChatRoom });
					});
				}
			},
		);
		setIsLimit(isLimit + 1);
		await chrome.storage.local.set({ limit: isLimit });
	}

	useEffect(() => {
		(async () => {
			const limitData = await new Promise<{ limit?: number }>((resolve) => {
				chrome.storage.local.get(["limit"], resolve);
			});
			if (limitData.limit === undefined) {
				await new Promise<void>((resolve) => {
					chrome.storage.local.set({ limit: 0 }, resolve);
				});
			}
			setIsLimit(limitData.limit || 0);
			const chatHistory = await new Promise<any[]>((resolve) => {
				chrome.storage.local.get("chatRoom", (data) =>
					resolve(data.chatRoom || []),
				);
			});
			setChatRoom(chatHistory);
		})();
	}, []);

	async function ReloadHistory() {
		const chatHistory = await new Promise<any[]>((resolve) => {
			chrome.storage.local.get("chatRoom", (data) =>
				resolve(data.chatRoom || []),
			);
		});
		setChatRoom(chatHistory);
	}

	// chrome.runtime.onMessage.addListener((message) => {
	// 	if (message.type === "SELECTED_TEXT") {
	// 		setChatRoom((prev) => [
	// 			...prev,
	// 			{ message: message.text, sender: "user" },
	// 		]);
	// 	}
	// 	if (message.type === "AI") {
	// 		setChatRoom((prev) => [
	// 			...prev,
	// 			{ message: message.text, sender: "bot" },
	// 		]);
	// 	}
	// });

	return (
		<MantineProvider>
			<>
				<div className="min-h-screen min-w-screen flex flex-col justify-between flex-1 relative bg-gray-400 overscroll-y-none ">
					<div className="flex flex-col">
						{chatRoom.map((msg, index) => (
							<div
								key={index}
								// className={`flex ${msg.sender ? "flex-start pl-2" : "flex-end pr-2"}`}
								className={`flex mt-2 ${msg.sender === "bot" ? "justify-start pl-2" : "justify-end pr-2"}`}
							>
								<div className="max-w-[75%] break-words text-wrap border-2 p-2 gap-y-60 border-gray-800 bg-white rounded-2xl">
									<Suspense fallback={<p>waiting for chat...</p>}>
										{msg.message}
									</Suspense>
								</div>
							</div>
						))}
					</div>
					<div className="w-full flex items-center flex-col justify-center p-5">
						<div className="flex justify-start w-full gap-x-2">
							<div
								className="max-w-16 pb-2"
								onClick={() => {
									return ReloadHistory();
								}}
							>
								<Button
									size="xs"
									radius="md"
									variant="filled"
									color="rgba(36, 32, 32, 1)"
								>
									Reload
								</Button>
							</div>
							<div
								className="max-w-16 pb-2"
								onClick={() => {
									setChatRoom([]);
									chrome.storage.local.set({ chatRoom: [] });
								}}
							>
								<Button
									size="xs"
									radius="md"
									variant="filled"
									color="rgba(36, 32, 32, 1)"
								>
									reset
								</Button>
							</div>
						</div>
						<textarea
							placeholder="ask ai"
							className="text-sm w-full min-h-[50px] border-slate-600 border-solid border-2 rounded-3xl pl-4 text-wrap flex placeholder:text-start pt-1"
							onChange={(e) => setChat(e.target.value)}
							value={chat}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									sendChat();
									setChat("");
								}
							}}
						/>
					</div>
				</div>
			</>
		</MantineProvider>
	);
};

export default IndexSidepanel;
