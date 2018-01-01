function setAlarm (key) {
  let gettingItem = browser.storage.local.get(key);
  gettingItem.then((item) => {
    let w = parseInt(item[key].uepoch);
    let reminder = item[key].rmd;

    browser.alarms.create(key, {
     when: w
    });
  });
}

browser.alarms.onAlarm.addListener((alarm) => {
  let gettingItem = browser.storage.local.get(alarm.name);
  gettingItem.then((item) => {
    item[alarm.name].upcoming = "false";
    alert(item);
    browser.storage.local.set({[alarm.name] : item[alarm.name]});
    browser.notifications.create({
      "type": "basic",
      "title": "Assitant Reminder Says: ",
      "message": item[alarm.name].rmd,
      "iconUrl": "../icons/asst-reminder-32.png"
    });
  });
});

function onError (error) {
  console.log(`${error}`);
}
