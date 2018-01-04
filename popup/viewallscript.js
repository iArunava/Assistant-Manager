$(document).ready(function () {
  let gettingItem = browser.storage.local.get();
  gettingItem.then(onRemindersFetched, onError);
});

function onRemindersFetched(obj, attachEvents = true) {
  Object.values(obj).forEach((reminderObj) => {
    var tKey = reminderObj.key;

    appendReminders(reminderObj);

    if (!attachEvents) return;

    $(document).on('click', '#id--snooze-'+tKey, () => {
      $("#id--snooze-"+tKey).prop("disabled", true);
      $("#id--reminder-" + tKey).remove();
      let gettingItem = browser.storage.local.get(tKey);
      gettingItem.then((item) => {
        let nEpoch = Math.max(item[tKey].uepoch, (Math.round((new Date()).getTime())))+10000;
        let getBgdPg = browser.runtime.getBackgroundPage();
        getBgdPg.then((page) => {
          item[tKey].uepoch = nEpoch;
          let settingAlarm = page.setAlarm(item[tKey], tKey);
          item[tKey].upcoming = "true";
          appendReminders (item[tKey], true)
          //onRemindersFetched(item, false);
          $("#id--snooze-"+tKey).html("Snoozed!");
          setTimeout(() => {
            $("#id--snooze-"+tKey).html("Snooze");
            $("#id--snooze-"+tKey).prop("disabled", false);
          }, 500);
        }, onError);
      });
    });

    $(document).on('click', '#id--delete-rmd-'+tKey, ()=> {
      let removeStorage = browser.storage.local.remove(tKey);
      removeStorage.then(() => {
        let getBgdPg = browser.runtime.getBackgroundPage();
        getBgdPg.then ((page) => {
          page.clearThisAlarm(tKey);
        });
        $("#id--reminder-" + tKey).remove();
      }, onError);
    });
  });
}

function appendReminders (reminderObj, upcming = false) {
    if (reminderObj.upcoming === "true" || upcming) {
      $("#div--upcoming-reminders").append(createReminderTemplate(reminderObj));
    } else $("#div--ongoing-reminders").append(createReminderTemplate(reminderObj));
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
  let getBgdPg = browser.runtime.getBackgroundPage();
  getBgdPg.then ((page) => {
    page.deleteAll();
    $("#id--delete-all").html("Removed!");
    $("#div--upcoming-reminders").empty();
    $("#div--ongoing-reminders").empty();
    setTimeout(() => {
      $("#id--delete-all").html("Remove all Reminders");
      $("#id--delete-all").prop('disabled', false);
    }, 500)
  });
});

function onError(error) {
  console.log(error);
}
