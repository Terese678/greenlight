import "dotenv/config";
import { checkPerformanceAndNotify } from "./scheduler/checkPerformance.js";
import { getGreenlightCognitionBalance } from "./minds/client.js";

async function main() {
  // Cognition is what lets Greenlight reason at all; checking first
  // avoids a confusing failure deep inside the Minds client if it's
  // already empty.
  const balance = await getGreenlightCognitionBalance();
  console.log(`Cognition balance: ${balance}`);

  if (balance <= 0) {
    console.warn("Greenlight is out of Cognition. Top up before running checks.");
    return;
  }

  await checkPerformanceAndNotify();
  console.log("Performance check complete.");
}

main().catch((err) => {
  console.error("Greenlight orchestration failed:", err);
  process.exit(1);
});