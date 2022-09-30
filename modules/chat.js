modules.chat = function (parent, chat, user, reply, isSending, extra) {
  if (parent == null) {
    return;
  }
  extra = extra || {};
  let chatHTML = "";  
  let className = "chat";
  if (extra.addTop != true) {
    if (parent.lastElementChild != null && chat.ReplyID == null && parent.lastElementChild.getAttribute("userid") == chat.UserID && parent.lastElementChild.querySelector(".chatReplyHolder") == null && parent.lastElementChild.hasAttribute("sending") == false) {
      className = "minifyChat";
      chatHTML = `<span class="chatMinfiyTime" title="` + formatFullDate(chat.Timestamp) + `">${timeSince(chat.Timestamp, false)}</span><span class="chatMinfiyText"></span>`;
    }
  } else {
    if (parent.firstElementChild != null && chat.ReplyID == null && parent.firstElementChild.querySelector(".chatReplyHolder") == null && parent.firstElementChild.getAttribute("userid") == chat.UserID) {
      let oldChat = parent.firstElementChild;
      let convertChat = createElement("minifyChat", "div", parent);
      parent.insertBefore(convertChat, parent.firstChild);
      convertChat.id = oldChat.id;
      convertChat.setAttribute("type", "chat");
      convertChat.setAttribute("text", oldChat.getAttribute("text"));
      convertChat.setAttribute("userid", oldChat.getAttribute("userid"));
      convertChat.setAttribute("user", oldChat.getAttribute("user"));
      convertChat.setAttribute("time", oldChat.getAttribute("time"));
      convertChat.innerHTML = `<span class="chatMinfiyTime" title="` + formatFullDate(parseInt(oldChat.getAttribute("time"))) + `">${oldChat.querySelector(".chatTime").textContent}</span><span class="chatMinfiyText"></span>`;
      convertChat.querySelector(".chatMinfiyText").innerHTML = oldChat.querySelector(".chatText").innerHTML;
      oldChat.remove();
    }
  }
  if (chatHTML == "") {
    if (reply == null) {
      chatHTML = `<img src="${decideProfilePic(user)}" class="chatPfp" type="user" tabindex="0"><div class="chatTextArea"><div class="chatAttr"><span class="chatUser" type="user">${getRoleHTML(user)}${user.User}</span> <span class="chatTime" title="` + formatFullDate(chat.Timestamp) + `">${timeSince(chat.Timestamp, false)}</span></div><span class="chatText"></span></div>`;
    } else {
      chatHTML = `<div class="chatReplyHolder" type="reply" replyid="${reply._id}"><div class="chatReplyLine"></div><span class="chatReplyUsername">${reply.user.User}</span><span class="chatReplyText"></span></div><img src="${decideProfilePic(user)}" class="chatPfp" type="user"><div class="chatTextArea"><div class="chatAttr"><span class="chatUser" type="user">${getRoleHTML(user)}${user.User}</span> <span class="chatTime" title="` + formatFullDate(chat.Timestamp) + `">${timeSince(chat.Timestamp, false)}</span></div><span class="chatText"></span></div>`;
    }
  }
  let newChat = createElement(className, "div", parent);
  if (extra.addTop == true) {
    parent.insertBefore(newChat, parent.firstChild);
  }
  newChat.id = chat._id;
  newChat.setAttribute("type", "chat");
  newChat.setAttribute("text", chat.Text);
  newChat.setAttribute("userid", chat.UserID);
  newChat.setAttribute("user", user.User);
  newChat.setAttribute("time", chat.Timestamp);
  newChat.setAttribute("tabindex", 0);
  newChat.setAttribute("editing", false);
  newChat.innerHTML = chatHTML;
  if (newChat.querySelector(".chatReplyText") != null) {
    newChat.querySelector(".chatReplyText").innerHTML = reply.Text;
  }
  if (className == "chat") {
    newChat.querySelector(".chatText").innerHTML = formatText(chat.Text);
  } else {
    newChat.querySelector(".chatMinfiyText").innerHTML = formatText(chat.Text);
  }
  if (isSending == true) {
    newChat.style.color = "#bbb";
    newChat.setAttribute("sending", "");
  }
}