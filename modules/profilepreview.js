let recentUsers = {};
let userUpdateSub;
function updateProfileSub() {
  let query = { task: "profile", _id: Object.keys(recentUsers) };
  if (userID != null) {
    query._id.push(userID);
    query.token = JSON.parse(localStorage.getItem("token")).token.substring(0, 15);
  }
  if (userUpdateSub != null) {
    userUpdateSub.edit(query);
  } else {
    userUpdateSub = socket.subscribe(query, async function(data) {
      let user = recentUsers[data._id];
      if (data.type == null) {
        if (data._id == userID) {
          user = account;
        }
        if (user == null) {
          return;
        }
        function recUpdate(obj, passData) {
          let keys = Object.keys(obj);
          for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (typeof obj[key] != "object" || Array.isArray(obj[key]) == true || obj[key] == null) {
              passData[key] = obj[key];
            } else {
              recUpdate(obj[key], passData[key] || {});
            }
          }
        }
        recUpdate(data.data, user);
        if (data.data.Status != null) {
          let status = statuses[data.data.Status || 0];
          let previewStatus = body.querySelector(".previewStatus[userid='" + data._id + "']");
          if (previewStatus != null) {
            previewStatus.style.background = status[1];
            previewStatus.setAttribute("title", status[0]);
          }
          let profileStatus = body.querySelector(".profileStatus[userid='" + data._id + "']");
          if (profileStatus != null) {
            profileStatus.style.background = status[1];
            profileStatus.setAttribute("title", status[0]);
          }
        } else if (data._id == userID) {
          if (data.data.Settings != null && data.data.Settings.ProfilePic != null) {
            findC("accountInfoPic").src = assetURL + "ProfileImages/" + data.data.Settings.ProfilePic;
          } else if (data.data.User != null) {
            findC("accountInfoName").textContent = data.data.User;
          } else if (data.data.ProfileData != null && data.data.ProfileData.Socials != null) {
            let socialSettingsHolder = findI("activeConnections");
            if (socialSettingsHolder != null) {
              let socialKeys = Object.keys(data.data.ProfileData.Socials);
              for (let i = 0; i < socialKeys.length; i++) {
                let social = socialKeys[i];
                let value = data.data.ProfileData.Socials[socialKeys[i]];
                let thisSocial = findI(social);
                if (value == null) {
                  if (thisSocial != null) {
                    thisSocial.remove();
                  }
                  findI("connectionCount").textContent--;
                  continue;
                }
                if (thisSocial != null) {
                  continue;
                }
                let keyInfo = social.split("_");
                let socialType = keyInfo[0];
                let socialID = social.replace(socialType + "_", "");
                let socialInfo = socialLinkData[keyInfo[0]];
                findI("connectionCount").textContent++;
                thisSocial = createElement("socialConnection", "div", socialSettingsHolder);
                thisSocial.innerHTML = `<a class="profileSocialButton" style="background: ${socialLinkData[socialType][1]}; content: url(./icons/socials/${socialType}.svg)"></a> <b>${value}</b> <span class="removeSocial" id="removeSocial${i}" tabindex="0">&times;</span>`;
                thisSocial.id = social;
                let socialButton = thisSocial.querySelector(".profileSocialButton");
                socialButton.setAttribute("title", keyInfo[0] + " (" + value + ")");
                if (socialInfo[2] != "PROMPT_USERNAME") {
                  socialButton.setAttribute("href", socialInfo[2].replace(/USERID_GOES_HERE/g, keyInfo.splice(1).join("_")).replace(/USERNAME_GOES_HERE/g, value));
                  socialButton.setAttribute("target", "_blank");
                } else {
                  socialButton.setAttribute("onmouseup", 'showPopUp("' + socialInfo[0] + '", "<i>' + cleanString(value) + '</i>", [ ["Done", "var(--grayColor)"] ])');
                }
                thisSocial.querySelector(".removeSocial").addEventListener("click", async function() {
                  thisSocial.style.opacity = 0.5;
                  let [code, response] = await sendRequest("DELETE", "me/remove/social?socialid=" + social);
                  if (code != 200) {
                    thisSocial.style.opacity = 1;
                  }
                });
              }
            }
          } else if (data.data.Settings != null && data.data.Settings.Display != null) {
            localStorage.setItem("display", JSON.stringify(account.Settings.Display));
            updateDisplay(account.Settings.Display.Theme.replace(" Mode", ""));
          }
        }
      } else {
        user = user || {};
        switch (data.type) {
          case "follow":
            user.ProfileData = user.ProfileData || {};
            user.ProfileData.Followers = user.ProfileData.Followers || 0;
            user.ProfileData.Followers += data.change;
            if (data.userID == userID) {
              user.isFollowing = user.isFollowing || false;
              account.ProfileData = account.ProfileData || {};
              account.ProfileData.Following = account.ProfileData.Following || 0;
              account.ProfileData.Following += data.change;
              if (user.isFollowing == Math.max(data.change, 0)) {
                return;
              }
              user.isFollowing = !user.isFollowing;
              let followPreviewButton = body.querySelector(".previewFollowButton[userid='" + data._id + "']");
              if (followPreviewButton != null) {
                if (user.isFollowing == true) {
                  followPreviewButton.textContent = "Unfollow";
                  followPreviewButton.style.background = "#FF5C5C";
                } else {
                  followPreviewButton.textContent = "Follow";
                  followPreviewButton.style.background = "var(--themeColor)";
                }
              }
              let followProfileButton = body.querySelector(".profileFollow[userid='" + data._id + "']");
              if (followProfileButton != null) {
                if (user.isFollowing == true) {
                  followProfileButton.textContent = "Unfollow";
                  followProfileButton.style.background = "#FF5C5C";
                } else {
                  followProfileButton.textContent = "Follow";
                  followProfileButton.style.background = "var(--themeColor)";
                }
              }
            }
            let followerCounts = body.querySelectorAll("[count='followerCount'][userid='" + data._id + "']");
            for (let i = 0; i < followerCounts.length; i++) {
              followerCounts[i].textContent = (parseInt(followerCounts[i].textContent) || 0) + data.change;
            }
            let followingCounts = body.querySelectorAll("[count='followingCount'][userid='" + data.userID + "']");
            for (let i = 0; i < followingCounts.length; i++) {
              followingCounts[i].textContent = (parseInt(followingCounts[i].textContent) || 0) + data.change;
            }
        }
      }
    });
  }
}

