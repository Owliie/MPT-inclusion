pragma circom 2.0.3;

template isOdd() {
    signal input in;
    signal output out;

    out <-- (in >> 0) & 1;
    out * (out - 1) === 0;
}