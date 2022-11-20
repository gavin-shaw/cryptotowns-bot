import { ethers, providers } from "ethers";

export let blockNumber = 0;
export const provider: providers.BaseProvider = ethers.getDefaultProvider();

export async function initProvider() {
  blockNumber = await provider.getBlockNumber();
}
