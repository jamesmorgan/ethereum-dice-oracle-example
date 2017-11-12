pragma solidity ^0.4.17;


/**
 * DiceResultsOracle - A basic Oracle example
 **/
contract DiceResultsOracle {

    uint8 private dyeOneOutcome;

    uint8 private dyeTwoOutcome;

    address public owner;

    event CallbackTrigger();

    event GameResulted(address resulter, uint8 dye1, uint8 dye2);

    function DiceResultsOracle() public {
        owner = msg.sender;
    }

    function triggerUpdate() public {
        CallbackTrigger();
    }

    function setResult(uint8 dyeOne, uint8 dyeTwo)
    validateDice(dyeOne, dyeTwo)
    public {
        // ignore if its not the Oracle i.e. the creator
        require(msg.sender == owner);

        // Result the contract
        dyeOneOutcome = dyeOne;
        dyeTwoOutcome = dyeTwo;

        // Fire notification event
        GameResulted(msg.sender, dyeOne, dyeTwo);
    }

    function getResult() constant public returns (uint8, uint8) {
        return (dyeOneOutcome, dyeTwoOutcome);
    }

    /*********************
     * Private modifiers *
     *********************/

    modifier validateDice(uint8 dyeOne, uint8 dyeTwo) {
        assert(dyeOne >= 1 && dyeOne <= 6);
        assert(dyeTwo >= 1 && dyeTwo <= 6);
        _;
    }

}
