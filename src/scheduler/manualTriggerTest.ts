// This file is not part of the real product. Greenlight normally
// gets triggered by real YouTube data through checkPerformance.ts,
// automatically, with no human involved. This file skips that and
// just sends Greenlight a fake "your video is doing great" message
// directly, so we could test how Greenlight reacts without waiting
// for a real video to actually perform well enough to trigger it.
//
// Run it manually with: npx tsx src/scheduler/manualTriggerTest.tsts

import "dotenv/config";
import { notifyGreenlight } from "../minds/client.js";

const testMessage =
  'New performance update: "15-Minute Pasta Race" has 4,800 views, well above this creator\'s recent average. Suggest 1-2 follow-up video ideas while the topic is hot.';

await notifyGreenlight(testMessage);
console.log("Test trigger sent.");