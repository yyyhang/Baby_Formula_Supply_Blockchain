# COMP6452_Project_2

## getting dtsrted

```sh
Launch Ganache with quick start

Ensure eth_providers/providers,json is configured with the same RPC server as Ganache

```
Then run:

```sh
npm install

npx tsc

node build/setupDb.js

node build/runOracle.js

When prompted enter the private key of an account (supposed to be the ship server account)

The oracle address should be printed and can be used in the createTransit command stated in the below steps

```

Then:

```sh
node build/index.js

When prompted enter the private key of an different account (supposed to be the formula producer account)

The following commands can then be entered

    createFormula -batchSize=<number>

    listFormula
    
    createTransit -receiver=<receiver_pub_key> -shipOracle=<oracle_address> -receiptLocation=<pdf_file_location> -formula=<formula_address,formula_address,formula_address....>
    
    startTransit -transit=<transitAddress>
    
    runTransit -transit=<transitAddress>

```

To view state changes open remix and compile all the contracts in the contracts folder

Change the enviornment to web3 with correct port number

Copy the address of the contract to 'At Address' and click it with the smart contract you want to view

Some interesting fields to look at are qualityStatus, location, owner in BabyFormula and temperatures, receiptHash and locations in BabyFormulaTransit


