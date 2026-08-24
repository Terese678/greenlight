# Skill: Proactive Follow-Up

This Skill is what satisfies the "autonomous follow-up" requirement:
Greenlight takes action without being prompted, based on new data
our orchestration code hands it (see src/scheduler/checkPerformance.ts).

## How it works

1. Our TypeScript backend polls YouTube stats on a schedule.
2. When a video is significantly outperforming the creator's recent
   average, our code sends Greenlight a message describing the fact,
   not a scripted suggestion, just the data.
3. Greenlight reasons about it and reaches out to the creator itself
   with 1-2 follow-up idea suggestions while the topic is still
   relevant.

## Prompt used to build this Skill

Build me a Skill called "Proactive Follow-Up". When I send you a
message telling you that one of the creator's videos is
outperforming their recent average, reach out to the creator
yourself with 1-2 follow-up video ideas related to that video's
topic, explained in your own words. Don't just repeat the topic
back, actually suggest a next angle or format.

If I send you this kind of update more than once in the same day,
don't repeat yourself, just check in once.

## Verified with a manual test

Confirmed working via `src/scheduler/manualTriggerTest.ts`, a
synthetic trigger simulating a real outperforming video. Greenlight
replied with two specific, differentiated follow-up ideas and its
own reasoning for ranking them, without any further prompting.

## Self-reported extension

Greenlight also added a self-reported version of this loop on its
own initiative: if a creator tells it directly that a video did
unusually well, it records the topic and date, then follows up
within 7 days with a related idea, without re-pinging the same topic
twice. This complements, but doesn't replace, the automatic YouTube
polling trigger above.