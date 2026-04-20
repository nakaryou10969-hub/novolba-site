import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "MESSAGE", href: "/message" },
  { label: "RECRUIT", href: "/recruit" },
  { label: "NEWS", href: "/news" },
  { label: "MEDIA", href: "/media" },
  { label: "COMPANY", href: "/company" },
  { label: "FAQ", href: "/faq" },
  { label: "CONTACT", href: "/inquiry" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-widest text-gray-800">
            Novol<span style={{ color: "#3dbdac" }}>Ba</span>
          </span>
        </Link>

        {/* ナビゲーション */}
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
            className="ml-2 px-4 py-2 text-xs font-medium tracking-widest text-white rounded-full transition-colors"
            style={{ backgroundColor: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
        </nav>
      </div>
    </header>
  );
}
