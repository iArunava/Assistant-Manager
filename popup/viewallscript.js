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

    $(document).on('click', '#id--snooze-'+tKey, () => {
      $("#id--snooze-"+tKey).prop("disabled", true);
      let gettingItem = browser.storage.local.get(tKey);
      gettingItem.then((item) => {
        item[tKey].uepoch = Math.max(item[tKey].uepoch, (Math.round((new Date()).getTime())))+10000;
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

    $(document).on('click', '#id--delete-rmd-'+tKey, ()=> {
      let removeStorage = browser.storage.local.remove(tKey);
      removeStorage.then(() => {
        console.log(tKey);
        //TODO: Clearing Alarms are returing false and no further firing of alarms
        /*let clearThisAlarm = browser.alarms.clear(tKey);
        clearThisAlarm.then(onAllAlarmsCleared, onError);*/
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
  $("#id--delete-all").prop('disabled', true);
  //TODO: Clearing Alarms are returing false and no further firing of alarms
  /*var clearAlarms = browser.alarms.clearAll();
  clearAlarms.then(onAllAlarmsCleared);*/

  var clearStorage = browser.storage.local.clear();
  clearStorage.then(()=> {
    $("#div--upcoming-reminders").empty();
    $("#div--ongoing-reminders").empty();
    $("#id--delete-all").html("Removed!");
    setTimeout(() => {
      $("#id--delete-all").html("Remove all Reminders");
      $("#id--delete-all").prop('disabled', false);
    }, 500)
  }, onError);
});

function onAllAlarmsCleared(wasCleared) {
  console.log(wasCleared);
}

function onError(error) {
  console.log(error);
}
