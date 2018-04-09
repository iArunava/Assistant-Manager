var headers = [
    'Show Notifications',
    'Make sound on Notification',
    'Snooze Time',
    'Show Ongoing or Upcoming',
    'Show Color Reminder',
    'Greet me with Good Morning or Evening or Afternoon',
    'Notification Sound'
]

var options = [
    ['Yes', 'No'],
    ['Yes', 'No'],
    ['1', '2', '5', '10'],
    ['Ongoing', 'Upcoming'], //Removed the option 'Both' as it was introducing bugs, look into it later and the option back
    ['All', 'Green', 'Red', 'Blue', 'Orange', 'Lime', 'Purple'],
    ['Yes', 'No'],
    ['Pling', 'Blop', 'Pop Cork', 'Ting', 'Whip']
]

const precedor = 'settings__';

$(document).ready(function() {
    inflateOptions();
});

function inflateOptions() {
    for (let i in headers) {
        let setOption = browser.storage.local.get(precedor+replaceSpacesWith(headers[i]));
        setOption.then(obj => {
            Object.values(obj).forEach(settingsObj => {
                $('#settings--options-1').append(oneSettingTemplate(headers[i], options[i], settingsObj));
            })
        });
    }
}

function oneSettingTemplate(header, option, setOption) {
    var template = `
    <div>
        <p class='class--sub-title'> <span class='class--theme-color'>${header[0].toUpperCase()}</span>${header.slice(1)}</p>
        <div class='btn-group btn-group-toggle' data-toggle='buttons'>
            ${option.map(optn =>
                `<label class='btn btn-secondary ${checkedNotChecked(optn, setOption)}'>
                    <input type='radio' name='${replaceSpacesWith(header)}' id='option--${replaceSpacesWith(header)}-${replaceSpacesWith(optn)}' autocomplete='off'> ${optn}
                </label>`
            ).join('')}
        </div>
    </div>
    <hr class='hr--subtitle' />
    `;
    return template;
}

function checkedNotChecked(optn, setOption) {
    return `
        ${optn == setOption ? `focus active` : ``}
    `;
}

function replaceSpacesWith(str) {
    return str.toString().split(' ').join('-');
}

$('#id--save-settings').click(() => {
    $('#settings--options-1').find('input').each((index, obj) => {

        $('#id--save-settings').prop('disabled', true);
        $('#id--save-settings').html('Saved!');

        let key = precedor + obj.name;
        // NOTE: When first clicked on a different <input> under a category,
        // the focus class is present in the <label>
        // of the initially selected <input>
        // So, using the active class together
        if ($('#'+obj.id).parent().hasClass('active')) {
            console.log(key, obj.nextSibling.nodeValue.trim());
            browser.storage.local.set({[key]: obj.nextSibling.nodeValue.trim()});
        }
    });
    setTimeout(() => {
        $('#id--save-settings').prop('disabled', false);
        $('#id--save-settings').html('Save Settings');
    }, 1500);
});
