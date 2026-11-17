---
name: petInterviewVideo
description: Develop pet interview themes and complete question-and-answer stories, or produce a pet interview video up to 30 seconds in Infinite Canvas. Uses aiPetShortVideoDirector for setup, development and payoff. Theme, script and prompt requests are text only; pet commerce and ordinary monologues use their dedicated skills.
metadata:
  version: "1.0.0"
  displayName: Create a Pet Interview Short Video
  author: Infinite Canvas
---

# Create a Pet Interview Short Video

Make something happen during the interview. Develop one central proposition through questions, the pet's speech and natural reactions or choices, then pay off the opening. A single punchline, disconnected questions or extra cuts cannot substitute for development. Default to one pet, one main location, 30 seconds, 9:16 and 480p; explicit user choices prevail, maximum 30 seconds in this first version. Actual model capabilities determine executable settings.

Use English for new explanations and dialogue unless another language is requested. Preserve supplied dialogue, names and fixed model syntax. The reference examples are Chinese teaching material, not a requirement to translate approved dialogue or respond in Chinese.

## Identify the requested deliverable

- Themes, script, shots or prompts only: read the relevant creative material and deliver text. Do not ask for a generation mode, create nodes or generate media. Read the adapter only when model prompts are requested; label a draft generic if the target is unknown.
- Video production: reuse established themes, assets and wording. Establish interactive or automatic mode at the start unless already chosen, then follow the execution rules below.
- Do not restart candidates for an existing theme or script, or change unrequested wording. Commerce and ordinary solo monologues use their dedicated workflows. A complete video over 30 seconds goes back to the long-video workflow; do not split it automatically.

## Read the installed director

Discover aiPetShortVideoDirector with `skillOperator(action=list)`, read its main file using the returned name and scope, and read `path=references/story.md` before themes/story. Read `references/direction.md` for blocking, shots and sound, `references/generation.md` for generation preparation and `references/review.md` for actual footage review. Without skillOperator, use available read tools and actual locations from this turn's skill catalog, not source directories or a machine-specific path.

Pass user intent, known identity and temperament, real assets, requested stage, duration, sound, known model constraints and authorization into the director method. The director returns creative deliverables without executing nodes or calling this skill back. If required director material is unavailable, identify the missing item, preserve independently deliverable user material and pause the dependent creative steps; do not pretend it was used or bypass a disabled skill.

For new interviews, also read [the three complete examples](references/interviewExamples.md) in this skill using its own name and scope. They are hypothetical teaching examples, not facts about the user's pet or verified footage. Learn the development mechanisms without enforcing one ending.

## Develop the interview

1. Separate visible identity, user-supplied habits and proposed fiction. Never claim to inspect an unreadable photo. Wait for an upload only when production depends on it; text ideation may use explicitly labeled assumptions.
2. With no supplied theme, use the director's story method to propose three candidates with different mechanisms. Include proposition, opening, the pet's position, middle change, ending, personalization and main challenge. Recommend one. Stop there for a theme-only request; expand it for a full script or production unless the user asked to choose first. Do not add another theme approval round. With an established theme or wording, expand only that.
3. Usually use four to six narrative changes: a question worth answering, an established position, evidence from a follow-up or event, a pet reaction or choice, and an ending with reaction time. Adjust to content rather than forcing a shot count. Each meaningful beat adds information or changes the situation; remove unrelated questions, redundant narration and filler.
4. Default to an off-screen interviewer and an on-screen speaking pet, with an optional visible microphone and no interviewer's face. Keep their voices and exact lines separate. Add an owner as a third off-screen speaker only when the story needs it and list that role. Speech can be anthropomorphic while anatomy remains animal; do not default to human standing, gestures or tool use.
5. Block stimulus, eyes/ears/head/body reaction, necessary action and end state before camera and sound. A visual clue may complete the joke; the words need not reveal the entire payoff alone. Allow real time for delivery, action and the ending. Time ranges are intended timing, not a promise of exact execution.
6. Check the opening question, a middle that changes interpretation, visible/audible evidence, a pet-specific reaction and an ending that answers the opening. Humor, recognition and retention require real feedback.

Brief example: a cat insists it is independent, a follow-up establishes its cool persona, keys make its body react, the owner's greeting reveals affection, and the cat requests deletion. The reference includes its full timeline and lines, plus examples of an on-site test being reinterpreted and an interviewer being trained during the interview.

A complete script includes title, proposition, duration/aspect ratio, grounded identity and temperament, recommendation rationale when applicable, complete dialogue separately, timed events/speakers/performance/necessary camera/sound, opening-to-ending relationship, asset roles, risks and acceptance criteria. Match depth to the request rather than turning themes into a production packet.

## Model adaptation and canvas

For production, discover and read videoPromptAdapter. It finalizes prompts for the exact model/version/input mode, including Seedance 2.5 non-commerce interviews. Do not use commerce templates. An unknown model permits only a provisional creative draft; finalize the actual model and adaptation before generation and interactive approval of the concrete batch. Preserve story, exact lines, speakers, identity and real reference roles. Mark uncertain performance unverified rather than silently replacing dialogue with narration or silence.

