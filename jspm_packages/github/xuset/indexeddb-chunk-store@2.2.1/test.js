var IdbChunkStore = require('.')
var abstractTests = require('abstract-chunk-store/tests')
var test = require('tape')
var runParallel = require('run-parallel')

abstractTests(test, IdbChunkStore)

test('get non-existent chunk', function (t) {
  var store = new IdbChunkStore(10)
  store.get(0, function (err) {
    t.ok(err instanceof Error)
    t.equal(err.name, 'MissingChunkError')
    t.end()
  })
})

test('programmer errors', function (t) {
  t.throws(function () { IdbChunkStore() })
  t.throws(function () { IdbChunkStore('foo') })

  var store = IdbChunkStore(10, {length: 15})

  t.throws(function () { store.put('foo', Buffer.from('0123456789')) })

  t.throws(function () { store.get(0) })
  t.throws(function () { store.get('foo', function () {}) })
  t.end()
})

test('buffer conversions', function (t) {
  var store = IdbChunkStore(3)
  store.put(0, 'foo', function (err) {
    t.equal(err, null)
    store.get(0, function (err, buffer) {
      t.equal(err, null)
      t.ok(buffer instanceof Buffer)
      t.equal(buffer.toString(), 'foo')
      t.end()
    })
  })
})

test('close()', function (t) {
  var store = IdbChunkStore(10)
  store.close(function (err) {
    t.equal(err, null)
    t.throws(function () { store.put(0, Buffer.from('0123456789'), function () {}) })
    t.throws(function () { store.get(0, function () {}) })
    t.doesNotThrow(function () { store.close() })
    t.throws(function () { store.destroy() })
    store = IdbChunkStore(10, function (err) {
      t.equal(err, null)
      store.close(function (err) {
        t.equal(err, null)
        t.end()
      })
    })
  })
})

test.skip('contention', function (t) {
  t.timeoutAfter(3000)
  var buffer = Buffer.alloc(10)
  var store = IdbChunkStore(10)
  var done = false

  setTimeout(function () {
    store.get(0, function (err, buff) {
      done = true
      t.equal(err, null)
      t.ok(buff.equals(buffer))
      t.end()
    })
  }, 1000)

  put()

  function put () {
    for (var i = 0; i < 100; i++) {
      store.put(i, buffer)
    }
    if (!done) setTimeout(put, 0)
  }
})

test.skip('benchmark', function (t) {
  var chunkSize = 4 * 1024
  var chunkCount = 10000
  var chunk = Buffer.alloc(chunkSize)

  var store = IdbChunkStore(chunkSize)
  var tasks = []
  for (var i = 0; i < chunkCount; i++) {
    (function (index) {
      tasks.push(function (cb) {
        store.put(index, chunk, cb)
      })
    })(i)
  }

  var start = Date.now()
  runParallel(tasks, function (err) {
    t.equal(err, null)
    var time = (Date.now() - start) / 1000
    var size = 8 * chunkSize * chunkCount / 1024 / 1024
    var speed = Math.round(size / time)
    t.comment('SIZE=' + size + 'Mib  TIME=' + time + 's  SPEED=' + speed + 'Mib/s')
    t.end()
  })
})
