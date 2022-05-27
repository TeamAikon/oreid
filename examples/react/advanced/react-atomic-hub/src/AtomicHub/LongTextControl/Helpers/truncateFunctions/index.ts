import { removeEnd } from "./removeEnd";
import { removeMid } from "./removeMid";
import { removeStart } from "./removeStart";

export * from "./truncate.interface";
export const truncate = {
	removeEnd,
	removeMid,
	removeStart,
};
