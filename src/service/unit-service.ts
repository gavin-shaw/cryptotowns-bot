import axios from "axios";
import { token } from "./auth-service";
import { wallet } from "./wallet-service";

export async function claimUnitUpgrades(townId: string) {
  const body = {
    address: wallet.address,
    signature: token,
    townId,
  };

  const response = await axios.post(
    "https://cryptotowns-server.herokuapp.com/claim/unit-train",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
