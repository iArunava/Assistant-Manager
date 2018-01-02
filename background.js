function setAlarm (key) {
  let gettingItem = browser.storage.local.get(key);
  gettingItem.then((item) => {
    if (item[key].upcoming == "false") {
      item[key].upcoming = "true";
      browser.storage.local.set({[key] : item[key]});
      clearAlarm.then((wasCleared) => {
        console.log(wasCleared);
      });
    }
    let clearAlarm = browser.alarms.clear(key);
    clearAlarm.then(() => {
      let w = parseInt(item[key].uepoch);
      let reminder = item[key].rmd;
      browser.alarms.create(key, {
       when: w
      });
    });
  });
}

browser.alarms.onAlarm.addListener((alarm) => {
  let gettingItem = browser.storage.local.get(alarm.name);
  gettingItem.then((item) => {
    item[alarm.name].upcoming = "false";
    browser.storage.local.set({[alarm.name] : item[alarm.name]});
    browser.notifications.create({
      "type": "basic",
      "title": "Assitant Reminder Says: ",
      "message": item[alarm.name].rmd,
      "iconUrl": "../icons/asst-reminder-32.png"
    });
  });
});

/*browser.storage.onChanged.addListener ((changes, area)=>{
  console.log("asdaadwwwwwwwww");
  console.log(changes);
  console.log(area);
});*/

function onError (error) {
  console.log(`${error}`);
}
