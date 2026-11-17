---
name: petCommercePrompt
description: Use for pet-product recommendation scripts, demonstrations, or pet-host sales dialogue and generation prompts. Turn pet identity, product facts, or an existing script into shot-by-shot performance, speech, asset image prompts, and a complete video prompt. Text only; does not create nodes or generate media. Prefer the dedicated Seedance 2.5 edition for that model.
metadata:
  version: "1.0.5"
  displayName: Write Pet Commerce Scripts and Prompts
  author: Infinite Canvas
---

# Write Pet Commerce Scripts and Prompts

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Turn the user's idea, product information, or script into a complete short-video prompt. Used independently, deliver text only; when called by a workflow, provide the script, necessary asset prompts, and video prompt. The caller handles canvas operations, model settings, generation, authorization, and budget. This skill creates no nodes, generates no media, and grants no additional calls or permissions.

This is the creative rule source for pet commerce tasks. Do not also apply Lengyi or the general `workflow` director rules. Relevant reference, staging, and sound methods are incorporated here and in the supporting guide; no additional external skills are required at runtime.

## 1. Establish inputs and performance

Preserve the supplied pet identity, product facts, story, style, and dialogue. Distinguish supplied facts, permitted creative performance, and missing information that affects execution. Ask only about consequential gaps that cannot be inferred. For a final script, change only the requested scope.

- **Pet host:** For commerce without a specified performance style, stage the pet like a human presenter: sitting upright, looking at the camera, gesturing with front paws, demonstrating, or reacting at sentence endings. Preserve species, face, coat, and paw anatomy; express anthropomorphism through posture and behavior. Explicitly establish standing, clothing, tool holding, or stronger anthropomorphism and ensure assets support those actions. Respect requests for natural animal behavior, narration, or silence.
- **Product facts:** Brand, model, appearance, features, price, offers, and purchase destinations must come from the user or verifiable sources. Support selling points through actual demonstrations. Do not invent efficacy, reviews, sales, stock, or suitability claims. Label concept products as fictional. If product details are missing, provide the independently achievable creative structure and defer specific claims and final product prompts.
- **Without a product:** When the caller explicitly disables the product, retain pet performance and shot methods while omitting selling points and purchase appeals. Do not invent a product to fill a template.
- **Capabilities:** Before model selection, a generic draft may identify unresolved capabilities. Final execution must match the caller's real duration, reference mode, and sound support. A brand or model name alone proves neither multi-shot support nor speech, lip sync, or audio-reference support.

## 2. Plan speech before shots

Derive total duration from the content and shot budgets below, honoring an explicit user duration. This short-video plan is limited to 30 seconds; explain when a longer workflow is needed. Organize around a hook, product reveal, visible demonstration, and ending; combine or omit unnecessary beats. Start with performance or a problem rather than requiring an establishing wide shot. Let information, action, and speech determine shot count.

Write dialogue that can be spoken naturally, budget necessary breathing and action, then assign continuous shot intervals ending exactly at the planned total. Read-aloud estimates identify crowding, not guaranteed model behavior; use actual duration for existing audio. When speech is too long, reduce optional wording or allocate more time. Discuss conflicts involving approved wording or a strict duration instead of forcing accelerated delivery.

Give each shot one clear display objective and principal action, expressed as initial state → action → visible final state. When speech, contact, and complex camerawork compete, preserve speech and product readability by reducing secondary action or splitting shots. Static cameras and stable lighting are valid. Cut to add information; require neither a fixed shot count nor camera/environment motion in every shot.

Read [Shot Writing and Examples](references/shotGuide.md) when writing complete shot prompts or revising action, speech, or product interaction. Finish each shot's action and sound before assembling one complete video prompt; do not leave a summary for the caller to expand.

## Content and shot duration

Write dialogue and necessary actions before grouping shots. Every shot lasts at least 4 seconds. Group short lines into two or more lines, a complete exchange and concurrent action within the same shot. A story beat does not require a cut. In a dialogue-led 4–6-second shot, use only one line when its natural spoken duration sustains that shot; otherwise continue with the next line instead of waiting for the next integer time block. Budget an action-led evidence shot by its necessary visible change, never by ear twitches, closed mouths or holding a pose. Initially estimate Chinese speech at about 4–5 characters per second; use actual supplied audio or a natural read in other languages. About 14–18 Chinese characters in a 4-second dialogue shot is a review aid, not a quota. Count concurrent speech and simple gestures once; budget necessary complex contact, movement and reveals separately.

