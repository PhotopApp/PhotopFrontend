wireframes.profile = `
<div class="profileBanner" style="background: var(--contentColor)"></div>
<div class="profilePictureHolder">
  <div class="profilePicture"></div>
  <div class="profileStatus"></div>
  <span class="profileUsername"></span>
  <button class="profileFollow">Follow</button>
  <button class="profileMenu"></button>
</div>
<div class="profileDataHolder">
  <div class="profileFollowCounts">
    <div id="profileFollowerCount" class="profileCount" tabindex="0"></div>
    <div id="profileFollowingCount" class="profileCount" tabindex="0"></div>
    <div class="profileSocialLinkHolder"></div>
  </div>
  <div class="profileInfo">
    <div class="profileBio"></div>
    <div class="profileDates">
      <span class="profileDate"></span>
      </span>
      <span class="profileDate" id="premiumDate"></span>
  </div>
  </div>
</div>
<div class="stickyContainer profileTabs" id="tabs">
  <span class="tab" type="posts" id="tab-posts" tabindex="0">Posts</span>
  <span class="tab" type="chats" id="tab-chats" tabindex="0">Chats</span>
  <span class="tab" type="likes" id="tab-likes" tabindex="0">Likes</span>
</div>`;

pages.profile = async function() {
  let tab = "";
  let currentProfile;
  let currentTabFunction;

  modifyParams("post");
  modifyParams("chat");
  modifyParams("group");

  let loadingPosts = false;
  let profileID = getParam("user");
  if (profileID == null) {
    profileID = userID;
  }
  modifyParams("user", profileID);
  currentProfile = { user: { _id: profileID } };
  let user = recentUsers[profileID];
  if (profileID == userID) {
    user = account;
  }
  let data;
  async function fetchProfileContent() {
    let [code, response] = await sendRequest("GET", "user/profile?id=" + profileID);
    if (code != 200) {
      if (code != 409 || checkPermision(account.Role, "CanUnbanUser") != true) {
        showPopUp("Error Loading Profile", response, [["Back", "var(--grayColor)", goBack]]);
        return;
      }
    }
    data = JSON.parse(response);
    currentProfile = data;
    user = data.user;
    recentUsers[profileID] = user;
    if (user.ActivePunishment != null) {
      let modBanPrompt = [["Okay", "var(--grayColor)"]];
      if (checkPermision(account.Role, "CanUnbanUser")) {
        modBanPrompt.unshift(["Unban", "#FF5C5C", async function() {
          showPopUp("Unban User", "Are you sure you want to unban this user?", [["Unban", "#FF5C5C", async function() {
            await sendRequest("PATCH", "mod/unban?userid=" + profileID);
          }], ["Okay", "var(--grayColor)"]]);
        }]);
      }
      showPopUp("User is Banned", "This user is currently banned until " + (user.ActivePunishment.BanLength == "Permanent" ? "<i>Never</i>" : formatFullDate(Date.now() + (user.ActivePunishment.BanLength*1000))) + " with a reason of: <i>" + user.ActivePunishment.BanReason + "</i>", modBanPrompt);
    }
  }
  if (user == null) {
    await fetchProfileContent();
  }
  if (user == null) {
    return;
  }
  if (profileID != userID) {
    updateProfileSub();
  }
  if (user.Settings != null && user.Settings.ProfileBanner != null) {
    let existingBanner = findC("profileBanner");
    let imageProfileBanner = createElement("profileBanner", "img", pageHolder);
    imageProfileBanner.src = assetURL + "ProfileBanners/" + user.Settings.ProfileBanner;
    imageProfileBanner.setAttribute("type", "imageenlarge");
    pageHolder.insertBefore(imageProfileBanner, existingBanner);
    existingBanner.remove();
  }
  user.ProfileData = user.ProfileData || {};
  let status = statuses[user.Status || 0];
  let existingPicture = findC("profilePicture");
  let imageProfile = createElement("profilePicture", "img", existingPicture.parentElement);
  imageProfile.src = decideProfilePic(user);
  imageProfile.setAttribute("type", "imageenlarge");
  existingPicture.parentElement.insertBefore(imageProfile, existingPicture);
  existingPicture.remove();
  findC("profileStatus").setAttribute("userid", user._id);
  findC("profileStatus").style = "background: " + status[1];
  findC("profileStatus").title = status[0];
  findC("profileUsername").innerHTML = `${getRoleHTML(user, 5)}<span style="font-size: 30px;">${user.User}</span></span>`
  findC("profileFollow").setAttribute("userid", user._id);
  findC("profileDate").innerHTML = `${getSVG("calendar")} <span class="profileDateSpan">Joined <b>${formatDate(user.CreationTime)}</b>`
  findC("profileDateSpan").title = formatFullDate(user.CreationTime);
  findI("profileFollowerCount").innerHTML = `<span class="profileCountNumber" count="followerCount" userid="${user._id}">${user.ProfileData.Followers || 0}</span> <span class="profileFollowLabel">${(user.ProfileData.Followers == 1 ? "Follower" : "Followers")}</span>`
  findI("profileFollowingCount").innerHTML = `<span class="profileCountNumber" count="followingCount" userid="${user._id}">${user.ProfileData.Following || 0}</span> <span class="profileFollowLabel">Following</span>`
  tempListen(findI("profileFollowerCount"), "click", function() {
    modifyParams('user', user._id);
    setPage('followers');
  });
  tempListen(findI("profileFollowingCount"), "click", function() {
    modifyParams('user', user._id);
    setPage('following');
  });
  if (user.ProfileData.Description != null && user.ProfileData.Description.length > 1) {
    pageHolder.querySelector(".profileBio").innerHTML = formatText(user.ProfileData.Description).replace(/\n/g, "<br>");
  }
  if (user.Premium == null) {
    findI("premiumDate").remove();
  } else {
    findI("premiumDate").innerHTML = `${getSVG("premium")} <span class="profileDateSpan">Subscribed <b>${formatDate(Date.parse(user.Premium.Bought))}</b></span>`;
    findI("premiumDate").setAttribute("title", formatFullDate(Date.parse(user.Premium.Bought)));
    if (user.CustomURL != null) {
      modifyParams("user", user.CustomURL);
    }
  }
  let socialKeys = Object.keys(user.ProfileData.Socials || {});
  for (let i = 0; i < socialKeys.length; i++) {
    let social = socialKeys[i];
    let value = user.ProfileData.Socials[socialKeys[i]];
    let keyInfo = social.split("_");
    let socialInfo = socialLinkData[keyInfo[0]];
    let socialButton = createElement("profileSocialButton", "a", pageHolder.querySelector(".profileSocialLinkHolder"), { "background": socialInfo[1], "content": "url(./icons/socials/" + keyInfo[0] + ".svg)" });
    socialButton.setAttribute("title", socialInfo[0] + " (" + value + ")");
    if (socialInfo[2] != "PROMPT_USERNAME") {
      socialButton.setAttribute("href", socialInfo[2].replace(/USERID_GOES_HERE/g, keyInfo.splice(1).join("_")).replace(/USERNAME_GOES_HERE/g, value));
      socialButton.setAttribute("target", "_blank");
    } else {
      socialButton.setAttribute("onmouseup", 'showPopUp("' + socialInfo[0] + '", "<i>' + cleanString(value) + '</i>", [ ["Done", "var(--grayColor)"] ])');
    }
  }

  function getSVG(type) {
    switch (type) {
      case "calendar":
        return `<svg style="position: relative; width: 20px; height: 20px; " id="DetailIcon" viewBox="0 0 512 512" fill="var(--themeColor)"><g> <g> <path d="M452,40h-24V0h-40v40H124V0H84v40H60C26.916,40,0,66.916,0,100v352c0,33.084,26.916,60,60,60h392 c33.084,0,60-26.916,60-60V100C512,66.916,485.084,40,452,40z M472,452c0,11.028-8.972,20-20,20H60c-11.028,0-20-8.972-20-20V188 h432V452z M472,148H40v-48c0-11.028,8.972-20,20-20h24v40h40V80h264v40h40V80h24c11.028,0,20,8.972,20,20V148z"></path> </g> </g> <g> <g> <rect x="76" y="230" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="156" y="230" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="236" y="230" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="316" y="230" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="396" y="230" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="76" y="310" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="156" y="310" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="236" y="310" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="316" y="310" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="76" y="390" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="156" y="390" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="236" y="390" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="316" y="390" width="40" height="40"></rect> </g> </g> <g> <g> <rect x="396" y="310" width="40" height="40"></rect> </g> </g></svg>`;
      case "premium":
        return `<svg style="position: relative; width: 20px; height: 20px; " id="DetailIcon" viewBox="0 0 512 512" fill="var(--themeColor)"><path fill-rule="evenodd" clip-rule="evenodd" d="M289.222 25.1645C278.758 -8.3882 233.196 -8.38812 222.732 25.1645L186.269 142.086C181.589 157.091 168.168 167.25 153.024 167.25H35.0229C1.16028 167.25 -12.919 212.395 14.4763 233.131L109.941 305.394C122.193 314.668 127.319 331.105 122.64 346.11L86.1754 463.032C75.7112 496.584 112.572 524.485 139.967 503.748L151.86 494.746C156.12 491.522 158.641 486.368 158.641 480.882V213.761C158.641 204.295 166.006 196.623 175.09 196.623H263.273C285.258 196.623 303.986 200.581 319.457 208.499C334.928 216.417 346.464 227.304 354.063 241.161C361.935 255.017 365.87 270.711 365.87 288.243C365.87 304.079 362.206 318.925 354.878 332.781C347.821 346.637 336.557 357.807 321.086 366.29C305.886 374.773 286.615 379.015 263.273 379.015H232.088C223.004 379.015 215.638 386.689 215.638 396.153V420.98C215.638 431.592 227.192 437.724 235.432 431.487C247.683 422.214 264.274 422.214 276.525 431.487L371.99 503.748C399.385 524.485 436.245 496.584 425.78 463.032L389.317 346.11C384.637 331.105 389.764 314.668 402.015 305.394L497.481 233.131C524.876 212.395 510.797 167.25 476.933 167.25H358.933C343.788 167.25 330.367 157.091 325.688 142.086L289.222 25.1645ZM295.843 320.056C288.244 327.408 276.573 331.084 260.83 331.084H232.088C223.004 331.084 215.638 323.41 215.638 313.946V262.116C215.638 252.652 223.004 244.978 232.088 244.978H260.83C291.772 244.978 307.243 259.4 307.243 288.243C307.243 301.816 303.443 312.421 295.843 320.056Z" fill="#FF42A7"></path></svg>`;
      case "menu":
        return `<svg viewBox="0 0 41.915 41.915"><g fill="var(--fontColor)"><path style="" id="Svg" d="M11.214,20.956c0,3.091-2.509,5.589-5.607,5.589C2.51,26.544,0,24.046,0,20.956c0-3.082,2.511-5.585,5.607-5.585 C8.705,15.371,11.214,17.874,11.214,20.956z"></path><path style="" id="Svg" d="M26.564,20.956c0,3.091-2.509,5.589-5.606,5.589c-3.097,0-5.607-2.498-5.607-5.589c0-3.082,2.511-5.585,5.607-5.585 C24.056,15.371,26.564,17.874,26.564,20.956z"></path><path style="" id="Svg" d="M41.915,20.956c0,3.091-2.509,5.589-5.607,5.589c-3.097,0-5.606-2.498-5.606-5.589c0-3.082,2.511-5.585,5.606-5.585 C39.406,15.371,41.915,17.874,41.915,20.956z"></path></g></svg>`;
    }
  }
  let followButton = pageHolder.querySelector(".profileFollow");
  let followCount = pageHolder.querySelector("[count='followerCount']");
  let extraButton = pageHolder.querySelector(".profileMenu");
  if (profileID == userID) {
    followButton.remove();
    extraButton.innerHTML = "Edit";
    tempListen(extraButton, "click", function() {
      setPage("settings");
    });
  } else {
    extraButton.innerHTML = getSVG("menu");
    extraButton.style.width = "40px";
    let dropdownOptions = [["Copy ID", "var(--themeColor)", function() {
      copyClipboardText(profileID);
    }]];
    if (userID != null) {
      dropdownOptions.unshift(["Block User", "#FF8652", function() {
        blockUser(profileID, user.User);
      }]);
      dropdownOptions.unshift(["Report", "#FFCB70", function() {
        reportContent(profileID, user.User, "user");
      }]);
      if (checkPermision(account.Role, "CanDeletePosts") == true) {
        dropdownOptions.unshift(["Ban User", "#FF5C5C", async function() {
          (await getModule("ban"))(profileID, user.User);
        }]);
      }
    }
    extraButton.addEventListener("click", function() {
      showDropdown(extraButton, "left", dropdownOptions);
    });
    if (user.isFollowing) {
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
          user.isFollowing = true;
          followButton.textContent = "Unfollow";
          followButton.style.background = "#FF5C5C";
          followCount.textContent++;
        } else {
          user.isFollowing = false;
          followButton.textContent = "Follow";
          followButton.style.background = "var(--themeColor)";
          followCount.textContent--;
        }
      }
      if (followButton.textContent == "Follow") {
        updateFollow("follow");
        let [code] = await sendRequest("PUT", "user/follow?userid=" + profileID);
        if (code != 200) {
          updateFollow("unfollow");
        }
      } else {
        updateFollow("unfollow");
        let [code] = await sendRequest("DELETE", "user/unfollow?userid=" + profileID);
        if (code != 200) {
          updateFollow("follow");
        }
      }
    });
  }

  if (data == null) {
    await fetchProfileContent();
  }
  if (currentProfile == null) {
    return;
  }
  let loadFunction = {
    posts: async function() {
      let postHolder = createElement("profileHolder-posts", "div", "pageHolder");
      postHolder.setAttribute("loading", "");
      async function createPosts(posts, usersLoad, likesLoad) {
        let renderPost = await getModule("post");

        let users = getObject(usersLoad, "_id");
        let likes = getObject(likesLoad, "_id");
        for (let i = 0; i < posts.length; i++) {
          let post = posts[i];
          renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null), isPinned: (user.ProfileData != null && post._id == user.ProfileData.PinnedPost) });
        }
        if (posts.length < 15) {
          postHolder.setAttribute("allDownPostsLoaded", "");
          createTooltip(postHolder, "That's it, for now...");
        }
        postHolder.removeAttribute("loading");
        setPostUpdateSub();
        setupPostChats();
        updateChatting(posts);
      }
      currentTabFunction = async function() {
        if (postHolder.hasAttribute("loading") || postHolder.hasAttribute("allDownPostsLoaded")) {
          return;
        }
        postHolder.setAttribute("loading", "");
        let [code, response] = await sendRequest("GET", "posts?userid=" + currentProfile.user._id + "&before=" + postHolder.lastChild.getAttribute("time"));
        if (code == 200) {
          let data = JSON.parse(response);
          createPosts(data.posts, data.users, data.likes || []);
        }
        postHolder.removeAttribute("loading");
      }
      if (currentProfile.posts.length > 0) {
        createPosts(currentProfile.posts, currentProfile.users, currentProfile.likes);
      } else {
        createTooltip(postHolder, "This user hasn't posted, yet...");
      }
    },
    likes: async function() {
      let postHolder = createElement("profileHolder-likes", "div", "pageHolder");
      postHolder.setAttribute("loading", "");
      let lastLikeTime = 0;
      async function createPosts(userLikes, postsLoad, usersLoad, likesLoad) {
        let renderPost = await getModule("post");
        let posts = getObject(postsLoad, "_id");
        let users = getObject(usersLoad, "_id");
        let likes = getObject(likesLoad, "_id");
        for (let i = 0; i < userLikes.length; i++) {
          let like = userLikes[i];
          let post = posts[like._id.substring(0, 24)];
          if (post != null) {
            renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null) });
          }
          lastLikeTime = like.Timestamp || lastLikeTime;
        }
        if (userLikes.length < 15) {
          postHolder.setAttribute("allDownPostsLoaded", "");
          createTooltip(postHolder, "That's it, for now...");
        }
        postHolder.removeAttribute("loading");
        setPostUpdateSub();
        setupPostChats();
        updateChatting(postsLoad);
      }
      currentTabFunction = async function() {
        if (postHolder.hasAttribute("loading") || postHolder.hasAttribute("allDownPostsLoaded")) {
          return;
        }
        postHolder.setAttribute("loading", "");
        let [code, response] = await sendRequest("GET", "user/likes?userid=" + currentProfile.user._id + "&before=" + lastLikeTime);
        if (code == 200) {
          let data = JSON.parse(response);
          createPosts(data.userLikes, data.posts, data.users, data.likes || []);
        }
        postHolder.removeAttribute("loading");
      }
      if (currentProfile.userLikes.length > 0) {
        createPosts(currentProfile.userLikes, currentProfile.likePosts, currentProfile.users, currentProfile.likes);
      } else {
        createTooltip(postHolder, "This user hasn't liked anything, yet...");
      }
    },
    chats: async function() {
      let chatHolder = createElement("profileHolder-chats", "div", "pageHolder");
      chatHolder.setAttribute("loading", "");
      function createChat(chat, user, reply) {
        let thisChat = createElement("profileChat", "div", chatHolder);
        let chatHTML;
        if (reply == null) {
          chatHTML = `<img src="${decideProfilePic(user)}" class="chatPfp" type="user" tabindex="0"><div class="chatTextArea"><div class="chatAttr"><span class="chatUser" type="user">${user.User}</span> <span class="chatTime">${timeSince(chat.Timestamp, false)}</span></div><span class="profileChatText">${formatText(chat.Text)}</span></div>`;
        } else {
          chatHTML = `<div class="chatReplyHolder"><div class="chatReplyLine"></div><span class="chatReplyUsername">${reply.user.User}</span><span class="chatReplyText">${reply.Text}</span></div><img src="${decideProfilePic(user)}" class="chatPfp" type="user"><div class="chatTextArea"><div class="chatAttr"><span class="chatUser" type="user">${user.User}</span> <span class="chatTime">${timeSince(chat.Timestamp, false)}</span></div><span class="profileChatText">${formatText(chat.Text)}</span></div>`;
        }
        thisChat.innerHTML = chatHTML;
        thisChat.setAttribute("tabindex", 0);
        thisChat.setAttribute("time", chat.Timestamp);
        let thisChatOverlay = createElement("profileChatOverlay", "div", thisChat);
        thisChatOverlay.setAttribute("type", "chatlink");
        thisChatOverlay.setAttribute("chatid", chat._id);
      }
      async function createChats(chats, repliesLoad, usersLoad) {
        let replies = getObject(repliesLoad, "_id");
        let users = getObject(usersLoad, "_id");
        for (let i = 0; i < chats.length; i++) {
          let chat = chats[i];
          let reply = replies[chat.ReplyID];
          if (reply != null) {
            reply.user = users[reply.UserID];
          }
          createChat(chat, users[chat.UserID], reply); //renderChat(parent.querySelector(".chatHolder"), chat, users[chat.UserID], reply);
        }
        chatHolder.removeAttribute("loading");
      }
      currentTabFunction = async function() {
        if (chatHolder.hasAttribute("loading") || chatHolder.hasAttribute("allDownPostsLoaded")) {
          return;
        }
        chatHolder.setAttribute("loading", "");
        let [code, response] = await sendRequest("GET", "chats?userid=" + currentProfile.user._id + "&before=" + chatHolder.lastChild.getAttribute("time"));
        if (code == 200) {
          let data = JSON.parse(response);
          createChats(data.chats, data.replies || [], data.users);
        }
        chatHolder.removeAttribute("loading");
      }
      if (currentProfile.chats.length > 0) {
        createChats(currentProfile.chats, currentProfile.replies, currentProfile.users);
      } else {
        createTooltip(chatHolder, "This user hasn't chatted, yet...");
      }
    }
  }

  let currentProfileTab = null;
  function changeProfileTab(type) {
    if (currentProfileTab == type) {
      return;
    }
    currentProfileTab = type;
    let tabs = ["posts", "chats", "likes"];
    tabs.splice(tabs.indexOf(type), 1);
    for (let i in tabs) {
      findI("tab-" + tabs[i]).classList.remove("selected");
      if (findC("profileHolder-" + tabs[i]) != null) {
        findC("profileHolder-" + tabs[i]).remove();
      }
    }
    findI("tab-" + type).classList.add("selected");
    tab = type;
    window.scrollTo({ top: 0 });
    loadFunction[tab]();
  }
  changeProfileTab("posts");
  findI("tab-posts").addEventListener("click", function() {
    changeProfileTab("posts");
  });
  findI("tab-chats").addEventListener("click", function() {
    changeProfileTab("chats");
  });
  findI("tab-likes").addEventListener("click", function() {
    changeProfileTab("likes");
  });
  tempListen(document, "scroll", function() {
    if ((window.innerHeight + window.scrollY) >= findC("pageHolder").offsetHeight - 500 && !loadingPosts) {
      if (currentTabFunction != null) {
        currentTabFunction();
      }
    }
  });
}