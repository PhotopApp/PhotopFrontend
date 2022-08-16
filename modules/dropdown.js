modules.dropdown = async function(element, anchor, buttons) {
  closeDropdown();
  lastOpenElement = element;
  let rect = element.getBoundingClientRect();
  let dropdown = createElement("dropdown", "div", "body", { top: rect.top + "px" });
  dropdown.id = "dropdown";
  if (anchor == "left") {
    dropdown.style.right = window.innerWidth - rect.left - 12 + "px";
    dropdown.style.transformOrigin = "top right";
  } else {
    dropdown.style.left = rect.right + 4 + "px";
    dropdown.style.transformOrigin = "top left";
  }
  for (let i in buttons) {
    let thisButton = createElement("dropdownButton", "button", dropdown);
    thisButton.textContent = buttons[i][0];
    thisButton.style.background = buttons[i][1];
    if (i == 0) {
      thisButton.focus();
    }
    thisButton.addEventListener("click", function() {
      closeDropdown()
      if (typeof buttons[i][2] == "function") {
        buttons[i][2]();
      }
    });
  }
  dropdown.style.transform = "scale(1)";
  dropdown.style.opacity = 1;
  setTimeout(function () {
    let dropdownRect = dropdown.getBoundingClientRect();
    if (dropdownRect.left + dropdownRect.width > window.innerWidth) {
      dropdown.style.right = "8px";
      dropdown.style.left = null;
      dropdown.style.transformOrigin = "center";
    }
    if (dropdownRect.top + dropdownRect.height > window.innerHeight) {
      dropdown.style.bottom = "8px";
      dropdown.style.top = null;
      dropdown.style.transformOrigin = "center";
    }
    if (dropdownRect.right - dropdownRect.width < 0) {
      dropdown.style.left = "8px";
      dropdown.style.right = null;
      dropdown.style.transformOrigin = "center";
    }
  }, 2);
}

async function closeDropdown() {
  let dropdown = findI("dropdown");
  if (dropdown == null) {
    return;
  }
  if (dropdown.hasAttribute("closing") == true) {
    return;
  }
  dropdown.style.transform = "scale(0.9)";
  dropdown.style.opacity = 0;
  await sleep(200);
  dropdown.remove();
}

window.addEventListener("mousedown", function(e) {
  if (e.target.closest(".dropdown") == null) {
    closeDropdown();
  }
});
window.addEventListener("scroll", closeDropdown);
window.addEventListener("resize", closeDropdown);