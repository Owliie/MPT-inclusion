const { expect } = require("chai");
const ethers = require("ethers");
const { zKey, groth16 } = require("snarkjs");
const merkle = require("merkletreejs");
var path = require('path');
var fs = require('fs/promises');

describe("E2E MPT inclusion depth 3", function () {
  this.timeout(1000000)

  before(async () => {
    try {
      await fs.readFile('MPT3.zkey')
    } catch (e) {
      console.log('generating new zkey');
      await zKey.newZKey("MPT3.r1cs", "artifacts/circom/powersOfTau28_hez_final_20.ptau", "MPT3.zkey");
    }
  })

  const hexToNumber = (hex) => {
    return ethers.BigNumber.from('0x' + hex).toString()
  }

  const prepareHashes = (index, leavesCount) => {
    const leaves = [];
    for (let i = 0; i < leavesCount; i++) {
      const value = i;
      leaves[i] = ethers.utils.solidityKeccak256(['uint256'], [value]);
    }

    const tree = new merkle.MerkleTree(leaves, ethers.utils.keccak256);
    const rootBytes = tree.getHexRoot();

    const path = tree.getHexProof(leaves[+index]);

    const pathHalf1 = [
      hexToNumber(path[0].replace('0x', '').slice(0, 32)),
      hexToNumber(path[1].replace('0x', '').slice(0, 32)),
      hexToNumber(path[2].replace('0x', '').slice(0, 32)),
    ]

    const pathHalf2 = [
      hexToNumber(path[0].replace('0x', '').slice(32, 64)),
      hexToNumber(path[1].replace('0x', '').slice(32, 64)),
      hexToNumber(path[2].replace('0x', '').slice(32, 64)),
    ]

    return {
      leafValue: index,
      leafIndex: index,
      rootHalf1: hexToNumber(rootBytes.replace('0x', '').slice(0, 32)),
      rootHalf2: hexToNumber(rootBytes.replace('0x', '').slice(32, 64)),
      pathHalf1,
      pathHalf2,
    }
  }

  it("verify for random index", async () => {
    const randomIndex = (Math.random() * 10).toFixed(0)

    const data = prepareHashes(randomIndex % 8, 8)

    const { proof, publicSignals } = await groth16.fullProve(
      data,
      "MPT3_js/MPT3.wasm",
      "MPT3.zkey");

    const vKey = await zKey.exportVerificationKey("MPT3.zkey")
    const res = await groth16.verify(vKey, publicSignals, proof);

    expect(res).to.be.true;
  })

  it("fail verification due to invalid publicSignals", async () => {
    const randomIndex = (Math.random() * 10).toFixed(0)

    const data = prepareHashes(randomIndex % 8, 8)

    const { proof, publicSignals } = await groth16.fullProve(
      data,
      "MPT3_js/MPT3.wasm",
      "MPT3.zkey");

    publicSignals[0] = '1000'

    const vKey = await zKey.exportVerificationKey("MPT3.zkey")
    const res = await groth16.verify(vKey, publicSignals, proof);

    expect(res).to.be.false;
  })

  it("fail verification due to invalid proof", async () => {
    const randomIndex = (Math.random() * 10).toFixed(0)

    const data = prepareHashes(randomIndex % 8, 8)

    const { proof, publicSignals } = await groth16.fullProve(
      data,
      "MPT3_js/MPT3.wasm",
      "MPT3.zkey");

    proof.pi_a[0] = '1000'

    const vKey = await zKey.exportVerificationKey("MPT3.zkey")
    const res = await groth16.verify(vKey, publicSignals, proof);

    expect(res).to.be.false;
  })
});
