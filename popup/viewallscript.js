var remInUp = false;
var remInOn = false;
var inter = 30000;
var seenKeysDict = [];

const REPEATONCE = "Once";
const REPEATDAILY = "Daily";
const REPEATWEEK = "Weekly";
const REPEATMONTH = "Monthly";
const REPEATYEAR = "Yearly";

const showOnlyDict = {
         "id--show-only-all-rmd"    : "id--s-all-tick",
         "id--show-only-green-rmd"  : "id--s-green-tick",
         "id--show-only-red-rmd"    : "id--s-red-tick",
         "id--show-only-blue-rmd"   : "id--s-blue-tick",
         "id--show-only-purple-rmd" : "id--s-purple-tick",
         "id--show-only-lime-rmd"   : "id--s-lime-tick",
         "id--show-only-orange-rmd" : "id--s-orange-tick"
        }

const monthDict = ["January", "February", "March", "April",
                   "May", "June", "July", "August", "September",
                   "October", "November", "December"];

const numSuffix = ["th", "st", "nd", "rd"];

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
  Object.values(obj).forEach((reminderObj) => {
    var tKey = reminderObj.key;

    // Returning if the option is of settings (and not reminder)
    console.log(tKey);
    if (tKey == null || tKey == undefined) return;

    if (showThisReminder(reminderObj.color) !== true) return;

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
  var ttDate = dateToWords(reminderObj.date);
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
        <p> Upcoming on: <span class="class--reminder-date-time"> ${ttDate} </span> at: <span class="class--reminder-date-time"> ${reminderObj.hrs}:${reminderObj.min}:${reminderObj.secs} </span></p>
        <div class="margin--top-10">
      </div>
      <div class="margin--top-10">
    </div>
  `;

  return template;
}

function dateToWords(tDate) {
  let date = tDate.slice(8, 10);
  let month = monthDict[parseInt(tDate.slice(5, 7))-1];
  let year = tDate.slice(0, 4);
  if (date[0] !== '1') date += numSuffix[parseInt(date[1] >= '4' ? '0' : date[1])];
  else date += "th";
  return (date + " " + month + ", "  + year);
}

function getSnoozeMinutes() {
  let minArr = [1, 2, 5, 10];
  for (let i = 0; i < minArr.length; ++i) {
    let tempId = "id--s" + minArr[i].toString() + "-tick";
    if (!$("#" + tempId).hasClass("class--display-none")) return minArr[i];
  }
}

function snoozeTill (nEpoch, item, tKey) {
  let getBgdPg = browser.runtime.getBackgroundPage();
  getBgdPg.then((page) => {
    let nDate = new Date(nEpoch);
    let tMonth = (nDate.getMonth() + 1).toString();
    if (tMonth.length === 1) tMonth = '0'+tMonth;

    let tDay = nDate.getDate().toString();
    if (tDay.length === 1) tDay = '0'+tDay;

    item[tKey].hrs = nDate.getHours().toString();
    item[tKey].min = nDate.getMinutes().toString();
    item[tKey].secs = nDate.getSeconds().toString();
    item[tKey].date = nDate.getFullYear().toString() + "-" + tMonth + "-" + tDay;
    item[tKey].uepoch = nEpoch;
    item[tKey].upcoming = "false";

    if (item[tKey].hrs.length === 1) item[tKey].hrs = '0'+item[tKey].hrs;
    if (item[tKey].min.length === 1) item[tKey].min = '0'+item[tKey].min;
    if (item[tKey].secs.length === 1) item[tKey].secs = '0'+item[tKey].secs;

    //console.log(item[tKey].date);
    //console.log(nEpoch);

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

$("#id--show-only-ongoing-rmd").click(() => {
  toggleOngUpcButton("ongoing");
  fetchAllNUpdate();
});

$("#id--show-only-upcoming-rmd").click(() => {
  toggleOngUpcButton("upcoming");
  fetchAllNUpdate();
});

$("#id--show-only-all-rmd").click(() => {
  Object.keys(showOnlyDict).forEach((key) => {
    if (key !== "id--show-only-all-rmd") {
      $("#"+showOnlyDict[key]).addClass("class--display-none");
    } else $("#"+showOnlyDict[key]).removeClass("class--display-none");
  });
  fetchAllNUpdate();
});

$("#id--show-only-green-rmd").click(() => {
  switchOffShowAll();
  toggleShowOnlyButton("id--show-only-green-rmd");
  fetchAllNUpdate();
});

$("#id--show-only-red-rmd").click(() => {
  switchOffShowAll();
  toggleShowOnlyButton("id--show-only-red-rmd");
  fetchAllNUpdate();
});

$("#id--show-only-blue-rmd").click(() => {
  switchOffShowAll();
  toggleShowOnlyButton("id--show-only-blue-rmd");
  fetchAllNUpdate();
});

$("#id--show-only-orange-rmd").click(() => {
  switchOffShowAll();
  toggleShowOnlyButton("id--show-only-orange-rmd");
  fetchAllNUpdate();
});

$("#id--show-only-lime-rmd").click(() => {
  switchOffShowAll();
  toggleShowOnlyButton("id--show-only-lime-rmd");
  fetchAllNUpdate();
});

$("#id--show-only-purple-rmd").click(() => {
  switchOffShowAll();
  toggleShowOnlyButton("id--show-only-purple-rmd");
  fetchAllNUpdate();
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

function toggleOngUpcButton(ongOrUpcRmd) {
  if ($("#id--s-"+ongOrUpcRmd+"-tick").hasClass("class--display-none")) {
    $("#id--s-"+ongOrUpcRmd+"-tick").removeClass("class--display-none");
    if ($("#id--"+ongOrUpcRmd+"-reminders-top-div").hasClass("class--display-none")) {
      $("#id--"+ongOrUpcRmd+"-reminders-top-div").removeClass("class--display-none");
    }
  } else {
    $("#id--s-"+ongOrUpcRmd+"-tick").addClass("class--display-none");
    if (!$("#id--"+ongOrUpcRmd+"-reminders-top-div").hasClass("class--display-none")) {
      $("#id--"+ongOrUpcRmd+"-reminders-top-div").addClass("class--display-none");
    }
  }

  if ((!$("#id--ongoing-reminders-top-div").hasClass("class--display-none")) && (!$("#id--upcoming-reminders-top-div").hasClass("class--display-none"))) {
      if ($("#hr--upc-ong-seperator").hasClass("class--display-none"))
        $("#hr--upc-ong-seperator").removeClass("class--display-none");
  } else {
      if (!$("#hr--upc-ong-seperator").hasClass("class--display-none")) {
        $("#hr--upc-ong-seperator").addClass("class--display-none");
      }
  }
}

function toggleShowOnlyButton(showOnlyID) {
  if ($("#"+showOnlyDict[showOnlyID]).hasClass("class--display-none")) {
    $("#"+showOnlyDict[showOnlyID]).removeClass("class--display-none");
  } else $("#"+showOnlyDict[showOnlyID]).addClass("class--display-none");
}

function switchOffShowAll() {
  if (!$("#id--s-all-tick").hasClass("class--display-none")) {
    $("#id--s-all-tick").addClass("class--display-none");
  }
}

function showThisReminder(color) {
  color = color.toLowerCase();
  if (!$("#id--s-all-tick").hasClass("class--display-none")) return true;
  if (!$("#id--s-"+color+"-tick").hasClass("class--display-none")) return true;
  return false;
}

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
