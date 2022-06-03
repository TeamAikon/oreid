import { Truncate } from "./truncateFunctions";
import { truncateText } from "./truncateText";

export const prepEllipse = (node: HTMLElement, truncate: Truncate) => {
	const parent = node.parentElement;
	const txtToEllipse = node.firstElementChild;

	if (txtToEllipse) {
		//@ts-ignore
		const currentSize = txtToEllipse.offsetWidth;
		const targetSize = parent?.offsetWidth || 0;
		const text = txtToEllipse.textContent || "";

		txtToEllipse.textContent = truncateText({
			text,
			currentSize,
			targetSize,
			truncate,
		});
	}
};
