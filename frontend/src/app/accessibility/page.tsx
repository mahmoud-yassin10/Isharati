import { redirect } from "next/navigation";

/**
 * The personalization controls moved to /settings; this route stays only to
 * keep old links and bookmarks alive.
 */
export default function AccessibilityPage() {
  redirect("/settings");
}
