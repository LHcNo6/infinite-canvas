import { Router } from "express";
import { z } from "zod";
import { validateFields } from "@/lib/middleware";
import { success } from "@/lib/responseFormat";
import u from "@/utils";

export default Router().post("/", validateFields({
  directory: z.string().min(1).max(4096), canvasId: z.string().min(1).max(4096), nodeId: z.string().min(1).max(256), callId: z.uuid(),
  url: z.string().max(16384).url().refine(value => { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; }).optional(),
}), async (req, res) => {
  const cwd = await u.workspace.resolveWorkspace(req, req.body.directory);
  const files = await u.mediaTasks.recoverCall(cwd, req.body, req.body.callId, req.body.url);
  res.json(success(files));
});
