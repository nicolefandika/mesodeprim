const photoInput = document.querySelector("#skinPhoto");
const analyzeButton = document.querySelector("#analyzeButton");

analyzeButton.addEventListener("click", () => {
  if (!photoInput.files.length) {
    alert("Please select a photo first.");
    return;
  }

  alert("Photo uploaded. AI analysis can be connected here.");
});
