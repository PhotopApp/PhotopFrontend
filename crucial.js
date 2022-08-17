let serverURL = "https://photop.exotek.co/";
//let serverURL = "http://localhost:8080/";
let assetURL = "https://photop-content.s3.amazonaws.com/";
let exotekCDN = "https://exotekcdn.exotektechnolog.repl.co/";

const socket = new SimpleSocket({
  project_id: "61b9724ea70f1912d5e0eb11",
  project_token: "client_a05cd40e9f0d2b814249f06fbf97fe0f1d5"
});

let statuses = { 0: ["Offline", "#a4a4a4"], 1: ["Online", "#00FC65"], 2: ["In Group", "#5ab7fa"] };

let supportedImageTypes = ["png", "jpeg", "jpg", "webp", "svg+xml", "tiff", "tif", "heic", "heif"]; //, "gif"

let monthes = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let wireframes = {};
let pages = {};
let modules = {};

let account = {};
let groups = {};
let userID = null;

let mainLoadActions = [];
let subscribes = [];

let body = findC("body");
let app = findC("app");
let main = findC("main");
let pageHolder = findC("pageHolder");
let sidebarButtons = findI("sidebarButtons");

let connectingUI = findI("connectingDisplay");
socket.onopen = function() {
  connectingUI.style.display = "none";
  recentUsers = {};
  if (currentPage != "") {
    refreshPage();
  }
  init();
}
socket.onclose = function() {
  connectingUI.style.display = "flex";
}

let tempListeners = [];
function tempListen(parent, listen, runFunc, extra) {
  parent.addEventListener(listen, runFunc, extra);
  tempListeners.push({ parent: parent, name: listen, listener: runFunc });
}
function removeTempListeners() {
  for (let i = 0; i < tempListeners.length; i++) {
    let remEvent = tempListeners[i];
    if (remEvent.parent != null) {
      remEvent.parent.removeEventListener(remEvent.name, remEvent.listener);
    }
  }
}

