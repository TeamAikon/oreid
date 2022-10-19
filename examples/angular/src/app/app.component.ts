import { Component } from '@angular/core';
import { OreidProvider } from './oreid.provider';
import { AuthProvider, OreId, Transaction, UserData } from 'oreid-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [OreidProvider],
})
export class AppComponent {
  title = 'angular-oreid-js';
  oreId: OreId;

  constructor(private oreidProvider: OreidProvider) {
    this.oreId = this.oreidProvider.oreId;
  }

  async oreidAuth() {
    const result = await this.oreId.popup.auth({
      provider: AuthProvider.Google,
    });
    // Remember, oreid-js is a stateful object. So you can access the user data directly from "oreid.auth.user"
    console.log({ result });
  }

  async oreidUserData() {
    const user = this.oreId.auth.user;
    await user.getData();
    console.log('user: ', user.data);
  }

  private createSampleTransactionEos(actor: string, permission = 'active') {
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

  private composeSampleTransaction = async (
    userData: UserData,
    signWithChainNetwork: string
  ) => {
    if (!userData) return null;

    const signingAccount = userData.chainAccounts.find(
      (ca) => ca.chainNetwork === signWithChainNetwork
    );
    if (!signingAccount)
      throw new Error(
        `User doesnt have a chain account for the ${signWithChainNetwork} network`
      );

    // Compose transaction contents
    const transactionBody = this.createSampleTransactionEos(
      signingAccount.chainAccount,
      signingAccount.defaultPermission?.name
    );
    const transaction = await this.oreId.createTransaction({
      chainAccount: signingAccount.chainAccount,
      chainNetwork: signingAccount.chainNetwork,
      transaction: transactionBody,
      signOptions: {
        broadcast: true,
        returnSignedTransaction: false,
      },
    });
    return transaction;
  };

  async signTransaction() {
    const user = this.oreId.auth.user.data;
    const transaction = await this.composeSampleTransaction(user, 'eos_kylin');

    if (!transaction) {
      console.error('Could not create transaction');
      return;
    }

    console.log('transaction to sign:', transaction.data);

    // call the sign action
    this.oreId.popup
      .sign({
        transaction,
      })
      .then((signedTransaction) => {
        console.log('transaction signed', signedTransaction);
      })
      .catch((error) => {
        console.log('Error signing transaction: ', error);
      });
  }

  async logout() {
    // Remember, oreid-js is a stateful object.
    this.oreId.logout();
  }
}
