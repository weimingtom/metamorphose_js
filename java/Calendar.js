var Calendar = function() {
    this._date = null;
};

Calendar.SECOND = 1;
Calendar.MINUTE = 2;
Calendar.HOUR = 3;
Calendar.DAY_OF_MONTH = 4;
Calendar.MONTH = 5;
Calendar.YEAR = 6;
Calendar.DAY_OF_WEEK = 7;

Calendar.SUNDAY = 8;
Calendar.MONDAY = 9;
Calendar.TUESDAY = 10;
Calendar.WEDNESDAY = 11;
Calendar.THURSDAY = 12;
Calendar.FRIDAY = 13;
Calendar.SATURDAY = 14;

Calendar.JANUARY = 15;
Calendar.FEBRUARY = 16;
Calendar.MARCH = 17;
Calendar.APRIL = 18;
Calendar.MAY = 19;
Calendar.JUNE = 20;
Calendar.JULY = 21;
Calendar.AUGUST = 22;
Calendar.SEPTEMBER = 23;
Calendar.OCTOBER = 24;
Calendar.NOVEMBER = 25;
Calendar.DECEMBER = 26;

Calendar._instance = new Calendar();

Calendar.prototype._get = function(field) {
    switch(field) {
    case Calendar.SECOND:
        return this._date.seconds;

    case Calendar.MINUTE:
        return this._date.minutes;

    case Calendar.HOUR:
        return this._date.hours;

    case Calendar.MONTH:
        return this._date.month;

    case Calendar.YEAR:
        return this._date.fullYear;

    case Calendar.DAY_OF_WEEK:
        console.log("DAY_OF_WEEK not implement");
        return 0;

    case Calendar.DAY_OF_MONTH:
        return this._date.day;
    }

    console.log("Calendar._get(): field not implement");
    return 0;
};

Calendar.prototype._set = function(field, value) {
    switch (field) {
    case Calendar.SECOND:
        this._date.seconds = value;
        return;

    case Calendar.MINUTE:
        this._date.minutes = value;
        return;

    case Calendar.HOUR:
        this._date.hours = value;
        return;

    case Calendar.MONTH:
        this._date.month = value;
        return;

    case Calendar.YEAR:
        this._date.fullYear = value;
        return;
    }
    console.log("Calendar._set(): field not implement");
};

Calendar.prototype.getInstance = function(t) {
    return Calendar._instance;
};

Calendar.prototype.setTime = function(d) {
    this._date = d;
};

Calendar.prototype.getTime = function() {
    return this._date;
};

module.exports = Calendar;
