const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

function setNavOpen(isOpen) {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute("aria-expanded", String(isOpen));
  siteNav.classList.toggle("open", isOpen);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!isOpen);
  });
  siteNav.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) setNavOpen(false);
  });
}

const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const copyStatus = document.querySelector("#copyStatus");
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const selector = btn.getAttribute("data-copy");
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el) return;
    const text = (el.textContent || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (copyStatus) copyStatus.textContent = `Copied: ${text}`;
      window.setTimeout(() => {
        if (copyStatus) copyStatus.textContent = "";
      }, 2200);
    } catch {
      if (copyStatus) copyStatus.textContent = "Copy failed.";
    }
  });
});

const fakeSendBtn = document.querySelector("#fakeSendBtn");
const sendStatus = document.querySelector("#sendStatus");
if (fakeSendBtn && sendStatus) {
  fakeSendBtn.addEventListener("click", () => {
    sendStatus.textContent = "Thanks! We’ll get back to you soon.";
    window.setTimeout(() => {
      sendStatus.textContent = "";
    }, 2600);
  });
}

// ---------------------------------------------------------------------------
// Freetown cafe — local storage app (no backend)
// ---------------------------------------------------------------------------

const FC = {
  storageKeys: {
    orders: "fc_orders_v1",
    menu: "fc_menu_v1",
    site: "fc_site_v1",
    workers: "fc_workers_v1",
    /** Saved after you change it in Admin → Security (overrides default below) */
    adminPin: "fc_admin_pin_v1",
  },
  /**
   * Default admin PIN (only used if you never saved a custom PIN).
   * You can also change it here in code, or inside Admin → Security after login.
   */
  pins: {
    admin: "2026",
    worker: "1111",
  },
};

/** Active admin PIN: custom (localStorage) or default from FC.pins.admin */
function getAdminPin() {
  const saved = localStorage.getItem(FC.storageKeys.adminPin);
  if (saved && String(saved).length > 0) return String(saved);
  return FC.pins.admin;
}

function setAdminPin(pin) {
  localStorage.setItem(FC.storageKeys.adminPin, String(pin));
}

function defaultSiteSettings() {
  return {
    cafeName: "Freetown cafe",
    slogan: "Fast food • Cakes • Juices",
    heroTitle: "Coffee, food & fresh juice — all in one place.",
    heroLead:
      "Enjoy fast food, soft and dry cakes, and chilled juices. Order for pickup or delivery.",
    telebirr: "0911402300",
    logoUrl: "./assets/freetown-logo.svg",
  };
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function getSiteSettings() {
  const d = defaultSiteSettings();
  const saved = loadJson(FC.storageKeys.site, {});
  return { ...d, ...saved };
}

function saveSiteSettings(s) {
  saveJson(FC.storageKeys.site, s);
}

function applySiteSettings() {
  const s = getSiteSettings();
  document.querySelectorAll(".brand-name").forEach((el) => {
    el.textContent = s.cafeName;
  });
  document.querySelectorAll('[data-site-bind="slogan"]').forEach((el) => {
    el.textContent = s.slogan;
  });
  const heroTitle = document.querySelector("#heroTitle");
  if (heroTitle) heroTitle.textContent = s.heroTitle;
  const heroLead = document.querySelector("#heroLead");
  if (heroLead) heroLead.textContent = s.heroLead;
  const def = defaultSiteSettings();
  const logoEls = document.querySelectorAll("[data-site-logo]");
  logoEls.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      img.src = s.logoUrl || def.logoUrl;
      img.alt = s.cafeName || def.cafeName;
    }
  });
  const phoneText = document.querySelector("#phoneText");
  if (phoneText) phoneText.textContent = s.telebirr;
  document.querySelectorAll("[data-telebirr]").forEach((el) => {
    el.textContent = s.telebirr;
  });
  if (document.querySelector("#heroTitle")) {
    const t = document.querySelector("title");
    if (t) t.textContent = `${s.cafeName} · Home`;
  }
}

