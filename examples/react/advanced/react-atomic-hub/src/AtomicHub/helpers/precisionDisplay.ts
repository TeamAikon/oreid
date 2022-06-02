export const precisionDisplay = ({
	value,
	precision,
}: {
	value: string | number;
	precision: number;
}) => {
	const numberValue = Number(value);
	const factor = Math.pow(10, precision);
	const roundValue = Math.floor(numberValue * factor) / factor;
	if (roundValue < numberValue) return `${roundValue}...`;
	return roundValue;
};
