const { assert } = require("chai");
const fs = require("fs/promises");
const { CircuitTestUtils } = require("hardhat-circom");
const ethers = require("ethers");

describe.only("MPT-Inclusion circuit", () => {
  let circuit;

  const sampleInput = {
    leafValue: 1,
    leafIndex: "0",
    rootHalf1: "",
    rootHalf2: "",
    pathHalf1: [],
    pathHalf2: [],
    isRight: [],
  };

  const hexToNumber = (hex) => {
    return ethers.BigNumber.from('0x' + hex).toString()
  }

  const prepareHashesDepth1 = async () => {
    const leaf1 = ethers.utils.solidityKeccak256(['uint256'], [sampleInput.leafValue])
    const leaf2 = ethers.utils.solidityKeccak256(['uint256'], [2])

    // let output = '0000101000011100000011101100111001000111001010111110111101100000010100000011110001000000110000111010001101100100101100010101000101001110000011100101000000010100101011011101001111101011010001111100110000101000011101010111000001111000101111010001010110101001'
    // console.log('hashed circom output', ethers.utils.hexlify(bitsToBytes(output)))

    sampleInput.pathHalf1 = [
      hexToNumber(leaf2.replace('0x', '').slice(0, 32))
    ]
    sampleInput.pathHalf2 = [
      hexToNumber(leaf2.replace('0x', '').slice(32, 64))
    ]

    const root = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      [leaf1, leaf2]
    )

    sampleInput.rootHalf1 = hexToNumber(root.replace('0x', '').slice(0, 32))
    sampleInput.rootHalf2 = hexToNumber(root.replace('0x', '').slice(32, 64))

    sampleInput.isRight = [1]
  }

  const prepareHashesDepth2 = async () => {
    const leaf1 = ethers.utils.solidityKeccak256(['uint256'], [sampleInput.leafValue])
    const leaf2 = ethers.utils.solidityKeccak256(['uint256'], [2])

    const sibling2 = ethers.utils.solidityKeccak256(['uint256'], [3])

    sampleInput.pathHalf1 = [
      hexToNumber(leaf2.replace('0x', '').slice(0, 32)),
      hexToNumber(sibling2.replace('0x', '').slice(0, 32))
    ]

    sampleInput.pathHalf2 = [
      hexToNumber(leaf2.replace('0x', '').slice(32, 64)),
      hexToNumber(sibling2.replace('0x', '').slice(32, 64))
    ]

    const sibling1 = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      [leaf1, leaf2]
    )

    const root = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      [sibling1, sibling2]
    )

    sampleInput.rootHalf1 = hexToNumber(root.replace('0x', '').slice(0, 32))
    sampleInput.rootHalf2 = hexToNumber(root.replace('0x', '').slice(32, 64))

    sampleInput.isRight = [1, 1]
    console.log('sampleInput', sampleInput)
  }

  it.only("produces a witness with valid constraints for depth 1", async () => {
    const r1csFastFile = {
      type: "mem",
      data: await fs.readFile('MPT1.r1cs'),
    };
    const symFastFile = {
      type: "mem",
      data: await fs.readFile('MPT1.sym'),
    };
    const wasmFastFile = {
      type: "mem",
      data: await fs.readFile('./MPT1_js/MPT1.wasm'),
    };
    circuit = new CircuitTestUtils({ r1cs: r1csFastFile, wasm: wasmFastFile, sym: symFastFile })

    await prepareHashesDepth1()
    const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
    await circuit.checkConstraints(witness);
  });

  it.only("produces a witness with valid constraints for depth 2", async () => {
    const r1csFastFile = {
      type: "mem",
      data: await fs.readFile('MPT2.r1cs'),
    };
    const symFastFile = {
      type: "mem",
      data: await fs.readFile('MPT2.sym'),
    };
    const wasmFastFile = {
      type: "mem",
      data: await fs.readFile('./MPT2_js/MPT2.wasm'),
    };
    circuit = new CircuitTestUtils({ r1cs: r1csFastFile, wasm: wasmFastFile, sym: symFastFile })

    await prepareHashesDepth2()
    const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
    await circuit.checkConstraints(witness);
  });

  it("has expected witness values", async () => {
    const witness = await circuit.calculateLabeledWitness(
      sampleInput,
      sanityCheck
    );
    assert.propertyVal(witness, "main.x", sampleInput.x);
    // You might want to test some intermediate values in the mimc sponge
    assert.propertyVal(
      witness,
      "main.out",
      "15893827533473716138720882070731822975159228540693753428689375377280130954696"
    );
  });

  it("has the correct output", async () => {
    // const mimcResult = mimc.multiHash([sampleInput.x], mimcKey, mimcNumOutputs);
    // const expected = { out: mimc.F.toObject(mimcResult) };
    // const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
    // await circuit.assertOut(witness, expected);
  });
});
