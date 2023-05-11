const { expect } = require("chai");
const ethers = require("ethers");
const { makeCircuit } = require('./utils/prepare.js')

describe("MPT-Inclusion circuit", () => {
  const sampleInput = {
    leafValue: 1,
    leafIndex: 0,
    rootHalf1: "",
    rootHalf2: "",
    pathHalf1: [],
    pathHalf2: [],
  };

  const hexToNumber = (hex) => {
    return ethers.BigNumber.from('0x' + hex).toString()
  }

  const prepareHashesDepth1 = () => {
    const leaf1 = ethers.utils.solidityKeccak256(['uint256'], [sampleInput.leafValue])
    const leaf2 = ethers.utils.solidityKeccak256(['uint256'], [2])

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
  }

  const prepareHashesDepth2 = (leaf2Value, siblingValue) => {
    const leaf1 = ethers.utils.solidityKeccak256(['uint256'], [sampleInput.leafValue])
    const leaf2 = ethers.utils.solidityKeccak256(['uint256'], [leaf2Value])

    const sibling2 = ethers.utils.solidityKeccak256(['uint256'], [siblingValue])

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
      sampleInput.leafIndex % 2 === 0 ? [leaf1, leaf2]
        : [leaf2, leaf1]
    )

    const root = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      Math.floor(sampleInput.leafIndex / 2) % 2 === 0 ? [sibling1, sibling2]
        : [sibling2, sibling1]
    )

    sampleInput.rootHalf1 = hexToNumber(root.replace('0x', '').slice(0, 32))
    sampleInput.rootHalf2 = hexToNumber(root.replace('0x', '').slice(32, 64))
  }

  const prepareHashesDepth3 = (leaf2Value, siblingValue1, siblingValue2) => {
    const leaf1 = ethers.utils.solidityKeccak256(['uint256'], [sampleInput.leafValue])
    const leaf2 = ethers.utils.solidityKeccak256(['uint256'], [leaf2Value])

    const sibling1 = ethers.utils.solidityKeccak256(['uint256'], [siblingValue1])
    const sibling2 = ethers.utils.solidityKeccak256(['uint256'], [siblingValue2])

    sampleInput.pathHalf1 = [
      hexToNumber(leaf2.replace('0x', '').slice(0, 32)),
      hexToNumber(sibling1.replace('0x', '').slice(0, 32)),
      hexToNumber(sibling2.replace('0x', '').slice(0, 32))
    ]

    sampleInput.pathHalf2 = [
      hexToNumber(leaf2.replace('0x', '').slice(32, 64)),
      hexToNumber(sibling1.replace('0x', '').slice(32, 64)),
      hexToNumber(sibling2.replace('0x', '').slice(32, 64))
    ]

    const l12 = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      sampleInput.leafIndex % 2 === 0 ? [leaf1, leaf2]
        : [leaf2, leaf1]
    )

    const l12S1 = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      Math.floor(sampleInput.leafIndex / 2) % 2 === 0 ? [l12, sibling1]
        : [sibling1, l12]
    )

    const root = ethers.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      Math.floor(sampleInput.leafIndex / 4) % 2 === 0 ? [l12S1, sibling2]
        : [sibling2, l12S1]
    )

    sampleInput.rootHalf1 = hexToNumber(root.replace('0x', '').slice(0, 32))
    sampleInput.rootHalf2 = hexToNumber(root.replace('0x', '').slice(32, 64))
  }

  it("produces a witness with valid constraints for depth 1", async () => {
    const circuit = await makeCircuit('MPT1')

    prepareHashesDepth1()
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  });

  it("produces a witness with valid constraints for depth 2 for index 0", async () => {
    const circuit = await makeCircuit('MPT2')

    prepareHashesDepth2(2, 3)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  });

  it("produces a witness with invalid constraints for depth 2", async () => {
    const circuit = await makeCircuit('MPT2')

    prepareHashesDepth2(2, 3)
    sampleInput.leafValue = 10
    const promise = circuit.calculateWitness(sampleInput, true);
    const res = await Promise.allSettled([promise])
    expect(res[0].status).to.be.equal('rejected')
  });

  it("produces a witness with valid constraints for depth 2 for index 1", async () => {
    const circuit = await makeCircuit('MPT2')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 1
    prepareHashesDepth2(2, 3)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  });

  it("produces a witness with valid constraints for depth 2 for index 2", async () => {
    const circuit = await makeCircuit('MPT2')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 2
    prepareHashesDepth2(2, 3)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  });

  it("produces a witness with valid constraints for depth 2 for index 3", async () => {
    const circuit = await makeCircuit('MPT2')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 3
    prepareHashesDepth2(2, 3)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  });

  it("produces a witness with valid constraints for depth 3 for index 0", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 0
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 1", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 1
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 2", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 2
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 3", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 3
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 4", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 4
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 5", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 5
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 6", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 6
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })

  it("produces a witness with valid constraints for depth 3 for index 7", async () => {
    const circuit = await makeCircuit('MPT3')

    sampleInput.leafValue = 10
    sampleInput.leafIndex = 7
    prepareHashesDepth3(2, 3, 4)
    const witness = await circuit.calculateWitness(sampleInput, true);
    await circuit.checkConstraints(witness);
  })
});
