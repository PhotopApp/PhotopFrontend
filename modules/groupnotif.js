modules.groupnotif = function(group) {
  let groupHTML = `
    <img class="notifGroupImg" src="` + assetURL + `GroupImages/` + group.Icon + `"></img>
    <span class="notifGroupName"></span>
    <div class="notifRoundCircle"></div>
  `;
  let newNotif = createElement("groupNotif", "button", "sidebarNotifHolder");
  newNotif.innerHTML = groupHTML;
  newNotif.id = group._id + "notif";
  newNotif.querySelector(".notifGroupName").textContent = group.Name;
  newNotif.addEventListener("click", function() {
    newNotif.remove();
    modifyParams("group", group._id);
    setPage("group");
  });
}