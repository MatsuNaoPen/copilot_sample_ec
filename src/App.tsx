// デモ開始時点のプレースホルダー画面。
// ここに料金計算 UI と src/pricing.ts のロジックをこれから実装します。
// 進め方は README.md と docs/minutes/kickoff_meeting.md を参照してください。
export default function App() {
  return (
    <main className="container">
      <h1>ECカート 料金計算デモ</h1>
      <p className="note">
        このサービスは起動できますが、料金計算はまだ実装されていません。
        <br />
        議事録 <code>docs/minutes/kickoff_meeting.md</code> から要件・設計・テストを起こし、
        <code>src/pricing.ts</code>（料金計算ロジック）と、この <code>App.tsx</code>（カート UI）を
        実装してください。
      </p>
    </main>
  )
}
