const resetBtn = document.getElementById("resetFilter");

if (resetBtn) {
  resetBtn.addEventListener("click", resetFilters);
}

function resetFilters() {
  spicinessSlider.value = -1;
  spicinessValue.textContent = "Not Chosen";

  vegetarianCheckbox.checked = false;
  nutsCheckbox.checked = false;

  selectedCategoryId = "all";

  resetCategoryButtons();

  applyFilters();

  console.log("Filters reset");
}
