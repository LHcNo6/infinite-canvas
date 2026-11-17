---
name: petHomeMishapVideo
description: Develop themes, domestic mishap stories, shots or prompts for pets hiding objects, making a mess while fixing one, or waking their owner; or produce a video up to 30 seconds in Infinite Canvas. Uses aiPetShortVideoDirector for creation and sd25-pe for Seedance 2.5 finalization. Text requests do not generate media; interviews, solo jokes and commerce use their dedicated skills.
metadata:
  version: "1.0.0"
  displayName: Create a Pet Household Mishap Short Video
  author: Infinite Canvas
---

# Create a Pet Household Mishap Short Video

Give the pet a domestic goal, an action, an obstacle, a changed approach, an unexpected result and an ending that returns to the opening. Pet choices and visible changes drive the story; short lines express excuses, explanations or negotiation. Default to one pet, one main location, 9:16 and 480p, with duration derived from useful content, at most 30 seconds. Explicit choices and actual model capabilities prevail. Keep animal anatomy and natural movement; default to an off-screen owner, with only a hand or foot visible if needed, without requiring an owner's photo.

Use English for new explanations and dialogue unless another language is requested. Preserve supplied wording and reference syntax. The Chinese teaching examples do not determine the response language.

## 1. Identify the deliverable and current sources

- Themes, scripts, shots or prompts only: deliver the requested text without asking for generation mode, operating the canvas or generating media. Text ideation may use labeled assumptions without a photo; never claim to inspect unreadable assets.
- Production: reuse established themes, exact wording and real assets. Establish interactive or automatic mode at the start unless already chosen. A complete video over 30 seconds goes to the long-video workflow; do not split it yourself.
- Explicit interviews use petInterviewVideo, solo jokes use the comedy skills, and explicit commerce uses its workflow. Respect a different workflow explicitly selected by the user.

For every new video or re-finalization, read this skill, required director references and the actual model finalizer in the current turn. A complete applicable read within this turn for this same video may be reused. Discover actual name, scope, location and availability through skillOperator(action=list), then read the main file and package-relative paths with that name and scope. Without it, use available read tools and this turn's actual catalog. Directory discovery, a previous video's reading and source-tree locations do not count as this read; honor disabled access.

## 2. Direct the story and budget the shots

Read the installed aiPetShortVideoDirector main file. Read its references/story.md for themes/story, references/direction.md for performance/shots, references/generation.md for generation planning, and references/review.md for actual footage review. Use the director's own name and scope rather than paths relative to this skill. The director returns creative material without calling this workflow back, operating nodes or generating media. Preserve existing work and pause dependent stages if required sources are unreadable.

New creation must read [three complete examples](references/mishapExamples.md). Complete shots, generation prompts and pacing revisions must also read [budgets and finalization](references/mishapShotGuide.md). These are hypothetical, ungenerated teaching material, not facts about the user's pet or proof of a completed optimization run.

1. Separate supplied facts, observations and fiction. Extract names, real habits, favorite objects and household expressions; label invented temperament as an assumption.
2. Without a theme, use the director to offer three different mechanisms: opening, goal, obstacle, changed method, result/payoff, personalization and main risk. Recommend one. Stop there for themes only; expand it for scripts or production unless the user requested selection first. Preserve an existing incident or script.
3. Write complete dialogue and necessary actions before grouping shots. Every shot lasts at least 4 seconds. Group short lines into several lines or a complete exchange in the same shot; use a single line in a dialogue-led shot only when its natural duration sustains it. Each meaningful unit adds information or changes the situation.
4. Initially estimate Chinese at about 4–5 characters/second, use real supplied audio or natural reading for other languages. Per shot, list each line's duration, breath/turn-taking, concurrent action, separately timed action, purpose of remaining time and handoff state. Count concurrent dialogue and simple movement once. Aim for roughly 0.2–0.5 seconds of natural conversational breath; explain the action, evidence or result during speech-free intervals over about 0.5 seconds. These are planning references, not precision promises or reasons to rush speech or fill a quota.
5. Action-led shots need stimulus, objective, action process, visible change and result. Searching, concealing, repairing and discovery may occupy time; ear twitches, closed mouths and poses cannot fill it. Preserve framing/viewpoint, space, animal performance, exact lines/delivery/speakers, concurrency and cross-shot states. Track each key prop's unique count, position, occlusion, ownership transfer and final state.
6. Merge sparse lines and causal actions first; add useful events only when writing is allowed, then derive runtime. Preserve supplied verbatim text. Identify specific conflicts involving fixed duration, shots or model capability and return them for a user choice. Continue at natural speed and end when payoff and useful reaction finish; never stretch to a default 20/30 seconds.

