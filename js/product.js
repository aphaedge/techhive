(function () {
  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function renderProductPage() {
    const product = window.getProductById(getProductIdFromUrl());
    const container = document.getElementById("productDetail");
    if (!container) return;

    if (!product) {
      container.innerHTML = `
        <div class="empty-cart">
          <h2>Product not found</h2>
          <p>The product you are looking for is not available in the current catalogue.</p>
          <a href="shop.html" class="primary-button">Back to shop</a>
        </div>
      `;
      return;
    }

    document.title = `${product.name} | TechHive Kenya`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", `${product.name} ${product.processor || "Laptop"} ${product.ram || ""} ${product.storage || ""} - view stock, specs and pricing at TechHive Kenya.`);
    }

    container.innerHTML = `
      <article class="product-detail-shell" aria-label="${product.name} details">
        <div class="detail-gallery">
          <div class="detail-main-image">
            <img src="${product.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"}" alt="${product.brand} ${product.name}" />
          </div>
        </div>

        <div class="detail-content">
          <span class="eyebrow">${product.category}</span>
          <h1>${product.name}</h1>
          <div class="detail-meta">
            <span class="product-badge">${product.brand}</span>
            <span class="product-badge">${product.stockStatus || "Needs confirmation"}</span>
            ${product.touchscreen ? '<span class="product-badge">Touchscreen</span>' : ""}
            ${product.x360 ? '<span class="product-badge">X360</span>' : ""}
          </div>
          <div class="detail-price">${window.formatPrice(product.price)}</div>
          <div class="detail-actions">
            <button type="button" class="primary-button" data-add-to-cart="${product.id}">Add to cart</button>
            <a href="${window.buildWhatsAppLink(window.whatsAppProductMessage(product))}" class="secondary-button" target="_blank" rel="noreferrer">Order on WhatsApp</a>
          </div>

          <div class="spec-grid">
            <div class="spec-item"><span>Brand</span><strong>${product.brand || "Not specified"}</strong></div>
            <div class="spec-item"><span>Model</span><strong>${product.model || "Not specified"}</strong></div>
            <div class="spec-item"><span>Processor</span><strong>${product.processor || "Not specified"}</strong></div>
            <div class="spec-item"><span>Generation</span><strong>${product.generation || "Not specified"}</strong></div>
            <div class="spec-item"><span>RAM</span><strong>${product.ram || "Not specified"}</strong></div>
            <div class="spec-item"><span>Storage</span><strong>${product.storage || "Not specified"}</strong></div>
            <div class="spec-item"><span>Screen size</span><strong>${product.screenSize || "Not specified"}</strong></div>
            <div class="spec-item"><span>Touchscreen</span><strong>${product.touchscreen ? "Yes" : "No"}</strong></div>
            <div class="spec-item"><span>X360 / Convertible</span><strong>${product.x360 ? "Yes" : "No"}</strong></div>
            <div class="spec-item"><span>Operating system</span><strong>${product.operatingSystem || "Not specified"}</strong></div>
            <div class="spec-item"><span>Graphics</span><strong>${product.graphics || "Not specified"}</strong></div>
            <div class="spec-item"><span>Accessories</span><strong>${product.accessories || "Not specified"}</strong></div>
            <div class="spec-item"><span>Condition</span><strong>${product.condition || "Not specified"}</strong></div>
            <div class="spec-item"><span>Availability</span><strong>${product.stockStatus || "Needs confirmation"}</strong></div>
            <div class="spec-item"><span>Category</span><strong>${product.category || "Not specified"}</strong></div>
          </div>

          <div class="spec-item"><span>Additional notes</span><strong>${product.description || "Not specified"}</strong></div>
        </div>
      </article>
    `;

    const addToCartButton = document.querySelector('[data-add-to-cart]');
    if (addToCartButton) {
      addToCartButton.addEventListener("click", () => {
        const cart = window.TechHiveCart.addItem(product);
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById("cartCount");
        if (cartCount) cartCount.textContent = String(count);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", renderProductPage);
})();
