export const TOWN_TOKEN_IDS: number[] = process.env
  .TOWN_TOKEN_ID!.trim()
  .split(",")
  .map((id) => Number(id));

export const WALLET_PHRASE: string = process.env.WALLET_PHRASE!;
