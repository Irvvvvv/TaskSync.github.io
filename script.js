(() => {
  const STORAGE_KEY = "todo";

  /** @type {{id:string,text:string,done:boolean,createdAt:number}[]} */
  let items = [];

  // Elements per original naming
  const input = document.getElementById("todoInput");
  const list = document.getElementById("todoList");
  const count = document.getElementById("todoCount");
  const addBtn = document.getElementById("addButton");
  const deleteAllBtn = document.getElementById("deleteButton");   // 'Clear all'
  const clearCompletedBtn = document.getElementById("clearCompleted");

  const uid = () => Math.random().toString(36).slice(2, 9);

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(data)) items = data;
    } catch (e) {
      items = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function updateCount() {
    count.textContent = String(items.length);
  }

  function render() {
    list.innerHTML = "";
    items.forEach((it) => {
      const row = document.createElement("div");
      row.className = "item";
      row.dataset.id = it.id;
      row.innerHTML = `
        <input class="todo-checkbox" type="checkbox" ${it.done ? "checked" : ""} aria-label="Mark complete">
        <input id="todo-${it.id}" class="item__text ${it.done ? "done" : ""}" value="${escapeHTML(it.text)}" aria-label="Edit task">
        <div class="actions">
          <button class="icon-btn" data-action="edit" title="Edit">✎</button>
          <button class="icon-btn" data-action="delete" title="Delete">🗑</button>
        </div>
      `;
      // events per row
      const checkbox = row.querySelector(".todo-checkbox");
      const textInput = row.querySelector(".item__text");
      checkbox.addEventListener("change", () => toggle(it.id));
      textInput.addEventListener("change", () => rename(it.id, textInput.value));
      textInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          textInput.blur();
        }
      });
      row.querySelector('[data-action="edit"]').addEventListener("click", () => {
        textInput.focus();
        const val = textInput.value;
        textInput.setSelectionRange(val.length, val.length);
      });
      row.querySelector('[data-action="delete"]').addEventListener("click", () => remove(it.id));

      list.appendChild(row);
    });
    updateCount();
  }

  function add(text) {
    const t = (text || "").trim();
    if (!t) return;
    items.push({ id: uid(), text: t, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggle(id) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    it.done = !it.done;
    save();
    render();
  }

  function rename(id, text) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const t = (text || "").trim();
    if (!t) { remove(id); return; }
    it.text = t;
    save();
    render();
  }

  function remove(id) {
    items = items.filter((x) => x.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    items = items.filter((x) => !x.done);
    save();
    render();
  }

  function clearAll() {
    if (!items.length) return;
    if (confirm("Delete all tasks?")) {
      items = [];
      save();
      render();
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));
  }

  // Wire up on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    load();
    render();

    addBtn.addEventListener("click", () => {
      add(input.value);
      input.value = "";
      input.focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        add(input.value);
        input.value = "";
      }
    });

    clearCompletedBtn.addEventListener("click", clearCompleted);
    deleteAllBtn.addEventListener("click", clearAll);
  });
})();