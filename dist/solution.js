var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "net", "compromise"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const net_1 = __importDefault(require("net"));
    const compromise_1 = __importDefault(require("compromise"));
    //Question strings
    const questions = [
        "How many nouns are in this quote?",
        "How many verbs are in this quote?",
        "How many adverbs are in this quote?",
        "How many adjectives are in this quote?",
        "Rewrite with expanded contractions.",
        "Rewrite the sentence with contractions."
    ];
    //Current question type 
    let currentType = -1;
    //TCP client
    var client = new net_1.default.Socket();
    client.connect(1442, "localhost");
    console.log("Connecting to the server...");
    client.on("data", (data) => {
        //Normalize the data
        data = data.toString().replace("<<", "").trim();
        //Log the flag if found
        if (data.indexOf("ELON") != -1) {
            console.log("\r" + data);
        }
        //Check for a new question
        if (analyze(data) != -1) {
            currentType = analyze(data);
            data = data.replace(questions[currentType], "").trim();
            //Imidiate answer if there is a data
            if (data != "") {
                process.stdout.write("\rAnswering to: " + questions[currentType] + "       ");
                client.write(respond(data, currentType));
                currentType = -1;
            }
        }
        //Answer for an old question
        else if (currentType != -1 && data != "") {
            process.stdout.write("\rAnswering to: " + questions[currentType] + "       ");
            client.write(respond(data, currentType));
            currentType = -1;
        }
    });
    //Using NLP library to parse text
    function respond(data, type) {
        switch (type) {
            case 0:
                return compromise_1.default(data).nouns().length.toString();
            case 1:
                return compromise_1.default(data).verbs().length.toString();
            case 2:
                return compromise_1.default(data).adverbs().length.toString();
            case 3:
                return compromise_1.default(data).adjectives().length.toString();
            case 4:
                return compromise_1.default(data).contractions().expand().all().out();
            case 5:
                return compromise_1.default(data).contractions().contract().all().out();
        }
        return "";
    }
    //Searching for questions
    function analyze(data) {
        let type = -1;
        questions.map((x, i) => {
            if (data.indexOf(x) == 0) {
                type = i;
            }
        });
        return type;
    }
});
//# sourceMappingURL=solution.js.map