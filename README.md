# One Word Story — Stellar dApp

A collaborative storytelling dApp built on the Stellar blockchain. Every word submitted by a user is permanently written to the Stellar Testnet as a transaction memo. Together, users build a story that lives forever on the blockchain.

## What Makes It Unique

Traditional apps store data on centralized servers that can be modified or deleted. One Word Story writes each word directly to the Stellar blockchain — immutable, transparent, and permanent. No database. No central authority. Just a story that grows one word at a time.

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Blockchain:** Stellar Testnet
- **Wallet:** Freighter Browser Extension
- **SDK:** @stellar/stellar-sdk, @stellar/freighter-api

## How It Works

1. User connects their Freighter wallet
2. User types a single word and clicks Submit
3. A Stellar transaction is created with the word as a memo
4. Freighter prompts the user to sign the transaction
5. The signed transaction is submitted to Stellar Testnet
6. The word appears in the shared story, permanently

## Setup & Installation

### Prerequisites

- Node.js v18 or higher
- npm
- [Freighter Wallet](https://freighter.app) browser extension
- A Stellar Testnet account funded via [Friendbot](https://friendbot.stellar.org)

### Installation
```bash
git clone https://github.com/iremerdogan/stellar-one-word-story
cd stellar-one-word-story
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_STELLAR_PUBLIC_KEY=your_stellar_public_key
STELLAR_SECRET_KEY=your_stellar_secret_key
```

### Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Install the [Freighter](https://freighter.app) browser extension
2. Create or import a Stellar wallet in Freighter
3. Switch Freighter to **Testnet**
4. Fund your testnet account at [https://friendbot.stellar.org](https://friendbot.stellar.org)
5. Visit the app, connect your wallet, and add your word to the story

## Live Demo

[\[Coming soon\]](https://stellar-one-word-story.vercel.app)

## License

MIT