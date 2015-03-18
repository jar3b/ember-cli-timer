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

  didInsertElement: function(){
    if(this.get("autoStart")){
      this.send("start");
    }
  },

  showStartBtn: function(){
    return this.get("isStopWatch") || !this.get("autoStart");
  }.property('autoStart', 'isStopWatch'),

  run: function(){
    var self = this;
    var startTimeStamp = this.get("startTimeStamp");
    this.set('timerId', Ember.run.later(this, function() {
      var timeElapsed = Date.now() - startTimeStamp;
      var secs = timeElapsed / 1000;
      self.set("duration", Formatter.getTimefromSecs(secs, "HH:MM:SS"));
      self.run();
    }, 25));
  },

  runDown: function(){
    var self = this;
    var endTimeStamp = this.get("endTimeStamp");
    this.set('timerId', Ember.run.later(this, function() {
      var timeLeft = endTimeStamp - Date.now();
      var secsLeft = timeLeft / 1000;
      self.set("duration", Formatter.getTimefromSecs(secsLeft, "HH:MM:SS"));
      self.runDown();
    }, 25));
  },

  actions: {
    start: function(){
      var startTime = this.get("startTime");
      var endTime = this.get("endTime");
      var duration = this.get("duration");
      var endAt = duration ? Formatter.getSecs(duration)*1000 : 0;
      if(startTime) {
        this.set("startTimeStamp", Date.now() - (endAt || startTime*1000));
        this.set("isRunning", true);
        this.run();
      } else if(endTime) {
        this.set("endTimeStamp", Date.now() + (endAt || endTime*1000));
        this.set("isRunning", true);
        this.runDown();
      }
    },

    stop: function(reset){
      var timerId = this.get("timerId");
      var duration = this.get("duration");
      Ember.run.cancel(timerId);
      this.sendAction("updateRecordedTime", duration);
      this.set("isRunning", false);
      if(reset) {
        this.set("startTimeStamp", 0);
        this.set("endTimeStamp", 0);
        this.set("duration", 0);
      }
    },

    pause: function(){
      var duration = this.get("duration");
      var isRunning = this.get("isRunning");
      if(isRunning) {
        this.set("startTimeStamp", Formatter.getSecs(duration));
        this.set("endTimeStamp", Formatter.getSecs(duration));
        this.sendAction("updatePausedTime", duration);
        this.send("stop");
      } else {
        this.send("start");
      }
    }
  },

  willDestroyElement: function() {
    var timerId = this.get("timerId");
    Ember.run.cancel(timerId);
  }

});
