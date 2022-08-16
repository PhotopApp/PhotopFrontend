wireframes.home = ``;

pages.home = async function() {
  // Load Needed Modules
  let renderPost = await getModule("post");
  let createpost = await getModule("createpost");
  let newPost = findC("newPost");
  if (newPost == null) {
    newPost = createpost("pageHolder");
  }

  if (userID == null) {
    if (newPost.style.display != "none") {
      newPost.style.display = "none";
    }
  } else {
    if (newPost.style.display != "flex") {
      newPost.style.display = "flex";
      let newPic = decideProfilePic(account);
      if (findI("newPostUserPfp").src != newPic) {
        findI("newPostUserPfp").src = newPic;
      }
      findI("newPostUsername").textContent = account.User || "";
    }
  }
  
  modifyParams("post");
  modifyParams("chat");
  modifyParams("group");
  modifyParams("user");
  
  let loadingPosts = false;
  let postHolder;
  
  setAccountSub("home");
  async function loadPosts(before) {
    postHolder = findC("postHolder");
    loadingPosts = true;
    let getURL = "posts";
    if (before != null) {
      getURL += "?before=" + before;
    } else {
      if (postHolder != null) {
        postHolder.remove();
        postHolder = null;
      }
    }
    if (postHolder == null) {
      postHolder = createElement("postHolder", "div", pageHolder);
    }
    let [code, response] = await sendRequest("GET", getURL);
    if (code == 200) {
      let data = JSON.parse(response);
      let posts = data.posts;
      let users = getObject(data.users, "_id");
      let likes = getObject(data.likes, "_id");
      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null) });
      }
      if (posts.length > 14) {
        loadingPosts = false;
      }
      setPostUpdateSub();
      setupPostChats();
      updateChatting(posts);
    }
  }

  loadPosts();
  
  tempListen(document, "scroll", function() {
    if (postHolder != null && (window.innerHeight + window.scrollY) >= postHolder.offsetHeight - 500 && !loadingPosts) {
      loadPosts(postHolder.lastChild.getAttribute("time"));
    }
  });
}