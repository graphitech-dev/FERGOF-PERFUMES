/* =====================================================
   PARFUMERIE ÉLÉGANCE – script.js
   1. Configuration  2. Produits  3. Outils  4. Cartes
   5. Catalogue  6. Panier  7. Détails  8. Commande
   9. WhatsApp  10. Interface (menu, scroll, toasts)
   ===================================================== */
"use strict";

/* ========== 1. CONFIGURATION (à modifier) ========== */
const CONFIG = {
  whatsappNumber: "221788324027",      // Numéro WhatsApp, format international sans « + »
  currency: "FCFA",
  freeShippingFrom: 150000,            // Livraison offerte dès ce montant (0 = désactivé)
  // Zones de livraison : la première est la zone par défaut
  zones: [
    { name: "Dakar", fee: 2000, label: "Livraison rapide" },
    { name: "Thiès", fee: 3500, label: "Selon la zone" },
    { name: "Saint-Louis", fee: 5000, label: "Selon la zone" },
    { name: "Autres régions du Sénégal", fee: 5000, label: "Selon la zone" }
  ],
  storageKey: "parfumerie_elegance_cart"
};

/* ========== 2. PRODUITS (ajouter / supprimer ici) ==========
   category : "homme" | "femme" | "mixte"
   oldPrice : mettre 0 s'il n'y a pas de promotion
   image    : remplacer le fichier dans images/ par votre photo (même nom ou nouveau nom) */
const PRODUCTS = [
  { id: 1, name: "Dior Sauvage", brand: "Dior", category: "homme", price: 45000, oldPrice: 52000, rating: 4.8, popularity: 98, isNew: false, image: "images/dior-sauvage.svg", size: "100 ml", inStock: true,
    description: "Un sillage frais et sauvage, inspiré par les grands espaces. Un classique masculin au caractère affirmé.",
    notes: { top: "Bergamote, poivre", heart: "Lavande, géranium", base: "Ambroxan, cèdre" } },
  { id: 2, name: "Bleu de Chanel", brand: "Chanel", category: "homme", price: 55000, oldPrice: 0, rating: 4.9, popularity: 95, isNew: false, image: "images/bleu-de-chanel.svg", size: "100 ml", inStock: true,
    description: "L'élégance boisée et aromatique d'un homme libre. Un parfum polyvalent, du bureau à la soirée.",
    notes: { top: "Citron, menthe", heart: "Gingembre, jasmin", base: "Cèdre, santal" } },
  { id: 3, name: "YSL Y", brand: "Yves Saint Laurent", category: "homme", price: 42000, oldPrice: 0, rating: 4.6, popularity: 80, isNew: true, image: "images/ysl-y.svg", size: "100 ml", inStock: true,
    description: "Une fraîcheur moderne et lumineuse, pour un style affirmé et décontracté.",
    notes: { top: "Pomme, gingembre", heart: "Sauge, baies de genévrier", base: "Fève tonka, cèdre" } },
  { id: 4, name: "Jean Paul Gaultier Le Male", brand: "Jean Paul Gaultier", category: "homme", price: 48000, oldPrice: 55000, rating: 4.7, popularity: 88, isNew: false, image: "images/jpg-le-male.svg", size: "125 ml", inStock: true,
    description: "Un icône gourmand et séducteur, entre lavande et vanille.",
    notes: { top: "Menthe, lavande", heart: "Cannelle, fleur d'oranger", base: "Vanille, ambre" } },
  { id: 5, name: "Lancôme La Vie Est Belle", brand: "Lancôme", category: "femme", price: 50000, oldPrice: 0, rating: 4.8, popularity: 96, isNew: false, image: "images/la-vie-est-belle.svg", size: "75 ml", inStock: true,
    description: "Un parfum gourmand et lumineux qui célèbre le bonheur de vivre.",
    notes: { top: "Poire, cassis", heart: "Iris, jasmin", base: "Praliné, vanille" } },
  { id: 6, name: "Paco Rabanne Lady Million", brand: "Paco Rabanne", category: "femme", price: 47000, oldPrice: 54000, rating: 4.5, popularity: 85, isNew: false, image: "images/lady-million.svg", size: "80 ml", inStock: true,
    description: "Un floral ambré et audacieux, pour celles qui aiment briller.",
    notes: { top: "Framboise, néroli", heart: "Jasmin, fleur d'oranger", base: "Miel, patchouli" } },
  { id: 7, name: "Tom Ford Oud Wood", brand: "Tom Ford", category: "mixte", price: 65000, oldPrice: 0, rating: 4.7, popularity: 78, isNew: true, image: "images/tom-ford-oud-wood.svg", size: "50 ml", inStock: true,
    description: "Un oud rare et précieux adouci par des épices et des bois. Intense et raffiné.",
    notes: { top: "Cardamome, poivre rose", heart: "Oud, palissandre", base: "Ambre, vétiver" } },
  { id: 8, name: "Le Labo Santal 33", brand: "Le Labo", category: "mixte", price: 70000, oldPrice: 78000, rating: 4.6, popularity: 70, isNew: true, image: "images/le-labo-santal-33.svg", size: "50 ml", inStock: false,
    description: "Un sillage boisé et cuiré devenu culte, qui se porte à deux.",
    notes: { top: "Violette, cardamome", heart: "Iris, cuir", base: "Santal, cèdre" } }
];

