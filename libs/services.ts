import serviceKaguImage from "../public/service-kagu.jpg";
import serviceBasicImage from "../public/service-basic.jpg";
import serviceBuddyImage from "../public/service-buddy.jpg";

// トップとサービス一覧で、表示内容・リンク先を共通化する。
export const services = [
  {
    id: "kagu-hodai",
    title: "家具ホーダイ!! Service",
    description: "入替え可能な中古家具のサブスクリプション",
    bullets: [
      "1年目 坪3,000円〜",
      "23区内、横浜",
      "月額費用内で、家具の入替え可能",
      "要件に合わせたレイアウト提案",
    ],
    imageSrc: serviceKaguImage,
    imageAlt: "家具ホーダイ!! Service",
    detailHref: "/service/kagu-hodai",
    actionLabel: "家具を探す",
    actionHref: "/service/kagu-hodai/furniture",
  },
  {
    id: "basic-office",
    title: "BASIC OFFICE Service",
    description: "5〜30人用の一社占有家具付きオフィス",
    bullets: [
      "10坪 5名利用で月額16万円〜",
      "渋谷、新宿、五反田、東日本橋 等",
      "最低6か月から契約",
      "入居人数分の家具、Wi-Fi、プリンター込",
    ],
    imageSrc: serviceBasicImage,
    imageAlt: "BASIC OFFICE Service",
    detailHref: "/service/basic-office",
    actionLabel: "物件を探す",
    actionHref: "/service/basic-office/offices",
  },
  {
    id: "novolba-buddy",
    title: "ノボルバディ Service",
    description: "場づくりの右腕に、移転を丸ごとお任せ！",
    bullets: [
      "移転プロジェクトマネジメント",
      "ワークショップ",
      "レイアウト設計",
      "移転PR戦略",
    ],
    imageSrc: serviceBuddyImage,
    imageAlt: "ノボルバディ Service",
    detailHref: "/service/novolba-buddy",
    actionLabel: "相談する",
    actionHref: "/inquiry",
  },
  {
    id: "kaitori-oodasukari",
    title: "買取大助",
    description: "オフィス家具の買取から、廃棄・原状回復まで",
    bullets: [
      "オフィス家具のまとめて買取",
      "不要家具の廃棄処分",
      "退去時の原状回復工事",
      "東京都内に対応",
    ],
    imageSrc: "/images/kaitori-oodasukari/fv-before-after.webp",
    imageAlt: "家具のあるオフィスと、家具を搬出した後のオフィス",
    detailHref: "/service/kaitori-oodasukari/",
    actionLabel: "相談する",
    actionHref: "/inquiry/",
  },
];
