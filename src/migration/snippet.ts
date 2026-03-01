// Represents one purchasable line item in an order.
export type OrderItem = {
  // Display name of the item.
  name: string;
  // Unit price for a single item (e.g., 19.99).
  price: number;
  // Number of units purchased.
  quantity: number;
};

// Represents a customer order containing multiple items.
export type Order = {
  // Unique order identifier.
  id: string;
  // All line items included in this order.
  items: OrderItem[];
};

// Discount lookup table by code.
// Value is the discount rate (0.1 = 10% off).
const DISCOUNTS: Record<string, number> = {
  SAVE10: 0.1
};

// Calculates final order total after applying an optional discount code.
export function processOrder(order: Order, discountCode?: string): number {
  // Sum all line items: (price * quantity) for each item.
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // If a code is provided, use its rate; unknown codes default to 0.
  // If no code is provided, discount is also 0.
  const discountRate = discountCode ? (DISCOUNTS[discountCode] ?? 0) : 0;

  // Apply discount rate to subtotal and return final total.
  return subtotal * (1 - discountRate);
}
