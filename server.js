import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import ImageKit from "@imagekit/nodejs";
import { fileURLToPath } from "node:url";
import process from "node:process";

dotenv.config({
  path: fileURLToPath(new URL("./server/.env", import.meta.url)),
});

const requiredEnvironment = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

for (const variable of requiredEnvironment) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is missing from server/.env`);
  }
}

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

app.disable("x-powered-by");
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({ status: "ok", service: "chat-app-server" });
});

app.get("/api/imagekit-auth", (_request, response) => {
  const authentication = imagekit.helper.getAuthenticationParameters();
  response.json({
    ...authentication,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});