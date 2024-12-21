# Hackathon - Preserving Lands Through NFTs on XRP Ledger

This project issues NFTs as symbolic digital assets representing preservation certificates for landowners who commit to protecting their properties. Each NFT is unique and reflects the specific characteristics of the protected land, promoting land preservation through a digital record on the blockchain. Additionally, the project introduces tokens that enable direct investments in the preserved lands, fostering the development of sustainable infrastructure.

Landowners who join the network by either purchasing land for protection or committing to preserve existing property will receive a verified NFT. This NFT serves as a certificate of preservation, detailing the specific attributes of the land. Furthermore, it provides access to the Protectors of the Forest DAO, a decentralized community advocating for environmental conservation.

## Features

- Upload images to IPFS via Pinata.
- Store metadata as JSON on IPFS via Pinata.
- Mint NFTs on the XRPL testnet representing preservation certificates.

## Prerequisites

### Requirements

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- Yarn or NPM
- An account on [Pinata](https://www.pinata.cloud/).
- A wallet seed for XRPL (testnet).

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/vivipolli/xrp-ledger-hackathon.git
   cd xrp-ledger-hackathon
   ```

2. Create a `.env` file inside the backend folder with the following variables:

   ```env
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_API_KEY=your_pinata_secret_api_key
   SEED=your_xrpl_testnet_seed
   ACCOUNT_ADDRESS=your_xrpl_testnet_account
   ```

   And another `.env` file inside the frontend:

   ```env
   REACT_APP_BACKEND_URL=http://localhost:3000
   ```

3. Install dependencies:

   Backend:

   ```bash
   cd backend
   npm install

   ```

   Frontend

   ```bash
   cd frontend
   npm install

   ```

## Generating a New XRPL Seed

If you do not have a wallet seed, you can generate one using the `seed.js` script provided:

```bash
node seed.js
```

This will output a new seed and wallet address. Use the seed to fund the wallet using the [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html).

## Running the Server

1. Start the server:
   ```bash
   cd backend
   node server.js
   ```
2. The server will run at `http://localhost:3000`.

## Running the Client

```bash
cd frontend
npm run dev
```

## API Endpoints

### Mint NFT

- **Endpoint:** `POST /mint-nft`
- **Description:** Uploads an image and metadata to IPFS via Pinata and mints an NFT on the XRPL.
- **Headers:**
  - `Content-Type: multipart/form-data`
- **Form Data:**
  - `image`: The image file to be uploaded.
  - `coberturaVegetal`: Percentage of vegetation cover.
  - `hectares`: Number of hectares.
  - `atributosEspecificos`: Specific attributes of the area.
  - `corposAgua`: Number of water bodies.
  - `nascentes`: Number of springs.
  - `projetos`: Ongoing projects.

#### Example Request

```bash
curl -X POST http://localhost:3000/mint-nft \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path_to_image.jpg" \
  -F "coberturaVegetal=80" \
  -F "hectares=100" \
  -F "atributosEspecificos=Biodiversity hotspot" \
  -F "corposAgua=2" \
  -F "nascentes=1" \
  -F "projetos=Forest restoration"
```

#### Example Response

```json
{
  "message": "NFT gerado e emitido com sucesso!",
  "metadataURI": "ipfs://<ipfs_hash_of_metadata>",
  "mintResponse": { ...transaction_details... }
}
```

## Code Overview

### Key Functions

#### `uploadToPinata`

Uploads a file to IPFS via Pinata.

#### `uploadJSONToPinata`

Uploads metadata JSON to IPFS via Pinata.

#### `mintNFT`

Mints an NFT on the XRPL testnet using the provided metadata URI.

### `seed.js`

A utility script to generate a new XRPL wallet seed and address.

## Error Handling

If an error occurs during any step, a detailed error message will be logged to the console and returned in the API response.

## Presentation for Hackathon

This project is designed to tackle environmental challenges by leveraging blockchain technology. It combines the transparency and immutability of the XRPL with the decentralized storage of IPFS to:

1. Incentivize landowners to protect their properties through the issuance of digital preservation certificates.
2. Enable a new model for sustainable investments through tokens linked to preserved areas.
3. Foster a collaborative community via the Protectors of the Forest DAO.

By participating in this project, stakeholders can contribute to global efforts for biodiversity conservation and sustainable development, using innovative Web3 solutions.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.
