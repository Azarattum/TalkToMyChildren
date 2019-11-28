import Compromise from "compromise";

export default class Task {
    public quote: string;
    public type: TaskType;

    constructor(quotes: string[], id?: number, type?: TaskType) {
        const index = id != undefined ? id : Math.floor(Math.random() * quotes.length);
        this.quote = quotes[index];
        do {
            this.type = type != undefined ? type : Math.floor(Math.random() * 6);
        } while (this.answer == "" || this.quote == this.answer);
    }

    validate(answer: string) {
        answer = this.normalize(answer.toString());
        const similarity = this.similarity(answer, this.normalize(this.answer));

        return similarity > 0.99;
    }

    private similarity(text1: string, text2: string): number {
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

        function editDistance(text1: string, text2: string) {
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
                                newValue = Math.min(Math.min(newValue, lastValue),
                                    costs[j]) + 1;
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

    private normalize(text: string): string {
        const normalized: string = Compromise(text).sentences()
            .out("normal").replace(/\./g, "").trim();

        return normalized;
    }

    get question(): string {
        return TaskQuestions[this.type];
    }

    get answer(): string {
        switch (this.type) {
            case TaskType.CountNouns:
                return Compromise(this.quote).nouns().length.toString();
            case TaskType.CountVerbs:
                return Compromise(this.quote).verbs().length.toString();
            case TaskType.CountAdverbs:
                return Compromise(this.quote).adverbs().length.toString();
            case TaskType.CountAdjectives:
                return Compromise(this.quote).adjectives().length.toString();
            case TaskType.ExpandContractions:
                return Compromise(this.quote).contractions().expand().all().out();
            case TaskType.ContractSentence:
                return Compromise(this.quote).contractions().contract().all().out();
        }

        return "";
    }
}

const TaskQuestions: { [type: number]: string } = {
    0: "How many nouns are in this quote?",
    1: "How many verbs are in this quote?",
    2: "How many adverbs are in this quote?",
    3: "How many adjectives are in this quote?",
    4: "Rewrite with expanded contractions.",
    5: "Rewrite the sentence with contractions.",
};

export enum TaskType {
    CountNouns,
    CountVerbs,
    CountAdverbs,
    CountAdjectives,
    ExpandContractions,
    ContractSentence
}