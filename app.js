/*
app.js https://raw.githubusercontent.com/TheOnly-Tom/canvas-game2.0/master/app.js
published under GNU General Public License v3.0
author: Tom Hipwell https://github.com/TheOnly-Tom/
© Tom Hipwell 2017 all rights reserved
*/

// Object types
function logItem(type,text) { // object for every log item
  this.time = new Date();
  this.time = this.time.toLocaleString();
  this.type = type;
  this.text = text;
  return this;
}

//Main object wrapper
var app = {
  log: { // object containing logs and log functions
    events: [],
    errors: [],
    info: [],
    verboose: [],
    log: function(type, text) { // function to append to the logs
      switch(type) {
        case "event":
          i = new logItem(type, text);
          app.log.events.push(i);
          app.log.verboose.push(i);
          break;
        case "error":
          i = new logItem(type, text);
          app.log.errors.push(i);
          app.log.verboose.push(i);
		  console.error(i);
          break;
        case "info":
          i = new logItem(type, text);
          app.log.info.push(i);
          app.log.verboose.push(i);
          break;
        default:
          throw Error("Invalid log type");
      }
      for (i=0;i<app.log.logs.length;i++) { // Checks all logs are less than 1000 objects long
        while (app.log.logs[i].length > 1000) {
          app.log.logs[i].pop(app.log.logs[i][0]);
        }
      }
    },
    print: function(type) { // function to read logs to javascript console
      switch(type) {
        case undefined:
          log = app.log.verboose;
          break;
        case "event":
          log = app.log.events;
          break;
        case "error":
          log = app.log.errors;
          break;
        case "info":
          log = app.log.info;
          break;
        default:
          throw Error("Invalid log type");
          return 1;
        }
        logT = "";
        for (i=0; i<log.length;i++) {
          row = log[i]["type"] + " " + log[i]["time"] + ": " + log[i]["text"] + "\n";
          logT += row;
        }
        console.log(logT);
      },
      last: function(type) {
        switch(type) {
          case undefined:
            log = app.log.verboose;
            break;
          case "event":
            log = app.log.events;
            break;
          case "error":
            log = app.log.errors;
            break;
          case "info":
            log = app.log.info;
            break;
          default:
            throw Error("Invalid log type");
            return 1;
          }
          i = log[log.length-1];
          row = i["type"] + " " + i["time"] + ": " + i["text"] + "\n";
          console.log(row);
      }
  },
  init: function() { // initializes the app object preparing it for run
    // canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "app";
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
    style = document.createElement("style");
    style.innerHTML = "#app {position: absolute;left:0;top:0;width:100%;height:100%;}";
    document.head.appendChild(style);
    // events
    app.events.mousemove.event = window.addEventListener("mousemove",app.events.mousemove.handler,{passive:true});
    app.events.click.event = window.addEventListener("click",app.events.mousemove.handler);
    app.events.keydown.event = window.addEventListener("keydown",app.events.mousemove.handler);
    // logs
    app.log.logs = [app.logs.verboose, app.logs.info, app.logs.events, app.logs.errors];
	  app.log.log("info","App initialized");
	  this.init.initialized = true;
  },
  events: { // object containing all the event listeners for the app
    mousemove: {
      handler: function(e) {
        app.log.log("event","mousemove:" + e.x + "," + e.y);
      }
    },
    click: {
      handler: function(e) {
        app.log.log("event","click:" + e.x + "," + e.y);
      }
    },
    keydown: {
      handler: function(e) {
        app.log.log("event","keyDown:" + e.code);
      }
    }
  },
  runtime: { // object containing functions controlling the run of the app
	start: function() {
		if (app.init.initialized != true) {
			app.log.log("error","App must be initialized before it starts");
			return 1
		}
		if (app.runtime.state == "stopped") {
			// initialize variables
		}
		app.runtime.interval = setInterval(app.runtime.loop,1000/60);
		app.runtime.state = "running";
		app.log.log("info","App started");
	},
	pause: function(screen) {
		if (screen != undefined) {
			screen.draw();
		}
		clearInterval(app.runtime.interval);
		app.runtime.state = "paused";
		app.log.log("info","App paused");
	},
	stop: function(screen) {
		if (screen != undefined) {
			screen.draw();
		}
		clearInterval(app.runtime.interval);
		app.runtime.state = "stopped";
		app.log.log("info","App stopped");
	},
	state: "stopped",
	interval: 0
  }
}

// main code
app.init(); // calls app init to prepare app

app.runtime.start();
