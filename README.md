# MPT-inclusion

## To run tests
1. Compile the circuits using:
```
circom circuits/MPT1.circom --r1cs --wasm --sym --c
circom circuits/MPT2.circom --r1cs --wasm --sym --c
```
2. Run the tests using:
```
npm run test
```