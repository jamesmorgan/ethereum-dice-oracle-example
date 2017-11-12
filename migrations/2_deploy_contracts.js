const DiceResultsOracle = artifacts.require("./DiceResultsOracle.sol");

module.exports = function (deployer, network) {
    deployer.deploy(DiceResultsOracle);
    console.log(`Deploying ${DiceResultsOracle} to ${network}`)
};
