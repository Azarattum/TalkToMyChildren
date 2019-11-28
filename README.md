# TalkToMyChildren
Simple AI PPC CTF challenge.

## Description:

You know, my neural networks are almost like children to me. Just as unbearable when it comes to studying... Could you help me? I'm sure you are able to do it! You just need to find a **compromise**...

## Setup:
**Option 1**: Using Docker
1) Build the docker image:
```bash
docker build -t <your username>/talk-to-my-children .
```
2) Run the container:
```bash
docker run -p 1442:1442 -d <your username>/talk-to-my-children
```
3) Connect using netcat utility:
```bash
nc 127.0.0.1 1442
```

**Option 2**: Host directly using Node
1) Enter **TalkToMyChildren** cloned directory.
2) Install dependencies:
```bash
npm install
```
3) Run:
```bash
node ./dist/index.js
```
4) Connect using netcat utility:
```bash
nc 127.0.0.1 1442
```

## Solution:
1) The main hint is in the description, which is to use [**Compromise**](https://github.com/spencermountain/compromise/) NLP library. *(Of course, you can use a similar library or even write one on your own.)*

2) To complete the challenge you must have a least 80% accuracy with 99% on each task.

3) The perfect solution script is provided in *src/solution.ts*.