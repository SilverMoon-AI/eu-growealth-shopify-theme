/**
 * Product page sticky bottom bar: sync price from #price-{sectionId}, qty with main quantity input,
 * trigger main Add to cart / Buy now buttons.
 */
(function () {
  function syncPriceFromDom(sectionId, root) {
    const totalEl = root.querySelector(`[data-sticky-total="${sectionId}"]`);
    const retailRow = root.querySelector(`[data-sticky-retail-row="${sectionId}"]`);
    const retailEl = root.querySelector(`[data-sticky-retail="${sectionId}"]`);
    const priceContainer = document.getElementById(`price-${sectionId}`);
    if (!priceContainer || !totalEl) return;

    const onSale = priceContainer.classList.contains('price--on-sale');
    if (onSale) {
      const saleEl = priceContainer.querySelector('.price__sale .price-item--sale');
      const compareEl = priceContainer.querySelector('.price__sale s.price-item--regular');
      if (saleEl) totalEl.textContent = saleEl.textContent.trim();
      if (compareEl && retailEl && retailRow) {
        retailEl.textContent = compareEl.textContent.trim();
        retailRow.removeAttribute('hidden');
      } else if (retailRow) {
        retailRow.setAttribute('hidden', '');
      }
    } else {
      const reg = priceContainer.querySelector('.price__regular .price-item--regular');
      if (reg) totalEl.textContent = reg.textContent.trim();
      if (retailRow) retailRow.setAttribute('hidden', '');
    }
  }

  function mainQuantityInput(sectionId) {
    return document.getElementById(`Quantity-${sectionId}`);
  }

  function syncStickyQtyFromMain(sectionId, stickyQty) {
    const main = mainQuantityInput(sectionId);
    if (!main || !stickyQty) return;
    stickyQty.value = main.value;
    copyQtyRules(main, stickyQty);
  }

  function syncMainQtyFromSticky(sectionId, stickyQty) {
    const main = mainQuantityInput(sectionId);
    if (!main || !stickyQty) return;
    let v = parseInt(stickyQty.value, 10);
    if (Number.isNaN(v) || v < 1) v = parseInt(main.min, 10) || 1;
    const max = main.getAttribute('max');
    if (max && v > parseInt(max, 10)) v = parseInt(max, 10);
    stickyQty.value = String(v);
    main.value = String(v);
    main.dispatchEvent(new Event('change', { bubbles: true }));
    main.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function copyQtyRules(main, sticky) {
    if (!main || !sticky) return;
    sticky.min = main.min;
    if (main.hasAttribute('max')) {
      sticky.max = main.max;
      sticky.setAttribute('max', main.getAttribute('max'));
    } else {
      sticky.removeAttribute('max');
    }
    sticky.step = main.step || '1';
  }

  function clampStickyQty(stickyQty, main) {
    if (!stickyQty || !main) return;
    let v = parseInt(stickyQty.value, 10);
    const min = parseInt(main.min, 10) || 1;
    const maxAttr = main.getAttribute('max');
    const max = maxAttr ? parseInt(maxAttr, 10) : null;
    if (Number.isNaN(v)) v = min;
    if (v < min) v = min;
    if (max != null && !Number.isNaN(max) && v > max) v = max;
    const step = parseInt(main.step, 10) || 1;
    if (step > 1) {
      const base = min;
      v = base + Math.round((v - base) / step) * step;
      if (max != null && v > max) v = max;
    }
    stickyQty.value = String(v);
  }

  function updateStickyButtonStates(sectionId, root) {
    const mainSubmit = document.getElementById(`ProductSubmitButton-${sectionId}`);
    const mainBuy = document.getElementById(`ProductBuyNowButton-${sectionId}`);
    const stickyAdd = root.querySelector('[data-sticky-add-to-cart]');
    const stickyBuy = root.querySelector('[data-sticky-buy-now]');
    if (stickyAdd && mainSubmit) {
      stickyAdd.disabled = mainSubmit.disabled;
      const ad = mainSubmit.getAttribute('aria-disabled');
      if (ad === 'true') stickyAdd.setAttribute('aria-disabled', 'true');
      else stickyAdd.removeAttribute('aria-disabled');
    }
    if (stickyBuy && mainBuy) {
      stickyBuy.disabled = mainBuy.disabled;
    } else if (stickyBuy && mainSubmit) {
      stickyBuy.disabled = mainSubmit.disabled;
    }
  }

  function initStickyBar(root) {
    const sectionId = root.dataset.sectionId;
    if (!sectionId) return;

    const stickyQty = root.querySelector('[data-sticky-quantity-input]');
    const mainQty = () => mainQuantityInput(sectionId);

    const refresh = () => {
      syncPriceFromDom(sectionId, root);
      syncStickyQtyFromMain(sectionId, stickyQty);
      copyQtyRules(mainQty(), stickyQty);
      updateStickyButtonStates(sectionId, root);
    };

    root.querySelector('[data-sticky-qty-decrease]')?.addEventListener('click', () => {
      const main = mainQty();
      if (!main || !stickyQty) return;
      syncStickyQtyFromMain(sectionId, stickyQty);
      const step = parseInt(main.step, 10) || 1;
      let v = parseInt(stickyQty.value, 10) - step;
      stickyQty.value = String(v);
      clampStickyQty(stickyQty, main);
      syncMainQtyFromSticky(sectionId, stickyQty);
    });

    root.querySelector('[data-sticky-qty-plus]')?.addEventListener('click', () => {
      const main = mainQty();
      if (!main || !stickyQty) return;
      syncStickyQtyFromMain(sectionId, stickyQty);
      const step = parseInt(main.step, 10) || 1;
      let v = parseInt(stickyQty.value, 10) + step;
      stickyQty.value = String(v);
      clampStickyQty(stickyQty, main);
      syncMainQtyFromSticky(sectionId, stickyQty);
    });

    stickyQty?.addEventListener('change', () => {
      const main = mainQty();
      if (!main) return;
      clampStickyQty(stickyQty, main);
      syncMainQtyFromSticky(sectionId, stickyQty);
    });

    mainQty()?.addEventListener('change', () => refresh());
    mainQty()?.addEventListener('input', () => syncStickyQtyFromMain(sectionId, stickyQty));

    subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      if (!event.data || event.data.sectionId !== sectionId) return;
      requestAnimationFrame(refresh);
    });

    root.querySelector('[data-sticky-add-to-cart]')?.addEventListener('click', () => {
      syncMainQtyFromSticky(sectionId, stickyQty);
      document.getElementById(`ProductSubmitButton-${sectionId}`)?.click();
    });

    root.querySelector('[data-sticky-buy-now]')?.addEventListener('click', () => {
      syncMainQtyFromSticky(sectionId, stickyQty);
      document.getElementById(`ProductBuyNowButton-${sectionId}`)?.click();
    });

    refresh();

    const mainSubmit = document.getElementById(`ProductSubmitButton-${sectionId}`);
    if (mainSubmit) {
      const mo = new MutationObserver(() => updateStickyButtonStates(sectionId, root));
      mo.observe(mainSubmit, { attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
  }

  function initAll() {
    document.querySelectorAll('[data-sticky-product-bar]').forEach(initStickyBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