/* ========== 3. OUTILS ========== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " " + CONFIG.currency;
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const discount = p => (p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const catLabel = c => ({ homme: "Pour lui", femme: "Pour elle", mixte: "Mixte" }[c]);

/* ========== 4. CARTES PRODUITS ========== */
function cardHTML(p) {
  const d = discount(p);
  return `
  <article class="card">
    <div class="tags">${d ? `<span class="tag">-${d}%</span>` : ""}${p.isNew ? `<span class="tag new">Nouveau</span>` : ""}</div>
    <div class="card-img"><img src="${p.image}" alt="Flacon du parfum ${p.name} de ${p.brand}" loading="lazy"></div>
    <div class="card-info">
      <span class="brand">${p.brand}</span>
      <h3>${p.name}</h3>
      <span class="cat">${catLabel(p.category)}</span>
      <span class="stars" aria-label="Note ${p.rating} sur 5">${stars(p.rating)}<small>${p.rating}</small></span>
      <div class="price"><strong>${fmt(p.price)}</strong>${d ? `<del>${fmt(p.oldPrice)}</del>` : ""}</div>
      <div class="card-actions">
        <button class="btn btn-gold small" data-action="add" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>${p.inStock ? "Ajouter au panier" : "Indisponible"}</button>
        <button class="btn ghost small" data-action="details" data-id="${p.id}">Voir détails</button>
      </div>
    </div>
  </article>`;
}
const renderGrid = (sel, list) => { $(sel).innerHTML = list.map(cardHTML).join(""); };

function renderHomeSections() {
  renderGrid("#gridPopular", [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 4));
  renderGrid("#gridNew", PRODUCTS.filter(p => p.isNew));
  renderGrid("#gridFemme", PRODUCTS.filter(p => p.category === "femme"));
  renderGrid("#gridHomme", PRODUCTS.filter(p => p.category === "homme"));
  renderGrid("#gridMixte", PRODUCTS.filter(p => p.category === "mixte"));
}

/* ========== 5. CATALOGUE : recherche, filtres, tri ========== */
const catalog = { filter: "all", query: "", sort: "popular" };

function renderCatalog() {
  let list = PRODUCTS.filter(p => {
    const f = catalog.filter;
    const okFilter = f === "all" || (f === "new" ? p.isNew : f === "promo" ? discount(p) > 0 : p.category === f);
    const okSearch = norm(p.name + " " + p.brand).includes(norm(catalog.query.trim()));
    return okFilter && okSearch;
  });
  const sorters = {
    asc: (a, b) => a.price - b.price,
    desc: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name, "fr"),
    popular: (a, b) => b.popularity - a.popularity
  };
  list.sort(sorters[catalog.sort]);
  renderGrid("#gridCatalog", list);
  $("#noResult").hidden = list.length > 0;
}

