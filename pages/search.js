wireframes.search = `
<div class="searchSection">
  <input id="searchBar" placeholder="Enter username to search.">
</div>
<div class="searchSection" style="display: none;" id="searchResults"></div>
`;
pages.search = function () {
  findI("searchBar").addEventListener("keydown", async function (e) {
    if (e.key == "Enter") {
      findI("searchResults").innerHTML = "";
      let [code, response] = await sendRequest("GET", "/user/search?term=" + findI("searchBar").value.replace(/\s/g, "") + "&amount=15");
      if (code == 200) {
        let data = JSON.parse(response);
        let searchResultHolder = findI("searchResults");
        searchResultHolder.style.display = "block";
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let thisSearchResult = createElement("searchResult", "div", searchResultHolder);
            thisSearchResult.innerHTML = `<table><tr><td><img src="${decideProfilePic(data[i])}" class="searchPfp" id="pfp${data[i]._id}" tabindex="0"></td><td>${getRoleHTML(data[i])}<span class="searchUsername" tabindex="0" id="user${data[i]._id}">${data[i].User}</span></td></tr></table>`;
            findI("pfp" + data[i]._id).addEventListener("click", function () {
              showPreview(findI("pfp" + data[i]._id), data[i]._id);
            });
            findI("user" + data[i]._id).addEventListener("click", function () {
              showPreview(findI("user" + data[i]._id), data[i]._id);
            });
          }
        } else {
          createTooltip(searchResultHolder, "It looks like there are no users that match your search.")
        }
      } else {
        showPopUp("Welp, Something Broke", response, [["Okay", "var(--themeColor)"]]);
      }
    }
  })
};
