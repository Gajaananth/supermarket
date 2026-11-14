const fs = require('fs');

// 1. fs.mkdirSync
const origMkdirSync = fs.mkdirSync;
fs.mkdirSync = function(...args) {
  let attempts = 0;
  while (true) {
    try {
      return origMkdirSync.apply(fs, args);
    } catch (err) {
      if ((err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 15) {
        attempts++;
        const end = Date.now() + 50;
        while (Date.now() < end) {}
        continue;
      }
      throw err;
    }
  }
};

// 2. fs.mkdir (callback)
const origMkdir = fs.mkdir;
fs.mkdir = function(...args) {
  const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  const retryCall = (attempts) => {
    origMkdir.call(fs, ...args, (err, res) => {
      if (err && (err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 15) {
        setTimeout(() => retryCall(attempts + 1), 50);
      } else if (cb) {
        cb(err, res);
      }
    });
  };
  retryCall(0);
};

// 3. fs.promises.mkdir
if (fs.promises && fs.promises.mkdir) {
  const origPromisesMkdir = fs.promises.mkdir;
  fs.promises.mkdir = async function(...args) {
    let attempts = 0;
    while (true) {
      try {
        return await origPromisesMkdir.apply(fs.promises, args);
      } catch (err) {
        if ((err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 15) {
          attempts++;
          await new Promise((r) => setTimeout(r, 50));
          continue;
        }
        throw err;
      }
    }
  };
}
