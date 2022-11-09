modules.createpost = function(holder) {
  let newPost = createElement("newPost", "div", holder);
  let premium = hasPremium();
  let lim = premium ? 800 : 400
  newPost.innerHTML = `
  <div>
  <img id="newPostUserPfp" src="` + assetURL + `ProfileImages/DefaultProfilePic"></td><td>
  </div>
  <div class="newPostSectionContent">
  <input id="imageInput" type="file" accept="image/*" multiple="true" hidden="true">
  <span id="newPostUsername"></span>
  <div id="newPostArea" contenteditable="true" placeholder="Ready to Hangout?"></div>
  <div id="newPostCharCount">0/${lim}</div>
  <div id="newPostImages"></div>
  <div class="newPostButtons">
  <button class="postActionButton" id="image">
  <svg style="position: relative; height: 100%; width: 100%; cursor: pointer; " id="CreateImageButtonSvg" viewBox="0 0 550.801 550.801"><g style="" id="CreateImageButtonG" fill="var(--themeColor)" stroke="#ffffff" stroke-width="0"><path style="" id="Svg" d="M515.828,61.201H34.972C15.659,61.201,0,76.859,0,96.172v358.458C0,473.942,15.659,489.6,34.972,489.6h480.856 c19.314,0,34.973-15.658,34.973-34.971V96.172C550.801,76.859,535.143,61.201,515.828,61.201z M515.828,96.172V350.51l-68.92-62.66 c-10.359-9.416-26.289-9.04-36.186,0.866l-69.752,69.741L203.438,194.179c-10.396-12.415-29.438-12.537-39.99-0.271L34.972,343.219 V96.172H515.828z M367.201,187.972c0-26.561,21.523-48.086,48.084-48.086c26.562,0,48.086,21.525,48.086,48.086 c0,26.561-21.523,48.085-48.086,48.085C388.725,236.058,367.201,214.533,367.201,187.972z"></path></g></svg>
  </button>
  <button class="postActionButton hidden" id="emoji">
  <svg style="position: relative; height: 100%; width: 100%; cursor: pointer; " id="EmojiButtonSvg" viewBox="0 0 512 512"><g style="" id="EmojiButtonG" fill="var(--themeColor)" stroke="#ffffff" stroke-width="0"><path style="" id="Svg" d="m256 512c-68.38 0-132.667-26.629-181.02-74.98-48.351-48.353-74.98-112.64-74.98-181.02s26.629-132.667 74.98-181.02c48.353-48.351 112.64-74.98 181.02-74.98s132.667 26.629 181.02 74.98c48.351 48.353 74.98 112.64 74.98 181.02s-26.629 132.667-74.98 181.02c-48.353 48.351-112.64 74.98-181.02 74.98zm0-472c-119.103 0-216 96.897-216 216s96.897 216 216 216 216-96.897 216-216-96.897-216-216-216zm93.737 260.188c-9.319-5.931-21.681-3.184-27.61 6.136-.247.387-25.137 38.737-67.127 38.737s-66.88-38.35-67.127-38.737c-5.93-9.319-18.291-12.066-27.61-6.136s-12.066 18.292-6.136 27.61c1.488 2.338 37.172 57.263 100.873 57.263s99.385-54.924 100.873-57.263c5.93-9.319 3.183-21.68-6.136-27.61zm-181.737-135.188c13.807 0 25 11.193 25 25s-11.193 25-25 25-25-11.193-25-25 11.193-25 25-25zm150 25c0 13.807 11.193 25 25 25s25-11.193 25-25-11.193-25-25-25-25 11.193-25 25z"></path></g></svg>
  </button>
  <button class="postActionButton hidden" id="extra">
  <svg style="position: relative; height: 100%; width: 100%; cursor: pointer; " id="ConfigurePostButtonSvg" viewBox="0 0 513.607 513.607"><g style="" id="ConfigurePostButtonG" fill="var(--themeColor)" stroke="#ffffff" stroke-width="0"><path style="" id="Svg" d="m503.384 243.685c-30.059-12.05-58.533-34.623-82.345-65.281-24.287-31.271-43.862-71.117-56.609-115.233l-14.588-50.485c-1.854-6.418-7.729-10.836-14.41-10.836s-12.556 4.418-14.41 10.836l-14.587 50.484c-12.747 44.116-32.322 83.964-56.609 115.233-23.812 30.658-52.286 53.231-82.346 65.281-5.61 2.249-9.322 7.645-9.417 13.688-.095 6.044 3.446 11.554 8.983 13.977l4.663 2.041c59.676 26.122 108.444 90.453 133.8 176.5l15.534 52.718c1.88 6.38 7.737 10.76 14.389 10.76s12.508-4.38 14.389-10.76l15.535-52.718c25.355-86.047 74.124-150.378 133.801-176.5l4.662-2.041c5.536-2.424 9.077-7.934 8.982-13.977s-3.806-11.438-9.417-13.687zm-166.805 197.724-1.146 3.891-1.146-3.891c-24.688-83.781-70.572-149.266-127.875-183.753 24.507-14.749 47.336-35.395 67.106-60.851 26.598-34.244 47.946-77.574 61.737-125.308l.178-.612.177.612c13.791 47.733 35.14 91.063 61.737 125.308 19.771 25.456 42.6 46.102 67.106 60.851-57.302 34.488-103.186 99.972-127.874 183.753z"></path><path style="" id="Svg" d="m19.57 149.497 2.338 1.022c27.903 12.214 50.843 42.754 62.935 83.788l7.791 26.441c1.88 6.381 7.737 10.761 14.389 10.761 6.65 0 12.508-4.38 14.389-10.76l7.792-26.441c12.092-41.035 35.031-71.575 62.934-83.788l2.339-1.023c5.537-2.423 9.079-7.933 8.984-13.977-.094-6.043-3.807-11.439-9.417-13.688-28.709-11.509-53.118-43.536-65.294-85.675l-7.316-25.321c-1.856-6.418-7.731-10.836-14.412-10.836s-12.557 4.419-14.411 10.837l-7.314 25.32c-12.176 42.139-36.585 74.166-65.294 85.675-5.61 2.249-9.322 7.646-9.417 13.688-.095 6.044 3.447 11.554 8.984 13.977zm87.452-84.254c12.055 30.262 29.807 54.618 51.29 70.577-21.479 16.062-39.275 40.582-51.29 70.846-12.014-30.264-29.81-54.783-51.289-70.846 21.483-15.959 39.234-40.315 51.289-70.577z"></path><path style="" id="Svg" d="m134.704 400.672c-18.679-7.488-34.656-28.66-42.74-56.636l-5.089-17.617c-1.854-6.418-7.73-10.837-14.411-10.837-6.68 0-12.556 4.418-14.41 10.836l-5.091 17.618c-8.083 27.976-24.061 49.147-42.739 56.636-5.61 2.249-9.323 7.646-9.417 13.688-.095 6.044 3.447 11.554 8.985 13.977l1.625.711c17.908 7.84 33.324 28.552 41.237 55.404l5.421 18.396c1.881 6.38 7.737 10.76 14.389 10.76s12.508-4.38 14.389-10.76l5.421-18.396c7.912-26.853 23.328-47.563 41.235-55.402l1.627-.712c5.538-2.423 9.08-7.933 8.985-13.977-.094-6.044-3.807-11.44-9.417-13.689zm-62.241 51.912c-7.429-15.379-17.101-28.297-28.376-37.932 11.279-9.58 20.937-22.428 28.376-37.795 7.439 15.367 17.097 28.215 28.376 37.795-11.277 9.634-20.947 22.551-28.376 37.932z"></path></g></svg>
  </button>
  <button id="createPostButton">
  <svg id="postButtonImg" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M235 158.988H172.506C164.774 158.988 158.506 165.256 158.506 172.988V235C158.506 238.314 155.82 241 152.506 241H101.529C98.2156 241 95.5293 238.314 95.5293 235V172.988C95.5293 165.256 89.2613 158.988 81.5293 158.988H20C16.6863 158.988 14 156.302 14 152.988V102.012C14 98.698 16.6863 96.0117 20 96.0117H81.5293C89.2613 96.0117 95.5293 89.7437 95.5293 82.0117V20C95.5293 16.6863 98.2156 14 101.529 14H152.506C155.82 14 158.506 16.6863 158.506 20V82.0117C158.506 89.7437 164.774 96.0117 172.506 96.0117H235C238.314 96.0117 241 98.698 241 102.012V152.988C241 156.302 238.314 158.988 235 158.988Z" stroke="#ffffff" stroke-width="25"></path> </svg>
  Post</button>
  </div>`;

  if (userID == null) {
    newPost.style.display = "none";
  } else {
    newPost.style.display = "flex";
    let newPic = decideProfilePic(account);
    if (findI("newPostUserPfp").src != newPic) {
      findI("newPostUserPfp").src = newPic;
    }
    findI("newPostUsername").textContent = account.User || "";
  }

  let postText = findI("newPostArea");
  let newPostArea = findI("newPostArea");
  let imageInput = findI("imageInput");
  let newPostImages = findI("newPostImages");
  let newPostCharCount = findI("newPostCharCount");

  //let lastSpanAm = 0;
  async function updatePostFormat() {
    await sleep(1);
    /*
    let spanAm = preFormat(postText.innerText).split("</span>").length;
    if (spanAm == lastSpanAm) {
      return;
    }
    lastSpanAm = spanAm;
    */
    let caretWas = getCurrentCursorPosition(postText);
    let nodes = postText.childNodes;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeName == "DIV" || nodes[i].nodeName == "SPAN") {
        nodes[i].innerHTML = preFormat(nodes[i].innerText);
      } else if (nodes[i].nodeValue != null) {
        let newSpan = createElement("", "span", postText);
        newSpan.innerHTML = preFormat(nodes[i].nodeValue);
        nodes[i].replaceWith(newSpan);
      } else {
        postText.innerHTML = preFormat(nodes[i].innerHTML);
      }
      /*
      if (nodes[i].nodeName == "DIV") {
        if (i == 0 && nodes[i].textContent == "") {
          nodes[i].remove();
        } else {
          nodes[i].innerHTML = preFormat(nodes[i].innerText);
        }
      } else {
        let newLineDiv = createElement("", "div", postText);
        newLineDiv.textContent = nodes[i].nodeValue;
        nodes[i].remove();
        newLineDiv.innerHTML = preFormat(newLineDiv.innerText);
      }
      */
    }
    if (postText.innerHTML == "<br>") {
      postText.innerHTML = "";
    }
    if (caretWas > -1) {
      setCurrentCursorPosition(postText, caretWas);
    }
    postText.focus();
  }
  let lastLength = 0;
  postText.addEventListener("keydown", async function(e) {
    await sleep(1);
    if (postText.textContent.length != lastLength) {
      updatePostFormat();
      lastLength = postText.textContent.length;
    }
    if (e.code == "Tab") {
      e.preventDefault();
      let mentionsDropdown = findI("mentionsDropdown");
      if (mentionsDropdown != null && mentionsDropdown.firstChild != null) {
        let node = document.getSelection().anchorNode;
        if (node != null && node.parentElement.className == "mention") {
          node.textContent = "@" + mentionsDropdown.firstChild.getAttribute("user") + "&nbsp;";
          mentionsDropdown.remove();
          updateCharCount();
          setCurrentCursorPosition(node, node.textContent.length - 1);
        }
      }
    } else {
      checkForMentions();
    }
  }, "selection");
  function updateCharCount() {
    updatePostFormat();
    newPostCharCount.textContent = `${postText.textContent.length}/${lim}`;
  }
  postText.addEventListener("input", updateCharCount);
  //postText.addEventListener("change", updatePostFormat);
  postText.addEventListener("paste", function(e) {
    processUpload((e.clipboardData || e.originalEvent.clipboardData || {}).items);
    clipBoardRead(e);
    updatePostFormat();
  });
  postText.addEventListener("focus", function() {
    updatePostFormat();
  });
  let lastRequest;
  async function checkForMentions() {
    await sleep(1);
    let mentionsDropdown = findI("mentionsDropdown");
    let node = document.getSelection().anchorNode;
    if (node != null && node.parentElement.closest(".newPost") != null && node.parentElement.className == "mention") {
      let lookupTx = node.textContent.substring(1);
      if (lookupTx == "") {
        return;
      }
      let rect = node.parentElement.getBoundingClientRect();
      if (mentionsDropdown == null) {
        mentionsDropdown = createElement("dropdown", "div", "pageHolder");
        mentionsDropdown.id = "mentionsDropdown";
        mentionsDropdown.style.display = "none";
      }
      if (mentionsDropdown.getAttribute("lastText") == lookupTx) {
        return;
      }
      mentionsDropdown.setAttribute("lastText", lookupTx);
      mentionsDropdown.style.left = rect.left + "px";
      mentionsDropdown.style.top = rect.top + 24 + "px";
      let sentTime = Date.now();
      lastRequest = sentTime;
      let [code, response] = await sendRequest("GET", "user/search?term=" + lookupTx + "&amount=10");
      if (lastRequest != sentTime) {
        return;
      }
      if (code == 200) {
        response = JSON.parse(response);
        if (response.length == 0) {
          mentionsDropdown.style.opacity = 0;
          mentionsDropdown.style.display = "none";
          mentionsDropdown.style.height = "0px";
          return;
        }
        mentionsDropdown.innerHTML = "";
        for (let i = 0; i < response.length; i++) {
          let user = response[i];
          let userHtml = `<img class="mentionUserPfp" src="${decideProfilePic(user)}"> ${getRoleHTML(user)}<span style="margin-left: 4px">${user.User}</span>`
          let userContainer = createElement("mentionUser", "div", mentionsDropdown);
          userContainer.setAttribute("user", user.User);
          userContainer.innerHTML = userHtml;
          userContainer.addEventListener("mouseup", async function() {
            node.textContent = "@" + user.User + "&nbsp;";
            mentionsDropdown.remove();
            mentionsDropdown = null;
            updateCharCount();
            setCurrentCursorPosition(node, node.textContent.length - 1);
          });
        }
        mentionsDropdown.style.opacity = 1;
        mentionsDropdown.style.display = "unset";
        mentionsDropdown.style.height = response.length * 43 + 4 + "px";
      }
    } else {
      let mentionsDropdown = findI("mentionsDropdown");
      if (mentionsDropdown != null) {
        mentionsDropdown.remove();
        mentionsDropdown = null;
      }
    }
  }
  tempListen(body, "mousedown", async function(e) {
    if (e.target.closest("#newPostArea") != null) {
      checkForMentions();
    } else if (e.target.closest("#mentionsDropdown") == null) {
      let mentionsDropdown = findI("mentionsDropdown");
      if (mentionsDropdown != null) {
        mentionsDropdown.remove();
      }
    }
  });
  tempListen(document, "scroll", checkForMentions);

  findI("image").addEventListener("click", function() {
    imageInput.click();
  });
  newPostArea.addEventListener("drop", function(e) {
    processUpload(e.dataTransfer.items);
    e.preventDefault();
  });
  function processUpload(files) {
    if (files == null) {
      return;
    }
    if (newPostImages.childNodes.length < 3) {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.kind == "file") {
          file = file.getAsFile();
        }
        if (file.kind != "string") {
          if (file.type.substring(0, 6) == "image/") {
            if (supportedImageTypes.includes(file.type.replace(/image\//g, "")) == true) {
              if (file.size < 5242881 || (file.size < 5242881 * 2 && hasPremium())) { // 5 MB
                let blob = URL.createObjectURL(file);
                let image = createElement("newPostImageContainer", "div", newPostImages);
                createElement("newPostImage", "img", image).src = blob;
                let deleteButton = createElement("deleteImage", "div", image);
                deleteButton.innerHTML = "&times;";
                deleteButton.addEventListener("click", function(e) {
                  URL.revokeObjectURL(e.target.parentElement.querySelector(".newPostImage").src);
                  e.target.parentElement.remove();
                });
              } else {
                if (file.size > 5242881 && !hasPremium()) {
                  showPopUp("Too Big!", "Your image must be under 5MB. However, with Photop Premium you can upload up too 10MB!", [["Okay", "var(--grayColor)"]]);
                } else {
                  if (file.size > 5242881 * 2 && hasPremium()) {
                    showPopUp("Too Big!", "Your image file size must be under 10MB.", [["Okay", "var(--grayColor)"]]);
                  }
                }
              }
            } else {
              showPopUp("Invalid Image Type", "Photop only accepts images of the following types: <i style='color: #bbb'>" + (supportedImageTypes.join(", ")) + "</i>", [["Okay", "var(--grayColor)"]]);
            }
          } else {
            showPopUp("Must be an Image", "Only image files can be uploaded to Photop.", [["Okay", "var(--grayColor)"]]);
          }
        }
      }
    }
  }
  imageInput.addEventListener("change", function(e) {
    processUpload(e.target.files);
  });
  /*
  findI("extra").addEventListener("click", function () {
    showDropdown(findI("extra"), "right", [["Disable Likes", "coral", function () {showPopUp("Likes disabled", "Likes have been disabled on this post.", [["Okay", "var(--grayColor)"]])}], ["Disable Quotes", "slateblue"], ["Disable Chats", "dodgerblue"]]);
  });
  */
  let posting = false;
  // let limit = premium ? 800 : 400
  findI("createPostButton").addEventListener("click", async function() {
    if (posting == true) {
      return;
    }
    let images = document.getElementsByClassName("newPostImage");
    if (newPostArea.innerText.length < 1 && images.length < 1) {
      showPopUp("Write a Post", "Your post must either have text or at least an image.", [["Okay", "var(--grayColor)"]]);
      return;
    }
    if ((newPostArea.innerText.length > 400 && !premium) || (newPostArea.innerText.length > 400 * 2 && premium)) {
      if (!premium) {
        showPopUp("That's Too Long", `Please keep your posts to under ${lim} characters. However, with Photop Premium, you can send posts up to 800 characters long!`, [
          ["Premium", "var(--premiumColor)", function() { setPage("premium"); }], ["Okay", "var(--grayColor)"]]);
      } else {
        showPopUp("That's Too Long", `Please keep your posts to under ${lim} characters.`, [["Okay", "var(--grayColor)"]]);
      }
      return;
    }
    findC("newPost").style.borderBottomStyle = "solid";
    let sendFormData = new FormData();
    sendFormData.append("data", JSON.stringify({ text: newPostArea.innerText }));
    for (let i = 0; i < images.length; i++) {
      await fetch(images[i].src).then(async function(file) {
        sendFormData.append("image" + i, await file.blob());
        URL.revokeObjectURL(images[i].src);
      });
    }
    let endpoint = "posts/new";
    let groupID = getParam("group");
    if (groupID != null) {
      endpoint += "?groupid=" + groupID;
    }
    posting = true;
    let [code, response] = await sendRequest("POST", endpoint, sendFormData, true);
    posting = false;
    if (code == 200) {
      newPostArea.innerText = "";
      newPostImages.innerHTML = "";
      newPostCharCount.textContent = `0/${lim}`;
      if (recentUserPostID != response) {
        recentUserPostID = response;
        fetchNewPosts();
      }
    }
    if (newPost != null) {
      newPost.style.borderBottomStyle = "none";
    }
  });

  return newPost;
}