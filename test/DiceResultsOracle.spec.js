const DiceResultsOracle = artifacts.require('DiceResultsOracle');
const expectThrow = require('./utils').expectThrow;

contract('DiceResultsOracle spec', function (accounts) {

    const creator_account = accounts[0];

    let oracle;

    beforeEach(async () => {
        // Create a new DiceResultsOracle
        oracle = await DiceResultsOracle.new({from: creator_account});
    });

    it("should default to 0/0 results", async () => {
        let results = await oracle.getResult();
        assert.strictEqual(results[0].toNumber(), 0);
        assert.strictEqual(results[1].toNumber(), 0);
    });

    it("should set/get results & emit resulted once set", async () => {

        const dieOne = 2;
        const dieTwo = 4;

        let eventWatcher = oracle.GameResulted();

        return oracle.setResult(dieOne, dieTwo, {from: creator_account})
            .then(() => {
                return eventWatcher.get();
            })
            .then((events) => {
                // validate event emitted
                assert.equal(events[0].event.valueOf(), 'GameResulted');

                // Confirm the results are set and emitted
                let eventArgs = events[0].args;

                assert.equal(eventArgs.resulter, creator_account);
                assert.equal(eventArgs.die1, dieOne);
                assert.equal(eventArgs.die2, dieTwo);

                return oracle.getResult();
            })
            .then((results) => {
                assert.strictEqual(results[0].toNumber(), dieOne);
                assert.strictEqual(results[1].toNumber(), dieTwo);
            });
    });

    it('Only the contract creator can set the result', async () => {
        let different_account = accounts[1];
        await expectThrow(oracle.setResult(1, 2, {from: different_account}));
    });

    it('min size of result', async () => {
        await expectThrow(oracle.setResult(-1, 0, {from: creator_account}));
    });

    it('min size of result', async () => {
        await expectThrow(oracle.setResult(7, 6, {from: creator_account}));
    });

});
