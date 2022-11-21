Thaw.js
=======

[![Join the chat at https://gitter.im/robertleeplummerjr/thaw.test.ts](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/robertleeplummerjr/thaw.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

synthetic asynchronous processing in javascript

Thaw.js helps keep the browser from freezing by splitting long computations into small parts which are processed more naturally when the browser isn't busy.  This simulates asynchronous behaviour and attempts to keep the browser from freezing.  Thaw.ts thaws frozen browsers.

[![tip for next commit](http://prime4commit.com/projects/176.svg)](http://prime4commit.com/projects/176)


## Usage
```ts
import { thaw } from 'thaw.js';
import { matrixMultiply } from 'fake-math-library';

let lastMatrix;
const items = [];
for (let i = 0; i < 1000000; i++) {
  items.push(() => {
    lastMatrix = matrixMultiply(a, b);
  });
}

// start thawing!
const t = thaw(items);

//sometime later
t.add(item); // append single function to end of all tasks
t.insert(item); // insert single function after current task
t.addArray(items); // append array of functions to end of all tasks
t.insertArray(items); // insert array of functions after current task

// sometime perhaps even more later
t.stop(); // stop all tasks on this instance of thaw from thawing
t.stopAll(); // stop ALL INSTANCES of thaw from thawing
```

## Block Usage
A "block" is a set number of thaw instances, so that setTimeout doesn't get over used.  This can lead to better performance in some cases.
```ts
import { Block } from 'thaw';
const thaws = new Block(thawOptions, count);
``` 
