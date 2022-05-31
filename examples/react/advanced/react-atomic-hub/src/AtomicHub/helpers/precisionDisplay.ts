export const precisionDisplay = ({
	value,
	precision,
}: {
	value: string | number;
	precision: number;
}) => {
	const numberValue = Number(value);
	const factor = Math.pow(10, precision);
	const roundValue =
		Math.round((numberValue + Number.EPSILON) * factor) / factor;
	return roundValue;
};
