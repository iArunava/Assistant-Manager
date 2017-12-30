$(document).ready(function () {
  let gettingItem = browser.storage.local.get();
  gettingItem.then(onRemindersFetched, onError);
});

function onRemindersFetched(obj) {
  console.log(obj);
  Object.values(obj).forEach((reminderObj) => {
    $("#div--upcoming-reminders").append(createReminderTemplate(reminderObj));
  });
}

function createReminderTemplate(reminderObj) {
  var reminder = reminderObj.rmd;

  let template = `
    <div class="margin--top-10">
    <div class="class--rmd-box">
      <p class="class--reminder-name"> ${reminder} </p>
      <p> Upcoming on: ${reminderObj.date} at: ${reminderObj.hrs}:${reminderObj.min}:${reminderObj.secs} </p>
    </div>
    <div class="margin--top-10">
  `;

  return template;
}

function onError(error) {
  console.log(error);
}
