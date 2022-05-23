export const callMintNft = async ({
	templateId,
	accountName,
	userName,
}: {
	templateId?: string;
	accountName: string;
	userName?: string;
}): Promise<string> => {
	const response = await fetch(
		`/api/mint_nft?template_id=${templateId}&owner=${accountName}&name=${userName}`
	);

	return response.text()
};