An installed older adapter may not route Seedance 2.5 non-commerce interviews to the specialized guide. Only when the actual target is Seedance 2.5 and the adapter read does not cover non-commerce interviews, use its third-party routing: discover the actual global videoPrompting skill and read its main file, sourceInfo.md and references/models/seedance25/prompting.md using the returned name and scope. Give applicable guidance and provenance to the adapter and check that its final prompt preserves exact lines, interview order, real references and speaker roles. Without skillOperator use the actual catalog and available read tool. If the matching guide cannot be read or does not cover the mode, use the generic method and explicitly mark model-specific optimization unverified. Do not claim the guide was read, overwrite the installed adapter, silently change models or omit sound. For other models, follow the adapter's exact-version and input-mode routing without reading the Seedance 2.5 guide.

Read the current canvas and available node types. Reuse this task's nodes and usable outputs. If needed, create text, pet image-generation and video-generation nodes; create a separate interview scene image node only when its reference is necessary. No product node. Do not connect text nodes to generation nodes because their contents would be appended. Query getNodeTools before writing the script, image prompts and complete video prompt through real tools.

Reuse the real uploaded pet image for the appropriate identity or starting-frame role. Do not regenerate a standard pet image automatically. Use the node's upload UI if no import tool exists; do not invent an import API. A generated scene reference must have an explicit role and pet-presence decision to avoid accidental multiple subjects.

Read node:getConfig using the actual schema, including includeModels where supported, to discover the model catalog, configuration and durationResolutionMap. Before generating images, plan using the model's declared reference types/counts, identity versus hard first-frame roles, ratio, duration, resolution and sound. While planned images have no real output, current matchingModes cannot rule out the planned image-to-video mode: identify the designated pending asset nodes and roles in the approval plan and finish connecting and configuring after outputs exist.

When assets are ready, use getCanvasNodes for both endpoints' actual ports, then connectNodes to connect the pet image and any enabled scene image outputs to the video input. Reuse suitable existing outputs; do not connect text or a disabled scene. Read back edges, upstream outputs and reference order, then query actual video matchingModes and set ratio, final script duration, resolution, mode and sound through the real schema; read settings back. Bind `{{ref N}}` using actual connections and referenceOrder, not guessed indices. If model declarations explicitly rule out the plan, or the real connected inputs do not match a necessary mode, preserve work and present executable choices without silently changing model, sound, story length or segment count.

This version generates one complete interview per video call, without automatic segmentation, composition, dubbing or subtitles. If the director recommends splitting, first simplify incidental actions. If still overloaded, explain the tradeoff for a user decision; do not erase essential causality to force one call. Multi-speaker dialogue, lips, shots and timing require actual footage review. Do not rely on generated text for essential clues.

## Authorization and execution

Interactive mode presents one reviewable batch before any media call: objects/counts, models, settings/duration, full prompts, actual or designated pending node references and roles, interviewer/pet/optional owner voices, call counts and reliable cost or compute consumption unknown. Execute after explicit approval.

Automatic mode obtains explicit initial authorization for goal, necessary image specs, video duration/ratio/resolution/sound, image/video providers and models or ordered candidates, total call limit including retries, and per-object failure retry limits. State that full prompts will be developed after authorization and consumption is unknown if no quote is available. Within that scope, record the complete plan and execute without separate theme/script/prompt approvals. Skipping, cancellation or silence does not authorize. Prompt instructions are not a programmatic budget lock.

Before calls, verify actual model, prompts, references, specs and remaining budget, reserving initial calls for other planned objects. Recheck changed content/model/assets and pause when outside or unclear. Generate only authorized, necessary missing images; retain attemptId and startedAt and await node:waitGeneration({attemptId}). Once assets are ready, connect and verify actual outputs, matchingModes, settings and references as described above, then start one video call and await its own terminal result. Old outputs and idle do not prove this attempt succeeded. Running, timeout, cancellation and unknown status do not permit duplicate generation. Reopening first reads the original attempt; closing or switching pages does not guarantee continued execution.

On explicit failure, preserve results and follow host recovery: manual history/download, or explicit authorization for the Agent to inspect this call and try one download recovery. Recovery neither generates nor adopts output. The user clicks Use Result after successful recovery. New generation for a failed object requires explicit authorization for that object and, in automatic mode, the total/object limits and other initial-call reserve. Retry budget alone never authorizes immediate regeneration.

Use available preflightCanvas and getProduction/updateProduction/verifyProduction revision records. Before bulk overwrite, use createCanvasSnapshot and stop if it fails. State missing tools without inventing another director receipt.

## Review the actual interview

Watch and listen to the full result using the director's review method. Check identity/anatomy, voice swaps, reading the other speaker's question, optional owner attribution, exact lines, lip sync, event order, middle evidence, decisive reaction, ending and pause. Review suggestions do not authorize another generation.

Report the real video node and path. Distinguish generation success, actual review and user adoption. State any missing visual/audio inspection; file existence, prompt wording and technical playback cannot replace content review.
