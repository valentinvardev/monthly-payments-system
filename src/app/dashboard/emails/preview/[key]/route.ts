import { notFound } from "next/navigation";
import { render } from "@react-email/render";
import { getCurrentUser } from "@/lib/auth";
import { getEntry } from "@/lib/email-catalog";
import { env } from "@/lib/env";

// Render the requested email template to standalone HTML for preview.
// Only admins can hit this — everyone else gets a 404 to keep the URL
// surface tight.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const { key } = await ctx.params;
  const entry = getEntry(key);
  if (!entry) notFound();

  const built = entry.build(env.APP_URL.replace(/\/+$/, ""));
  const html = await render(built.template);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
