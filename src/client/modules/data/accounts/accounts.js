const URL = '/api/accounts';
let accounts = [];
export const getAccounts = () => fetch(URL)
  .then(response => {
    if (!response.ok) {
      throw new Error('No response from server');
    }
    return response.json();
  })
  .then(result => {
    accounts = result.data;
    return accounts;
  });