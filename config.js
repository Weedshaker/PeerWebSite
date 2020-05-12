System.config({
  baseURL: "./",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "*": "./JavaScript/js/*",
    "mock/*": "./JavaScript/mock/*",
    "./*": "./*",
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  packages: {
    "summernote/summernote": {
      "format": "cjs"
    }
  },

  meta: {
    "*/RTCMultiConnection.js": {
      "format": "global"
    },
    "Editor/lib/codemirror/codemirror.js": {
      "format": "global"
    },
    "Editor/lib/codemirror/css.js": {
      "deps": [
        "Editor/lib/codemirror/codemirror.js"
      ]
    },
    "Editor/lib/codemirror/formatting.js": {
      "deps": [
        "Editor/lib/codemirror/codemirror.js"
      ]
    },
    "Editor/lib/codemirror/htmlmixed.js": {
      "deps": [
        "Editor/lib/codemirror/codemirror.js"
      ]
    },
    "Editor/lib/codemirror/javascript.js": {
      "deps": [
        "Editor/lib/codemirror/codemirror.js"
      ]
    },
    "Editor/lib/codemirror/xml.js": {
      "deps": [
        "Editor/lib/codemirror/codemirror.js"
      ]
    }
  },

  map: {
    "AkeemMcLennon/dom2hscript": "github:AkeemMcLennon/dom2hscript@master",
    "Weedshaker/virtual-dom": "github:Weedshaker/virtual-dom@2.1.2",
    "babel": "npm:babel-core@5.8.38",
    "babel-runtime": "npm:babel-runtime@5.8.38",
    "bootstrap": "github:twbs/bootstrap@3.3.7",
    "capaj/systemjs-hot-reloader": "github:alexisvincent/systemjs-hot-reloader@0.6.0",
    "core-js": "npm:core-js@1.2.7",
    "hockic/summernote-ext-filedialog": "github:hockic/summernote-ext-filedialog@master",
    "jquery": "npm:jquery@3.3.1",
    "muaz-khan/RTCMultiConnection": "github:muaz-khan/RTCMultiConnection@3.4.4",
    "parse-torrent": "npm:parse-torrent@5.8.3",
    "pieroxy/lz-string": "github:pieroxy/lz-string@1.4.4",
    "socket.io-client": "github:socketio/socket.io-client@1.7.4",
    "summernote/summernote": "github:summernote/summernote@0.8.16",
    "tanaka-de-silva/google-diff-match-patch-js": "github:tanaka-de-silva/google-diff-match-patch-js@1.0.0",
    "webtorrent/webtorrent": "github:webtorrent/webtorrent@0.108.1",
    "xuset/indexeddb-chunk-store": "github:xuset/indexeddb-chunk-store@2.2.1",
    "github:alexisvincent/systemjs-hot-reloader@0.6.0": {
      "debug": "npm:debug@2.6.9",
      "socket.io-client": "github:socketio/socket.io-client@1.7.4",
      "weakee": "npm:weakee@1.0.0"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.4.1"
    },
    "github:jspm/nodelibs-buffer@0.1.1": {
      "buffer": "npm:buffer@5.1.0"
    },
    "github:jspm/nodelibs-constants@0.1.0": {
      "constants-browserify": "npm:constants-browserify@0.0.1"
    },
    "github:jspm/nodelibs-crypto@0.1.0": {
      "crypto-browserify": "npm:crypto-browserify@3.12.0"
    },
    "github:jspm/nodelibs-events@0.1.1": {
      "events": "npm:events@1.0.2"
    },
    "github:jspm/nodelibs-http@1.7.1": {
      "Base64": "npm:Base64@0.2.1",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "url": "github:jspm/nodelibs-url@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "github:jspm/nodelibs-https@0.1.0": {
      "https-browserify": "npm:https-browserify@0.0.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.10"
    },
    "github:jspm/nodelibs-querystring@0.1.0": {
      "querystring": "npm:querystring@0.2.0"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-string_decoder@0.1.0": {
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "github:jspm/nodelibs-url@0.1.0": {
      "url": "npm:url@0.10.3"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "github:twbs/bootstrap@3.3.7": {
      "jquery": "npm:jquery@3.3.1"
    },
    "npm:asn1.js@4.10.1": {
      "bn.js": "npm:bn.js@4.11.8",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:assert@1.4.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.38": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:bencode@2.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "safe-buffer": "npm:safe-buffer@5.1.1"
    },
    "npm:blob-to-buffer@1.2.7": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:browserify-aes@1.1.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "buffer-xor": "npm:buffer-xor@1.0.3",
      "cipher-base": "npm:cipher-base@1.0.4",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "evp_bytestokey": "npm:evp_bytestokey@1.0.3",
      "inherits": "npm:inherits@2.0.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:browserify-cipher@1.0.0": {
      "browserify-aes": "npm:browserify-aes@1.1.1",
      "browserify-des": "npm:browserify-des@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "evp_bytestokey": "npm:evp_bytestokey@1.0.3"
    },
    "npm:browserify-des@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "cipher-base": "npm:cipher-base@1.0.4",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "des.js": "npm:des.js@1.0.0",
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:browserify-rsa@4.0.1": {
      "bn.js": "npm:bn.js@4.11.8",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "randombytes": "npm:randombytes@2.0.6"
    },
    "npm:browserify-sign@4.0.4": {
      "bn.js": "npm:bn.js@4.11.8",
      "browserify-rsa": "npm:browserify-rsa@4.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "create-hmac": "npm:create-hmac@1.1.6",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@6.4.0",
      "inherits": "npm:inherits@2.0.1",
      "parse-asn1": "npm:parse-asn1@5.1.0",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:buffer-xor@1.0.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:buffer@5.1.0": {
      "base64-js": "npm:base64-js@1.3.0",
      "ieee754": "npm:ieee754@1.1.12"
    },
    "npm:cipher-base@1.0.4": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "string_decoder": "github:jspm/nodelibs-string_decoder@0.1.0"
    },
    "npm:constants-browserify@0.0.1": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:core-js@1.2.7": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:core-util-is@1.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:create-ecdh@4.0.0": {
      "bn.js": "npm:bn.js@4.11.8",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@6.4.0"
    },
    "npm:create-hash@1.1.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "cipher-base": "npm:cipher-base@1.0.4",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "ripemd160": "npm:ripemd160@2.0.1",
      "sha.js": "npm:sha.js@2.4.10"
    },
    "npm:create-hmac@1.1.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "cipher-base": "npm:cipher-base@1.0.4",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "ripemd160": "npm:ripemd160@2.0.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "sha.js": "npm:sha.js@2.4.10"
    },
    "npm:crypto-browserify@3.12.0": {
      "browserify-cipher": "npm:browserify-cipher@1.0.0",
      "browserify-sign": "npm:browserify-sign@4.0.4",
      "create-ecdh": "npm:create-ecdh@4.0.0",
      "create-hash": "npm:create-hash@1.1.3",
      "create-hmac": "npm:create-hmac@1.1.6",
      "diffie-hellman": "npm:diffie-hellman@5.0.2",
      "inherits": "npm:inherits@2.0.1",
      "pbkdf2": "npm:pbkdf2@3.0.14",
      "public-encrypt": "npm:public-encrypt@4.0.0",
      "randombytes": "npm:randombytes@2.0.6",
      "randomfill": "npm:randomfill@1.0.4"
    },
    "npm:debug@2.6.9": {
      "ms": "npm:ms@2.0.0"
    },
    "npm:des.js@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
    },
    "npm:diffie-hellman@5.0.2": {
      "bn.js": "npm:bn.js@4.11.8",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "miller-rabin": "npm:miller-rabin@4.0.1",
      "randombytes": "npm:randombytes@2.0.6",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:elliptic@6.4.0": {
      "bn.js": "npm:bn.js@4.11.8",
      "brorand": "npm:brorand@1.1.0",
      "hash.js": "npm:hash.js@1.1.3",
      "hmac-drbg": "npm:hmac-drbg@1.0.1",
      "inherits": "npm:inherits@2.0.1",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:evp_bytestokey@1.0.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "md5.js": "npm:md5.js@1.3.4",
      "safe-buffer": "npm:safe-buffer@5.1.1"
    },
    "npm:get-stdin@5.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:hash-base@2.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:hash-base@3.0.4": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:hash.js@1.1.3": {
      "inherits": "npm:inherits@2.0.3",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
    },
    "npm:hmac-drbg@1.0.1": {
      "hash.js": "npm:hash.js@1.1.3",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:https-browserify@0.0.0": {
      "http": "github:jspm/nodelibs-http@1.7.1"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:inherits@2.0.3": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:magnet-uri@5.1.7": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "thirty-two": "npm:thirty-two@1.0.2",
      "uniq": "npm:uniq@1.0.1",
      "xtend": "npm:xtend@4.0.1"
    },
    "npm:md5.js@1.3.4": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "hash-base": "npm:hash-base@3.0.4",
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:miller-rabin@4.0.1": {
      "bn.js": "npm:bn.js@4.11.8",
      "brorand": "npm:brorand@1.1.0"
    },
    "npm:once@1.4.0": {
      "wrappy": "npm:wrappy@1.0.2"
    },
    "npm:parse-asn1@5.1.0": {
      "asn1.js": "npm:asn1.js@4.10.1",
      "browserify-aes": "npm:browserify-aes@1.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "evp_bytestokey": "npm:evp_bytestokey@1.0.3",
      "pbkdf2": "npm:pbkdf2@3.0.14",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:parse-torrent-file@4.1.0": {
      "bencode": "npm:bencode@2.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "simple-sha1": "npm:simple-sha1@2.1.0",
      "uniq": "npm:uniq@1.0.1"
    },
    "npm:parse-torrent@5.8.3": {
      "blob-to-buffer": "npm:blob-to-buffer@1.2.7",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "get-stdin": "npm:get-stdin@5.0.1",
      "magnet-uri": "npm:magnet-uri@5.1.7",
      "parse-torrent-file": "npm:parse-torrent-file@4.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "simple-get": "npm:simple-get@2.7.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:pbkdf2@3.0.14": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "create-hmac": "npm:create-hmac@1.1.6",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "ripemd160": "npm:ripemd160@2.0.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "sha.js": "npm:sha.js@2.4.10"
    },
    "npm:process@0.11.10": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:public-encrypt@4.0.0": {
      "bn.js": "npm:bn.js@4.11.8",
      "browserify-rsa": "npm:browserify-rsa@4.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "parse-asn1": "npm:parse-asn1@5.1.0",
      "randombytes": "npm:randombytes@2.0.6"
    },
    "npm:punycode@1.3.2": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:randombytes@2.0.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "safe-buffer": "npm:safe-buffer@5.1.1"
    },
    "npm:randomfill@1.0.4": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "randombytes": "npm:randombytes@2.0.6",
      "safe-buffer": "npm:safe-buffer@5.1.1"
    },
    "npm:readable-stream@1.1.14": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "core-util-is": "npm:core-util-is@1.0.2",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:ripemd160@2.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "hash-base": "npm:hash-base@2.0.2",
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:rusha@0.8.13": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:safe-buffer@5.1.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:sha.js@2.4.10": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "safe-buffer": "npm:safe-buffer@5.1.1"
    },
    "npm:simple-concat@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:simple-get@2.7.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "http": "github:jspm/nodelibs-http@1.7.1",
      "https": "github:jspm/nodelibs-https@0.1.0",
      "once": "npm:once@1.4.0",
      "querystring": "github:jspm/nodelibs-querystring@0.1.0",
      "simple-concat": "npm:simple-concat@1.0.0",
      "url": "github:jspm/nodelibs-url@0.1.0"
    },
    "npm:simple-sha1@2.1.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "rusha": "npm:rusha@0.8.13"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "readable-stream": "npm:readable-stream@1.1.14"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:thirty-two@1.0.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:url@0.10.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "punycode": "npm:punycode@1.3.2",
      "querystring": "npm:querystring@0.2.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    }
  }
});