/* ========== 6. PANIER ========== */
let cart = [];            // [{ id, qty }]
let zoneIndex = 0;        // zone de livraison choisie

function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || []; } catch { cart = []; }
  cart = cart.filter(i => byId(i.id) && i.qty > 0);   // ignore les produits supprimés du catalogue
}
function saveCart() {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart)); } catch { /* stockage indisponible */ }
}
function totals() {
  const subtotal = cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  const free = CONFIG.freeShippingFrom > 0 && subtotal >= CONFIG.freeShippingFrom;
  const shipping = cart.length === 0 || free ? 0 : CONFIG.zones[zoneIndex].fee;
  return { subtotal, shipping, free, total: subtotal + shipping };
}
function addToCart(id, qty = 1) {
  const p = byId(id);
  if (!p || !p.inStock) return;
  const line = cart.find(i => i.id === p.id);
  line ? (line.qty += qty) : cart.push({ id: p.id, qty });
  saveCart(); renderCart();
  toast(`${p.name} ajouté au panier`);
}
function changeQty(id, delta) {
  const line = cart.find(i => i.id === Number(id));
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(i => i !== line);
  saveCart(); renderCart();
}
function removeItem(id) { cart = cart.filter(i => i.id !== Number(id)); saveCart(); renderCart(); }
function clearCart() { cart = []; saveCart(); renderCart(); }

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartItems").innerHTML = cart.length ? cart.map(i => {
    const p = byId(i.id);
    return `<div class="cart-item">
      <img src="${p.image}" alt="${p.name}">
      <div><h4>${p.name}</h4><small>${fmt(p.price)}</small>
        <div class="qty"><button data-action="dec" data-id="${p.id}" aria-label="Diminuer la quantité">−</button><span>${i.qty}</span><button data-action="inc" data-id="${p.id}" aria-label="Augmenter la quantité">+</button></div></div>
      <button class="remove" data-action="remove" data-id="${p.id}" aria-label="Supprimer ${p.name}">✕</button>
    </div>`;
  }).join("") : `<p class="empty-cart">Votre panier est vide.<br>Découvrez nos parfums pour commencer.</p>`;
  const t = totals();
  $("#subtotal").textContent = fmt(t.subtotal);
  $("#shipping").textContent = cart.length ? (t.free ? "Offerte" : fmt(t.shipping)) : "—";
  $("#total").textContent = fmt(t.total);
  $("#cartFoot").hidden = cart.length === 0;
  if ($("#checkoutModal").classList.contains("open")) renderSummary();
  updateWhatsApp();
}

/* ========== 7. FENÊTRE DÉTAILS PRODUIT ========== */
function openDetails(id) {
  const p = byId(id), d = discount(p);
  $("#productBody").innerHTML = `
  <div class="detail">
    <img src="${p.image}" alt="Flacon du parfum ${p.name} de ${p.brand}">
    <div>
      <span class="brand">${p.brand} · ${catLabel(p.category)}</span>
      <h2>${p.name}</h2>
      <span class="stars">${stars(p.rating)}<small>${p.rating}</small></span>
      <div class="price"><strong>${fmt(p.price)}</strong>${d ? `<del>${fmt(p.oldPrice)}</del><span class="tag">-${d}%</span>` : ""}</div>
      <p>${p.description}</p>
      <dl>
        <dt>Notes de tête</dt><dd>${p.notes.top}</dd>
        <dt>Notes de cœur</dt><dd>${p.notes.heart}</dd>
        <dt>Notes de fond</dt><dd>${p.notes.base}</dd>
        <dt>Contenance</dt><dd>${p.size}</dd>
        <dt>Disponibilité</dt><dd class="${p.inStock ? "in-stock" : "out-stock"}">${p.inStock ? "En stock" : "Indisponible pour le moment"}</dd>
      </dl>
      <div class="detail-buy">
        <div class="qty"><button data-action="mqty" data-d="-1" aria-label="Diminuer">−</button><span id="modalQty">1</span><button data-action="mqty" data-d="1" aria-label="Augmenter">+</button></div>
        <button class="btn btn-gold" data-action="addModal" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>Ajouter au panier</button>
      </div>
    </div>
  </div>`;
  openLayer("#productModal");
}

