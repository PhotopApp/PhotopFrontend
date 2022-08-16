modules.post = function(parent, post, user, props, embeds) {
  let postHTML = `
  <div class="postPost">
    <div class="postUser" id="post${post._id}${user._id}">
      <img src="${decideProfilePic(user)}" class="postProfilePic" type="user" tabindex="0">
      <div class="postInfo">
        <div class="postUsername" type="user">${getRoleHTML(user)}${user.User}</div>
        <div class="postTimestamp" title="` + formatFullDate(post.Timestamp) + `">${timeSince(post.Timestamp, true)} ${(props.isPinned == true ? "(Pinned)" : "")}</div>
      </div>
    </div>
    <div class="postContent">
      <div class="postText"></div>
    </div>
    <div class="postButtons">
      <div class="postStat">
        <button class="postButton" type="like">
          <svg viewBox="0 0 900 900" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M62.9086 366.407L66.4441 369.942L370.5 673.998L674.556 369.942L678.091 366.407C760.883 283.615 760.883 149.385 678.091 66.5934L673.849 62.3507C591.058 -20.4404 456.827 -20.4404 374.036 62.3507L370.5 65.8862L366.965 62.3507C284.173 -20.4404 149.942 -20.4404 67.1513 62.3507L62.9086 66.5934C-19.8826 149.385 -19.8826 283.615 62.9086 366.407Z" stroke="#999" stroke-width="60" transform="translate(79.5, 113)"></path> </svg>
        </button>
        ${post.Likes || 0}
      </div>
      <div class="postStat">
        <button class="postButton" type="quote">
          <svg viewBox="0 0 839 595" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="196" cy="398.007" r="168.5" stroke="#999999" stroke-width="55"/> <circle cx="643" cy="398.007" r="168.5" stroke="#999999" stroke-width="55"/> <path d="M28.5986 386V261C28.5986 132.318 132.916 28 261.599 28V28" stroke="#999999" stroke-width="55"/> <path d="M475.599 386V261C475.599 132.318 579.916 28 708.599 28V28" stroke="#999999" stroke-width="55"/> </svg>
        </button>
        ${post.Quotes || 0}
      </div>
      <div class="postStat" style="color: var(--themeColor)">
        <button class="postButton" type="actionchat">
          <svg viewBox="0 0 798 512" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M96.0002 271.985L121.627 281.962L123.5 277.149V271.985H96.0002ZM30.6666 439.799L5.04025 429.822L5.04025 429.822L30.6666 439.799ZM74.5064 480.174L62.458 455.453L62.458 455.453L74.5064 480.174ZM208.225 415V387.5H201.88L196.176 390.28L208.225 415ZM123.5 73.0005C123.5 63.3355 131.335 55.5005 141 55.5005V0.500488C100.96 0.500488 68.5002 32.9598 68.5002 73.0005H123.5ZM123.5 271.985V73.0005H68.5002V271.985H123.5ZM56.293 449.776L121.627 281.962L70.3738 262.008L5.04025 429.822L56.293 449.776ZM62.458 455.453C61.1593 456.086 60.3494 456.059 59.8193 455.967C59.1257 455.847 58.2513 455.468 57.438 454.718C56.6246 453.969 56.1749 453.129 55.9982 452.448C55.8632 451.927 55.7689 451.122 56.293 449.776L5.04025 429.822C-14.6037 480.279 37.882 528.616 86.5548 504.894L62.458 455.453ZM196.176 390.28L62.458 455.453L86.5548 504.894L220.273 439.721L196.176 390.28ZM725 387.5H208.225V442.5H725V387.5ZM742.5 370C742.5 379.665 734.665 387.5 725 387.5V442.5C765.041 442.5 797.5 410.041 797.5 370H742.5ZM742.5 73.0005V370H797.5V73.0005H742.5ZM725 55.5005C734.665 55.5005 742.5 63.3355 742.5 73.0005H797.5C797.5 32.9598 765.041 0.500488 725 0.500488V55.5005ZM141 55.5005H725V0.500488H141V55.5005Z" fill="var(--themeColor)"/> </svg>
        </button>
        <span class="postChatCount">${post.Chats || 0}</span>
      </div>
      <div class="postStat">
        <button class="postButton" type="extra">
          <svg viewBox="0 0 41.915 41.915"><g fill="#999999"><path style="" id="Svg" d="M11.214,20.956c0,3.091-2.509,5.589-5.607,5.589C2.51,26.544,0,24.046,0,20.956c0-3.082,2.511-5.585,5.607-5.585 C8.705,15.371,11.214,17.874,11.214,20.956z"></path><path style="" id="Svg" d="M26.564,20.956c0,3.091-2.509,5.589-5.606,5.589c-3.097,0-5.607-2.498-5.607-5.589c0-3.082,2.511-5.585,5.607-5.585 C24.056,15.371,26.564,17.874,26.564,20.956z"></path><path style="" id="Svg" d="M41.915,20.956c0,3.091-2.509,5.589-5.607,5.589c-3.097,0-5.606-2.498-5.606-5.589c0-3.082,2.511-5.585,5.606-5.585 C39.406,15.371,41.915,17.874,41.915,20.956z"></path></g></svg>
        </button>
      </div>
    </div>  
  </div>
  <div class="postChat">
    <div class="postChatInfo">
      <div class="postChatLiveCircle"></div>
      <span class="postChatLive">Live</span>
      <span class="postChatChatting"></span>
    </div>
    <div class="postChatHolder">
      <div class="loadingChatsInfo">
        <svg width="80px" viewBox="0 0 1415 933" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M77.759 752.42L101.535 766.239L105.259 759.831V752.42H77.759ZM75.9729 755.973L50.7091 745.111L50.7091 745.111L75.9729 755.973ZM31.1522 860.218L5.88837 849.356L5.88837 849.356L31.1522 860.218ZM73.4703 902.134L62.367 876.975L62.367 876.975L73.4703 902.134ZM172.619 858.377L161.516 833.218L161.516 833.218L172.619 858.377ZM180.394 853.537V826.037H170.346L162.665 832.515L180.394 853.537ZM105.259 588C105.259 578.335 113.094 570.5 122.759 570.5V515.5C82.7183 515.5 50.259 547.959 50.259 588H105.259ZM105.259 752.42V588H50.259V752.42H105.259ZM101.237 766.835C101.336 766.606 101.437 766.408 101.535 766.239L53.9828 738.602C52.7709 740.687 51.6772 742.859 50.7091 745.111L101.237 766.835ZM56.416 871.081L101.237 766.835L50.7091 745.111L5.88837 849.356L56.416 871.081ZM62.367 876.975C61.0494 877.557 60.2415 877.499 59.7141 877.388C59.0254 877.242 58.167 876.832 57.3834 876.055C56.5997 875.279 56.1809 874.425 56.0286 873.737C55.912 873.211 55.8471 872.404 56.416 871.081L5.88837 849.356C-15.4634 899.017 35.1197 949.118 84.5737 927.293L62.367 876.975ZM161.516 833.218L62.367 876.975L84.5737 927.293L183.723 883.535L161.516 833.218ZM162.665 832.515C162.384 832.752 162.016 832.997 161.516 833.218L183.722 883.535C189.03 881.193 193.857 878.157 198.123 874.559L162.665 832.515ZM1047.93 826.037H180.394V881.037H1047.93V826.037ZM1065.43 808.537C1065.43 818.202 1057.59 826.037 1047.93 826.037V881.037C1087.97 881.037 1120.43 848.578 1120.43 808.537H1065.43ZM1065.43 588V808.537H1120.43V588H1065.43ZM1047.93 570.5C1057.59 570.5 1065.43 578.335 1065.43 588H1120.43C1120.43 547.959 1087.97 515.5 1047.93 515.5V570.5ZM122.759 570.5H1047.93V515.5H122.759V570.5Z" fill="#C8C8C8"/> <path d="M1337.17 237.42L1313.39 251.239L1309.67 244.831V237.42H1337.17ZM1338.96 240.973L1364.22 230.111L1364.22 230.111L1338.96 240.973ZM1383.78 345.218L1409.04 334.356L1409.04 334.356L1383.78 345.218ZM1341.46 387.134L1352.56 361.975L1352.56 361.975L1341.46 387.134ZM1242.31 343.377L1253.41 318.218L1253.41 318.218L1242.31 343.377ZM1234.54 338.537V311.037H1244.58L1252.26 317.515L1234.54 338.537ZM1309.67 73C1309.67 63.335 1301.84 55.5 1292.17 55.5V0.5C1332.21 0.5 1364.67 32.9594 1364.67 73H1309.67ZM1309.67 237.42V73H1364.67V237.42H1309.67ZM1313.69 251.835C1313.59 251.606 1313.49 251.408 1313.39 251.239L1360.95 223.602C1362.16 225.687 1363.25 227.859 1364.22 230.111L1313.69 251.835ZM1358.51 356.081L1313.69 251.835L1364.22 230.111L1409.04 334.356L1358.51 356.081ZM1352.56 361.975C1353.88 362.557 1354.69 362.499 1355.22 362.388C1355.9 362.242 1356.76 361.832 1357.55 361.055C1358.33 360.279 1358.75 359.425 1358.9 358.737C1359.02 358.211 1359.08 357.404 1358.51 356.081L1409.04 334.356C1430.39 384.017 1379.81 434.118 1330.36 412.293L1352.56 361.975ZM1253.41 318.218L1352.56 361.975L1330.36 412.293L1231.21 368.535L1253.41 318.218ZM1252.26 317.515C1252.55 317.752 1252.91 317.997 1253.41 318.218L1231.21 368.535C1225.9 366.193 1221.07 363.157 1216.81 359.559L1252.26 317.515ZM367 311.037H1234.54V366.037H367V311.037ZM349.5 293.537C349.5 303.202 357.335 311.037 367 311.037V366.037C326.96 366.037 294.5 333.578 294.5 293.537H349.5ZM349.5 73V293.537H294.5V73H349.5ZM367 55.5C357.335 55.5 349.5 63.335 349.5 73H294.5C294.5 32.9593 326.96 0.5 367 0.5V55.5ZM1292.17 55.5H367V0.5H1292.17V55.5Z" fill="#C8C8C8"/> </svg>
        <div class="loadingChatMsg">Loading Chats...</div>
      </div>
    </div>
    <div class="postChatNew">
      <div class="postChatInput" contenteditable="true" placeholder="Time To Chat" onpaste="clipBoardRead(event)"></div>
      <button class="postChatButton" type="sendchat">
        <svg viewBox="0 0 599 602" fill="none" xmlns="http://www.w3.org/2000/svg"> <mask id="mask0_931_12" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="599" height="602"> <rect width="599" height="602" fill="#D9D9D9"/> </mask> <g mask="url(#mask0_931_12)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M590.724 93.2879C610.606 40.8893 559.292 -10.4246 506.893 9.45683L44.9078 184.746C-5.64812 203.928 -12.0431 272.856 34.121 301.012L149.73 371.522L372.965 195.301C393.438 179.14 420.026 205.728 403.864 226.201L227.667 449.406L299.141 566.299C327.33 612.403 396.198 605.974 415.368 555.45L590.724 93.2879Z" fill="white"/> </g> </svg>
      </button>
    </div>
  </div>
  `;
  let newPost = createElement("post", "div", parent);
  if (props.loadToTop == true && parent.firstChild != null) {
    parent.insertBefore(newPost, parent.firstChild);
  }
  newPost.id = post._id;
  newPost.setAttribute("userid", post.UserID);
  newPost.setAttribute("name", user.User);
  newPost.setAttribute("time", post.Timestamp);
  newPost.setAttribute("text", post.Text);
  newPost.innerHTML = postHTML;
  newPost.querySelector(".postText").innerHTML = formatText(post.Text);
  /*
  let links = newPost.querySelector(".postText").querySelectorAll(".link");
  let arrayOfLinks = [];
  for (let i = 0; i < links.length; i++) {
    arrayOfLinks.push(links[i].href);
  }
  let returnHTML = "";
  if (account.Settings == null) {
    account.Settings = { Display: {
      "Embed YouTube Videos": true,
      "Embed Twitch Streams": true
    }};
  }
  for (let i = 0; i < arrayOfLinks.length; i++) {
    if ((arrayOfLinks[i].startsWith("https://www.youtube.com/watch?v=") || arrayOfLinks[i].startsWith("https://youtube.com/watch?v=")) && account.Settings.Display["Embed YouTube Videos"]) {
      returnHTML += `<iframe src="${arrayOfLinks[i].replace("watch?v=", "embed/")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen" class="embed"></iframe>`;
    } else if (arrayOfLinks[i].startsWith("https://youtu.be") && account.Settings.Display["Embed YouTube Videos"]) {
      returnHTML += `<iframe src="${arrayOfLinks[i].replace("https://youtu.be/", "https://youtube.com/embed/")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen" class="embed"></iframe>`;
    } else if (arrayOfLinks[i].startsWith("https://twitch.tv/") && account.Settings.Display["Embed Twitch Streams"]) {
      returnHTML += `<iframe src="https://player.twitch.tv/?channel=${arrayOfLinks[i].replace("https://twitch.tv/", "")}&parent=app.photop.live&parent=photoprevamp.robotengine.repl.co" allowfullscreen class="embed"></iframe>`;
    }
  }
  newPost.querySelector(".postText").innerHTML += returnHTML;
  */
  if (post.Media != null && post.Media.ImageCount > 0) {
    let postImages = createElement("postImages", "div", newPost.querySelector(".postContent"));
    for (let i = 0; i < post.Media.ImageCount; i++) {
      let image = createElement("postImage", "img", postImages);
      image.src = assetURL + "PostImages/" + post._id + i;
      image.setAttribute("type", "imageenlarge");
      image.setAttribute("tabindex", 0);
    }
  }

  if (props.isLiked == true) {
    let button = newPost.querySelector(".postButton[type='like']");
    button.parentElement.style.color = "#FF5786";
    button.setAttribute("isLiked", "");
    let icon = button.querySelector("svg").querySelector("path");
    icon.setAttribute("fill", "#FF5786");
    icon.setAttribute("stroke", "#FF5786");
  }

  if (isMobile == true) {
    newPost.querySelector(".postPost").style.width = "100%";
    newPost.querySelector(".postChat").style.display = "none";
  }
}