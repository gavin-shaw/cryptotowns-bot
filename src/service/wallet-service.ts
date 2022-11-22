import { ethers } from "ethers";
import { WALLET_PHRASE } from "../config";

export const wallet = ethers.Wallet.fromMnemonic(WALLET_PHRASE!);
