# indexeddb-chunk-store [![Build Status](https://travis-ci.org/xuset/indexeddb-chunk-store.svg?branch=master)](https://travis-ci.org/xuset/indexeddb-chunk-store) [![npm](https://img.shields.io/npm/v/indexeddb-chunk-store.svg)](https://npmjs.org/package/indexeddb-chunk-store)

#### An [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) compliant store backed by IndexedDB for the browser

[![abstract chunk store](https://cdn.rawgit.com/mafintosh/abstract-chunk-store/master/badge.svg)](https://github.com/mafintosh/abstract-chunk-store)[![Sauce Test Status](https://saucelabs.com/browser-matrix/xuset-idb-chunk.svg)](https://saucelabs.com/u/xuset-idb-chunk)

## Install

`npm install indexeddb-chunk-store`

This module can be used with browserify or the [idbchunkstore.min.js](https://raw.githubusercontent.com/xuset/indexeddb-chunk-store/master/idbchunkstore.min.js) script can be included which will attach `IdbChunkStore` to `window`

## Usage

```js
var store = IdbChunkStore(10)

chunks.put(0, new Buffer('01234567890'), function (err) {
  if (err) throw err
  chunks.get(0, function (err, chunk) {
    if (err) throw err
    console.log(chunk) // '01234567890' as a buffer
  })
})
```

## API

The api is compatible with [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store#api) so look there for the api docs. There is one difference from abstract-chunk-store and that is that the IdbChunkStore constrcutor.

### `new IdbChunkStore(chunkLength, [opts], [cb])`

Creates a new store with the given `chunkLength`. The following properties can be passed into `opts`:
* `opts.name` - The name of the IndexedDB database to open. If left undefined, a random database name is generated. If you reuse the same name across multiple IdbChunkStore instances or even web sessions, the data in the store will persist across these instances and sessions.
* `opts.length` - Limits the size of the chunk store. If left undefined, the store is not constrained by a max size.
* `opts.groupPutDelay` - The delay in milliseconds to wait for more puts to come before committing the puts to IndexedDB. Defaults to 10 milliseconds. Passing in a negative number disables the delay and all puts are written to IndexedDB immediately. Disabling the grouping can lead to very bad throughput and slow performance.

`cb` is called when the IndexedDB database is opened. Put and get operations can still be done before the db is opened, but they will be queued then processed upon a successful open. If an error occures while opening, the callback is called with `cb(err)` where err is non-null.

## License

MIT. Copyright (c) Austin Middleton.
