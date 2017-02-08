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

Calendar.prototype._get(field) {
    switch(field) {
    case SECOND:
        return this._date.seconds;

    case MINUTE:
        return this._date.minutes;

    case HOUR:
        return this._date.hours;

    case MONTH:
        return this._date.month;

    case YEAR:
        return this._date.fullYear;

    case DAY_OF_WEEK:
        trace("DAY_OF_WEEK not implement");
        return 0;

    case DAY_OF_MONTH:
        return this._date.day;
    }

    console.log("Calendar._get(): field not implement");
    return 0;
};

Calendar.prototype._set(field, value) {
    switch (field) {
    case SECOND:
        this._date.seconds = value;
        return;

    case MINUTE:
        this._date.minutes = value;
        return;

    case HOUR:
        this._date.hours = value;
        return;

    case MONTH:
        this._date.month = value;
        return;

    case YEAR:
        this._date.fullYear = value;
        return;
    }
    console.log("Calendar._set(): field not implement");
};

Calendar.prototype.getInstance(t) {
    return Calendar._instance;
}

Calendar.prototype.setTime(d) {
    this._date = d;
};

Calendar.prototype.getTime() {
    return this._date;
};

module.exports = Calendar;
