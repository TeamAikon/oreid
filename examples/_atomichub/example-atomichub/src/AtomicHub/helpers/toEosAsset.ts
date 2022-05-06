const toEosAssetPaddedAmount = ({
	amount,
	precision,
}: {
	amount: string;
	precision?: number;
}): string => {
	let amountWithPadding = amount;
	if (precision) {
		amountWithPadding = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: precision,
			useGrouping: false,
		}).format(parseFloat(amount));
	}
	return amountWithPadding;
};

export const toEosAsset = ({
	amount,
	symbol,
	precision,
}: {
	amount: string;
	symbol: string;
	precision?: number;
}) => {
	const amountWithPadding = toEosAssetPaddedAmount({ amount, precision });
	return `${amountWithPadding} ${symbol.toUpperCase()}`;
};
