import { Truncate } from "./truncate.interface";

export const removeStart: Truncate = ({ text, size }) => {
	if (text.length <= size) return text;
	return `...${text.substr(-1 * size)}`;
};
