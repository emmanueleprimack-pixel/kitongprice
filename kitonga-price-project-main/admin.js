// admin.js
// Requires: localStorage 'orders' and 'products'.
// orders structure: { "<userEmail>": [ { items: [{ id, name, price, quantity, vendor }...], total: "Tsh 123/=", date: "..." }, ... ], ... }
// products stored in 'products' array: [{ id, name, price, vendor, image }, ...]

// Basic access control
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("Access denied. Admin only.");
  location.href = "kitonga.html";
}

// Utilities
const ordersData = JSON.parse(localStorage.getItem("orders")) || {};
const products = JSON.parse(localStorage.getItem("products")) || [];

// Flatten orders to array
const allOrders = Object.values(ordersData).flat();

// Parse numeric total from stored string (e.g. "Tsh 1,234/=")
function parseTotalString(s) {
  if (!s) return 0;
  const digits = s.toString().replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

// ANALYTICS
function computeAnalytics() {
  let totalSold = 0;
  let totalRevenue = 0;
  const prodCount = {};        // productName => totalQty
  const monthlyRevenue = {};   // 'YYYY-MM' => revenue
  const shopSales = {};        // shopName => revenue

  const now = new Date();
  const thisYear = now.getFullYear();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  const weeklyCount = {};
  const monthlyCount = {};
  const yearlyCount = {};

  allOrders.forEach(order => {
    const orderDate = new Date(order.date);
    const orderTotal = parseTotalString(order.total);
    totalRevenue += orderTotal;

    // group revenue by month
    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth()+1).padStart(2,"0")}`;
    monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + orderTotal;

    order.items.forEach(it => {
      totalSold += it.quantity;
      prodCount[it.name] = (prodCount[it.name] || 0) + it.quantity;

      // shop revenue
      shopSales[it.vendor] = (shopSales[it.vendor] || 0) + (it.price * it.quantity);

      // weekly / monthly / yearly counts
      if (now - orderDate <= oneWeekMs) weeklyCount[it.name] = (weeklyCount[it.name] || 0) + it.quantity;
      if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) monthlyCount[it.name] = (monthlyCount[it.name] || 0) + it.quantity;
      if (orderDate.getFullYear() === thisYear) yearlyCount[it.name] = (yearlyCount[it.name] || 0) + it.quantity;
    });
  });

  // Round revenue to integer
  totalRevenue = Math.round(totalRevenue);

  return { totalSold, totalRevenue, prodCount, monthlyRevenue, shopSales, weeklyCount, monthlyCount, yearlyCount };
}

// display top-level stats
function displayTopStats(stats) {
  document.getElementById("totalSold").textContent = stats.totalSold;
  document.getElementById("totalRevenue").textContent = `Tsh ${stats.totalRevenue.toLocaleString()}/=`;

  document.getElementById("topWeek").textContent = topKey(stats.weeklyCount);
  document.getElementById("topMonth").textContent = topKey(stats.monthlyCount);
  document.getElementById("topMonth").textContent = topKey(stats.monthlyCount);
}

// get top key from a count object
function topKey(obj) {
  let top = "-";
  let max = 0;
  for (let k in obj) {
    if (obj[k] > max) { max = obj[k]; top = k; }
  }
  return top;
}

// Build charts
let productBarChart, revenueLineChart, shopPieChart;
function buildCharts(stats) {
  // Product Bar Chart (top 10)
  const prodEntries = Object.entries(stats.prodCount).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const labels = prodEntries.map(e=>e[0]);
  const data = prodEntries.map(e=>e[1]);

  const ctx1 = document.getElementById('productBarChart').getContext('2d');
  if (productBarChart) productBarChart.destroy();
  productBarChart = new Chart(ctx1, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Units sold', data, backgroundColor: '#2b7a78' }]},
    options: { responsive:true, plugins:{legend:{display:false}} }
  });

  // Revenue line chart (last 6 months)
  const months = Object.keys(stats.monthlyRevenue).sort();
  const revs = months.map(m => stats.monthlyRevenue[m]);
  const ctx2 = document.getElementById('revenueLineChart').getContext('2d');
  if (revenueLineChart) revenueLineChart.destroy();
  revenueLineChart = new Chart(ctx2, {
    type: 'line',
    data: { labels: months, datasets: [{ label:'Revenue (Tsh)', data: revs, borderColor:'#ff7f50', backgroundColor:'rgba(255,127,80,0.12)'}]},
    options:{responsive:true}
  });

  // Shop Pie Chart
  const shopEntries = Object.entries(stats.shopSales).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const shopLabels = shopEntries.map(e=>e[0]);
  const shopVals = shopEntries.map(e=>Math.round(e[1]));
  const ctx3 = document.getElementById('shopPieChart').getContext('2d');
  if (shopPieChart) shopPieChart.destroy();
  shopPieChart = new Chart(ctx3, {
    type: 'pie',
    data: { labels: shopLabels, datasets:[{ data: shopVals, backgroundColor: ['#2b7a78','#ffb703','#fb8500','#2196F3','#9C27B0','#4CAF50'] }]},
    options:{responsive:true}
  });
}

// Shop ranking list
function displayShopRanking(shopSales) {
  const container = document.getElementById('shopRanking');
  container.innerHTML = '';
  const entries = Object.entries(shopSales).sort((a,b)=>b[1]-a[1]);
  if (entries.length === 0) {
    container.innerHTML = '<p>No shop sales data</p>';
    return;
  }
  entries.forEach(([shop, val], i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div>${i+1}. ${shop}</div><div>Tsh ${Math.round(val).toLocaleString()}</div>`;
    container.appendChild(row);
  });
}

// ADD PRODUCT
document.getElementById('addProductForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('pName').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const vendor = document.getElementById('pVendor').value.trim();
  const image = document.getElementById('pImage').value.trim();

  if (!name || !price || !vendor) { alert('Please fill all fields'); return; }

  const prods = JSON.parse(localStorage.getItem('products')) || [];
  const id = 'p' + (prods.length + 1).toString().padStart(4,'0');
  prods.push({ id, name, price, vendor, image });
  localStorage.setItem('products', JSON.stringify(prods));

  // update memory copy
  alert('Product added');
  document.getElementById('addProductForm').reset();
  // refresh analytics (in case you want product list shown elsewhere)
});

// CLEAR data (danger)
document.getElementById('clearDataBtn').addEventListener('click', () => {
  if (!confirm('Clear all orders and products? This cannot be undone')) return;
  localStorage.removeItem('orders');
  localStorage.removeItem('products');
  location.reload();
});

// EXPORT PDF using jsPDF
document.getElementById('exportPdfBtn').addEventListener('click', async () => {
  const stats = computeAnalytics();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Sales Report', 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  doc.text(`Total products sold: ${stats.totalSold}`, 14, 34);
  doc.text(`Total revenue (Tsh): ${stats.totalRevenue.toLocaleString()}`, 14, 40);

  // Add top shops table
  let y = 50;
  doc.text('Top Shops:', 14, y);
  y += 6;
  const shopEntries = Object.entries(stats.shopSales).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if (shopEntries.length === 0) {
    doc.text('No shop data', 14, y);
    y += 8;
  } else {
    shopEntries.forEach(([shop, val], i) => {
      doc.text(`${i+1}. ${shop} — Tsh ${Math.round(val).toLocaleString()}`, 14, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }

  doc.save(`sales-report-${new Date().toISOString().slice(0,10)}.pdf`);
});

// RUN
function runDashboard() {
  const stats = computeAnalytics();
  displayTopStats(stats);
  buildCharts(stats);
  displayShopRanking(stats.shopSales);
}

// Initial run
runDashboard();
