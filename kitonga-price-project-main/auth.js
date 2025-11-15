function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("❌ Wrong email or password!");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  if (user.role === "admin") {
    window.location.href = "admin-dashboard.html";  // ✅ fixed
  } else {
    window.location.href = "kitonga.html";  // ✅ fixed
  }
}
