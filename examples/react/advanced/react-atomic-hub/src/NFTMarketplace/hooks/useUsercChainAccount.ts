import { ChainNetwork } from "oreid-js";
import { useUser } from "oreid-react";

export const useUsercChainAccount = ({
	chainNetwork,
}: {
	chainNetwork: ChainNetwork;
}) => {
	// const waxAccount = "testsataikon";
	const user = useUser();
	if (!user) return "";
	const account = user.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === chainNetwork
	);

	return account?.chainAccount || "";
};