function copyClipboardText(text) {
  navigator.clipboard.writeText(text).then(function() {
    //console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}
function clipBoardRead(e) {
  e.preventDefault();
  document.execCommand('inserttext', false, e.clipboardData.getData("text/plain"));
}

function findC(name) {
  return document.getElementsByClassName(name)[0];
}
function findI(name) {
  return document.getElementById(name);
}

let currentPage = "";
let currentPageWithSearch = window.location.search;
let currentlyLoadingPages = {};
async function setPage(name) {
  let loadedPage = currentPage;
  currentPage = name;
  app.style.width = "850px";
  if (loadedPage != name) {
    pageHolder.innerHTML = "";
  }
  removeTempListeners();
  for (let i = 0; i < subscribes.length; i++) {
    subscribes[i].close();
  }
  subscribes = [];
  if (window.closeMobileChat != null) {
    closeMobileChat();
  }
  if (wireframes[name] == null) {
    if (currentlyLoadingPages[name] != null) {
      return;
    }
    currentlyLoadingPages[name] = "";
    await loadScript("./pages/" + name + ".js");
    delete currentlyLoadingPages[name];
  }
  if (name != "home" || loadedPage != name) {
    pageHolder.innerHTML = wireframes[name];
  }
  if (pages[name] != null) {
    window.location.hash = "#" + name;
    await pages[name]();
    let title = name;
    title = name.charAt(0).toUpperCase() + name.slice(1);
    document.title = title + " | Photop";
  }
}
async function refreshPage() {
  pageHolder.innerHTML = wireframes[currentPage] || "";
  removeTempListeners();
  for (let i = 0; i < subscribes.length; i++) {
    subscribes[i].close();
  }
  subscribes = [];
  if (window.closeMobileChat != null) {
    closeMobileChat();
  }
  if (wireframes[currentPage] == null) {
    if (currentlyLoadingPages[currentPage] != null) {
      return;
    }
    currentlyLoadingPages[currentPage] = "";
    await loadScript("./pages/" + currentPage + ".js");
    delete currentlyLoadingPages[currentPage];
  }
  if (pages[currentPage] != null) {
    window.location.hash = "#" + currentPage;
    await pages[currentPage]();
    let title = currentPage;
    title = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    document.title = title + " | Photop";
  }
}
function goBack() {
  history.back();
}
window.addEventListener("hashchange", function() {
  let pageName = window.location.hash.substring(1);
  if (currentPage == pageName.replace(/\./g, "")) {
    return;
  }
  if (pageName[pageName.length - 1] == ".") {
    history.back();
    return;
  }
  setPage(pageName);
});

let currentlyLoadingModules = {};
async function getModule(name) {
  if (modules[name] == null) {
    if (currentlyLoadingModules[name] != null) {
      return;
    }
    currentlyLoadingModules[name] = "";
    await loadScript("./modules/" + name + ".js");
    delete currentlyLoadingModules[name];
  }
  return modules[name];
}

function createElement(name, type, parent, attributes) {
  if (attributes == null) {
    attributes = [];
  }

  if (parent == null) {
    return null;
  } else {
    if (typeof parent === "string" || typeof parent === "number") {
      parent = findC(parent);
    }
  }

  let newElement = document.createElement(type);

  if (parent === null) {
    document.body.appendChild(newElement);
  } else {
    parent.appendChild(newElement);
  }

  let setStyle = "";
  let keys = Object.keys(attributes);
  for (let i = 0; i < keys.length; i++) {
    setStyle += keys[i] + ": " + attributes[keys[i]] + "; ";
  }
  newElement.setAttribute("style", setStyle);
  newElement.setAttribute("class", name);

  return newElement;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getScript(url) {
  return document.querySelector("[src='" + url + "'");
}
async function loadScript(url) {
  return new Promise(function(resolve) {
    let loaded = getScript(url);
    if (loaded != null) {
      loaded.remove();
    }
    let newScript = document.createElement('script');
    newScript.addEventListener("load", function() {
      resolve(newScript);
    });
    newScript.src = url;
    document.body.appendChild(newScript);
  });
}

function getParam(key) {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  return urlParams.get(key);
}
function modifyParams(key, value) {
  const Url = new URL(window.location);
  if (value != null) {
    Url.searchParams.set(key, value);
  } else {
    Url.searchParams.delete(key);
  }
  window.history.pushState({}, '', Url);
}

let epochOffset = 0;
function getEpoch() {
  return Date.now() + epochOffset;
}
async function sendRequest(method, path, body, noFileType) {
  if (account.banned == true && path != "mod/appeal") {
    return [0, "Account Banned"];
  }
  try {
    let sendData = {
      method: method,
      headers: {
        cache: "no-cache"
      }
    };
    if (noFileType != true) {
      sendData.headers["Content-Type"] = "text/plain";
    }
    if (body != null) {
      if (typeof body == "object" && body instanceof FormData == false) {
        body = JSON.stringify(body);
      }
      sendData.body = body;
    }
    let token = localStorage.getItem("token");
    if (token != null) {
      token = JSON.parse(token);
      if (token.expires > Math.floor(Date.now() / 1000)) {
        sendData.headers.auth = localStorage.getItem("userID") + ";" + token.token;
      }
    }
    let response = await fetch(serverURL + path, sendData);
    let serverTimeMillisGMT = new Date(response.headers.get("Date")).getTime();
    let localMillisUTC = new Date().getTime();
    epochOffset = serverTimeMillisGMT - localMillisUTC;
    switch (response.status) {
      case 401:
        localStorage.removeItem("userID");
        localStorage.removeItem("token");
        location.reload();
        break;
      case 429:
        showPopUp("Rate Limited", await response.text(), [["Okay", "var(--grayColor)"]]);
        break;
      case 418:
        account.banned = true;
        let data = JSON.parse(await response.text());
        showPopUp("Account Banned", `Oh no! It appears you have broken a Photop rule resulting in your account being banned.<br><br><b>Account:</b> ${data.account}<br><b>Reason:</b> ${data.reason}<br><b>Expires:</b> ${(data.expires == "Permanent" ? "Permanent" : formatFullDate(data.expires * 1000))}${(data.terminated == true ? "<br><b>Terminated:</b> Yes" : "")}${!data.appealed ? `<br><div id="banAppealInput" contenteditable class="textArea" placeholder="Appeal your Ban"></div><button id="submitAppealButton">Submit</button>` : ""}`);
        let appealSend = findI("submitAppealButton");
        if (appealSend != null) {
          appealSend.addEventListener("click", async function() {
            let appealInput = findI("banAppealInput");
            if (appealInput.textContent.length < 1) {
              showPopUp("Write an Appeal", "You must write an appeal before submitting it.", [["Okay", "var(--grayColor)"]]);
              return;
            }
            let [code] = await sendRequest("POST", "mod/appeal", { appeal: appealInput.textContent.substring(0, 250) });
            if (code == 200) {
              appealInput.remove();
              appealSend.remove();
              showPopUp("Appeal Sent", "We've recieved your appeal and will review it as soon as possible.", [["Okay", "var(--grayColor)"]]);
            }
          });
        }
        break;
      default:
        return [response.status, await response.text()];
    }
    return [0, "Request Refused"];
  } catch (err) {
    console.log("FETCH ERROR: " + err);
    return [0, "Fetch Error"];
  }
}

function getObject(arr, field) {
  if (arr == null) {
    return {};
  }
  let returnObj = {};
  for (let i = 0; i < arr.length; i++) {
    let setObject = arr[i];
    returnObj[setObject[field]] = setObject;
  }
  return returnObj;
}

let accountSubscribe;
let newPostCount = 0;
function setAccountSub(location) {
  let query = { task: "general", location: location };
  if (userID != null) {
    query.userID = userID;
    query.token = JSON.parse(localStorage.getItem("token")).token.substring(0, 15);
    query.groups = Object.keys(groups);
  }
  if (accountSubscribe != null) {
    accountSubscribe.edit(query);
  } else {
    accountSubscribe = socket.subscribe(query, async function(data) {
      switch (data.type) {
        case "newpost":
          if (data.post.UserID == userID) {
            return;
          }
          if (account.BlockedUsers != null && account.BlockedUsers.includes(data.post.UserID) == true) {
            return;
          }
          if (data.post.GroupID != null) {
            let notifHolder = findI(data.post.GroupID + "notif");
            if (notifHolder == null) {
              let groupnotif = await getModule("groupnotif");
              groupnotif({ ...groups[data.post.GroupID], _id: data.post.GroupID });
            }
            if (currentPage != "group" || getParam("group") != data.post.GroupID) {
              return;
            }
          } else if (currentPage != "home") {
            return;
          }
          let postHolder = findC("postHolder");
          if (postHolder == null) {
            return;
          }
          if (postHolder.firstChild != null && postHolder.firstChild.getAttribute("time") != null) {
            if (parseInt(postHolder.firstChild.getAttribute("time")) >= data.post.Timestamp) {
              return;
            }
          }
          let refreshPosts = findI("refreshPosts");
          if (refreshPosts == null) {
            refreshPosts = createElement("stickyContainer", "div", postHolder);
            refreshPosts.id = "refreshPosts";
            newPostCount = 0;
          }
          if (currentPage == "group") {
            refreshPosts.style.top = "62px";
          }
          if (postHolder.firstChild != null) {
            postHolder.insertBefore(refreshPosts, postHolder.firstChild);
          }
          newPostCount += 1;
          let ending = "";
          if (newPostCount > 1) {
            ending = "s";
          }
          refreshPosts.innerHTML = "Show <b>" + newPostCount + "</b> Post" + ending;
          tempListen(refreshPosts, "click", function() {
            if (currentPage != "group") {
              setPage("home");
            } else if (window.refreshPostsFunction != null) {
              window.refreshPostsFunction();
            } else {
              setPage("group");
            }
          });
          break;
        case "join":
          groups[data.data._id] = data.data;
          let groupDisplayHolder = findC("groupsHolder-groups");
          if (groupDisplayHolder != null) {
            let thisGroup = createElement("groupSection", "div", pageHolder);
            thisGroup.innerHTML = `${data.data.Icon != null ? `<img src="${assetURL}GroupImages/${data.data.Icon}" class="groupIcon">` : ""}<div class="groupInfo"><div class="groupName">${data.data.Name}</div></div>`;
            thisGroup.id = data.data._id;
            thisGroup.setAttribute("type", "viewgroup");
            if (groupDisplayHolder.firstChild != null) {
              groupDisplayHolder.insertBefore(thisGroup, groupDisplayHolder.firstChild);
            }
          }
          break;
        case "group":
          let group = groups[data.data._id];
          if (group == null) {
            return;
          }
          let keys = Object.keys(data.data);
          for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            group[key] = data.data[key];
          }
          if (currentPage == "group" && getParam("group") == data.data._id) {
            refreshPage();
          }
          break;
        case "leave":
          let groupRem = groups[data.groupID];
          if (groupRem != null) {
            delete groups[data.groupID];
          }
          let groupElem = findI(data.groupID);
          if (groupElem != null) {
            groupElem.remove();
          }
          if (currentPage == "group" && getParam("group") == data.groupID) {
            setPage("groups");
          }
      }
    });
  }
}

let postUpdate;
function setPostUpdateSub() {
  let loadedPosts = [];
  let postElements = document.getElementsByClassName("post");
  for (let i = 0; i < postElements.length; i++) {
    loadedPosts.push(postElements[i].id);
  }
  let query = { task: "post", _id: loadedPosts };
  if (postUpdate != null) {
    postUpdate.edit(query);
  } else {
    postUpdate = socket.subscribe(query, function(data) {
      let post = findI(data._id);
      if (post == null) {
        return;
      }
      switch (data.type) {
        case "like":
          // data.userID - userID
          // data.change - Like Change (1, -1)
          let button = post.querySelector(".postButton[type='like']");
          let likeAmount = button.parentElement.lastChild;
          if (data.userID == userID) {
            let icon = button.querySelector("svg").querySelector("path");
            if (data.change == 1) {
              if (button.hasAttribute("isLiked") == true) {
                return;
              }
              button.setAttribute("isLiked", "true");
              button.parentElement.style.color = "#FF5786";
              icon.setAttribute("fill", "#FF5786");
              icon.setAttribute("stroke", "#FF5786");
            } else if (data.change == -1) {
              if (button.hasAttribute("isLiked") == false) {
                return;
              }
              button.removeAttribute("isLiked");
              button.parentElement.style.removeProperty("color");
              icon.removeAttribute("fill");
              icon.setAttribute("stroke", "#999");
            }
          }
          likeAmount.textContent = parseInt(likeAmount.textContent) + data.change;
          break;
        case "delete":
          post.remove();
          break;
        case "edit":
          console.log(post);
      }
    });
  }
}

function decideProfilePic(data) {
  let ending = "DefaultProfilePic";
  if (data != null && data.Settings != null && data.Settings.ProfilePic != null) {
    ending = data.Settings.ProfilePic;
  }
  return assetURL + "ProfileImages/" + ending;
}

function updateDisplay(type) {
  switch (type) {
    case "Light":
      setCSSVar("--leftSidebarColor", "#E8E8E8");
      setCSSVar("--pageColor", "#E6E9EB");
      setCSSVar("--contentColor", "#DFDFE6");
      setCSSVar("--contentColor2", "#D9D9E4");
      setCSSVar("--contentColor3", "#D2D2E0");
      setCSSVar("--borderColor", "#D8D8D8");
      setCSSVar("--fontColor", "#000000");
      setCSSVar("--themeColor", "#5AB7FA");
      break;
    /*
    case "Pride":
      setCSSVar("--leftSidebarColor", "#262630");
      setCSSVar("--pageColor", "linear-gradient(to bottom, red, orange, yellow, green, blue, purple)");
      setCSSVar("--contentColor", "#EBEBEB");
      setCSSVar("--contentColor2", "#E3E3E3");
      setCSSVar("--contentColor3", "#D9D9D9");
      setCSSVar("--borderColor", "#323242");
      setCSSVar("--fontColor", "black");
      setCSSVar("--themeColor", "tomato");
      break;
      */
    case "Hacker":
      setCSSVar("--leftSidebarColor", "black");
      setCSSVar("--pageColor", "black");
      setCSSVar("--contentColor", "black");
      setCSSVar("--contentColor2", "black");
      setCSSVar("--contentColor3", "black");
      setCSSVar("--borderColor", "black");
      setCSSVar("--fontColor", "white");
      setCSSVar("--themeColor", "lime");
      break;
    case "Blood Moon":
      setCSSVar("--leftSidebarColor", "black");
      setCSSVar("--pageColor", "linear-gradient(to bottom, #5c0701, black)");
      setCSSVar("--contentColor", "#831100");
      setCSSVar("--contentColor2", "#942200");
      setCSSVar("--contentColor3", "#a52300");
      setCSSVar("--borderColor", "#861500");
      setCSSVar("--fontColor", "white");
      setCSSVar("--themeColor", "tomato");
      break;
    case "Under The Sea":
      setCSSVar("--leftSidebarColor", "black");
      setCSSVar("--pageColor", "linear-gradient(to bottom, #4ecbef, #0062fe)");
      setCSSVar("--contentColor", "#0056d6");
      setCSSVar("--contentColor2", "#0061fe");
      setCSSVar("--contentColor3", "#3a87fe");
      setCSSVar("--borderColor", "#2ea4fd");
      setCSSVar("--fontColor", "white");
      setCSSVar("--themeColor", "#52d6fc");
      break;
    default:
      setCSSVar("--leftSidebarColor", "#262630");
      setCSSVar("--pageColor", "#151617");
      setCSSVar("--contentColor", "#1f1f28");
      setCSSVar("--contentColor2", "#24242e");
      setCSSVar("--contentColor3", "#2a2a37");
      setCSSVar("--borderColor", "#323242");
      setCSSVar("--fontColor", "#ffffff");
      setCSSVar("--themeColor", "#5AB7FA");
      break;
  }
}
if (localStorage.getItem("display") != null) {
  account.Settings = { Display: JSON.parse(localStorage.getItem("display")) };
  updateDisplay(account.Settings.Display.Theme.replace(" Mode", ""));
}

async function auth() {
  let [code, response] = await sendRequest("GET", "me?ss=" + socket.secureID);
  if (code != 200) {
    return;
  }
  updateToSignedIn(response);
}

findI("logoutB").addEventListener("click", function() {
  showPopUp("Are You Sure?", "Are you sure you want to log out?", [["Logout", "var(--themeColor)", function() {
    sendRequest("PUT", "me/logout");
  }], ["Cancel", "var(--grayColor)"]]);
});

let showPopUp;
let showDropdown;
let showPreview;
let alreadyInit = false;
async function init() {
  if (localStorage.getItem("token") != null) {
    await auth();
  }
  if (alreadyInit == true) {
    return;
  }
  alreadyInit = true;

  showPopUp = await getModule("modal");
  showDropdown = await getModule("dropdown");
  showPreview = await getModule("profilepreview");

  if (userID != null) {
    if (getParam("post") != null) {
      showPost(getParam("post"));
    } else if (getParam("chat") != null) {
      showChat(null, getParam("chat"));
    } else if (getParam("user") != null) {
      setPage("profile");
    } else if (getParam("group") != null) {
      setPage("group");
    } else if (getParam("j") != null) {
      setPage("group");
    } else if (window.location.hash == "") {
      setPage("home");
    } else if (userID != null) {
      setPage(window.location.hash.substring(1));
    }
    updateProfileSub();
    setAccountSub("home");
    if (account.Settings != null && account.Settings.Display != null) {
      localStorage.setItem("display", JSON.stringify(account.Settings.Display));
    }
  } else {
    let sidebarButtonsChilds = sidebarButtons.children;
    for (let i = 0; i < sidebarButtonsChilds.length; i++) {
      if (sidebarButtonsChilds[i].innerText != "Home") {
        sidebarButtonsChilds[i].classList.add("hidden");
      }
    }
    if (getParam("post") != null) {
      showPost(getParam("post"));
    } else if (getParam("chat") != null) {
      showChat(null, getParam("chat"));
    } else if (getParam("user") != null) {
      setPage("profile");
    } else {
      setPage("home");
    }
    let signInUpBar = createElement("stickyContainer", "div", main);
    signInUpBar.id = "signInUpBar";
    signInUpBar.innerHTML = `
    <span class="signInUpText">Ready to Join the Hangout?</span>
    <button class="signUpButton">
      Sign Up
    </button>
    <button class="signInButton">
      Sign In
    </button>
    `;
    findC("signUpButton").addEventListener("click", function() {
      signUpModal();
    });
    findC("signInButton").addEventListener("click", function() {
      signInModal();
    });
    if (findC("pageHolder") != null) {
      main.insertBefore(signInUpBar, findC("pageHolder"));
    }
  }

  // FasLoad TM
  (await getModule("actions"))();
}

let signInPopUp;
async function signIn() {
  let [code, response] = await sendRequest("POST", "temp/signin?ss=" + socket.secureID, { username: findI("signInUsername").value, password: findI("signInPassword").value });
  if (code == 200) {
    if (findI("backBlur" + signInPopUp) != null) {
      findI("backBlur" + signInPopUp).remove();
    }
    updateToSignedIn(response);
  } else {
    showPopUp("Couldn't Sign In", response, [["Okay", "var(--grayColor)"]]);
  }
}
function signInModal(user) {
  signInPopUp = showPopUp("Sign In", `
  <input class="signInInput" id="signInUsername" placeholder="Username" value="${(user || "")}">
  <input class="signInInput" id="signInPassword" placeholder="Password" type="password">`, [["Sign In", "var(--signInColor)", signIn, true], ["Sign Up", "var(--signUpColor)", signUpModal], ["Close", "var(--grayColor)"]]);
  findI("signInUsername").focus();
}
let captchaKey = null;
async function signUpModal() {
  let signUpPopUp = showPopUp("Sign Up", `
  <input class="signInInput" id="signUpEmail" placeholder="Your Email" type="email">
  <input class="signInInput" id="signUpUsername" placeholder="Your Username">
  <input class="signInInput" id="signUpPassword" placeholder="Your Password" type="password">
  <div id="captchaHolder"></div>
  <div class="tosAgreeText">By clicking "Sign Up" you are agreeing to our <a href="https://app.photop.live/#tos" target="_blank">Terms of Use</a>, <a href="https://app.photop.live/#privacy" target="_blank">Privicy Policy</a>, and <a href="https://app.photop.live/#rules" target="_blank">Rules</a>.</div>
  `,
    [["Sign Up", "var(--signUpColor)", async function() {
      let email = findI("signUpEmail").value;
      let username = findI("signUpUsername").value;
      let password = findI("signUpPassword").value;

      const verifyEmailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (verifyEmailRegex.test(email) == false) {
        showPopUp("Invalid Email", "Emails must be... well, emails.", [["Okay", "var(--themeColor)"]]);
        return;
      }
      if (verifyUsername(username) == false) {
        showPopUp("Invalid Username", "Usernames must be 3-20 characters, and can only include letters, numbers, underscores, and dashes.", [["Okay", "var(--themeColor)"]]);
        return;
      }
      if (password.length < 8) {
        showPopUp("Invalid Password", "Passwords must be at least 8 characters long.", [["Okay", "var(--grayColor)"]]);
        return;
      }
      if (password.replace(/[^0-9]/g, "").length < 1) {
        showPopUp("Invalid Password", "Passwords must contain at least one number.", [["Okay", "var(--grayColor)"]]);
        return;
      }
      if ((/[ !@#$%^&*()+\-_=\[\]{};':"\\|,.<>\/?]/).test(password.toLowerCase()) == false) {
        showPopUp("Invalid Password", "Passwords must contain at least one symbol.", [["Okay", "var(--grayColor)"]]);
        return;
      }
      if (captchaKey == null) {
        showPopUp("Complete the Captcha", "You must verify that you're not a bot.", [["Okay", "var(--grayColor)"]]);
        return;
      }

      let [code, response] = await sendRequest("POST", "temp/signup?ss=" + socket.secureID, { email: email, username: username, password: password, captcha: captchaKey });
      if (code == 200) {
        findI("backBlur" + signUpPopUp).remove();
        updateToSignedIn(response);
      } else {
        showPopUp("Couldn't Sign Up", response, [["Okay", "var(--grayColor)"]]);
      }
    }, true], ["Sign In", "var(--signInColor)", signInModal], ["Close", "var(--grayColor)"]]);
  findI("signUpEmail").focus();
  await loadScript("https://hcaptcha.com/1/api.js");
  hcaptcha.render("captchaHolder", { sitekey: "1f803f5f-2da5-4f83-b2c6-d9a8e00ba2d3", theme: "dark", callback: "setCaptchaKey", "expired-callback": "setCaptchaExpired" });
}
function setCaptchaKey(key) {
  captchaKey = key;
}
function setCaptchaExpired() {
  if (typeof hcaptcha != "undefined") {
    captchaKey = null;
    hcaptcha.reset();
  }
}

function hasPremium() {
  if (account.Premium != null && Date.parse(new Date(getEpoch()).toISOString()) < Date.parse(account.Premium.Expires)) {
    if (!supportedImageTypes.includes("gif")) {
      supportedImageTypes.push("gif");
    }
    return true;
  }
  if (supportedImageTypes.includes("gif")) {
    supportedImageTypes.splice(supportedImageTypes.indexOf("gif"), 1);
  }
  return false;
}

async function updateToSignedIn(response) {
  let data = JSON.parse(response);
  account = data.user;
  groups = data.groups || {};
  userID = account._id;
  if (data.token != null) {
    // If function was called from signin/signup:
    localStorage.setItem("userID", data.user._id);
    localStorage.setItem("token", JSON.stringify(data.token));
    setPage("home");
    let sidebarButtonsChilds = sidebarButtons.children;
    for (let i = 0; i < sidebarButtonsChilds.length; i++) {
      sidebarButtonsChilds[i].classList.remove("hidden");
    }
    updateProfileSub();
    setAccountSub("home");
    let signInUpBar = findI("signInUpBar");
    if (signInUpBar != null) {
      signInUpBar.remove();
    }
  }
  findC("accountInfoPic").src = decideProfilePic(account);
  findC("accountInfoName").textContent = account.User;
  findI("accountInfo").style.display = "flex";
  account.Settings = account.Settings || {};
  account.Settings.Display = account.Settings.Display || {};
  account.Settings.Display.Theme = account.Settings.Display.Theme || "Dark Mode";
  updateDisplay(account.Settings.Display.Theme.replace(" Mode", ""));
  if (data.restored != null) {
    showPopUp("Account Restored!", "Your Photop account has been restored. <b>Welcome Back!</b>", [["Okay", "var(--grayColor)"]]);
  }
  findC("sidebarNotifHolder").innerHTML = "";
  let groupnotif = await getModule("groupnotif");
  let groupsArr = Object.keys(groups);
  for (let i = 0; i < groupsArr.length; i++) {
    let group = groups[groupsArr[i]];
    if (group.LastChecked < group.LastContent) {
      groupnotif({ ...group, _id: groupsArr[i] });
    }
  }
}

function timeSince(time, long) {
  let calcTimestamp = Math.floor((Date.now() - time) / 1000);
  if (calcTimestamp < 1) {
    calcTimestamp = 1;
  }
  let amountDivide = 1;
  let end = (long ? 'Second' : 's');
  if (calcTimestamp > 31536000 - 1) {
    amountDivide = 31536000;
    end = (long ? 'Year' : 'y');
  } else if (calcTimestamp > 2592000 - 1) {
    amountDivide = 2592000;
    end = (long ? 'Month' : 'mo');
  } else if (calcTimestamp > 604800 - 1) {
    amountDivide = 604800;
    end = (long ? 'Week' : 'w');
  } else if (calcTimestamp > 86400 - 1) {
    amountDivide = 86400;
    end = (long ? 'Day' : 'd');
  } else if (calcTimestamp > 3600 - 1) {
    amountDivide = 3600;
    end = (long ? 'Hour' : 'h');
  } else if (calcTimestamp > 60 - 1) {
    amountDivide = 60;
    end = (long ? 'Minute' : 'm');
  }
  let timeToSet = Math.floor(calcTimestamp / amountDivide);
  if (timeToSet > 1 && long) {
    end += 's';
  }
  if (long == true) {
    return timeToSet + " " + end + " Ago";
  } else {
    return timeToSet + end;
  }
}

sidebarButtons.addEventListener("click", function(e) {
  let path = e.path || (e.composedPath && e.composedPath());
  let button = path[0].closest(".sidebarButton");
  if (button != null) {
    if (button.innerText == "Post") {
      if (currentPage != "home") {
        setPage("home")
      }
      findI("newPostArea").focus();
    } else {
      if (button.innerText == "Profile") {
        modifyParams("user", userID);
      }
      setPage(button.innerText.toLowerCase());
    }
  }
});

let bb = function(isPost) {
  let o7 = this;
  let token_match = /{[A-Z_]+[0-9]*}/ig;
  let tokens = {
    'URL': '((?:(?:[a-z][a-z\\d+\\-.]*:\\/{2}(?:(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+|[0-9.]+|\\[[a-z0-9.]+:[a-z0-9.]+:[a-z0-9.:]+\\])(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)|(?:www\\.(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)))',
    'TEXT': '(.*?)',
    'SIMPLETEXT': '[a-zA-Z0-9-_ ]\b',
    'HEX': '([0-9abcdef]+)',
  };
  let hddmatches = [];
  let hdtpls = [];
  let hdmatches = [];
  let hddtpls = [];
  let odRegEx = function(str) {
    let matches = str.match(token_match);
    let nrmatches = matches.length;
    let i = 0;
    let replacement = '';
    if (nrmatches <= 0) {
      return new RegExp(preg_quote(str), 'g');
    }
    for (; i < nrmatches; i += 1) {
      let token = matches[i].replace(/[{}0-9]/g, '');
      if (tokens[token]) {
        replacement += preg_quote(str.substr(0, str.indexOf(matches[i]))) + tokens[token];
        str = str.substr(str.indexOf(matches[i]) + matches[i].length);
      }
    }
    replacement += preg_quote(str);
    return new RegExp(replacement, 'gi');
  };
  let odTpls = function(str) {
    let matches = str.match(token_match);
    let nrmatches = matches.length;
    let i = 0;
    let replacement = '';
    let positions = {};
    let next_position = 0;

    if (nrmatches <= 0) {
      return str;
    }
    for (; i < nrmatches; i += 1) {
      let token = matches[i].replace(/[{}0-9]/g, '');
      let position;
      if (positions[matches[i]]) {
        position = positions[matches[i]];
      } else {
        next_position += 1;
        position = next_position;
        positions[matches[i]] = position;
      }
      if (tokens[token]) {
        replacement += str.substr(0, str.indexOf(matches[i])) + '$' + position;
        str = str.substr(str.indexOf(matches[i]) + matches[i].length);
      }
    }
    replacement += str;
    return replacement;
  };
  o7.ad = function(hddmatch, hddtpl) {
    hddmatches.push(odRegEx(hddmatch));
    hdtpls.push(odTpls(hddtpl));
    hdmatches.push(odRegEx(hddtpl));
    hddtpls.push(odTpls(hddmatch));
  };
  o7.bbh = function(str) {
    let nrbbcmatches = hddmatches.length;
    let i = 0;
    for (; i < nrbbcmatches; i += 1) {
      str = str.replace(hddmatches[i], hdtpls[i]);
    }
    return str;
  };
  function preg_quote(str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
  }
  o7.ad('(!{TEXT})', '<b>{TEXT}</b>');
  o7.ad('(*{TEXT})', '<i>{TEXT}</i>');
  o7.ad('(_{TEXT})', '<u>{TEXT}</u>');
  o7.ad('(-{TEXT})', '<strike>{TEXT}</strike>');
  o7.ad('(`{TEXT})', '<span style="font-family: monospace;">{TEXT}</span>');
  o7.ad('(^{TEXT})', '<sup>{TEXT}</sup>');
  o7.ad('{URL}', '<a href="{URL}" target="_blank" class="link" title="{URL}">{URL}</a>');
  o7.ad('https://app.photop.live?gift={HEX}', '<span class="gift-link">https://app.photop.live?gift={HEX}</span>');
  o7.ad('@{HEX}({TEXT}) ', '<span type="user" userid="{HEX}" class="mention" tabindex="0">@{TEXT}</span> ');
  o7.ad('@{HEX}({TEXT})\n', '<span type="user" userid="{HEX}" class="mention" tabindex="0">@{TEXT}</span>\n');
  o7.ad('/Post_{HEX} ', '<span type="postlink" postid="{HEX}" class="post-embed" tabindex="0">/Post_{HEX}</span> ');
  o7.ad('/Post_{HEX}\n', '<span type="postlink" postid="{HEX}" class="post-embed" tabindex="0">/Post_{HEX}</span>\n');
  o7.ad('/Chat_{HEX} ', '<span type="chatlink" chatid="{HEX}" class="chat-embed" tabindex="0">/Chat_{HEX}</span> ');
  o7.ad('/Chat_{HEX}\n', '<span type="chatlink" chatid="{HEX}" class="chat-embed" tabindex="0">/Chat_{HEX}</span>\n');
  //o7.ad('#{TEXT} ', '<span type="hashtag" hashtag="{TEXT}" class="hashtag" tabindex="0">#{TEXT}</span> ');
  //o7.ad('#{TEXT}\n', '<span type="hashtag" hashtag="{TEXT}" class="hashtag" tabindex="0">#{TEXT}</span>\n');
};
let fe = new bb(false);
let newPostRender = new bb(true);
function formatText(str) {
  let formatted = fe.bbh(cleanString(str) + "\n) ");
  if (formatted.endsWith(") ") == true) {
    formatted = formatted.substring(0, formatted.length - 3);
  } else {
    formatted = formatted.substring(0, formatted.length - 2);
  }
  return formatted;
}

function cleanString(str) {
  return str.replace(/\>/g, "&#62;").replace(/\</g, "&#60;");
}

let formating = {
  "http://": '<span type="link" class="link">{TEXT}</span>',
  "https://": '<span type="link" class="link">{TEXT}</span>',
  "www.": '<span type="link" class="link">{TEXT}</span>',

  "@": '<span type="mention" class="mention">{TEXT}</span>',
  "/Post_": '<span type="post" class="post-embed">{TEXT}</span>',
  "/Chat_": '<span type="chat" class="chat-embed">{TEXT}</span>',
  "/User_": '<span type="user" class="user-embed">{TEXT}</span>',

  "(!": "<b>{TEXT}</b>",
  "(*": "<i>{TEXT}</i>",
  "(_": "<u>{TEXT}</u>",
  "(-": "<strike>{TEXT}</strike>",
  "(`": '<span style="font-family: monospace;">{TEXT}</span>',
  "(^": "<sup>{TEXT}</sup>"
}
let formatingKeys = Object.keys(formating);
function postCreateFormat(text) {
  let hasFormating = false;
  for (let i = 0; i < formatingKeys.length; i++) {
    let key = formatingKeys[i];
    let start = -1;
    while (true) {
      start = text.indexOf(key, start);
      if (text[start - 1] == ">") { // Must be inside SPAN
        start += 1;
      } else {
        break;
      }
    }
    if (start > -1) {
      // Does have formating:
      hasFormating = true;
      let end = text.length - 1;
      let parenEnd = text.indexOf(")", start);
      if (parenEnd > -1 && parenEnd < end) {
        end = parenEnd;
      }
      if (key[0] != "(") {
        let spaceEnd = text.indexOf(" ", start);
        if (spaceEnd > -1 && spaceEnd < end) {
          end = spaceEnd;
        }
        spaceEnd = text.indexOf("\u00A0", start);
        if (spaceEnd > -1 && spaceEnd < end) {
          end = spaceEnd;
        }
      } else {
        end++;
      }
      let data = formating[key];
      let replaceWith = data.replace(/{TEXT}/g, text.substring(start, end));
      //text = text.substring(0, start) + data.replace(/{TEXT}/g, "#" + text.substring(start + 1, end)) + text.substring(end);
      text = text.substring(0, start) + replaceWith + text.substring(end);
    }
  }
  if (hasFormating == true) {
    return postCreateFormat(text);
  } else {
    return text.replace(/\n/g, "</br>");
  }
}
function preFormat(text) {
  let result = postCreateFormat(cleanString(text) + " ");
  return result.substring(0, result.length - 1);
}

/* Maintain Cursor Position */
function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange()
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (let lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);
        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
};
function setCurrentCursorPosition(element, chars) {
  let selection = window.getSelection();
  let range = null;
  if (chars == "END") {
    range = createRange(element.lastChild);
  } else {
    range = createRange(element, { count: chars });
  }
  if (range != null) {
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
function getCurrentCursorPosition(element) {
  let position = 0;
  const isSupported = typeof window.getSelection !== "undefined";
  if (isSupported) {
    const selection = window.getSelection();
    if (selection.rangeCount !== 0) {
      const range = window.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      position = preCaretRange.toString().length;
      if (preCaretRange.endContainer.textContent == "") {
        position = "END";
      }
    }
  }
  return position;
}

async function showPost(postID, noAnim) {
  if (postID == null) {
    showPopUp("Post Not Found", "That post wasn't found! It may have been removed or never sent at all.", [["Okay", "var(--grayColor)"]]);
  }
  let post = findI(postID);
  if (post == null) {
    let data = postID;
    if (noAnim != null) {
      data += "," + noAnim.toString();
    }
    modifyParams("post", data);
    await setPage("viewpost");
  } else {
    /*
    window.scrollTo({
      top: post.offsetTop + (post.scrollTop || document.documentElement.scrollTop) + post.clientTop - 8,
      behavior: "smooth"
    });
    */
    if (noAnim != true) {
      post.style.backgroundColor = "#C95EFF";
    }
    post.scrollIntoView();
    setPostUpdateSub();
    setupPostChats();
    await sleep(1000);
    post.style.backgroundColor = "";
  }
}

let activePostListeners = {};
async function showChat(postID, chatID) {
  if (chatID == null) {
    showPopUp("Chat Not Found", "That chat wasn't found! It may have been removed or never sent at all.", [["Back", "var(--grayColor)"]]);
  }
  async function runAnim(chat, noAnim) {
    chat.style.backgroundColor = "#2AF5B5";
    let scrollData = {
      top: chat.offsetTop - 42
    };
    if (noAnim != true) {
      scrollData.behavior = "smooth";
    }
    chat.parentElement.parentElement.scrollTo(scrollData);
    await sleep(1000);
    chat.style.backgroundColor = "";
  }
  function checkIfFound(noAnim) {
    let chat = findI(chatID);
    if (chat != null) {
      runAnim(chat, noAnim);
      return true;
    }
    return false;
  }
  if (checkIfFound() == true) {
    return;
  }

  let renderChat = await getModule("chat");

  let [code, response] = await sendRequest("GET", "chats?chatid=" + chatID);
  if (code == 200) {
    let data = JSON.parse(response);
    let chat = data.chats[0];
    if (chat == null) {
      showPopUp("Chat Not Found", "That chat wasn't found! It may have been removed or never sent at all.", [["Back", "var(--grayColor)"]]);
      return;
    }
    let post = findI(postID);
    if (post == null) {
      postID = chat.PostID;
      await showPost(postID, true);
    } else {
      post.scrollIntoView();
    }
    post = findI(postID);
    if (post == null) {
      return;
    }
    post.setAttribute("loading", "");
    if (post.querySelector(".chatHolder") != null) {
      detatchListeners(post);
      post.removeAttribute("allUpChatsLoaded");
      post.removeAttribute("allDownChatsLoaded");
      post.querySelector(".chatHolder").remove();
      if (post.querySelector(".scrollToBottom") != null) {
        post.querySelector(".scrollToBottom").remove()
      }
    }
    attachListeners(post);
    createElement("chatHolder", "div", post.querySelector(".postChatHolder"));
    let replyAdd = post.querySelector(".postChatReply");
    if (replyAdd != null) {
      replyAdd.remove();
    }
    let [code2, response2] = await sendRequest("GET", "chats?postid=" + postID + "&before=" + chat.Timestamp);
    if (code2 == 200) {
      let beforeData = JSON.parse(response2);
      let [code3, response3] = await sendRequest("GET", "chats?postid=" + postID + "&after=" + chat.Timestamp);
      if (code3 == 200) {
        let afterData = JSON.parse(response3);
        let allChats = beforeData.chats.reverse().concat(data.chats, afterData.chats);
        let users = getObject(afterData.users.concat(data.users, beforeData.users), "_id");
        let replies = getObject(afterData.replies.concat(data.replies, beforeData.replies), "_id");
        for (let i = 0; i < allChats.length; i++) {
          let chat = allChats[i];
          let reply = replies[chat.ReplyID];
          if (reply != null) {
            reply.user = users[reply.UserID];
          }
          renderChat(post.querySelector(".chatHolder"), chat, users[chat.UserID], reply);
        }
        if (beforeData.chats.length < 20) {
          post.setAttribute("allUpChatsLoaded", "");
        }
        if (afterData.chats.length < 20) {
          post.setAttribute("allDownChatsLoaded", "");
        } else {
          createScrollToBottom(post);
        }
        post.removeAttribute("loading");
        post.querySelector(".loadingChatsInfo").style.display = "none";
      }
    }
    checkIfFound(true);
  } else {
    showPopUp("Chat Not Found", "That chat wasn't found! It may have been removed or never sent at all.", [["Back", "var(--grayColor)"]]);
  }
}
function createScrollToBottom(post) {
  let scrollToBottom = createElement("scrollToBottom", "div", post.querySelector(".postChatNew"));
  scrollToBottom.setAttribute("title", "Scroll To Bottom");
  scrollToBottom.innerHTML = "&#9660;";
  scrollToBottom.addEventListener("click", function(e) {
    let post = e.target.closest(".post");
    if (post == null) {
      return;
    }
    if (post.hasAttribute("allDownChatsLoaded") == true) {
      post.querySelector(".postChatHolder").scrollTo({
        top: post.querySelector(".postChatHolder").scrollHeight,
        behavior: "smooth"
      });
    } else {
      detatchListeners(post);
      post.removeAttribute("allUpChatsLoaded");
      post.removeAttribute("allDownChatsLoaded");
      post.querySelector(".chatHolder").remove();
      setupPostChats();
    }
    post.querySelector(".scrollToBottom").remove();
  });
}
async function attachListeners(post) {
  let renderChat = await getModule("chat");

  let postChatHolder = post.querySelector(".postChatHolder");
  let chatHolder = postChatHolder.querySelector(".chatHolder");
  async function handleChatScroll() {
    if (post.hasAttribute("loading") == true) {
      return;
    }
    if (postChatHolder != null) {
      if (postChatHolder.scrollTop + postChatHolder.clientHeight + 1000 < postChatHolder.scrollHeight) {
        if (post.querySelector(".scrollToBottom") == null) {
          createScrollToBottom(post);
        }
      } else if (post.querySelector(".scrollToBottom") != null && post.hasAttribute("allDownChatsLoaded") == true) {
        post.querySelector(".scrollToBottom").remove()
      }
      if (post.hasAttribute("allUpChatsLoaded") == false && postChatHolder.scrollTop < 200 && chatHolder.childElementCount > 24) {
        // Load more chats:
        post.setAttribute("loading", "");
        let groupIDAddOn = "";
        let groupID = getParam("group");
        if (groupID != null) {
          groupIDAddOn += "&groupid=" + groupID;
        }
        let [code, response] = await sendRequest("GET", "chats?postid=" + post.id + "&before=" + chatHolder.firstChild.getAttribute("time") + groupIDAddOn);
        if (code == 200) {
          let data = JSON.parse(response);
          let chats = data.chats;
          let replies = getObject(data.replies, "_id");
          let users = getObject(data.users, "_id");
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            let reply = replies[chat.ReplyID];
            if (reply != null) {
              reply.user = users[reply.UserID];
            }
            renderChat(chatHolder, chat, users[chat.UserID], reply, false, { addTop: true });
          }
          if (chats.length < 25) {
            post.setAttribute("allUpChatsLoaded", "");
          }
          post.removeAttribute("loading");
        }
      } else if (post.hasAttribute("allDownChatsLoaded") == false && postChatHolder.scrollTop + postChatHolder.clientHeight + 200 > postChatHolder.scrollHeight && chatHolder.childElementCount > 24) {
        // Load more chats:
        post.setAttribute("loading", "");
        let groupIDAddOn = "";
        let groupID = getParam("group");
        if (groupID != null) {
          groupIDAddOn += "&groupid=" + groupID;
        }
        let [code, response] = await sendRequest("GET", "chats?postid=" + post.id + "&after=" + chatHolder.lastChild.getAttribute("time") + groupIDAddOn);
        if (code == 200) {
          let data = JSON.parse(response);
          let chats = data.chats;
          let replies = getObject(data.replies, "_id");
          let users = getObject(data.users, "_id");
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            let reply = replies[chat.ReplyID];
            if (reply != null) {
              reply.user = users[reply.UserID];
            }
            renderChat(chatHolder, chat, users[chat.UserID], reply);
          }
          if (chats.length < 25) {
            post.setAttribute("allDownChatsLoaded", "");
          }
          post.removeAttribute("loading");
        }
      }
    }
  }
  activePostListeners[post.id] = handleChatScroll;
  postChatHolder.addEventListener("scroll", handleChatScroll);
}
function detatchListeners(post) {
  post.querySelector(".postChatHolder").removeEventListener("scroll", activePostListeners[post.id]);
  delete activePostListeners[post.id];
}
async function setupPostChats() {
  let renderChat = await getModule("chat");

  let posts = pageHolder.querySelectorAll(".post");
  let connectPosts = [];
  let getChatsPost = [];
  let getChatting = [];
  for (let i = 0; i < posts.length; i++) {
    let post = posts[i];
    let rect = post.getBoundingClientRect();
    if ((rect.y) + (post.offsetHeight) > 0 && rect.y < (window.innerHeight || document.documentElement.clientHeight)) {
      connectPosts.push(post.id);
      if (post.querySelector(".chatHolder") == null) {
        createElement("chatHolder", "div", post.querySelector(".postChatHolder"));
        post.setAttribute("loading", "");
        attachListeners(post);
        getChatsPost.push(post.id);
        let replyAdd = post.querySelector(".postChatReply");
        if (replyAdd != null) {
          replyAdd.remove();
        }
      }
      let embedHolder = post.querySelector(".embedHolder");
      if (embedHolder != null && embedHolder.querySelector("iframe") == null) {
        embedHolder.innerHTML = "Loading..." + embedHolder.getAttribute("iframe");
        embedHolder.querySelector("iframe").src = embedHolder.getAttribute("iframeurl");
      }
    } else if (post.querySelector(".chatHolder") != null) {
      detatchListeners(post);
      post.removeAttribute("allUpChatsLoaded");
      post.removeAttribute("allDownChatsLoaded");
      post.removeAttribute("loading");
      post.querySelector(".chatHolder").remove();
      post.querySelector(".loadingChatMsg").textContent = "Loading Chats...";
      post.querySelector(".loadingChatsInfo").style.display = "flex";
      if (post.querySelector(".scrollToBottom") != null) {
        post.querySelector(".scrollToBottom").remove()
      }
      let embedHolder = post.querySelector(".embedHolder");
      if (embedHolder != null) {
        embedHolder.innerHTML = "Loading...";
      }
    }
    if (post.querySelector(".postChatChatting").textContent == "") {
      getChatting.push(post.id);
    }
  }
  if (getChatsPost.length < 1) {
    return;
  }
  let endpoint = "chats/connect";
  let groupID = getParam("group");
  if (groupID != null) {
    endpoint += "?groupid=" + groupID;
  }
  let [code, response] = await sendRequest("POST", endpoint, { ssid: socket.secureID, connect: connectPosts, posts: getChatsPost });
  if (code == 200) {
    let data = JSON.parse(response);
    let chats = data.chats.reverse();
    let replies = getObject(data.replies, "_id");
    let users = getObject(data.users, "_id");
    for (let i = 0; i < chats.length; i++) {
      let chat = chats[i];
      let parent = findI(chat.PostID);
      if (parent != null) {
        let reply = replies[chat.ReplyID];
        if (reply != null) {
          reply.user = users[reply.UserID];
        }
        renderChat(parent.querySelector(".chatHolder"), chat, users[chat.UserID], reply);
      }
    }
    for (let i = 0; i < getChatsPost.length; i++) {
      let post = findI(getChatsPost[i]);
      if (post != null) {
        post.removeAttribute("loading");
        post.setAttribute("allDownChatsLoaded", "");
        if (post.querySelector(".chatHolder").childElementCount > 0) {
          post.querySelector(".loadingChatsInfo").style.display = "none";
        } else {
          post.querySelector(".loadingChatMsg").textContent = "Start The Hangout?"
        }
        post.querySelector(".postChatHolder").scrollTo({
          top: post.querySelector(".postChatHolder").scrollHeight
        });
      }
    }
  }
}
async function updateChatting(posts) {
  if (posts.length > 0) {
    async function chattingThread() {
      let postIDs = posts.map(function(x) { return x._id });
      let [code2, response2] = await sendRequest("GET", "chats/chatting?postid=" + postIDs.join(","));
      if (code2 == 200) {
        let data = JSON.parse(response2);
        for (let i = 0; i < postIDs.length; i++) {
          let post = findI(postIDs[i]);
          if (post != null) {
            let chatting = data[i];
            post.querySelector(".postChatChatting").textContent = chatting + " Chatting";
            if (chatting > 0) {
              post.querySelector(".postChatLiveCircle").style.animation = "liveCircle 1s linear infinite";
            }
          }
        }
      }
    }
    chattingThread();
  }

  let foundEmbeds = pageHolder.querySelectorAll(".post-embed:not([embeding='']), .chat-embed:not([embeding='']), .link:not([embeding=''])");
  let requestEmbeds = [];
  let linkEmbeds = [];
  for (let i = 0; i < foundEmbeds.length; i++) {
    // Add to linkEmbeds if it's a non video/stream/gif embed
    let embed = foundEmbeds[i];
    if (embed.closest(".postContent") != null && embed.closest(".embed") == null) {
      switch (embed.getAttribute("type")) {
        case "postlink":
          requestEmbeds.push({ type: "post", value: embed.getAttribute("postid") });
          embed.setAttribute("embeding", "");
          break;
        case "chatlink":
          requestEmbeds.push({ type: "chat", value: embed.getAttribute("chatid") });
          embed.setAttribute("embeding", "");
          break;
        default:
          let link = embed.textContent.replace('"', "");
          let videoEmbed;
          let embedLink;
          account.Settings = account.Settings || {};
          account.Settings.Display = account.Settings.Display || { "Embed YouTube Videos": true, "Embed Twitch Streams": true };
          if ((link.startsWith("https://www.youtube.com/watch?v=") || link.startsWith("https://youtube.com/watch?v=")) && account.Settings.Display["Embed YouTube Videos"]) {
            videoEmbed = `<iframe class="iframeembed" allowfullscreen></iframe>`;
            embedLink = "https://youtube.com/embed/" + (new URLSearchParams(new URL(link).search)).get("v") + "?&autoplay=1&mute=1";
          } else if (link.startsWith("https://youtu.be") && account.Settings.Display["Embed YouTube Videos"]) {
            let urlData = new URL(link);
            let endSlash = urlData.pathname.indexOf("/", 1);
            if (endSlash < 0) {
              endSlash = urlData.pathname.length;
            }
            videoEmbed = `<iframe class="iframeembed" allowfullscreen></iframe>`;
            embedLink = "https://youtube.com/embed/" + urlData.pathname.substring(1, endSlash) + "?&autoplay=1&mute=1";
          } else if ((link.startsWith("https://twitch.tv/") || link.startsWith("https://www.twitch.tv/")) && account.Settings.Display["Embed Twitch Streams"]) {
            let urlData = new URL(link);
            let endSlash = urlData.pathname.indexOf("/", 1);
            if (endSlash < 0) {
              endSlash = urlData.pathname.length;
            }
            videoEmbed = `<iframe class="iframeembed" allowfullscreen></iframe>`;
            embedLink = "https://player.twitch.tv?channel=" + urlData.pathname.substring(1, endSlash) + "&parent=" + window.location.host + "&muted=true";
          } else if (link.endsWith(".gif") && account.Settings.Display["Embed GIFs"]) {
            videoEmbed = "";
            let embedHolder = createElement("embedMedia", "img", embed.parentElement.parentElement);
            embedHolder.src = exotekCDN + encodeURIComponent(link);
            embedHolder.setAttribute("type", "imageenlarge");
          }
          if (videoEmbed == null) {
            linkEmbeds.push({ type: "link", value: link });
          } else if (videoEmbed != "" && embed.parentElement.parentElement.querySelector(".embedHolder") == null) {
            let embedHolder = createElement("embedHolder", "div", embed.parentElement.parentElement);
            embedHolder.setAttribute("iframe", videoEmbed);
            embedHolder.setAttribute("iframeurl", embedLink);
            embedHolder.textContent = "Loading...";
          }
          embed.textContent = link.replace(/https:\/\/www./g, "").replace(/https:\/\//g, "").replace(/http:\/\//g, "");
          embed.setAttribute("embeding", "");
      }
    }
  }
  if (requestEmbeds.length > 0) {
    let [code, response] = await sendRequest("POST", "posts/embeds", requestEmbeds);
    if (code == 200) {
      let data = JSON.parse(response);
      let embeds = data.embeds;
      let users = getObject(data.users, "_id");
      for (let i = 0; i < foundEmbeds.length; i++) {
        let embed = foundEmbeds[i];
        let postContent = embed.closest(".postContent");
        if (postContent != null && embed.closest(".embed") == null) {
          let user;
          switch (embed.getAttribute("type")) {
            case "postlink":
              let post = embeds[embed.getAttribute("postid")];
              if (post == null) {
                continue;
              }
              user = users[post.UserID];
              let thisEmbed = createElement("embed", "div", postContent);
              thisEmbed.innerHTML = `<div class="embedUser"><img class="embedProfilePic"><div class="embedInfo"><div class="embedUsername"></div><div class="embedTimestamp"></div></div></div><div class="embedContent"><div class="embedText"></div></div>`;
              thisEmbed.querySelector(".embedUser").id = "post" + post._id + user._id;
              thisEmbed.querySelector(".embedProfilePic").src = decideProfilePic(user);
              thisEmbed.querySelector(".embedUsername").innerHTML = getRoleHTML(user) + user.User;
              thisEmbed.querySelector(".embedTimestamp").textContent = timeSince(post.Timestamp, true);
              thisEmbed.querySelector(".embedTimestamp").title = formatFullDate(post.Timestamp);
              thisEmbed.querySelector(".embedText").innerHTML = formatText(post.Text);
              thisEmbed.setAttribute("type", "postlink");
              thisEmbed.setAttribute("postid", post._id);
              if (post.Media != null && post.Media.ImageCount > 0) {
                let postImages = createElement("postImages", "div", thisEmbed.querySelector(".embedContent"));
                for (let i = 0; i < post.Media.ImageCount; i++) {
                  let image = createElement("postImage", "img", postImages);
                  image.src = assetURL + "PostImages/" + post._id + i;
                  image.setAttribute("type", "imageenlarge");
                  image.setAttribute("tabindex", 0);
                }
              }
              break;
            case "chatlink":
              let chat = embeds[embed.getAttribute("chatid")];
              if (chat == null) {
                continue;
              }
              user = users[chat.UserID];
              let thisChatEmbed = createElement("embed", "div", postContent);
              thisChatEmbed.style.fontSize = "13px";
              thisChatEmbed.style.display = "flex";
              thisChatEmbed.innerHTML = `<img class="chatPfp" style="border-radius: 6px"><div class="chatTextArea"><div class="chatAttr" style="font-size: 14px"><span class="chatUser" type="user"></span> <span class="chatTime"></span></div><span class="chatText" style="font-size: 13.5px"></span></div>`;
              thisChatEmbed.querySelector(".chatPfp").src = decideProfilePic(user);
              thisChatEmbed.querySelector(".chatUser").innerHTML = getRoleHTML(user) + user.User;
              thisChatEmbed.querySelector(".chatTime").title = formatFullDate(chat.Timestamp);
              thisChatEmbed.querySelector(".chatTime").textContent = timeSince(chat.Timestamp, false);
              thisChatEmbed.querySelector(".chatText").innerHTML = formatText(chat.Text);
              let thisChatOverlay = createElement("profileChatOverlay", "div", thisChatEmbed);
              thisChatOverlay.setAttribute("type", "chatlink");
              thisChatOverlay.setAttribute("chatid", chat._id);
          }
        }
      }
    }
  }
  if (linkEmbeds.length > 0) {
    let [codeLink, responseLink] = await sendRequest("POST", "posts/embeds", linkEmbeds);
    if (codeLink == 200) {
      let data = JSON.parse(responseLink);
      let foundLinkEmbeds = pageHolder.querySelectorAll(".link:not([rendered=''])");
      for (let i = 0; i < foundLinkEmbeds.length; i++) {
        let embed = foundLinkEmbeds[i];
        let postContent = embed.closest(".postContent");
        if (postContent != null && embed.closest(".embed") == null) {
          let siteData = data.embeds[embed.href] || data.embeds[embed.href.slice(0, -1)];
          if (siteData == null) {
            continue;
          }
          if (siteData.site != null) {
            embed.setAttribute("rendered", "");
            let thisSiteEmbed = createElement("linkEmbed", "div", postContent);
            let embedHTML = "";
            if (siteData.video != null && account.Settings.Display["Embed GIFs"]) {
              embedHTML += `<video class="embedVideo" loop autoplay></video>`;
            }
            if (siteData.image != null) {
              embedHTML += `<img class="embedImage" type="imageenlarge"></img>`;
            }
            embedHTML += `<div style="flex: 1"><div class="embedTitle"></div><div class="embedDesc"></div></div><a class="profileChatOverlay" target="_blank"></a>`;
            thisSiteEmbed.innerHTML = embedHTML;
            thisSiteEmbed.querySelector(".embedTitle").textContent = siteData.title || siteData.site || "";
            thisSiteEmbed.querySelector(".embedDesc").textContent = siteData.description || "";
            thisSiteEmbed.querySelector(".profileChatOverlay").setAttribute("href", embed.href);
            thisSiteEmbed.querySelector(".profileChatOverlay").setAttribute("title", embed.href);
            if (siteData.video != null && account.Settings.Display["Embed GIFs"]) {
              thisSiteEmbed.querySelector(".embedVideo").src = siteData.video;
            }
            if (siteData.image != null) {
              thisSiteEmbed.querySelector(".embedImage").src = siteData.image;
            }
          }
        }
      }
    }
  }
}
let scrollTimeout = null;
window.addEventListener("scroll", function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(setupPostChats, 200);
});

socket.remotes.stream = async function(data) {
  let renderChat = await getModule("chat");

  switch (data.type) {
    case "chat":
      let chat = data.chat;
      if (account.BlockedUsers != null && account.BlockedUsers.includes(chat.UserID) == true) {
        return;
      }
      let parent = findI(chat.PostID);
      if (parent != null) {
        if (parent.hasAttribute("allDownChatsLoaded") == false) {
          return;
        }
        parent.querySelector(".loadingChatsInfo").style.display = "none";
        parent.querySelector(".postChatLiveCircle").style.animation = "liveCircle 1s linear infinite";
        let users = getObject(data.users, "_id");
        if (chat.UserID == userID) {
          let sendingChats = parent.querySelectorAll("[sending='']");
          for (let i = 0; i < sendingChats.length; i++) {
            sendingChats[i].remove();
          }
        }
        if (data.reply != null) {
          data.reply.user = users[data.reply.UserID];
        }
        let postChatHolder = parent.querySelector(".postChatHolder");
        let chatHolder = postChatHolder.querySelector(".chatHolder");
        renderChat(chatHolder, chat, users[chat.UserID], data.reply);
        if (chatHolder.lastElementChild != null && (postChatHolder.scrollTop + postChatHolder.clientHeight + chatHolder.lastElementChild.clientHeight + 50 > postChatHolder.scrollHeight)) {
          let scrollToParams = { top: postChatHolder.scrollHeight };
          if (viewingTab == true) {
            scrollToParams.behavior = "smooth";
          }
          postChatHolder.scrollTo(scrollToParams);
        }
        let chatCount = parent.querySelector(".postChatCount");
        if (chatCount != null) {
          chatCount.innerText++;
        }
      }
      break;
    case "chatdelete":
      let delChat = findI(data.chatID);
      if (delChat == null) {
        return;
      }
      let oldChat = delChat.nextElementSibling;
      if (oldChat != null && oldChat.className == "minifyChat" && (delChat.previousElementSibling == null || delChat.previousElementSibling.getAttribute("userid") != delChat.getAttribute("userid"))) {
        let convertChat = createElement("chat", "div", delChat.parentElement);
        delChat.parentElement.insertBefore(convertChat, delChat);
        convertChat.id = oldChat.id;
        convertChat.setAttribute("type", "chat");
        convertChat.setAttribute("text", oldChat.getAttribute("text"));
        convertChat.setAttribute("userid", oldChat.getAttribute("userid"));
        convertChat.setAttribute("user", oldChat.getAttribute("user"));
        convertChat.setAttribute("time", oldChat.getAttribute("time"));
        let lastCheckChat = delChat;
        while (delChat.parentElement != null) {
          if (lastCheckChat != null && lastCheckChat.className == "chat") {
            break;
          }
          lastCheckChat = lastCheckChat.previousElementSibling;
        }
        convertChat.innerHTML = `<img class="chatPfp" type="user"><div class="chatTextArea"><div class="chatAttr"><span class="chatUser" type="user"></span> <span class="chatTime"></span></div><span class="chatText"></span></div>`;
        convertChat.querySelector(".chatPfp").src = lastCheckChat.querySelector(".chatPfp").src;
        convertChat.querySelector(".chatUser").innerHTML = lastCheckChat.querySelector(".chatUser").innerHTML; // Used to get entire thing including roles.
        convertChat.querySelector(".chatTime").title = formatFullDate(parseInt(oldChat.getAttribute("time")));
        convertChat.querySelector(".chatTime").textContent = oldChat.querySelector(".chatMinfiyTime").textContent;
        convertChat.querySelector(".chatText").innerHTML = oldChat.querySelector(".chatMinfiyText").innerHTML;
        oldChat.remove();
      }
      if (delChat.parentElement.childElementCount == 1) {
        delChat.parentElement.parentElement.querySelector(".loadingChatsInfo").style.display = "flex";
        delChat.parentElement.parentElement.querySelector(".loadingChatMsg").textContent = "Start The Hangout?"
      }
      let chatCount = delChat.closest(".post").querySelector(".postChatCount");
      if (chatCount != null) {
        chatCount.innerText--;
      }
      delChat.remove();
      break;
    case "chatedit":
      // console.log(data)
      let chatElement = findI(data.chatID);
      console.log(chatElement);
      if (chatElement) {
        let spanChildren = chatElement.querySelectorAll("span");
        let text = spanChildren[spanChildren.length - 1];
        text.innerText = data.text
      }
      break;
  }
}

let roleTypes = {
  // Role colors are determined by selecting one prominent color from the Google version of the emoji mixed with #505068.
  "Owner": ["👑", { CanDeletePosts: true, CanDeleteChats: true, CanBanUsers: true, CanUnbanUser: true }, "#A88D48"],
  "Moderator": ["🛡️", { CanDeletePosts: true, CanDeleteChats: true, CanBanUsers: true }, "#3F6479"],
  "Developer": ["👨‍💻", {}, "#63A835"],
  "Contributor": ["🔧", {}, "#697F94"],
  "Bug Hunter": ["🐛", {}, "#849040"],
  "Verified": ["📢", {}, "#A2494F"],
  "Partner": ["📷", {}, "#395568"],
  "Tester": ["🧪", {}, "#288887"],
  "Premium": ["🌟", {}, "#A8A87B"]
};
let roleKeyTypes = Object.keys(roleTypes);
function setUsernameRole(textHolder, userData, fontSize, limitSingleBadge) {
  if (textHolder == null) {
    return;
  }
  let fullString = "";
  if (userData.Role != null) {
    let roles = userData.Role;
    if (Array.isArray(roles) == false) {
      roles = [roles];
    }
    console.log(userData)
    if (userData.Premium != null) {
      roles.push("Premium");
    }
    if (fontSize != null) {
      fullString += "<div style='display: flex; align-items: center; white-space: pre'>";
    }
    if (fontSize == null || limitSingleBadge == true) {
      roles = [roles[0]];
    }
    for (let i = 0; i < roles.length; i++) {
      let RoleName = roles[i];
      let AddRole = roleTypes[RoleName];
      if (AddRole != null) {
        let SetString = "";
        //let RoleIconURL = "./Images/RoleIcons/" + RoleName + ".png";
        if (fontSize == null) {
          //FontSize = getCSS(TextHolder, "font-size").replace(/px/g, "");
          //SetString = "<span style='height: " + (FontSize-4) + "px; padding: 0px 2px 0px 2px; margin-right: 3px; border-radius: 6px; content: url(" + RoleIconURL + ")' title='" + RoleName + "'></span>";
          SetString = "<span style='background-color: #505068; padding: 0px 2px 0px 2px; margin-right: 6px; border-radius: 6px' title='" + RoleName + "'>" + AddRole[0] + "</span>";
        } else {
          SetString = "<span style='background-color: #505068; padding: 0px 2px 0px 2px; margin-right: 6px; border-radius: 6px; font-size: " + fontSize + "' title='" + RoleName + "'>" + AddRole[0] + "</span>";
        }
        fullString += SetString;
      }
    }
  }
  fullString += userData.User;
  if (fontSize != null) {
    fullString += "</div>";
  }
  textHolder.innerHTML = fullString;
}
function getRoleHTML(roleUser, max) {
  let roleHTML = "";
  if (roleUser.Role != null) {
    let maxRoles = (max || 1);
    let roles = roleUser.Role;
    if (Array.isArray(roles) == false) {
      roles = [roles];
    }
    roles = [...roles];
    if (roleUser.Premium != null && Date.parse(new Date(getEpoch()).toISOString()) < Date.parse(roleUser.Premium.Expires)) {
      roles.push("Premium");
    }
    for (let i = 0; i < Math.min(roles.length, maxRoles); i++) {
      roleHTML += `<span class="roleEmoji" style="background: linear-gradient(315deg, #505068, ${roleTypes[roles[i]][2]})" title="${roles[i]}">${roleTypes[roles[i]][0]}</span> `;
      /*
      roleHTML += `<span class="roleEmoji" title="${roles[i]}"><img src = "../Images/RoleIcons/${roles[i]
        }.png" class = "profileRole"></span> `;
      */
    }
  }
  return roleHTML;
}
function checkPermision(roles, permision) {
  if (roles != null && permision != null) {
    let permisions = {};
    if (Array.isArray(roles) == true) {
      for (let i = 0; i < roles.length; i++) {
        let roleData = roleTypes[roles[i]];
        if (roleData != null) {
          roleData = roleData[1];
          let keys = Object.keys(roleData);
          for (let p = 0; p < keys.length; p++) {
            if (permisions[keys[p]] == null || permisions[keys[p]] == false) {
              permisions[keys[p]] = roleData[keys[p]];
            }
          }
        }
      }
    } else {
      permisions = roleTypes[roles][1];
    }
    return permisions[permision] == true;
  }
  return false;
}

function promptLogin(desc) {
  showPopUp("It's Better Together", desc, [["Sign Up", "var(--signUpColor)", function() { signUpModal() }], ["Sign In", "var(--signInColor)", function() { signInModal() }], ["Later", "var(--grayColor)"]]);
}

let socialLinkData = {
  twitter: ["Twitter", "#1DA1F2", "https://twitter.com/USERNAME_GOES_HERE"],
  youtube: ["YouTube", "#FF0000", "https://www.youtube.com/channel/USERID_GOES_HERE"],
  twitch: ["Twitch", "#6441A4", "https://www.twitch.tv/USERNAME_GOES_HERE"],
  discord: ["Discord", "#5865F2", "PROMPT_USERNAME"],
  instagram: ["Instagram", "#E1306C", "https://www.instagram.com/USERNAME_GOES_HERE"],
  reddit: ["Reddit", "#FF4500", "https://www.reddit.com/user/USERNAME_GOES_HERE", "u/"],
  //facebook: ["Facebook", "#4267B2", "https://www.facebook.com/search/top?q=USERNAME_GOES_HERE"],
  pinterest: ["Pinterest", "#E60023", "https://www.pinterest.com/USERNAME_GOES_HERE"],
  tiktok: ["TikTok", "#FF0050", "https://www.tiktok.com/@USERNAME_GOES_HERE"],
  //xbox: ["Xbox", "#107C10", "OAUTH_URL_HERE"],
  github: ["GitHub", "#4078C0", "https://github.com/USERNAME_GOES_HERE"]
};

window.addEventListener("keypress", function(e) {
  if (e.key == "Enter") {
    if (e.target.className == "postChatInput") {
      e.target.parentElement.querySelector(".postChatButton").click();
      e.preventDefault();
    } else if (e.target.id == "signInPassword") {
      signIn();
    } else if (e.target.id == "signInUsername") {
      findI("signInPassword").focus();
    }
  }
});
function abbr(num) {
  let x;
  if (num >= 100000000000) {
    return Math.floor(num / 1000000000) + "B";
  } else if (num >= 10000000000) {
    x = Math.floor((num / 1000000000) * 10) / 10;
    return x.toPrecision(3) + "B";
  } else if (num >= 1000000000) {
    x = Math.floor((num / 1000000000) * 100) / 100;
    return x.toPrecision(3) + "B";
  } else if (num >= 100000000) {
    return Math.floor(num / 1000000) + "M";
  } else if (num >= 10000000) {
    x = Math.floor((num / 1000000) * 10) / 10;
    return x.toPrecision(3) + "M";
  } else if (num >= 1000000) {
    x = Math.floor((num / 1000000) * 100) / 100;
    return x.toPrecision(3) + "M";
  } else if (num >= 100000) {
    return Math.floor(num / 1000) + "K";
  } else if (num >= 10000) {
    x = Math.floor((num / 1000) * 10) / 10;
    return x.toPrecision(3) + "K";
  } else if (num >= 1000) {
    x = Math.floor((num / 1000) * 100) / 100;
    return x.toPrecision(3) + "K";
  } else {
    return num;
  }
}

function createTooltip(parent, text) {
  let tooltip = createElement("tooltip", "div", parent);
  tooltip.textContent = text;
}

function blockUser(id, name) {
  showPopUp(`Block ${name}?`, `Blocking ${name} will prevent you from seeing their content. It won't prevent ${name} from seeing yours.`, [["Block", "#FF8652", async function() {
    let [code, response] = await sendRequest("PUT", "user/block?userid=" + id);
    if (code != 200) {
      showPopUp("An Error Occured", response, [["Okay", "var(--grayColor)"]]);
    } else {
      setPage("home");
    }
  }], ["Wait, no", "var(--grayColor)"]]);
}

function reportContent(id, name, type) {
  let reportReasons = ["Inappropriate Content", "Inappropriate Username", "Threats or Endangerment", "Hate Speech, Harassment, or Abuse", "Evading Bans, Mutes, or Blocks", "Spamming", "Spreading Rumors or False Information", "Posting Malicious Content or Links", "May be Inflicting Physical Harm", "Other"];
  let popUpCode = showPopUp("Report Content", `Please select a reason why <b>${name}</b> is breaking the rules.`, [["Report", "#FFCB70", async function() {
    let selectedReason = popUpText.querySelector('input[name="report"]:checked');
    if (selectedReason == null) {
      showPopUp("Nothing Selected", "Please select why this user is breaking the rules.", [["Okay", "var(--grayColor)"]]);
      return;
    }
    findI("backBlur" + popUpCode).remove();
    selectedReason = selectedReason.value;
    let inputtedReason = popUpText.querySelector("#reportContext").textContent;
    let popUpCode2 = showPopUp("Sending Report...", "Your report is being sent to the Photop moderators. Please wait...", null);
    if (inputtedReason.length > 200) {
      showPopUp("Report Context Too Long", "You can only enter 200 characters in the report context. Please try to make it a little more concise.", [["Okay", "var(--grayColor)"]])
    } else {
      let [code, response] = await sendRequest("PUT", "mod/report?type=" + type + "&contentid=" + id, { reason: selectedReason, report: inputtedReason });
      findI("backBlur" + popUpCode2).remove();
      if (code == 200) {
        showPopUp("Report Sent", `Your report was sent to the Photop Moderators. Thank you for helping to keep Photop safe. If you'd like, you can also <b>block</b> ${name} so their content will be hidden from you.`, [["Block", "#FF8652", async function() {
          let [code2, response2] = await sendRequest("GET", "user?name=" + name);
          if (code2 == 200) {
            let data2 = JSON.parse(response2);
            blockUser(response2._id, name);
          }
        }], ["Okay", "var(--grayColor)"]]);
      } else {
        showPopUp("An Error Occured", response, [["Okay", "var(--grayColor)"]]);
      }
    }
  }, true], ["Wait, no", "var(--grayColor)"]]);
  let popUpText = findI("modalText" + popUpCode);
  //let reportSelector = createElement("reportSelect", "div", popUpText);
  for (let i = 0; i < reportReasons.length; i++) {
    popUpText.innerHTML += `<input type="radio" name="report" value="${reportReasons[i]}" id="${reportReasons[i].replace(/\s/g, "")}"><label for="${reportReasons[i].replace(/\s/g, "")}" class="radioLabel report">${reportReasons[i]}</label>`
  }
  popUpText.innerHTML += `<div class="reportContextTitle">Additional Context <i>(Optional):</i></div><div id="reportContext" contenteditable="true" placeholder="200 characters max." class="textArea"></div>`;
}
function formatDate(time) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let d = new Date(time);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

findI("settingsB").addEventListener("click", function() {
  setPage("settings");
});
function formatUsername(input) {
  return input.replace(/[^A-Za-z0-9_\-]/g, "").substring(0, 20);
}
function verifyUsername(input) {
  return ((formatUsername(input).length >= 3) && formatUsername(input) == input);
}
function setCSSVar(variable, newValue) {
  let root = document.documentElement;
  root.style.setProperty(variable, newValue);
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, '0');
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
function formatFullDate(time) {
  let date = new Date(time);
  let splitDate = date.toLocaleDateString().split("/");
  return weeks[date.getDay()] + ", " + monthes[splitDate[0] - 1] + " " + splitDate[1] + ", " + splitDate[2] + " at " + formatAMPM(date);
}

let viewingTab = true;
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState == "visible") {
    viewingTab = true;
  } else {
    viewingTab = false;
  }
});

let scrollingEnabled = true;
body.addEventListener("touchmove", function(e) {
  if (scrollingEnabled == false && e.target.closest(".postChat") == null) {
    e.preventDefault();
  }
}, { passive: false });

// MOBILE RESIZE
let isMobile = false;
function isTouchDevice() {
  return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}
if (isTouchDevice() == true && screen.width < 550 || getParam("embed") == "mobile") {
  if (getParam("embed") != "desktop") {
    isMobile = true;

    app.style.minWidth = "unset";
    let sidebar = findC("sidebar");
    sidebar.style.position = "fixed";
    sidebar.style.height = "100%";
    sidebar.style.left = "-200px";
    sidebar.style.top = "0px";
    sidebar.style.padding = "8px";
    sidebar.style.zIndex = "950";
    sidebar.style.transition = ".35s";

    let sidebarShowButton = createElement("sidebarShowButton", "div", sidebar);
    sidebarShowButton.innerHTML = `<svg height="30" viewBox="0 0 706 491" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="10" y="64" width="267" height="70" rx="35" fill="var(--themeColor)"/> <rect x="10" y="162" width="267" height="70" rx="35" fill="var(--themeColor)"/> <rect x="10" y="260" width="267" height="70" rx="35" fill="var(--themeColor)"/> <rect x="10" y="358" width="267" height="70" rx="35" fill="var(--themeColor)"/> <path d="M505 415L665.515 254.485C670.201 249.799 670.201 242.201 665.515 237.515L505 77" stroke="var(--themeColor)" stroke-width="72" stroke-linecap="round"/> </svg>`;
    sidebarShowButton.addEventListener("mousedown", function() {
      if (sidebar.style.left == "-200px") {
        sidebar.style.left = "0px";
      } else if (sidebar.style.left == "0px") {
        sidebar.style.left = "-200px";
      }
    });
    app.addEventListener("mousedown", async function(e) {
      if (e.target.closest(".sidebarShowButton") != null) {
        return;
      }
      if (sidebar.style.left == "0px") {
        sidebar.style.left = "-200px";
      }
    });

    findC("main").style.width = "100%";
    findC("main").style.marginLeft = "0px";
  }
}

/*
if (localStorage.getItem("lastUpdateView") != "PhotopRevamp") {
  let zoomedImageBlur = createElement("backBlur", "div", document.body);
  let zoomedImageHolder = createElement("zoomedImageHolder", "div", zoomedImageBlur);
  createElement("zoomedImage", "img", zoomedImageHolder).src = "./icons/revampnotif.svg";
  createElement("zoomedImageClose", "div", zoomedImageHolder).innerHTML = "&times;";
  zoomedImageBlur.style.animation = "imageBlurIn 0.2s";
  zoomedImageBlur.style.opacity = 1;
  zoomedImageHolder.style.transform = "scale(1)";
  zoomedImageBlur.addEventListener("click", function(event){
    zoomedImageBlur.style.opacity = 0;
    zoomedImageHolder.style.transform = "scale(0.9)";
    setTimeout(function () {
      event.target.closest(".backBlur").remove();
    }, 200);
  });
  localStorage.setItem("lastUpdateView", "PhotopRevamp");
}
*/