const STORAGE_KEYS = {
  expenses: "familyExpenses",
  salary1: "salary1",
  salary2: "salary2",
  otherIncome: "otherIncome",
};

let expenses = [];

function formatMoney(value) {
  return (
    new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 0,
    }).format(value) + " ₽"
  );
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

function loadState() {
  const savedExpenses = localStorage.getItem(STORAGE_KEYS.expenses);
  if (savedExpenses) {
    try {
      expenses = JSON.parse(savedExpenses) || [];
    } catch {
      expenses = [];
    }
  }

  document.getElementById("salary1").value =
    localStorage.getItem(STORAGE_KEYS.salary1) || "";
  document.getElementById("salary2").value =
    localStorage.getItem(STORAGE_KEYS.salary2) || "";
  document.getElementById("otherIncome").value =
    localStorage.getItem(STORAGE_KEYS.otherIncome) || "";
}

function addExpense() {
  const nameInput = document.getElementById("expenseName");
  const amountInput = document.getElementById("expenseAmount");
  const name = nameInput.value.trim();
  const amount = Number(amountInput.value);

  if (name === "") {
    alert("Введите название расхода.");
    nameInput.focus();
    return;
  }

  if (amount <= 0 || Number.isNaN(amount)) {
    alert("Введите корректную сумму.");
    amountInput.focus();
    return;
  }

  expenses.push({
    id: Date.now(),
    name,
    amount,
  });

  saveExpenses();
  nameInput.value = "";
  amountInput.value = "";
  nameInput.focus();
  renderExpenses();
  calculateBudget();
}

function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses();
  renderExpenses();
  calculateBudget();
}

function renderExpenses() {
  const list = document.getElementById("expenseList");

  if (expenses.length === 0) {
    list.innerHTML =
      '<div class="empty-message">Пока нет добавленных расходов</div>';
    return;
  }

  list.innerHTML = expenses
    .map(
      (expense) => `
      <div class="expense-item">
        <div class="expense-info">
          <div class="expense-name">${escapeHtml(expense.name)}</div>
          <div class="expense-amount">${formatMoney(expense.amount)}</div>
        </div>
        <button class="delete-btn" type="button" data-delete="${expense.id}">
          Удалить
        </button>
      </div>
    `
    )
    .join("");
}

function calculateBudget() {
  const salary1 = Number(document.getElementById("salary1").value) || 0;
  const salary2 = Number(document.getElementById("salary2").value) || 0;
  const otherIncome = Number(document.getElementById("otherIncome").value) || 0;

  const totalIncome = salary1 + salary2 + otherIncome;
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  const balance = totalIncome - totalExpenses;
  const savings = balance > 0 ? balance : 0;

  let expensePercent = 0;
  if (totalIncome > 0) {
    expensePercent = (totalExpenses / totalIncome) * 100;
  }

  const progressWidth = Math.min(expensePercent, 100);

  document.getElementById("totalIncome").textContent = formatMoney(totalIncome);
  document.getElementById("totalExpenses").textContent =
    formatMoney(totalExpenses);
  document.getElementById("balance").textContent = formatMoney(balance);
  document.getElementById("savings").textContent = formatMoney(savings);
  document.getElementById("expensePercent").textContent =
    Math.round(expensePercent) + "%";

  const progressFill = document.getElementById("progressFill");
  progressFill.style.width = progressWidth + "%";
  progressFill.classList.toggle("is-high", expensePercent >= 80);

  const progressBar = document.getElementById("progressBar");
  progressBar.setAttribute("aria-valuenow", String(Math.round(progressWidth)));

  const message = document.getElementById("budgetMessage");
  message.classList.remove("is-warning");

  if (totalIncome === 0) {
    message.textContent = "Введите доходы семьи, чтобы начать расчёт.";
  } else if (balance > 0) {
    message.textContent =
      "После всех указанных расходов у семьи остаётся " +
      formatMoney(balance) +
      ". Эту сумму можно направить на накопления, крупные покупки или финансовую подушку.";
  } else if (balance === 0) {
    message.textContent =
      "Доходы полностью покрывают расходы. В конце месяца ничего не остаётся для накоплений.";
  } else {
    message.classList.add("is-warning");
    message.textContent =
      "Расходы превышают доходы на " +
      formatMoney(Math.abs(balance)) +
      ". Стоит пересмотреть бюджет.";
  }

  localStorage.setItem(STORAGE_KEYS.salary1, String(salary1 || ""));
  localStorage.setItem(STORAGE_KEYS.salary2, String(salary2 || ""));
  localStorage.setItem(STORAGE_KEYS.otherIncome, String(otherIncome || ""));
}

function clearAll() {
  const confirmed = confirm("Вы действительно хотите удалить все данные?");
  if (!confirmed) return;

  expenses = [];
  document.getElementById("salary1").value = "";
  document.getElementById("salary2").value = "";
  document.getElementById("otherIncome").value = "";

  localStorage.removeItem(STORAGE_KEYS.expenses);
  localStorage.removeItem(STORAGE_KEYS.salary1);
  localStorage.removeItem(STORAGE_KEYS.salary2);
  localStorage.removeItem(STORAGE_KEYS.otherIncome);

  renderExpenses();
  calculateBudget();
}

function bindEvents() {
  document
    .getElementById("addExpenseBtn")
    .addEventListener("click", addExpense);

  document.getElementById("clearAllBtn").addEventListener("click", clearAll);

  ["salary1", "salary2", "otherIncome"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateBudget);
  });

  document
    .getElementById("expenseAmount")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") addExpense();
    });

  document
    .getElementById("expenseName")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("expenseAmount").focus();
      }
    });

  document.getElementById("expenseList").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-delete]");
    if (!btn) return;
    deleteExpense(Number(btn.dataset.delete));
  });
}

loadState();
renderExpenses();
calculateBudget();
bindEvents();
