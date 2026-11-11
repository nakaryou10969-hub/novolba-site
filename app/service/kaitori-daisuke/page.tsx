/* eslint-disable @next/next/no-img-element -- local, pre-sized static-export assets */
/* eslint-disable @next/next/no-page-custom-font -- preserve the approved fonts on this service page only */
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "買取大助",
  description: "オフィス家具の高額買取から、廃棄処分、退去時の原状回復工事まで一括でサポート。東京都内のオフィスの引き払いを、NovolBaの買取大助にまとめてご相談ください。",
  alternates: { canonical: "https://novolba.com/service/kaitori-daisuke/" },
  openGraph: {
    title: "買取大助 | NovolBa",
    description: "家具の高額買取、退去費用を大幅削減。オフィスの引き払いをまとめてサポートします。",
    url: "https://novolba.com/service/kaitori-daisuke/",
    images: [{ url: "https://novolba.com/images/kaitori-daisuke/fv-before-after.webp", width: 1200, height: 800, alt: "買取大助：オフィスの引き払いをまとめてサポート" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "買取大助 | NovolBa",
    description: "家具の高額買取、退去費用を大幅削減。オフィスの引き払いをまとめてサポートします。",
    images: ["https://novolba.com/images/kaitori-daisuke/fv-before-after.webp"],
  },
};

export default function KaitoriDaisukePage() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Outfit:wght@500;600&display=swap" precedence="kaitori-fonts" />
      <main className={styles.page}><svg width="0" height="0" aria-hidden="true" className="icon-definitions">
  <symbol id="i-chair" viewBox="0 0 24 24"><path d="M7 3h10v8H7z"></path><path d="M5 11h14v3H5z"></path><path d="M8 14l-1 7"></path><path d="M16 14l1 7"></path><path d="M12 14v4"></path></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="M6 7l1 13h10l1-13"></path><path d="M9 7V4h6v3"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></symbol>
  <symbol id="i-roller" viewBox="0 0 24 24"><rect x="3" y="3" width="14" height="5" rx="1"></rect><path d="M17 5.5h3v5h-8v3"></path><rect x="10.5" y="13.5" width="3" height="7.5" rx="1"></rect></symbol>
  <symbol id="i-down" viewBox="0 0 24 24"><path d="M3 6l7 7 4-4 7 7"></path><path d="M15 16h6v-6"></path></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path><path d="M8.5 12h.01"></path><path d="M12 12h.01"></path><path d="M15.5 12h.01"></path></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></symbol>
  <symbol id="i-clip" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"></rect><path d="M9 4V3h6v1"></path><path d="M8.5 11l2 2 4-4"></path><path d="M8.5 17h7"></path></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3H6v18h12V7z"></path><path d="M14 3v4h4"></path><path d="M9 12h6"></path><path d="M9 16h6"></path></symbol>
  <symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 6h12v10H2z"></path><path d="M14 9h4l4 4v3h-8"></path><circle cx="6.5" cy="17.5" r="2"></circle><circle cx="17.5" cy="17.5" r="2"></circle></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l3 3 5-6"></path></symbol>
</svg>


  <section className="fv">
    <div className="in">
      <ol className="nv-crumb"><li><Link href="/">TOP</Link></li><li><Link href="/service/">サービス</Link></li><li>買取大助</li></ol>
      <div className="fv__grid">
        <div>
          <h1>買取大助</h1>
          <p className="fv__lead">オフィス移転で残していく家具の買取から、廃棄処分、退去時の原状回復まで。引き払いに必要なことを、NovolBaが丸ごと引き受けます。</p>
        </div>
        <figure className="ba">
          <div className="slot is-filled"><img src="/images/kaitori-daisuke/fv-before-after.webp" alt="移転前の家具が並ぶオフィスと、家具がなくなり原状回復した退去後の同じオフィス" width="1200" height="800" loading="eager" decoding="async" fetchPriority="high" /></div>
        </figure>
      </div>
    </div>
  </section>


  <section className="sec">
    <div className="in">
      <div className="nv-sh"><h2>オフィス移転の3つの苦労</h2></div>
      <ol className="tr mt">
        <li><div className="slot is-filled"><img src="/images/kaitori-daisuke/trouble-1.webp" alt="新しいオフィスの入口で担当者から鍵を受け取る場面" width="1200" height="900" loading="lazy" decoding="async" /></div><p>移転先の決定</p></li>
        <li><div className="slot is-filled"><img src="/images/kaitori-daisuke/trouble-2.webp" alt="家具配置、床材、壁の色が決まった新オフィスの内装" width="1200" height="900" loading="lazy" decoding="async" /></div><p>内装の決定</p></li>
        <li className="is-saving"><div className="slot is-filled"><img src="/images/kaitori-daisuke/trouble-3.webp" alt="家具の買取で退去費用が減ることを示す図" width="1200" height="900" loading="lazy" decoding="async" /></div><p>退去費用の削減</p></li>
      </ol>
      <div className="tr__body">
        <p>オフィスの移転先が決まり、移転先の内装が決まったとして、最後に頭を悩ませるのが、現在のオフィスの退去費用です。</p>
        <p>移転自体に高額な費用が掛かるため、退去費用はギリギリまで抑えたいという悩みを抱えている方々も多くいらっしゃいます。</p>
      </div>
    </div>
  </section>


  <section className="sec sec--subtle">
    <div className="sv">
      <div className="nv-sh"><h2>家具の高額買取、退去費用を大幅削減</h2></div>
      <div className="novolba-single-cost">
        <figure className="cost-figure">
          <div className="range range-original"><span>本来の費用</span></div>
          <div className="single-chart" role="img" aria-label="左列の全高は本来の費用。上が廃棄費用、下が原状回復費用です。同じ全高の右列は、上から廃棄費用の削減分、買取金額、お支払い額に分かれます。左の括弧は本来の費用全額、右の括弧はNovolBaでのお支払い額の範囲を示します。原状回復費用そのものは変わりません。">
            <div className="disposal-saving"><strong>廃棄削減</strong></div>
            <div className="disposal block"><span>廃棄費用</span></div>
            <div className="restoration block"><span>原状回復費用</span></div>
            <div className="purchase block"><strong><span>−</span> 買取金額</strong></div>
            <div className="payment block"><strong>お支払い額</strong></div>
          </div>
          <div className="range range-payment"><span>NovolBaの場合</span></div>
        </figure>
      </div>
      <div className="sv__body">
        <p>私たちは、残されたオフィス家具をまとめて高額買取し、同時に廃棄処分や退去時の原状回復工事まで一括でサポートすることで、トータルコストを大幅に下げることができます。</p>
        <p>元々お金を出して捨てないといけなかった家具に売値が付くため、廃棄コストが下がる上、買取金額を退去費用に充てる事が可能となります。</p>
      </div>
    </div>
  </section>


  <section className="sec">
    <div className="in">
      <div className="nv-sh"><h2>買取大助の特徴</h2></div>
      <div className="ft mt">
        <div className="ft__item">
          <div className="slot slot--contain is-filled"><img src="/images/kaitori-daisuke/feature-1.webp" alt="" width="512" height="512" loading="lazy" decoding="async" /></div>
          <div><h3>丸ごと「買い取り放題」でコスト最適化</h3><p>デスク・チェア・収納などのオフィス家具をまとめて高額買取。大量の撤去でも、コストを抑えて進められます。</p></div>
        </div>
        <div className="ft__item">
          <div className="slot slot--contain is-filled"><img src="/images/kaitori-daisuke/feature-2.webp" alt="" width="512" height="512" loading="lazy" decoding="async" /></div>
          <div><h3>東京都内に特化したスピード対応</h3><p>対応エリアは東京都内に限定。都内のビル管理基準や撤去ルールに精通しているため、移転スケジュールに合わせて迅速に対応できます。</p></div>
        </div>
        <div className="ft__item">
          <div className="slot slot--contain is-filled"><img src="/images/kaitori-daisuke/feature-3.webp" alt="" width="512" height="512" loading="lazy" decoding="async" /></div>
          <div><h3>原状回復・移転・改善まで、すべて一社で完結</h3><p>家具の買取・廃棄、床や壁の原状回復、配線撤去から、新オフィスのレイアウト設計や家具導入まで一気通貫で対応。複数の業者を手配する必要がありません。</p></div>
        </div>
        <div className="ft__item">
          <div className="slot slot--contain is-filled"><img src="/images/kaitori-daisuke/feature-4.webp" alt="" width="512" height="512" loading="lazy" decoding="async" /></div>
          <div><h3>特殊対応もすべてお任せ</h3><p>PC・HDDのデータ消去、機密文書の回収・溶解処理（証明書発行）、金庫の回収・処分など、専門性の高い作業にも対応します。</p></div>
        </div>
      </div>
    </div>
  </section>


  <section className="mc">
    <div className="nv-sh"><h2>オフィスの引き払い、まとめてご相談ください</h2></div>
    <Link className="nv-btn nv-btn--primary nv-btn--lg" href="/inquiry/">相談する</Link>
  </section>


  <section className="sec">
    <div className="in">
      <div className="nv-sh"><h2>サービス内容</h2></div>
      <div className="sd mt">
        <div><div className="slot is-filled"><img src="/images/kaitori-daisuke/service-1.webp" alt="" width="720" height="480" loading="lazy" decoding="async" /></div><h3>オフィス家具の買取</h3><p>デスク、チェア、ワゴン、収納棚などを状態に応じて査定。まとめての買取にも対応しています。</p></div>
        <div><div className="slot is-filled"><img src="/images/kaitori-daisuke/service-2.webp" alt="" width="720" height="480" loading="lazy" decoding="async" /></div><h3>不要家具の廃棄処分</h3><p>買取対象外の家具も、法令に沿った適切な方法で処分します。</p></div>
        <div><div className="slot is-filled"><img src="/images/kaitori-daisuke/service-3.webp" alt="" width="720" height="480" loading="lazy" decoding="async" /></div><h3>原状回復工事</h3><p>床補修・壁面補修・配線撤去など、ビル管理会社の基準に合わせて対応します。</p></div>
        <div><div className="slot is-filled"><img src="/images/kaitori-daisuke/service-4.webp" alt="" width="720" height="480" loading="lazy" decoding="async" /></div><h3>データ消去・機密文書・金庫の処分</h3><p>PC・HDDのデータ消去、機密文書の回収・溶解処理（証明書発行）、金庫の回収・処分に対応します。</p></div>
      </div>
    </div>
  </section>


  <section className="sec sec--subtle">
    <div className="in">
      <div className="nv-sh"><h2>ご依頼の流れ</h2></div>
      <ol className="fl mt">
        <li><span className="ic-wrap"><svg className="ic"><use href="#i-phone"></use></svg></span><div><h3>ご相談</h3><p>オフィスの規模や家具の量、退去予定日をお知らせください。</p></div></li>
        <li><span className="ic-wrap"><svg className="ic"><use href="#i-clip"></use></svg></span><div><h3>現地確認</h3><p>担当者が伺い、家具とオフィスの状態を確認します。</p></div></li>
        <li><span className="ic-wrap"><svg className="ic"><use href="#i-doc"></use></svg></span><div><h3>お見積り</h3><p>買取額と、廃棄・原状回復の費用をまとめてご提示します。</p></div></li>
        <li><span className="ic-wrap"><svg className="ic"><use href="#i-truck"></use></svg></span><div><h3>搬出・原状回復</h3><p>退去日に合わせて、搬出から原状回復工事まで進めます。</p></div></li>
        <li><span className="ic-wrap"><svg className="ic"><use href="#i-check"></use></svg></span><div><h3>完了</h3><p>何もない状態で、オフィスをお返しいただけます。</p></div></li>
      </ol>
    </div>
  </section>


  <section className="sec">
    <div className="in" style={{"maxWidth":"var(--container-narrow)"}}>
      <div className="nv-sh"><h2>よくある質問</h2></div>
      <div className="nv-faq mt">
        <details><summary><span className="q">Q</span><span>どのくらいの量から対応できますか？</span><span className="pm"></span></summary><div className="nv-faq__a"><span className="a">A</span><p>少量のオフィス家具から、フロア全体の撤去まで対応可能です。デスク数台でも、ワンフロア丸ごとでも問題ありません。</p><span></span></div></details>
        <details><summary><span className="q">Q</span><span>見積りは無料ですか？</span><span className="pm"></span></summary><div className="nv-faq__a"><span className="a">A</span><p>はい、出張・見積りはすべて無料です。写真や簡単なリストだけでも、概算の査定ができます。</p><span></span></div></details>
        <details><summary><span className="q">Q</span><span>原状回復はどこまで対応できますか？</span><span className="pm"></span></summary><div className="nv-faq__a"><span className="a">A</span><p>床補修、壁補修、配線撤去など、ビル管理会社の基準に合わせて対応します。</p><span></span></div></details>
        <details><summary><span className="q">Q</span><span>東京以外にも対応していますか？</span><span className="pm"></span></summary><div className="nv-faq__a"><span className="a">A</span><p>現在は東京都内限定で対応しています。都内のビル基準に精通しているため、スピード対応が可能です。</p><span></span></div></details>
        <details><summary><span className="q">Q</span><span>機密情報がある家具や機器も処分できますか？</span><span className="pm"></span></summary><div className="nv-faq__a"><span className="a">A</span><p>PC・HDDのデータ消去、機密文書の溶解処理（証明書発行）、金庫の処分など、セキュリティが必要な作業にも対応しています。</p><span></span></div></details>
      </div>
    </div>
  </section>


  <section className="cta2">
    <div className="cta2__in">
      <div className="nv-sh">
        <h2>まずはお気軽にご相談ください</h2>
        <p>オフィスの規模や家具の量に応じて、最適な進め方をご提案します。写真や簡単なリストだけでも査定可能です。出張・見積りはすべて無料です。</p>
      </div>
      <Link className="nv-btn nv-btn--on-brand nv-btn--lg" href="/inquiry/">相談する</Link>
    </div>
  </section>

</main>
    </>
  );
}
