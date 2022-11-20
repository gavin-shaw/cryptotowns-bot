import axios from "axios";
import { provider } from './provider-service';
import { post } from "./rest-service";
import { wallet } from "./wallet-service";

export let token: string = "";

export async function authenticate() {

    const blockNumber = await provider.getBlockNumber()
    const signature = await wallet.signMessage(JSON.stringify({ blockNumber }))
    
    const data = await post("jwt/issue-token", { blockNumber, signature })
    
    token = data.signature;
}