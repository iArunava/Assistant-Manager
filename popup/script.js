const NOTITITLE = "Assistant Reminder says:";
var tDate = new Date();

$(document).ready(function() {

  /*var clearAlarms = browser.alarms.clearAll();
  clearAlarms.then(onAllAlarmsCleared);*/

  /*var clearStorage = browser.storage.local.clear();
  clearStorage.then(onAllAlarmsCleared, onError);*/

  let month = ("0" + (tDate.getMonth() + 1)).slice(-2);
  let day = ("0" + tDate.getDate()).slice(-2);

  $("#id--date").attr("value", tDate.getFullYear().toString() + "-" +
                               (month) + "-" + (day));

  $("#id--date").attr("min", tDate.getFullYear().toString() + "-" +
                              (month) + "-" + (day));

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
        setSeconds) == true) {
      let key = reminder+setDate+setHours+setMinutes+setSeconds;

      let when = Math.round((new Date(setDate.slice(0, 4),
                                   parseInt(setDate.slice(5, 7))-1,
                                   setDate.slice(8, 10), setHours,
                                   setMinutes, setSeconds)).getTime());

      /*console.log(setDate.slice(0, 4));
      console.log(parseInt(setDate.slice(5, 7)) - 1);
      console.log(setDate.slice(8, 10));
      console.log(new Date(setDate.slice(0, 4),
                                   parseInt(setDate.slice(5, 7))-1,
                                   setDate.slice(8, 10), setHours,
                                   setMinutes, setSeconds));*/
      let setting = browser.storage.local.set({
        [key]: {rmd:    reminder,
                hrs:    setHours,
                min:    setMinutes,
                secs:   setSeconds,
                date:   setDate,
                uepoch: when}
      });

      setting.then(() => {
        let settingAlarm = browser.runtime.getBackgroundPage();
        settingAlarm.then((page) => {
          let key = reminder+setDate+setHours+setMinutes+setSeconds;
          page.setAlarm(key);
          $("#id--save-btn").prop("disabled", true);
          $("#id--save-btn").html("Saved!");
          setTimeout(() => {
            $("#id--save-btn").html("Save");
            $("#id--save-btn").prop("disabled", false);
          }, 3000);
        }, onError);
      }, onError);

    } else alert ("Invalid Date!");
});

$("#id--view-all-btn").click(() => {
  browser.tabs.create({
    url: "./viewall.html"
  });
});

$("#id--cancel-btn").click(function() {
  window.close();
});

function onGot(item) {
  console.log(item);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onAllAlarmsCleared(wasCleared) {
  console.log(wasCleared);
}

function onSave () {
}

function dateIsInFuture (date, hrs, mins, sec) {
  let cDate = new Date();
  let tempDate = cDate.getFullYear() + "-" + (cDate.getMonth()+1) + "-" +
                 cDate.getDate();
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
