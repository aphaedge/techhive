(function () {
  function setYear() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;
    const cart = window.TechHiveCart ? window.TechHiveCart.getCart() : [];
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    cartCount.textContent = String(count);
  }

  function renderCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const cartItems = document.getElementById("cartItems");
    const cartSubtotal = document.getElementById("cartSubtotal");
    if (!drawer || !cartItems || !cartSubtotal) return;

    const items = window.TechHiveCart ? window.TechHiveCart.getCart() : [];
    if (!items.length) {
      cartItems.innerHTML = '<div class="empty-cart">Your cart is empty. Add a few laptops or accessories to get started.</div>';
      cartSubtotal.textContent = "KSh 0";
      return;
    }

    cartItems.innerHTML = items.map((item) => `
      <div class="cart-item">
        <img src="${item.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"}" alt="${item.name}" />
        <div>
          <h4>${item.name}</h4>
          <div class="cart-item-meta">${window.formatPrice(item.price)}</div>
          <div class="cart-item-actions">
            <button type="button" class="quantity-toggle" data-cart-decrease="${item.id}">−</button>
            <span class="quantity-value">${item.quantity}</span>
            <button type="button" class="quantity-toggle" data-cart-increase="${item.id}">+</button>
          </div>
        </div>
        <button type="button" class="icon-button" data-cart-remove="${item.id}" aria-label="Remove ${item.name}">Remove</button>
      </div>
    `).join("");

    const subtotal = window.TechHiveCart.getSubtotal(items);
    cartSubtotal.textContent = window.formatPrice(subtotal);
  }

  function renderComparisonPanel() {
    const panel = document.getElementById("comparisonPanel");
    if (!panel) return;

    const ids = JSON.parse(localStorage.getItem("techhive-compare") || "[]");
    const products = ids.map((id) => window.getProductById(id)).filter(Boolean).slice(0, 3);

    if (!products.length) {
      panel.innerHTML = "<h3>Compare laptops</h3><p>Select up to 3 laptops to compare their specs and price.</p>";
      return;
    }

    const specs = [
      { key: "price", label: "Price", value: (product) => window.formatPrice(product.price) },
      { key: "processor", label: "Processor", value: (product) => product.processor || "Not specified" },
      { key: "generation", label: "Generation", value: (product) => product.generation || "Not specified" },
      { key: "ram", label: "RAM", value: (product) => product.ram || "Not specified" },
      { key: "storage", label: "Storage", value: (product) => product.storage || "Not specified" },
      { key: "screenSize", label: "Screen size", value: (product) => product.screenSize || "Not specified" },
      { key: "touchscreen", label: "Touchscreen", value: (product) => product.touchscreen ? "Yes" : "No" },
      { key: "x360", label: "X360", value: (product) => product.x360 ? "Yes" : "No" },
      { key: "graphics", label: "Graphics", value: (product) => product.graphics || "Not specified" },
      { key: "operatingSystem", label: "Operating system", value: (product) => product.operatingSystem || "Not specified" }
    ];

    panel.innerHTML = `
      <h3>Compare selected laptops</h3>
      <div class="compare-items">
        ${products.map((product) => `<span class="compare-pill">${product.name} <button class="link-button" type="button" data-remove-compare="${product.id}">remove</button></span>`).join("")}
      </div>
      <div class="compare-table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              ${products.map((product) => `<th>${product.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${specs.map((spec) => `
              <tr>
                <th>${spec.label}</th>
                ${products.map((product) => `<td>${spec.value(product)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindCartEvents() {
    const toggle = document.getElementById("cartToggle");
    const drawer = document.getElementById("cartDrawer");
    const closeCart = document.getElementById("closeCart");
    const continueShopping = document.getElementById("continueShopping");
    const checkoutCart = document.getElementById("checkoutCart");
    const clearCart = document.getElementById("clearCart");

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (!drawer) return;
        drawer.classList.toggle("open");
        drawer.setAttribute("aria-hidden", String(!drawer.classList.contains("open")));
      });
    }

    if (closeCart) {
      closeCart.addEventListener("click", () => {
        if (!drawer) return;
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
      });
    }

    if (continueShopping) {
      continueShopping.addEventListener("click", () => {
        if (drawer) {
          drawer.classList.remove("open");
          drawer.setAttribute("aria-hidden", "true");
        }
      });
    }

    if (checkoutCart) {
      checkoutCart.addEventListener("click", () => {
        const items = window.TechHiveCart.getCart();
        if (!items.length) return;
        const message = window.whatsAppCartMessage(items);
        const link = window.buildWhatsAppLink(message);
        window.open(link, "_blank", "noopener,noreferrer");
      });
    }

    if (clearCart) {
      clearCart.addEventListener("click", () => {
        window.TechHiveCart.clearCart();
        updateCartCount();
        renderCartDrawer();
      });
    }

    document.addEventListener("click", (event) => {
      const cartAddButton = event.target.closest("[data-add-to-cart]");
      if (cartAddButton) {
        const product = window.getProductById(cartAddButton.dataset.addToCart);
        if (!product) return;
        const cart = window.TechHiveCart.addItem(product);
        updateCartCount();
        renderCartDrawer();
        document.getElementById("cartDrawer")?.classList.add("open");
      }

      const whatsappProduct = event.target.closest("[data-whatsapp-product]");
      if (whatsappProduct) {
        const product = window.getProductById(whatsappProduct.dataset.whatsappProduct);
        if (!product) return;
        const message = window.whatsAppProductMessage(product);
        const link = window.buildWhatsAppLink(message);
        window.open(link, "_blank", "noopener,noreferrer");
      }

      const compareButton = event.target.closest("[data-compare-id]");
      if (compareButton) {
        const compareIds = JSON.parse(localStorage.getItem("techhive-compare") || "[]");
        const productId = compareButton.dataset.compareId;
        const nextList = compareIds.includes(productId) ? compareIds : [...compareIds, productId].slice(0, 3);
        localStorage.setItem("techhive-compare", JSON.stringify(nextList));
        renderComparisonPanel();
      }

      const compareRemove = event.target.closest("[data-remove-compare]");
      if (compareRemove) {
        const ids = JSON.parse(localStorage.getItem("techhive-compare") || "[]");
        const filtered = ids.filter((id) => id !== compareRemove.dataset.removeCompare);
        localStorage.setItem("techhive-compare", JSON.stringify(filtered));
        renderComparisonPanel();
      }

      const cartIncrease = event.target.closest("[data-cart-increase]");
      if (cartIncrease) {
        const updated = window.TechHiveCart.updateQuantity(cartIncrease.dataset.cartIncrease, 1);
        window.TechHiveCart.writeCart(updated);
        updateCartCount();
        renderCartDrawer();
      }

      const cartDecrease = event.target.closest("[data-cart-decrease]");
      if (cartDecrease) {
        const updated = window.TechHiveCart.updateQuantity(cartDecrease.dataset.cartDecrease, -1);
        window.TechHiveCart.writeCart(updated);
        updateCartCount();
        renderCartDrawer();
      }

      const cartRemove = event.target.closest("[data-cart-remove]");
      if (cartRemove) {
        const updated = window.TechHiveCart.removeItem(cartRemove.dataset.cartRemove);
        window.TechHiveCart.writeCart(updated);
        updateCartCount();
        renderCartDrawer();
      }
    });
  }

  function renderFeaturedProducts() {
    const container = document.getElementById("featuredProducts");
    if (!container) return;
    const featured = window.getProducts().filter((product) => product.featured && product.type !== "accessory").slice(0, 8);
    container.innerHTML = featured.map((product) => window.renderProductCard(product)).join("");
  }

  function renderCategories() {
    const container = document.getElementById("categoryGrid");
    if (!container) return;
    const categories = [
      { name: "Business Laptops", description: "Reliable work-ready laptops for offices and study." },
      { name: "Touchscreen Laptops", description: "Flexible devices for browsing, writing and presentations." },
      { name: "2-in-1 / X360", description: "Convertible laptops for creative and mobile users." },
      { name: "Premium Laptops", description: "High-spec devices for intensive daily use." },
      { name: "Budget Laptops", description: "Affordable options for light use and study." },
      { name: "MacBooks", description: "Performance and portability for professional use." },
      { name: "Laptop Accessories", description: "Add-ons and productivity essentials for your setup." }
    ];

    const featuredCategories = categories.filter((category) =>
      window.getProducts().some((product) => product.category === category.name || category.name === "Laptop Accessories")
    );

    container.innerHTML = featuredCategories.map((category) => `
      <a href="shop.html${category.name === "Laptop Accessories" ? "?category=Accessories" : `?category=${encodeURIComponent(category.name)}`}" class="category-card">
        <h3>${category.name}</h3>
        <p>${category.description}</p>
      </a>
    `).join("");
  }

  function renderBudgetCards() {
    const container = document.getElementById("budgetGrid");
    if (!container) return;
    const ranges = [
      { label: "Under KSh 20,000", value: 20000 },
      { label: "KSh 20,000–30,000", value: 30000 },
      { label: "KSh 30,000–40,000", value: 40000 },
      { label: "KSh 40,000–60,000", value: 60000 },
      { label: "Above KSh 60,000", value: 60001 }
    ];

    container.innerHTML = ranges.map((range) => `
      <a href="shop.html?price=${range.value}" class="budget-card">
        <h3>${range.label}</h3>
        <p>Explore devices in this range.</p>
      </a>
    `).join("");
  }

  function handleRecommendation() {
    const form = document.getElementById("recommendationForm");
    const result = document.getElementById("recommendationResult");
    if (!form || !result) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const budget = Number(document.getElementById("budgetSelect")?.value || 0);
      const usage = document.getElementById("usageSelect")?.value || "";
      let products = window.getProducts().filter((product) => product.type === "laptop" && Number(product.price) > 0);

      if (budget > 0) {
        if (budget <= 20000) products = products.filter((product) => Number(product.price) < 20000);
        else if (budget <= 30000) products = products.filter((product) => Number(product.price) >= 20000 && Number(product.price) <= 30000);
        else if (budget <= 40000) products = products.filter((product) => Number(product.price) > 30000 && Number(product.price) <= 40000);
        else if (budget <= 60000) products = products.filter((product) => Number(product.price) > 40000 && Number(product.price) <= 60000);
        else products = products.filter((product) => Number(product.price) > 60000);
      }

      if (usage === "School") {
        products = products.filter((product) => Number(product.price) < 50000 || product.brand === "Apple");
      }
      if (usage === "Office/Business") {
        products = products.filter((product) => product.category === "Business Laptops" || product.brand === "HP" || product.brand === "Dell" || product.brand === "Lenovo");
      }
      if (usage === "Programming") {
        products = products.filter((product) => product.processor && product.processor.toLowerCase().includes("i7") || product.processor && product.processor.toLowerCase().includes("m1"));
      }
      if (usage === "Design") {
        products = products.filter((product) => product.touchscreen || product.brand === "Apple" || product.graphics && product.graphics.toLowerCase().includes("iris"));
      }
      if (usage === "General use") {
        products = products.filter((product) => Number(product.price) <= 45000);
      }
      if (usage === "Travel") {
        products = products.filter((product) => product.screenSize && product.screenSize.includes("13") || product.brand === "Apple");
      }
      if (usage === "Premium/Professional use") {
        products = products.filter((product) => Number(product.price) > 60000 || product.brand === "Apple");
      }

      const selected = products.slice(0, 3);
      if (selected.length === 0) {
        result.innerHTML = "<p>No matching products were found for that budget and use. Try a wider budget range or browse all laptops.</p>";
        return;
      }

      result.innerHTML = `
        <p><strong>Recommended for you:</strong></p>
        <ul>
          ${selected.map((product) => `<li><a href="product.html?id=${product.id}">${product.name} — ${window.formatPrice(product.price)}</a></li>`).join("")}
        </ul>
      `;
    });
  }

  function setupNavigation() {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  function initShopPage() {
    const query = new URLSearchParams(window.location.search);
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    const allProducts = window.getProducts().filter((product) => product.type !== "accessory");
    const priceParam = query.get("price");
    const categoryParam = query.get("category");
    const dealsOnly = query.get("deals") === "true";
    const searchTerm = query.get("q");

    const products = allProducts.filter((product) => {
      if (priceParam) {
        const cap = Number(priceParam);
        const inRange = cap <= 20000 ? Number(product.price) < 20000 : cap <= 30000 ? Number(product.price) >= 20000 && Number(product.price) <= 30000 : cap <= 40000 ? Number(product.price) > 30000 && Number(product.price) <= 40000 : cap <= 60000 ? Number(product.price) > 40000 && Number(product.price) <= 60000 : Number(product.price) > 60000;
        if (!inRange) return false;
      }
      if (categoryParam && product.category !== categoryParam) return false;
      if (dealsOnly && !product.deal) return false;
      if (searchTerm) {
        const haystack = [product.brand, product.name, product.model, product.processor, product.generation, product.ram, product.storage, product.category].join(" ").toLowerCase();
        if (!haystack.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });

    productGrid.innerHTML = products.map((product) => window.renderProductCard(product)).join("") || "<div class='empty-cart'>No products match your filters.</div>";
    const summary = document.getElementById("resultsSummary");
    if (summary) summary.textContent = `Showing ${products.length} product${products.length === 1 ? "" : "s"}`;
  }

  function initFilters() {
    const brandFilter = document.getElementById("brandFilter");
    const ramFilter = document.getElementById("ramFilter");
    const storageFilter = document.getElementById("storageFilter");
    const processorFilter = document.getElementById("processorFilter");
    const generationFilter = document.getElementById("generationFilter");
    const conditionFilter = document.getElementById("conditionFilter");
    const sortFilter = document.getElementById("sortFilter");
    const searchBox = document.getElementById("shopSearch");
    const clearFilters = document.getElementById("clearFilters");
    const priceFilter = document.getElementById("priceFilter");
    const touchscreen = document.getElementById("touchscreenFilter");
    const x360 = document.getElementById("x360Filter");
    const macbook = document.getElementById("macbookFilter");
    const windows = document.getElementById("windowsFilter");
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    const products = window.getProducts().filter((product) => product.type !== "accessory");

    const populate = (select, items) => {
      const unique = [...new Set(items.filter(Boolean))];
      select.innerHTML = `<option value="">All</option>${unique.map((value) => `<option value="${value}">${value}</option>`).join("")}`;
    };

    populate(brandFilter, products.map((product) => product.brand));
    populate(ramFilter, products.map((product) => product.ram));
    populate(storageFilter, products.map((product) => product.storage));
    populate(processorFilter, products.map((product) => product.processor));
    populate(generationFilter, products.map((product) => product.generation));
    populate(conditionFilter, products.map((product) => product.condition));

    function refreshProducts() {
      const filters = {
        q: searchBox ? searchBox.value.trim() : "",
        brand: brandFilter ? brandFilter.value : "",
        priceMax: priceFilter ? priceFilter.value : "",
        ram: ramFilter ? ramFilter.value : "",
        storage: storageFilter ? storageFilter.value : "",
        processor: processorFilter ? processorFilter.value : "",
        generation: generationFilter ? generationFilter.value : "",
        touchscreen: touchscreen ? touchscreen.checked : false,
        x360: x360 ? x360.checked : false,
        macbook: macbook ? macbook.checked : false,
        windows: windows ? windows.checked : false,
        condition: conditionFilter ? conditionFilter.value : ""
      };

      let visible = window.TechHiveFilters.getVisibleProducts(products, filters);
      const sortKey = sortFilter ? sortFilter.value : "featured";
      visible = window.TechHiveFilters.sortProducts(visible, sortKey);

      productGrid.innerHTML = visible.length ? visible.map((product) => window.renderProductCard(product)).join("") : "<div class='empty-cart'>No products match the selected filters.</div>";
      const summary = document.getElementById("resultsSummary");
      if (summary) summary.textContent = `Showing ${visible.length} product${visible.length === 1 ? "" : "s"}`;
    }

    [brandFilter, priceFilter, ramFilter, storageFilter, processorFilter, generationFilter, conditionFilter, sortFilter, searchBox, touchscreen, x360, macbook, windows].forEach((element) => {
      if (element) {
        element.addEventListener("input", refreshProducts);
        element.addEventListener("change", refreshProducts);
      }
    });

    if (clearFilters) {
      clearFilters.addEventListener("click", () => {
        if (searchBox) searchBox.value = "";
        if (brandFilter) brandFilter.value = "";
        if (priceFilter) priceFilter.value = "";
        if (ramFilter) ramFilter.value = "";
        if (storageFilter) storageFilter.value = "";
        if (processorFilter) processorFilter.value = "";
        if (generationFilter) generationFilter.value = "";
        if (conditionFilter) conditionFilter.value = "";
        if (touchscreen) touchscreen.checked = false;
        if (x360) x360.checked = false;
        if (macbook) macbook.checked = false;
        if (windows) windows.checked = false;
        if (sortFilter) sortFilter.value = "featured";
        refreshProducts();
      });
    }

    refreshProducts();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    setupNavigation();
    bindCartEvents();
    renderCartDrawer();
    renderFeaturedProducts();
    renderCategories();
    renderBudgetCards();
    handleRecommendation();
    initShopPage();
    initFilters();
    renderComparisonPanel();
    updateCartCount();
  });
})();
