#http serv

import socket
import time
import sqlite3
import threading
def console():
     """Constantly read from stdin and discard"""
     try:
         while 1:
             a = input()
             if a == "d":
                 s.delall()
     except (KeyboardInterrupt, EOFError):
         socket.socket().connect((socket.gethostname()+".home",80))

def log(data):
     t = time.strftime("%d/%m/%Y %X : ")
     text = t + data + "\n"
     f = open("log.txt","a")
     f.write(text)
     f.close()
def readPage(p):
    r = ""
    i = 3
    while 1:
        i+=1
        if p[i] == " ":
            break
        else:
            r += p[i]
    return r
def readFile(name):
    try:
         file = open(name,"r")
         r = file.read()
         file.close()
    except FileNotFoundError:
         return nofile()
    return r, "200 OK"
def readImage(name):
    file = open(name,"rb")
    r = file.read()
    file.close()
    return r, "200 OK"
def nofile():
    rp = "<html><head><title>404</title></head><body><h1 style='text-align:center;position: relative;top: 20%;'>404 PAGE NOT FOUND</h1></body></html>"
    code = "404 File Not Found"
    return rp, code
class server():
    def __init__(self):
        self.ip = socket.gethostname()+".home"
        self.sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        self.sock.bind((self.ip,80))
        self.sock.listen(1024)
        self.threads = []
    def write(self, name, p,
              players=bytes([0x00,0x01,0x01,0x00,0x02,0x01]),
              level=1,
              upgrades=bytes([0x00])):
        uid = len(self.read())
        self.sql = sqlite3.connect("data.db")
        self.sql.execute("INSERT INTO users VALUES (?,?,?,?,?,?)",[uid,name,sqlite3.Binary(players),level,upgrades,p])
        self.sql.commit()
        self.sql.close()
        log("Wrote user {0} to the database".format(uid))
        return uid
    def read(self, f="*", w=""):
        if f == None:
            f = "*"
        if w != "":
            w = "WHERE " + w
        self.sql = sqlite3.connect("data.db")
        s = self.sql.execute("SELECT " + f + " FROM users" + w)
        r = s.fetchall()
        self.sql.close()
        return r
    def update(self,toUpdate, value, id):
         self.sql = sqlite3.connect("data.db")
         self.sql.execute("UPDATE users SET " + toUpdate + "=" + value + " WHERE id="+id)
         self.sql.commit()
         self.sql.close()
    def delall(self):
        c = ""
        self.sql = sqlite3.connect("data.db")
        while c.lower() != "yes":
            c = input("Are you sure you want to delete entire table? (yes/no/drop)")
            if c.lower() == "no":
                return False
            if c.lower() == "drop":
                 return self.configure()
        self.sql.execute("DELETE FROM users")
        self.sql.commit()
        self.sql.close()
        log("Successfully deleted all rows from users table")
        return True
    def configure(self):
         try:
              self.sql = sqlite3.connect("data.db")
              self.sql.execute("DROP TABLE USERS")
              self.sql.execute("""CREATE TABLE users (
                                   id INTEGER PRIMARY KEY,
                                   name TEXT,
                                   players BLOB,
                                   level INTEGER,
                                   upgrades BLOB,
                                   pass VARCHAR(4));""")
              self.sql.commit()
              self.sql.close()
              log("Successfully reconfigured database")
         except sqlite3.OperationalError as e:
              error = "SQL Error: "
              for i in e.args:
                   error += i + ","
              print(error)
              log("Failed to reconfigure database")
              return False
         print(self.read())
         return True
    def start(self):
        #print(self.read())
        log("Started")
        try:
            self.loop()
        except KeyboardInterrupt:
            print("Goodbye")
            log("Ended")
    def loop(self):
        print("Server starting on host: {0}".format(self.ip))
        while 1:
            s, a = self.sock.accept()
            threading.Thread(target=self.conHandle,args=(s,a,)).start()
    def conHandle(self,s,addr):
        print("{0} threads running. {1}".format(threading.active_count(),threading.current_thread()))
        data = ""
        t = time.time()
        while data == "":
            data += str(s.recv(1024),"UTF-8")
            if time.time()-t > 5:
                print("Connection timed out")
                break
        if data == "":
            s.sendall(bytes("HTTP/1.1 500 Invalid request\r\n","UTF-8"))
            log("New connection from {0} with no data recieved".format(addr[0]))
            s.close()
            return ""
        page = readPage(data)
        log("New connection from {0} reqeusting {1}".format(addr[0],page))
        print("PAGE: " + page)
        code = "500 internal error"
        mime = "text/html"
        if page == "/":
            rp, code = readFile("testing.html")
        elif page == "/app.js":
            rp, code = readFile("app.js")
            mime = "text/javascript"
        elif page == "/home.html":
            rp, code = readFile("home.html")
        elif page == "/favicon.ico":
            mime = "image/x-icon"
            rp, code = readImage("favicon.ico")
        else:
            rp, code = nofile()
        if type(rp) == str:
            resp = "HTTP/1.1 {0}\r\nDate: {1}\r\nServer: Non-Existent\r\nContent-Type: {2}\r\n\r\n{3}".format(code,time.strftime("%D $X"),mime,rp)
            s.sendall(bytes(resp,"UTF-8"))
        elif type(rp) == bytes:
            resp = bytes("HTTP/1.1 {0}\r\nDate: {1}\r\nServer: Non-Existent\r\nContent-Type: {2}\r\n\r\n".format(code,time.strftime("%D $X"),mime),"UTF-8")
            resp = resp + rp
            s.sendall(resp)
        else:
            print("Invalid type of response page")
        s.close()
        #print(data)
threading.Thread(target=console).start()
s = server()
s.start()
