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
  constructor (id = 'orbit-db') {
    this.id = id
  }
  
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
          OrbitDB.createInstance(node).then(orbitdb => {
            resolve(orbitdb)
            this.init()
            orbitdb.keyvalue('first-database').then(db => {
                console.log(db.address.toString())
                db.put('name', 'hello').then(() => console.log(db.get('name')))
                // https://github.com/orbitdb/orbit-db/blob/master/GUIDE.md#create-a-database
            })
          })
      })
    })
  }

  init () {
    this.html = document.querySelector('#' + this.id)
    if (!this.html) return console.warn('SST: OrbitDB could not be started due to lack of html el hook #' + this.id)
    this.renderHTML(this.renderCSS())
  }

  renderCSS () {
    return `
      <style>
        #${this.id} {
          display: block !important;
        }
      </style>
    `
  }

  renderHTML (css = '') {
    const section = document.createElement('section')
    section.setAttribute('id', this.id)
    section.innerHTML = `
      ${css}
      <a href="#" class="orbit-db">&#9836;&nbsp;<span class="tiny">OrbitDB</span></a>
      <section>
        
      </section>
    `
    this.html.replaceWith(section)
    this.html = section
    return section
  }
}
