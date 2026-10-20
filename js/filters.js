(function () {
  function getVisibleProducts(products, filters = {}) {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter((product) => product.category === filters.category);
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter((product) => {
        const haystack = [
          product.brand,
          product.name,
          product.model,
          product.processor,
          product.generation,
          product.ram,
          product.storage,
          product.category,
          product.operatingSystem
        ].join(" ").toLowerCase();
        return haystack.includes(query);
      });
    }

    if (filters.brand) {
      filtered = filtered.filter((product) => product.brand === filters.brand);
    }

    if (filters.priceMax) {
      filtered = filtered.filter((product) => Number(product.price) <= Number(filters.priceMax));
    }

    if (filters.ram) {
      filtered = filtered.filter((product) => product.ram === filters.ram);
    }

    if (filters.storage) {
      filtered = filtered.filter((product) => product.storage === filters.storage);
    }

    if (filters.processor) {
      filtered = filtered.filter((product) => product.processor === filters.processor);
    }

    if (filters.generation) {
      filtered = filtered.filter((product) => product.generation === filters.generation);
    }

    if (filters.touchscreen) {
      filtered = filtered.filter((product) => product.touchscreen);
    }

    if (filters.x360) {
      filtered = filtered.filter((product) => product.x360);
    }

    if (filters.macbook) {
      filtered = filtered.filter((product) => product.brand === "Apple");
    }

    if (filters.windows) {
      filtered = filtered.filter((product) =>
        (product.operatingSystem || "").toLowerCase().includes("windows")
      );
    }

    if (filters.condition) {
      filtered = filtered.filter((product) => product.condition === filters.condition);
    }

    if (filters.dealsOnly) {
      filtered = filtered.filter((product) => product.deal);
    }

    return filtered;
  }

  function sortProducts(products, sortKey) {
    const sorted = [...products];

    switch (sortKey) {
      case "price-low":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        sorted.sort((a, b) => Number(b.stockCount || 0) - Number(a.stockCount || 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.price) - Number(a.price));
    }

    return sorted;
  }

  window.TechHiveFilters = {
    getVisibleProducts,
    sortProducts
  };
})();
