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

        const dieOne = 2;
        const dieTwo = 4;

        let eventWatcher = oracle.GameResulted();

        return oracle.setResult(dieOne, dieTwo, {from: accounts[0]})
            .then(() => {
                return eventWatcher.get();
            })
            .then((events) => {
                // validate event emitted
                assert.equal(events[0].event.valueOf(), 'GameResulted');

                // Confirm the results are set and emitted
                let eventArgs = events[0].args;

                assert.equal(eventArgs.resulter, accounts[0]);
                assert.equal(eventArgs.die1, dieOne);
                assert.equal(eventArgs.die2, dieTwo);

                return oracle.getResult();
            })
            .then((results) => {
                assert.strictEqual(results[0].toNumber(), dieOne);
                assert.strictEqual(results[1].toNumber(), dieTwo);
            });
    });

    // TODO more tests...

});