function getWorkers() {
  const w = loadJson(FC.storageKeys.workers, null);
  return Array.isArray(w) ? w : [];
}

function saveWorkers(workers) {
  saveJson(FC.storageKeys.workers, workers);
}

function validateWorkerPin(pin) {
  if (!pin) return false;
  if (pin === FC.pins.worker) return true;
  return getWorkers().some((w) => String(w.pin) === String(pin));
}

function seedMenuIfMissing() {
  const existing = loadJson(FC.storageKeys.menu, null);
  if (Array.isArray(existing) && existing.length) return;

  const menu = [
    {
      id: "burger_fc",
      name: "Classic Burger",
      category: "Fast Food",
      desc: "Beef or chicken burger with sauce and salad.",
      price: 220,
      image: "./assets/burger.svg",
    },
    {
      id: "fries_fc",
      name: "French Fries",
      category: "Fast Food",
      desc: "Crispy fries (classic or spicy).",
      price: 140,
      image: "./assets/fries.svg",
    },
    {
      id: "wrap_fc",
      name: "Chicken Wrap",
      category: "Fast Food",
      desc: "Wrap with chicken, veggies and sauce.",
      price: 200,
      image: "./assets/wrap.svg",
    },
    {
      id: "hotdog_fc",
      name: "Hot Dog",
      category: "Fast Food",
      desc: "Hot dog with toppings.",
      price: 170,
      image: "./assets/hotdog.svg",
    },
    {
      id: "softcake_fc",
      name: "Soft Cake Slice",
      category: "Cakes",
      desc: "Soft cake slice (chocolate/vanilla).",
      price: 120,
      image: "./assets/soft-cake.svg",
    },
    {
      id: "drycake_fc",
      name: "Dry Cake",
      category: "Cakes",
      desc: "Dry cake (butter/fruit).",
      price: 90,
      image: "./assets/dry-cake.svg",
    },
    {
      id: "cupcake_fc",
      name: "Cupcake",
      category: "Cakes",
      desc: "Assorted cupcake.",
      price: 70,
      image: "./assets/cupcake.svg",
    },
    {
      id: "birthday_fc",
      name: "Birthday Cake (Order)",
      category: "Cakes",
      desc: "Custom cake for events and birthdays.",
      price: 1500,
      image: "./assets/birthday-cake.svg",
    },
    {
      id: "mango_fc",
      name: "Mango Juice",
      category: "Juices",
      desc: "Fresh mango juice.",
      price: 120,
      image: "./assets/mango.svg",
    },
    {
      id: "pine_fc",
      name: "Pineapple Juice",
      category: "Juices",
      desc: "Fresh pineapple juice.",
      price: 120,
      image: "./assets/pineapple.svg",
    },
    {
      id: "orange_fc",
      name: "Orange Juice",
      category: "Juices",
      desc: "Fresh orange juice.",
      price: 110,
      image: "./assets/orange.svg",
    },
    {
      id: "mix_fc",
      name: "Mixed Juice",
      category: "Juices",
      desc: "Signature blended mix.",
      price: 140,
      image: "./assets/mixed-juice.svg",
    },
  ];
  saveJson(FC.storageKeys.menu, menu);
}

function getMenu() {
  seedMenuIfMissing();
  return loadJson(FC.storageKeys.menu, []);
}

function setMenu(menu) {
  saveJson(FC.storageKeys.menu, menu);
}

function getOrders() {
  return loadJson(FC.storageKeys.orders, []);
}

function setOrders(orders) {
  saveJson(FC.storageKeys.orders, orders);
}

function moneyBr(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "Br —";
  return `Br ${n.toFixed(0)}`;
}

function getTelebirr() {
  return getSiteSettings().telebirr || "0911402300";
}

