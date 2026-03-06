const menuToggle = document.getElementById("menuToggle")
const menu = document.getElementById("menu")

menuToggle.addEventListener("click", () => {

menu.classList.toggle("active")

})
document.querySelectorAll(".read-more-btn").forEach(button => {

button.addEventListener("click", () => {

const block = button.closest(".text-block")

block.classList.toggle("open")

if(block.classList.contains("open")){
button.textContent = "Show Less"
}else{
button.textContent = "Read More"
}

})

})
const video = document.getElementById("about-video")
const playButton = document.getElementById("play-button")

playButton.addEventListener("click", () => {
video.play()
playButton.style.display = "none"
})

video.addEventListener("ended", () => {
playButton.style.display = "block"
})
