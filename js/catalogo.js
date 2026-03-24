(function() {
    // ============================================================
    //  ⚙️  CONFIGURAÇÃO — altere o número do WhatsApp aqui
    // ============================================================
    const WHATSAPP_NUMBER = '5511992549400'; // ← troque pelo número real (com DDI+DDD, sem espaços ou traços)
    // ============================================================

    // ===== DADOS DOS PRODUTOS =====
    const productsData = {
        fe: [
            { id: 1,   title: "Santinhas",       description: "Linda santinha feita em crochê com fio 100% algodão. Tamanho 25cm.",                              price: 240, image: "css/Imagens/Mãezinhadocéu.jpeg" },
            { id: 2,   title: "Anjinhos",         description: "Anjo protetor em crochê, perfeito para presentear. 20cm de altura.",                              price: 180, image: "css/Imagens/IMG_0913.PNG" },
            { id: 3,   title: "Terços",           description: "Terço de crochê com contas e crucifixo artesanal. 50cm.",                                        price: 90,  image: "css/Imagens/IMG_0921.PNG" },
            { id: 4,   title: "Presépio",         description: "Conjunto completo do presépio em crochê (Menino Jesus, Maria, José, animais).",                  price: 580, image: "css/Imagens/IMG_0909.PNG" },
            { id: 5,   title: "Sagrada Família",  description: "Representação da Sagrada Família em crochê. 30cm cada peça.",                                    price: 450, image: "css/Imagens/Nossasenhora.jpeg" },
            { id: 6,   title: "Jesus",            description: "Imagem de Jesus em crochê, 25cm de altura.",                                                     price: 220, image: "css/Imagens/Nossasenhora2.jpeg" }
        ],
        bebe: [
            { id: 101, title: "Móbile",           description: "Móbile de crochê com bichinhos para berço. Estimula os sentidos do bebê.",                       price: 150, image: "css/Imagens/IMG_0913.PNG" },
            { id: 102, title: "Porta maternidade",description: "Porta maternidade personalizado com nome e data, feito em crochê.",                              price: 120, image: "css/Imagens/IMG_0921.PNG" },
            { id: 103, title: "Naninha",          description: "Naninha macia de crochê com cabeça de ursinho. 30x30cm.",                                        price: 85,  image: "css/Imagens/IMG_0909.PNG" },
            { id: 104, title: "Fofuras",          description: "Conjunto de fofuras: sapatinho, luvinha e gorro em crochê.",                                     price: 110, image: "css/Imagens/IMG_0913.PNG" },
            { id: 105, title: "Zoo safari",       description: "Bichinhos de crochê temáticos de safári: leão, girafa, elefante. 15cm.",                         price: 95,  image: "css/Imagens/IMG_0921.PNG" },
            { id: 106, title: "Chocalho",         description: "Chocalho de crochê em formato de flor, seguro e colorido.",                                      price: 45,  image: "css/Imagens/IMG_0909.PNG" }
        ],
        personagens: [
            { id: 201, title: "Personagens",      description: "Seu personagem favorito feito em crochê sob encomenda.",                                         price: 140, image: "css/Imagens/IMG_0913.PNG" },
            { id: 202, title: "Turma moranguinho",description: "Moranguinho e suas amigas em versão crochê.",                                                    price: 130, image: "css/Imagens/IMG_0921.PNG" },
            { id: 203, title: "Turma chaves",     description: "Chaves, Chiquinha e Kiko em crochê. Tamanho 20cm.",                                              price: 150, image: "css/Imagens/IMG_0909.PNG" },
            { id: 204, title: "Turma lilo",       description: "Lilo & Stitch em crochê, réplica fiel e cheia de detalhes.",                                     price: 160, image: "css/Imagens/IMG_0913.PNG" },
            { id: 205, title: "Bonecas",          description: "Bonecas de crochê com roupinhas removíveis. 30cm.",                                              price: 180, image: "css/Imagens/IMG_0921.PNG" },
            { id: 206, title: "Bonecos",          description: "Bonecos diversos em crochê, prontos para brincar ou decorar.",                                   price: 120, image: "css/Imagens/IMG_0909.PNG" }
        ]
    };

    // Mapa global de id → produto
    const allProducts = {};
    [...productsData.fe, ...productsData.bebe, ...productsData.personagens]
        .forEach(p => allProducts[p.id] = p);

    // ===== ESTADO DO CARRINHO =====
    let cart = []; // [{ id, qty }]

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

    // ===== CARRINHO — LÓGICA =====
    function getCartTotal() {
        return cart.reduce((acc, item) => acc + allProducts[item.id].price * item.qty, 0);
    }
    function getCartCount() {
        return cart.reduce((acc, item) => acc + item.qty, 0);
    }

    function addToCart(productId) {
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
        cart = [];
        renderCart();
        updateBadge();
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

        // Resumo
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

        // Montar link WhatsApp
        buildWhatsAppLink();
    }

    function buildWhatsAppLink() {
        const lines = ['🛒 *MEU PEDIDO – BilaBilu Crochê*', ''];
        cart.forEach(item => {
            const p = allProducts[item.id];
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
    document.getElementById('btn-clear-cart').addEventListener('click', () => {
        if (confirm('Deseja limpar o carrinho?')) clearCart();
    });

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

    // ===== RENDERIZAR PRODUTOS =====
    function renderProducts(containerId, items) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
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
                        <button class="btn view-product" data-id="${item.id}" data-type="${containerId}">
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

    renderProducts('fe-container', productsData.fe);
    renderProducts('bebe-container', productsData.bebe);
    renderProducts('personagens-container', productsData.personagens);

    // Delegação — botão "Adicionar" nos cards
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-addcart]');
        if (addBtn) {
            addToCart(parseInt(addBtn.dataset.addcart));
            addBtn.classList.add('added');
            const orig = addBtn.innerHTML;
            addBtn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
            setTimeout(() => {
                addBtn.classList.remove('added');
                addBtn.innerHTML = orig;
            }, 1800);
        }
    });

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
                    <h2 style="font-family:'Playfair Display',serif; color:var(--medio); margin-bottom:1rem;">${product.title}</h2>
                    <div style="display:flex; flex-wrap:wrap; gap:20px;">
                        <img src="${product.image}" style="flex:1; min-width:180px; max-width:100%; border-radius:15px; object-fit:cover;">
                        <div style="flex:2; min-width:180px;">
                            <p style="color:#555; line-height:1.6;">${product.description}</p>
                            <p class="price" style="margin:1rem 0;">${formatBRL(product.price)}</p>
                            <div class="modal-actions">
                                <button class="btn" id="modal-add-btn" data-addcart="${product.id}">
                                    <i class="fas fa-shopping-bag"></i> Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
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

    // ===== LOADER =====
    window.addEventListener('load', function() {
        document.getElementById('loader').classList.add('hidden');
        setTimeout(() => document.getElementById('loader').style.display = 'none', 600);
    });

    // ===== ANO =====
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // ===== MOSTRAR MAIS =====
    const showMoreBtn = document.getElementById('show-more-btn');
    const moreContent = document.getElementById('more-content');
    showMoreBtn.addEventListener('click', () => {
        const hidden = moreContent.style.display === 'none';
        moreContent.style.display = hidden ? 'block' : 'none';
        showMoreBtn.textContent = hidden ? 'Mostrar Menos' : 'Mostrar Mais';
    });

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

    // ===== PARTÍCULAS =====
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    function initParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = Array.from({ length: 35 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 1,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            color: `rgba(217,127,119,${Math.random() * 0.3})`
        }));
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

    // ===== RASTRO DO MOUSE =====
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

    // Inicializar carrinho vazio
    renderCart();

})();