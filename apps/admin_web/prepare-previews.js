const fs = require('fs');
const path = require('path');

const baseDir = "D:\\supermarket\\apps\\admin_web";
const outDir = "D:\\supermarket\\screenshots";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Read CSS
const cssDir = path.join(baseDir, ".next", "static", "css");
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith(".css"));
let combinedCss = "";
for (const f of cssFiles) {
  combinedCss += fs.readFileSync(path.join(cssDir, f), "utf8") + "\n";
}

// 1. Overview
const overviewHtml = fs.readFileSync(path.join(baseDir, ".next", "server", "app", "admin", "overview.html"), "utf8");
// Replace stylesheet link with inlined style
const overviewInlined = overviewHtml.replace(
  /<link rel="stylesheet"[^>]+>/g,
  `<style>${combinedCss}</style>`
);
fs.writeFileSync(path.join(outDir, "admin_overview.html"), overviewInlined);

// 1b. Overview with Mobile Drawer open
// The drawer markup in SidebarContent:
// <div class="fixed inset-0 z-50 md:hidden">...
// Let's create an overview with mobile drawer open:
const drawerMarkup = `
<div class="fixed inset-0 z-50 md:hidden">
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>
  <div class="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
    <div class="flex flex-col h-full bg-white/95 backdrop-blur-xl">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#B80022] flex items-center justify-center text-white shadow-md shadow-red-500/30 font-heading font-black text-xl">B</div>
          <div>
            <h1 class="font-heading font-extrabold text-xl text-[#1F2430] leading-none tracking-tight">Buy<span class="text-[#E4002B]">Me</span></h1>
            <span class="text-[10px] font-bold text-[#E4002B] tracking-wider uppercase">Admin Ops Center</span>
          </div>
        </div>
        <button class="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <nav class="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
        <div class="text-[11px] font-bold text-[#6B7280] px-3 py-1.5 uppercase tracking-wider font-heading">Management</div>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all bg-[#E4002B] text-white shadow-md shadow-red-500/25 font-semibold">
          <div class="flex items-center gap-3"><span>Executive Overview</span></div>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Orders Stream</span></div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E4002B] text-white">22 Live</span>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Stores Network</span></div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">10 Hubs</span>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Product Catalog</span></div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">42 Items</span>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Categories</span></div>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Store Inventory</span></div>
        </a>
        <div class="text-[11px] font-bold text-[#6B7280] px-3 pt-4 pb-1.5 uppercase tracking-wider font-heading">Operations & Intelligence</div>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Delivery Fleet</span></div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E4002B]">15 Active</span>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Customers</span></div>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Live Delivery Map</span></div>
        </a>
        <a class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60">
          <div class="flex items-center gap-3"><span>Analytics & Reports</span></div>
        </a>
      </nav>
      <div class="p-4 border-t border-gray-100 bg-white/50">
        <div class="bg-red-50/80 rounded-2xl p-3 border border-red-100">
          <div class="flex items-center justify-between text-xs text-[#B80022] font-bold">
            <span>Currency: LKR</span>
            <span class="text-[10px] bg-red-200/60 px-1.5 py-0.5 rounded font-mono">DEMO</span>
          </div>
          <p class="text-[11px] text-[#6B7280] mt-1 leading-snug">Batticaloa District • 10 Hyperlocal Store Pools</p>
        </div>
      </div>
    </div>
  </div>
</div>
`;
const overviewDrawerInlined = overviewInlined.replace("</body>", `${drawerMarkup}</body>`);
fs.writeFileSync(path.join(outDir, "admin_overview_drawer.html"), overviewDrawerInlined);

// 2. Orders
const ordersHtml = fs.readFileSync(path.join(baseDir, ".next", "server", "app", "admin", "orders.html"), "utf8");
const ordersInlined = ordersHtml.replace(
  /<link rel="stylesheet"[^>]+>/g,
  `<style>${combinedCss}</style>`
);
fs.writeFileSync(path.join(outDir, "admin_orders.html"), ordersInlined);

console.log("HTML preview files generated with inlined Next.js CSS successfully!");
