const token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

if (!token) {
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// -------------------- DASHBOARD USER --------------------
async function loadDashboardUser() {
  const usernameEl = document.getElementById("username");
  const dashboardAvatar = document.getElementById("dashboardAvatar");

  if (!usernameEl || !dashboardAvatar || !user) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/profile/${user.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      user = data.user;
      localStorage.setItem("user", JSON.stringify(user));

      usernameEl.innerText = user.username || "User";
      dashboardAvatar.src = user.avatar || "https://i.pravatar.cc/150?img=12";
    } else {
      console.log("DASHBOARD USER LOAD FAILED:", data.message);
    }
  } catch (error) {
    console.log("DASHBOARD USER ERROR:", error);
  }
}

// -------------------- DASHBOARD DATA --------------------
async function loadDashboardData() {
  const totalBalanceEl = document.getElementById("totalBalance");
  const totalExpensesEl = document.getElementById("totalExpenses");
  const categoryChart = document.getElementById("categoryChart");

  if (!user || !totalBalanceEl || !totalExpensesEl) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/dashboard/${user.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      totalBalanceEl.innerText = `$${Number(data.totalBalance).toFixed(2)}`;
      totalExpensesEl.innerText = `$${Number(data.totalExpenses).toFixed(2)}`;

      if (categoryChart) {
        new Chart(categoryChart, {
          type: "doughnut",
          data: {
            labels: data.categories.map((item) => item.category),
            datasets: [{
              data: data.categories.map((item) => Number(item.total)),
              backgroundColor: ["#7c5cff", "#ff4d6d", "#00d4ff", "#00ff88", "#ffaa00"]
            }]
          }
        });
      }
    } else {
      console.log("DASHBOARD DATA LOAD FAILED:", data.message);
    }
  } catch (error) {
    console.log("DASHBOARD DATA ERROR:", error);
  }
}

// -------------------- PROFILE --------------------
async function loadProfile() {
  const profileAvatar = document.getElementById("profileAvatar");
  const profileUsername = document.getElementById("profileUsername");
  const profileEmail = document.getElementById("profileEmail");
  const profileTheme = document.getElementById("profileTheme");
  const profileCreated = document.getElementById("profileCreated");

  if (!profileAvatar || !user) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/profile/${user.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      user = data.user;
      localStorage.setItem("user", JSON.stringify(user));

      profileAvatar.src = user.avatar || "https://i.pravatar.cc/150?img=12";
      profileUsername.innerText = user.username || "No username";
      profileEmail.innerText = user.email || "No email";
      profileTheme.innerText = user.theme || "dark";

      if (profileCreated) {
        profileCreated.innerText = user.created_at || "Not available";
      }
    } else {
      console.log("PROFILE LOAD FAILED:", data.message);
    }
  } catch (error) {
    console.log("PROFILE ERROR:", error);
  }
}

// -------------------- SETTINGS --------------------
const settingsAvatarPreview = document.getElementById("settingsAvatarPreview");
const settingsUsername = document.getElementById("settingsUsername");
const settingsAvatar = document.getElementById("settingsAvatar");
const settingsTheme = document.getElementById("settingsTheme");
const message = document.getElementById("message");

if (settingsUsername && user) {
  settingsUsername.value = user.username || "";
}

if (settingsAvatar && user) {
  settingsAvatar.value = user.avatar || "";
}

if (settingsTheme && user) {
  settingsTheme.value = user.theme || "dark";
}

if (settingsAvatarPreview && user) {
  settingsAvatarPreview.src = user.avatar || "https://i.pravatar.cc/150?img=12";
}

if (settingsAvatar) {
  settingsAvatar.addEventListener("input", () => {
    if (settingsAvatarPreview) {
      settingsAvatarPreview.src =
        settingsAvatar.value.trim() || "https://i.pravatar.cc/150?img=12";
    }
  });
}

