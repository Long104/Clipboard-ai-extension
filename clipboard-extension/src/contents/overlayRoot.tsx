import type {
	PlasmoCSConfig,
	PlasmoCSUIJSXContainer,
	PlasmoCSUIProps,
	PlasmoRender,
} from "plasmo";
import { useState, type FC, useEffect } from "react";
import { createRoot } from "react-dom/client";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
};

export const getRootContainer = () =>
	new Promise((resolve) => {
		const checkInterval = setInterval(() => {
			// const rootContainerParent = document.querySelector(`body`);
			const rootContainerParent = document.querySelector(`div`);
			if (rootContainerParent) {
				clearInterval(checkInterval);
				const rootContainer = document.createElement("div");
				rootContainerParent.appendChild(rootContainer);
				resolve(rootContainer);
			}
		}, 137);
	});

const PlasmoOverlay: FC<PlasmoCSUIProps> = () => {
	const [Color, setColor] = useState<string>("#000000");
	function changeBackgroundColor() {
		const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
		setColor(randomColor);
	}

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.type === "CHANGE_COLOR") {
			changeBackgroundColor(); // Define this function in overlay.tsx
		}
	});

	return (
		<span
			style={{
				borderRadius: 4,
				background: "yellow",
				// padding: 4,
				position: "absolute",
				top: 0,
				left: 0,
				height: "5px",
				width: "5px",
				// transform: "translateY(-24px) translateX(42px)",
				backgroundColor: Color,
			}}
		>
			{/* <button className="pt-5" onClick={changeBackgroundColor}>change color</button> */}
		</span>
	);
};

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
	createRootContainer,
}) => {
	const rootContainer = await createRootContainer();
	const root = createRoot(rootContainer);
	root.render(<PlasmoOverlay />);
};

export default PlasmoOverlay;
