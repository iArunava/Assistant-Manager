var remInUp = false;
var remInOn = false;

$(document).ready(function () {
  let gettingItem = browser.storage.local.get();
  remInUp = false;
  remInOn = false;
  gettingItem.then(onRemindersFetched, onError);


  let sltSnzMins = $("select[name='name--select-snooze-time']");
  let minsAvl = [1, 2, 5, 10];
  for (const snoozeMin in minsAvl) {
    let temp = "<option> " + minsAvl[snoozeMin].toString() + " </option>";
    $(temp).appendTo(sltSnzMins);
  }
});

function onRemindersFetched(obj) {
  //console.log(obj);
  Object.values(obj).forEach((reminderObj) => {
    var tKey = reminderObj.key;

    appendReminders(reminderObj);

    $(document).on('click', '#id--snooze-'+tKey, () => {
      $("#id--snooze-"+tKey).prop("disabled", true);
      $("#id--reminder-" + tKey).remove();
      let gettingItem = browser.storage.local.get(tKey);
      gettingItem.then((item) => {
        let minSelected = $("#id--select-snooze-mins").find(":selected").text();
        let nEpoch = Math.max(item[tKey].uepoch, (Math.round((new Date()).getTime())))+(parseInt(minSelected)*60*1000);
        console.log(nEpoch);
        let getBgdPg = browser.runtime.getBackgroundPage();
        getBgdPg.then((page) => {
          item[tKey].uepoch = nEpoch;
          let settingAlarm = page.setAlarm(item[tKey], tKey);
          item[tKey].upcoming = "true";
          appendReminders (item[tKey], true)
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
        let parentID = $("#id--reminder-"+tKey).parent().attr('id');
        $("#id--reminder-" + tKey).remove();
        if ($("#"+parentID).children().length === 0) {
          console.log($("#"+parentID).children());
          console.log(parentID);
          console.log(parentID == "div--ongoing-reminders");
          if (parentID == "div--ongoing-reminders") {
            $("#id--no-ong-rmd").removeClass("class--display-none");
          }
          if (parentID == "div--upcoming-reminders") {
            $("#id--no-upc-rmd").removeClass("class--display-none");
          }
        }
      }, onError);
    });
  });
  if (remInUp === false) {
    $("#id--no-upc-rmd").removeClass("class--display-none");
  }
  if (remInOn === false) {
    $("#id--no-ong-rmd").removeClass("class--display-none");
  }
}

function appendReminders (reminderObj, upcming = false) {
    if (reminderObj.upcoming === "true" || upcming) {
      $("#div--upcoming-reminders").append(createReminderTemplate(reminderObj));
      if ($("#id--no-upc-rmd").hasClass("class--display-none") === false) {
        $("#id--no-upc-rmd").addClass("class--display-none");
      }
      if ($("#div--ongoing-reminders").children().length == 0) {
        $("#id--no-ong-rmd").removeClass("class--display-none");
      }
      remInUp = true;
    } else {
      $("#div--ongoing-reminders").append(createReminderTemplate(reminderObj));
      if ($("#id--no-ong-rmd").hasClass("class--display-none") === false) {
        $("#id--no-ong-rmd").addClass("class--display-none");
      }
      if ($("#div--upcoming-reminders").children().length == 0) {
        $("#id--no-upc-rmd").removeClass("class--display-none");
      }
      remInOn = true;
    }
}

function createReminderTemplate(reminderObj) {
  var reminder = reminderObj.rmd;
  var tKey = reminderObj.key;

  let template = `
    <div id="id--reminder-${tKey}">
      <div class="margin--top-10">
      <div class="class--rmd-box">
        <div class="margin--top-10">
        <div class="float-right">
          <button id="id--snooze-${tKey}" class="btn btn-outline-primary btn-sm"> Snooze </button>
          <button id="id--delete-rmd-${tKey}" class="btn btn-outline-success btn-sm"> Done </button>
        </div>
        <p class="class--reminder-name"> ${reminder} </p>
        <p> Upcoming on: ${reminderObj.date} at: ${reminderObj.hrs}:${reminderObj.min}:${reminderObj.secs} </p>
        <div class="margin--top-10">
      </div>
      <div class="margin--top-10">
    </div>
  `;

  return template;
}

$("#id--delete-all").click(() => {
  $("#id--delete-all").prop('disabled', true);
  let getBgdPg = browser.runtime.getBackgroundPage();
  $("#id--no-upc-rmd").removeClass("class--display-none");
  $("#id--no-ong-rmd").removeClass("class--display-none");
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