function calcOrderTotal(menu, items) {
  const map = new Map(menu.map((m) => [m.id, m]));
  let total = 0;
  for (const it of items) {
    const m = map.get(it.menuId);
    if (!m) continue;
    total += Number(m.price) * Number(it.qty || 0);
  }
  return total;
}

function uniqueCategories(menu) {
  const cats = [...new Set(menu.map((m) => m.category).filter(Boolean))];
  return cats.length ? cats : ["All"];
}

function renderMenuGrid() {
  const grid = document.querySelector("#menuGrid");
  const tabs = document.querySelector("#menuTabs");
  if (!grid) return;

  const menu = getMenu();
  const categories = ["All", ...uniqueCategories(menu).filter((c) => c !== "All")];

  if (tabs) {
    tabs.innerHTML = categories
      .map(
        (c, i) =>
          `<button type="button" class="menu-tab${i === 0 ? " is-active" : ""}" data-cat="${c}">${c}</button>`,
      )
      .join("");

    let active = "All";
    tabs.querySelectorAll(".menu-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.getAttribute("data-cat") || "All";
        tabs.querySelectorAll(".menu-tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        paint(active);
      });
    });
  }

  function paint(cat) {
    const filtered = cat === "All" ? menu : menu.filter((m) => m.category === cat);
    grid.innerHTML = filtered
      .map((m) => {
        const img = m.image || "./assets/burger.svg";
        return `
        <article class="menu-item">
          <div class="media">
            <img src="${img}" alt="${m.name}" loading="lazy" />
          </div>
          <div class="body">
            <div class="row">
              <h3 style="margin:0;font-size:16px;color:var(--cream)">${m.name}</h3>
              <div class="price">${moneyBr(m.price)}</div>
            </div>
            <span class="tag">${m.category}</span>
            <p class="muted" style="margin:0;font-size:14px">${m.desc}</p>
            <a class="btn btn-primary btn-sm" href="./order.html?add=${encodeURIComponent(m.id)}">Add to order</a>
          </div>
        </article>`;
      })
      .join("");
  }

  paint("All");
}

