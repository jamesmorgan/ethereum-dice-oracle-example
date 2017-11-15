process.on('unhandledRejection', error => console.log('unhandledRejection', error.message));
const prompt = require('prompt');
const _ = require('lodash');

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

let guesses = [];

web3.eth.getAccounts((err, accounts) => {

    // Get deployed contract
    oracleContract.deployed()
        .then((oracleInstance) => {

            prompt.start();

            console.log('Guess the next Dice throw...!');
            prompt.get(['throw1', 'throw2'], function (err, result) {

                guesses.push(result.throw1);
                guesses.push(result.throw2);

                console.log("\n");
                console.log(`You guessed: [${guesses}]`);

                let yesNoPrompt = {
                    name: 'yesno',
                    message: 'Do you want to go and get the real world result?',
                    validator: /y[es]*|n[o]?/,
                    warning: 'Must respond yes or no',
                    default: 'no'
                };

                prompt.get(yesNoPrompt, (err, result) => {

                    if (result.yesno === 'y') {
                        console.log("\n");
                        console.log('Asking oracle for the results....');

                        /**
                         * Refresh Oracle Contract state - [client --> oracle]
                         */
                        oracleInstance.refreshDataSource({from: accounts[0]})
                            .then(() => {

                                /**
                                 * Event subscriber of [GameResulted] - [oracle --> client]
                                 *
                                 * The result is emitted by the oracle, allows for multiple clients to subscribe to the outcome
                                 */
                                oracleInstance.GameResulted()
                                    .watch((err, event) => {
                                        let args = event.args;

                                        let results = [args.die1.valueOf(), args.die2.valueOf()];

                                        console.log(`Oracle data received : [${results}]`);

                                        if (_.isEqual(results.sort(), guesses.sort())) {
                                            console.log("------------------------");
                                            console.log("CONGRATULATIONS YOU WIN!");
                                            console.log("------------------------");
                                        } else {
                                            console.log("You lost...please throw again :(");

                                            // Request the oracle contract to update its state
                                            oracleInstance.refreshDataSource({from: accounts[0]})
                                        }
                                    });
                            });
                    }
                });
            });
        })
        .catch((err) => console.log(err));
}).catch((err) => console.log(err));
