const produtos = window.PRODUTOS || [];

const grid = document.getElementById("produtoGrid");
const buscaInput = document.getElementById("busca");
const filtrosEl = document.getElementById("filtros");
const destaqueEl = document.getElementById("destaqueProduto");

const categorias = ["todos", ...new Set(produtos.map((item) => item.category))];
let categoriaAtiva = "todos";

function renderDestaqueHome() {
  if (!destaqueEl || !produtos.length) {
    return;
  }

  const primeiroProduto = produtos[0];
  const midias = [
    { type: "image", src: primeiroProduto.image },
    ...((primeiroProduto.galleryLinks || []).map((img) => ({ type: "image", src: img }))),
    ...(primeiroProduto.videoLink ? [{ type: "video", src: primeiroProduto.videoLink }] : [])
  ];

  const slides = midias
    .map((midia, idx) => {
      if (midia.type === "video") {
        return `
          <div class="destaque-slide ${idx === 0 ? "active" : ""}" data-index="${idx}">
            <video class="destaque-media" controls playsinline preload="metadata">
              <source src="${midia.src}" type="application/x-mpegURL" />
              <source src="${midia.src}" />
              Seu navegador nao suporta o player de video.
            </video>
          </div>
        `;
      }

      return `
        <div class="destaque-slide ${idx === 0 ? "active" : ""}" data-index="${idx}">
          <img class="destaque-media" src="${midia.src}" alt="${primeiroProduto.name} - midia ${idx + 1}" />
        </div>
      `;
    })
    .join("");

  const thumbs = midias
    .map(
      (midia, idx) => `
        <button
          class="destaque-thumb ${idx === 0 ? "active" : ""}"
          type="button"
          data-index="${idx}"
          aria-label="Abrir ${midia.type === "video" ? "video" : "imagem"} ${idx + 1}"
        >
          ${
            midia.type === "video"
              ? '<span class="destaque-thumb-video">Video</span>'
              : `<img src="${midia.src}" alt="Miniatura ${idx + 1} de ${primeiroProduto.name}" loading="lazy" />`
          }
        </button>
      `
    )
    .join("");

  destaqueEl.innerHTML = `
    <article class="destaque-card">
      <div class="destaque-carousel" aria-label="Carrossel de midias de ${primeiroProduto.name}">
        <div class="destaque-slides-wrap">
          ${slides}
          <button class="destaque-nav destaque-nav-prev" type="button" aria-label="Midia anterior">&lsaquo;</button>
          <button class="destaque-nav destaque-nav-next" type="button" aria-label="Proxima midia">&rsaquo;</button>
        </div>
        <div class="destaque-thumbs" role="tablist" aria-label="Miniaturas do produto">
          ${thumbs}
        </div>
      </div>
      <div class="destaque-info">
        <span class="cat">Destaque da Home</span>
        <h2>${primeiroProduto.name}</h2>
        <p class="hero-copy">Produto em destaque com link direto para compra.</p>
        <p class="destaque-counter"><span id="destaqueAtual">1</span> / ${midias.length}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${primeiroProduto.affiliateLink}" target="_blank" rel="nofollow sponsored noopener noreferrer">Comprar</a>
        </div>
      </div>
    </article>
  `;

  const slideEls = destaqueEl.querySelectorAll(".destaque-slide");
  const thumbEls = destaqueEl.querySelectorAll(".destaque-thumb");
  const prevBtn = destaqueEl.querySelector(".destaque-nav-prev");
  const nextBtn = destaqueEl.querySelector(".destaque-nav-next");
  const counterEl = document.getElementById("destaqueAtual");

  let indiceAtual = 0;
  let autoplayId = null;

  function irPara(indice) {
    if (!slideEls.length) {
      return;
    }

    const total = slideEls.length;
    indiceAtual = (indice + total) % total;

    slideEls.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === indiceAtual);

      const video = slide.querySelector("video");
      if (video && idx !== indiceAtual) {
        video.pause();
        video.currentTime = 0;
      }
    });

    thumbEls.forEach((thumb, idx) => {
      thumb.classList.toggle("active", idx === indiceAtual);
    });

    if (counterEl) {
      counterEl.textContent = String(indiceAtual + 1);
    }
  }

  prevBtn?.addEventListener("click", () => irPara(indiceAtual - 1));
  nextBtn?.addEventListener("click", () => irPara(indiceAtual + 1));

  thumbEls.forEach((thumb) => {
    const idx = Number(thumb.dataset.index || 0);
    thumb.addEventListener("click", () => irPara(idx));
    thumb.addEventListener("mouseenter", () => irPara(idx));
  });

  function pararAutoplay() {
    if (autoplayId !== null) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function iniciarAutoplay() {
    pararAutoplay();
    if (slideEls.length <= 1) {
      return;
    }

    autoplayId = window.setInterval(() => {
      irPara(indiceAtual + 1);
    }, 4000);
  }

  const destaqueCard = destaqueEl.querySelector(".destaque-card");

  destaqueCard?.addEventListener("mouseenter", pararAutoplay);
  destaqueCard?.addEventListener("mouseleave", iniciarAutoplay);
  destaqueCard?.addEventListener("focusin", pararAutoplay);
  destaqueCard?.addEventListener("focusout", iniciarAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pararAutoplay();
      return;
    }

    iniciarAutoplay();
  });

  iniciarAutoplay();
}

function renderFiltros() {
  filtrosEl.innerHTML = categorias
    .map(
      (cat) => `
      <button class="filtro-btn ${cat === categoriaAtiva ? "active" : ""}" data-cat="${cat}">
        ${cat}
      </button>
    `
    )
    .join("");

  filtrosEl.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      categoriaAtiva = btn.dataset.cat;
      renderFiltros();
      renderProdutos();
    });
  });
}

function filtrarProdutos() {
  const termo = buscaInput.value.trim().toLowerCase();

  return produtos.filter((item) => {
    const combinaCategoria =
      categoriaAtiva === "todos" || item.category === categoriaAtiva;
    const combinaBusca =
      item.name.toLowerCase().includes(termo) ||
      item.category.toLowerCase().includes(termo);

    return combinaCategoria && combinaBusca;
  });
}

function renderProdutos() {
  const lista = filtrarProdutos();

  if (!lista.length) {
    grid.innerHTML = `
      <div class="empty">
        Nenhum produto encontrado para este filtro. Tente outra busca ou categoria.
      </div>
    `;
    return;
  }

  grid.innerHTML = lista
    .map(
      (item, idx) => {
        const mostrarPreco = item.price && item.price !== "Consulte no botao Comprar";

        return `
      <article class="card" style="animation-delay:${idx * 70}ms">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div class="card-body">
          <span class="cat">${item.category}</span>
          <h3>${item.name}</h3>
          ${mostrarPreco ? `<p class="price">${item.price}</p>` : ""}
          <div class="card-actions">
            <a
              class="btn-link"
              href="${item.affiliateLink}"
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
            >
              Comprar
            </a>
          </div>
        </div>
      </article>
    `;
      }
    )
    .join("");
}

buscaInput.addEventListener("input", renderProdutos);

renderDestaqueHome();
renderFiltros();
renderProdutos();