function setupOrderPage() {
  const form = document.querySelector("#orderForm");
  if (!form) return;

  const menu = getMenu();
  const itemsWrap = document.querySelector("#orderItems");
  const totalEl = document.querySelector("#orderTotal");
  const statusEl = document.querySelector("#orderStatus");
  const addFromQuery = new URLSearchParams(location.search).get("add");

  document.querySelectorAll("[data-telebirr]").forEach((el) => {
    el.textContent = getTelebirr();
  });

  let items = menu.map((m) => ({ menuId: m.id, qty: 0 }));
  if (addFromQuery) {
    const found = items.find((i) => i.menuId === addFromQuery);
    if (found) found.qty = Math.max(1, found.qty);
  }

  function getQty(id) {
    const t = items.find((i) => i.menuId === id);
    return t ? t.qty : 0;
  }

  function setQty(id, q) {
    const t = items.find((i) => i.menuId === id);
    if (t) t.qty = Math.max(0, Math.floor(Number(q) || 0));
  }

  function bump(id, delta) {
    const t = items.find((i) => i.menuId === id);
    if (!t) return;
    t.qty = Math.max(0, t.qty + delta);
    render();
  }

  function render() {
    if (!itemsWrap) return;
    itemsWrap.innerHTML = menu
      .map((m) => {
        const q = getQty(m.id);
        const img = m.image || "./assets/burger.svg";
        return `
        <div class="order-line">
          <div class="order-line-thumb"><img src="${img}" alt="" loading="lazy" /></div>
          <div class="order-line-info">
            <h3>${m.name}</h3>
            <div class="tiny muted">${m.category} · ${moneyBr(m.price)} each</div>
            <p class="small muted" style="margin:6px 0 0">${m.desc}</p>
          </div>
          <div class="order-line-actions">
            <button type="button" class="btn btn-icon btn-ghost" data-dec="${m.id}" aria-label="Decrease">−</button>
            <input type="number" min="0" step="1" value="${q}" data-qty="${m.id}" inputmode="numeric" />
            <button type="button" class="btn btn-icon btn-ghost" data-inc="${m.id}" aria-label="Increase">+</button>
          </div>
        </div>`;
      })
      .join("");

    itemsWrap.querySelectorAll("[data-inc]").forEach((btn) => {
      btn.addEventListener("click", () => bump(btn.getAttribute("data-inc"), 1));
    });
    itemsWrap.querySelectorAll("[data-dec]").forEach((btn) => {
      btn.addEventListener("click", () => bump(btn.getAttribute("data-dec"), -1));
    });
    itemsWrap.querySelectorAll("[data-qty]").forEach((inp) => {
      inp.addEventListener("input", () => {
        setQty(inp.getAttribute("data-qty"), inp.value);
        updateTotal();
      });
    });
    updateTotal();
  }

  function updateTotal() {
    const total = calcOrderTotal(menu, items);
    if (totalEl) totalEl.textContent = moneyBr(total);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name='customerName']")?.value?.trim() || "";
    const phone = form.querySelector("[name='customerPhone']")?.value?.trim() || "";
    const note = form.querySelector("[name='note']")?.value?.trim() || "";
    const type = form.querySelector("[name='orderType']")?.value || "pickup";

    const chosen = items.filter((i) => Number(i.qty) > 0);
    if (!chosen.length) {
      if (statusEl) statusEl.textContent = "Choose at least one item.";
      return;
    }

    const total = calcOrderTotal(menu, chosen);
    const orders = getOrders();
    const order = {
      id: uid("order"),
      createdAt: new Date().toISOString(),
      status: "new",
      customer: { name, phone, type, note },
      items: chosen,
      total,
      payTo: getTelebirr(),
    };
    orders.unshift(order);
    setOrders(orders);

    if (statusEl) {
      statusEl.textContent = `Order placed! ID: ${order.id} — pay ${getTelebirr()} on TeleBirr.`;
    }
    form.reset();
    items = menu.map((m) => ({ menuId: m.id, qty: 0 }));
    render();
  });

  render();
}

function requirePinPage(role) {
  const gate = document.querySelector("#pinGate");
  if (!gate) return;

  const app = document.querySelector("#app");
  const pinInput = document.querySelector("#pinInput");
  const pinBtn = document.querySelector("#pinBtn");
  const pinMsg = document.querySelector("#pinMsg");

  const sessionKey = `fc_role_${role}`;
  if (sessionStorage.getItem(sessionKey) === "1") {
    gate.style.display = "none";
    if (app) app.style.display = "block";
    return;
  }

  gate.style.display = "block";
  if (app) app.style.display = "none";

  function attempt() {
    const pin = pinInput?.value?.trim() || "";
    let ok = false;
    if (role === "admin") ok = pin === getAdminPin();
    else ok = validateWorkerPin(pin);

    if (ok) {
      sessionStorage.setItem(sessionKey, "1");
      gate.style.display = "none";
      if (app) app.style.display = "block";
      if (pinMsg) pinMsg.textContent = "";
    } else if (pinMsg) {
      pinMsg.textContent = "Wrong PIN.";
    }
  }

  if (pinBtn) pinBtn.addEventListener("click", attempt);
  if (pinInput) {
    pinInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });
  }
}