/* ========== 8. COMMANDE ========== */
const PAY_NOTES = {
  "Paiement à la livraison": "Vous réglez en espèces à la réception de votre commande.",
  "Wave": "Interface de démonstration : aucun paiement n'est effectué sur ce site. Notre équipe vous enverra les instructions Wave après confirmation.",
  "Orange Money": "Interface de démonstration : aucun paiement n'est effectué sur ce site. Notre équipe vous enverra les instructions Orange Money après confirmation."
};

function openCheckout() {
  if (!cart.length) return toast("Votre panier est vide");
  $("#citySelect").innerHTML = CONFIG.zones.map((z, i) => `<option value="${i}">${z.name}</option>`).join("");
  $("#citySelect").value = zoneIndex;
  updatePayNote(); renderSummary();
  openLayer("#checkoutModal");
}
function updatePayNote() { $("#payNote").textContent = PAY_NOTES[$("input[name=pay]:checked").value]; }

function renderSummary() {
  const t = totals();
  $("#orderSummary").innerHTML = cart.map(i => `<div class="sum-line"><span>${byId(i.id).name} × ${i.qty}</span><span>${fmt(byId(i.id).price * i.qty)}</span></div>`).join("") +
    `<hr style="border:0;border-top:1px solid #d9cdb2;margin:10px 0">
     <div class="sum-line"><span>Sous-total</span><span>${fmt(t.subtotal)}</span></div>
     <div class="sum-line"><span>Livraison (${CONFIG.zones[zoneIndex].name})</span><span>${t.free ? "Offerte" : fmt(t.shipping)}</span></div>
     <div class="sum-line"><strong>Total</strong><strong>${fmt(t.total)}</strong></div>`;
}

function submitOrder(e) {
  e.preventDefault();
  const form = e.target, err = $("#formError");
  $$("input, select", form).forEach(f => f.classList.add("touched"));
  const data = Object.fromEntries(new FormData(form));
  const phoneOk = /^\+?[0-9\s]{9,16}$/.test((data.phone || "").trim());
  if (!form.checkValidity() || !phoneOk) { err.textContent = "Veuillez remplir tous les champs avec un numéro de téléphone valide."; return; }
  err.textContent = "";
  const t = totals();
  const lines = cart.map(i => `• ${byId(i.id).name} × ${i.qty} – ${fmt(byId(i.id).price * i.qty)}`).join("\n");
  const msg = `Bonjour, je souhaite passer commande :\n\n${lines}\n\nSous-total : ${fmt(t.subtotal)}\nLivraison : ${t.free ? "Offerte" : fmt(t.shipping)}\nTotal : ${fmt(t.total)}\n\nNom : ${data.name}\nTéléphone : ${data.phone}\nAdresse : ${data.address}, ${data.district}, ${CONFIG.zones[zoneIndex].name}\nPaiement : ${data.pay}`;
  window.open(waLink(msg), "_blank", "noopener");     // la commande est transmise via WhatsApp
  clearCart(); form.reset(); closeLayers();
  toast("Commande préparée : envoyez le message WhatsApp pour la valider");
}

/* ========== 9. WHATSAPP ========== */
const waLink = text => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
function updateWhatsApp() {
  let msg = "Bonjour, je souhaite des informations sur vos parfums.";
  if (cart.length) {
    const t = totals();
    msg = "Bonjour, je souhaite commander :\n\n" +
      cart.map(i => `• ${byId(i.id).name} – Quantité : ${i.qty} – Prix : ${fmt(byId(i.id).price)}`).join("\n") +
      `\n\nTotal de la commande : ${fmt(t.total)}`;
  }
  $("#waFloat").href = $("#footWa").href = waLink(msg);
}