When content is sparse, first merge adjacent short lines, exchanges or causal actions. If needed and writing is permitted, add information serving the proposition, verified selling point, evidence or punchline. Derive duration from content instead of filling a default 20/30 seconds. Honor an explicit user duration with sufficient content; regroup supplied verbatim text without expanding it. Return conflicts among duration, fixed shot count and model capability to the caller rather than filling time with slow delivery, repetition or static holds.

Connect dialogue naturally and reserve brief reactions only for comprehension, breathing or a decisive payoff. Ending states describe results and continuity without extra static display time. Carry ongoing action, gaze, product state or sound into the next shot at natural speed without resetting subjects and props. For each shot give its information, exact lines, action, time budget and handoff; review shots of at least 4 seconds, a continuous timeline, natural delivery and no waiting without new information.

Before finalizing, give a compact per-shot budget: shot/duration, exact lines and natural spoken estimates per line, breathing/turn-taking, concurrent actions, actions that truly require separate time, and the purpose of any remainder. Exclude punctuation from Chinese character estimates. Aim for natural conversational breaths of roughly 0.2–0.5 seconds; explain how a speech-free interval over about 0.5 seconds advances information or evidence, or merge, add permitted useful content or rebudget. These are planning/review aids, not precise model guarantees; never force overlapping speech, rushed words or accelerated source audio to meet them. A closed mouth identifies the non-speaker; it does not instruct additional waiting.

## 3. Assets and reference responsibilities

Provide pet, product, and scene asset prompts as needed. Reuse suitable existing assets and identify their origin. Pet references establish appearance, anthropomorphic posture, necessary clothing, and visible front paws. Scene references establish the tabletop, product area, and lighting without introducing a duplicate pet. Actual product photographs anchor shape, packaging, colors, graphics, and existing lettering. Identify evidence gaps for unseen backs, interiors, or new angles; generated completion is not factual product evidence.

Give each reference a clear responsibility: pet identity, product appearance, space, or actual starting composition. Separate pet and product images do not establish their contact pose: specify position and contact. Mark additional pose-dependent imagery as required rather than already available. Return new asset requirements to the workflow for capability and budget review.

Use identifiable asset names and sources in plans. The workflow maps execution tags such as `{{ref N}}` to actual inputs. Preserve asset identities and responsibilities for verification; resolve every reference before generation and never infer numbering from plan order. For image-to-video, emphasize action and change with necessary identity constraints instead of redesigning an established appearance.

## 4. Speech and sound

For commerce, default to the pet speaking on camera in the current interface language, with a voice consistent with its persona across shots. An explicitly requested language, voice, or off-screen narration takes precedence. For each line specify speaker, exact words, timing, delivery, necessary brief reactions, and concurrent visible action. Separate dialogue, ambience, action effects, and music in a sound section. Add background music only when requested by the user or caller; otherwise retain necessary dialogue and ambience.

For on-screen speech, describe mouth movement matching the words, closed mouths while not speaking and natural turn-taking. Preserve animal muzzle anatomy. Random mouth movement or added narration is not verified lip sync. Off-screen narration must not drive the pet's mouth. If spoken audio already exists, make it the sole dialogue source and voice/rhythm reference, map it through the actual interface, keep its transcript separately in the review plan, and avoid generating a duplicate voice track.

If the interface explicitly lacks necessary native sound or audio inputs, identify the conflict and return it to the workflow. Unknown speech, lip-sync, or timing quality preserves the user's goal and prompt, marked unverified, for an authorized attempt. Unknown does not mean unsupported or guaranteed. Do not silently substitute silence or narration or assume post-production speech/lip-sync tools exist.

## 5. Deliver and review

Match detail to the request. A complete commerce plan contains:

1. **Script overview:** Target duration, persona and anthropomorphism, verified product facts, shot objectives, and speech schedule. Separate gaps from assumptions.
2. **Asset plan:** Actual media and responsibilities, complete prompts for necessary missing images, and a clear distinction between concept art and product evidence.
3. **Complete video prompt:** Film-wide identity/product/scene constraints, reference responsibilities, continuous shot text, dialogue, and sound. Keep model settings outside the prompt; include time intervals when required. Follow the shot guide and actual interface instead of imposing the general `workflow` template.
4. **Review priorities:** Likely pet identity/anatomy, product appearance/contact, speech ownership, lip-sync, and continuity failures. Describe what to observe rather than promising model compliance.

Before delivery, verify continuous timing and total length, executable action and final state in every shot, adequate speaking time, consistent identity/paws/product position, sourced claims without exaggerated demonstrations, and reference/sound compatibility. Provide a complete revised draft plus a brief change explanation. Accurately identify anything not generated, watched, or heard.
