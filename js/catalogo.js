(function() {
    // ============================================================
    //  ⚙️  CONFIGURAÇÃO — altere o número do WhatsApp aqui
    // ============================================================
    const WHATSAPP_NUMBER = '5511992549400'; // ← troque pelo número real
    // ============================================================

    // ===== ESTADO GLOBAL =====
    let productsData = { fe: [], bebe: [], personagens: [] };
    let allProducts = {};      // mapa id → produto
    let cart = [];             // [{ id, qty }]
    let loaded = false;        // flag para saber se os produtos foram carregados

    // ===== UTILIDADES =====
    function formatBRL(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ===== CARRINHO =====
    function getCartTotal() {
        return cart.reduce((acc, item) => acc + (allProducts[item.id]?.price || 0) * item.qty, 0);
    }
    function getCartCount() {
        return cart.reduce((acc, item) => acc + item.qty, 0);
    }

    function addToCart(productId) {
        if (!allProducts[productId]) return;
        const existing = cart.find(i => i.id === productId);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ id: productId, qty: 1 });
        }
        renderCart();
        updateBadge();
        showToast(`"${allProducts[productId].title}" adicionado! 🛒`);
    }

    function removeFromCart(productId) {
        cart = cart.filter(i => i.id !== productId);
        renderCart();
        updateBadge();
    }

    function changeQty(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) removeFromCart(productId);
        else { renderCart(); updateBadge(); }
    }

    function clearCart() {
        if (confirm('Deseja limpar o carrinho?')) {
            cart = [];
            renderCart();
            updateBadge();
        }
    }

    function updateBadge() {
        const count = getCartCount();
        const badge = document.getElementById('cart-badge');
        badge.textContent = count;
        badge.classList.toggle('visible', count > 0);
    }

    function renderCart() {
        const list = document.getElementById('cart-items-list');
        const footer = document.getElementById('cart-footer');
        const summary = document.getElementById('cart-summary');

        list.innerHTML = '';

        if (cart.length === 0) {
            list.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Seu carrinho está vazio.<br>Adicione peças lindas para começar! 🌸</p>
                </div>`;
            footer.style.display = 'none';
            return;
        }

        footer.style.display = 'block';

        cart.forEach(item => {
            const product = allProducts[item.id];
            if (!product) return;
            const subtotal = product.price * item.qty;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-img-placeholder">🧶</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.title}</div>
                    <div class="cart-item-price">${formatBRL(subtotal)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" data-action="dec" data-id="${product.id}">−</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn" data-action="inc" data-id="${product.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-remove="${product.id}" title="Remover">
                    <i class="fas fa-times"></i>
                </button>
            `;
            list.appendChild(div);
        });

        const total = getCartTotal();
        const count = getCartCount();
        summary.innerHTML = `
            <div class="cart-summary-row">
                <span>${count} ${count === 1 ? 'item' : 'itens'}</span>
                <span>${formatBRL(total)}</span>
            </div>
            <div class="cart-summary-total">
                <span>Total</span>
                <span>${formatBRL(total)}</span>
            </div>
        `;

        buildWhatsAppLink();
    }

    function buildWhatsAppLink() {
        const lines = ['🛒 *MEU PEDIDO – BilaBilu Crochê*', ''];
        cart.forEach(item => {
            const p = allProducts[item.id];
            if (!p) return;
            const subtotal = formatBRL(p.price * item.qty);
            lines.push(`• ${item.qty}x ${p.title} — ${subtotal}`);
        });
        lines.push('');
        lines.push(`━━━━━━━━━━━━━━`);
        lines.push(`💰 *Total: ${formatBRL(getCartTotal())}*`);
        lines.push('');
        lines.push('Aguardo confirmação e instruções de pagamento! 🌸');

        const msg = encodeURIComponent(lines.join('\n'));
        document.getElementById('btn-whatsapp').href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    }

    // ===== EVENTOS DO CARRINHO =====
    document.getElementById('cart-float-btn').addEventListener('click', openCart);
    document.getElementById('cart-close-btn').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
    document.getElementById('btn-clear-cart').addEventListener('click', clearCart);

    document.getElementById('cart-items-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        const rem = e.target.closest('[data-remove]');
        if (btn) {
            const id = parseInt(btn.dataset.id);
            btn.dataset.action === 'inc' ? changeQty(id, 1) : changeQty(id, -1);
        }
        if (rem) removeFromCart(parseInt(rem.dataset.remove));
    });

    function openCart() {
        document.getElementById('cart-panel').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        document.getElementById('cart-panel').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    // ===== RENDERIZAÇÃO DOS PRODUTOS =====
    function renderProducts(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        if (!items.length) {
            container.innerHTML = '<p style="text-align:center; padding:2rem;">Nenhum produto nesta categoria.</p>';
            return;
        }
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>
                <div class="product-info">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <span class="price">${formatBRL(item.price)}</span>
                    <div class="product-actions">
                        <button class="btn view-product" data-id="${item.id}">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        <button class="btn-add-cart" data-addcart="${item.id}">
                            <i class="fas fa-shopping-bag"></i> Adicionar
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ===== CARREGAR PRODUTOS DO JSON =====
    function loadProducts() {
        fetch('products.json')
            .then(response => {
                if (!response.ok) throw new Error('Falha ao carregar produtos');
                return response.json();
            })
            .then(data => {
                const products = data.products;
                // Organizar por categoria
                productsData = {
                    fe: products.filter(p => p.category === 'fe'),
                    bebe: products.filter(p => p.category === 'bebe'),
                    personagens: products.filter(p => p.category === 'personagens')
                };
                // Preencher mapa allProducts
                products.forEach(p => allProducts[p.id] = p);

                // Renderizar as seções
                renderProducts('fe-container', productsData.fe);
                renderProducts('bebe-container', productsData.bebe);
                renderProducts('personagens-container', productsData.personagens);

                loaded = true;
                // Recarregar o carrinho (caso já houvesse itens, mas não havia produtos carregados)
                renderCart();
            })
            .catch(error => {
                console.error('Erro ao carregar produtos:', error);
                // Mostrar mensagem amigável nas seções
                document.querySelectorAll('.products').forEach(container => {
                    container.innerHTML = '<p style="text-align:center; padding:2rem;">⚠️ Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
                });
            });
    }

    // ===== MODAL =====
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.querySelector('.close-modal');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-product')) {
            const id = parseInt(e.target.dataset.id);
            const product = allProducts[id];
            if (product) {
                modalContent.innerHTML = `
                    <div style="text-align:center; background:#fff5f2; border-radius:15px; padding:0.8rem; margin-bottom:1rem;">
                        <img src="${product.image}" alt="${product.title}"
                            style="max-width:100%; max-height:260px; width:auto; height:auto;
                                   object-fit:contain; border-radius:10px; display:block; margin:0 auto;">
                    </div>
                    <h2 style="font-family:'Playfair Display',serif; color:var(--medio); margin-bottom:0.6rem;">${product.title}</h2>
                    <p style="color:#555; line-height:1.7; margin-bottom:1rem;">${product.description}</p>
                    <p class="price" style="margin-bottom:1rem;">${formatBRL(product.price)}</p>
                    <div class="modal-actions">
                        <button class="btn" id="modal-add-btn" data-addcart="${product.id}">
                            <i class="fas fa-shopping-bag"></i> Adicionar ao Carrinho
                        </button>
                    </div>
                `;
                modal.classList.add('active');
            }
        }
    });

    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Delegação para botões "Adicionar" (nos cards e no modal)
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-addcart]');
        if (addBtn && loaded) {
            addToCart(parseInt(addBtn.dataset.addcart));
            const originalHtml = addBtn.innerHTML;
            addBtn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
            setTimeout(() => { addBtn.innerHTML = originalHtml; }, 1800);
        } else if (addBtn && !loaded) {
            showToast('Aguarde, produtos estão carregando...');
        }
    });

    // ===== LOADER =====
    window.addEventListener('load', function() {
        loadProducts(); // carrega os produtos
        document.getElementById('loader').classList.add('hidden');
        setTimeout(() => document.getElementById('loader').style.display = 'none', 600);
    });

    // ===== ANO =====
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // ===== MOSTRAR MAIS =====
    const showMoreBtn = document.getElementById('show-more-btn');
    const moreContent = document.getElementById('more-content');
    if (showMoreBtn && moreContent) {
        showMoreBtn.addEventListener('click', () => {
            const hidden = moreContent.style.display === 'none';
            moreContent.style.display = hidden ? 'block' : 'none';
            showMoreBtn.textContent = hidden ? 'Mostrar Menos' : 'Mostrar Mais';
        });
    }

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('active', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ===== ROLAGEM SUAVE =====
    const navLinks = document.querySelectorAll('nav a');
    const nav = document.querySelector('nav');
    if (navLinks.length && nav) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetEl = document.querySelector(link.getAttribute('href'));
                if (targetEl) {
                    const top = targetEl.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 10;
                    window.scrollTo({ top, behavior: 'smooth' });
                    history.pushState(null, null, link.getAttribute('href'));
                }
            });
        });
    }

    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        requestAnimationFrame(animateParticles);
    }
    window.addEventListener('resize', initParticles);
    initParticles();
    animateParticles();

    // Rastro do mouse
    const trailCanvas = document.createElement('canvas');
    trailCanvas.id = 'mouse-trail';
    document.body.appendChild(trailCanvas);
    const trailCtx = trailCanvas.getContext('2d');
    let mouseX = 0, mouseY = 0, trailPositions = [];
    function initTrail() {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }
    function updateTrail() {
        trailPositions.unshift({ x: mouseX, y: mouseY, age: 0 });
        if (trailPositions.length > 30) trailPositions.pop();
        trailPositions.forEach(p => p.age++);
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        trailPositions.forEach(p => {
            const op = Math.max(0, 1 - p.age / 30);
            trailCtx.beginPath();
            trailCtx.arc(p.x, p.y, 8 * (1 - p.age / 30), 0, Math.PI * 2);
            trailCtx.fillStyle = `rgba(217,127,119,${op * 0.4})`;
            trailCtx.fill();
        });
        requestAnimationFrame(updateTrail);
    }
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('load', () => { initTrail(); updateTrail(); });
    window.addEventListener('resize', initTrail);

    // Inicializar carrinho vazio (espera o load)
    renderCart();
})();