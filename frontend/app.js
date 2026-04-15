const token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

if (!token) {
  window.location.href = "index.html";
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// -------------------- DASHBOARD --------------------
const usernameEl = document.getElementById("username");

if (usernameEl && user) {
  usernameEl.innerText = user.username || "User";
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
    const res = await fetch(`/profile/${user.id}`, {
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

loadProfile();

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
    const res = await fetch(`/settings/${user.id}`, {
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