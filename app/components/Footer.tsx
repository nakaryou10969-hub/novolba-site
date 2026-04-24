import Link from "next/link";

const footerLinks = [
  { label: "TOP", href: "/" },
  { label: "MESSAGE", href: "/message" },
  { label: "NEWS", href: "/news" },
  { label: "MEDIA", href: "/media" },
  { label: "COMPANY", href: "/company" },
  { label: "FAQ", href: "/faq" },
  { label: "CONTACT", href: "/inquiry" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ロゴ */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="NovolBa"
            style={{ height: "36px", width: "auto", filter: "brightness(0) invert(1)" }}
            className="object-contain mx-auto"
          />
          <p className="mt-2 text-xs text-gray-400 tracking-wide">
            挑戦するスタートアップの"昇る場"を提供します。
          </p>
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-wrap justify-center gap-6 mb-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* コピーライト */}
        <p className="text-center text-xs text-gray-500">
          Copyright ©{new Date().getFullYear()} All rights reserved | NovolBa
        </p>
      </div>
    </footer>
  );
}
