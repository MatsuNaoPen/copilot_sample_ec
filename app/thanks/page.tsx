import Link from "next/link";

export default function ThanksPage() {
  return (
    <div>
      <h1>ご注文ありがとうございました</h1>
      <p>ご注文を受け付けました（デモのため実際の注文は発生しません）。</p>
      <p>
        <Link href="/">商品一覧に戻る</Link>
      </p>
    </div>
  );
}
