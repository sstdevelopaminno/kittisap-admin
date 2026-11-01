import { NextRequest, NextResponse } from "next/server";

import { getAdminActor, requireAdminApi } from "../../../../../../lib/auth/admin";
import { assertUiWriteAllowed, isUiMaintenanceLockedError } from "../../../../../../lib/maintenance/ui-maintenance-guard";
import { takeRateLimitToken } from "../../../../../../lib/security/rate-limit";
import { getSupabaseServiceRoleClient } from "../../../../../../lib/supabase/service";

// Keep the upload below Vercel Functions' request-body limit.
// The original 139MB file must be trimmed/compressed before uploading.
const MAX_VIDEO_BYTES = 3_800_000;
const MAX_REQUEST_BYTES = 4_300_000;
const BUCKET = "homepage-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminApi();
    const actor = await getAdminActor();
    if (!actor || actor.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await assertUiWriteAllowed({
      path: "/admin/web-settings/banner",
      actorRole: actor.role,
      userAgent: request.headers.get("user-agent"),
    });

    const limit = takeRateLimitToken(`hero-video-upload:${user.id}`, { limit: 4, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json({ error: "Upload rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } });
    }

    const len = Number(request.headers.get("content-length") ?? 0);
    if (len > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Compressed video must be below 3.8 MB" }, { status: 413 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 });
    }

    const ext = file.name.toLowerCase().split(".").pop();
    const mime = ext === "mp4" ? "video/mp4" : ext === "webm" ? "video/webm" : null;
    if (!mime || file.type !== mime || file.size < 1000 || file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Choose a compressed MP4/WebM video under 3.8 MB" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const validMp4 = mime === "video/mp4" && buffer.toString("ascii", 4, 8) === "ftyp";
    const validWebm = mime === "video/webm" && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if (!validMp4 && !validWebm) {
      return NextResponse.json({ error: "Invalid video file signature" }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();
    const { data: existing, error: lookupError } = await supabase.storage.getBucket(BUCKET);
    if (!existing) {
      if (lookupError && !/not found|does not exist/i.test(lookupError.message)) {
        return NextResponse.json({ error: lookupError.message }, { status: 500 });
      }
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 4_000_000,
        allowedMimeTypes: ["video/mp4", "video/webm"],
      });
      if (createError && !/already exists|duplicate/i.test(createError.message)) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
    }

    const path = `hero/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (isUiMaintenanceLockedError(error)) {
      return NextResponse.json({ code: error.code, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
