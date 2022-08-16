wireframes.groups = `
<div class="stickyContainer groupsTabs" id="tabs">
<span class="tab" type="groups" id="tab-groups" tabindex="0">Groups</span>
<span class="tab" type="invites" id="tab-invites" tabindex="0">Invites</span>
<span class="tab" type="new" id="tab-new" tabindex="0">Create</span>
</div>`;

pages.groups = function() {
  let groupsTabs = ["groups", "invites", "new"];
  let currentGroupsTab = "";

  modifyParams("post");
  modifyParams("chat");
  modifyParams("group");
  modifyParams("user");

  let alreadyOpenTab = findI("groupsHolder");
  if (alreadyOpenTab != null) {
    alreadyOpenTab.remove();
  }
  let createdListener = false;
  let pageInviteHolder;
  let pageNewHolder;
  let tabRenders = {
    groups: async function() {
      let pageHolder = createElement("groupsHolder-groups", "div", "pageHolder");
      let groupsArr = Object.keys(groups);
      groupsArr.sort(function compareFn(a, b) {
        return (groups[b].LastChecked || 0) - (groups[a].LastChecked || 0);
      });
      for (let i = 0; i < groupsArr.length; i++) {
        let group = groups[groupsArr[i]];
        let thisGroup = createElement("groupSection", "div", pageHolder);
        thisGroup.innerHTML = `${group.Icon != null ? `<img src="${assetURL}GroupImages/${group.Icon}" class="groupIcon">` : ""}<div class="groupInfo"><div class="groupName">${group.Name}</div></div>`;
        thisGroup.id = groupsArr[i];
        thisGroup.setAttribute("type", "viewgroup");
        thisGroup.setAttribute("tabindex", "0");
      }
    },
    invites: async function() {
      modifyParams("view", "invites");
      let loadingInvites = true;
      pageInviteHolder = createElement("groupsHolder-invites", "div", "pageHolder");
      function createTile(invite, group) {
        let thisInvite = createElement("groupSection", "div", pageInviteHolder);
        thisInvite.innerHTML = `${group.Icon != undefined ? `<img src="${assetURL}GroupImages/${group.Icon}" class="groupIcon">` : ""}<div class="groupInfo"><div class="groupName">${group.Name}</div><button class="inviteTileButtons">View</button><button type="declineinvite" class="inviteTileButtons" style="background: rgb(255, 92, 92)">Decline</button></div>`;
        thisInvite.id = invite.Group;
        thisInvite.setAttribute("type", "viewgroup");
        thisInvite.setAttribute("time", invite.Timestamp);
        return thisInvite;
      }
      async function loadInvites(before) {
        loadingInvites = true;
        let getURL = "groups/invites";
        if (before != null) {
          getURL += "?before=" + before;
        }
        let [code, response] = await sendRequest("GET", getURL);
        if (code == 200) {
          let data = JSON.parse(response);
          let invites = data.invites;
          let groups = getObject(data.groups, "_id");
          for (let i = 0; i < invites.length; i++) {
            let invite = invites[i];
            let group = groups[invite.Group];
            if (group != null) {
              createTile(invite, group);
            }
          }
          if (invites.length > 24) {
            loadingInvites = false;
          }
        } else {
          showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
        }
      }
      loadInvites();
      if (createdListener == false) {
        createdListener = true;
        tempListen(document, "scroll", function() {
          if (pageInviteHolder != null && (window.innerHeight + window.scrollY) >= pageInviteHolder.offsetHeight - 500 && !loadingInvites) {
            loadInvites(pageInviteHolder.lastChild.getAttribute("time"));
          }
        });
        subscribes.push(socket.subscribe({ task: "invite", userID: userID }, function(data) {
          if (pageInviteHolder != null) {
            if (data.Name != null) {
              let newTile = createTile({ Group: data._id, Timestamp: Date.now() }, data);
              if (pageInviteHolder.firstChild != null) {
                pageInviteHolder.insertBefore(newTile, pageInviteHolder.firstChild);
              }
            } else {
              let tile = findI(data._id);
              if (tile != null) {
                tile.remove();
              }
            }
          }
        }));
      }
    },
    new: function() {
      pageNewHolder = createElement("groupsHolder-new", "div", "pageHolder");
      pageNewHolder.innerHTML = `
      <div class="settingsSection">
        <div class="settingsTitle">Group Name</div>
        <input type="text" class="settingsInput" placeholder="${account.User}'s Group" id="groupName">
        <div class="settingsProfileDescriptionChar">0/30</div>
      </div>
      <div class="settingsSection">
        <input id="imageInputGroupIcon" type="file" accept="image/*" multiple="true" hidden="true">
        <div class="settingsTitle">Group Icon</div>
        <div class="groupIconCreate">
          <img class="groupIconCreateHolder">
          <div class="settingsUploadButton"></div>
        </div>
      </div>
      <div class="settingsSection">
        <div class="settingsTitle">Group Invites</div>
        <input type="radio" name="invites" value="Anyone" id="inviteAnyone" checked="true"><label for="inviteAnyone" class="radioLabel">Anyone Can Invite</label>
        <input type="radio" name="invites" value="You" id="inviteYou"><label for="inviteYou" class="radioLabel">Only You Can Invite</label>
      </div>
      <div class="groupCreateSection">
        <button id="createGroup">Create</button>
      </div>`;
      let groupName = findI("groupName");
      tempListen(groupName, "input", function() {
        findC("settingsProfileDescriptionChar").textContent = groupName.value.length + "/30";
      });
      let imageUpload = findI("imageInputGroupIcon");
      let imageHolder = findC("groupIconCreateHolder");
      tempListen(findC("groupIconCreate"), "click", function() {
        imageUpload.click();
      });
      tempListen(imageUpload, "change", function(e) {
        let file = e.target.files[0];
        if (file.type.substring(0, 6) == "image/") {
          if (supportedImageTypes.includes(file.type.replace(/image\//g, "")) == true) {
            alert(file.type)
            let premium = hasPremium()
            if (file.size < 2097153 || (file.size < 2097153 * 2 && premium)) { // 2 MB
              if (imageHolder.src != null) {
                URL.revokeObjectURL(imageHolder.src);
              }
              let blob = URL.createObjectURL(file);
              imageHolder.src = blob;
              imageHolder.style.display = "unset";
            } else {
              if (file.size > 2097153 && !premium) {
                // alert("I think we have a problem")
                showPopUp("Too big!", "Your image must be under 2MB. However, with Photop Premium you can upload up too 4MB!", [["Premium", "var(--premiumColor)", function() { setPage("premium");}], ["Okay", "var(--grayColor)"]]);
              } else {
                if (file.size > 2097153 * 2 && premium) {
                  showPopUp("Too big!", "Your image file size must be under 4MB.", [["Okay", "var(--grayColor)"]]);
                }
              }
            }
          } else {
            showPopUp("Invalid Image Type", "Photop only accepts images of the following types: <i style='color: #bbb'>" + (supportedImageTypes.join(", ")) + "</i>", [["Okay", "var(--grayColor)"]]);
          }
        } else {
          showPopUp("Must be an Image", "Only image files can be uploaded to Photop.", [["Okay", "var(--grayColor)"]]);
        }
      });
      let inviteAnyone = findI("inviteAnyone");
      findI("createGroup").addEventListener("click", async function() {
        if (groupName.value.length > 0 && groupName.value.length < 31) {
          let sendFormData = new FormData();
          sendFormData.append("data", JSON.stringify({ name: groupName.value, invite: inviteAnyone.checked ? "member" : "owner" }));
          if (imageHolder.src != null) {
            await fetch(imageHolder.src).then(async function(file) {
              sendFormData.append("image", await file.blob());
              //URL.revokeObjectURL(imageHolder.src);
            });
          }
          let modalCode = showPopUp("Creating Group...", "Creating your new hangout spot!");
          let [code, response] = await sendRequest("POST", "groups/new", sendFormData, true);
          if (code == 200) {
            if (groups[response] == null) {
              groups[response] = {
                Invite: inviteAnyone.checked ? "Anyone" : "Self",
                Name: groupName.value,
                Owner: userID,
                Timestamp: Date.now()
              };
            }
            modifyParams("group", response);
            setPage("group");
            findI("backBlur" + modalCode).remove();
          } else {
            showPopUp("An Error Occured", response, [["Okay", "var(--grayColor)"]]);
            findI("backBlur" + modalCode).remove();
          }
        } else {
          showPopUp("Invalid Group Name", "Group names must be between 1 and 30 characters.", [["Okay", "var(--grayColor)"]]);
          findI("backBlur" + modalCode).remove();
        }
      })
    }
  }

  function changeGroupsTab(type) {
    modifyParams("view");
    if (currentGroupsTab == type) {
      return;
    }
    let tabs = [...groupsTabs];
    currentGroupsTab = type;
    tabs.splice(tabs.indexOf(type), 1);
    for (let i in tabs) {
      findI("tab-" + tabs[i]).classList.remove("selected");
      if (findC("groupsHolder-" + tabs[i]) != null) {
        findC("groupsHolder-" + tabs[i]).remove();
      }
    }
    findI("tab-" + type).classList.add("selected");
    window.scrollTo({ top: 0 });
    tabRenders[type]();
  }

  for (let i = 0; i < groupsTabs.length; i++) {
    tempListen(findI("tab-" + groupsTabs[i]), "click", function() {
      changeGroupsTab(groupsTabs[i])
    });
  }
  if (getParam("view") != "invites") {
    changeGroupsTab("groups");
  } else {
    changeGroupsTab("invites");
  }
};