async function saveSettings() {
  if (!user) return;

  const updatedUsername = settingsUsername
    ? settingsUsername.value.trim()
    : user.username;

  const updatedAvatar = settingsAvatar
    ? settingsAvatar.value.trim() || "https://i.pravatar.cc/150?img=12"
    : user.avatar;

  const updatedTheme = settingsTheme
    ? settingsTheme.value
    : user.theme;

  try {
    const res = await fetch(`http://127.0.0.1:5000/settings/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        username: updatedUsername,
        avatar: updatedAvatar,
        theme: updatedTheme
      })
    });

    const data = await res.json();

    if (data.success) {
      user = {
        ...user,
        username: updatedUsername,
        avatar: updatedAvatar,
        theme: updatedTheme
      };

      localStorage.setItem("user", JSON.stringify(user));

      if (message) {
        message.innerText = "Settings saved successfully ✅";
      }

      if (settingsAvatarPreview) {
        settingsAvatarPreview.src = updatedAvatar;
      }
    } else {
      if (message) {
        message.innerText = data.message || "Failed to save settings ❌";
      }
    }
  } catch (error) {
    console.log("SETTINGS ERROR:", error);
    if (message) {
      message.innerText = "Cannot connect to server ❌";
    }
  }
}

// -------------------- EXTRA CHARTS --------------------
window.addEventListener("load", () => {
  loadDashboardUser();
  loadDashboardData();
  loadProfile();

  const balanceChart = document.getElementById("balanceChart");
  const expenseChart = document.getElementById("expenseChart");
  const lineChart = document.getElementById("lineChart");
  const donutChart = document.getElementById("donutChart");

  if (balanceChart) {
    new Chart(balanceChart, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{
          data: [30, 50, 40, 60, 80],
          borderColor: "#7c5cff",
          fill: false
        }]
      },
      options: {
        plugins: { legend: { display: false } }
      }
    });
  }

  if (expenseChart) {
    new Chart(expenseChart, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{
          data: [20, 40, 30, 50, 70],
          borderColor: "#ff4d6d",
          fill: false
        }]
      },
      options: {
        plugins: { legend: { display: false } }
      }
    });
  }

  if (lineChart) {
    new Chart(lineChart, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Income",
            data: [500, 700, 600, 800, 900, 750, 950],
            borderColor: "#7c5cff"
          },
          {
            label: "Expense",
            data: [400, 500, 450, 600, 650, 700, 800],
            borderColor: "#ff4d6d"
          }
        ]
      }
    });
  }

  if (donutChart) {
    new Chart(donutChart, {
      type: "doughnut",
      data: {
        labels: ["Food", "House", "Car", "Shopping"],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: ["#7c5cff", "#00d4ff", "#ff4d6d", "#00ff88"]
        }]
      }
    });
  }
});

// -------------------- TRANSACTIONS --------------------
async function loadTransactions() {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("transactionTableBody");
  
  if (!tbody) return;
  
  try {
    const res = await fetch("http://127.0.0.1:5000/transactions", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success && data.transactions) {
      tbody.innerHTML = data.transactions.map(t => `
        <tr>
          <td>${t.date}</td>
          <td>${t.type}</td>
          <td>$${t.amount}</td>
          <td>${t.category}</td>
          <td>${t.description || '-'}</td>
        </tr>
      `).join("");
    }
  } catch (error) {
    console.log("LOAD TRANSACTIONS ERROR:", error);
  }
}

async function addTransaction(type, amount, category, description, date) {
  const token = localStorage.getItem("token");
  
  try {
    const res = await fetch("http://127.0.0.1:5000/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ type, amount, category, description, date })
    });
    
    const data = await res.json();
    
    if (data.success) {
      loadTransactions();
      loadDashboardData();
      return true;
    }
    return false;
  } catch (error) {
    console.log("ADD TRANSACTION ERROR:", error);
    return false;
  }
}

// -------------------- BUDGETS --------------------
async function loadBudgets() {
  const token = localStorage.getItem("token");
  const budgetList = document.getElementById("budgetList");
  
  if (!budgetList) return;
  
  try {
    const res = await fetch("http://127.0.0.1:5000/budgets", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success && data.budgets) {
      budgetList.innerHTML = data.budgets.map(b => `
        <div class="budget-item">
          <span>${b.category}</span>
          <span>$${b.amount}</span>
          <span>${b.month}</span>
        </div>
      `).join("");
    }
  } catch (error) {
    console.log("LOAD BUDGETS ERROR:", error);
  }
}

async function addBudget(category, amount, month) {
  const token = localStorage.getItem("token");
  
  try {
    const res = await fetch("http://127.0.0.1:5000/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ category, amount, month })
    });
    
    const data = await res.json();
    
    if (data.success) {
      loadBudgets();
      return true;
    }
    return false;
  } catch (error) {
    console.log("ADD BUDGET ERROR:", error);
    return false;
  }
}