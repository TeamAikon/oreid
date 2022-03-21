import React from "react";
import LoginButton from "oreid-login-button";
import { useActionAuth } from "oreid-react";
import { AuthProvider } from "oreid-js";

export const LoggedOut: React.FC = () => {
	const onAuth = useActionAuth();

	return (
		<div className="LoggedOut">
			<LoginButton
				provider="facebook"
				onClick={(e) => {
					e.preventDefault();
					// you can use differnt providers
					onAuth({
						params: { provider: AuthProvider.Facebook },
						onError: console.error,
						onSuccess: console.log,
					});
				}}
			/>
			<LoginButton
				provider="google"
				onClick={(e) => {
					e.preventDefault();
					// Google is the default provider
					onAuth({
						// params: { provider: AuthProvider.Google },
						onError: console.error,
						onSuccess: console.log,
					});
				}}
			/>
		</div>
	);
};
