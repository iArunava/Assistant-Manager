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
    <div>
      <p> ${reminder} </p>
    </div>
  `;

  return template;
}

function onError(error) {
  console.log(error);
}
