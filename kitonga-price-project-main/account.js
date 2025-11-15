const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  alert("Please login first!");
  location.href = "login.html";
}

document.getElementById("accUserName").textContent =
  `Hello, ${currentUser.name}`;

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}
