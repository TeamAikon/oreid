import { Truncate } from "./truncateFunctions";

export const truncateText = ({
	text,
	currentSize,
	targetSize,
	truncate,
}: {
	text: string;
	currentSize: number;
	targetSize: number;
	truncate: Truncate;
}) => {
	if (!text) return text;
	if (currentSize <= targetSize) return text;
	const avgLetterSize = currentSize / text.length;
	const textMaxsize = Math.floor(targetSize / avgLetterSize - 2);
	return truncate({ text, size: textMaxsize });
};
