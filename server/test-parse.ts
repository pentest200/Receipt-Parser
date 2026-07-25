import fs from "fs";
import "dotenv/config";
import { parseReceipt } from "./src/services/parseService.js";

async function run() {
  try {
    // Create a tiny dummy image (1x1 pixel transparent PNG)
    const dummyImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(dummyImageBase64, "base64");
    
    console.log("Starting parseReceipt...");
    const result = await parseReceipt(buffer, "image/png");
    console.log("Success:", result);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

run();
