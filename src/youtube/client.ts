import { google } from "googleapis";

const apiKey = process.env.YOUTUBE_API_KEY;
const rawChannelId = process.env.YOUTUBE_CHANNEL_ID;

if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set.");
if (!rawChannelId) throw new Error("YOUTUBE_CHANNEL_ID is not set.");

const channelId: string = rawChannelId;
const youtube = google.youtube({ version: "v3", auth: apiKey });

export interface VideoStats {
  videoId: string;
  title: string;
  viewCount: number;
}

// Pulls recent videos with their current view counts. This is the
// raw data Greenlight compares new ideas against.
export async function getRecentVideoStats(maxResults = 10): Promise<VideoStats[]> {
  const channel = await youtube.channels.list({
    part: ["contentDetails"],
    id: [channelId],
  });

  const uploadsPlaylistId =
    channel.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist.");

  const playlist = await youtube.playlistItems.list({
    part: ["contentDetails"],
    playlistId: uploadsPlaylistId,
    maxResults,
  });

  const videoIds = (playlist.data.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) return [];

  const videos = await youtube.videos.list({
    part: ["statistics", "snippet"],
    id: videoIds,
  });

  return (videos.data.items ?? []).map((item) => ({
    videoId: item.id!,
    title: item.snippet?.title ?? "Untitled",
    viewCount: Number(item.statistics?.viewCount ?? 0),
  }));
}

// True when the latest video clears the creator's own recent average
// by the given multiplier, this is what triggers the proactive follow-up.
export function isOutperforming(
  latest: VideoStats,
  history: VideoStats[],
  thresholdMultiplier = 1.5
): boolean {
  const previous = history.filter((v) => v.videoId !== latest.videoId);
  if (previous.length === 0) return false;

  const average = previous.reduce((sum, v) => sum + v.viewCount, 0) / previous.length;
  return latest.viewCount >= average * thresholdMultiplier;
}