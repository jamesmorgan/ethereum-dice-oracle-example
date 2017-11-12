process.on('unhandledRejection', error => console.log('unhandledRejection', error.message));
const prompt = require('prompt');

const DiceResultsOracle = require('./build/contracts/DiceResultsOracle.json');
const contract = require('truffle-contract');

const Web3 = require('web3');

let web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Truffle abstraction to interact with our deployed contract
const oracleContract = contract(DiceResultsOracle);
oracleContract.setProvider(web3.currentProvider);

// see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof oracleContract.currentProvider.sendAsync !== "function") {
    oracleContract.currentProvider.sendAsync = function () {
        return oracleContract.currentProvider.send.apply(
            oracleContract.currentProvider, arguments
        );
    };
}

process.on('unhandledRejection', error => console.log('unhandledRejection', error.message));

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
    oracleContract.deployed()
        .then((oracleInstance) => {

            /**
             * Subscribe to a request for providing a off chain data
             */
            oracleInstance.CallbackTrigger()
                .watch((err, event) => {

                    // launch prompt for dice values
                    prompt.start();

                    // Capture the result from the 'real world'
                    prompt.get(['throw1', 'throw2'], (err, result) => {
                        console.log('Received: ');
                        console.log(`  dye one: ${result.throw1}`);
                        console.log(`  dye two: ${result.throw2}`);

                        // Update the Oracle - providing the real world value
                        oracleInstance.setResult(result.throw1, result.throw2, {from: accounts[0]})
                    });
                })
        })
        .catch((err) => console.log(err));
}).catch((err) => console.log(err));
