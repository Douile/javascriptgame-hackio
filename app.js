/* app.js */
function logItem(type,text) {
  this.time = new Date();
  this.type = type;
  this.text = text;
  return this;
}

var app = {
  log: {
    events: [],
    errors: [],
    info: [],
    verboose: [],
    log: function(type, text) {
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
          break;
        case "info":
          i = new logItem(type, text);
          app.log.info.push(i);
          app.log.verboose.push(i);
          break;
        default:
          throw Error("Invalid log type");
      }
      for (i in [app.log.events,app.log.errors,app.log.info,app.log.verboose]) {
        while (i.length > 200) {
          i.pop(i[0]);
        }
      }
    },
    print: function(type) {
      switch(type) {
        case undefined:
          console.log(app.log.verboose);
          break;
        case "events":
          console.log(app.log.events);
          break;
        case "error":
          console.log(app.log.errors);
          break;
        case "info":
          console.log(app.log.info);
        default:
          throw Error("Invalid log type");
      }
    }
  },
  init: function() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "app";
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
    style = document.createElement("style");
    style.innerHTML = "#app {position: absolute;left:0;top:0;width:100%;height:100%;}";
    document.head.appendChild(style);
    app.events.mousemove.event = window.addEventListener("mousemove",app.events.mousemove.handler,{passive:true});
    app.events.click.event = window.addEventListener("click",app.events.mousemove.handler);
    app.events.keydown.event = window.addEventListener("keydown",app.events.mousemove.handler);
  },
  events: {
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
  }
}

app.init();
