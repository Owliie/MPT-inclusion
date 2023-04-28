pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/bitify.circom";
include "./vocdoni-keccak256/keccak.circom";
include "./utils.circom";

template CalcRootMPT(depth) {
  signal input leaf;
  signal input leafIndex;
  signal input pathHalf1[depth];
  signal input pathHalf2[depth];

  // root is 256 bits array
  signal output root[256];

  component tree_root[depth+1];
  tree_root[0] = Keccak(256, 256);

  component leafBits = Num2Bits(256);
  leafBits.in <== leaf;

  var reversedLeafBits[256];

  for(var i = 255; i >= 0; i--){
    reversedLeafBits[255-i] = leafBits.out[i];
  }

  // bytes
  for (var i = 0; i < 32; i++) {
    // bits
    for (var j = 0; j < 8; j++) {
      tree_root[0].in[8*i + (7-j)] <== reversedLeafBits[8*i + j];
    }
  }

  component binaryPathHalf1[depth];
  component binaryPathHalf2[depth];

  component remainder[depth];

  var index = leafIndex;

  for (var i = 1; i <= depth; i++) {
    binaryPathHalf1[i-1] = Num2Bits(128);
    binaryPathHalf1[i-1].in <== pathHalf1[i-1];

    binaryPathHalf2[i-1] = Num2Bits(128);
    binaryPathHalf2[i-1].in <== pathHalf2[i-1];

    var binaryPath[256];
    for (var j = 0; j < 256; j++) {
      if(j < 128) {
        binaryPath[j] = binaryPathHalf1[i-1].out[127 - j];
      } else {
        binaryPath[j] = binaryPathHalf2[i-1].out[255 - j];
      }
    }

    tree_root[i] = Keccak(512, 256);

    remainder[i-1] = isOdd();
    remainder[i-1].in <== index;

    // bytes
    for (var k = 0; k < 32; k++) {
      // bits
      for (var j = 0; j < 8; j++) {
        tree_root[i].in[8*k + j] <== tree_root[i-1].out[8*k + j] - (remainder[i-1].out) * (tree_root[i-1].out[8*k + j] - binaryPath[8*k + (7-j)]);
        tree_root[i].in[8*k + j + 256] <== binaryPath[8*k + (7-j)] - (remainder[i-1].out) * (binaryPath[8*k + (7-j)] - tree_root[i-1].out[8*k + j]);
      }
    }

    index = (index - remainder[i-1].out) / 2;
  }

  for (var i = 0; i < 256; i++) {
    root[i] <== tree_root[depth].out[i];
  }
}