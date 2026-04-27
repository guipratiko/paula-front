import { getApiPrefix, apiUrl } from "../js/apiBase.js";

const TOKEN_KEY = "pff_admin_token";
const API = getApiPrefix();

const app = document.getElementById("app");
const dlg = document.getElementById("dlg-product");
const form = document.getElementById("form-product");
const formError = document.getElementById("form-error");
const fieldId = document.getElementById("field-id");
const fieldName = document.getElementById("field-name");
const fieldCategory = document.getElementById("field-category");
const fieldDescription = document.getElementById("field-description");
const fieldImageUrl = document.getElementById("field-image_url");
const fieldSku = document.getElementById("field-sku");
const fieldIsActive = document.getElementById("field-is_active");
const dlgTitle = document.getElementById("dlg-product-title");
const btnCancel = document.getElementById("btn-cancel");

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function api(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || "Resposta inválida" };
  }

  if (res.status === 401) {
    setToken(null);
    const err = new Error(data?.error || "Não autorizado");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Erro ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function fillCategoryDatalist() {
  const listEl = document.getElementById("field-category-list");
  if (!listEl) return;
  listEl.innerHTML = "";
  let names = [];
  try {
    const res = await fetch(apiUrl("/api/categories"), { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json();
      names = Array.isArray(data?.categories) ? data.categories : [];
    }
  } catch {
    /* API pública; painel segue sem sugestões se falhar */
  }
  for (const raw of names) {
    const name = String(raw ?? "").trim();
    if (!name) continue;
    const opt = document.createElement("option");
    opt.value = name;
    listEl.appendChild(opt);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderLogin(error = "") {
  app.innerHTML = `
    <div class="login">
      <div class="login__card">
        <p class="login__brand">Paula Fashion Fitness</p>
        <h1 class="login__title">Painel do gestor</h1>
        <p class="login__error" id="login-err">${escapeHtml(error)}</p>
        <form id="login-form">
          <label class="field">
            <span>E-mail</span>
            <input type="email" name="email" required autocomplete="username" />
          </label>
          <label class="field">
            <span>Senha</span>
            <input type="password" name="password" required autocomplete="current-password" />
          </label>
          <button type="submit" class="btn btn--primary" style="width:100%;margin-top:0.5rem">Entrar</button>
        </form>
        <p style="margin:1.25rem 0 0;font-size:0.8rem;color:var(--muted)">
          Acesso restrito. Em desenvolvimento, o primeiro usuário é criado automaticamente
          (<strong>admin@local.test</strong> / <strong>admin123</strong>) se não houver <code>.env</code>.
        </p>
      </div>
    </div>
  `;

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const btn = e.target.querySelector('button[type="submit"]');
    const errEl = document.getElementById("login-err");
    errEl.textContent = "";
    btn.disabled = true;
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      await openDashboard();
    } catch (err) {
      errEl.textContent = err.message || "Falha no login.";
    } finally {
      btn.disabled = false;
    }
  });
}

async function fetchProducts() {
  const data = await api("/admin/products");
  return data.products || [];
}

function renderProductRow(p) {
  return `
    <tr data-id="${p.id}">
      <td>${p.id}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td>
        <span class="badge ${p.is_active ? "badge--on" : "badge--off"}">
          ${p.is_active ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td>${formatDate(p.updated_at)}</td>
      <td class="cell-actions">
        <button type="button" class="btn btn--ghost js-edit" data-id="${p.id}">Editar</button>
        <button type="button" class="btn btn--danger js-del" data-id="${p.id}">Excluir</button>
      </td>
    </tr>
  `;
}

async function openDashboard() {
  let user = { email: "" };
  try {
    const me = await api("/auth/me");
    user = me.user || user;
  } catch {
    renderLogin("");
    return;
  }

  let products = [];
  try {
    products = await fetchProducts();
  } catch {
    renderLogin("Sessão expirada. Entre novamente.");
    return;
  }

  const rows =
    products.length === 0
      ? `<tr><td colspan="6"><div class="empty"><strong>Nenhum produto cadastrado</strong>Use “Novo produto” para incluir peças da coleção.</div></td></tr>`
      : products.map(renderProductRow).join("");

  app.innerHTML = `
    <div class="shell">
      <header class="shell__header">
        <div>
          <h1 class="shell__title">Painel — produtos</h1>
          <p class="shell__subtitle">${escapeHtml(user.email)}</p>
        </div>
        <div class="shell__actions">
          <button type="button" class="btn btn--primary" id="btn-new">Novo produto</button>
          <button type="button" class="btn btn--ghost" id="btn-logout">Sair</button>
        </div>
      </header>
      <main class="shell__main">
        <div class="toolbar">
          <p>Cadastro de itens para uso interno e futura integração ao site institucional.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tbody-products">${rows}</tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  document.getElementById("btn-logout").addEventListener("click", () => {
    setToken(null);
    renderLogin("");
  });

  document.getElementById("btn-new").addEventListener("click", () => openProductModal());

  document.getElementById("tbody-products").addEventListener("click", async (e) => {
    const edit = e.target.closest(".js-edit");
    const del = e.target.closest(".js-del");
    if (edit) {
      const id = Number(edit.dataset.id);
      const { product } = await api(`/admin/products/${id}`);
      openProductModal(product);
    }
    if (del) {
      const id = Number(del.dataset.id);
      if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
      try {
        await api(`/admin/products/${id}`, { method: "DELETE" });
        await openDashboard();
      } catch (err) {
        alert(err.message);
      }
    }
  });
}

function openProductModal(product = null) {
  formError.hidden = true;
  formError.textContent = "";
  fieldId.value = product?.id ?? "";
  fieldName.value = product?.name ?? "";
  fieldCategory.value = product?.category ? String(product.category) : "";
  fieldDescription.value = product?.description ?? "";
  fieldImageUrl.value = product?.image_url ?? "";
  fieldSku.value = product?.sku ?? "";
  fieldIsActive.checked = product ? !!product.is_active : true;
  dlgTitle.textContent = product ? "Editar produto" : "Novo produto";
  dlg.showModal();
}

function closeProductModal() {
  dlg.close();
}

btnCancel.addEventListener("click", closeProductModal);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;
  formError.textContent = "";
  const id = fieldId.value ? Number(fieldId.value) : null;
  const body = {
    name: fieldName.value.trim(),
    category: fieldCategory.value,
    description: fieldDescription.value.trim(),
    image_url: fieldImageUrl.value.trim(),
    sku: fieldSku.value.trim(),
    is_active: fieldIsActive.checked,
  };
  const btnSave = document.getElementById("btn-save");
  btnSave.disabled = true;
  try {
    if (id) {
      await api(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
    } else {
      await api("/admin/products", { method: "POST", body: JSON.stringify(body) });
    }
    closeProductModal();
    await openDashboard();
  } catch (err) {
    formError.textContent = err.message || "Erro ao salvar.";
    formError.hidden = false;
  } finally {
    btnSave.disabled = false;
  }
});

async function boot() {
  await fillCategoryDatalist();
  const token = getToken();
  if (!token) {
    renderLogin("");
    return;
  }
  try {
    await api("/auth/me");
    await openDashboard();
  } catch {
    renderLogin("");
  }
}

boot();
