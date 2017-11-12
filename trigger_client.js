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

    // Get deployed contract
    oracleContract.deployed()
        .then((oracleInstance) => {

            /**
             * Initialise [client -> oracle] contract (business relationship)
             */
            getOracleResults(oracleInstance, accounts);

            /**
             * Event subscriber of [GameResulted] - from [oracle -> client]
             *
             * The result is emitted by the oracle, allows for a client to handle oracle state changes
             */
            oracleInstance.GameResulted()
                .watch((err, event) => {
                    console.log("Game resulted -> ", event);

                    /**
                     * Re-trigger asking the oracles for new results
                     */
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
        oracleInstance.getResult(),  // Get currently stored results
        oracleInstance.triggerUpdate({from: accounts[0]})  // Request the oracle contract to update its state
    ];

    Promise.all(oraclePromises)
        .then((result) => {
            console.log(`Requesting Oracle to update`);
            console.log("----------------------------\n");
            console.log(`Throw values ${result[0]}'`);
            console.log("----------------------------\n");
        })
        .catch((err) => console.log(`getOracleResults() error: [${err}]`));
};
