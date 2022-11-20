import axios from "axios";
import { token } from "./auth-service";
import { wallet } from "./wallet-service";

export async function claimBuildingUpgrades(townId: string) {
  const body = {
    address: wallet.address,
    signature: token,
    townId,
  };

  const response = await axios.post(
    "https://cryptotowns-server.herokuapp.com/claim/building-upgrade",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function upgradeBuilding(
  townId: string,
  buildingName: string,
  buildingToTier: number
) {
  const body = {
    address: wallet.address,
    buildingName,
    buildingToTier,
    signature: token,
    townId,
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
