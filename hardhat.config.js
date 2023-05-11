require("hardhat-circom");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.11",
      }
    ],
  },
  // the code below is not used due to issues with hardhat-circom v2 compiler and is left for reference
  circom: {
    inputBasePath: "./circuits",
    ptau: "../artifacts/circom/powersOfTau28_hez_final_19.ptau",
    circuits: [
      {
        name: "MPT1",
        protocol: "plonk",
        version: 1,
        circuit: "MPT1.circom",
        input: "MPT1.json",
        wasm: "../artifacts/circom/MPT-inclusion.wasm",
      },
    ],
  },
};
