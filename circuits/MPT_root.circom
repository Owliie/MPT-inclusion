pragma circom 2.0.3;

include "./vocdoni-keccak256/keccak.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template CalcRootMPT(depth) {
  signal input leaf;
  signal input pathHalf1[depth];
  signal input pathHalf2[depth];

  signal input isRight[depth];

  // root is 256 bits array
  signal output root[256];

  component tree_root[depth+1];
  tree_root[0] = Keccak(256, 256);
  // component rootA = Keccak(256, 256);

  component leafBits = Num2Bits(256);
  leafBits.in <== leaf;

  for (var i = 0; i < 256; i++) {
    tree_root[0].in[i] <== leafBits.out[i];
    // rootA.in[i] <== 1;
  }

  component binaryPathHalf1[depth];
  component binaryPathHalf2[depth];

  for (var i = 1; i <= depth; i++) {
    isRight[i-1] * (isRight[i-1] - 1) === 0;

    binaryPathHalf1[i-1] = Num2Bits(128);
    binaryPathHalf1[i-1].in <== pathHalf1[i-1];

    binaryPathHalf2[i-1] = Num2Bits(128);
    binaryPathHalf2[i-1].in <== pathHalf2[i-1];

    var binaryPath[256];
    for (var j = 0; j < 256; j++) {
      if(j < 128) {
        binaryPath[j] = binaryPathHalf1[i-1].out[j];
      } else {
        binaryPath[j] = binaryPathHalf2[i-1].out[j-128];
      }
    }

    tree_root[i] = Keccak(512, 256);
    for (var j = 0; j < 256; j++) {
      tree_root[i].in[j] <== binaryPath[j] - isRight[i-1] * (binaryPath[j] - tree_root[i-1].out[j]);
      tree_root[i].in[j+256] <== tree_root[i-1].out[j] - isRight[i-1] * (tree_root[i-1].out[j] - binaryPath[j]);
    }
  }

  for (var i = 0; i < 256; i++) {
    root[i] <== tree_root[depth].out[i];
  }
}