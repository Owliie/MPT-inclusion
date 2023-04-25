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
    ],
  },
  circom: {
    inputBasePath: "./circuits",
    // ptau: "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final.ptau",
    ptau: "powersOfTau28_hez_final_19.ptau",
    circuits: [
      {
        name: "MPT-inclusion",
        protocol: "plonk",
        version: 2,
        circuit: "MPT-inclusion.circom",
        input: "MPT-inclusion.json",
        wasm: "../artifacts/circom/MPT-inclusion.wasm",
        // zkey: "MPT-inclusion.zkey",
      },
    ],
  },
};
