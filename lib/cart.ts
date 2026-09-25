export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl: string | null;
};

const CART_KEY = "nusarasa-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(CART_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new Event("cart-updated")
  );
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  quantity: number
) {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) =>
      cartItem.productId === item.productId
  );

  if (existingItem) {
    existingItem.quantity = Math.min(
      existingItem.quantity + quantity,
      item.stock
    );
  } else {
    cart.push({
      ...item,
      quantity: Math.min(
        Math.max(quantity, 1),
        item.stock
      ),
    });
  }

  saveCart(cart);

  return cart;
}

export function removeFromCart(
  productId: string
) {
  const cart = getCart().filter(
    (item) => item.productId !== productId
  );

  saveCart(cart);

  return cart;
}

export function updateCartQuantity(
  productId: string,
  quantity: number
) {
  const cart = getCart();

  const item = cart.find(
    (cartItem) =>
      cartItem.productId === productId
  );

  if (!item) {
    return cart;
  }

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  item.quantity = Math.min(
    quantity,
    item.stock
  );

  saveCart(cart);

  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotal(
  cart: CartItem[]
) {
  return cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );
}

export function getCartCount(
  cart: CartItem[]
) {
  return cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );
}