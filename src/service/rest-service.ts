import axios from "axios";
import { token } from "./auth-service";
import { wallet } from "./wallet-service";

const BASE_URL =
  process.env.REST_BASE_URL ?? "https://cryptotowns-server.herokuapp.com";

export async function post(resource: string, body: Record<string, any>) {
  body.address = wallet.address;

  if (token) {
    body.signature = token;
    const response = await axios.post(`${BASE_URL}/${resource}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  const response = await axios.post(`${BASE_URL}/${resource}`, body);

  return response.data;
}
