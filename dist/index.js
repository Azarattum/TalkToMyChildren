var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "net", "./task", "fs", "dotenv"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const net_1 = __importDefault(require("net"));
    const task_1 = __importStar(require("./task"));
    const fs_1 = __importDefault(require("fs"));
    const dotenv_1 = __importDefault(require("dotenv"));
    dotenv_1.default.config();
    const qoutes = JSON.parse(fs_1.default.readFileSync("src/data/elonquotes.json", "utf8"));
    const examples = [
        new task_1.default(qoutes, 0, task_1.TaskType.CountNouns),
        new task_1.default(qoutes, 131, task_1.TaskType.ContractSentence)
    ];
    const greetings = `Hello, its Elon! Help my AI children to learn English.
Just answer some simple questions.

========================================================
Examples:
\tTask: ${examples[0].question}
\tQuote:\t${examples[0].quote}

\tAnswer: ${examples[0].answer}
\t==================
\tTask: ${examples[1].question}
\tQuote:\t${examples[1].quote}

\tAnswer: ${examples[1].answer}
========================================================

GOOD LUCK! Just remember that is an AI, it does not think like a human. ;)
\n`;
    const server = net_1.default.createServer(onConnected);
    server.listen(1442, () => {
        console.log("Server stated listening...");
    });
    async function onConnected(socket) {
        const client = new ClientHandler(socket);
    }
    class ClientHandler {
        constructor(socket) {
            this.task = new task_1.default(qoutes);
            this.tasksLeft = 100;
            this.rightAnswers = 0;
            this.startTime = new Date(0);
            this.socket = socket;
            socket.on("data", (data) => {
                this.recieved(data);
            });
            socket.on("error", () => { });
            socket.on("close", () => {
                console.log("Closed:    ", this.socket.remoteAddress, "\n");
            });
            this.send(greetings);
            this.sendTask();
            console.log("Connected: ", this.socket.remoteAddress, "\n");
        }
        send(data) {
            if (this.socket) {
                this.socket.write(data);
            }
        }
        sendTask() {
            if (+this.startTime == 0) {
                this.startTime = new Date();
            }
            this.task = new task_1.default(qoutes);
            this.send(this.task.question + "\n\n");
            this.send(this.task.quote + "\n\n");
            this.send("<< ");
        }
        recieved(data) {
            const valid = this.task.validate(data.toString());
            console.log("From:      ", this.socket.remoteAddress);
            console.log("Input:     ", data.toString().replace("\n", ""));
            console.log("Correct:   ", this.task.answer, "\n");
            if (valid) {
                this.rightAnswers++;
            }
            this.tasksLeft--;
            if (this.tasksLeft <= 0) {
                const timePassed = (+Date.now() - +this.startTime) / 1000;
                if (timePassed < 200 && this.rightAnswers >= 80) {
                    console.log("Won flag:  ", this.socket.remoteAddress);
                    this.send("Thank you for teaching! " + process.env.FLAG);
                }
                else {
                    this.send("You are a bad teacher!\n");
                }
                this.socket.end();
                this.socket.destroy();
            }
            else {
                this.sendTask();
            }
        }
    }
});
//# sourceMappingURL=index.js.map