function setupWorkerPage() {
  const listEl = document.querySelector("#ordersTableBody");
  if (!listEl) return;

  requirePinPage("worker");

  const menu = getMenu();
  const menuMap = new Map(menu.map((m) => [m.id, m]));
  const refreshBtn = document.querySelector("#refreshOrders");

  function render() {
    const orders = getOrders();
    const rows = orders
      .map((o) => {
        const itemsText = o.items
          .map((it) => {
            const m = menuMap.get(it.menuId);
            return `${it.qty}× ${m ? m.name : it.menuId}`;
          })
          .join(", ");

        const st = String(o.status || "new").toUpperCase();
        const tag =
          o.status === "new"
            ? `<span class="tag" style="border-color:rgba(232,197,71,0.4);background:rgba(232,197,71,0.12);color:var(--gold-bright)">NEW</span>`
            : `<span class="tag">${st}</span>`;

        return `<tr>
            <td><div class="strong">${o.id}</div><div class="tiny muted">${new Date(o.createdAt).toLocaleString()}</div></td>
            <td><div class="strong">${o.customer?.name || "—"}</div><div class="tiny muted">${o.customer?.phone || ""}</div><div class="tiny muted">${o.customer?.type || ""}</div></td>
            <td class="small">${itemsText}</td>
            <td><div class="price">${moneyBr(o.total)}</div></td>
            <td>${tag}</td>
            <td><div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-ghost btn-sm" type="button" data-status="${o.id}" data-to="preparing">Preparing</button>
              <button class="btn btn-ghost btn-sm" type="button" data-status="${o.id}" data-to="ready">Ready</button>
              <button class="btn btn-primary btn-sm" type="button" data-status="${o.id}" data-to="done">Done</button>
            </div></td>
          </tr>`;
      })
      .join("");

    listEl.innerHTML = rows || `<tr><td colspan="6" class="muted">No orders yet.</td></tr>`;

    document.querySelectorAll("[data-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-status");
        const to = btn.getAttribute("data-to");
        if (!id || !to) return;
        const orders = getOrders();
        const idx = orders.findIndex((x) => x.id === id);
        if (idx >= 0) {
          orders[idx].status = to;
          setOrders(orders);
          render();
        }
      });
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", render);
  render();
}

