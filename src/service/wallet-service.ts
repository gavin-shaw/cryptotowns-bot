import { ethers } from "ethers";
import { WALLET_PHRASE } from "./config-service";

export const wallet = ethers.Wallet.fromMnemonic(WALLET_PHRASE!);
