const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function showUser() {
  const greetDiv = document.getElementById("greetUser");

  if (!greetDiv) return; // prevent error if id not found

  if (currentUser) {
    greetDiv.innerHTML = `Hello, <strong>${currentUser.name}</strong>`;
  } else {
    greetDiv.innerHTML = `<a href="auth/login.html">Sign in</a>`;
  }
}

showUser();