function setupAdminPage() {
  const kpiNew = document.querySelector("#kpiNew");
  if (!kpiNew) return;

  requirePinPage("admin");

  const kpiAll = document.querySelector("#kpiAll");
  const kpiRevenue = document.querySelector("#kpiRevenue");
  const resetBtn = document.querySelector("#resetData");
  const statusEl = document.querySelector("#adminStatus");

  const tabBtns = document.querySelectorAll(".admin-tab");
  const panels = document.querySelectorAll(".admin-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      tabBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      panels.forEach((p) => {
        p.classList.toggle("is-visible", p.getAttribute("data-panel") === tab);
      });
    });
  });

  function renderKpis() {
    const orders = getOrders();
    const newCount = orders.filter((o) => o.status === "new").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    if (kpiNew) kpiNew.textContent = String(newCount);
    if (kpiAll) kpiAll.textContent = String(orders.length);
    if (kpiRevenue) kpiRevenue.textContent = moneyBr(revenue);
  }

  function renderSiteForm() {
    const s = getSiteSettings();
    const set = (name, v) => {
      const el = document.querySelector(`[name="${name}"]`);
      if (el) el.value = v ?? "";
    };
    set("cafeName", s.cafeName);
    set("slogan", s.slogan);
    set("heroTitle", s.heroTitle);
    set("heroLead", s.heroLead);
    set("telebirr", s.telebirr);
    set("logoUrl", s.logoUrl);
  }

  function saveSiteForm() {
    const get = (name) => document.querySelector(`[name="${name}"]`)?.value?.trim() || "";
    const s = {
      ...getSiteSettings(),
      cafeName: get("cafeName") || defaultSiteSettings().cafeName,
      slogan: get("slogan"),
      heroTitle: get("heroTitle"),
      heroLead: get("heroLead"),
      telebirr: get("telebirr") || "0911402300",
      logoUrl: get("logoUrl") || "./assets/freetown-logo.svg",
    };
    saveSiteSettings(s);
    applySiteSettings();
    renderMenuGrid();
    if (statusEl) statusEl.textContent = "Website settings saved.";
    window.setTimeout(() => {
      if (statusEl) statusEl.textContent = "";
    }, 2500);
  }

  const saveSiteBtn = document.querySelector("#saveSiteSettings");
  if (saveSiteBtn) saveSiteBtn.addEventListener("click", saveSiteForm);

  const logoFile = document.querySelector("#logoFile");
  if (logoFile) {
    logoFile.addEventListener("change", () => {
      const f = logoFile.files?.[0];
      if (!f || !f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || "");
        const inp = document.querySelector("[name='logoUrl']");
        if (inp) inp.value = url;
      };
      reader.readAsDataURL(f);
    });
  }

  function renderWorkersTable() {
    const body = document.querySelector("#workersTableBody");
    if (!body) return;
    const workers = getWorkers();
    body.innerHTML = workers
      .map(
        (w) => `<tr>
        <td>${w.name}</td>
        <td>••••••</td>
        <td><button type="button" class="btn btn-ghost btn-sm" data-del-worker="${w.id}">Remove</button></td>
      </tr>`,
      )
      .join("");

    body.querySelectorAll("[data-del-worker]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-worker");
        saveWorkers(getWorkers().filter((w) => w.id !== id));
        renderWorkersTable();
        if (statusEl) statusEl.textContent = "Worker removed.";
      });
    });
  }

  const addWorkerBtn = document.querySelector("#addWorker");
  if (addWorkerBtn) {
    addWorkerBtn.addEventListener("click", () => {
      const name = document.querySelector("[name='workerName']")?.value?.trim() || "";
      const pin = document.querySelector("[name='workerPin']")?.value?.trim() || "";
      if (!name || !pin) {
        if (statusEl) statusEl.textContent = "Enter worker name and PIN.";
        return;
      }
      const workers = getWorkers();
      workers.push({ id: uid("worker"), name, pin });
      saveWorkers(workers);
      document.querySelector("[name='workerName']").value = "";
      document.querySelector("[name='workerPin']").value = "";
      renderWorkersTable();
      if (statusEl) statusEl.textContent = "Worker added.";
    });
  }

  function renderMenuEditor() {
    const tbody = document.querySelector("#menuEditorBody");
    if (!tbody) return;
    const menu = getMenu();
    tbody.innerHTML = menu
      .map((m) => {
        return `<tr data-mid="${m.id}">
        <td><input type="text" value="${m.name.replace(/"/g, "&quot;")}" data-field="name" /></td>
        <td><input type="text" value="${m.category.replace(/"/g, "&quot;")}" data-field="category" /></td>
        <td><input type="number" min="0" step="1" value="${m.price}" data-field="price" /></td>
        <td><input type="text" value="${m.desc.replace(/"/g, "&quot;")}" data-field="desc" /></td>
        <td><input type="text" value="${String(m.image || "").replace(/"/g, "&quot;")}" data-field="image" placeholder="URL or paste" style="min-width:140px" /></td>
        <td><input type="file" accept="image/*" data-img-file="${m.id}" /></td>
        <td><button type="button" class="btn btn-ghost btn-sm" data-del-menu="${m.id}">Delete</button></td>
      </tr>`;
      })
      .join("");

    tbody.querySelectorAll("[data-img-file]").forEach((inp) => {
      inp.addEventListener("change", () => {
        const f = inp.files?.[0];
        const id = inp.getAttribute("data-img-file");
        if (!f || !id || !f.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = () => {
          const row = tbody.querySelector(`tr[data-mid="${id}"]`);
          const url = String(reader.result || "");
          const imgInp = row?.querySelector("[data-field='image']");
          if (imgInp) imgInp.value = url;
        };
        reader.readAsDataURL(f);
      });
    });

    tbody.querySelectorAll("[data-del-menu]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-menu");
        setMenu(getMenu().filter((m) => m.id !== id));
        renderMenuEditor();
        renderMenuGrid();
        if (statusEl) statusEl.textContent = "Item removed.";
      });
    });
  }

  function saveMenuEditor() {
    const tbody = document.querySelector("#menuEditorBody");
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr[data-mid]");
    const next = [];
    rows.forEach((row) => {
      const id = row.getAttribute("data-mid");
      const get = (field) => row.querySelector(`[data-field="${field}"]`)?.value ?? "";
      const price = Number(get("price"));
      next.push({
        id,
        name: get("name") || "Item",
        category: get("category") || "General",
        price: Number.isFinite(price) ? Math.max(0, Math.floor(price)) : 0,
        desc: get("desc") || "",
        image: get("image") || "./assets/burger.svg",
      });
    });
    setMenu(next.length ? next : getMenu());
    renderMenuGrid();
    if (statusEl) statusEl.textContent = "Menu saved.";
    window.setTimeout(() => {
      if (statusEl) statusEl.textContent = "";
    }, 2200);
  }

  const saveMenuBtn = document.querySelector("#saveMenuEditor");
  if (saveMenuBtn) saveMenuBtn.addEventListener("click", saveMenuEditor);

  const addMenuItemBtn = document.querySelector("#addMenuItem");
  if (addMenuItemBtn) {
    addMenuItemBtn.addEventListener("click", () => {
      const menu = getMenu();
      menu.push({
        id: uid("item"),
        name: "New item",
        category: "Fast Food",
        desc: "Description",
        price: 100,
        image: "./assets/burger.svg",
      });
      setMenu(menu);
      renderMenuEditor();
      renderMenuGrid();
    });
  }

  const saveAdminPinBtn = document.querySelector("#saveAdminPin");
  if (saveAdminPinBtn) {
    saveAdminPinBtn.addEventListener("click", () => {
      const current =
        document.querySelector("[name='adminPinCurrent']")?.value?.trim() || "";
      const next = document.querySelector("[name='adminPinNew']")?.value?.trim() || "";
      const next2 = document.querySelector("[name='adminPinNew2']")?.value?.trim() || "";
      if (current !== getAdminPin()) {
        if (statusEl) statusEl.textContent = "Current PIN is wrong.";
        return;
      }
      if (!next || next.length < 4) {
        if (statusEl) statusEl.textContent = "New PIN must be at least 4 characters.";
        return;
      }
      if (next !== next2) {
        if (statusEl) statusEl.textContent = "New PINs do not match.";
        return;
      }
      setAdminPin(next);
      const curEl = document.querySelector("[name='adminPinCurrent']");
      const n1 = document.querySelector("[name='adminPinNew']");
      const n2 = document.querySelector("[name='adminPinNew2']");
      if (curEl) curEl.value = "";
      if (n1) n1.value = "";
      if (n2) n2.value = "";
      if (statusEl) {
        statusEl.textContent = "Admin PIN saved. Use it the next time you open Admin.";
      }
      window.setTimeout(() => {
        if (statusEl) statusEl.textContent = "";
      }, 4000);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!window.confirm("Reset all orders, menu, workers, site settings, and admin PIN on this device?")) return;
      localStorage.removeItem(FC.storageKeys.orders);
      localStorage.removeItem(FC.storageKeys.menu);
      localStorage.removeItem(FC.storageKeys.site);
      localStorage.removeItem(FC.storageKeys.workers);
      localStorage.removeItem(FC.storageKeys.adminPin);
      seedMenuIfMissing();
      applySiteSettings();
      renderKpis();
      renderSiteForm();
      renderWorkersTable();
      renderMenuEditor();
      renderMenuGrid();
      if (statusEl) statusEl.textContent = "Full reset done.";
    });
  }

  renderKpis();
  renderSiteForm();
  renderWorkersTable();
  renderMenuEditor();
  setInterval(renderKpis, 2000);

  const firstTab = document.querySelector(".admin-tab.is-active")?.getAttribute("data-tab") || "site";
  panels.forEach((p) => p.classList.toggle("is-visible", p.getAttribute("data-panel") === firstTab));
}

seedMenuIfMissing();
applySiteSettings();
renderMenuGrid();
setupOrderPage();
setupWorkerPage();
setupAdminPage();
