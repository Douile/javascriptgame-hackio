/*
app.js https://raw.githubusercontent.com/TheOnly-Tom/canvas-game2.0/master/app.js
published under GNU General Public License v3.0
author: Tom Hipwell https://github.com/TheOnly-Tom/
© Tom Hipwell 2017 all rights reserved
*/

// Functions
function getTime() {
  time = new Date();
  timer = time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ":" + time.getMilliseconds();
  return timer
}
function getCodeTime() {
  time = new Date();
  return time.getTime();
}
// Object types
function logItem(type,text) { // object for every log item
  this.time = getTime();
  this.type = type;
  this.text = text;
  return this;
}
var protectedStorage = function() {
  var text = "";
  function changeTo(val) {
    text = text + val[0];
  }
  return {
    set: function(val) {
      changeTo(val);
    },
    value: function() {
      return text;
    }
  }
}
// Prototypes
String.prototype.count = function(char) {
  count = 0;
  for (i=0;i<this.length;i++) {
    if (this[i] == char) {
      count += 1;
    }
  }
  return count;
}
String.prototype.download = function(name) {
  a = document.createElement("a");
  a.href = "data:text/plain,"+encodeURIComponent(this.valueOf());
  a.download = name;
  a.click();
}
String.prototype.backspace = function() {
  temp = this.valueOf();
  text = "";
  for (i=0;i<temp.length-1;i++) {
    text += temp[i];
  }
  return text;
}

