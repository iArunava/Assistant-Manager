const NOTITITLE = "Assistant Reminder says:";
var tDate = new Date();

$(document).ready(function() {

  /*var clearAlarms = browser.alarms.clearAll();
  clearAlarms.then(onAllAlarmsCleared);*/

  /*var clearStorage = browser.storage.local.clear();
  clearStorage.then(onAllAlarmsCleared, onError);*/

  $("#id--save-btn").click(function() {
      let reminder   = $("#id--the-reminder").val();
      let setDate    = $("#id--date").val();
      let setHours   = $("#id--hour-selector-quick").val();
      let setMinutes = $("#id--min-selector-quick").val();
      let setSeconds = $("#id--sec-selector-quick").val();

      /*browser.notifications.create({
        "type": "basic",
        "title": NOTITITLE,
        "message": reminder,
        "iconUrl": "../icons/asst-reminder-32.png"
      });*/

      if (document.getElementById("id--date").checkValidity() == true) {
        let key = reminder+setDate+setHours+setMinutes+setSeconds;

        let when = Math.round((new Date(setDate.slice(0, 4),
                                     parseInt(setDate.slice(5, 7))-1,
                                     setDate.slice(8, 10), setHours,
                                     setMinutes, setSeconds)).getTime() / 1000);

        /*console.log(setDate.slice(0, 4));
        console.log(parseInt(setDate.slice(5, 7)) - 1);
        console.log(setDate.slice(8, 10));
        console.log(new Date(setDate.slice(0, 4),
                                     parseInt(setDate.slice(5, 7))-1,
                                     setDate.slice(8, 10), setHours,
                                     setMinutes, setSeconds));*/
        let setting = browser.storage.local.set({
          [key]: {rmd: reminder,
                 hrs: setHours,
                 min: setMinutes,
                 secs: setSeconds,
                 date: setDate,
                 uepoch: when}
        });
        setting.then(onSave, onError);

        //console.log(when);
        browser.alarms.create(key, {
          when
        });

      } else alert ("Invalid Date!");
  });

  $("#id--cancel-btn").click(function() {
    window.close();
  });

  let month = ("0" + (tDate.getMonth() + 1)).slice(-2);
  let day = ("0" + tDate.getDate()).slice(-2);

  $("#id--date").attr("value", tDate.getFullYear().toString() + "-" +
                               (month) + "-" + (day));

 $("#id--date").attr("min", tDate.getFullYear().toString() + "-" +
                              (month) + "-" + (day));

 $("#id--hour-selector-quick").val(tDate.getHours());
 $("#id--min-selector-quick").val(tDate.getMinutes());
 $("#id--sec-selector-quick").val(tDate.getSeconds());

 browser.alarms.onAlarm.addListener(alarmFire);
});

function onGot(item) {
  console.log(item);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function alarmFire (alarmInfo) {
  alert("First Alarm Fire! WooHoo! :P");
}

function onAllAlarmsCleared(wasCleared) {
  console.log(wasCleared);
}

function onSave () {
  $("#id--save-btn").html("Saved!");
  setTimeout(() => {
    $("#id--save-btn").html("Save");
  }, 3000);
}
