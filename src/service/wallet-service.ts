import { ethers } from "ethers";

export function getWallet() {
    const wallet = ethers.Wallet.fromMnemonic(process.env.PHRASE!)
    return wallet;
}