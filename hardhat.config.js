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
    ptau: "https://hermezptau.blob.core.windows.net/ptau/powersOfTau28_hez_final.ptau",
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
