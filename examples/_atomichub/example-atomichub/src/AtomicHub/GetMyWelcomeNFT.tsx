import React from "react";

export const GetMyWelcomeNFT: React.FC = () => {
	const onClick = () => {
		// TODO: Create transaction to get my first NFT
		console.log("Get my Welcome NFT");
	};

	return <button onClick={onClick}>Get my Welcome NFT</button>;
};
