import { useMemo, useState } from 'react'
import {
  calculateCharge,
  PricingError,
  type Cart,
  type CartItem,
  type PricingResult,
} from './pricing'

interface ItemRow {
  unitPrice: string
  quantity: string
  isSaleItem: boolean
}

const INITIAL_ROWS: ItemRow[] = [
  { unitPrice: '1000', quantity: '2', isSaleItem: false },
  { unitPrice: '2000', quantity: '1', isSaleItem: true },
]

const yen = (value: number): string => `${value.toLocaleString('ja-JP')} 円`

export default function App() {
  const [rows, setRows] = useState<ItemRow[]>(INITIAL_ROWS)
  const [isMember, setIsMember] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  // 入力が変わるたびに計算し直す。PricingError は握りつぶさず、画面に表示する。
  const { result, error } = useMemo<{
    result: PricingResult | null
    error: string | null
  }>(() => {
    const items: CartItem[] = rows.map((row) => ({
      unitPrice: Number(row.unitPrice),
      quantity: Number(row.quantity),
      isSaleItem: row.isSaleItem,
    }))
    const cart: Cart = {
      items,
      isMember,
      couponCode: couponCode.trim() === '' ? null : couponCode.trim(),
    }
    try {
      return { result: calculateCharge(cart), error: null }
    } catch (e) {
      if (e instanceof PricingError) {
        return { result: null, error: e.message }
      }
      throw e
    }
  }, [rows, isMember, couponCode])

  const updateRow = (index: number, patch: Partial<ItemRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    )
  }

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { unitPrice: '0', quantity: '1', isSaleItem: false },
    ])

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index))

  return (
    <main className="container">
      <h1>ECカート 料金計算</h1>

      <table>
        <thead>
          <tr>
            <th>単価（円）</th>
            <th>数量</th>
            <th>セール品</th>
            <th aria-label="操作" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="number"
                  value={row.unitPrice}
                  onChange={(e) =>
                    updateRow(index, { unitPrice: e.target.value })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(index, { quantity: e.target.value })
                  }
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={row.isSaleItem}
                  onChange={(e) =>
                    updateRow(index, { isSaleItem: e.target.checked })
                  }
                />
              </td>
              <td>
                <button
                  type="button"
                  className="link"
                  onClick={() => removeRow(index)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className="secondary" onClick={addRow}>
        ＋ 商品を追加
      </button>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={isMember}
            onChange={(e) => setIsMember(e.target.checked)}
          />
          会員（10%割引）
        </label>
        <label>
          クーポンコード
          <input
            type="text"
            placeholder="例: SAVE500"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </label>
      </div>

      {error !== null && <p className="error">{error}</p>}

      {result !== null && (
        <section className="result">
          <dl>
            <dt>小計</dt>
            <dd>{yen(result.subtotal)}</dd>
            <dt>割引</dt>
            <dd>- {yen(result.discount)}</dd>
            <dt>送料</dt>
            <dd>{result.shipping === 0 ? '無料' : yen(result.shipping)}</dd>
            <div className="total" style={{ display: 'contents' }}>
              <dt>合計</dt>
              <dd>{yen(result.total)}</dd>
            </div>
          </dl>
        </section>
      )}
    </main>
  )
}
