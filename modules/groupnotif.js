modules.groupnotif = function(group) {
  let groupHTML = `
    <img class="notifGroupImg"></img>
    <span class="notifGroupName"></span>
    <div class="notifRoundCircle"></div>
  `;
  let newNotif = createElement("groupNotif", "button", "sidebarNotifHolder");
  newNotif.innerHTML = groupHTML;
  newNotif.id = group._id + "notif";
  newNotif.querySelector(".notifGroupName").textContent = cleanString(group.Name);
  if (group.Icon != null) {
    newNotif.querySelector(".notifGroupImg").src = assetURL + "GroupImages/" + group.Icon;
  } else {
    newNotif.querySelector(".notifGroupImg").remove();
  }
  newNotif.addEventListener("click", function() {
    newNotif.remove();
    modifyParams("group", group._id);
    if (window.refreshPostsFunction != null) {
      window.refreshPostsFunction();
    } else {
      setPage("group");
    }
  });
}