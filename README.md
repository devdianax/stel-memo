<div align="center">

<img src="./frontend/public/Assets/Images/Logo/sommemo-logo.png" width="80" alt="StelMemo Logo">

# StelMemo

**Decentralized crypto inheritance protocol on Stellar**

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7C3AED)](https://shannon-explorer.somnia.network)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636)](https://soliditylang.org)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ignition-F7DF1E)](https://hardhat.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

</div>

---

## What is StelMemo?

StelMemo is a decentralized application (dApp) for creating **on-chain digital wills** on the Stellar blockchain. It lets you:

1. **Designate a beneficiary** wallet address
2. **Deposit assets** (XLM native token) into a secure vault
3. **Set an inactivity period** (e.g., 30 days)
4. **Check in periodically** to prove you're active

If you fail to check in before your deadline expires, the smart contract **automatically transfers all vault assets to your beneficiary** — no intermediaries, no keepers, no trusted third parties.

The execution is handled natively by Stellar's on-chain scheduling (Reactivity precompile) — a cron-like subscription system built into the Stellar validator network.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         StelMemo Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User → Register Will (beneficiary + period)                    │
│    ↓                                                             │
│  Contract creates Schedule subscription at deadline timestamp    │
│    ↓                                                             │
│  User deposits XLM into vault                                    │
│    ↓                                                             │
│  User checks in before deadline → subscription resets            │
│    ↓                    ↓                                        │
│  [Active]           [Missed check-in]                            │
│  Continue cycle     Stellar validators trigger onEvent()         │
│                        ↓                                         │
│                      Assets → Beneficiary                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

- **Will** — On-chain record linking an owner to a beneficiary with an inactivity period
- **Vault** — Smart contract holds deposited assets per user
- **Check-In** — Transaction proving the user is still active; resets the deadline timer
- **Schedule Subscription** — A one-off time-based trigger on Stellar that fires exactly at the deadline and self-destructs
- **onEvent()** — Function called by validators when the deadline passes; executes the inheritance transfer

---

## Architecture

```
┌───────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Frontend    │────▶│  Smart Contract  │◀───▶│  Stellar Network    │
│  (Next.js)    │     │  (StelMemo.sol)  │     │  (Testnet)          │
│               │     │                  │     │                     │
│  - Landing    │     │  - Will mgmt     │     │  - Reactivity       │
│  - Dashboard  │     │  - Vault         │     │    Precompile       │
│  - Vault      │     │  - Check-in      │     │  - Schedule cron    │
│  - Check-in   │     │  - Inheritance   │     │  - Validator exec   │
│  - History    │     │  - History       │     │                     │
│  - Settings   │     └──────────────────┘     └─────────────────────┘
└───────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 |
| **State Management** | Zustand + TanStack React Query |
| **Wallet** | Wagmi v2 + Freighter (Stellar) |
| **Blockchain Lib** | viem |
| **Animations** | Framer Motion |
| **Smart Contracts** | Solidity 0.8.28 |
| **Contract Dev** | Hardhat + Ignition |
| **Testing** | Hardhat Toolbox (Mocha/Chai/Ethers) |
| **Automation** | Stellar Reactivity Precompile (on-chain cron) |

---

## Project Structure

```
stelmemo/
└── SomMemo/
    ├── README.md
    ├── frontend/                          # Next.js dApp
    │   ├── package.json
    │   ├── next.config.ts
    │   ├── public/
    │   │   └── Assets/
    │   └── src/
    │       ├── app/                       # Next.js App Router pages
    │       │   ├── (landing)/             # Landing page
    │       │   └── main/                  # Dashboard, Vault, Check-In, etc.
    │       ├── components/
    │       │   ├── ui/                    # Sidebar, shared UI
    │       │   └── pages/                 # Page-specific components
    │       │       ├── (landing)/         # Hero.tsx
    │       │       └── (main)/            # Dashboard, Vault, CheckIn, etc.
    │       ├── lib/                       # Config, hooks, ABI, chains
    │       ├── stores/                    # Zustand stores
    │       └── types/                     # TypeScript types
    └── sc/                                # Smart contracts
        ├── package.json
        ├── hardhat.config.ts
        ├── contracts/
        │   ├── StelMemo.sol               # Main contract
        │   └── mock/
        │       └── MockStellarPrecompile.sol
        ├── ignition/modules/
        │   └── StelMemo.ts
        └── test/
            └── StelMemo.test.ts
```

---

## Prerequisites

- **Node.js** 18+ (recommended: 22)
- **pnpm** (recommended) or npm
- **MetaMask** or **Freighter wallet** (Stellar)
- Testnet XLM from the [Stellar faucet](https://dream-faucet.somnia.network)

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/devdianax/stel-memo.git
cd stel-memo/SomMemo

# Install frontend deps
cd frontend && pnpm install

# Install contract deps
cd ../sc && npm install
```

### 2. Set Up Environment Variables

Create `.env` in `sc/`:

```env
PRIVATE_KEY=your_wallet_private_key
STELLAR_RPC_URL=https://dream-rpc.somnia.network
```

### 3. Run Frontend

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Compile Contracts

```bash
cd sc
npx hardhat compile
```

### 5. Run Tests

```bash
cd sc
npx hardhat test
```

---

## Smart Contract

### StelMemo.sol

The main contract is deployed at:

```
0xbfd1dBe944a69870e9f2A14AD1c74E1DC49F9F53
```

Verified on [Stellar Testnet Explorer](https://shannon-explorer.somnia.network).

#### Core Functions

| Function | Description |
|----------|-------------|
| `registerWill(beneficiary, inactivePeriodSec)` | Create a new will and schedule inheritance |
| `checkIn()` | Reset the deadline timer |
| `depositXLM()` | Deposit native XLM into vault |
| `depositToken(address, amount)` | Deposit ERC-20 tokens |
| `depositNFT(address, tokenId)` | Deposit ERC-721 NFTs |
| `withdraw()` | Withdraw all assets from vault |
| `updateBeneficiary(newBeneficiary)` | Change beneficiary address |
| `updateInactiveperiod(newPeriodSec)` | Change inactivity period |
| `deactive()` | Deactivate will and return assets |
| `getWillInfo(owner)` | View will details |
| `getStatus(owner)` | Get will status (Active/Warning/Inactive) |
| `getCheckInHistory(owner)` | View check-in history |
| `getVaultHistory(owner)` | View vault activity |

#### Key Events

| Event | Description |
|-------|-------------|
| `WillRegistered(owner, beneficiary, deadlineMs)` | New will created |
| `CheckedIn(owner, newDeadlineMs)` | User checked in |
| `WillExecuted(owner, beneficiary, executedAt)` | Inheritance executed |
| `DepositXLM(owner, amount)` | XLM deposited |
| `Withdrawn(owner, xlmAmount)` | Assets withdrawn |

---

## How Inheritance Execution Works

The key innovation is Stellar's **Reactivity Precompile** — an on-chain scheduling system:

1. When `registerWill()` is called, the contract calls the precompile's `subscribe()` function with:
   - A deadline timestamp (`deadlineMs`)
   - The contract's `onEvent` function as the handler
   - Gas parameters for execution

2. A **one-off subscription** is created. It self-destructs after firing — no recurring costs.

3. When the deadline passes, Stellar validators automatically call `onEvent()` on the contract:
   - Verifies the will is still active and not yet executed
   - Transfers all XLM, ERC-20 tokens, and NFTs to the beneficiary
   - Marks the will as executed

4. Each `checkIn()` call:
   - Creates a new subscription with the updated deadline
   - The old subscription is orphaned (self-destructs when triggered for a non-existent deadline)

> **No off-chain servers. No keepers. No bots. No trusted intermediaries.**

---

## Contributing

We welcome contributions! This project is designed to be a Drips/Wave open-source initiative. Here's how to get started:

### Good First Issues

- **UI/UX improvements** — The dashboard, vault, and settings pages
- **Landing page polish** — Animations, copy, responsive design
- **Test coverage** — More edge cases for the smart contract
- **Documentation** — Better README, contributor guides
- **Asset support** — Enable ERC-20 and NFT deposit in the frontend

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run linting (`cd frontend && pnpm lint`)
5. Run tests (`cd sc && npx hardhat test`)
6. Commit (`git commit -m "feat: add amazing feature"`)
7. Push and open a PR

### Code Style

- TypeScript with strict mode
- Biome for linting and formatting
- Follow existing patterns in the codebase
- Smart contract follows Solidity best practices (checks-effects-interactions)

---

## Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Smart Contract

```bash
cd sc
npx hardhat ignition deploy ./ignition/modules/StelMemo.ts --network stellar
```

---

## Environment Variables

### Frontend

No environment variables are required for the frontend — the contract address and RPC URL are hardcoded.

### Smart Contract (`sc/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PRIVATE_KEY` | Wallet private key for deployment | — |
| `STELLAR_RPC_URL` | Stellar testnet RPC | `https://dream-rpc.somnia.network` |

---

## Roadmap

- [x] XLM deposits and inheritance
- [ ] ERC-20 token support (contract ready, UI disabled)
- [ ] ERC-721 NFT support (contract ready, UI disabled)
- [ ] Multiple beneficiaries with percentage splits
- [ ] Email/notification reminders before deadline
- [ ] Dark mode
- [ ] WalletConnect support

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>Built for the Stellar ecosystem</p>
  <p>
    <a href="https://github.com/devdianax/stel-memo/issues">Report Bug</a>
    ·
    <a href="https://github.com/devdianax/stel-memo/issues">Request Feature</a>
  </p>
</div>
