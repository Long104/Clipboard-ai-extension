// import "@/style.css";
// import "@/button.css";
import { useEffect, useState } from "react";
import { Button, Checkbox, MantineProvider } from "@mantine/core";
import But from "@/components/button";
import "@mantine/core/styles.css";

function IndexPopup() {
	const [isOn, setIsOn] = useState(true);
	const [isOpenHistory, setIsOpenHistory] = useState(false);

	// Toggle the switch and update storage
	const toggleSwitch = async () => {
		const newState = !isOn;
		setIsOn(newState); // Update UI state

		// Update @plasmohq/storage

		// Update chrome.storage.local and notify background script
		chrome.storage.local.set({ isOn: newState }, () => {
			console.log("Value is set to " + newState);
			chrome.runtime.sendMessage({ type: "TOGGLE_SWITCH", isOn: newState });
		});
	};

	const toggleHistory = async () => {
		chrome.windows.getCurrent({ populate: true }, (window) => {
			(chrome as any).sidePanel.open({ windowId: window.id });
		});

		window.close();
	};

	useEffect(() => {
		// Retrieve initial value from storage on mount
		(async () => {
			const result = await new Promise<{ isOn?: boolean }>((resolve) => {
				chrome.storage.local.get(["isOn"], resolve);
			});

			const storedIsOn = result.isOn ?? true; // Default to true if not set
			setIsOn(storedIsOn);
		})();
	}, []);

	return (
		<MantineProvider>
			<>
				<div className="min-w-64 min-h-64 flex flex-col items-center">
					{/* <a */}
					{/* 	href="https://notion-clone-rose-five.vercel.app" */}
					{/* 	target="_blank" */}
					{/* 	className="z-10 absolute top-4 text-lg text-white font-bold */}
					{/*       " */}
					{/* > */}
					{/* 	Go to Notion Clone */}
					{/* </a> */}
					{/* <div className=" flex flex-grow items-center justify-center"> */}
					{/* 	<button className="toggle"> */}
					{/* 		<input */}
					{/* 			type="checkbox" */}
					{/* 			id="btn" */}
					{/* 			checked={isOn} */}
					{/* 			onChange={toggleSwitch} */}
					{/* 		/> */}
					{/* 		<label htmlFor="btn"> */}
					{/* 			<span className="thumb"></span> */}
					{/* 		</label> */}
					{/* 		<div className="light"></div> */}
					{/* 	</button> */}
					{/* </div> */}
					<But isOn={isOn} toggleSwitch={toggleSwitch} />
					<Button
						// className="z-50 absolute bottom-4 text-lg text-white font-bold"
						className="z-50 absolute bottom-5"
						onClick={toggleHistory}
						variant="light"
						radius="xl"
						color="cyan"
					>
						Clipboard History
					</Button>
				</div>
			</>
		</MantineProvider>
	);
}

export default IndexPopup;
