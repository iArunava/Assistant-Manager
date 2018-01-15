const NOTITITLE = "Assistant Reminder says:";
var tDate = new Date();

$(document).ready(function() {

  let month = ("0" + (tDate.getMonth() + 1)).slice(-2);
  let day = ("0" + tDate.getDate()).slice(-2);

  $("#id--date").attr("value", tDate.getFullYear().toString() + "-" +
                               (month) + "-" + (day));

  $("#id--date").attr("min", tDate.getFullYear().toString() + "-" +
                              (month) + "-" + (day));

  let sltHours  = $("select[name='name--select-hours']");
  let sltMins   = $("select[name='name--select-mins']");
  let sltSecs   = $("select[name='name--select-secs']");
  let sltColors = $("select[name='name--select-color']");

  for (let i = 0; i < 60; ++i) {
    let tempStr = "<option> " + i.toString() + " </option>";
    if (i < 24) { $(tempStr).appendTo(sltHours); }
    $(tempStr).appendTo(sltMins);
    $(tempStr).appendTo(sltSecs);
  }

  let colorArr = ["Green", "Red", "Blue", "Orange", "Lime", "Purple"];
  for (let i = 0; i < colorArr.length; ++i) {
    let tempStr = "<option> " + colorArr[i] + " </option>";
    $(tempStr).appendTo(sltColors);
  }

  $("#id--color-selector").val(colorArr[0]);
  $("#id--hour-selector-quick").val(tDate.getHours());
  $("#id--min-selector-quick").val(tDate.getMinutes());
  $("#id--sec-selector-quick").val(tDate.getSeconds());

});

$("#id--save-btn").click(function() {
    let reminder   = $("#id--the-reminder").val();
    let setDate    = $("#id--date").val();
    let setHours   = $("#id--hour-selector-quick").val();
    let setMinutes = $("#id--min-selector-quick").val();
    let setSeconds = $("#id--sec-selector-quick").val();

    if (document.getElementById("id--date").checkValidity() == true &&
        reminder.length > 0 && dateIsInFuture(setDate, setHours, setMinutes,
        setSeconds) === true) {
      let key = reminder+setDate+setHours+setMinutes+setSeconds;

      let when = Math.round((new Date(setDate.slice(0, 4),
                                   parseInt(setDate.slice(5, 7))-1,
                                   setDate.slice(8, 10), setHours,
                                   setMinutes, setSeconds)).getTime());

      let currItem = {
        rmd:    reminder,
        hrs:    setHours,
        min:    setMinutes,
        secs:   setSeconds,
        date:   setDate,
        key:    key, //TODO: Don't store the key the itself, not a good design
        upcoming: "true",
        uepoch: when
      }

      let setting = browser.storage.local.set({[key]: currItem});

      setting.then(() => {
        let settingAlarm = browser.runtime.getBackgroundPage();
        settingAlarm.then((page) => {
          let key = reminder+setDate+setHours+setMinutes+setSeconds;
          page.setAlarm(currItem, key);
          $("#id--save-btn").prop("disabled", true);
          $("#id--save-btn").html("Saved!");
          setTimeout(() => {
            $("#id--save-btn").html("Save");
            $("#id--save-btn").prop("disabled", false);
            window.close();
          }, 1500);
        }, onError);
      }, onError);
    } else alert ("Time is in past! / Invalid Date");
});

$("#id--view-all-btn").click(() => {
  browser.tabs.create({
    url: "./viewall.html"
  });
});

$("#id--cancel-btn").click(function() {
  window.close();
});

function dateIsInFuture (date, hrs, mins, sec) {
  let cDate = new Date();

  let tempMonth = (cDate.getMonth()+1).toString();
  if (tempMonth.length === 1) tempMonth = '0' + tempMonth.toString();

  let tempDt = (cDate.getDate()).toString();
  if (tempDt.length === 1) tempDt = '0' + tempDt.toString();

  let tempDate = cDate.getFullYear() + "-" + tempMonth + "-" + tempDt;
  let tempHours = cDate.getHours();
  let tempMins = cDate.getMinutes();
  let tempSec = cDate.getSeconds();

  if (tempDate !== date) return true;
  else {
    if (hrs < tempHours) return false;
    else if (hrs > tempHours) return true;
    else {
      if (mins < tempMins) return false;
      else if (mins > tempMins) return true;
      else {
        if (sec <= tempSec) return false;
        else return true;
      }
    }
  }
  return false;
}

function onGot(item) {
  console.log(item);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onSave () {
}
