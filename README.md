# A Simple Dice Resulting Oracle Example

## Setting up
```
npm install -g ethereumjs-testrpc@v6.0.x
npm install -g truffle@v4.0.x
npm install
```

## Running the Oracle

#### Start Test RPC
```bash
testrpc 
```

#### Compile and deploy the Oracle Contract
```bash
truffle compile && truffle migrate --force
```

### Running your Oracle
```bash
node oracle.js
```

### Running your client
```bash
node client.js
```

## Testing

* Enter truffle CLI - N.B. you do NOT need testrpc running to do this with truffle 4+
```bash
truffle develop
```

* Run the tests
```bash
truffle(develop)> test
```