modules.profilepreview = async function(element, getID) {
  if (findC("profilePreview") != null) {
    closeProfilePreview();
  }
  let data = recentUsers[getID];
  if (getID == userID) {
    data = account;
  }
  let rect = element.getBoundingClientRect();
  let preview = createElement("profilePreview", "div", "body", { top: rect.top + "px" });
  preview.style.left = rect.right + 4 + "px";
  preview.style.transformOrigin = "top left";
  let previewRect = preview.getBoundingClientRect();
  if (previewRect.left + previewRect.width > window.innerWidth) {
    preview.style.right = "8px";
    preview.style.left = "";
    preview.style.transformOrigin = "center";
  }
  if (previewRect.top + previewRect.height > window.innerHeight) {
    preview.style.bottom = "8px";
    preview.style.top = "";
    preview.style.transformOrigin = "center";
  }
  preview.style.transform = "scale(1)";
  preview.style.opacity = 1;
  if (data == null) {
    let [code, response] = await sendRequest("GET", "user?id=" + getID);
    if (code != 200) {
      showPopUp("Error Loading Profile", response, [["Okay", "var(--grayColor)"]]);
      return;
    }
    recentUsers[getID] = JSON.parse(response);
    data = recentUsers[getID];
    updateProfileSub();
  }
  let profileBanner;
  if (data.Settings != null && data.Settings.ProfileBanner != null) {
    profileBanner = `<img class="previewBanner" src="${assetURL + "ProfileBanners/" + data.Settings.ProfileBanner}">`;
  } else {
    profileBanner = `<div class="previewBanner" style="background: var(--contentColor)"></div>`;
  }
  data.ProfileData = data.ProfileData || {};
  let status = statuses[Math.max(data.Status || 0, 0)];
  let bio = data.ProfileData.Description || "";
  if (bio.length > 200) {
    bio = bio.substring(0, 200) + "...";
  }
  let previewHTML = `
    ${profileBanner}
    <div class="previewContent">
      <div class="previewPfpHolder">
        <img src="${decideProfilePic(data)}" class="previewPfp">
        <div class="previewStatus" userid="${data._id}" style="background: ${status[1]}" title="${status[0]}"></div>
      </div>
      <button class="previewFollowButton" userid="${data._id}">Follow</button>
    </div>
    <div class="previewUsername">${getRoleHTML(data, 5)}<span style="font-size: 30px;">${data.User}</span></div>
    <div class="previewFollow">
      <div tabindex="0" class="previewCount" onclick="modifyParams('user', '` + getID + `'); setPage('followers'); closeProfilePreview();">
        <span class="previewCountNumber" count="followerCount" userid="${data._id}"'>${abbr(data.ProfileData.Followers) || 0}</span> ${data.ProfileData.Followers == 1 ? "Follower" : "Followers"}
      </div>
      <div tabindex="0" class="previewCount" onclick="modifyParams('user', '` + getID + `'); setPage('following'); closeProfilePreview();">
        <span class="previewCountNumber" count="followingCount" userid="${data._id}">${abbr(data.ProfileData.Following) || 0}</span> Following
      </div>
    </div>
      <div class="previewBio"></div>
      <button class="previewActionButton" style="color: var(--themeColor);" onclick="modifyParams('user', '` + getID + `'); setPage('profile'); closeProfilePreview();">View Profile</button>
    </div>`;
  preview.innerHTML = previewHTML;
  let followButton = preview.querySelector(".previewFollowButton");
  if (bio.length >= 1) {
    preview.querySelector(".previewBio").innerHTML = formatText(bio);
  } else {
    preview.querySelector(".previewBio").remove();
    preview.style.paddingBottom = "0px";
  }
  let followCount = preview.querySelector("[count='followerCount']");
  if (getID == userID) {
    followButton.remove();
    return;
  }
  if (data.isFollowing == true) {
    followButton.textContent = "Unfollow";
    followButton.style.background = "#FF5C5C";
  }
  followButton.addEventListener("click", async function() {
    if (userID == null) {
      promptLogin('Join the hangout today! You must <b>sign in</b> or <b>sign up</b> before being able to <b style="color: var(--themeColor)">Follow</b> a user!')
      return;
    }
    function updateFollow(type) {
      if (type == "follow") {
        data.isFollowing = true;
        followButton.textContent = "Unfollow";
        followButton.style.background = "#FF5C5C";
        followCount.textContent++;
      } else {
        data.isFollowing = false;
        followButton.textContent = "Follow";
        followButton.style.background = "var(--themeColor)";
        followCount.textContent--;
      }
    }
    if (followButton.textContent == "Follow") {
      updateFollow("follow");
      let [code] = await sendRequest("PUT", "user/follow?userid=" + getID);
      if (code != 200) {
        updateFollow("unfollow");
      }
    } else {
      updateFollow("unfollow");
      let [code] = await sendRequest("DELETE", "user/unfollow?userid=" + getID);
      if (code != 200) {
        updateFollow("follow");
      }
    }
  });

  if (currentPage == "group") {
    let group = groups[getParam("group")];
    if (group != null && group.Owner == userID && element.className != "inviteUsernameTile") {
      let kickMember = createElement("previewActionButton", "button", preview, { color: "#FF5C5C" });
      kickMember.textContent = "Kick Member";
      kickMember.addEventListener("click", function() {
        showPopUp("Kick " + data.User + "?", "Are you sure you want to kick <b>" + data.User + "</b> from your group?", [["Kick", "#FF5C5C", async function() {
          let [code, response] = await sendRequest("PUT", "groups/moderate?groupid=" + getParam("group"), { type: "kick", data: getID });
          if (code != 200) {
            showPopUp("Failed to Kick", response, [["Okay", "var(--grayColor)"]]);
          }
        }], ["Cancel", "var(--grayColor)"]]);
        closeProfilePreview();
      });
    }
  }
}

async function closeProfilePreview() {
  let preview = findC("profilePreview");
  if (preview == null) {
    return;
  }
  if (preview.hasAttribute("closing") == true) {
    return;
  }
  preview.style.transform = "scale(0.9)";
  preview.style.opacity = 0;
  await sleep(200);
  preview.remove();
}

window.addEventListener("scroll", closeProfilePreview);
window.addEventListener("resize", closeProfilePreview);
window.addEventListener("mousedown", function(e) {
  if (e.target.closest(".profilePreview") == null) {
    closeProfilePreview();
  }
});