/* ========== 10. INTERFACE ========== */
function toast(text) {
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = text;
  $("#toasts").appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, 2600);
}
function openLayer(sel) {
  closeLayers();
  const el = $(sel);
  el.classList.add("open"); el.setAttribute("aria-hidden", "false");
  $("#overlay").classList.add("open"); document.body.classList.add("locked");
}
function closeLayers() {
  $$(".drawer.open, .modal.open").forEach(el => { el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); });
  $("#overlay").classList.remove("open"); document.body.classList.remove("locked");
}
function closeMenu() { $("#nav").classList.remove("open"); $("#burger").classList.remove("open"); $("#burger").setAttribute("aria-expanded", "false"); }

/* Actions déléguées (boutons data-action) */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const { action, id } = b.dataset;
  const actions = {
    add: () => addToCart(id),
    details: () => openDetails(id),
    inc: () => changeQty(id, 1),
    dec: () => changeQty(id, -1),
    remove: () => removeItem(id),
    clear: () => { clearCart(); toast("Panier vidé"); },
    checkout: openCheckout,
    close: closeLayers,
    mqty: () => { const s = $("#modalQty"); s.textContent = Math.max(1, +s.textContent + +b.dataset.d); },
    addModal: () => { addToCart(id, +$("#modalQty").textContent); closeLayers(); }
  };
  actions[action]?.();
});

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  renderHomeSections(); renderCatalog(); renderCart();

  $("#zonesList").innerHTML = CONFIG.zones.map(z => `<li><span><strong>${z.name}</strong> – ${z.label}</span><span>${fmt(z.fee)}</span></li>`).join("") +
    (CONFIG.freeShippingFrom ? `<li><span>Livraison offerte dès</span><span>${fmt(CONFIG.freeShippingFrom)}</span></li>` : "");
  $("#year").textContent = new Date().getFullYear();
  $("#footPhone").href = "tel:+" + CONFIG.whatsappNumber;

  /* Recherche, filtres, tri */
  $("#search").addEventListener("input", e => { catalog.query = e.target.value; renderCatalog(); });
  $("#sort").addEventListener("change", e => { catalog.sort = e.target.value; renderCatalog(); });
  $("#filters").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$(".chip").forEach(c => c.classList.toggle("active", c === chip));
    catalog.filter = chip.dataset.filter; renderCatalog();
  });

  /* Panier, commande */
  $("#cartBtn").addEventListener("click", () => openLayer("#cartDrawer"));
  $("#overlay").addEventListener("click", closeLayers);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeLayers(); closeMenu(); } });
  $("#citySelect").addEventListener("change", e => { zoneIndex = +e.target.value; renderCart(); renderSummary(); });
  $$("input[name=pay]").forEach(r => r.addEventListener("change", updatePayNote));
  $("#orderForm").addEventListener("submit", submitOrder);

  /* Newsletter */
  $("#newsletterForm").addEventListener("submit", e => {
    e.preventDefault();
    const input = $("#newsEmail");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value)) return toast("Entrez une adresse e-mail valide");
    input.value = ""; toast("Merci ! Vous êtes inscrit(e) à la newsletter.");
  });

  /* Menu mobile */
  $("#burger").addEventListener("click", () => {
    const open = $("#nav").classList.toggle("open");
    $("#burger").classList.toggle("open", open); $("#burger").setAttribute("aria-expanded", open);
  });
  $$("#nav a").forEach(a => a.addEventListener("click", closeMenu));

  /* Apparition progressive des sections */
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } }), { threshold: 0.08 });
  $$(".reveal").forEach(s => io.observe(s));

  /* En-tête au défilement + retour en haut */
  const onScroll = () => { $("#header").classList.toggle("scrolled", scrollY > 40); $("#toTop").classList.toggle("show", scrollY > 600); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
});

/* Fin du chargement */
addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 700));
