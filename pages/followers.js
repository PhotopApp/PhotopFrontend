wireframes.followers = `
<div class="stickyContainer" id="simpleTopBar">
<button class="backButton" onclick="goBack()">
  <svg height="80%" viewBox="0 0 149 135" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M139.58 57.9155C144.551 57.9155 148.58 61.945 148.58 66.9155V66.9155C148.58 71.8861 144.551 75.9155 139.58 75.9155L14.4797 75.9155V57.9155L139.58 57.9155Z" fill="var(--themeColor)"/> <path d="M59.8825 6.94142C63.5745 3.61341 69.0479 4.09106 72.1076 8.00827V8.00827C75.1674 11.9255 74.6548 17.7989 70.9628 21.1269L16.5707 70.1564L5.49049 55.9709L59.8825 6.94142Z" fill="var(--themeColor)"/> <path d="M59.8825 127.989C63.5745 131.317 69.0479 130.839 72.1076 126.922V126.922C75.1674 123.005 74.6548 117.132 70.9628 113.804L16.5707 64.774L5.49049 78.9595L59.8825 127.989Z" fill="var(--themeColor)"/> <ellipse cx="14.1039" cy="67.4041" rx="14.7752" ry="13.7539" transform="rotate(90 14.1039 67.4041)" fill="var(--themeColor)"/> </svg>
  <span id="backButtonArrow">Go Back</span>
</button>
<span id="detailInfo" style="color: var(--fontColor)">Users Following</span>
</div>
<div class="followHolder"></div>
`;


pages.followers = function () {
  let getID = getParam("user");

  let followHolder = findC("followHolder");
  followHolder.innerHTML = "";

  let loading = true;
  let reachedMax = false;

  async function getFollow(url, start) {
    loading = true;
    let [code, response] = await sendRequest("GET", url);
    if (code == 200) {
      let data = JSON.parse(response);
      for (let i = 0; i < data.length; i++) {
        let user = data[i];
        let followHTML = `
        <img class="followTilePic" type="user" src='` + decideProfilePic(user) + `'></img>
        <span class="followTileUser" type="user">${getRoleHTML(user)}${user.User}</span>
        <button class="previewFollowButton" id="followTileButton" type="follow" userid="${user._id}">Follow</button>
        `;
        let followTile = createElement("followTile", "div", followHolder);
        followTile.setAttribute("userid", user._id);
        followTile.setAttribute("time", user.Timestamp);
        followTile.innerHTML = followHTML;
        if (userID == null || user._id == userID) {
          followTile.querySelector(".previewFollowButton").remove();
        }
        if (user.isFollowing == true) {
          followTile.querySelector(".previewFollowButton").textContent = "Unfollow";
          followTile.querySelector(".previewFollowButton").style.background = "#FF5C5C";
        }
      }
      if (data.length < 25) {
        reachedMax = true;
        if (followHolder.childElementCount > 0) {
          createTooltip(followHolder, "That's all of the followers...");
        } else if (start == true) {
          createTooltip(followHolder, "Well... No one is following...");
        }
      }
      loading = false;
    } else {
      showPopUp("An Error Occurred", response, [["Back", "var(--grayColor)", goBack]]);
    }
  }
  getFollow("user/followers?userid=" + getID, true);

  tempListen(document, "scroll", function() {
    if (!reachedMax && !loading) {
      if (window.innerHeight + window.scrollY >= followHolder.offsetHeight - 500) {
        getFollow("user/followers?userid=" + getID + "&before=" + followHolder.lastChild.getAttribute("time"));
      }
    }
  });
}