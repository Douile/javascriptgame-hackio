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
    def start(self):
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
threading.Thread(target=console).start()
s = server()
s.start()
