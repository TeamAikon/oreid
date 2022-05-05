import { AuthProvider, OreId, Transaction, UserData } from "oreid-js";
import LoginButton from "oreid-login-button";
// ! To use hooks from oreid-react make sure you added the OreidProvider (index.tx shows how to do this)
import {
	OreidProvider,
	useActionAuth,
	useActionSign,
	useIsLoggedIn,
	useUser,
} from "oreid-react";
import { WebWidget } from "oreid-webwidget";
import React, { useEffect, useState } from "react";
import "./App.css";

const REACT_APP_OREID_APP_ID = "demo_0097ed83e0a54e679ca46d082ee0e33a";
const REACT_APP_OREID_API_KEY = "demo_k_97b33a2f8c984fb5b119567ca19e4a49";

// * Initialize OreId
const oreId = new OreId({
	appName: "ORE ID Sample App",
	appId: REACT_APP_OREID_APP_ID,
	// apiKey: REACT_APP_OREID_API_KEY, // apiKey required for autoSign feature
	plugins: {
		popup: WebWidget(),
	},
});

interface OreidReactError {
	errors?: string | undefined;
	data?: any;
}


const createSampleTransactionEos = (actor: string, permission = 'active') => {
	const transaction = {
		account: 'demoapphello',
		name: 'hi',
		authorization: [
			{
				actor,
				permission,
			},
		],
		data: {
			user: actor,
		},
	};
	return transaction;
}

const composeSampleTransaction: any = async (userData: UserData, signWithChainNetwork: string) => {
	if(!userData) return null

	const signingAccount = userData.chainAccounts.find(ca => ca.chainNetwork === signWithChainNetwork)
	if(!signingAccount) throw new Error(`User doesnt have a chain account for the ${signWithChainNetwork} network`)

	// Compose transaction contents
	const transactionBody = createSampleTransactionEos(signingAccount.chainAccount, signingAccount.defaultPermission?.name)
	const transaction = await oreId.createTransaction({
		chainAccount: signingAccount.chainAccount,
		chainNetwork: signingAccount.chainNetwork,
		transaction: transactionBody,
		signOptions: {
			broadcast: true,
			returnSignedTransaction: false,
		},
	});
	return transaction
}

const NotLoggedInComponent: React.FC = () => {
	const onAuth = useActionAuth();
	const [errors, setErrors] = useState<OreidReactError | undefined>();

	const onError = (error: OreidReactError) => {
		console.log("Login failed:", error);
		setErrors(error);
	};

	const onSuccess = ({ user }: { user: UserData }) => {
		console.log("Login successfull");
		console.log("User Data: ", user);
	};

	return (
		<>
			<div>
				<LoginButton
					provider="facebook"
					onClick={() => {
						// * onError and onSuccess are optional. They're just here to show that they exist.
						// ! provider is also optional, but its use is highly recommended.
						onAuth({
							params: { provider: AuthProvider.Facebook },
							onError,
							onSuccess,
						});
					}}
				/>
				<LoginButton
					provider="google"
					onClick={() => {
						onAuth({
							params: { provider: AuthProvider.Google },
							onError,
							onSuccess,
						});
					}}
				/>
				<LoginButton
					provider="email"
					onClick={() => {
						onAuth({
							params: { provider: AuthProvider.Email },
							onError,
							onSuccess,
						});
					}}
				/>
			</div>
			{errors && <div className="App-error">Error: {errors.errors}</div>}
		</>
	);
};

const LoggedInComponent: React.FC = () => {
	const user = useUser();
	const onSign = useActionSign();
	const [errors, setErrors] = useState<OreidReactError | undefined>();
	const [signResults, setSignResults] = useState<any | undefined>();

	if (!user) return null;

	const { accountName, email, name, picture, username } = user;

	return (
		<>
			<div style={{ marginTop: 50, marginLeft: 40 }}>
				<h4>User Info</h4>
				<img
					src={picture.toString()}
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
				<br />
				<LoginButton
					provider="oreid"
					text="Sign with OreID"
					onClick={() => {
						setErrors(undefined)
						// compose a sample transaction for the EOS Kylin test network
						composeSampleTransaction(user, 'eos_kylin')
							.then((transaction: Transaction) => {
								console.log('transaction to sign:', transaction.data)
								// call the sign action
								onSign({
									transaction,
									onError: (error) => { setErrors(error) },
									onSuccess: (results) => { 
										setSignResults(results) 
									},
								});
						});
					}}
				/>
				<button onClick={
					() => oreId.logout()
				}>
					Logout
				</button>
			</div>
			{signResults && <div className="App-success">Results: {JSON.stringify(signResults)}</div>}
			{errors && <div className="App-error">Error: {errors.errors}</div>}
		</>
	);
};

const AppWithProvider: React.FC = () => {
	const isLoggedIn = useIsLoggedIn();
	return (
		<div className="App">
			<header className="App-header">
				{isLoggedIn ? <LoggedInComponent /> : <NotLoggedInComponent />}
			</header>
		</div>
	);
};

export const App: React.FC = () => {
	const [oreidReady, setOreidReady] = useState(false);

	useEffect(() => {
		oreId.init().then(() => {
			setOreidReady(true);
		});
	}, []);

	if (!oreidReady) {
		return <>Loading...</>;
	}

	return (
		<OreidProvider oreId={oreId}>
			<AppWithProvider />
		</OreidProvider>
	);
};
