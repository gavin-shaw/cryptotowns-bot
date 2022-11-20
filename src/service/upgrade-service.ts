import { getWallet } from "./wallet-service";
import axios from "axios";

export async function upgradeBuilding(
  buildingName: string,
  buildingToTier: number,
  token: string
) {
  const wallet = getWallet();

  const body = {
    address: wallet.address,
    buildingName,
    buildingToTier,
    signature: token,
    townId: "7b46d129-4883-4706-b800-772d375f717f",
  };

  const response = await axios.post(
    "https://cryptotowns-server.herokuapp.com/queue/building-upgrade",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
