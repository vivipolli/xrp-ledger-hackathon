const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { Client, Wallet } = require("xrpl");

require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

async function uploadToPinata(filePath, fileName) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const data = new FormData();
  data.append("file", fs.createReadStream(filePath), fileName);

  const headers = {
    ...data.getHeaders(),
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_API_KEY,
  };

  const response = await axios.post(url, data, { headers });
  return response.data;
}

async function uploadJSONToPinata(jsonData) {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  const headers = {
    "Content-Type": "application/json",
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_API_KEY,
  };

  const response = await axios.post(url, jsonData, { headers });
  return response.data;
}

async function mintNFT(metadataURI) {
  const client = new Client("wss://s.altnet.rippletest.net/");
  await client.connect();

  const wallet = Wallet.fromSeed(process.env.SEED);

  console.log("Endereço da carteira:", wallet.classicAddress);
  const transaction = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: metadataURI,
    Flags: 8,
    NFTokenTaxon: 0,
  };

  const response = await client.submitAndWait(transaction, { wallet });
  console.log("NFT emitido:", response);
  return response;
}

app.post("/mint-nft", upload.single("image"), async (req, res) => {
  try {
    const {
      coberturaVegetal,
      hectares,
      atributosEspecificos,
      corposAgua,
      nascentes,
      projetos,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Imagem é obrigatória!" });
    }

    const imagePath = path.resolve(req.file.path);
    const imageResponse = await uploadToPinata(
      imagePath,
      req.file.originalname
    );

    const imageIPFS = `ipfs://${imageResponse.IpfsHash}`;

    const metadata = {
      name: "Certificado de Preservação",
      description: "NFT que certifica a preservação de uma área protegida.",
      image: imageIPFS,
      attributes: [
        { trait_type: "Cobertura Vegetal (%)", value: coberturaVegetal },
        { trait_type: "Número de Hectares", value: hectares },
        { trait_type: "Atributos Específicos", value: atributosEspecificos },
        { trait_type: "Número de Corpos d'Água", value: corposAgua },
        { trait_type: "Número de Nascentes", value: nascentes },
        { trait_type: "Projetos em Desenvolvimento", value: projetos },
      ],
    };

    const metadataResponse = await uploadJSONToPinata(metadata);

    fs.unlinkSync(imagePath);

    const metadataURI = `ipfs://${metadataResponse.IpfsHash}`;
    const hexURI = Buffer.from(metadataURI).toString("hex");

    const mintResponse = await mintNFT(hexURI);

    res.status(200).json({
      message: "NFT gerado e emitido com sucesso!",
      metadataURI: metadataURI,
      mintResponse: mintResponse,
    });
  } catch (error) {
    console.error("Erro ao gerar NFT:", error);
    res
      .status(500)
      .json({ error: "Erro ao gerar NFT", details: error.message });
  }
});

app.get("/nfts", async (req, res) => {
  const client = new Client("wss://s.altnet.rippletest.net/");
  try {
    await client.connect();

    const account = process.env.ACCOUNT_ADDRESS;

    const response = await client.request({
      command: "account_nfts",
      account: account,
    });

    res.json(response.result.account_nfts);
  } catch (error) {
    console.error("Erro ao buscar NFTs:", error);
    res
      .status(500)
      .json({ error: "Erro ao buscar NFTs", details: error.message });
  } finally {
    client.disconnect();
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
