const pad = (number: string, minSize: number): string => {
	return number.length < minSize ? pad(`0${number}`, minSize) : number;
};

export const shiftDecimal = ({
	amount,
	precision,
}: {
	amount: string;
	precision: number;
}) => {
	const amountLength = pad(amount, 9);
	const dec = amountLength.slice(-1 * precision);
	const int = amountLength.slice(0, amountLength.length - precision);

	return `${int}.${dec}`;
};
