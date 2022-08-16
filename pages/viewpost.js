wireframes.viewpost = `
<div class="stickyContainer" id="simpleTopBar">
<button class="backButton" onclick="goBack()">
  <svg height="80%" viewBox="0 0 149 135" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M139.58 57.9155C144.551 57.9155 148.58 61.945 148.58 66.9155V66.9155C148.58 71.8861 144.551 75.9155 139.58 75.9155L14.4797 75.9155V57.9155L139.58 57.9155Z" fill="var(--themeColor)"/> <path d="M59.8825 6.94142C63.5745 3.61341 69.0479 4.09106 72.1076 8.00827V8.00827C75.1674 11.9255 74.6548 17.7989 70.9628 21.1269L16.5707 70.1564L5.49049 55.9709L59.8825 6.94142Z" fill="var(--themeColor)"/> <path d="M59.8825 127.989C63.5745 131.317 69.0479 130.839 72.1076 126.922V126.922C75.1674 123.005 74.6548 117.132 70.9628 113.804L16.5707 64.774L5.49049 78.9595L59.8825 127.989Z" fill="var(--themeColor)"/> <ellipse cx="14.1039" cy="67.4041" rx="14.7752" ry="13.7539" transform="rotate(90 14.1039 67.4041)" fill="var(--themeColor)"/> </svg>
  <span id="backButtonArrow">Go Back</span>
</button>
<span id="detailInfo" style="color: var(--postColor)"></span>
</div>
`;

pages.viewpost = async function() {
  let splitData = (getParam("post") || "").split(",");
  let postID = splitData[0];
  if (postID == null) {
    return;
  }
  let doAnim = splitData[1];
  let renderPost = await getModule("post");

  let loadingPosts = true;
  
  let postHolder = findC("postHolder");
  if (postHolder != null) {
    postHolder.remove();
  }
  postHolder = createElement("postHolder", "div", pageHolder);
  
  let [code, response] = await sendRequest("GET", "posts?postid=" + postID);
  if (code == 200) {
    findI("detailInfo").textContent = "/Post_" + postID;
    let lookupData = JSON.parse(response);
    if (lookupData.posts[0] != null) {
      let [code2, response2] = await sendRequest("GET", "posts?amount=9&before=" + lookupData.posts[0].Timestamp);
      if (code2 == 200) {
        let beforeData = JSON.parse(response2);
        let [code3, response3] = await sendRequest("GET", "posts?amount=9&after=" + lookupData.posts[0].Timestamp);
        if (code3 == 200) {
          let afterData = JSON.parse(response3);
          let allPosts = afterData.posts.reverse().concat(lookupData.posts, beforeData.posts);
          let users = getObject(afterData.users.concat(lookupData.users, beforeData.users), "_id");
          let likes = getObject((afterData.likes || []).concat((lookupData.likes || []), (beforeData.likes || [])), "_id");
          for (let i = 0; i < allPosts.length; i++) {
            let post = allPosts[i];
            renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null) });
          }
          if (beforeData.posts.length < 9) {
            postHolder.setAttribute("allLoadedDown", "");
          }
          if (afterData.posts.length < 9) {
            postHolder.setAttribute("allLoadedUp", "");
          }
          loadingPosts = false;
          let post = findI(postID);
          if (post == null) {
            return;
          }
          post.style.margin = "24px 0px 24px 0px";
          if (doAnim != "true") {
            post.style.backgroundColor = "#C95EFF";
          }
          window.scrollTo({
            top: post.getBoundingClientRect().top - 62
          });
          setPostUpdateSub();
          //setupPostChats();
          updateChatting(allPosts);
          if (doAnim != "true") {
            await sleep(1000);
            post.style.backgroundColor = "";
          }
        }
      }
    } else {
      showPopUp("Post Not Found", "That post wasn't found! It may have been removed or never sent at all.", [["Back", "var(--grayColor)", goBack]]);
    }
  } else {
    showPopUp("Post Not Found", "That post wasn't found! It may have been removed or never sent at all.", [["Back", "var(--grayColor)", goBack]]);
  }

  async function loadMorePosts(place) {
    loadingPosts = true;
    if (place == "before") {
      if (postHolder.hasAttribute("allLoadedDown") == true) {
        loadingPosts = false;
        return;
      }
      let [code, response] = await sendRequest("GET", "posts?before=" + postHolder.lastChild.getAttribute("time"));
      if (code == 200) {
        let data = JSON.parse(response);
        let posts = data.posts;
        let users = getObject(data.users, "_id");
        let likes = getObject(data.likes, "_id");
        for (let i = 0; i < posts.length; i++) {
          let post = posts[i];
          renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null) });
        }
        if (posts.length < 15) {
          postHolder.setAttribute("allLoadedDown", "");
        }
        updateChatting(posts);
      }
    } else if (place == "after") {
      if (postHolder.hasAttribute("allLoadedUp") == true) {
        loadingPosts = false;
        return;
      }
      let [code, response] = await sendRequest("GET", "posts?after=" + postHolder.firstChild.getAttribute("time"));
      if (code == 200) {
        let data = JSON.parse(response);
        let posts = data.posts;
        let users = getObject(data.users, "_id");
        let likes = getObject(data.likes, "_id");
        for (let i = 0; i < posts.length; i++) {
          let post = posts[i];
          renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null), loadToTop: true });
        }
        if (posts.length < 15) {
          postHolder.setAttribute("allLoadedUp", "");
        }
        updateChatting(posts);
      }
    }
    loadingPosts = false;
    setPostUpdateSub();
  }
  tempListen(document, "scroll", function() {
    if (postHolder != null && !loadingPosts) {
      if (window.innerHeight + window.scrollY >= postHolder.offsetHeight - 500) {
        loadMorePosts("before");
      } else if (window.scrollY < 500) {
        loadMorePosts("after");
      }
    }
  });
}