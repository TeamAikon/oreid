export type WaxTransactionStruct = {
    actions: {
        account: string;
        name: string;
        authorization: [{
            actor: string;
            permission: string;
        }];
        data: {
            from: string;
            to: string;
            quantity: string;
            memo: string;
        };
    }[];
}