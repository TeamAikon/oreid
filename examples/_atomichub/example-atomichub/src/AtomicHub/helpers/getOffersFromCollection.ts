import { AtomichubOffer } from "../AtomicHubTypes";

export const getOffersFromCollection = async ({
	collection,
}: {
	collection: string;
}): Promise<AtomichubOffer[]> => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicassets/v1/offers?collection_name=${collection}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	return json?.data || [];
};
