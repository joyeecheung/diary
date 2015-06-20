var Pikaday = require('pikaday');
var moment = require('moment');
var util = require('./util');

window.addEventListener('load', function() {
  var calendar = document.getElementById('calendar');
  var lastDate = new Date(calendar.getAttribute('data-last-date'));
  var firstDate = new Date(calendar.getAttribute('data-first-date'));

  var picker = new Pikaday({
    onSelect: function(date) {
      var time = moment(date);
      window.location.href += time.format('YYYY/MM/YYYY-MM-DD') + '.html';
      // a bug of pikaday whose fix is still not released
    },
    i18n: {
        previousMonth : '&lt;&lt;',
        nextMonth     : '&gt;&gt;',
        months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
        weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    },
    minDate: firstDate,
    maxDate: lastDate
  });

  calendar.appendChild(picker.el);

  var buttons = picker.el.getElementsByTagName('button');
  // var lastButton = getButtonByDate(buttons, lastDate);
  // util.addClass(lastButton.parentNode, 'last-update');

  document.querySelector('.pika-prev').textContent = '<<';
  document.querySelector('.pika-next').textContent = '>>';
});

function getButtonByDate(buttons, date) {
  var year, month, day;
  var targetYear = date.getFullYear(),
      targetMonth = date.getMonth(),
      targetDay = date.getDate();
  for (var i = 0; i < buttons.length; ++i) {
    year = parseInt(buttons[i].getAttribute('data-pika-year'));
    month = parseInt(buttons[i].getAttribute('data-pika-month'));
    day = parseInt(buttons[i].getAttribute('data-pika-day'));
    if (year === targetYear && month === targetMonth
        && day === targetDay) {
      return buttons[i];
    }
  }
}