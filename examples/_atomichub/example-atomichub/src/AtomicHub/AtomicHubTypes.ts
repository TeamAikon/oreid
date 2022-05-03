interface Format {
	name: string;
	type: string;
}
export interface AtomichubAssets {
	contract: string;
	asset_id: string;
	owner: string;
	is_transferable: boolean;
	is_burnable: boolean;
	collection: {
		collection_name: string;
		name: string;
		img: string;
		author: string;
		allow_notify: boolean;
		authorized_accounts: string[];
		notify_accounts: string[];
		market_fee: number;
		created_at_block: string;
		created_at_time: string;
	};
	schema: {
		schema_name: string;
		format: Format[];
		created_at_block: string;
		created_at_time: string;
	};
	template: {
		template_id: string;
		max_supply: string;
		is_transferable: boolean;
		is_burnable: boolean;
		issued_supply: string;
		immutable_data: {
			img: string;
			name: string;
			video: string;
			"back img": string;
			"card num": string;
			"stake-able": number;
			"stake power": number;
		};
		created_at_time: string;
		created_at_block: string;
	};
	mutable_data: {};
	immutable_data: {};
	template_mint: string;
	backed_tokens: [];
	burned_by_account: null;
	burned_at_block: null;
	burned_at_time: null;
	updated_at_block: string;
	updated_at_time: string;
	transferred_at_block: string;
	transferred_at_time: string;
	minted_at_block: string;
	minted_at_time: string;
	data: {
		img: string;
		name: string;
		video: string;
		"back img": string;
		"card num": string;
		"stake-able": number;
		"stake power": number;
	};
	name: string;
}
