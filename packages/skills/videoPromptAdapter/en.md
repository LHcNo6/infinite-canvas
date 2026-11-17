---
name: videoPromptAdapter
description: Use when an existing video plan or long-video segment plan needs prompts adapted to an exact model version and reference-input mode. Preserve plot, verbatim dialogue and asset roles; deliver a complete prompt per segment with settings separately. Does not operate the canvas or generate media. Finalizes Seedance 2.5 talking pet comedy and non-commerce interview shorts; other dedicated Seedance routes follow their workflows.
metadata:
  version: "1.1.9"
  displayName: Adapt Video Plans to Model Prompts
  author: Infinite Canvas
---

# Adapt Video Plans to Model Prompts

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Accept an established creative plan, exact model/version, provider, input mode, duration, actual reference responsibilities, and sound goals. Return one complete prompt or one per segment, with settings separately. This skill handles text only: no canvas operations, generation, model substitutions, or extra authorization. Preserve approved story, exact dialogue, pet identity, product facts, sequence, and user requirements; formatting must not remove or change them.

## Model routing

For petHomeMishapVideo on Seedance 2.5, the actual global sd25-pe owns dedicated finalization. Do not take over, rewrite its result or substitute a third-party guide or generic fallback for that required step. Only other models from this workflow enter the routes below, preserving the complete story, shot budgets, animal action, prop transfers and ending. If the required SD skill is unavailable, the caller preserves the director draft and pauses dependent finalization.

Verify the exact version and mode, then use this skill's actual name and scope to read the corresponding reference:

| Target | Reference | Evidence |
| --- | --- | --- |
| Kling VIDEO 3.0 (excluding Omni) | `references/klingVideo30.md` | Official VIDEO 3.0 guide reviewed; actual inputs and switches still depend on the node |
| Veo 3.1 | `references/veo31.md` | Google Veo prompting guide reviewed; the provider must verify version and inputs |
| Wan 3.0 | `references/wan30.md` | No verifiable official or corresponding third-party 3.0 guide found; use generic guidance marked unverified |

Prefer readable official guidance above that matches the exact version and mode. If unavailable or it does not cover the input mode, look for an exact match in the third-party `videoPrompting` skill below. **Similar model names do not establish the same version.** Verify mode coverage before use; otherwise use the generic method and mark model-specific optimization unverified.

| Exact target | Third-party `videoPrompting` path |
| --- | --- |
| Ovi | `references/models/ovi/prompting.md` |
| Veo 3 or 3.1 | `references/models/veo3/prompting.md` |
| Wan 2.2 | `references/models/wan22/prompting.md` |
| Wan Animate 2 | `references/models/wanAnimate2/prompting.md` |
| Seedance 2.0 | `references/models/seedance2/prompting.md` |
| Seedance 2.5 talking pet comedy and non-commerce interview shorts | `references/models/seedance25/prompting.md` |
| MiniMax H3 | `references/models/minimaxH3/prompting.md` |
| LTX-2, LTX-2.3, LTX-2.5 | `references/models/ltx2/prompting.md`, `references/models/ltx23/prompting.md`, `references/models/ltx25/prompting.md`, respectively |

For third-party routing, find the real `videoPrompting` with `skillOperator(action=list, scope=global)`, then read its main document, `sourceInfo.md`, and selected path using the returned name and `scope=global`. Without `skillOperator`, use the actual global location in this turn's catalog. Read examples with the same name/scope and their relative paths. If the skill, provenance, guide, or matching mode is unavailable, identify the missing source and use the generic method marked unverified; do not borrow an adjacent version. Third-party advice does not prove provider or Infinite Canvas capabilities. Deliver sources and unresolved verification boundaries.

Third-party rules only organize prompts for their models. This skill, the caller, and approved story, exact dialogue, real references/sound, duration, authorization, and settings take precedence. If upstream single-line, default-duration, audio, or reference conventions conflict, preserve the user's goals and workflow requirements rather than dropping speech/references/shots or changing models. The workflow maps real references; sample tags such as `<Picture 1>` are not already bound.

