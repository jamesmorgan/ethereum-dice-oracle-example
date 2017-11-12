const DiceResultsOracle = artifacts.require('DiceResultsOracle');

contract('DiceResultsOracle spec', function (accounts) {

    let oracle;

    beforeEach(async () => {
        // Create a new DiceResultsOracle
        oracle = await DiceResultsOracle.new({from: accounts[0]});
    });

    it("should default to 0/0 results", async () => {
        let results = await oracle.getResult();
        assert.strictEqual(results[0].toNumber(), 0);
        assert.strictEqual(results[1].toNumber(), 0);
    });

    it("should set results and emit event once resulted", async () => {

        const dyeOne = 2;
        const dyeTwo = 4;

        let eventWatcher = oracle.GameResulted();

        return oracle.setResult(dyeOne, dyeTwo, {from: accounts[0]})
            .then(() => {
                return eventWatcher.get();
            })
            .then((events) => {
                // validate event emitted
                assert.equal(events[0].event.valueOf(), 'GameResulted');

                // Confirm the results are set and emitted
                let eventArgs = events[0].args;

                assert.equal(eventArgs.resulter, accounts[0]);
                assert.equal(eventArgs.dye1, dyeOne);
                assert.equal(eventArgs.dye2, dyeTwo);

                return oracle.getResult();
            })
            .then((results) => {
                assert.strictEqual(results[0].toNumber(), dyeOne);
                assert.strictEqual(results[1].toNumber(), dyeTwo);
            });
    });

    // TODO more tests...

});
