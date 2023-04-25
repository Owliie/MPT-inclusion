pragma circom 2.0.3;

include "./MPT-inclusion.circom";

component main {public [leafValue, leafIndex, rootHalf1, rootHalf2]} = LeafInclusion(2);