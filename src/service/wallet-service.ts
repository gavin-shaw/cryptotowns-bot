import { ethers } from "ethers";

export const wallet = ethers.Wallet.fromMnemonic(process.env.PHRASE!);
