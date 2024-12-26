import React from "react";
import "@/style.css";
import "@/button.css";

const But = ({ isOn, toggleSwitch }) => {
	return (
		<div className=" flex flex-grow items-center justify-center">
			<button className="toggle">
				<input
					type="checkbox"
					id="btn"
					checked={isOn}
					onChange={toggleSwitch}
				/>
				<label htmlFor="btn">
					<span className="thumb"></span>
				</label>
				<div className="light"></div>
			</button>
		</div>
	);
};
export default But;
