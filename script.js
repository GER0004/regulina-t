const menuToggle = document.getElementById("menuToggle")
const menu = document.getElementById("menu")

menuToggle.addEventListener("click", () => {

menu.classList.toggle("active")

})
document.querySelectorAll(".read-more").forEach(button => {
  button.addEventListener("click", () => {

    const moreText = button.previousElementSibling;

    if (moreText.style.display === "block") {
      moreText.style.display = "none";
      button.textContent = "Read More";
    } else {
      moreText.style.display = "block";
      button.textContent = "Hide";
    }

  });
});
