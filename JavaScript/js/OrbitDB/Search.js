// @ts-check

import OrbitDB from 'OrbitDB/OrbitDB.js';

/**
 * Creates a global OrbitDB managing the audio and video tags
 * Use for debugging: http://localhost:3000/index_debug.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
 * NOTE: JSPM Transpiler does not allow web components, so we are left with a simple class
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Search extends OrbitDB {
  constructor (id = 'orbit-db') {
    super()
    this.id = id

    this.addresses = {
      searchDB: '/orbitdb/zdpuAso9e5JLqKLy8fr2eRfsMHqZQeSbrBKhqs2BqybiF64fk/search-db'
    }
  }

  init () {
    this.html = document.querySelector('#' + this.id)
    if (!this.html) return console.warn('SST: OrbitDB could not be started due to lack of html el hook #' + this.id)
    this.renderHTML(this.renderCSS())
    this.searchDB.then(db => db.events.on('replicated', address => this.renderList()))
  }

  renderCSS () {
    return `
      <style>
        #${this.id} {
          display: flex;
        }
        #${this.id} span.searchIcon {
          transform: rotate(110deg);
        }
        #${this.id} span.glyphicon {
          font-size: 22px;
        }
      </style>
    `
  }

  renderHTML (css = '') {
    const section = document.createElement('section')
    section.setAttribute('id', this.id)
    section.innerHTML = `
      ${css}
      <a href="#" class="orbit-db search"><span class=searchIcon>&#9740;</span>&nbsp;<span class="tiny">Search</span></a>
      <a href="#" class="orbit-db publish"><span class="glyphicon glyphicon-eye-open"></span>&nbsp;<span class="tiny">Publish</span></a>
      <a href="#" class="orbit-db unpublish"><span class="glyphicon glyphicon-eye-close"></span>&nbsp;<span class="tiny">Unpublish</span></a>
      <section>
        
      </section>
    `
    this.html.replaceWith(section)
    this.html = section
    return section
  }

  renderList (db = this.searchDB) {
    this.get(db).then(result => {
      console.log('render List', result);
    })
  }

  put (db = this.searchDB, title) {
    db.then(db => {
      db.put({
        _id: Date.now(),
        title,
        language: navigator.language,
        written: [Date.now()],
        //accessed: []
      })
    })
  }

  get (db = this.searchDB) {
    return db.then(db => db.get(''))
  }

  get searchDB () {
    return this._searchDB || (this._searchDB = new Promise(resolve => {
      this.orbitdb.then(orbitdb => {
        // https://github.com/orbitdb/orbit-db/blob/master/API.md#getkey-1
        orbitdb.docs(this.addresses.searchDB ? this.addresses.searchDB : 'search-db', {
          // Give write access to everyone
          accessController: {
            write: ['*']
          }
        }).then(db => {
          db.events.on('ready', (dbname, heads) => resolve(db))
          db.load()
          if (!this.addresses.searchDB) console.log(db.address.toString())
        })
      })
    }))
  }
}