//Main object wrapper
var app = {
  log: { // object containing logs and log functions
    events: [],
    errors: [],
    info: [],
    scenes: [],
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
        case "scene":
          i = new logItem(type, text);
          app.log.scenes.push(i);
          app.log.verboose.push(i);
          break;
        default:
          throw Error("Invalid log type");
      }
      for (i=0;i<app.log.logs.length;i++) { // Checks all logs are less than 1000 objects long
        while (app.log.logs[i].length > app.vars.enviroment.maxLogSize) {
          app.log.logs[i].pop(app.log.logs[i][0]);
        }
      }
    },
    print: function(type, filter, download) { // function to read logs to javascript console
      var filters = [];
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
        case "scene":
          log = app.log.scenes;
          break;
        default:
          throw Error("Invalid log type");
          return 1;
        }
        logT = "";
        if (filter != undefined && typeof filter == "string") { // reformats the filters into objects
          filtersTemp = filter.split(";");
          for (i=0;i<filtersTemp.length;i++) {
            if (filtersTemp[i].startsWith("!")) {
              filters.push({inc:false, text: filtersTemp[i].split("!")[1]});
            } else {
              filters.push({inc:true, text: filtersTemp[i]});
            }
          }
        }
        var filtered = 0;
        for (i=0; i<log.length;i++) {
          row = log[i]["type"] + " " + log[i]["time"] + ": " + log[i]["text"] + "\r\n";
          if (filters.length < 1) {
            logT += row;
          }
          for (a=0;a<filters.length;a++) {
            includes = log[i]["text"].includes(filters[a]["text"]);
            if (filters[a]["inc"] == true) {
              if (includes == true) {
                logT += row;
              } else {
                filtered += 1;
              }
            } else if(filters[a]["inc"] == false) {
              if (includes == false) {
                logT += row;
              } else {
                filtered += 1;
              }
            }
          }
        }
        info = "\nPRINTED LOG AT " + getTime() + " SHOWING " + (log.length-filtered) + "/" + log.length + " ITEMS";
        logT += info;
        console.log(logT);
        if (download == true) {
          logT.download("app."+type+".log");
        }
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
  vars: {
    enviroment: {
      canvas: {}
    },
    protected: {

    },
    levels: {
      ag: {
        cmds: function(command, args) {
          switch(command) {
            case "help":
              this.textArray.push("","HELP:","cls - clears screen","sql {command} - runs a sql command","login {id} {password} - login to an account","exit",
              "--- I_n_j_e_c_t_e_d___s_c_r_i_p_t___h_a_c_k_:",
              "HACK OBJECTIVE - current objective",
              "HACK HINT - print a hint e_n_d---",
              "");
              this.failedCommands = 0;
              break;
            case "sql":
              if (args.length < 1) {
                this.textArray.push("Error sql requires arguments:","INSERT","SELECT","TABLES","");
              }
              if (args[0] == "tables") {
                this.textArray.push("Tables in current database:","users","payments","employees","");
              }
              if (args[0] == "select") {
                if (args[1] == "*") {
                  if (args[2] == "from") {
                    if (args[3] == "users") {
                      users = ["users table:","NAME      ROLE           ID    PASS"];
                      for (i=0;i<this.vars.users.length;i++) {
                        str = "";
                        str += this.vars.users[i]["name"];
                        for (a=0;a<10-this.vars.users[i]["name"].length;a++) {
                          str += " ";
                        }
                        str += this.vars.users[i]["role"];
                        for (a=0;a<15-this.vars.users[i]["role"].length;a++) {
                          str += " ";
                        }
                        str += this.vars.users[i]["id"];
                        for (a=0;a<6-this.vars.users[i]["id"].length;a++) {
                          str += " ";
                        }
                        str += this.vars.users[i]["pass"];
                        users.push(str);
                      }
                      users.push("");
                      for (i=0;i<users.length;i++) {
                        this.textArray.push(users[i]);
                      }
                    } else if (args[3] == "payments" || args[3] == "employees") {
                      this.textArray.push("Access denied...","");
                    } else {
                      this.textArray.push("Unknown table","");
                    }
                  } else {
                    this.textArray.push("Error: invalid sql command","");
                  }
                } else {
                  this.textArray.push("Error: invalid sql command","");
                }
              }
              break;
            case "hack":
              if (args[0] == "objective") {
                this.textArray.push("Current objective: login to the managers account // commands required: login, sql","");
              } else if (args[0] == "hint") {
                "try typing sql SELECT * FROM users\r\njeez".download("hint.txt");
              } else {
                this.textArray.push("HACK script has been injected successfully.");
              }
              break;
            case "login":
              if (parseInt(args[0]) < this.vars.users.length-1) {
                console.log(args,this.vars.users[parseInt(args[0])])
                if (this.vars.users[parseInt(args[0])]["role"] == "Manager" && this.vars.users[parseInt(args[0])]["pass"] == args[1]) {
                  this.end();
                } else if (this.vars.users[parseInt(args[0])]["pass"] == args[1]) {
                  this.textArray.push("___H_A_C_K___I_N_J_E_C_T_E_D___S_C_R_I_P_T___S_A_Y_S___M_U_S_T___L_O_G_I_N___A_S___M_A_N_A_G_E_R___","");
                } else {
                  this.textArray.push("Invalid password","");
                }
              } else {
                this.textArray.push("Invalid ID","");
              }
            case "":
              break;
            default:
              this.textArray.push("Error command not found: " + command);
              this.failedCommands += 1;
              break;
          }
          if (this.failedCommands >= 5 && this.text != "") {
            this.textArray.push(this.failedCommands + " errors in a row try help");
          }
        },
        start: ["Selecting user..."," "," ",
        "User guest selected"," ",
        "Setting guest enviroment variables...",
        "Updating event registry...",
        "Finding boot log...",
        "Checking hashed passwords...",
        "Connecting to data server...",
        "Data DBA accessed...",
        " "],
        next: "ld",
        vars: {
          userNames: ["John","Mel","Andrew","David","Alice","Betty","Steve","Bob","Sam","Sammy","Tom","Nick","Olivia","Rose","Sally"],
          userPass: ["Cat","Dog","Lover","Hater","Horse","Car","Bot","0","5","7","6","9","10"],
          userRoles: ["Customer","Assistant","Floor","Floor Manager"],
          setup: function() {
            this.vars.users = [];
            for (i=0;i<Math.floor(Math.random()*5)+10;i++) {
              name = app.vars.levels.ag.vars.userNames[Math.floor(Math.random()*app.vars.levels.ag.vars.userNames.length)];
              pass = "";
              for (a=0;a<3;a++) {
                pass += app.vars.levels.ag.vars.userPass[Math.floor(Math.random()*app.vars.levels.ag.vars.userPass.length)].toLowerCase();
              }
              role = app.vars.levels.ag.vars.userRoles[Math.floor(Math.random()*app.vars.levels.ag.vars.userRoles.length)];
              id = i.toString();
              this.vars.users.push({id:id,name:name,pass:pass,role:role});
            }
            i = Math.floor(Math.random()*this.vars.users.length);
            this.vars.users[i]["role"] = "Manager";
          }
        }
      },
      agl: {
        cmds: function(command, args) {

        },
        start: ["well done!"," ","You have potential...","..."," "],
        vars: {
          setup: function() {

          }
        }
      }
    }
  },
  init: function() { // initializes the app object preparing it for run
    // CONFIG
    app.vars.enviroment.canvas.width = window.innerWidth;
    app.vars.enviroment.canvas.height = window.innerHeight;
    app.vars.enviroment.title = "HackIo";
    app.vars.enviroment.fps = 60;
    app.vars.enviroment.maxLogSize = 2500;
    // canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "app";
    this.canvas.height = app.vars.enviroment.canvas.height;
    this.canvas.width = app.vars.enviroment.canvas.width;
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
    style = document.createElement("style");
    style.innerHTML = "#app {position: absolute;left:0;top:0;width:100%;height:100%;}";
    document.head.appendChild(style);
    // events
    app.events.mousemove.event = window.addEventListener("mousemove",app.events.mousemove.handler,{passive:true});
    app.events.click.event = window.addEventListener("click",app.events.click.handler);
    app.events.keydown.event = window.addEventListener("keydown",app.events.keydown.handler);
    app.events.keyup.event = window.addEventListener("keyup",app.events.keyup.handler);
    app.events.resize.event = window.addEventListener("resize",app.events.resize.handler);
    // logs
    app.log.logs = [app.log.verboose, app.log.info, app.log.events, app.log.scenes, app.log.errors]; // sets up the logs to be checked for length
	  app.log.log("info","App initialized");
	  this.init.initialized = true;
    // variables
    app.vars.protected.save = new protectedStorage();
    // misc
    document.title = app.vars.enviroment.title;
  },
  events: { // object containing all the event listeners for the app
    mousemove: {
      handler: function(e) {
        app.log.log("event","mousemove:" + e.x + "," + e.y);
        for (i=0;i<app.events.mousemove.funcs.length;i++) {
          if (typeof app.events.mousemove.funcs[i] == "function") {
            app.events.mousemove.funcs[i](e);
          }
        }
      },
      funcs: []
    },
    click: {
      handler: function(e) {
        app.log.log("event","click:" + e.x + "," + e.y);
        for (i=0;i<app.events.click.funcs.length;i++) {
          if (typeof app.events.click.funcs[i] == "function") {
            app.events.click.funcs[i](e);
          }
        }
      },
      funcs: []
    },
    keydown: {
      handler: function(e) {
        app.log.log("event","keydown:" + e.keyCode);
        if (e.keyCode == 116) {
          location.reload();
        }
        e.preventDefault();
        app.events.keys[e.keyCode] = true;
        for (i=0;i<app.events.keydown.funcs.length;i++) {
          if (typeof app.events.keydown.funcs[i] == "function") {
            app.events.keydown.funcs[i](e);
          }
        }
      },
      funcs: []
    },
    keyup: {
      handler: function(e) {
        app.log.log("event","keyup:" + e.keyCode);
        e.preventDefault();
        app.events.keys[e.keyCode] = false;
        for (i=0;i<app.events.keyup.funcs.length;i++) {
          if (typeof app.events.keyup.funcs[i] == "function") {
            app.events.keyup.funcs[i](e);
          }
        }
      },
      funcs: []
    },
    keys: {},
    resize: {
      handler: function(e) {
        app.log.log("event","resize");
        app.vars.enviroment.canvas.width = window.innerWidth;
        app.vars.enviroment.canvas.height = window.innerHeight;
        app.canvas.width = app.vars.enviroment.canvas.width;
        app.canvas.height = app.vars.enviroment.canvas.height;
        for (i=0;i<app.events.resize.funcs.length;i++) {
          if (typeof app.events.resize.funcs[i] == "function") {
            app.events.resize.funcs[i](e);
          }
        }
      },
      funcs: []
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
  		app.runtime.interval = setInterval(app.runtime.loop,1000/app.vars.enviroment.fps);
  		app.runtime.state = "running";
  		app.log.log("info","App started");

      // Objects, scenes and animations
      app.vars.protected.save.set("a");
      app.vars.protected.save.set("g");
      new app.scenes.cmd();
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
    loop: function() {
      // clear canvas and draw the background colour
      app.ctx.clearRect(0,0,app.canvas.width,app.canvas.height);
      app.ctx.fillStyle = "#000";
      app.ctx.fillRect(0,0,app.canvas.width,app.canvas.height);
      // draw canvas + set variables
      for (i=0;i<app.runtime.objects.length;i++) {
        app.runtime.objects[i].draw();
      }
    },
  	state: "stopped",
  	interval: 0,
    objects: [],
  },
  scenes: {
    scrollingText: function(textArray, onFin) {
      this.onFin = onFin;
      this.textArray = textArray;
      this.base = app.vars.enviroment.canvas.height;
      this.draw = function() {
        app.ctx.font = "20px consolas";
        app.ctx.fillStyle = "#fff";
        this.base -= 5;
        for (i=0;i<this.textArray.length;i++) {
          app.ctx.fillText(this.textArray[i],5,this.base + (20*i));
        }
        if (this.base < -1*(20*this.textArray.length)-10) {
          app.runtime.objects.pop(this);
          app.log.log("scene","scrollingText scene ended");
          if (typeof this.onFin == "function") {
            this.onFin();
          }
        }
      }
      app.log.log("scene","scrollingText scene started");
      return this;
    },
    cmd: function() {
      if (app.scenes.current_cmd != false) {
        app.log.log("error","Only 1 cmd scene can run at a time");
        return 1;
      }
      this.level = app.vars.protected.save.value();
      this.typeText = true;
      this.textToType = app.vars.levels[this.level]["start"];
      this.textArray = [];
      this.lastTime = getCodeTime();
      this.map = [];
      for (i=0;i<this.textToType.length;i++) {
        this.map.push(this.textToType[i].length-1);
      }
      this.cur = {ar: 0, st: 0};
      this.text = "";
      this.bottom = app.vars.enviroment.canvas.height-25;
      this.cursor = {
        colors: ["#000","#111","#222","#333","#444","#555","#666","#777","#888","#999","#aaa","#bbb","#ccc","#ddd","#eee","#fff"],
        state: 0,
        up: true,
        top: app.vars.enviroment.canvas.height-25,
        left: 5
      }
      this.failedCommands = 0;
      this.vars = {};
      this.varsetup = app.vars.levels[this.level]["vars"]["setup"];
      this.varsetup();
      this.keyHandler = function(e) {
        if (app.runtime.objects[app.scenes.current_cmd].typeText != true) {
          if ((e.keyCode > 47 && e.keyCode < 91) || e.keyCode == 32) {
            char = String.fromCharCode(e.keyCode)
            if (app.events.keys[16] != true && app.events.keys[20] != true) {
              char = char.toLowerCase();
            }
            if (e.keyCode > 47 && e.keyCode < 58 && app.events.keys[16] == true) {
              switch(char) {
                case "0":
                  char = ")";
                  break;
                case "1":
                  char = "!";
                  break;
                case "2":
                  char = '"';
                  break;
                case "3":
                  char = "£";
                  break;
                case "4":
                  char = "$";
                  break;
                case "5":
                  char = "%";
                  break;
                case "6":
                  char = "^";
                  break;
                case "7":
                  char = "&";
                  break;
                case "8":
                  char = "*";
                  break;
                case "9":
                  char="(";
                  break;
                default:
                  console.error(char);
                  break;
              }
            }
            app.runtime.objects[app.scenes.current_cmd].text += char;
          } else if (e.keyCode == 8) {
            app.runtime.objects[app.scenes.current_cmd].text = app.runtime.objects[app.scenes.current_cmd].text.backspace();
          } else if (e.keyCode == 13) {
            app.runtime.objects[app.scenes.current_cmd].commandHandler();
          }
        }
      }
      this.resizeHandler = function(e) {
        app.runtime.objects[app.scenes.current_cmd].cursor["top"] = app.vars.enviroment.canvas.height-25;
      }
      this.commandHandler = function() {
        temp = this.text.toLowerCase().split(" ");
        command = temp[0];
        args = [];
        for (i=1;i<temp.length;i++) {
          args.push(temp[i]);
        }
        if (command == "cls") {
          this.textArray = ["Screen cleared."];
          this.failedCommands = 0;
        } else if (command == "exit") {
          location = "https://github.com/TheOnly-Tom/javascriptgame-hackio";
        } else {
          this.commandHandlerEx(command,args);
        }
        this.text = "";
      }
      this.commandHandlerEx = app.vars.levels[this.level]["cmds"];
      app.events.keydown.funcs.push(this.keyHandler);
      app.events.resize.funcs.push(this.resizeHandler);
      this.draw = function() {
        if (this.typeText == true) {
          if (getCodeTime()-this.lastTime > (Math.floor(Math.random()*5))*1000) {
            this.lastTime = getCodeTime();
            if (this.textArray[this.cur["ar"]] == undefined) {
              this.textArray[this.cur["ar"]] = "";
            }
            this.textArray[this.cur["ar"]] += this.textToType[this.cur["ar"]][this.cur["st"]];
            this.cur["st"] += 1;
            if (this.cur["st"] > this.map[this.cur["ar"]]) {
              this.cur["ar"] += 1;
              this.cur["st"] = 0;
              if (this.cur["ar"] > this.map.length-1) {
                this.typeText = false;
              }
            }
          }
        } else {
          app.ctx.fillStyle = "#fff";
          app.ctx.font = "20px consolas";
          app.ctx.fillText(this.text,5,this.cursor["top"]+20);
          app.ctx.fillStyle = this.cursor["colors"][this.cursor["state"]];
          app.ctx.fillRect(this.text.length*11 + 5,this.cursor["top"],10,20);
          if (this.cursor["up"]) { // sets cursor colour
            if (this.cursor["state"] > this.cursor["colors"].length - 2) {
              this.cursor["state"] -= 1;
              this.cursor["up"] = false;
            } else {
              this.cursor["state"] += 1;
            }
          } else {
            if (this.cursor["state"] < 1) {
              this.cursor["state"] += 1;
              this.cursor["up"] = true;
            } else {
              this.cursor["state"] -= 1;
            }
          }
        }
        app.ctx.fillStyle = "#fff";
        app.ctx.font = "20px consolas";
        for (i=0;i<this.textArray.length;i++) {
          a = this.textArray.length-i-1;
          app.ctx.fillText(this.textArray[i],5,this.cursor["top"]-(a*20)-5);
        }
      }
      app.log.log("scene","cmd scene started");
      index = app.runtime.objects.push(this)-1;
      app.scenes.current_cmd = index;
      this.end = function() {
        app.log.log("scene","cmd scene ended");
        app.runtime.objects.pop(this);
        app.events.keydown.funcs.pop(this.keyHandler);
        app.events.resize.funcs.pop(this.resizeHandler);
        app.vars.protected.save.set(app.vars.levels[this.level]["next"]);
        new app.scenes.cmd();
      }
      return this;
    },
    current_cmd: false
  }
}

// main code
app.init(); // calls app init to prepare app

app.runtime.start();

/*
HELP
app.log.print(log type (undefined for verboose), filters: a string containing the filter strings seperated by ; and if non preceded by a !, true to download the log)

*/
