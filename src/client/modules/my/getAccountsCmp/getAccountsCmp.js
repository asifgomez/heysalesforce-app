import { getAccounts } from 'data/accounts';
import { createObject } from 'data/accounts';
import { assignPermission } from 'data/accounts';
import { createTab } from 'data/accounts';

import { LightningElement, track, api } from 'lwc';
export default class GetAccountsCmp extends LightningElement {
  returnedAcc = [];
  users;
  returnedrespobj = false;
  askforName = true;
  objname;
  @api FromApp;

  onchangehandler(event) {
    this.objname = event.target.value;
  }
  handleClick(event) {
    getAccounts().then(result => {
      this.returnedAcc = result;
      console.log(result);
    });
  }
  createObject(event) {
    createObject().then(result => {
      console.log('In lwc js ctrl:' + result);
      if (result > 0)
        this.returnedrespobj = true;
      console.log(result);
    });
  }
  assignPermission(event) {
    assignPermission().then(result => {
      //this.returnedAcc = result;
      console.log(result);
    });
  }
  createTab(event) {
    createTab().then(result => {
      //this.returnedAcc = result;
      console.log(result);
    });
  }
  fetchUsers(event) {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('No response from server');
        }
        return response.json();
      })
      .then(result => {
        console.log(result);
        this.users = result;
      });
  }
}