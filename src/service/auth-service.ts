import axios from "axios"
import { getWallet } from "./wallet-service"
import { provider } from './provider-service';

export async function authenticate() {
    const wallet = getWallet()

    const address = await wallet.getAddress()
    const blockNumber = await provider.getBlockNumber()
    const signature = await wallet.signMessage(JSON.stringify({ blockNumber }))
    
    const body = {
        address,
        blockNumber,
        signature
    }
    
    const response = await axios.post("https://cryptotowns-server.herokuapp.com/jwt/issue-token", body)

    const { signature: token } = response.data;

    return token;
}