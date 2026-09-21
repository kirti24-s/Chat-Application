import ImageKit from "@imagekit/nodejs";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import process from "node:process";

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("IMAGEKIT_PRIVATE_KEY is missing from server/.env");
}

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export default imagekit;
