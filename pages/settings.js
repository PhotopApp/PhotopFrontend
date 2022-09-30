wireframes.settings = `<div class="stickyContainer settingsTabs" id="tabs">
  <span class="tab" type="account" id="tab-account" tabindex="0">Account</span>
  <span class="tab" type="display" id="tab-display" tabindex="0">Display</span>
  <span class="tab" type="blocked" id="tab-blocked" tabindex="0">Blocked</span>
  <span class="tab" type="sessions" id="tab-sessions" tabindex="0">Sessions</span>
  <span class="tab" type="inventory" id="tab-inventory" tabindex="0">Inventory</span>
</div>`;

pages.settings = function() {
  let settingsTabs = ["account", "display", "blocked", "sessions", "inventory"];
  let currentSettingsTab = "";

  let premium = hasPremium()
  let limit = premium ? 600 : 300;

  let alreadyOpenTab = findI("settingsHolder");
  if (alreadyOpenTab != null) {
    alreadyOpenTab.remove();
  }

  let tabRenders = {
    account: async function() {
      let accountHolder = createElement("settingsHolder-account", "div", "pageHolder");
      accountHolder.id = "settingsHolder";
      let settingsBanner;
      if (account.Settings != null && account.Settings.ProfileBanner != null) {
        settingsBanner = `<img class="settingsBanner" src="${assetURL + "ProfileBanners/" + account.Settings.ProfileBanner}">`;
      } else {
        settingsBanner = `<div class="settingsBanner" style="background: var(--contentColor)"></div>`;
      }
      account.ProfileData = account.ProfileData || {};
      /*
      let description = (account.ProfileData.Description || "").split("\n");
      let setInnerHTML = "";
      for (let i = 0; i < description.length; i++) {
        let lineTx = description[i];
        if (lineTx.length < 1) {
          setInnerHTML += "<div><br></div>";
        } else if (i > 0) {
          setInnerHTML += "<div>" + lineTx + "</div>";
        } else {
          setInnerHTML += "<span>" + lineTx + "</span>";
        }
      }
      */
      accountHolder.innerHTML = `
        <input id="imageInputBanner" type="file" accept="image/*" multiple="true" hidden="true">
        <input id="imageInputProfile" type="file" accept="image/*" multiple="true" hidden="true">
        <div class="settingsSection">
          <div class="settingsBannerHolder">
            ${settingsBanner}
            <div class="settingsUploadButton" id="bannerUpload"></div>
          </div>
          <div class="settingsPfpHolder">
            <img src="${decideProfilePic(account)}" class="settingsPfp">
            <div class="settingsUploadButton" id="profileUpload"></div>
          </div>
          <input class="settingsInput" id="settingsUsername" placeholder="${account.User}" changed="false">
          <div class="settingsSaveHolder"><button class="settingsSave" id="saveBasic">Save</button></div>
        </div>
        <div class="settingsSection">
          <div class="settingsTitle">Profile Description</div>
          <div id="profileDescription" contenteditable="true" placeholder="Describe Yourself!" class="textArea">${(account.ProfileData.Description || "").replace(/\n/g, "<br>")}</div>
          <div class="settingsProfileDescriptionChar">0/${limit}</div>
          <div class="settingsSaveHolder"><button class="settingsSave" id="saveDescription">Save</button></div>
        </div>
        <div class="settingsSection">
          <div class="settingsTitle">Change Email</div>
          <input class="settingsInput" id="settingsEmail" placeholder="${account.Email}">
          <div class="settingsTitle">Change Password</div>
          <input class="settingsInput" id="settingsOldPassword" placeholder="Old Password" changed="false" type="password">
          <input class="settingsInput" id="settingsNewPassword" placeholder="New Password" changed="false" type="password">
          <div class="settingsSaveHolder"><button class="settingsSave" id="savePrivate">Save</button></div>
          <div class="settingsTitle">Profile URL</div>
          <input class="settingsInput" id="settingsNewUrl" changed="false" placeholder = "https://app.photop.live/?user=your-name-here">
          <div class="settingsSaveHolder"><button class="settingsSave" style="background:var(--premiumColor)" id="saveURL">Save</button></div>
        </div>
        <div class="settingsSection">
          <div class="settingsTitle">Social Connections</div>
          <div class="settingsSmall">Click a social media to add it to your profile.</div>
          <div id="socialRow"></div>
          <div class="settingsTitle">Active Connections (<span id="connectionCount">0</span>/12)</div>
          <div id="activeConnections"></div>
        </div>
        <div class="settingsSection">
          <div class="settingsTitle">Profile Privacy</div>
          <div class="settingsSmall">Set who can see your profile.</div>
          <button class="settingsVisibility">${account.ProfileData.Visibility || "Public"}</button>
          <div class="settingsSmall" id="settingsVisibilityFlavor"></div>
          <div style="margin-top: 10px;">
            <div class="settingsTitle">Affiliate Link</div>
            <div class="settingsSmall">Anyone who signs up using this link will follow you automatically!</div>
            <div id="settingsAffiliateLinkFlex">
              <input class="settingsInput" readonly id="affiliateUrlInput"></input>
              <button id="settingsCopyText">Copy</button>
            </div>
            <div class="settingsAffiliateStats">
              <div class="settingsAffiliateStat" id="settingsAffiliateStatClicks">0 Clicks</div>
              <div class="settingsAffiliateStat" id="settingsAffiliateStatSignUps">0 Sign Ups</div>
            </div>
          </div>
        </div>
        <div class="settingsSection">
          <div class="settingsTitle">Account Removal</div>
          <div class="settingsSmall">Disabling your account hides all content from you while still allowing you to come back at any time. Deleting your account removes your account and all data associated with the account.</div>
          <button class="settingsRemoval" id="disableButton">Disable</button>
          <button class="settingsRemoval" id="deleteButton">Delete</button>
        </div>
      `;

      findI("affiliateUrlInput").value = `${window.location.origin}?affiliate=${account._id}`
      tempListen(findI("settingsCopyText"), "click", function() {
        copyClipboardText(document.getElementById("affiliateUrlInput").value)
      });
      findI("settingsAffiliateStatClicks").textContent = ((account.Affiliate || {}).Clicks || 0) + " Clicks";
      findI("settingsAffiliateStatSignUps").textContent = ((account.Affiliate || {}).SignUps || 0) + " Sign Ups";

      let inputBannerB = findI("imageInputBanner");
      tempListen(findC("settingsBannerHolder"), "click", function() {
        inputBannerB.click();
      });
      tempListen(inputBannerB, "change", async function(e) {
        let file = e.target.files[0];
        if (file != null && file.type.substring(0, 6) == "image/") {
          let premium = hasPremium();
          if (supportedImageTypes.includes(file.type.replace(/image\//g, "")) == true) {
            if (file.size < 5242881 || (file.size < 5242881 * 2 && premium)) { // 5 MB
              let sendFormData = new FormData();
              sendFormData.append("image", file);
              let uploadPopUp = showPopUp("Uploading Image", "Uploading your new banner...");
              let [code, response] = await sendRequest("POST", "me/new/banner", sendFormData, true);
              if (code == 200) {
                findC("settingsBanner").src = assetURL + "ProfileBanners/" + response;
              } else {
                showPopUp("An Error Occured", response, [["Okay", "var(--grayColor)"]]);
              }
              findI("backBlur" + uploadPopUp).remove();
            } else {
              // showPopUp("An Error Occured", "Your banner is too large. Please upload a smaller banner.", [["Okay", "var(--grayColor)"]]);
              if (file.size > 5242881 && !premium) {
                showPopUp("Too big!", "Your image must be under 5MB. However, with Photop Premium you can upload up too 10MB!", [["Okay", "var(--grayColor)"]]);
              } else if (file.size > 5242881 * 2) {
                showPopUp("Too big!", "Your image file size must be under 10MB.", [["Okay", "var(--grayColor)"]]);
              }
            }
          } else {
            showPopUp("Invalid Image Type", "Photop only accepts images of the following types: <i style='color: #bbb'>" + (supportedImageTypes.join(", ")) + "</i>", [["Okay", "var(--grayColor)"]]);
          }
        } else {
          showPopUp("Must be an Image", "Only image files can be uploaded as a banner.", [["Okay", "var(--grayColor)"]]);
        }
      });
      let inputProfileB = findI("imageInputProfile");
      tempListen(findC("settingsPfpHolder"), "click", function() {
        inputProfileB.click();
      });
      tempListen(inputProfileB, "change", async function(e) {
        let file = e.target.files[0];
        if (file != null && file.type.substring(0, 6) == "image/") {
          if (supportedImageTypes.includes(file.type.replace(/image\//g, "")) == true) {
            if (file.size < 2097153 || (hasPremium() && file.size < 2097153 * 2)) { // 2 MB or 4 MB for premium users.
              //alert("Woot woot it worked")
              let sendFormData = new FormData();
              sendFormData.append("image", file);
              let uploadPopUp = showPopUp("Uploading Image", "Uploading your new profile picture...");
              let [code, response] = await sendRequest("POST", "me/new/picture", sendFormData, true);
              if (code == 200) {
                findC("settingsPfp").src = assetURL + "ProfileImages/" + response;
              } else {
                showPopUp("An Error Occured", response, [["Okay", "var(--grayColor)"]]);
              }
              findI("backBlur" + uploadPopUp).remove();
            } else {
              // alert(`Some storage problem. Data: hasPremium(): ${hasPremium()}, File size: ${file.size}`);
              // showPopUp("An Error Occured", "Your profile picture is too large. Please upload a smaller picture.", [["Okay", "var(--grayColor)"]]);
              if (file.size > 2097153 && !hasPremium()) {
                // alert("I think we have a problem")
                showPopUp("Too big!", "Your image must be under 2MB. However, with Photop Premium you can upload up too 4MB!", [["Okay", "var(--grayColor)"]]);
              } else {
                if (file.size > 2097153 * 2 && hasPremium()) {
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

      tempListen(findI("saveBasic"), "click", async function() {
        let newUsername = findI("settingsUsername").value;
        if (newUsername != account.User && newUsername != "") {
          if (verifyUsername(newUsername)) {
            let [code, response] = await sendRequest("PUT", "me/settings", { update: "username", value: newUsername });
            if (code == 200) {
              findI("settingsUsername").placeholder = newUsername;
              findI("settingsUsername").value = "";
              showPopUp("Username Saved", "Your new username has been saved successfully.", [["Okay", "var(--themeColor)"]]);
            } else if (code == 422) {
              showPopUp("Name Taken", "Sadly, that name is taken. Try another one!", [["Okay", "var(--themeColor)"]]);
            } else {
              showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
            }
          } else {
            showPopUp("Invalid Username", "Usernames must be 3-20 characters, and can only include letters, numbers, underscores, and dashes.", [["Okay", "var(--themeColor)"]]);
          }
        }
      });
      let profileDesc = findI("profileDescription");
      async function updateDescFormat() {
        await sleep(1);
        let caretWas = getCurrentCursorPosition(profileDesc);
        let nodes = profileDesc.childNodes;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].nodeName == "DIV" || nodes[i].nodeName == "SPAN") {
            nodes[i].innerHTML = preFormat(nodes[i].innerText);
          } else if (nodes[i].nodeValue != null) {
            let newSpan = createElement("", "span", profileDesc);
            newSpan.innerHTML = preFormat(nodes[i].nodeValue);
            nodes[i].replaceWith(newSpan);
          } else {
            profileDesc.innerHTML = preFormat(nodes[i].innerHTML);
          }
        }
        if (profileDesc.innerHTML == "<br>") {
          profileDesc.innerHTML = "";
        }
        if (caretWas > -1) {
          setCurrentCursorPosition(profileDesc, caretWas);
        }
        profileDesc.focus();
      }
      tempListen(profileDesc, "input", function() {
        //updateDescFormat();
        accountHolder.querySelector(".settingsProfileDescriptionChar").textContent = profileDesc.textContent.length + `/${limit}`;
      });
      //updateDescFormat();
      accountHolder.querySelector(".settingsProfileDescriptionChar").textContent = profileDesc.textContent.length + `/${limit}`;
      tempListen(findI("saveDescription"), "click", async function() {
        let newDescription = findI("profileDescription").innerText;
        if (newDescription.length <= limit) {
          let [code] = await sendRequest("PUT", "me/settings", { update: "description", value: newDescription });
          if (code == 200) {
            showPopUp("Description Saved", "Your new description has been saved successfully.", [["Okay", "var(--themeColor)"]]);
          }
        } else {
          if (!premium) {
            showPopUp("Invalid Description", `Descriptions must be less than ${limit} characters long. However, with Photop Premium, you can have descriptions with up to 600 characters!`, [["Okay", "var(--themeColor)"]]);
          } else {
            showPopUp("Invalid Description", `Descriptions must be less than ${limit} characters long.`, [["Okay", "var(--themeColor)"]]);
          }
        }
      });
      tempListen(findI("savePrivate"), "click", async function() {
        let newEmail = findI("settingsEmail").value;
        if (newEmail != "" && newEmail != account.Email) {
          const verifyEmailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (verifyEmailRegex.test(newEmail) == false) {
            showPopUp("Invalid Email", "Emails must be... well, emails.", [["Okay", "var(--themeColor)"]]);
            return;
          }
          let [code, response] = await sendRequest("PUT", "me/settings", { update: "email", value: newEmail });
          if (code == 200) {
            showPopUp("Email Saved", "Your new email has been saved successfully.", [["Okay", "var(--themeColor)"]]);
            findI("settingsEmail").setAttribute("placeholder", newEmail);
          }
          findI("settingsEmail").value = "";
        }
        let oldPassword = findI("settingsOldPassword").value;
        let newPassword = findI("settingsNewPassword").value;
        if (newPassword != "") {
          if (newPassword.length < 8) {
            showPopUp("Invalid Password", "Passwords must be at least 8 characters long.", [["Okay", "var(--grayColor)"]]);
            return;
          }
          if (newPassword.replace(/[^0-9]/g, "").length < 1) {
            showPopUp("Invalid Password", "Passwords must contain at least one number.", [["Okay", "var(--grayColor)"]]);
            return;
          }
          if ((/[ !@#$%^&*()+\-_=\[\]{};':"\\|,.<>\/?]/).test(newPassword.toLowerCase()) == false) {
            showPopUp("Invalid Password", "Passwords must contain at least one symbol.", [["Okay", "var(--grayColor)"]]);
            return;
          }
          let [code, response] = await sendRequest("PUT", "me/settings", { update: "password", value: oldPassword + "," + newPassword });
          if (code == 200) {
            showPopUp("Password Saved", "Your new password has been saved successfully. All other devices have been logged out.", [["Okay", "var(--themeColor)"]]);
          } else if (code == 403) {
            showPopUp("Incorrect Password", "Sorry, the password you entered is incorrect.", [["Okay", "var(--grayColor)"]]);
          }
          findI("settingsOldPassword").value = "";
          findI("settingsNewPassword").value = "";
        }
      });
      let allSocials = Object.keys(socialLinkData);
      for (let i = 0; i < allSocials.length; i++) {
        let socialButton = createElement("profileSocialButton", "a", findI("socialRow"), { "background": socialLinkData[allSocials[i]][1], "content": "url(./icons/socials/" + allSocials[i] + ".svg)" });
        socialButton.addEventListener("click", async function() {
          let newWin = null;
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == true) {
            newWin = window.open("https://exotek.co", "_blank");
          }
          let [code, response] = await sendRequest("GET", "me/new/social?site=" + allSocials[i]);
          if (code == 200) {
            if (newWin == null) {
              let left = (screen.width / 2) - (500 / 2);
              let top = (screen.height / 2) - (600 / 2) - 100;
              window.open(response, "social_link_authenticate", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=600, top=" + top + ", left=" + left);
            } else {
              newWin.location = Response;
            }
          }
        });
      }
      let socialKeys = Object.keys(account.ProfileData.Socials || {});
      findI("connectionCount").textContent = socialKeys.length;
      for (let i = 0; i < socialKeys.length; i++) {
        let social = socialKeys[i];
        let value = account.ProfileData.Socials[socialKeys[i]];
        let keyInfo = social.split("_");
        let socialType = keyInfo[0];
        let socialInfo = socialLinkData[keyInfo[0]];
        let thisSocial = createElement("socialConnection", "div", findI("activeConnections"));
        thisSocial.innerHTML = `<a class="profileSocialButton" style="background: ${socialLinkData[socialType][1]}; content: url(./icons/socials/${socialType}.svg)"></a> <b></b> <span class="removeSocial" id="removeSocial${i}" tabindex="0">&times;</span>`;
        thisSocial.querySelector("b").textContent = value;
        let socialButton = thisSocial.querySelector(".profileSocialButton");
        socialButton.setAttribute("title", keyInfo[0] + " (" + value + ")");
        thisSocial.id = social;
        if (socialInfo[2] != "PROMPT_USERNAME") {
          socialButton.setAttribute("href", socialInfo[2].replace(/USERID_GOES_HERE/g, keyInfo.splice(1).join("_")).replace(/USERNAME_GOES_HERE/g, value));
          socialButton.setAttribute("target", "_blank");
        } else {
          socialButton.setAttribute("onmouseup", 'showPopUp("' + socialInfo[0] + '", "<i>' + cleanString(value) + '</i>", [ ["Done", "var(--grayColor)"] ])');
        }
        findI("removeSocial" + i).addEventListener("click", async function() {
          thisSocial.style.opacity = 0.5;
          let [code] = await sendRequest("DELETE", "me/remove/social?socialid=" + social);
          if (code == 200) {
            thisSocial.remove();
            findI("connectionCount").textContent--;
          } else {
            thisSocial.style.opacity = 1;
          }
        });
      }

      let visibility = findC("settingsVisibility");
      let visibilityFlavor = findI("settingsVisibilityFlavor");
      function setVisibility(visib) {
        visibility.textContent = visib;
        switch (visib) {
          case "Public":
            visibility.style.color = "var(--themeColor)";
            visibilityFlavor.innerText = "Anyone can view your profile.";
            break;
          case "Following":
            visibility.style.color = "#FFCB70";
            visibilityFlavor.innerText = "Only people you follow can view your profile.";
            break;
          case "Private":
            visibility.style.color = "#FF5C5C";
            visibilityFlavor.innerText = "No one can view your profile.";
        }
      }
      setVisibility(account.ProfileData.Visibility || "Public");
      async function setAndSaveVisibility(newVis) {
        if (newVis != account.ProfileData.Visibility || "Public") {
          let [code, response] = await sendRequest("PUT", "me/settings", { update: "visibility", value: newVis });
          if (code == 200) {
            setVisibility(newVis);
          } else {
            showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
          }
        }
      }
      tempListen(visibility, "click", function() {
        showDropdown(visibility, "right", [
          ["Public", "var(--themeColor)", function() {
            setAndSaveVisibility("Public");
          }],
          ["Following", "#FFCB70", function() {
            setAndSaveVisibility("Following");
          }],
          ["Private", "#FF5C5C", function() {
            setAndSaveVisibility("Private");
          }]
        ]);
      });

      tempListen(findI("disableButton"), "click", function() {
        showPopUp("Are You Sure?", "Disabling your account will hide all content from you while still allowing you to return at any time.", [["Confirm", "#FF5786", async function() {
          let [code, response] = await sendRequest("PUT", "me/settings", { update: "removal", value: "disable" });
          if (code == 200) {
            setPage("home");
            localStorage.removeItem("userID");
            localStorage.removeItem("token");
            location.reload();
          } else {
            showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
          }
        }], ["Wait, no", "var(--grayColor)"]]);
      });
      tempListen(findI("deleteButton"), "click", function() {
        showPopUp("ARE YOU SURE!?!", "Deleting your account will hide all content from you and after 30 days all data associated with you will be removed permanently.", [["Confirm", "#FF5786", async function() {
          let [code, response] = await sendRequest("PUT", "me/settings", { update: "removal", value: "delete" });
          if (code == 200) {
            setPage("home");
            localStorage.removeItem("userID");
            localStorage.removeItem("token");
            location.reload();
          } else {
            showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
          }
        }], ["NO", "var(--grayColor)"]]);
      });
      tempListen(findI("saveURL"), "click", async function() {
        let url = findI("settingsNewUrl").value;
        if (verifyUsername(url)) {
          let [code, response] = await sendRequest("PUT", "me/settings", { update: "profileurl", value: url });
          if (code == 200) {
            showPopUp("Profile URL Updated", `<a href="https://app.photop.live/?user=${url}">https://app.photop.live/?user=${url}</a>`, [["Okay", "var(--premiumColor)"]]);
          } else {
            showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
          }
        } else {
          showPopUp("Invalid URL", "URLs must be 3-20 characters, and can only include letters, numbers, underscores, and dashes.", [["Okay", "var(--themeColor)"]]);
        }
        findI("settingsNewUrl").value = "";
      });
    },
    display: async function() {
      let displayHolder = createElement("settingsHolder-display", "div", "pageHolder");
      displayHolder.innerHTML = `<div class="settingsSection">
  <div class="settingsTitle">Theme</div>
  <input type="radio" name="theme" value="Dark" id="themeDark"><label for="themeDark" class="radioLabel">Dark</label>
  <input type="radio" name="theme" value="Light" id="themeLight"><label for="themeLight" class="radioLabel">Light</label>
  <input type="radio" name="theme" value="Blood Moon" id="themeBloodMoon"><label for="themeBloodMoon" class="radioLabel">Blood Moon</label>
</div>
<div class="settingsSection">
  <div class="settingsTitle">Embeds</div>
  <input type="checkbox" name="theme" id="embedYT"><label for="embedYT" class="radioLabel">Embed YouTube Videos</label>
  <input type="checkbox" name="theme" id="embedTwitch"><label for="embedTwitch" class="radioLabel">Embed Twitch Streams</label>
  <input type="checkbox" name="theme" id="embedGif"><label for="embedGif" class="radioLabel">Embed GIFs</label>
</div>
<div class="settingsSection">
  <a class="settingsLink" href="${window.location.origin}/#tos">Terms of Service</a>
  <a class="settingsLink" href="${window.location.origin}/#privacy">Privacy Policy</a>
  <a class="settingsLink" href="${window.location.origin}/#rules">Photop Rules</a>
  <a class="settingsLink" href="https://photop.live/?from=photopweb" target="_blank">About Photop</a>
  <a class="settingsLink" href="https://twitter.com/PhotopMedia" target="_blank">Photop Twitter</a>
  <a class="settingsLink" href="https://discord.com/invite/gnBVPbrAPd" target="_blank">Photop Discord</a>
  <div style="font-size: 16px; text-align: center;">©2022 Exotek LLC - All rights reserved</div>
</div>`;
      let setTheme = findI("theme" + account.Settings.Display.Theme.replace(/ Mode/g, "").replace(/\s/g, ""));
      if (setTheme != null) {
        setTheme.checked = true;
      }
      findI("themeDark").addEventListener("change", async function() {
        if (findI("themeDark").checked) {
          let updatedSettings = account.Settings.Display;
          updatedSettings.Theme = "Dark Mode";
          updateDisplay("Dark");
          let [code, response] = await sendRequest("POST", "me/settings", { update: "display", value: updatedSettings });
          if (code != 200) {
            showPopUp("Error Updating Theme", response, [["Okay", "var(--grayColor)"]]);
            findI("theme" + account.Settings.Display.Theme.replace(/ Mode/g, "")).checked = true;
            updateDisplay(account.Settings.Display.Theme.replace(/ Mode/g, ""));
          }
        }
      });
      findI("themeLight").addEventListener("change", async function() {
        if (findI("themeLight").checked) {
          let updatedSettings = account.Settings.Display;
          updatedSettings.Theme = "Light Mode";
          updateDisplay("Light");
          let [code, response] = await sendRequest("POST", "me/settings", { update: "display", value: updatedSettings });
          if (code == 200) {

          } else {
            showPopUp("Error Updating Theme", response, [["Okay", "var(--grayColor)"]]);
            findI("theme" + account.Settings.Display.Theme.replace(/ Mode/g, "")).checked = true;
            updateDisplay(account.Settings.Display.Theme.replace(/ Mode/g, ""));
          }
        }
      });
      findI("themeBloodMoon").addEventListener("change", async function() {
        if (findI("themeBloodMoon").checked) {
          let updatedSettings = account.Settings.Display;
          updatedSettings.Theme = "Blood Moon Mode";
          updateDisplay("Blood Moon");
          let [code, response] = await sendRequest("POST", "me/settings", { update: "display", value: updatedSettings });
          if (code == 200) {

          } else {
            showPopUp("Error Updating Theme", response, [["Okay", "var(--grayColor)"]]);
            findI("theme" + account.Settings.Display.Theme.replace(/ Mode/g, "")).checked = true;
            updateDisplay(account.Settings.Display.Theme.replace(/ Mode/g, ""));
          }
        }
      });
      /*
      findI("themeHacker").addEventListener("change", async function () {
        if (findI("themeHacker").checked) {
          let updatedSettings = account.Settings.Display;
          updatedSettings.Theme = "Hacker Mode";
          updateDisplay("Hacker");
          let [code, response] = await sendRequest("POST", "me/settings", {update: "display", value: updatedSettings});
          if (code == 200) {
            
          } else {
            showPopUp("Error Updating Theme", response, [["Okay", "var(--grayColor)"]]);
            findI("theme" + account.Settings.Display.Theme.replace(/ Mode/g, "")).checked = true;
            updateDisplay(account.Settings.Display.Theme.replace(/ Mode/g, ""));
          }
        }
      });
      */
      findI("embedYT").checked = account.Settings.Display["Embed YouTube Videos"];
      findI("embedTwitch").checked = account.Settings.Display["Embed Twitch Streams"]; findI("embedGif").checked = account.Settings.Display["Embed GIFs"];
      findI("embedYT").addEventListener("change", async function() {
        let updatedSettings = account.Settings.Display;
        updatedSettings["Embed YouTube Videos"] = findI("embedYT").checked;
        let [code, response] = await sendRequest("POST", "me/settings", { update: "display", value: updatedSettings });
        if (code != 200) {
          showPopUp("An Error Occured", response, [["Okay", "var(--themeColor)"]]);
        }
      });
      findI("embedTwitch").addEventListener("change", async function() {
        let updatedSettings = account.Settings.Display;
        updatedSettings["Embed Twitch Streams"] = findI("embedTwitch").checked;
        let [code, response] = await sendRequest("POST", "me/settings", { update: "display", value: updatedSettings });
        if (code != 200) {
          showPopUp("An Error Occured", response, [["Okay", "var(--themeColor)"]]);
        }
      });
      findI("embedGif").addEventListener("change", async function() {
        let updatedSettings = account.Settings.Display;
        updatedSettings["Embed GIFs"] = findI("embedGif").checked;
        let [code, response] = await sendRequest("POST", "me/settings", { update: "display", value: updatedSettings });
        if (code != 200) {
          showPopUp("An Error Occured", response, [["Okay", "var(--themeColor)"]]);
        }
      });
    },
    blocked: async function() {
      let blockedHolder = createElement("settingsHolder-blocked", "div", "pageHolder");
      let [code, response] = await sendRequest("GET", "me/blocked");
      if (code == 200) {
        let data = JSON.parse(response);
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let user = data[i];
            let blockedHTML = `
            <img class="blockedTilePic" type="user" src='` + decideProfilePic(user) + `'></img>
            <span class="blockedTileUser" type="user">${getRoleHTML(user)}${user.User}</span>
            <button class="previewBlockButton" userid="${user._id}">Unblock</button>
          `;
            let unblockTile = createElement("blockTile", "div", blockedHolder);
            unblockTile.innerHTML = blockedHTML;
            unblockTile.setAttribute("userid", user._id);
            unblockTile.setAttribute("time", user.Timestamp);

            tempListen(unblockTile.querySelector(".previewBlockButton"), "click", async function(event) {
              event.target.style.opacity = "0.5";
              let [code, response] = await sendRequest("PUT", "/user/unblock?userid=" + event.target.getAttribute("userid"));
              if (code == 200) {
                event.target.closest(".blockTile").remove();
                if (blockedHolder.childElementCount < 1) {
                  createTooltip(blockedHolder, "When you run into a meanie, they go here...");
                }
              } else {
                showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
              }
            });
          }
        } else {
          createTooltip(blockedHolder, "When you run into a meanie, they go here...");
        }
      }
    },
    sessions: async function() {
      let sessionsHolder = createElement("settingsHolder-sessions", "div", "pageHolder");
      let [code, response] = await sendRequest("GET", "me/sessions");
      if (code == 200) {
        let data = JSON.parse(response);
        for (let i = 0; i < data.length; i++) {
          let session = data[i];
          if (session.timestamp != null) {
            let sessionsHTML = `
              <div class="sessionTileInfo">
                <span class="sessionTileIP">${session.ip}${(session.isSession ? " <b>(This Session)</b>" : "")}</span>
                <span class="sessionTileTime">${formatFullDate(session.timestamp * 1000)}</span>
              </div>
            `;
            let sessionTile = createElement("sessionTile", "div", sessionsHolder);
            sessionTile.innerHTML = sessionsHTML;
            if (!session.isSession) {
              let signOutButton = createElement("signOutSessionButton", "button", sessionTile);
              signOutButton.innerText = "Sign Out";
              signOutButton.setAttribute("ip", session.ip);

              tempListen(signOutButton, "click", async function(event) {
                event.target.style.opacity = "0.5";
                let [code, response] = await sendRequest("POST", "me/remove/session?ip=" + event.target.getAttribute("ip"), true);
                if (code == 200) {
                  event.target.closest(".sessionTile").remove();
                } else {
                  showPopUp("An Error Occurred", response, [["Okay", "var(--themeColor)"]]);
                }
              });
            }
          }
        }
      }
    },

    inventory: async function() {
      let inventoryHolder = createElement("settingsHolder-inventory", "div", "pageHolder");
      // send request to get the inventory. in the meanwhile this array will do.

      for (let i = 0; i < 3; i++) {
        let giftHolder = createElement("giftHolder", "div", inventoryHolder);
        let giftHTML = `
        <div class="settingsInventoryPremiumGift">
          <div class = "">
            <svg style="position: relative; width: 20px; height: 20px; " id="DetailIcon" viewBox="0 0 512 512" fill="var(--themeColor)"><path fill-rule="evenodd" clip-rule="evenodd" d="M289.222 25.1645C278.758 -8.3882 233.196 -8.38812 222.732 25.1645L186.269 142.086C181.589 157.091 168.168 167.25 153.024 167.25H35.0229C1.16028 167.25 -12.919 212.395 14.4763 233.131L109.941 305.394C122.193 314.668 127.319 331.105 122.64 346.11L86.1754 463.032C75.7112 496.584 112.572 524.485 139.967 503.748L151.86 494.746C156.12 491.522 158.641 486.368 158.641 480.882V213.761C158.641 204.295 166.006 196.623 175.09 196.623H263.273C285.258 196.623 303.986 200.581 319.457 208.499C334.928 216.417 346.464 227.304 354.063 241.161C361.935 255.017 365.87 270.711 365.87 288.243C365.87 304.079 362.206 318.925 354.878 332.781C347.821 346.637 336.557 357.807 321.086 366.29C305.886 374.773 286.615 379.015 263.273 379.015H232.088C223.004 379.015 215.638 386.689 215.638 396.153V420.98C215.638 431.592 227.192 437.724 235.432 431.487C247.683 422.214 264.274 422.214 276.525 431.487L371.99 503.748C399.385 524.485 436.245 496.584 425.78 463.032L389.317 346.11C384.637 331.105 389.764 314.668 402.015 305.394L497.481 233.131C524.876 212.395 510.797 167.25 476.933 167.25H358.933C343.788 167.25 330.367 157.091 325.688 142.086L289.222 25.1645ZM295.843 320.056C288.244 327.408 276.573 331.084 260.83 331.084H232.088C223.004 331.084 215.638 323.41 215.638 313.946V262.116C215.638 252.652 223.004 244.978 232.088 244.978H260.83C291.772 244.978 307.243 259.4 307.243 288.243C307.243 301.816 303.443 312.421 295.843 320.056Z" fill="#FF42A7"></path></svg>
            <span class="giftTileName">From [Username]</span>
          </div>
          <button class = "settingsPremiumTaken">Claimed</button>  
        </div>
        `;
        giftHolder.innerHTML = giftHTML;
      }
    }

  };
  function changeSettingsTab(type) {
    if (currentSettingsTab == type) {
      return;
    }
    let tabs = [...settingsTabs];
    currentSettingsTab = type;
    tabs.splice(tabs.indexOf(type), 1);
    for (let i in tabs) {
      findI("tab-" + tabs[i]).classList.remove("selected");
      if (findC("settingsHolder-" + tabs[i]) != null) {
        findC("settingsHolder-" + tabs[i]).remove();
      }
    }
    findI("tab-" + type).classList.add("selected");
    window.scrollTo({ top: 0 });
    tabRenders[type]();
  }

  for (let i = 0; i < settingsTabs.length; i++) {
    tempListen(findI("tab-" + settingsTabs[i]), "click", function() {
      changeSettingsTab(settingsTabs[i])
    });
  }
  changeSettingsTab("account");
};

/*
let newWin = null;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == true) {
  newWin = window.open("https://exotek.co", "_blank");
}
let [ code, response ] = await sendRequest("GET", "me/new/social?site=" + site);
if (code == 200) {
  if (newWin == null) {
    let left = (screen.width/2)-(500/2);
    let top = (screen.height/2)-(600/2) - 100;
    window.open(response, "socai_link_authenticate", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=600, top=" + top + ", left=" + left);
  } else {
    newWin.location = Response;
  }
}
*/