pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/bitify.circom";
include "./MPT-root.circom";

template LeafInclusion(depth) {
  signal input leafValue;
  signal input leafIndex;

  signal input rootHalf1;
  signal input rootHalf2;

  // private
  signal input pathHalf1[depth];
  signal input pathHalf2[depth];
  // isRight's elements are 0 for left and 1 for right sibling
  signal input isRight[depth];

  component calcRootMPT = CalcRootMPT(depth);
  calcRootMPT.leaf <== leafValue;

  for (var i = 0; i < depth; i++) {
    calcRootMPT.pathHalf1[i] <== pathHalf1[i];
    calcRootMPT.pathHalf2[i] <== pathHalf2[i];
    calcRootMPT.isRight[i] <== isRight[i];
  }

  component binaryRootHalf1 = Num2Bits(128);
  binaryRootHalf1.in <== rootHalf1;

  component binaryRootHalf2 = Num2Bits(128);
  binaryRootHalf2.in <== rootHalf2;

  var binaryRoot[256];
  for (var j = 0; j < 256; j++) {
    if(j < 128) {
      binaryRoot[j] = binaryRootHalf1.out[127 - j];
    } else {
      binaryRoot[j] = binaryRootHalf2.out[255 - j];
    }
  }

  // bytes
  for (var i = 0; i < 256 / 8; i++) {
    // bits
    for (var j = 0; j < 8; j++) {
      binaryRoot[8*i + j] === calcRootMPT.root[8*i + (7-j)];
    }
  }
}