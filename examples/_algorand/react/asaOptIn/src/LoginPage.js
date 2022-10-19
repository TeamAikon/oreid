import { useState } from "react";
import { AuthProvider } from "oreid-js";
import { useOreId } from "oreid-react";


export const LoginPage = () => {
	const oreId = useOreId();
	const [error, setError] = useState("");

	const onError = (error) => {
		console.log("Login failed", error);
		setError(error);
	};

	const onSuccess = ({ user }) => {
		console.log("Login successfull. User Data: ", user);
	};
    
	const loginWithProvider = (provider) => {
		oreId.popup
			.auth({
				provider,
			})
			.then( onSuccess )
			.catch( onError );
	};

	return (
        <div>
			<button
				onClick={() => {
					loginWithProvider(AuthProvider.Google);
				}}
			>
				Google
			</button>
			<button
				onClick={() => {
					loginWithProvider(AuthProvider.Email);
				}} 
            >
				Email
			</button>

			{error && <div>Error: {error.message}</div>}
        </div>
	);
};
