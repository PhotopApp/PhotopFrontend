modules.ban = function (id, name) {
  let popUpCode = showPopUp("Ban " + name, `
  Type why and select how long you want to ban <b>${name}</b> from Photop.
  <div id="banContext" contenteditable="true" placeholder="Type a Professional Ban Reason" class="textArea"></div>
  <input class="banInput" type="number" name="ban" id="banTempNum" min="1" placeholder="30">
  <select class="banInput" id="banTempUnit">
    <option value="60">Minute(s)</option>
    <option value="3600">Hour(s)</option>
    <option value="86400">Day(s)</option>
    <option value="604800">Week(s)</option>
    <option value="2592000">Month(s)</option>
    <option value="31536000">Years(s)</option>
    <option value="permanent">Permanent</option>
  </select>
<div id="banTermTx">Check this box to terminate <b>${name}</b>'s account from Photop.</div>
<input type="checkbox" name="term" value="term" id="banTerm"><label for="banTerm" class="radioLabel">Terminate</label>`, [["Ban " + name, "#FF5C5C", async function() {
    let popUp = findI("modalText" + popUpCode);
    let inputtedReason = popUp.querySelector("#banContext").textContent;
    if (inputtedReason.length < 1 || inputtedReason.length > 250) {
      showPopUp("Reason Too Long", "The ban reason must be between 1 and 250 characters.", [["Okay", "var(--grayColor)"]]);
      return;
    }
    let banLength = "Permanent";
    if (popUp.querySelector("#banTempUnit").value != "permanent") {
      let banTempNum = parseInt(popUp.querySelector("#banTempNum").value || "30");
      let banTempUnit = parseInt(popUp.querySelector("#banTempUnit").value || "60");
      banLength = banTempNum*banTempUnit;
    }
    let terminate = findI("banTerm").checked;
    findI("backBlur" + popUpCode).remove();
    let [code, response] = await sendRequest("PUT", "mod/ban?userid=" + id, { length: banLength, reason: inputtedReason, terminate: terminate });
    if (code != 200) {
      showPopUp("An Error Occured", response, [["Okay", "var(--grayColor)"]]);
    }
  }, true], ["Cancel", "var(--grayColor)"]]);
}