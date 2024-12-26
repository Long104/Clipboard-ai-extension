/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	darkMode: "class",
	content: [
    "./src/contents/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/newtab/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/options/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/popup/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sidepanel/**/*.{js,ts,jsx,tsx,mdx}",
	],
	plugins: [],
};
