"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "TOP", href: "/" },
  { label: "MESSAGE", href: "/message" },
  { label: "SERVICE", href: "/service" },
  { label: "NEWS", href: "/news" },
  { label: "MEDIA", href: "/media" },
  { label: "COMPANY", href: "/company" },
  { label: "FAQ", href: "/faq" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ロゴ */}
        <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="NovolBa"
            style={{ height: "16px", width: "auto" }}
            className="object-contain"
          />
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-widest text-gray-600 hover:text-teal-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/inquiry"
            className="ml-2 px-4 py-2 text-xs font-medium tracking-widest text-white rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
        </nav>

        {/* モバイルハンバーガー */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
        >
          <span
            className="block w-6 h-0.5 bg-gray-700 transition-transform duration-200"
            style={{ transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }}
          />
          <span
            className="block w-6 h-0.5 bg-gray-700 transition-opacity duration-200"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-0.5 bg-gray-700 transition-transform duration-200"
            style={{ transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }}
          />
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-widest text-gray-700 hover:text-teal-500 transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/inquiry"
            className="mt-2 text-center px-4 py-3 text-sm font-medium text-white rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3dbdac" }}
            onClick={() => setMenuOpen(false)}
          >
            お問い合わせ
          </Link>
        </nav>
      )}
    </header>
  );
}
