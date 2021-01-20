// @ts-check

/**
 * Big PROBLEM: https://github.com/orbitdb/orbit-db/issues/844
 * https://github.com/orbitdb/orbit-db/issues/843
 * old IPFS versions don't work and new IPFS version are not compatible with Orbit-db
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
