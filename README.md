# COMP6452_Project_2

## getting dtsrted

```sh
mkdir eth_providers && touch eth_providers/providers.json

mkdir eth_accounts && touch eth_accounts/accounts.json
```
Then launch Ganache with quick start

Fill in providers and accounts to eth_accounts/accounts.json with pri_key using 3 different account private keys

Then run: 

```sh
npm install

npx tsc

node build/index.js initdb

node build/index.js deploy babyFormula

node build/index.js deploy babyFormulaStatusOracle
```

Then:

```sh
node build/index.js deploy babyFormulaTransit <receiver_public_address> path_of_pdf <babyFormulaStatusOracle_address> <babyFormula_address>
```

Then open remix, change the enviornment to web3 with correct port number

Copy the transit address to 'At Address' and click it with smart contract is babyFomularTransit and the account is sender

Now you can click 'startTransit'

Then go back to local terminal, run:

node build/index.js listen babyFormulaStatusOracle <babyFormulaStatusOracle_address>

Back to Remix, you can change the account to receiver acount and click getBabyFormulaStatus.


