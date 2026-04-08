let userId = null;

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  userId = data.id;

  alert("Logged in!");
}

async function addTransaction() {
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;

  await fetch("http://localhost:5000/transactions", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: userId,
      amount,
      type,
      category_id: 1
    })
  });

  alert("Transaction Added");
}