For Seedance 2.5 talking pet comedy and non-commerce interview shorts, this skill finalizes using the third-party guide above; if unavailable or it does not cover the input mode, use the generic method and mark optimization unverified. For interviews preserve exact interviewer, pet and optional owner lines, on/off-screen attribution, question order, middle evidence and a purposeful brief ending reaction; do not turn the interview into a solo monologue or product presentation. `petCommercePromptSd25` finalizes Seedance 2.5 pet commerce shorts and long-video segments; `sd25-pe` finalizes ordinary Seedance 2.5 long-video segments; the caller's `workflow` PART A finalizes Seedance 2.0 long-video prompts. Do not rewrite those final prompts here. Model changes require the calling workflow to re-adapt affected segments and verify authorization.

## Pet-video pacing review

For pet commerce, talking comedy and interviews finalized by this skill, review shots of at least 4 seconds, allowing several lines, complete exchanges and concurrent action within a shot. Preserve the creative plan's reviewed content density, timing and action/sound handoffs. Do not allocate a whole shot per short line or add sentence-ending waits, static ending holds or slow camera moves. Interview answers follow questions naturally while the listener may react during a question; voices do not overlap. Retain only an ending reaction with a clear purpose.

Require the caller's per-shot natural spoken estimates, breaths/turn-taking, concurrent actions, separately timed actions and purpose of remaining time. Group short lines into two or more lines or an exchange within dialogue-led 4–6-second shots; retain a single line only when its natural duration sustains the shot. Aim for conversational breaths of roughly 0.2–0.5 seconds; a speech-free interval over about 0.5 seconds needs an explicit information/evidence purpose. Return missing budgets, sparse standalone lines and empty ending holds to the writer with shot numbers. Calling timing approximate does not excuse them. Do not accelerate speech or fill a word quota; the numbers do not guarantee model precision.

Distinguish explicit user duration, authorized execution duration and workflow defaults. A default 20/30 seconds is not a hard specification. Before finalization, return sparse content to the writer to merge lines/exchanges, add useful information only where permitted and budget from content. Never change verbatim text, fixed duration or authorization yourself. Identify specific shots under 4 seconds, overcrowded dialogue or empty waits and return them to the caller for revision before finalizing. The dedicated Seedance 2.5 commerce skill performs the same review on its own route; do not take over its final prompt. Four seconds is this workflow's creative constraint, not a universal model call or internal-cut capability claim.

## Generic method

Expand directed shots into executable model text. Preserve each shot's framing/viewpoint, subject/prop spatial relationships, stimulus and gaze/body response, action process/result, speakers and exact lines/delivery/turn-taking, concurrent timing and handoff. State shared appearance, light and sound once; carry image-established details through actual references. Return missing story/performance detail to the writer while completing presentation-only detail yourself. Do not reduce detailed shots to summaries or force useless camera movement or word counts.

Outside the prompt, record the actual finalization skill versions, official/third-party guide paths, fallbacks and unverified items, and confirm budgets and key performance details per shot. Report only sources actually read; a previous video's historical read does not establish adaptation for this video. Keep this in the existing plan rather than the generation text.

Describe actual inputs. Text-to-video establishes subject, scene, and starting state. Image-to-video identifies the image's responsibility and emphasizes action, visible change, camera, and ending without redesigning established appearance. Describe first/last frames and multiple references only when supplied and supported. Order action and sound chronologically. Every line identifies speaker, exact words, language, delivery, and on/off-screen source. Include only necessary continuity, contact, and light constraints. Separate settings, prompt, and pending bindings; unavailable media, unset controls, and model quality are not facts.

Deliver the creative objective, reference sources/responsibilities, complete copyable prompts, actual settings, and unverified items. The caller maps tags such as `{{ref N}}` through real connections. Pending media require identities and binding rules, not invented numbers. Return explicitly unsupported necessary inputs to the workflow instead of dropping them, changing models, or silencing speech. Preserve unknown speech/lip-sync/timing goals as unverified for authorized attempts.

For whole-film and long-video pet commerce planning, read `references/petCommercePlanning.md`. It provides creative input; the dedicated pet skill finalizes each Seedance 2.5 segment within actual model and skill duration limits. Sources, licenses, and verification boundaries are documented in the references and project knowledge base.
