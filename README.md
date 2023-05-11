# MPT-inclusion

## To run tests
1. Download correct ptau files or generate those on your own according to snarkjs official documentation.
   - for MPT1 (303553 constraints) & MPT2 (455746 constraints): [final_19.ptau](https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_19.ptau)
   - for MPT3 (607939 constraints): [final_20.ptau](https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau)

    ***! Put the ptau files in ./artifacts/circom/ folder. This folder is not committed. !***

    :warning: The ptau files are not included in this repository due to their size.

2. Compile the circuits using:
```
circom circuits/MPT1.circom --r1cs --wasm --sym --c
circom circuits/MPT2.circom --r1cs --wasm --sym --c
circom circuits/MPT3.circom --r1cs --wasm --sym --c
```
3. Run the tests using:
```
npm run test
```