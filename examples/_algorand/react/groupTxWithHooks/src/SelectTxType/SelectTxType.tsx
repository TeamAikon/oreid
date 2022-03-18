import React from "react";

interface Props {
	txType: string;
	setTxType: (txType: string) => void;
}

export const SelectTxType: React.FC<Props> = ({ txType, setTxType }) => {
	return (
		<div style={{ marginTop: 10, marginBottom: 20 }}>
			<select
				name="choice"
				value={txType}
				onChange={(e) => {
					e.preventDefault();
					setTxType(e.target.value);
				}}
			>
				<option value="transfer">Transfer Example</option>
				<option value="optin">Opt-in Example</option>
				<option value="group">Group Example</option>
			</select>
		</div>
	);
};
