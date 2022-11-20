import axios from "axios";
import { provider } from './provider-service';
import { wallet } from "./wallet-service";

export let token: string = "";

export async function authenticate() {

    const address = await wallet.getAddress()
    const blockNumber = await provider.getBlockNumber()
    const signature = await wallet.signMessage(JSON.stringify({ blockNumber }))
    
    const body = {
        address,
        blockNumber,
        signature
    }
    
    const response = await axios.post("https://cryptotowns-server.herokuapp.com/jwt/issue-token", body)

    token = response.data.signature;
}