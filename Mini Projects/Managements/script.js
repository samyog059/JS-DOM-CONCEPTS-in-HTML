// Simple data set with product barcodes known to Open Food Facts
// Feel free to swap images/ids with your own items.
const menuItems = [
  {
    id: '737628064502',
    name: 'Classic Cola',
    price: 2.5,
    img: 'https://images.unsplash.com/photo-1510626176961-4b37d0b4e904?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5449000131805',
    name: 'Orange Spark',
    price: 3.0,
    img: 'https://images.unsplash.com/photo-1604908178077-55f64b16cd59?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3045320001570',
    name: 'Sparkling Water',
    price: 1.8,
    img: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '7622210449283',
    name: 'Hazelnut Treat',
    price: 4.2,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '7613034626844',
    name: 'Iced Latte',
    price: 4.5,
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '20200200',
    name: 'Club Sandwich',
    price: 6.8,
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80'
  }
];

const order = new Map(); // id -> { item, qty }

const menuGrid = document.getElementById('menuGrid');
const orderList = document.getElementById('orderList');
const orderTotal = document.getElementById('orderTotal');
const statusSelect = document.getElementById('statusSelect');
const statusChip = document.getElementById('statusChip');
const submitOrder = document.getElementById('submitOrder');

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

// Render menu cards
function renderMenu() {
  menuGrid.innerHTML = menuItems.map(item => `
    <article class="card">
      <img src="${item.img}" alt="${item.name}" />
      <div class="card-title">
        <h3>${item.name}</h3>
        <span class="price">$${item.price.toFixed(2)}</span>
      </div>
      <div class="btn-row">
        <button class="primary" data-action="add" data-id="${item.id}">Add to order</button>
        <button class="secondary" data-action="info" data-id="${item.id}">View Nutritional Info</button>
      </div>
    </article>
  `).join('');
}

// Render order items into POS panel
function renderOrder() {
  if (order.size === 0) {
    orderList.innerHTML = '<p class="muted">No items yet. Add something tasty!</p>';
    orderTotal.textContent = '$0.00';
    return;
  }

  let total = 0;
  orderList.innerHTML = Array.from(order.values()).map(({ item, qty }) => {
    const line = item.price * qty;
    total += line;
    return `
      <div class="order-item" data-id="${item.id}">
        <h4>${item.name}</h4>
        <div class="qty">
          <button data-action="decrease">-</button>
          <span>${qty}</span>
          <button data-action="increase">+</button>
        </div>
        <div class="price">$${line.toFixed(2)}</div>
      </div>
    `;
  }).join('');

  orderTotal.textContent = `$${total.toFixed(2)}`;
}

function addToOrder(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  const existing = order.get(id) || { item, qty: 0 };
  existing.qty += 1;
  order.set(id, existing);
  renderOrder();
}

function changeQty(id, delta) {
  const entry = order.get(id);
  if (!entry) return;
  const next = entry.qty + delta;
  if (next <= 0) {
    order.delete(id);
  } else {
    entry.qty = next;
    order.set(id, entry);
  }
  renderOrder();
}

// Fetch nutrition info from Open Food Facts
async function loadNutrition(barcode) {
  modalBody.innerHTML = '<p class="muted">Fetching nutrition data...</p>';
  openModal();
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    const product = data.product;
    if (!product) throw new Error('No data for this product.');

    const nutriments = product.nutriments || {};
    const name = product.product_name || 'Unknown item';

    modalBody.innerHTML = `
      <div class="badge">${name}</div>
      <div class="nutrition">
        ${nutritionRow('Energy', nutriments['energy-kcal_serving'], 'kcal')}
        ${nutritionRow('Fat', nutriments.fat_serving, 'g')}
        ${nutritionRow('Saturated Fat', nutriments['saturated-fat_serving'], 'g')}
        ${nutritionRow('Carbohydrates', nutriments.carbohydrates_serving, 'g')}
        ${nutritionRow('Sugars', nutriments.sugars_serving, 'g')}
        ${nutritionRow('Proteins', nutriments.proteins_serving, 'g')}
        ${nutritionRow('Salt', nutriments.salt_serving, 'g')}
      </div>
      <p class="muted">Source: Open Food Facts</p>
    `;
  } catch (err) {
    modalBody.innerHTML = `<p class="muted">${err.message || 'Could not load data.'}</p>`;
  }
}

function nutritionRow(label, value, unit) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return `<div class="nutrition-row"><span>${label}</span><span class="muted">N/A</span></div>`;
  }
  return `<div class="nutrition-row"><span>${label}</span><span>${Number(value).toFixed(1)} ${unit}</span></div>`;
}

function openModal() {
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModalFn() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

// Wire up events
menuGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === 'add') addToOrder(id);
  if (action === 'info') loadNutrition(id);
});

orderList.addEventListener('click', (e) => {
  const actionBtn = e.target.closest('button');
  if (!actionBtn) return;
  const parent = e.target.closest('.order-item');
  const id = parent?.dataset.id;
  if (!id) return;
  if (actionBtn.dataset.action === 'increase') changeQty(id, 1);
  if (actionBtn.dataset.action === 'decrease') changeQty(id, -1);
});

statusSelect.addEventListener('change', () => {
  statusChip.textContent = `Status: ${statusSelect.value}`;
});

submitOrder.addEventListener('click', () => {
  statusSelect.value = 'Delivered';
  statusChip.textContent = 'Status: Delivered';
  alert('Order marked as Delivered. Great job!');
});

closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModalFn();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModalFn();
});

renderMenu();
renderOrder();
