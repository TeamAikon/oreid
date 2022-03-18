import React, { useState } from "react";
import { useActionLogout, useUser } from "oreid-react";
import { SelectTxType } from "../SelectTxType";
import { SignWithOreID } from "../SignWithOreID";
import { UserInfo } from "../UserInfo";

export const LoggedIn: React.FC = () => {
	const [txType, setTxType] = useState("transfer");

	const onLogout = useActionLogout();
	const user = useUser();
	if (!user) return null;

	return (
		<div className="LoggedIn">
			<div style={{ marginTop: 50, marginLeft: 40 }}>
				<UserInfo />
				<br />
				<SelectTxType txType={txType} setTxType={setTxType} />
				<br />
				<SignWithOreID txType={txType} />
				<br />
				<button
					onClick={() => {
						onLogout();
					}}
				>
					Logout
				</button>
			</div>
		</div>
	);
};
