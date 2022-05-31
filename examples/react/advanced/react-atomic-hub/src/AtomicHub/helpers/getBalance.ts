import { JsonRpc } from "eosjs";
export const getBalance = async ({
	chainAccount,
}: {
	chainAccount: string;
}) => {
	// Instantiate a new JsonRpc object, with the Network Api Uri, and a request object
	const rpc = new JsonRpc("https://waxtestnet.greymass.com", { fetch });
	// Request the balance, passing in the token contract, the account name, and the token symbol
	const [balance] = await rpc.get_currency_balance(
		"eosio.token",
		chainAccount,
		"WAX"
	);

	if (!balance) return "0";
	const [amount] = balance?.split(" ");
	return amount?.replace(".", "") || "000000000";
};
