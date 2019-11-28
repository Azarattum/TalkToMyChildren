import Net from "net";
import Task, { TaskType } from "./task";
import FileSystem from "fs";
import DotEnv from "dotenv";

DotEnv.config();

const qoutes: string[] = JSON.parse(FileSystem.readFileSync("src/data/elonquotes.json", "utf8")) as string[];
const examples = [
    new Task(qoutes, 0, TaskType.CountNouns),
    new Task(qoutes, 131, TaskType.ContractSentence)
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

const server = Net.createServer(onConnected);
server.listen(1442, () => {
    console.log("Server stated listening...");
});

async function onConnected(socket: Net.Socket) {
    const client = new ClientHandler(socket);
}

class ClientHandler {
    private socket: Net.Socket;
    private task: Task = new Task(qoutes);
    public tasksLeft: number = 100;
    public rightAnswers: number = 0;
    public startTime: Date = new Date(0);

    constructor(socket: Net.Socket) {
        this.socket = socket;
        socket.on("data", (data: string) => {
            this.recieved(data)
        });
        socket.on("error", () => { });
        socket.on("close", () => {
            console.log("Closed:    ", this.socket.remoteAddress, "\n");
        });

        this.send(greetings);
        this.sendTask();
        console.log("Connected: ", this.socket.remoteAddress, "\n");
    }

    public send(data: string) {
        if (this.socket) {
            this.socket.write(data);
        }
    }

    private sendTask() {
        if (+this.startTime == 0) {
            this.startTime = new Date();
        }
        this.task = new Task(qoutes);
        this.send(this.task.question + "\n\n");
        this.send(this.task.quote + "\n\n");
        this.send("<< ");
    }

    private recieved(data: string) {
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
        } else {
            this.sendTask();
        }
    }
}