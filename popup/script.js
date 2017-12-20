const NOTITITLE = "Assistant Reminder says:";
var tDate = new Date();

$(document).ready(function() {

  $("#id--save-btn").click(function() {
      let reminder   = $("#id--the-reminder").val();
      let setDate    = $("#id--date").val();
      let setHours   = $("#id--hour-selector-quick").val();
      let setMinutes = $("#id--min-selector-quick").val();
      let setSeconds = $("#id--sec-selector-quick").val();

      browser.notifications.create({
        "type": "basic",
        "title": NOTITITLE,
        "message": reminder,
        "iconUrl": "../icons/asst-reminder-32.png"
      });

      if (document.getElementById("id--date").checkValidity() == true) {
        browser.storage.local.set({
          reminder: {rmd: reminder,
                     hrs: setHours,
                     min: setMinutes,
                     secs: setSeconds,
                     date: setDate}
        });
      } else alert ("Invalid Date!");
  });

  $("#id--cancel-btn").click(function() {
    window.close();
  });

  let month = ("0" + (tDate.getMonth() + 1)).slice(-2);
  let day = ("0" + (tDate.getDate() + 1)).slice(-2);

  $("#id--date").attr("value", tDate.getFullYear().toString() + "-" +
                               (month) + "-" + (day));

 $("#id--date").attr("min", tDate.getFullYear().toString() + "-" +
                              (month) + "-" + (day));
});

function onGot(item) {
  console.log(item);
}

function onError(error) {
  console.log(`Error: ${error}`);
}
