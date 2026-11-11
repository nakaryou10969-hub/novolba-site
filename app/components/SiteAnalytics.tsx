"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

// GA4 measurement ID for novolba.com. It is a public value that ships in every page.
// While it is empty, no analytics tag is rendered anywhere.
export const GA_MEASUREMENT_ID: string = "";

// The article preview carries draftKey values in its URL; it must never be measured.
export function isMeasuredPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return !/^\/preview(?:\/|$)/.test(pathname);
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  if (!/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) || !isMeasuredPath(pathname)) return null;
  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
