import { Truncate } from "./truncate.interface";

export const removeEnd: Truncate = ({ text, size }) => {
	if (text.length <= size) return text;
	return `${text.substr(0, size)}...`;
};
