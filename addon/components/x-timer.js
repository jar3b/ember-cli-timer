import Ember from 'ember';
import Formatter from '../utils/timeformatter';

export default Ember.Component.extend({
  startTimeStamp: 0,
  endTimeStamp: 0,
  duration: 0,
  autoStart: false,
  startTime: 0,
  endTime: 0,
  stopRequired: true,
  isStopWatch: false,
  //TODO: check the usage of this variable
  isRunning: false,
  format: "HH:MM:SS",

  didInsertElement: function () {
    if (this.get("autoStart")) {
      this.send("start");
    }
  },

  showStartBtn: function () {
    return this.get("isStopWatch") || !this.get("autoStart");
  }.property('autoStart', 'isStopWatch'),

  run: function () {
    const self = this;
    const startTimeStamp = this.get("startTimeStamp");
    this.set('timerId', Ember.run.later(this, function () {
      const timeElapsed = Date.now() - startTimeStamp;
      const secs = timeElapsed / 1000;
      self.set("duration", Formatter.getTimefromSecs(secs, self.get('format')));
      self.run();
    }, 25));
  },

  runDown: function () {
    const self = this;
    const endTimeStamp = this.get("endTimeStamp");
    this.set('timerId', Ember.run.later(this, function () {
      const timeLeft = endTimeStamp - Date.now();
      const secsLeft = timeLeft / 1000;
      if (secsLeft <= 0) {
        this.send('stop');
        this.sendAction("timeExceed");
      }
      self.set("duration", Formatter.getTimefromSecs(secsLeft, self.get('format')));
      self.runDown();
    }, 25));
  },

  actions: {
    start: function () {
      const startTime = this.get("startTime");
      const endTime = this.get("endTime");
      const duration = this.get("duration");
      const endAt = duration ? Formatter.getSecs(duration, this.get('format')) * 1000 : 0;
      if (startTime) {
        this.set("startTimeStamp", Date.now() - (endAt || startTime * 1000));
        this.set("isRunning", true);
        this.run();
      } else if (endTime) {
        this.set("endTimeStamp", Date.now() + (endAt || endTime * 1000));
        this.set("isRunning", true);
        this.runDown();
      }
    },

    stop: function (reset) {
      const timerId = this.get("timerId");
      const duration = this.get("duration");
      Ember.run.cancel(timerId);
      this.sendAction("updateRecordedTime", duration);
      this.set("isRunning", false);
      if (reset) {
        this.set("startTimeStamp", 0);
        this.set("endTimeStamp", 0);
        this.set("duration", 0);
      }
    },

    pause: function () {
      const duration = this.get("duration");
      const isRunning = this.get("isRunning");
      if (isRunning) {
        this.set("startTimeStamp", Formatter.getSecs(duration, this.get('format')));
        this.set("endTimeStamp", Formatter.getSecs(duration, this.get('format')));
        this.sendAction("updatePausedTime", duration);
        this.send("stop");
      } else {
        this.send("start");
      }
    }
  },

  willDestroyElement: function () {
    const timerId = this.get("timerId");
    Ember.run.cancel(timerId);
  }

});
