// @ts-check

import OrbitDB from 'OrbitDB/OrbitDB.js';

/**
 * Big PROBLEM: https://github.com/orbitdb/orbit-db/issues/844
 * https://github.com/orbitdb/orbit-db/issues/843
 * old IPFS versions don't work and new IPFS version are not compatible with Orbit-db
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
      searchDB: '/orbitdb/zdpuAs2TZqMd6XMLrmjZiADXfMDn2nM197miaaAQAM4pvRL48/search-db2'
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

  put (db = this.searchDB, name) {
    db.then(db => {
      db.put(Date.now(), { name })
      /*db.put(Date.now(), {
        name,
        language: navigator.language,
        written: [Date.now()],
        accessed: []
      })*/
    })
  }

  get (db = this.searchDB, key) {
    return db.then(db => key ? db.get(key) : db.all)
  }

  get searchDB () {
    return this._searchDB || (this._searchDB = new Promise(resolve => {
      this.orbitdb.then(orbitdb => {
        // https://github.com/orbitdb/orbit-db/blob/master/API.md#getkey-1
        const dbConfig = {
          // If database doesn't exist, create it
          create: true,
          // Don't wait to load from the network
          sync: false,
          // Load only the local version of the database
          // localOnly: true,
          // Allow anyone to write to the database,
          // otherwise only the creator of the database can write
          accessController: {
            write: ['*'],
          }
        }
        orbitdb.keyvalue(this.addresses.searchDB ? this.addresses.searchDB : 'search-db2', dbConfig).then(db => {
          db.events.on('ready', (dbname, heads) => resolve(db))
          db.load()
          if (!this.addresses.searchDB) console.log(db.address.toString())
        })
      })
    }))
  }
}
