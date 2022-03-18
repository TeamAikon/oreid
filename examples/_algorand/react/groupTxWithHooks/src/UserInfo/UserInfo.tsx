import { useUser } from "oreid-react";
import React from "react";

export const UserInfo: React.FC = () => {
	const user = useUser();
	if (!user) return null;

	const { accountName, email, name, picture, username } = user;

	return (
		<>
			<h4>User Info</h4>
			<img
				//@ts-ignore
				src={picture}
				style={{ width: 100, height: 100, paddingBottom: 30 }}
				alt={"user"}
			/>
			<br />
			OreId account: {accountName}
			<br />
			name: {name}
			<br />
			username: {username}
			<br />
			email: {email}
		</>
	);
};
