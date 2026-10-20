(function () {
  const STORAGE_KEY = "techhive-cart";

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addItem(product) {
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        quantity: 1,
        image: product.image,
        brand: product.brand
      });
    }

    writeCart(cart);
    return cart;
  }

  function updateQuantity(id, delta) {
    const cart = readCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return cart;

    item.quantity += delta;
    if (item.quantity <= 0) {
      const filtered = cart.filter((entry) => entry.id !== id);
      writeCart(filtered);
      return filtered;
    }

    writeCart(cart);
    return cart;
  }

  function removeItem(id) {
    const filtered = readCart().filter((item) => item.id !== id);
    writeCart(filtered);
    return filtered;
  }

  function clearCart() {
    writeCart([]);
    return [];
  }

  function getCart() {
    return readCart();
  }

  function getSubtotal(items = getCart()) {
    return items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }

  window.TechHiveCart = {
    readCart,
    writeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCart,
    getSubtotal
  };
})();
