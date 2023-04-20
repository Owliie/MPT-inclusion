pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/bitify.circom";
include "./MPT_root.circom";

template LeafInclusion(depth) {
  signal input leafValue;
  signal input leafIndex;
  // root hash split into 2x128 bits value
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

  component rootHalf1Bits = Num2Bits(128);
  rootHalf1Bits.in <== rootHalf1;

  component rootHalf2Bits = Num2Bits(128);
  rootHalf2Bits.in <== rootHalf2;

  for (var i = 0; i < 128; i++) {
    rootHalf1Bits.out[i] === calcRootMPT.root[i];
    rootHalf2Bits.out[i] === calcRootMPT.root[i + 128];
  }
}

component main {public [leafValue, leafIndex, rootHalf1, rootHalf2]} = LeafInclusion(2);