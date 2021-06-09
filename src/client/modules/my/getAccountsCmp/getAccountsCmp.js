import { getAccounts } from 'data/accounts';
import { LightningElement, track, api } from 'lwc';
export default class GetAccountsCmp extends LightningElement {
  returnedAcc = [];
  @api FromApp;

  handleClick(event) {
    getAccounts().then(result => {
      this.returnedAcc = result;
      console.log(result);
    });
  }

}