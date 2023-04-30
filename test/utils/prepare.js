const fs = require("fs/promises");
const { CircuitTestUtils } = require("hardhat-circom");

const makeCircuit = async (circuitName) => {
    const r1csFastFile = {
        type: "mem",
        data: await fs.readFile(`${circuitName}.r1cs`),
    };
    const symFastFile = {
        type: "mem",
        data: await fs.readFile(`${circuitName}.sym`),
    };
    const wasmFastFile = {
        type: "mem",
        data: await fs.readFile(`${circuitName}_js/${circuitName}.wasm`),
    };

    return new CircuitTestUtils({ r1cs: r1csFastFile, wasm: wasmFastFile, sym: symFastFile })
}

module.exports = {
    makeCircuit
}