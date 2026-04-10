const API_URL = "http://localhost:5000";

async function registerUser() {
  const username = document.getElementById("username")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const message = document.getElementById("message");

  if (!username || !email || !password) {
    message.innerText = "Please fill all fields";
    return;
  }

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (data.success) {
    alert("Registered successfully");
    window.location.href = "index.html";
  } else {
    message.innerText = data.message || "Registration failed";
  }
}

async function login() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const message = document.getElementById("message");

  if (!email || !password) {
    message.innerText = "Please enter email and password";
    return;
  }

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } else {
    message.innerText = data.message || "Login failed";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function applyTheme(theme) {
  document.body.classList.remove("light-theme");
  if (theme === "light") {
    document.body.classList.add("light-theme");
  }
}

async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return null;
  }

  const res = await fetch(`${API_URL}/profile`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!data.success) {
    logout();
    return null;
  }

  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

async function loadDashboard() {
  const usernameElement = document.getElementById("dashboardUsername");
  const avatarElement = document.getElementById("dashboardAvatar");

  if (!usernameElement || !avatarElement) return;

  const user = await getProfile();
  if (!user) return;

  usernameElement.innerText = user.username;
  avatarElement.src = user.avatar;
  applyTheme(user.theme);
}

async function loadProfile() {
  const username = document.getElementById("profileUsername");
  const email = document.getElementById("profileEmail");
  const avatar = document.getElementById("profileAvatar");
  const theme = document.getElementById("profileTheme");
  const created = document.getElementById("profileCreated");

  if (!username || !email || !avatar || !theme || !created) return;

  const user = await getProfile();
  if (!user) return;

  username.innerText = user.username;
  email.innerText = user.email;
  avatar.src = user.avatar;
  theme.innerText = user.theme;
  created.innerText = new Date(user.created_at).toLocaleDateString();
  applyTheme(user.theme);
}

async function loadSettings() {
  const username = document.getElementById("settingsUsername");
  const avatar = document.getElementById("settingsAvatar");
  const avatarPreview = document.getElementById("settingsAvatarPreview");
  const theme = document.getElementById("settingsTheme");

  if (!username || !avatar || !avatarPreview || !theme) return;

  const user = await getProfile();
  if (!user) return;

  username.value = user.username;
  avatar.value = user.avatar;
  avatarPreview.src = user.avatar;
  theme.value = user.theme;
  applyTheme(user.theme);

  avatar.addEventListener("input", () => {
    avatarPreview.src = avatar.value || "https://i.pravatar.cc/150?img=12";
  });
}

async function saveSettings() {
  const token = localStorage.getItem("token");
  const username = document.getElementById("settingsUsername").value.trim();
  const avatar = document.getElementById("settingsAvatar").value.trim();
  const theme = document.getElementById("settingsTheme").value;
  const message = document.getElementById("message");

  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      username,
      avatar,
      theme
    })
  });

  const data = await res.json();

  if (data.success) {
    message.innerText = "Settings saved successfully";
    applyTheme(theme);
  } else {
    message.innerText = data.message || "Update failed";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboardUsername")) {
    loadDashboard();
  }

  if (document.getElementById("profileUsername")) {
    loadProfile();
  }

  if (document.getElementById("settingsUsername")) {
    loadSettings();
  }
});