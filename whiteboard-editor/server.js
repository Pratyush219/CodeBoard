const express = require("express");
const http = require("http");

let port = process.env.PORT || 9999;
let created = false;
class Singleton {
    static attached = false;
    static getServerInstance(app) {
        if (Singleton.serverInstance == null) {
            Singleton.serverInstance = http.createServer(app);
        }
        return Singleton.serverInstance;
    }
    static getAppInstance() {
        if (Singleton.appInstance == null) {
            Singleton.appInstance = express();

            let publicPath = "./public";
            Singleton.appInstance.use(express.static(publicPath));
            Singleton.appInstance.use(express.json());
            Singleton.appInstance.use(express.urlencoded({ extended: true }));
        }
        return Singleton.appInstance;
    }
    static attachListener(app) {
        if (Singleton.attached == false) {
            app.on("start-listening", () => {
                console.log("Server instantiated");
                Singleton.serverInstance.listen(port, (error) => {
                    if (error) {
                        console.log("Something went wrong");
                    } else console.log("Server listening on port ", port);
                });
            });
            app.emit("start-listening");
            Singleton.attached = true;
        }
    }
}
// console.log(server);
const app = Singleton.getAppInstance();
const server = Singleton.getServerInstance(app);
Singleton.attachListener(app);
console.log(server);
// console.log(app);

// Object.freeze(server);
Object.freeze(app);
module.exports = {
    server,
    app,
    express,
};
