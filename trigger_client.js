process.on('unhandledRejection', error => console.log('unhandledRejection', error.message));

const OracleContract = require('./build/contracts/DiceResultsOracle.json');
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
const oracleContract = contract(OracleContract);
oracleContract.setProvider(web3.currentProvider);

// see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof oracleContract.currentProvider.sendAsync !== "function") {
    oracleContract.currentProvider.sendAsync = function () {
        return oracleContract.currentProvider.send.apply(
            oracleContract.currentProvider, arguments
        );
    };
}


web3.eth.getAccounts((err, accounts) => {
    oracleContract.deployed()
        .then((oracleInstance) => {

            // Init - get the results
            getOracleResults(oracleInstance, accounts);

            // Create event watcher - another process could then be triggered e.g. another real world process
            oracleInstance.GameResulted()
                .watch((err, event) => {
                    console.log("Game resulted -> ", event);

                    // Demonstration only - re-run getResults()
                    getOracleResults(oracleInstance, accounts);
                });
        })
        .catch((err) => console.log(err));
}).catch((err) => console.log(err));

/**
 * A simple method getting and triggering the oracle
 */
const getOracleResults = (oracleInstance, accounts) => {

    const oraclePromises = [
        oracleInstance.getResult(),  // Get currently stored dice result
        oracleInstance.triggerUpdate({from: accounts[0]})  // Request oracle to update the information
    ];

    Promise.all(oraclePromises)
        .then((result) => {
            console.log('Requesting Oracle to update');
            console.log('dice throw values: ' + result[0]);
        })
        .catch((err) => console.log("Promise all failure: " + err));
};
