var Pikaday = require('pikaday');
var moment = require('moment');

window.addEventListener('load', function() {
  var picker = new Pikaday({
    onSelect: function(date) {
      var time = moment(date);
      window.location.href += time.format('YYYY/MM/YYYY-MM-DD') + '.html';
    },
    i18n: {
        previousMonth : '&lt;&lt;',
        nextMonth     : '&gt;&gt;',
        months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
        weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    },
    minDate: new Date('2015-04-23'),
    maxDate: new Date()
  });

  document.getElementById('calendar').appendChild(picker.el);

  document.querySelector('.pika-prev').textContent = '<<';
  document.querySelector('.pika-next').textContent = '>>';
})
