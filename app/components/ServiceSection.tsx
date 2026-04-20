import Image from "next/image";

type ServiceItem = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  bullets: string[];
};

const services: ServiceItem[] = [
  {
    imageSrc: "/service-kagu.jpg",
    imageAlt: "家具ホーダイ!! Service",
    title: "家具ホーダイ!! Service",
    description: "入替え可能な中古家具のサブスクリプション",
    bullets: ["1年目 坪3,000円〜", "23区内、横浜"],
  },
  {
    imageSrc: "/service-basic.jpg",
    imageAlt: "BASIC OFFICE Service",
    title: "BASIC OFFICE Service",
    description: "5〜30人用の一社占有家具付きオフィス",
    bullets: ["10坪 5名利用で月額16万円〜", "渋谷、新宿、五反田、東日本橋 等"],
  },
  {
    imageSrc: "/service-buddy.jpg",
    imageAlt: "ノボルバディ Service",
    title: "ノボルバディ Service",
    description: "場づくりの右腕に、移転を丸ごとお任せ！",
    bullets: ["移転プロジェクトマネジメント", "ワークショップ"],
  },
];

export default function ServiceSection() {
  return (
    <section className="py-20 px-4 bg-white">
      {/* Section heading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-light tracking-widest text-gray-800 font-serif">
          Service
        </h2>
        {/* Decorative underline */}
        <div className="mt-2 mx-auto w-24 h-px bg-teal-400" />
      </div>

      {/* Cards grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white"
          >
            {/* Card image */}
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              <Image
                src={service.imageSrc}
                alt={service.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>

            {/* Card body */}
            <div className="flex flex-col gap-3 px-5 py-5">
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-800 text-center">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                {service.description}
              </p>

              {/* Bullet list */}
              <ul className="flex flex-col gap-1 mt-1">
                {service.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    {/* Teal circle-check icon */}
                    <svg
                      className="mt-0.5 shrink-0 text-teal-500"
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
