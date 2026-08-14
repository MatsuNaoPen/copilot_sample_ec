"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import {
  calculateCharge,
  PricingError,
  type Cart,
  type PricingResult,
} from "@/lib/pricing";
import {
  clearCart,
  loadCart,
  saveCart,
  type StoredCartLine,
} from "@/lib/cart-storage";

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<StoredCartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    setLines(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(lines);
  }, [lines, loaded]);

  const cart: Cart = useMemo(
    () => ({
      items: lines.flatMap((line) => {
        const product = PRODUCTS.find((p) => p.id === line.productId);
        if (!product) return [];
        return [
          {
            unitPrice: product.unitPrice,
            quantity: line.quantity,
            isSaleItem: product.isSaleItem,
          },
        ];
      }),
      isMember,
      couponCode: couponCode === "" ? null : couponCode,
    }),
    [lines, isMember, couponCode],
  );

  let result: PricingResult | null = null;
  let errorMessage: string | null = null;
  try {
    result = calculateCharge(cart);
  } catch (error) {
    if (error instanceof PricingError) {
      errorMessage = error.message;
    } else {
      throw error;
    }
  }

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  };

  const checkout = () => {
    clearCart();
    router.push("/thanks");
  };

  return (
    <div>
      <h1>カート</h1>
      {lines.length === 0 ? (
        <p>カートは空です。</p>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>単価</th>
              <th>数量</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const product = PRODUCTS.find((p) => p.id === line.productId);
              if (!product) return null;
              return (
                <tr key={line.productId}>
                  <td>
                    {product.name}
                    {product.isSaleItem && (
                      <span className="sale-badge">SALE</span>
                    )}
                  </td>
                  <td>¥{product.unitPrice.toLocaleString()}</td>
                  <td>{line.quantity}</td>
                  <td>
                    <button
                      className="secondary"
                      onClick={() => removeLine(line.productId)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={isMember}
            onChange={(e) => setIsMember(e.target.checked)}
          />{" "}
          会員です（非セール品が10%オフ）
        </label>
        <label>
          クーポンコード:{" "}
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="COUPON500"
          />
        </label>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      {result && (
        <div className="summary">
          <span>小計: ¥{result.subtotal.toLocaleString()}</span>
          <span>割引: -¥{result.discount.toLocaleString()}</span>
          <span>送料: ¥{result.shipping.toLocaleString()}</span>
          <span className="total">合計: ¥{result.total.toLocaleString()}</span>
        </div>
      )}

      <div className="actions">
        <button
          onClick={checkout}
          disabled={lines.length === 0 || errorMessage !== null}
        >
          注文する
        </button>
      </div>
    </div>
  );
}
