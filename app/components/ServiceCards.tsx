import Image from "next/image";
import Link from "next/link";
import { services } from "../../libs/services";

type TitleRuby = { base: string; reading: string };

// 見出し中の対象語だけを <ruby> にし、読みを小さく上に添える。
function renderTitle(title: string, ruby?: TitleRuby) {
  if (!ruby) return title;
  const index = title.indexOf(ruby.base);
  if (index < 0) return title;
  return (
    <>
      {title.slice(0, index)}
      <ruby className="[ruby-align:center]">
        {ruby.base}
        <rt className="pb-0.5 text-[0.625rem] font-normal leading-none tracking-[-0.04em] text-[#666666]">
          {ruby.reading}
        </rt>
      </ruby>
      {title.slice(index + ruby.base.length)}
    </>
  );
}

// 説明文の強調語句を太字・文字用グリーンにする。幅が足りれば語句を1行にまとめる。
function renderDescription(description: string, highlight?: string) {
  if (!highlight) return description;
  const index = description.indexOf(highlight);
  if (index < 0) return description;
  return (
    <>
      {description.slice(0, index)}
      <strong className="inline-block text-base font-bold text-[#147D6F]">{highlight}</strong>
      {description.slice(index + highlight.length)}
    </>
  );
}

type ServiceCardsProps = {
  headingLevel?: 2 | 3;
  titleOverrides?: Record<string, string>;
};

export default function ServiceCards({
  headingLevel = 3,
  titleOverrides = {},
}: ServiceCardsProps) {
  const CardHeading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className="mx-auto grid w-full max-w-[960px] grid-cols-1 gap-8 min-[800px]:grid-cols-2">
      {services.map((service) => {
        // この長いページへの入口は、前ページのスクロール位置を引き継がない文書遷移にする。
        const DetailLink = service.id === "kaitori-daisuke" ? "a" : Link;
        return (
          <article
            key={service.id}
            className="mx-auto flex w-full max-w-[464px] min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
              <Image
                src={service.imageSrc}
                alt={service.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 511px) calc(100vw - 48px), (max-width: 799px) 464px, (max-width: 1007px) calc((100vw - 80px) / 2), 464px"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3 px-6 py-6 [line-break:strict] [overflow-wrap:anywhere]">
              <CardHeading className="text-center text-base font-bold text-gray-800">
                {renderTitle(titleOverrides[service.id] ?? service.title, service.titleRuby)}
              </CardHeading>
              <p className="text-center text-sm leading-relaxed text-gray-500">
                {renderDescription(service.description, service.descriptionHighlight)}
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      className="mt-0.5 shrink-0"
                      style={{ color: "#3dbdac" }}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
                      <path
                        d="M4.5 8.5l2.5 2.5 4.5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex gap-2 pt-4">
                <DetailLink
                  href={service.detailHref}
                  className="flex-1 rounded-full px-3 py-2 text-center text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#3dbdac" }}
                >
                  詳細を見る
                </DetailLink>
                <Link
                  href={service.actionHref}
                  className="flex-1 rounded-full border-2 px-3 py-2 text-center text-xs font-medium transition-colors hover:border-yellow-400 hover:bg-yellow-400 hover:text-white"
                  style={{ borderColor: "#d4a017", color: "#d4a017" }}
                >
                  {service.actionLabel}
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
