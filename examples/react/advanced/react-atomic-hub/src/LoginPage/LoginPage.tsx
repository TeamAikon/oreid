import React, { useState } from "react";
import { ReactComponent as Logo } from "./logo.svg";
import LogoFb from "./logo-fb.svg";
import LogoGoogle from "./logo-google.svg";
import LogoEmail from "./logo-email.svg";
import LogoFooter from "./logo-oreid.svg";

import styles from "./LoginPage.module.scss";
import { useOreId } from "oreid-react";
import { AuthProvider, UserData } from "oreid-js";

export const LoginPage: React.FC = () => {
	const oreId = useOreId();
	const [error, setError] = useState<Error | null>();

	const onError = (error: Error) => {
		console.log("Login failed", error);
		setError(error);
	};
	const onSuccess = ({ user }: { user: UserData }) => {
		console.log("Login successfull. User Data: ", user);
	};
	const loginWithProvider = (provider: AuthProvider) => {
		oreId.popup
			.auth({
				provider,
			})
			.then(onSuccess)
			.catch(onError);
	};

	return (
		<section className={styles.LoginPage}>
			<div className={styles.logo}>
				<Logo />
			</div>

			<div className={styles.content}>
				<h2>
					Seamless Multi-Chain <br />
					Auth for Web3{" "}
				</h2>
				<p>
					Create a new account or login to ORE ID
					<br />
					using one of the below options.{" "}
				</p>
			</div>

			<button
				className={styles.btnLogin}
				onClick={() => {
					loginWithProvider(AuthProvider.Facebook);
				}}
			>
				<img src={LogoFb} alt="" />
				<span>Facebook</span>
			</button>
			<button
				className={styles.btnLogin}
				onClick={() => {
					loginWithProvider(AuthProvider.Google);
				}}
			>
				<img src={LogoGoogle} alt="" />
				Google
			</button>
			<button
				className={styles.btnLogin}
				onClick={() => {
					loginWithProvider(AuthProvider.Email);
				}}
			>
				<img src={LogoEmail} alt="" />
				Email
			</button>

			{error && <div className="App-error">Error: {error.message}</div>}

			<img className={styles.footer} src={LogoFooter} alt="" />
		</section>
	);
};
