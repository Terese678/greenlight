import { getRecentVideoStats, isOutperforming } from "../youtube/client.js";
import { notifyGreenlight } from "../minds/client.js";

// Run on a schedule. Compares the latest video against the creator's
// own recent average and, if it's outperforming, hands Greenlight the
// fact so it can decide what to suggest. This is what satisfies the
// "autonomous follow-up" requirement, we trigger it, Greenlight acts.
export async function checkPerformanceAndNotify(): Promise<void> {
  const videos = await getRecentVideoStats(10);
  if (videos.length === 0) return;

  const [latest, ...history] = videos;
  if (!isOutperforming(latest, history)) return;

  const message = `New performance update: "${latest.title}" has ${latest.viewCount} views, well above this creator's recent average. Suggest 1-2 follow-up video ideas while the topic is hot.`;

  await notifyGreenlight(message);
}