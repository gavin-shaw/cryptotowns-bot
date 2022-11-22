import axios, { AxiosError } from "axios";
import { REST_BASE_URL } from "../config";
import { token } from "./auth-service";
import { debug } from "./log-service";
import { wallet } from "./wallet-service";

export async function post<T>(
  resource: string,
  body: Record<string, any>
): Promise<T> {
  const url = `${REST_BASE_URL}/${resource}`;

  debug(`POST: ${url}`);

  body.address = wallet.address;

  try {
    if (token) {
      body.signature = token;
      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data as T;
    }

    const response = await axios.post(url, body);

    return response.data as T;
  } catch (e) {
    if (e instanceof AxiosError) {
      throw e.response?.data;
    }

    throw e;
  }
}

export async function get<T>(resource: string): Promise<T> {
  const url = `${REST_BASE_URL}/${resource}`;

  debug(`GET: ${url}`);

  try {
    // TODO: we might need auth here later, not yet though
    const response = await axios.get(url);

    return response.data as T;
  } catch (e) {
    if (e instanceof AxiosError) {
      throw e.response?.data;
    }

    throw e;
  }
}
