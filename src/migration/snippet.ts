interface Order {
    id: string;
    items: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
}

// 1) Resolve discount amount from the optional code.
// 2) Compute subtotal by summing (price * quantity) for each item.
// 3) Subtract the discount from subtotal and return the result.
function processOrder(order: Order, discountCode?: string): number {
    // `applyDiscount` returns a fixed amount (not a percentage).
    const discountValue: number = applyDiscount(discountCode);

    // Reduce all items into a single subtotal value
    const subtotal: number = order.items.reduce((acc: number, item) => {
        // Add each line total to the running accumulator
        return acc + (item.price * item.quantity);
    }, 0);

    // Final payable total after discount is applied
    return subtotal - discountValue;
}

// Unknown or missing codes safely resolve to 0.
function applyDiscount(code?: string): number {
    const codes: Record<string, number> = {
        SAVE10: 10,
        SAVE20: 20
    };

    // If a code exists, return mapped value; otherwise return 0.
    // `?? 0` also protects against unknown codes.
    return code ? (codes[code] ?? 0) : 0;
}


const myOrder: Order = {
    id: "ORD-001",
    items: [
        { name: "Mechanical Keyboard", price: 150, quantity: 1 },
        { name: "Type-C Cable", price: 20, quantity: 2 }
    ]
};

// With SAVE10, final total is 190 - 10 = 180.
console.log(processOrder(myOrder, "SAVE10")); // 180
// Without a discount code, total remains 190.
console.log(processOrder(myOrder));             // 190
