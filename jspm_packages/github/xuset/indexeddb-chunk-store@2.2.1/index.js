module.exports = IdbChunkStore

var IdbKvStore = require('idb-kv-store')

function IdbChunkStore (chunkLength, opts, cb) {
  var self = this
  if (typeof chunkLength !== 'number') throw new Error('chunkLength must be a number')
  if (typeof opts === 'function') return IdbChunkStore(chunkLength, null, opts)
  if (!(self instanceof IdbChunkStore)) return new IdbChunkStore(chunkLength, opts, cb)
  if (!opts) opts = {}

  self.chunkLength = chunkLength
  self.length = Number(opts.length) || Infinity
  self.closed = false

  self._groupPutDelay = opts.groupPutDelay || 10
  self._groupPutCallbacks = []
  self._groupPutData = {}
  self._groupPutTimeout = null
  self._lastGroupPut = 0

  if (self.length !== Infinity) {
    this.lastChunkLength = (this.length % this.chunkLength) || this.chunkLength
    self.lastChunkIndex = Math.ceil(self.length / self.chunkLength) - 1
  }

  var name = opts.name || '' + Math.round(9e16 * Math.random())
  // for webtorrent
  if (opts.torrent && opts.torrent.infoHash) name = opts.torrent.infoHash

  self._store = new IdbKvStore(name, cb)
  self._store.on('close', onClose)
  self._store.on('error', onError)

  function onClose () {
    self._close(new Error('IndexedDB database unexpectedly closed'))
  }

  function onError (err) {
    self._close(err)
  }
}

IdbChunkStore.prototype.put = function (index, buffer, cb) {
  var self = this
  if (self.closed) throw new Error('Store is closed')
  if (typeof index !== 'number') throw new Error('index must be a number')
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer)

  var isLastChunk = (index === self.lastChunkIndex)
  var badLength = (isLastChunk && buffer.length !== self.lastChunkLength) ||
                  (!isLastChunk && buffer.length !== self.chunkLength)
  if (badLength) return nextTick(cb, new Error('Invalid buffer length'))

  self._groupPutData[index] = buffer
  if (cb) self._groupPutCallbacks.push(cb)

  if (self._lastGroupPut + self._groupPutDelay < Date.now()) {
    self._groupPut()
  } else if (self._groupPutTimeout == null) {
    self._groupPutTimeout = setTimeout(self._groupPut.bind(self), self._groupPutDelay)
  }
}

IdbChunkStore.prototype._groupPut = function () {
  var self = this
  if (self.closed) return
  var callbacks = self._groupPutCallbacks
  var data = self._groupPutData

  self._groupPutCallbacks = []
  self._groupPutData = {}
  self._lastGroupPut = Date.now()

  if (self._groupPutTimeout != null) clearTimeout(self._groupPutTimeout)
  self._groupPutTimeout = null

  var trans = self._store.transaction('readwrite')
  for (var i in data) trans.set(Number(i), data[i], noop)
  trans.onfinish = function (err) {
    for (var j in callbacks) {
      callbacks[j](err)
    }
  }
}

IdbChunkStore.prototype.get = function (index, opts, cb) {
  var self = this
  if (typeof opts === 'function') return self.get(index, null, opts)
  if (typeof cb !== 'function') throw new Error('cb must be a function')
  if (self.closed) throw new Error('Store is closed')
  if (typeof index !== 'number') throw new Error('index must be a number')
  if (!opts) opts = {}

  self._store.get(index, function (err, buffer) {
    if (err) return cb(err)
    if (typeof buffer === 'undefined') {
      var e = new Error('Chunk does not exist')
      e.name = 'MissingChunkError'
      return cb(e)
    }
    var offset = 'offset' in opts ? opts.offset : 0
    var length = 'length' in opts ? opts.length : buffer.length - offset
    cb(null, (Buffer.from(buffer)).slice(offset, offset + length))
  })
}

IdbChunkStore.prototype.close = function (cb) {
  this._close()
  nextTick(cb, null)
}

IdbChunkStore.prototype._close = function (err) {
  if (this.closed) return
  this.closed = true

  this._store.close()
  this._store = null
  this._groupPutData = null
  clearTimeout(this._groupPutTimeout)

  err = err || new Error('Store is closed')
  for (var i in this._groupPutCallbacks) this._groupPutCallbacks[i](err)
  this._groupPutCallbacks = null
}

IdbChunkStore.prototype.destroy = function (cb) {
  var self = this
  if (self.closed) throw new Error('Store is closed')

  self._store.clear(noop)
  self.close(cb)
}

function nextTick () {
  if (arguments[0] != null) {
    process.nextTick.apply(this, arguments)
  }
}

function noop () {
  // do nothing. This prevents idb-kv-store from defaulting to promises
}
