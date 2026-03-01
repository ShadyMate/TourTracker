// A simple order processor
interface Order {
    id: string;
    items: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
}

function processOrder(order: Order, discountCode?: string): number {
    const discountValue: number = applyDiscount(discountCode);

    const subtotal: number = order.items.reduce((acc: number, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    return subtotal - discountValue;
}

function applyDiscount(code?: string): number {
    const codes: Record<string, number> = {
        SAVE10: 10,
        SAVE20: 20
    };

    return code ? (codes[code] ?? 0) : 0;
}

// Example usage:
const myOrder: Order = {
    id: "ORD-001",
    items: [
        { name: "Mechanical Keyboard", price: 150, quantity: 1 },
        { name: "Type-C Cable", price: 20, quantity: 2 }
    ]
};

console.log(processOrder(myOrder, "SAVE10")); // Works: 180
console.log(processOrder(myOrder));             // Works: 190 (no discount applied)
