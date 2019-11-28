var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "compromise"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compromise_1 = __importDefault(require("compromise"));
    class Task {
        constructor(quotes, id, type) {
            const index = id != undefined ? id : Math.floor(Math.random() * quotes.length);
            this.quote = quotes[index];
            do {
                this.type = type != undefined ? type : Math.floor(Math.random() * 6);
            } while (this.answer == "" || this.quote == this.answer);
        }
        validate(answer) {
            answer = this.normalize(answer.toString());
            const similarity = this.similarity(answer, this.normalize(this.answer));
            return similarity > 0.99;
        }
        similarity(text1, text2) {
            let longer = text1;
            let shorter = text2;
            if (text1.length < text2.length) {
                longer = text2;
                shorter = text1;
            }
            let longerLength = longer.length;
            if (longerLength == 0) {
                return 1.0;
            }
            return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength + "");
            function editDistance(text1, text2) {
                text1 = text1.toLowerCase();
                text2 = text2.toLowerCase();
                let costs = new Array();
                for (let i = 0; i <= text1.length; i++) {
                    let lastValue = i;
                    for (let j = 0; j <= text2.length; j++) {
                        if (i == 0)
                            costs[j] = j;
                        else {
                            if (j > 0) {
                                let newValue = costs[j - 1];
                                if (text1.charAt(i - 1) != text2.charAt(j - 1))
                                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                                costs[j - 1] = lastValue;
                                lastValue = newValue;
                            }
                        }
                    }
                    if (i > 0)
                        costs[text2.length] = lastValue;
                }
                return costs[text2.length];
            }
        }
        normalize(text) {
            const normalized = compromise_1.default(text).sentences()
                .out("normal").replace(/\./g, "").trim();
            return normalized;
        }
        get question() {
            return TaskQuestions[this.type];
        }
        get answer() {
            switch (this.type) {
                case TaskType.CountNouns:
                    return compromise_1.default(this.quote).nouns().length.toString();
                case TaskType.CountVerbs:
                    return compromise_1.default(this.quote).verbs().length.toString();
                case TaskType.CountAdverbs:
                    return compromise_1.default(this.quote).adverbs().length.toString();
                case TaskType.CountAdjectives:
                    return compromise_1.default(this.quote).adjectives().length.toString();
                case TaskType.ExpandContractions:
                    return compromise_1.default(this.quote).contractions().expand().all().out();
                case TaskType.ContractSentence:
                    return compromise_1.default(this.quote).contractions().contract().all().out();
            }
            return "";
        }
    }
    exports.default = Task;
    const TaskQuestions = {
        0: "How many nouns are in this quote?",
        1: "How many verbs are in this quote?",
        2: "How many adverbs are in this quote?",
        3: "How many adjectives are in this quote?",
        4: "Rewrite with expanded contractions.",
        5: "Rewrite the sentence with contractions.",
    };
    var TaskType;
    (function (TaskType) {
        TaskType[TaskType["CountNouns"] = 0] = "CountNouns";
        TaskType[TaskType["CountVerbs"] = 1] = "CountVerbs";
        TaskType[TaskType["CountAdverbs"] = 2] = "CountAdverbs";
        TaskType[TaskType["CountAdjectives"] = 3] = "CountAdjectives";
        TaskType[TaskType["ExpandContractions"] = 4] = "ExpandContractions";
        TaskType[TaskType["ContractSentence"] = 5] = "ContractSentence";
    })(TaskType = exports.TaskType || (exports.TaskType = {}));
});
//# sourceMappingURL=task.js.map