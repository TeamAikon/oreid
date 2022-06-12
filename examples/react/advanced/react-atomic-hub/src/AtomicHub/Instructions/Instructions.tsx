import React, { useState } from "react";
import styles from "./Instructions.module.scss";
import { Acordeon } from "./Acordeon";

interface Instruction {
	title: string;
	content: string | JSX.Element;
}

interface Props {}

export const Instructions: React.FC<Props> = () => {
	const [open, setOpen] = useState(-1);

	const instructions: Instruction[] = [
		{
			title: "Overview",
			content: (
				<ul className={styles.list}>
					<li>This app demonstrates how you can use ORE ID in your app</li>
					<li>Users are able to create a wallet and authorize using familiar social logins like Google, Facebook, email, etc.</li>
					<li>Automatically create and setup blockchain account and wallet</li>
					<li>Easily sign and transmit blockchain transactions (e.g. to send a token)</li>
				</ul>
			),
		},
		{
			title: "Step: Create a blockchain wallet",
			content: (
				<ul className={styles.list}>
					<li>
						When a user authenticates for the first time, they are assigned a
						unique ORE ID for your app (e.g. ore1t2roxcbz)
					</li>
					<li>
						A blockchain account can be automatically created for the user on
						one or more blockchains. In this demo, an account is created on the
						WAX test network
					</li>
					<li>
					  Blockchain accounts can be created on other chains at the same time
						(e.g. Algorand, Ethereum, and Polygon)
					</li>
					<li>
					  Using our Deferred Account Creation, blockchain account creation 
						can be delayed until the user performs a transaction of some value - 
						this defers the cost of creating a new on-chain account (important for some chains)
					</li>
				</ul>
			),
		},
		{
			title: "Step: Transfer some tokens to get started",
			content: (
				<>
					You can configure your app to automatically airdrop some tokens to a
					new account to get the user started. In this demo, we transfer 2 WAX
					tokens to the new account to allow you to purchase an NFT in the marketplace.
				</>
			),
		},
		{
			title: "Step: Minting an NFT",
			content: (
				<>
					Clicking [Claim my NFT] calls an API to mint a new NFT and
					transfer it to your WAX blockchain account. This gives you an NFT to
					play with in this demo. It may take 20 seconds or so to complete the
					mint and transfer action.
				</>
			),
		},
		{
			title: "Step: Sign a transation - List NFT for sale",
			content: (
				<ul className={styles.list}>
					<li>
					Put your new NFT up for sale on the NFT marketplace.
					</li>
					<li>
					To do this, you’ll sign a blockchain transaction. When you click [List my NFT] a
					pop-up appears to enter your wallet password to sign the transaction
					with your ORE ID account.
					</li>
					<li>
					ORE ID will automatically send the
					transaction to the blockchain for you.
					</li>
				</ul>
			),
		},
		{
			title: "Step: Transfer an NFT",
			content: (
				<ul className={styles.list}>
					<li>
						To transfer your NFT, you need to sign a transfer transaction.
					</li>
					<li>
						Clicking [Transfer Back] creates a transaction to send the NFT back
						to the minter’s account.
					</li>
					<li>
						When you enter your password, the transaction
						is signed and sent to the chain. Click the [View on Blockchain] link
						to see the transaction in a WAX block explorer.
					</li>
				</ul>
			),
		},
		{
			title: "Action: Get started with ORE ID for your app",
			content: (
				<>
					Add ORE ID to your app. Go to{" "}
					<a
						href="https://oreid.io/developer"
						target="_blank"
						rel="noopener noreferrer"
					>
						https://oreid.io/developer
					</a>{" "}
					to get started today.
				</>
			),
		},
	];

	return (
		<div className={styles.Instructions}>
			{instructions.map((instruction, key) => (
				<Acordeon
					key={key}
					open={open === key}
					setOpen={(open) => {
						if (!open) {
							setOpen(-1);
							return;
						}
						setOpen(key);
					}}
					title={instruction.title}
				>
					<>{instruction.content}</>
				</Acordeon>
			))}
		</div>
	);
};
