function setAlarm (item, key) {
  if (item.upcoming == "false") {
    item.upcoming = "true";
    browser.storage.local.set({[key] : item});
  }
  let clearAlarm = browser.alarms.clear(key);
  clearAlarm.then(() => {
    let w = parseInt(item.uepoch);
    let reminder = item.rmd;
    browser.alarms.create(key, {
     when: w
    });
  });
}

browser.alarms.onAlarm.addListener((alarm) => {
  let gettingItem = browser.storage.local.get(alarm.name);

  gettingItem.then((item) => {
    if (item[alarm.name] == undefined) return;

    createNotification (item[alarm.name].rmd);

    item[alarm.name].upcoming = "false";

    let updateItems = browser.storage.local.set({[alarm.name] : item[alarm.name]});
    $("#id--reminder-"+alarm.name).remove();
    updateItem.then(()=> {
      if (document.getElementById("id--reminder-"+alarm.name) !== undefined) {
        appendReminders(item[alarm.name]);
      }
    });

  });
});

browser.storage.onChanged.addListener((changes, area) => {
  let changedItems = Object.keys(changes);

  //console.log(changedItems);
  for (let item of changedItems) {
    //console.log(changes[item].oldValue);
    //console.log(changes[item].newValue);
    //console.log(document.getElementById("id--reminder-"+item));
    if (changes[item].oldValue === undefined && changes[item].newValue !== undefined && document.getElementById("id--reminder-"+item) === null) {
      //console.log("befoew");
      //console.log(changes[item]);
      if (document.getElementById("id--no-upc-rmd") !== undefined) {
        onRemindersFetched({[changes[item].newValue.key] : changes[item].newValue});
      }
      //console.log("after");
    }
  }
});

browser.runtime.onStartup.addListener(() => {
  /* Greeting Message */
  let tTime = (new Date()).getHours();
  let gMsg = "";
  if (tTime >= 3 && tTime < 12) gMsg = "Good Morning! :)";
  else if (tTime >= 12 && tTime < 18) gMsg = "Good Afternoon! :)"
  else gMsg = "Good Evening! :)"
  createNotification(gMsg);

  let gettingItem = browser.storage.local.get();
  gettingItem.then((obj) => {
    let currEpoch = Math.round((new Date()).getTime());
    Object.values(obj).forEach((reminderObj) => {
      if (reminderObj.uepoch < currEpoch) {
        createNotification (reminderObj.rmd);
        reminderObj.upcoming = "false";
        browser.storage.local.set({[reminderObj.key] : reminderObj});
      }
    });
  }, onError);
});

browser.runtime.onInstalled.addListener((details)=> {
  console.log(details.reason);
  deleteAll();
});

function createNotification (reminder) {
    browser.notifications.create({
      "type": "basic",
      "title": "Assitant Reminder Says: ",
      "message": reminder,
      "iconUrl": "../icons/asst-reminder-32.png"
    });
}

function clearThisAlarm(key) {
  browser.alarms.clear(key);
}

function deleteAll () {
  browser.alarms.clearAll();
  browser.storage.local.clear();
}

function onError (error) {
  console.log(`${error}`);
}
