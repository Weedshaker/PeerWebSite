// @ts-check

/**
 * Creates a global OrbitDB managing the audio and video tags
 * Use for debugging: http://localhost:3000/index_debug.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
 * NOTE: JSPM Transpiler does not allow web components, so we are left with a simple class
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class OrbitDB {
  connect (parent, ipfs) {
    this.parent = parent
    this.ipfs = ipfs

    this.OrbitDB = new Promise(resolve => {
      const createOrbit = () => {
          if (window.OrbitDB) {
              resolve(window.OrbitDB)
          } else {
              setTimeout(createOrbit, 1000)
          }
      }
      createOrbit()
    })
    this.orbitdb = new Promise(resolve => {
      Promise.all([this.ipfs.node, this.OrbitDB]).then(packages => {
        const [node, OrbitDB] = packages
        // https://github.com/orbitdb/orbit-db/blob/master/GUIDE.md#create-a-database
        OrbitDB.createInstance(node).then(orbitdb => {
          resolve(orbitdb)
          this.init()
        })
      })
    })
  }

  init () {}
}
