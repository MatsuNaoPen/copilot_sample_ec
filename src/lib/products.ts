/** 商品カタログ（デモ用の静的データ）。 */
export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  isSaleItem: boolean;
}

export const PRODUCTS: Product[] = [
  { id: "coffee-beans", name: "コーヒー豆 200g", unitPrice: 1200, isSaleItem: false },
  { id: "drip-set", name: "ドリップセット", unitPrice: 3800, isSaleItem: false },
  { id: "mug", name: "マグカップ", unitPrice: 1500, isSaleItem: false },
  { id: "sale-tumbler", name: "【セール】タンブラー", unitPrice: 980, isSaleItem: true },
  { id: "sale-filter", name: "【セール】ペーパーフィルター 100枚", unitPrice: 350, isSaleItem: true },
];