A full creative deliverable contains title, incident/personalization basis, complete dialogue, shot budgets, detailed performance plan, opening/ending relationship, reference roles, key prop states, risks and acceptance criteria. Match depth to the requested stage.

## 3. Finalize for the actual model

An unspecified model permits a generic draft explicitly marked not model-finalized. Before media calls and interactive approval of a concrete batch, determine the actual model/version and input mode.

### Seedance 2.5: sd25-pe

Discover the global installed sd25-pe with skillOperator(action=list, scope=global), then read its main file using the returned name and scope=global so a workspace namesake cannot override the required dedicated skill. Without the tool, use its actual global catalog location. Do not install a substitute.

SD self-update advice follows host maintenance permissions: use the readable local version by default. Update at most once per session only after explicit user authorization for that maintenance and overwrite scope, enabled write permissions and a compliant host update capability. Maintain global resources through skillOperator; networked npx or other commands cannot bypass write permissions. Without authorization or capability, record that no update was attempted and continue with the local version; do not describe an unattempted update as failed or completed. After an authorized update, re-read actual content/version and localized entries; an actual update failure follows the upstream notice and continues with a readable local version. Editing skills or discussing a plan does not trigger optimization or maintenance. Missing, disabled or unreadable content pauses dedicated finalization while preserving the director draft. Do not label a generic substitute as completed dedicated optimization.

Pass the complete story contract, exact dialogue, shot budgets/detailed blocking, voice identities/on-off-screen roles, actual assets/responsibilities, prop transfers and approved ending. Use the current generation template to return one complete prompt. This workflow explicitly requests contiguous integer-second creative intervals derived from natural content; preserve these supplied intervals and sequence instead of creating time blocks backward from page duration. Put aspect ratio, total duration, resolution and sound toggle in node settings separately.

**The user's and this workflow's pacing rules take precedence:** sd25-pe's suggestion to slow actions/reactions/pauses for a longer external target must not fill runtime here. Return mismatches to creation for merging, useful content or revised duration. Conflicting fixed duration and verbatim wording require a user choice. Optimization organizes expression without changing the story, adding approved dialogue or dropping decisive actions. Distinguish identity references from hard first frames and preserve platform-bound {{ref N}} handles instead of replacing them with unbound upstream tags.

Review the dedicated result within this workflow. Do not have videoPromptAdapter rewrite it or replace the required sd25-pe read with a third-party guide.

### Other actual models

Discover and read videoPromptAdapter and its exact version/mode references. Pass the same complete budgets and directed shots. Re-adapt and check authorization after model changes; do not apply SD syntax to other models or silently switch models. Mark unavailable performance evidence honestly without treating it as explicit lack of interface support.

### Finalization completion

Keep complete story/dialogue, budgets/detailed shots, the complete final prompt, actual read name/scope/version fields (version or skill_version)/reference paths, update failure/fallbacks and unfinished items in the existing story/plan. Do not create a duplicate receipt. Prompt text contains only submission-ready creative content; settings and optimization records stay outside. Directory discovery, historical reading, teaching examples and a bare optimized label are not evidence.

Compare every shot for event order, exact dialogue/voice attribution, stimulus/reaction, action process/result, evidence, prop/continuity states, natural exchanges and ending before delivering final text or seeking generation approval. Repair omissions or empty waits within scope; do not reduce the plan to lying down, saying a line and looking at the owner.

## 4. Prepare the canvas and media

Operate only for production requests. Read current canvas, available node types and real getNodeTools schemas; reuse this task's text, actual pet outputs and video node. When necessary create story text, a pet image-generation node and a video node; add an independent scene image only when needed. Do not create a product node or connect text to generation inputs.

