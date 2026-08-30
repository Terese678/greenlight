# Greenlight

**Built for Creative Minds Jam #1: Hong Kong — Audience Growth & Engagement track.**

**[Live landing page →](https://terese678.github.io/greenlight/landing/)**

## How this started

Every creator has the same 11pm problem: three video ideas, one
upload slot, no real way to know which one is worth the time. Most
tools that claim to help just guess at "what's viral" in general,
they don't know *your* channel, *your* audience, or what's already
worked for you specifically.

The idea for Greenlight was simple: what if the agent actually
remembered? Not a chatbot you re-explain your channel to every time,
but something that watches what you make, learns what your specific
audience responds to, and tells you the truth about a new idea
before you spend a weekend shooting it.

That's the whole pitch. Everything else in this repo is in service
of that one idea.

## The treatment

Before writing any code, the product was mapped out like a film
treatment, three acts, each one a real state the agent moves
through, not a marketing metaphor bolted on afterward.

**Act One — Hold.** A brand-new creator shows up with zero history.
Greenlight doesn't guess blind. It asks about their niche, who they
admire, and why, then gives a first opinion, clearly labeled as
general guidance, not a score.

**Act Two — Standby.** A few videos in, real results start coming
back. Greenlight tells the creator plainly when it's made the
switch, from general advice to reading their own numbers.

**Act Three — Go.** Greenlight is watching now, not waiting.
When a video breaks out, it reaches out first, unprompted, with a
follow-up idea while the topic's still hot.

Those three acts are the literal architecture. The landing page
(`landing/index.html`) makes this visible, a cue-light panel that
actually changes color as you scroll through them.

## Building it, in order

**1. The skeleton first.** Before any of Greenlight's actual
behavior existed, the orchestration shell did, a place for Minds
credentials, a YouTube client, and a scheduler with nothing to
schedule yet. Get the plumbing working before deciding what flows
through it.

**2. The realization: Minds isn't a library you code against.**
The first instinct was to write Greenlight's reasoning in
TypeScript, an `if/else` for cold start, a scoring function, the
usual. That's wrong for this platform. Minds Skills are built
conversationally, you describe the behavior to your Mind, and it
assembles the reasoning, memory, and playbook itself. The repo's
actual job shrank to something narrower and more honest: orchestrate
around Greenlight, don't try to be its brain.

**3. Teaching Act One, Two, and Three together.** The Idea Scoring
skill was built as a single conversation with Greenlight, and it
turned out to be one Skill, not several: cold-start onboarding, the
switch to personalized mode, and the proactive breakout follow-up
all live inside it as branches of one behavior, not separate
features. See `src/skills/idea-scoring-skill.md` for the exact
prompts used.

**4. Wiring the eyes.** `src/youtube/client.ts` pulls a channel's
recent videos and compares the newest one against the creator's own
average, real data, not a vibe.

**5. Proving the proactive branch actually fires.** A synthetic
trigger test (`src/scheduler/testProactiveTrigger.ts`) sent
Greenlight a fabricated "this video is outperforming" message, the
same shape our real code sends, without waiting for a real video to
naturally cross the threshold. Greenlight replied with two specific,
differentiated follow-up ideas and its own reasoning for ranking
them, confirming the whole loop works end to end.

**6. Publishing to the Bazaar.** Idea Scoring is now listed in the
Minds Bazaar, any creator can find and equip it on their own Mind
directly, no manual prompt-copying required. This came out of a real
onboarding test: getting a second person a fully personalized
instance of Greenlight required four manual steps, sign up, launch a
Mind, paste two prompts, then talk to it, which is real friction for
anyone who isn't a developer. Publishing closes that gap.

## Architecture

```
greenlight/
├── src/
│   ├── minds/       # wrapper around @animocabrands/minds-client-lib
│   ├── youtube/     # YouTube Data API client, pulls video stats
│   ├── scheduler/   # polls performance data, triggers proactive follow-up
│   ├── skills/      # the exact prompts used to build Greenlight's
│   │                  Skill conversationally, for reproducibility
│   └── index.ts     # orchestration entry point
└── landing/
    └── index.html   # the product's own explanation of itself
```

Minds handles Greenlight's memory, reasoning, and conversation
history directly, that isn't code in this repo. This is the
orchestration layer around it: the backend that watches YouTube and
feeds Greenlight facts. The creator never sees this code or any
dashboard, they just experience Greenlight occasionally messaging
them out of nowhere with a smart follow-up. That's the autonomous
behavior this track is judging for, made real, not simulated.

The actual product surface is Telegram (or the Minds web app),
talking to Greenlight directly. There's no separate custom screen
for the conversation itself, the chat *is* the product.

## How this scales

Idea Scoring is live in the Minds Bazaar today, any creator can find
it and equip it on their own Mind directly. That's the real
distribution path: not "everyone messages this one Mind," but each
creator launching their own (seconds, no code) and installing the
same Skill onto it.

`src/skills/idea-scoring-skill.md` still documents the exact prompts
used to build it from scratch, kept for reproducibility and for
anyone who'd rather build their own version than install this one.

Along the way, we also found and fixed a real responsiveness gap
for non-owner users, see "Known limitations", the kind of thing
worth catching before real creators, not just the builder, are
actually talking to it.

What's still local-only, and honestly unbuilt, is the orchestration
side: `src/youtube/client.ts` currently points at one hardcoded
channel. Making that multi-tenant, each creator connecting their own
channel to their own Mind, is real, scoped work, not a platform
blocker. That's the next build, not a gap in this one.

## Known limitations

- **Non-steward reply delay, found and fixed mid-build.** Greenlight
  originally only checked messages from its steward in real time;
  everyone else was only seen on a 24-hour check-in cycle, so a
  second person's messages could sit for hours before a reply. This
  was discovered when a second person testing the bot got delayed,
  batched replies. Once identified, Greenlight shortened its
  check-in cadence for any active conversation to one hour, a real
  improvement, though not instant the way owner messages are. The
  fix was conversational, not a code change, since this behavior
  lives in the Skill, not this repo.
- **Cognition is a real constraint.** Skill-building and sustained
  conversation drain a Mind's Cognition balance meaningfully. Budget
  for this if extending the project.
- **Single-channel backend.** See "How this scales" above.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `MINDS_BUILDER_API_KEY` from your hellominds.ai builder console
   - `GREENLIGHT_MIND_ID` from Greenlight's profile page
   - `YOUTUBE_API_KEY` from Google Cloud Console
   - `YOUTUBE_CHANNEL_ID` for the creator being tracked
3. Run:
   ```
   npm run dev
   ```

## Status

Built end to end for the Creative Minds Jam submission deadline
(Aug 28, 2026). Both Skills are built, equipped, and tested against
real conversation and a real YouTube channel.