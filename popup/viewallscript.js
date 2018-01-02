$(document).ready(function () {
  let gettingItem = browser.storage.local.get();
  gettingItem.then(onRemindersFetched, onError);
});

function onRemindersFetched(obj) {
  Object.values(obj).forEach((reminderObj) => {
    var tKey = reminderObj.key;

    if (reminderObj.upcoming == "true") {
      $("#div--upcoming-reminders").append(createReminderTemplate(reminderObj));
    } else $("#div--ongoing-reminders").append(createReminderTemplate(reminderObj));

    $("#id--snooze-" + tKey).click(() => {
      $("#id--snooze-"+tKey).prop("disabled", true);
      let gettingItem = browser.storage.local.get(tKey);
      gettingItem.then((item) => {
        item[tKey].uepoch = (Math.round((new Date()).getTime()))+10000;
        let updating = browser.storage.local.set({[tKey] : item[tKey]});
        updating.then(()=>{
          let settingAlarm = browser.runtime.getBackgroundPage();
          settingAlarm.then((page) => {
            page.setAlarm(tKey);
            $("#id--snooze-"+tKey).html("Snoozed!");
            setTimeout(() => {
              $("#id--snooze-"+tKey).html("Snooze");
              $("#id--snooze-"+tKey).prop("disabled", false);
            }, 500);
          }, onError);
        }, onError);
      });
    });

    $("#id--delete-rmd-" + tKey).click(()=> {
      let removeStorage = browser.storage.local.remove(tKey);
      browser.alarms.clear(tKey);
      removeStorage.then(() => {
        $("#id--reminder-" + tKey).remove();
      }, onError);
    });
  });
}

function createReminderTemplate(reminderObj) {
  var reminder = reminderObj.rmd;
  var tKey = reminderObj.key;

  let template = `
    <div id="id--reminder-${tKey}" class="class--rmd-box">
      <div class="margin--top-10">
      <div class="float-right">
        <button id="id--snooze-${tKey}" class="btn btn-outline-primary btn-sm"> Snooze </button>
        <button id="id--delete-rmd-${tKey}" class="btn btn-outline-success btn-sm"> Done </button>
      </div>
      <p class="class--reminder-name"> ${reminder} </p>
      <p> Upcoming on: ${reminderObj.date} at: ${reminderObj.hrs}:${reminderObj.min}:${reminderObj.secs} </p>
      <div class="margin--top-10">
    </div>
  `;

  return template;
}

$("#id--delete-all").click(() => {
  var clearAlarms = browser.alarms.clearAll();
  clearAlarms.then(onAllAlarmsCleared);

  var clearStorage = browser.storage.local.clear();
  clearStorage.then(()=> {
    $("#div--upcoming-reminders").empty();
    $("#div--ongoing-reminders").empty();
  }, onError);
});

function onAllAlarmsCleared(wasCleared) {
  console.log(wasCleared);
}

function onError(error) {
  console.log(error);
}
