var remInUp = false;
var remInOn = false;
var inter = 30000;
var lObj;
var seenKeysDict = [];

const REPEATONCE = "Once";
const REPEATDAILY = "Daily";
const REPEATWEEK = "Weekly";
const REPEATMONTH = "Monthly";
const REPEATYEAR = "Yearly";

$(document).ready(function () {
  fetchAllNUpdate();
  /*setInterval(() => {
    fetchAllNUpdate();
  }, inter)*/

  let sltSnzMins = $("select[name='name--select-snooze-time']");
  let minsAvl = [1, 2, 5, 10];
  for (const snoozeMin in minsAvl) {
    let temp = "<option> " + minsAvl[snoozeMin].toString() + " </option>";
    $(temp).appendTo(sltSnzMins);
  }
});

function onRemindersFetched(obj) {
  /*if (obj !== lObj) {
    lObj = obj;
  } else return;
  console.log(obj == lObj);
  console.log(obj);
  console.log("from onRemindersFetched");*/
  Object.values(obj).forEach((reminderObj) => {
    var tKey = reminderObj.key;

    console.log(tKey);
    appendReminders(reminderObj);

    // Not Attaching Listeners if previously attached
    if (seenKeysDict[tKey] !== undefined) return;
    seenKeysDict[tKey] = 1;

    $(document).on('click', '#id--snooze-'+tKey, () => {
      let gettingItem = browser.storage.local.get(tKey);
      gettingItem.then((item) => {
        let minSelected = getSnoozeMinutes();
        let nEpoch = Math.max(item[tKey].uepoch, (Math.round((new Date()).getTime())))+(parseInt(minSelected)*60*1000);
        snoozeTill(nEpoch, item, tKey);
      });
    });

    $(document).on('click', '#id--done-rmd-'+tKey, ()=> {
      let getReminder = browser.storage.local.get(tKey);
      getReminder.then((item) => {
        let tRepeat = item[tKey].repeat;
        let nEpoch = 0;
        console.log(tRepeat);
        switch (tRepeat) {
          case REPEATONCE:
            $("#id--delete-rmd-"+tKey).trigger("click");
            break;
          case REPEATDAILY:
            nEpoch = Math.round((getNextDay(new Date(item[tKey].uepoch))).getTime());
            snoozeTill(nEpoch, item, tKey);
            break;
          case REPEATWEEK:
            nEpoch = Math.round((getNextWeek(new Date(item[tKey].uepoch))).getTime());
            snoozeTill(nEpoch, item, tKey);
            break;
          case REPEATMONTH:
            nEpoch = Math.round((getNextMonth(new Date(item[tKey].uepoch))).getTime());
            snoozeTill(nEpoch, item, tKey);
            break;
          case REPEATYEAR:
            nEpoch = Math.round((getNextYear(new Date(item[tKey].uepoch))).getTime());
            snoozeTill(nEpoch, item, tKey);
            break;
          default:
            break;
        }
      }, onError);
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
          /*console.log($("#"+parentID).children());
          console.log(parentID);
          console.log(parentID == "div--ongoing-reminders");*/
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
  var tColor = reminderObj.color.toLowerCase();
  let disabledStr = "";

  if (reminderObj.repeat !== "Once") disabledStr = "disabled";

  let template = `
    <div id="id--reminder-${tKey}">
      <div class="margin--top-10">
      <div class="class--rmd-box class--background-color-${tColor}">
        <div class="margin--top-10">
        <div class="float-right">
          <button id="id--snooze-${tKey}" class="btn btn-outline-primary btn-sm" ${disabledStr}> Snooze </button>
          <button id="id--done-rmd-${tKey}" class="btn btn-outline-success btn-sm"> Done </button>
          <button id="id--delete-rmd-${tKey}" class="btn btn-outline-success btn-sm"> Delete </button>
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

function getSnoozeMinutes() {
  let minArr = [1, 2, 5, 10];
  for (let i = 0; i < minArr.length; ++i) {
    let tempId = "id--s" + minArr[i].toString() + "-tick";
    if (!$("#" + tempId).hasClass("class--display-none")) return minArr[i];
  }
}

/* TODO: Clicking "Snooze" on reminders that are repeated for
  "daily", "weekly", "Monthly", or "Yearly" then the remiders are
  snoozed to the minutes selected.

  TODO: Also, when reminders which are repeated more then once like "weekly"
  then on clicking "Done" only the reminder gets snoozed for that period starting
  from the ~period which is the time when "Done" is clicked~
  this is wrong as it should repeat at time when the user has initially mentioned.
  */
function snoozeTill (nEpoch, item, tKey) {
  let getBgdPg = browser.runtime.getBackgroundPage();
  getBgdPg.then((page) => {
    let nDate = new Date(nEpoch);
    let tMonth = (nDate.getMonth() + 1).toString();
    if (tMonth.length === 1) tMonth = '0'+tMonth;

    let tDay = nDate.getDate().toString();
    if (tDay.length === 1) tday = '0'+tDay;

    item[tKey].hrs = nDate.getHours();
    item[tKey].min = nDate.getMinutes();
    item[tKey].secs = nDate.getSeconds();
    item[tKey].date = nDate.getFullYear().toString() + "-" + tMonth + "-" + tDay;
    item[tKey].uepoch = nEpoch;
    item[tKey].upcoming = "false";

    console.log(item[tKey].date);
    console.log(nEpoch);

    let settingAlarm = page.setAlarm(item[tKey], tKey);
    $("#id--snooze-"+tKey).html("Snoozed!");
    setTimeout(() => {
      $("#id--snooze-"+tKey).html("Snooze");
      $("#id--snooze-"+tKey).prop("disabled", false);
    }, 500);
  }, onError);
}

$("#id--snooze-1min").click(()=> {
  $("#id--s1-tick").removeClass("class--display-none");
  if (!$("#id--s2-tick").hasClass("class--display-none")) { $("#id--s2-tick").addClass("class--display-none"); }
  if (!$("#id--s5-tick").hasClass("class--display-none")) { $("#id--s5-tick").addClass("class--display-none"); }
  if (!$("#id--s10-tick").hasClass("class--display-none")) { $("#id--s10-tick").addClass("class--display-none"); }
});

$("#id--snooze-2min").click(()=> {
  $("#id--s2-tick").removeClass("class--display-none");
  if (!$("#id--s1-tick").hasClass("class--display-none")) { $("#id--s1-tick").addClass("class--display-none"); }
  if (!$("#id--s5-tick").hasClass("class--display-none")) { $("#id--s5-tick").addClass("class--display-none"); }
  if (!$("#id--s10-tick").hasClass("class--display-none")) { $("#id--s10-tick").addClass("class--display-none"); }
});

$("#id--snooze-5min").click(()=> {
  $("#id--s5-tick").removeClass("class--display-none");
  if (!$("#id--s2-tick").hasClass("class--display-none")) { $("#id--s2-tick").addClass("class--display-none"); }
  if (!$("#id--s1-tick").hasClass("class--display-none")) { $("#id--s1-tick").addClass("class--display-none"); }
  if (!$("#id--s10-tick").hasClass("class--display-none")) { $("#id--s10-tick").addClass("class--display-none"); }
});

$("#id--snooze-10min").click(()=> {
  $("#id--s10-tick").removeClass("class--display-none");
  if (!$("#id--s2-tick").hasClass("class--display-none")) { $("#id--s2-tick").addClass("class--display-none"); }
  if (!$("#id--s5-tick").hasClass("class--display-none")) { $("#id--s5-tick").addClass("class--display-none"); }
  if (!$("#id--s1-tick").hasClass("class--display-none")) { $("#id--s1-tick").addClass("class--display-none"); }
});

$("#button--the-refresh-btn").click(()=> {
  fetchAllNUpdate();
});

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

function getNextDay(cDate) {
  let nDate = cDate;
  nDate.setDate(cDate.getDate()+1);
  return nDate;
}

function getNextWeek(cDate) {
  let nDate = cDate;
  nDate.setDate(cDate.getDate()+7);
  return nDate;
}

function getNextMonth(cDate) {
  let nDate = cDate;
  nDate.setMonth(cDate.getMonth()+1);
  return nDate;
}

function getNextYear(cDate) {
  let nDate = cDate;
  nDate.setYear(cDate.getFullYear()+1);
  return nDate;
}

function clearScreen() {
  $("#div--ongoing-reminders").empty();
  $("#div--upcoming-reminders").empty();
}

function fetchAllNUpdate() {
    let gettingItem = browser.storage.local.get();
    remInUp = false;
    remInOn = false;
    clearScreen();
    gettingItem.then(onRemindersFetched, onError);
}

function onError(error) {
  console.log(error);
}
