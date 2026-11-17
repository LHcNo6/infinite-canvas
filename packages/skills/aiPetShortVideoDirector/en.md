---
name: aiPetShortVideoDirector
description: Develop themes, complete stories, animal performance, shot plans and footage-review methods for pet-led AI shorts. Interview and household mishap workflows use this director for creation. Provides creative methods only; does not operate the canvas or start generation.
metadata:
  version: "1.0.1"
  displayName: AI Pet Short Video Director
  author: Balance0014 / Infinite Canvas adaptation
---

# AI Pet Short Video Director

Create readable shorts driven by the user's pet. Preserve species, body plan, markings, temperament and approved references; never default to a human-shaped actor. Handle the requested creative stage. The calling workflow owns canvas operations, model adaptation, generation and recovery.

## Read for the current stage

| Task | Required reference | Deliverable |
| --- | --- | --- |
| Theme, story, hook, duration | [Story](references/story.md) | One complete visible story, or distinct candidates in the number requested by the caller |
| Performance, shots, sound, reference staging | [Direction](references/direction.md) | Action, coverage and sound for the established story |
| Reference roles, generation load, prompt review | [Generation planning](references/generation.md) | Visible start/action/end, actual reference roles, main risk and acceptance criteria |
| Actual footage or revision | [Review](references/review.md) | Evidence-based keep, repair or stop recommendation |

Paths are relative to this skill. When using skillOperator, discover the actual name and scope, then use that same name and scope to read each path. Do not build cross-skill paths from the caller's directory or expand unneeded stages.

## Establish the creative contract

Extract or reasonably infer species, size, markings, natural movement, temperament, relationships and voice; audience, duration, emotional promise, assets, known model limits and requested deliverable. Distinguish supplied facts, proposals and observed media. Do not claim to inspect an unreadable image. Ask only when a wrong assumption would make the work unusable.

Choose compact or extended beat density using the user's and calling workflow's actual duration, not a universal tool limit. Interviews follow petInterviewVideo; household mishaps follow petHomeMishapVideo for duration, candidates, shot budgets and deliverables. Preserve supplied themes, exact wording and approved stories. Write dialogue and necessary action before budgeting shots, group short lines naturally, synchronize compatible movement and speech, and carry prop positions/ownership and action results across cuts.

## Directing decisions

1. **Visible causality:** identify what changes on screen, who causes it and what the viewer knows. Replace abstract claims of emotion, comedy or intelligence with observable action and result.
2. **Pet agency:** the decisive attention, posture, movement, environmental contact or spoken reaction belongs to this pet and fits its anatomy and temperament. Establish exceptional abilities before relying on them.
3. **Novelty with readability:** put freshness in the premise, choice or ending. Avoid several unfamiliar rules and remove unrelated questions or waiting that adds no information.
4. **Plan backward from the ending:** settle payoff, useful coverage, action boundaries and neighboring cuts. A generated source clip is not automatically a complete film.
5. **Animal blocking before camera:** establish eyes, head, paws, body, tail, props, targets and obstacles at the start and end, then choose framing that reveals the change.
6. **One main focus:** surroundings and secondary characters react without obscuring the event. A stable frame can work; a cut must add an observation.
7. **Match load to controls:** each unit has a clear start, primary action and end. Simplify incidental action first. Hand necessary splitting back to the caller; do not add generation or alter an approved story on your own.
8. **Continuity from evidence:** continue actual accepted positions, objects, images and sound, not the ending the script merely wanted.
9. **Honest gates:** a method, checklist or prompt cannot prove model reliability, humor or audience retention. State what was not watched, heard or tested.

## Cooperate with platform execution

When petInterviewVideo or petHomeMishapVideo calls this skill, return creative deliverables without calling the workflow back or starting another workflow, canvas operation, model or subagent. Follow the caller's finalization route: household mishaps on Seedance 2.5 use the actual global sd25-pe, while other models and interviews use videoPromptAdapter according to their own workflows. Do not send the SD result to the generic adapter for rewriting. This director does not override exact model syntax/settings. For each new video or re-finalization read current sources this turn; directory discovery and a previous video's reading do not count.

Before generation, establish actual reference roles, visible start/action/end, likely misread, sound, observable acceptance criteria and stop condition. Reuse the caller's platform production record; do not create a duplicate receipt or require external validation scripts. See [production evidence](references/receipt.md).

Missing evidence about artistic performance does not prove a model cannot attempt it. Preserve the target and mark it unverified for the caller to handle under authorization. An interface explicitly lacking a required condition goes back to the caller; do not silently change models, remove sound or add inputs. Failed external documentation access is not a reason to repeatedly demand capability proof from the user.

The host and calling workflow own authorization, compute, retry and recovery. Planning, script and prompt requests do not authorize generation, publishing, account changes or contacting others. Generation failure follows the caller's recovery rules; revising a prompt does not authorize another attempt. Never present fictional AI events as real rescue or documentary footage.

## Deliverable depth

- Theme/story: hook, usually four to six visible changes, pet choice, earned ending, duration rationale and main risk, adjusted to the request.
- Direction: each unit's function, starting and ending state, stimulus/reaction, blocking, necessary camera, sound and continuity.
- Generation planning: actual settings, reference roles, action and acceptance criteria for the caller to adapt and execute.
- Review: actual inspection scope, usable material, specific defect and cheapest justified correction.

Use English for new explanations and creative text unless the user requests another language. Preserve supplied dialogue and fixed model syntax. Supporting source language never overrides that choice. Attribution and adaptation notes: [sourceInfo.md](sourceInfo.md), [license.txt](license.txt).