Reuse the user's real pet photo as identity or starting image rather than forcing a regenerated character sheet. Without an import tool use the node's upload entry and wait for actual upload. State whether a scene reference controls layout/light or includes the same pet, preventing duplicate subjects. Reuse useful existing outputs.

Query node:getConfig using its actual schema for models (explicit includeModels where required), current settings and durationResolutionMap. Before images, compare declared capability with planned asset types/count/roles, duration, ratio, resolution and sound. Pending images have no real output: matchingModes at that point must not exclude the planned image-to-video mode. The batch names pending asset nodes and their duties.

When ready, read actual ports and connect pet/enabled scene image outputs to video inputs with connectNodes. Read edges and actual valid outputs before mapping {{ref N}} in effective input order. Missing data.referenceOrder is normal: retain actual valid input order. When port ordering exists, key each input with encodeURIComponent(JSON.stringify([source, sourceHandle])). Build a key-to-index Map from that order (the last index wins for duplicate keys), use Map.size for unlisted keys and preserve effective input order for equal ranks. Ask the user to verify if effective order cannot be established; do not guess indexes. Then query actual matchingModes, set and read back mode, ratio, final script duration, resolution and sound. Preserve work and ask for a supported option if required conditions are explicitly unsupported; do not silently drop references/speech, shorten or split.

Write the full prompt through actual node tools and **read its complete text back**, comparing it to budgets, detailed shots, real references and settings. Both content and technical preparation must pass before video generation; necessary batch images may be generated first under the next section's authorization. Technical preflightCanvas does not inspect creative quality. First release generates one complete video, without automatic splitting, composition, post dubbing or subtitles. Simplify incidental action before proposing a user choice for an overloaded causal story.

## 5. Authorize, execute and recover

Interactive mode presents one complete batch before any media call: objects/counts, providers/models, settings/video duration, full prompts, real or designated pending references/roles, voice attribution, call counts and reliable price or compute consumption unknown. Execute after explicit approval, checking ready assets against the approved plan.

Automatic mode obtains explicit initial approval of goal, necessary image specs, video duration or allowed content-based range, ratio/resolution/sound, image/video providers/models or ordered candidates, total call limit including retries and per-object failed-retry limits. Explain that full prompts follow authorization and consumption is unknown without a quote. Work within scope without repeating stage approvals. Skip, cancellation and silence do not authorize; prompt budgets are not programmatic enforcement.

Before each call check model, full text, inputs, settings and remaining calls while reserving other planned initial attempts; recheck changed content/models/assets. Generate only authorized missing necessary images, record attemptId/startedAt and await node:waitGeneration({attemptId}). After real connections, mode checks and video text readback, start one video attempt and await its own terminal state. Old outputs or idle do not prove success. Running, timeout, cancellation and unknown states do not allow duplicate calls. Reopen by inspecting the original attempt; closing/switching the canvas does not guarantee background continuation.

On explicit failure preserve work, pause dependent steps and offer host recovery: manual history/redownload or explicit authorization to inspect this call and try one download recovery. Recovery neither generates nor adopts. The user clicks Use Result and checks the result. Another generation for the failed object requires explicit object-specific approval and, in automatic mode, total/object allowance and other initial-call reserves. Retry allowance alone does not authorize regeneration.

Use available preflightCanvas, getProduction/updateProduction/verifyProduction and revisions. Before bulk overwrite use createCanvasSnapshot and stop if it fails. State missing tools without inventing another production system.

## 6. Inspect and deliver

Use director review methods to watch and hear the complete output. Check identity/anatomy, grounded personalization, unique props/transfers, visible causality, middle development, voice/lip attribution, exact lines, shots of at least 4 seconds, exchanges, waits without information and ending. Frames or low-volume detection only locate possible issues; they do not establish full audiovisual inspection, precise dialogue gaps or automatic cuts.

Report real nodes and result paths, separating generation success, actual review and user adoption. State anything not watched/heard. Instructions and readback do not prove model compliance, humor or retention; review recommendations do not authorize another generation.
