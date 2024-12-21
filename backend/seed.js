const { Wallet } = require("xrpl");

const wallet = Wallet.generate();

console.log("Seed:", wallet.seed);
console.log("Address:", wallet.classicAddress);
