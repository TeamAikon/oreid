import { Truncate } from "./truncate.interface";

export const removeMid: Truncate = ({ text, size }) => {
	if (text.length <= size) return text;
	const start = Math.floor(size / 2);
	const end = Math.ceil(size / 2);
	return `${text.substr(0, start)}...${text.substr(-1 * end)}`;
};
