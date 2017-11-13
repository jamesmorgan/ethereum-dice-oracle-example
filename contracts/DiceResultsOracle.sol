pragma solidity ^0.4.17;


/**
 * DiceResultsOracle - A basic Oracle example
 **/
contract DiceResultsOracle {

    uint8 private dieOneOutcome;

    uint8 private dieTwoOutcome;

    address public owner;

    event CaptureRealWorldData();

    event GameResulted(address resulter, uint8 die1, uint8 die2);

    function DiceResultsOracle() public {
        owner = msg.sender;
    }

    function refreshDataSource() public {
        CaptureRealWorldData();
    }

    function setResult(uint8 dieOne, uint8 dieTwo)
    validateDice(dieOne, dieTwo)
    public {
        // ignore if its not the Oracle i.e. the creator
        require(msg.sender == owner);

        // Result the contract
        dieOneOutcome = dieOne;
        dieTwoOutcome = dieTwo;

        // Fire notification event
        GameResulted(msg.sender, dieOne, dieTwo);
    }

    function getResult() constant public returns (uint8, uint8) {
        return (dieOneOutcome, dieTwoOutcome);
    }

    /*********************
     * Private modifiers *
     *********************/

    modifier validateDice(uint8 dieOne, uint8 dieTwo) {
        assert(dieOne >= 1 && dieOne <= 6);
        assert(dieTwo >= 1 && dieTwo <= 6);
        _;
    }

}
