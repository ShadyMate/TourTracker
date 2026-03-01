// A simple order processor
function processOrder(order, discountCode) {
    // BUG: If discountCode is missing, this might return NaN or break 
    // depending on how applyDiscount handles 'undefined'
    const discountValue = applyDiscount(discountCode);
    
    const subtotal = order.items.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    return subtotal - discountValue;
}

function applyDiscount(code) {
    const codes = {
        "SAVE10": 10,
        "SAVE20": 20
    };
    // The bug: If code isn't in the object, this returns undefined.
    // Subtracting undefined from a number results in NaN.
    return codes[code]; 
}

// Example usage:
const myOrder = {
    id: "ORD-001",
    items: [
        { name: "Mechanical Keyboard", price: 150, quantity: 1 },
        { name: "Type-C Cable", price: 20, quantity: 2 }
    ]
};

console.log(processOrder(myOrder, "SAVE10")); // Works: 180
console.log(processOrder(myOrder));           // Returns NaN! (The bug)