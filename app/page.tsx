"use client";

import { useEffect, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { loadCart, saveCart, type StoredCartLine } from "@/lib/cart-storage";

export default function ProductListPage() {
  const [lines, setLines] = useState<StoredCartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLines(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(lines);
  }, [lines, loaded]);

  const addToCart = (productId: string) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const totalCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div>
      <h1>商品一覧</h1>
      <p>カートに {totalCount} 点入っています。</p>
      <ul className="product-list">
        {PRODUCTS.map((product) => (
          <li key={product.id} className="product-card">
            <span>
              {product.name}
              {product.isSaleItem && <span className="sale-badge">SALE</span>}
              <br />
              <span className="price">
                ¥{product.unitPrice.toLocaleString()}
              </span>
            </span>
            <button onClick={() => addToCart(product.id)}>カートに追加</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
