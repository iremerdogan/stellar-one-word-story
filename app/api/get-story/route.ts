import { NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_STELLAR_PUBLIC_KEY!;

    const transactions = await server
      .transactions()
      .forAccount(publicKey)
      .order("asc")
      .limit(200)
      .call();

    const words = transactions.records
      .filter((tx) => tx.memo_type === "text" && tx.memo)
      .map((tx) => tx.memo as string);

    return NextResponse.json({ words });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}