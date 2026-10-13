(() => {
  "use strict";
  // غيّري رقم واتساب هنا فقط عند الحاجة، بصيغة دولية بدون + أو مسافات.
  const WHATSAPP_NUMBER = "201146499941";
  const currency = n => `${Number(n).toLocaleString("en-US")} ج.م`;
  const products = Array.isArray(window.MOON_PRODUCTS) ? window.MOON_PRODUCTS : [];
  let selectedCategory = "الكل";
  let searchTerm = "";
  let sortMode = "featured";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem("moonStoreCart") || "{}") || {}; } catch (_) { cart = {}; }

  const $ = id => document.getElementById(id);
  const grid = $("productGrid"), cartItems = $("cartItems"), drawer = $("cartDrawer"), overlay = $("overlay"), modal = $("checkoutModal");
  $("year").textContent = new Date().getFullYear();
  $("whatsappLink").href = `https://wa.me/${WHATSAPP_NUMBER}`;
  $("whatsappLink").target = "_blank";
  $("whatsappLink").rel = "noopener";

  function persist(){ try { localStorage.setItem("moonStoreCart", JSON.stringify(cart)); } catch (_) {} }
  function productById(id){ return products.find(p => p.id === id); }
  function filteredProducts(){
    let arr = products.filter(p => (selectedCategory === "الكل" || p.category === selectedCategory) &&
      `${p.name} ${p.category} ${p.description || ""}`.toLowerCase().includes(searchTerm.toLowerCase()));
    if(sortMode === "low") arr.sort((a,b)=>a.price-b.price);
    if(sortMode === "high") arr.sort((a,b)=>b.price-a.price);
    return arr;
  }
  function renderProducts(){
    const arr = filteredProducts();
    $("emptyProducts").hidden = arr.length > 0;
    grid.innerHTML = arr.map(p => `<article class="product-card">
      <div class="product-image"><span class="product-emoji">${escapeHtml(p.emoji || "✧")}</span>${p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>` : ""}<button class="wish" aria-label="إضافة للمفضلة" title="إضافة للمفضلة">♡</button></div>
      <div class="product-info"><h3>${escapeHtml(p.name)}</h3><p class="product-description">${escapeHtml(p.description || "")}</p><div class="price-row"><span class="price">${currency(p.price)}</span>${p.oldPrice ? `<span class="old-price">${currency(p.oldPrice)}</span>` : ""}</div><button class="add-button" data-add="${escapeHtml(p.id)}">أضيفي إلى السلة</button></div>
    </article>`).join("");
  }
  function escapeHtml(v){return String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function countItems(){ return Object.values(cart).reduce((s,q)=>s+q,0); }
  function total(){ return Object.entries(cart).reduce((s,[id,q])=>{const p=productById(id);return s+(p ? p.price*q : 0);},0); }
  function renderCart(){
    for(const id of Object.keys(cart)) if(!productById(id) || cart[id] <= 0) delete cart[id];
    persist();
    $("cartCount").textContent = countItems();
    $("cartTotal").textContent = currency(total());
    $("checkoutTotal").textContent = currency(total());
    if(!countItems()){
      cartItems.innerHTML = `<div class="empty-products">سلتك لسه فاضية ♡<br><small>اختاري المنتجات اللي عجبتك.</small></div>`;
      $("checkoutOpen").disabled = true; $("checkoutOpen").style.opacity = ".5";
      return;
    }
    $("checkoutOpen").disabled = false; $("checkoutOpen").style.opacity = "1";
    cartItems.innerHTML = Object.entries(cart).map(([id,q])=>{
      const p=productById(id); if(!p)return "";
      return `<div class="cart-line"><div class="cart-thumb">${escapeHtml(p.emoji || "✧")}</div><div><h3>${escapeHtml(p.name)}</h3><small>${currency(p.price)} للقطعة</small><div class="qty"><button data-qty="${id}" data-change="-1" aria-label="تقليل">−</button><span>${q}</span><button data-qty="${id}" data-change="1" aria-label="زيادة">+</button></div></div><button class="remove-line" data-remove="${id}">حذف</button></div>`;
    }).join("");
  }
  function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200);}
  function openCart(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");overlay.classList.add("show");}
  function closePanels(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");modal.classList.remove("open");modal.setAttribute("aria-hidden","true");overlay.classList.remove("show");}
  function openCheckout(){
    if(!countItems()){toast("أضيفي منتجًا للسلة أولًا");return;}
    modal.classList.add("open");modal.setAttribute("aria-hidden","false");
  }
  document.addEventListener("click", e=>{
    const add=e.target.closest("[data-add]");
    if(add){const id=add.dataset.add;cart[id]=(cart[id]||0)+1;renderCart();toast("اتضاف المنتج للسلة ♡");return;}
    const qty=e.target.closest("[data-qty]");
    if(qty){const id=qty.dataset.qty;cart[id]=(cart[id]||0)+Number(qty.dataset.change);if(cart[id]<=0)delete cart[id];renderCart();return;}
    const rem=e.target.closest("[data-remove]");
    if(rem){delete cart[rem.dataset.remove];renderCart();return;}
    const cat=e.target.closest("[data-category]");
    if(cat){selectedCategory=cat.dataset.category;document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b===cat));renderProducts();return;}
    if(e.target.closest(".wish")) toast("قائمة المفضلة هتتفعّل في نسخة لاحقة");
  });
  $("cartOpen").addEventListener("click",openCart);
  $("cartClose").addEventListener("click",closePanels);
  $("continueShopping").addEventListener("click",closePanels);
  $("checkoutOpen").addEventListener("click",openCheckout);
  $("checkoutClose").addEventListener("click",()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true");});
  overlay.addEventListener("click",closePanels);
  $("searchInput").addEventListener("input",e=>{searchTerm=e.target.value;renderProducts();});
  $("sortSelect").addEventListener("change",e=>{sortMode=e.target.value;renderProducts();});
  $("searchToggle").addEventListener("click",()=>{$("searchBox").scrollIntoView({behavior:"smooth",block:"center"});$("searchInput").focus();});
  $("menuToggle").addEventListener("click",()=> $("mainNav").classList.toggle("open"));
  document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=> $("mainNav").classList.remove("open")));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closePanels();});

  $("checkoutForm").addEventListener("submit",e=>{
    e.preventDefault();
    const err=$("formError");err.textContent="";
    if(!countItems()){err.textContent="السلة فارغة. أضيفي منتجًا أولًا.";return;}
    const fd=new FormData(e.currentTarget);
    const name=String(fd.get("customerName")||"").trim();
    const phone=String(fd.get("customerPhone")||"").trim();
    const governorate=String(fd.get("governorate")||"").trim();
    const address=String(fd.get("address")||"").trim();
    const notes=String(fd.get("notes")||"").trim();
    if(!name||!phone||!governorate||!address){err.textContent="من فضلك كمّلي البيانات المطلوبة.";return;}
    const lines=Object.entries(cart).map(([id,q])=>{const p=productById(id);return p?`• ${p.name} × ${q} = ${currency(p.price*q)}`:"";}).filter(Boolean);
    const order=`طلب جديد من Moon Store 🌙\n\nالاسم: ${name}\nرقم الموبايل: ${phone}\nالمحافظة: ${governorate}\nالعنوان: ${address}\n\nالمنتجات:\n${lines.join("\n")}\n\nإجمالي المنتجات: ${currency(total())}\nالشحن: يُحدد ويُؤكد قبل الإرسال النهائي\nملاحظات: ${notes || "لا يوجد"}\n\nبرجاء تأكيد توافر المنتجات وتكلفة الشحن والإجمالي النهائي.`;
    const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(order)}`;
    const win=window.open(url,"_blank");
    if(!win) window.location.href=url;
    toast("راجعي الرسالة في واتساب واضغطي إرسال لتأكيد الطلب");
  });
  renderProducts();renderCart();
})();