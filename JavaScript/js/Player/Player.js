// @ts-check

/**
 * Creates a global Player managing the audio and video tags
 * Use for debugging: http://localhost:3000/index_debug.html#ipfs:QmT8dAKuCVQ7TTHV5ezNFE272cs15PyigJGV663GHeen6t
 * NOTE: JSPM Transpiler does not allow web components, so we are left with a simple class
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Player {
  constructor (id = 'player') {
    this.id = id
    this.saveTollerance = 10 // sec., used to decide from when a tracks currentTime would be saved
    this.prevResetTollerance = 3 // sec., used to decide from when a track would be reset when going to prev track
    this.seekTime = 10 // sec., used for seek steps
    this.keyDownTollerance = 300 // ms, used to decide from holding down a key to start seeking
    this.waitToPlayMs = 10000 // ms, in random mode waiting for play before skipping to next (every pause/play action will trigger multiple of native events which will reset isLoading nextRandom and postpone the nextRandom to trigger)
    // Note: EventListener named eg. 'waiting' retrigger the this.isLoading( faster than the waitToPlayMs = 10000 , for this keep it lower
    // NOTE: tried pause/play quick command to skip to next but did not work on mobile except of starting all songs: this.waitSkipAtPausePlayMs = 2000 // ms, in between pushing pause <-> play to skip to next random song

    // internal use
    this.randomQueue = []
    this._loadedmetadataControls = []
    this.onErrorExtendedToSourceIds = []
    this.respectRandom = true
    this.waitToPlayTimeout = null
  }
  
  connect (isSender, parent) {
    this.isSender = isSender
    this.parent = parent
    // wait for the first media to load metadata bevor the player options initialize
    document.body.addEventListener('loadedmetadata', event => this.init(event), { once: true, capture: true })
    document.body.addEventListener('loadedmetadata', event => this.refreshedInit(event), true)
  }

  init (event) {
    if (this.validateEvent(event) && (!this.currentControlIndex || this.mode === 'random')) this.currentControl = event.target
    let header = null
    if ((header = document.querySelector('body > header'))) header.classList.add('down')
    this.html = document.querySelector('#' + this.id)
    this.htmlPlaceholder = document.querySelector('#' + this.id + '-placeholder')
    if (!this.html) return console.warn('SST: Player could not be started due to lack of html el hook #' + this.id)
    this.addControlsBehavior(this.renderHTML(this.renderCSS()))
    this.addEventListeners()
    if (this.parent) this.parent.classList.add('hasPlayer')
    this.setMode(document.body.innerText.search(/loop.{0,1}ma[s]{0,1}chine/i) !== -1 && 'loop-machine') // initial set last mode
  }
  
  refreshedInit (event) {
    if (this.validateEvent(event)) this._loadedmetadataControls.push(event.target)
    this.setVolume() // initial set last volume
    this.allControls.forEach(control => this.onError(control)) // extended error handling
  }

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
  addEventListeners() {
    // is media playing or not
    document.body.addEventListener('canplay', event => {
			if (this.validateEvent(event)) this.isLoading(false, event.target)
    }, true)
    document.body.addEventListener('canplaythrough', event => {
			if (this.validateEvent(event)) this.isLoading(false, event.target)
    }, true)
    document.body.addEventListener('complete', event => {
			if (this.validateEvent(event)) this.isLoading(false, event.target)
    }, true)
    document.body.addEventListener('durationchange 	', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
    document.body.addEventListener('emptied 	', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
    // loop all audio + video
		document.body.addEventListener('ended', event => {
			if (this.validateEvent(event)) {
        this.isLoading(false, event.target)
        // set control to 0, since this would not work natively for ios
        this.setCurrentTime(event.target, 0)
        if (this.mode === 'repeat-one' || this.mode === 'loop-machine') {
          this.play(event.target)
        } else {
          this.next()
        }
      }
    }, true)
    document.body.addEventListener('loadeddata', event => {
			if (this.validateEvent(event)) this.isLoading(false, event.target)
    }, true)
    document.body.addEventListener('loadedmetadata', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
    document.body.addEventListener('pause', event => {
			if (this.validateEvent(event)) this.pause(event.target, true)
    }, true)
		document.body.addEventListener('play', event => {
      if (this.validateEvent(event)) this.play(event.target, true)
    }, true)
    document.body.addEventListener('play', event => {
      this.sessionPlayed = true
    }, { capture: true, once: true })
    document.body.addEventListener('playing', event => {
			if (this.validateEvent(event)) this.isLoading(false, event.target)
    }, true)
    document.body.addEventListener('ratechange', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
    document.body.addEventListener('seeked', event => {
			if (this.validateEvent(event)) {
        this.isLoading(false, event.target)
        this.respectRandom = true
        this.saveCurrentTime(event.target)
      }
    }, true)
    document.body.addEventListener('seeking', event => {
			if (this.validateEvent(event)) {
        this.isLoading(true, event.target)
        this.respectRandom = false
      }
    }, true)
    document.body.addEventListener('stalled', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
    document.body.addEventListener('suspend', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
		// save last currentTime
		document.body.addEventListener('timeupdate', event => {
			if (this.validateEvent(event)) {
        this.isLoading(false, event.target)
        this.saveCurrentTime(event.target)
        this.setDocumentTitle()
        // after error there was the case that the button wouldn't switch to play
        this.playBtn.classList.add('is-playing')
      }
    }, true)
    // keep all at same volume
		document.body.addEventListener('volumechange', event => {
			if (this.validateEvent(event)) this.setVolume(event.target.volume)
		}, true)
    document.body.addEventListener('waiting', event => {
			if (this.validateEvent(event)) this.isLoading(true, event.target)
    }, true)
    // keyboard
		if (!this.isSender) {
			document.body.addEventListener('keydown', event => {
				if (event.keyCode === 32 || event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 80) {
          event.preventDefault()
          // open player with "p"
          if (event.keyCode === 80) {
            this.openPlayer(undefined, true)
          // volume change
          } else if (event.keyCode === 38 || event.keyCode === 40) {
						this.setVolume((Number(localStorage.getItem('lastVolume') || 1) + (event.keyCode === 38 ? 0.1 : -0.1)).toFixed(4))
					// pause, play
					} else if (event.keyCode === 32) {
            // spacebar
            if (this.currentControl.paused) {
              this.play()
            } else {
              this.pauseAll()
            }
          // prev, next
          } else if (event.keyCode === 37) {
            // left
            if (!isNaN(this.prevTimestamp) && this.prevTimestamp + this.keyDownTollerance < Date.now()) {
              this.seekPrev()
            }
            if (!this.prevTimestamp) this.prevTimestamp = Date.now()
          // right
          } else if (event.keyCode === 39) {
            if (!isNaN(this.nextTimestamp) && this.nextTimestamp + this.keyDownTollerance < Date.now()) {
              this.seekNext()
            }
            if (!this.nextTimestamp) this.nextTimestamp = Date.now()
          }
				}
      }, true)
      document.body.addEventListener('keyup', event => {
        // prev, next
        if (event.keyCode === 37 || event.keyCode === 39) {
          event.preventDefault()
          // left
          if (event.keyCode === 37) {
            if (this.prevTimestamp + this.keyDownTollerance >= Date.now()) this.prev()
            this.prevTimestamp = undefined
          // right
          } else if (event.keyCode === 39) {
            if (this.nextTimestamp + this.keyDownTollerance >= Date.now()) this.next()
            this.nextTimestamp = undefined
          }
        }
      }, true)
		}
  }

  renderCSS () {
    return `
      <style>
        #${this.id} {
          display: block !important;
        }
        #${this.id} section.controls {
          background-color: darkslategrey;
          display: none;
          grid-template-areas: "title title title title clo"
                                "prev seekprev play seeknext next"
                                "repeat sleep sleep sleep sleep";
          grid-template-rows: 1fr 4fr 1fr;
          grid-template-columns: repeat(5, 1fr);
          height: 100%;
          left: 0;
          margin: auto;
          opacity: 0.95;
          padding: 5px;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 9999;
        }
        @media only screen and (max-width: 400px) {
          #${this.id} section.controls {
            grid-template-areas: "title title title clo"
                                 "play play play play"
                                 "prev seekprev seeknext next"
                                 "repeat sleep sleep sleep";
            grid-template-rows: 1fr 2fr 2fr 1fr;
            grid-template-columns: repeat(4, 1fr);
          }
        }
        #${this.id} section.controls.open {
          display: grid;
        }
        #${this.id} section.controls > i {
          cursor: pointer;
          font-size: min(15vh, 15vw);
          height: 100%;
          user-select: none;
          width: 100%;
        }
        #${this.id} section.controls > i > div {
          align-items: center;
          display: flex;
          height: 100%;
          justify-content: center;
          width: 100%;
        }
        #${this.id} section.controls > i:hover, #${this.id} section.controls > i:hover > div {
          color: #c5bbbb;
        }
        #${this.id} section.controls > div {
          font-size: min(5vh, 5vw);
        }
        #${this.id} section.controls > i, #${this.id} section.controls div {
          color: white;
          font-style: normal;
        }
        #${this.id} section.controls > i, #${this.id} section.controls > div {
          align-items: center;
          display: flex;
          justify-content: center;
        }
        #${this.id} section.controls > .title {
          cursor: pointer;
          grid-area: title;
          justify-content: start;
          overflow: hidden;
        }
        #${this.id} section.controls > .title > span {
          white-space: nowrap;
        }
        #${this.id} section.controls > .title > span.marquee {
          animation: marquee 10s linear infinite;
          animation-delay: 2s;
        }
        #${this.id} section.controls > .clo {
          grid-area: clo;
        }
        #${this.id} section.controls > .prev {
          grid-area: prev;
        }
        #${this.id} section.controls > .seekprev {
          grid-area: seekprev;
        }
        #${this.id} section.controls > .play {
          font-weight: bolder;
          grid-area: play;
        }
        #${this.id} section.controls > .play > div.pause {
          display: none;
        }
        #${this.id} section.controls > .play.is-playing > div.pause {
          display: flex;
        }
        #${this.id} section.controls > .play.is-playing > div.play {
          display: none;
        }
        #${this.id} section.controls > .seeknext {
          grid-area: seeknext;
        }
        #${this.id} section.controls > .next {
          grid-area: next;
        }
        #${this.id} section.controls > .repeat {
          grid-area: repeat;
        }
        #${this.id} section.controls > .repeat > div.repeat-one, #${this.id} section.controls > .repeat > div.random, #${this.id} section.controls > .repeat > div.loop-machine {
          display: none;
        }
        #${this.id} section.controls > .repeat.repeat-one > div.repeat-one, #${this.id} section.controls > .repeat.random > div.random, #${this.id} section.controls > .repeat.loop-machine > div.loop-machine {
          display: flex;
        }
        #${this.id} section.controls > .repeat.repeat-one > div.repeat-all, #${this.id} section.controls > .repeat.repeat-one > div.random, #${this.id} section.controls > .repeat.repeat-one > div.loop-machine,
        #${this.id} section.controls > .repeat.random > div.repeat-all,  #${this.id} section.controls > .repeat.random > div.repeat-one,  #${this.id} section.controls > .repeat.random > div.loop-machine,
        #${this.id} section.controls > .repeat.loop-machine > div.repeat-all,  #${this.id} section.controls > .repeat.loop-machine > div.repeat-one,  #${this.id} section.controls > .repeat.loop-machine > div.random {
          display: none;
        }
        #${this.id} section.controls > .sleep {
          align-content: center;
          display: flex;
          flex-wrap: wrap;
          grid-area: sleep;
        }
        #${this.id} section.controls > .sleep > span {
          margin-right: 15px;
        }
        #${this.id} section.controls > .sleep > input, #${this.id} section.controls > .sleep > span > select {
          border: 0;
          color: black;
          text-align: center;
        }
        #${this.id} section.controls > .sleep > span > select {
          background: transparent;
          color: white;
        }
        #${this.id} section.controls > .sleep > span > select > option {
          color: black;
        }
        #${this.id} section.controls > .sleep > input.active {
          border: 3px solid;
          animation: active 3s linear infinite;
        }
        #${this.id}.loop-machine > section.controls > .prev, #${this.id}.loop-machine > section.controls > .seekprev,
        #${this.id}.loop-machine > section.controls > .next, #${this.id}.loop-machine > section.controls > .seeknext {
          display: none;
        }
        #${this.id} section.controls > .play > div.loading {
          animation: loading 1s linear infinite;
          background-image: none;
          border-color: gray;
          border-radius: 50%;
          border-right-color: transparent !important;
          border: min(4vh, 4vw) solid white;
          box-shadow: 0 0 min(10vh, 10vw) min(1vh, 1vw) lightgray;
          display: none;
          height: min(15vh, 15vw);
          width: min(15vh, 15vw);
        }
        #${this.id}.loading > section.controls > .play > div.loading {
          display: inline-block;
        }
        #${this.id}.loading > section.controls > .play > div.play, #${this.id}.loading > section.controls > .play > div.pause {
          display: none;
        }
        #${this.id} > section.controls > .play > div.pause > .glyphicon-stop {
          display: none;
        }
        /*
        #${this.id}.random > section.controls > .play > div.pause > .glyphicon-stop {
          display: block;
        }
        #${this.id}.random > section.controls > .play > div.pause > .glyphicon-pause {
          display: none;
        }
        */

        @keyframes active {
          from {border-color: rgb(255, 0, 0, 0);}
          50% {border-color: rgb(255, 0, 0, 1);}
          to {border-color: rgb(255, 0, 0, 0);}
        }
        @keyframes marquee {
          from {transform: translateX(51%);}
          to {transform: translateX(-101%);}
        }
        @keyframes loading{
          from {transform: rotate(0deg); opacity: 0.2;}
          50% {transform: rotate(180deg); opacity: 1.0;}
          to {transform: rotate(360deg); opacity: 0.2;}
        }
      </style>
    `
  }

  renderHTML (css = '') {
    const section = document.createElement('section')
    section.setAttribute('id', this.id)
    section.innerHTML = `
      ${css}
      <a href="#" class="player">&#9836;&nbsp;<span class="tiny">Player</span></a>
      <section class="controls">
        <div class="title"><span>...</span></div><i class="clo"><span class="glyphicon glyphicon-remove"></span></i>
        <i class="prev"><span class="glyphicon glyphicon-step-backward"></i><i class="seekprev"><span class="glyphicon glyphicon-backward"></span></span></i>
          <i class="play"><div class="play"><span class="glyphicon glyphicon-play"></span></div><div class="pause"><span class="glyphicon glyphicon-pause"></span><span class="glyphicon glyphicon-stop"></span></div><div class="loading"></div></i>
        <i class="seeknext"><span class="glyphicon glyphicon-forward"></span></i><i class="next"><span class="glyphicon glyphicon-step-forward"></i>
        <i class="repeat">
          <div class="repeat-all"><span class="glyphicon glyphicon-refresh"></span></div><div class="repeat-one"><span class="glyphicon glyphicon-repeat"></span></div><div class="random"><span class="glyphicon glyphicon-random"></span></div><div class="loop-machine"><span class="glyphicon glyphicon-equalizer"></span></div>
        </i><div class="sleep"><span><select name="sleepMode">
          <option value="Sleep">Pause</option>
          <option value="Wake">Play</option>
        </select> in (min.):</span><input type="number" placeholder="0"></div>
      </section>
    `
    this.html.replaceWith(section)
    this.html = section
    this.htmlPlaceholder.innerHTML = '<span class="player">&#9836;&nbsp;<span class="tiny">Player</span></span>'
    return section
  }

  addControlsBehavior (section) {
    // title
    this.titleText = section.querySelector('.title span')
    section.querySelector('.title').addEventListener('click', event => this.scrollToEl())
    // open/close player
    this.playerControls = section.querySelector('.controls')
    section.querySelector('.player').addEventListener('click', event => {
      event.preventDefault()
      this.openPlayer()
    })
    section.querySelector('.clo').addEventListener('click', event => this.playerControls.classList.remove('open'))
    // play
    this.playBtn = section.querySelector('.play')
    this.playBtn.querySelector('.play').addEventListener('click', event => this.play())
    this.playBtn.querySelector('.pause').addEventListener('click', event => this.pause())
    this.playBtn.querySelector('.loading').addEventListener('click', event => {
      if (!this.loadingClickTimeout) this.loadingClickTimeout = setTimeout(() => {
        this.isLoading(false, this.currentControl, true)
        this.loadingClickTimeout = null
      }, 200)
    })
    this.playBtn.querySelector('.loading').addEventListener('dblclick', event => {
      clearTimeout(this.loadingClickTimeout)
      this.loadingClickTimeout = null
      let source = null
      if ((source = this.currentControl.querySelector('source')) && typeof source.onerror === 'function') {
        // if it is not already ipfs.cat then trigger it
        if (!source.classList.contains('ipfsLoading')) source.onerror()
        if (this.currentControl.paused) {
          this.play()
        } else {
          this.pause()
        }
      }
    })
    // prev, next
    section.querySelector('.prev').addEventListener('click', event => this.prev())
    section.querySelector('.next').addEventListener('click', event => this.next())
    // seek prev, next
    section.querySelector('.seekprev').addEventListener('click', event => this.seekPrev())
    section.querySelector('.seeknext').addEventListener('click', event => this.seekNext())
    // repeat
    this.repeatBtn = section.querySelector('.repeat')
    this.repeatBtn.querySelector('.repeat-all').addEventListener('click', event => this.setMode('repeat-one'))
    this.repeatBtn.querySelector('.repeat-one').addEventListener('click', event => this.setMode('random'))
    this.repeatBtn.querySelector('.random').addEventListener('click', event => this.setMode('loop-machine'))
    this.repeatBtn.querySelector('.loop-machine').addEventListener('click', event => this.setMode('repeat-all'))
    // sleep timer
    section.querySelector('.sleep input').addEventListener('change', event => {
      if (event.target && !isNaN(Number(event.target.value))) this.setTimer(event.target, event.target.value, section.querySelector('.sleep [name=sleepMode]').value === 'Sleep' ? 'pauseAll' : 'play')
    })
  }

  validateEvent (event) {
    return event.target && event.target.controls
  }

  setVolume (volume = Number(localStorage.getItem('lastVolume') || 1)) {
    volume = volume > 1 ? 1 : volume < 0 ? 0 : volume
    this.allControls.forEach(control => control.volume = volume)
    localStorage.setItem('lastVolume', volume)
  }

  scrollToEl (el = this.currentControl) {
    const rect = el.getBoundingClientRect()
    // check if the element is outside the viewport, otherwise don't scroll
    if (rect && (rect.top < 0 || rect.left < 0 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight) || rect.right > (window.innerWidth || document.documentElement.clientWidth))) {
      setTimeout(() => {
          el.focus()
          el.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'})
      }, 500)
    }
  }

  saveCurrentTime (control) {
    // don't save a tollerance of 10sec
    const currentTime = control.currentTime && control.currentTime > this.saveTollerance && control.currentTime < control.duration - this.saveTollerance ? control.currentTime : 0
    if (currentTime) {
      localStorage.setItem(`currentTime_${control.id}`, currentTime)
    } else if (localStorage.getItem(`currentTime_${control.id}`) !== null) {
      localStorage.removeItem(`currentTime_${control.id}`)
    }
  }

  loadCurrentTime (control, removeItem = true) {
    const currentTime = Number(localStorage.getItem(`currentTime_${control.id}`)) || 0
    if (currentTime && currentTime !== control.currentTime && !(this.respectRandom && this.mode === 'random')) {
      this.setCurrentTime(control, currentTime, true)
      if (removeItem) localStorage.removeItem(`currentTime_${control.id}`) // only to be set once, then can be deleted
    }
  }

  setCurrentTime (control, time = 0, ignoreSeeking = false) {
    if (isNaN(time)) time = 0
    if (ignoreSeeking || !control.seeking) control.currentTime = time
  }

  getControlTitle (control = this.currentControl) {
    let text = '...'
    if (!control) return text
    const figcaption = control.parentElement && control.parentElement.querySelector('figcaption') && control.parentElement.querySelector('figcaption').textContent || ''
    return figcaption ? figcaption : control.getAttribute('data-filename') ? control.getAttribute('data-filename') : control.getAttribute('download') ? control.getAttribute('download') : text
  }

  setTitleText (titleText = this.titleText, control) {
    titleText.textContent = this.getControlTitle(control)
    if (titleText.offsetWidth > titleText.parentElement.offsetWidth) {
      titleText.classList.add('marquee')
    } else {
      titleText.classList.remove('marquee')
    }
  }

  setDocumentTitle () {
    this.documentTitle = document.title
    let length = -1
    /*
    const progressIcons = ['ↈ', 'ↂ', 'ↀ', 'ↂ']
    let progressIconCounter = -1
    const progress = () => progressIcons[(progressIconCounter = progressIconCounter + 1 < progressIcons.length ? progressIconCounter + 1 : 0)]
    */
    this.setDocumentTitle = (reset = false) => {
      if (reset) {
        length = -1
        return document.title = this.documentTitle
      }
      const title = this.getControlTitle() + ' | '
      length = length + 1 >= title.length ? 0 : length + 1
      //document.title = `${progress()} ${title.substr(length)} | ${title.substr(0, length)}`
      document.title = title.substr(length) + title.substr(0, length)
    }
  }

  openPlayer (playerControls = this.playerControls, toggle = false) {
    if (!this.sessionPlayed) this.play()
    const command = toggle ? 'toggle' : 'add'
    playerControls.classList[command]('open')
    let header = null
    if (playerControls.classList.contains('open') && (header = document.querySelector('body > header'))) header.classList.add('down')
    this.setTitleText()
  }

  isPlayerOpen (playerControls = this.playerControls) {
    return playerControls.classList.contains('open')
  }

  play (control = this.currentControl, eventTriggered = false, respectLoopMachine = true) {
    if (!eventTriggered) {
      if (respectLoopMachine && this.mode === 'loop-machine') return this.playAll()
      if (control.paused) return control.play() // this wil trigger the event, which in turn will trigger this function
    }
    if (this.mode === 'random' && !this.randomQueue.includes(control)) this.randomQueue.push(control)
    this.currentControl = control
    this.playBtn.classList.add('is-playing')
    this.setTitleText(undefined, control)
    this.setDocumentTitle()
    if (this.mode !== 'loop-machine') this.pauseAll(control)
    this.loadCurrentTime(control) // do this because ios does not swollow currentTime set at loadedmetadata
  }

  playAll (except = null) {
    this.allPlayableControls.forEach(control => {
      if (control !== except && control.paused) this.play(control, undefined, false)
    })
  }

  pause (control = this.currentControl, eventTriggered = false, respectLoopMachine = true) {
    if (!eventTriggered) {
      if (respectLoopMachine && this.mode === 'loop-machine') return this.pauseAll()
      if (!control.paused) return control.pause() // this wil trigger the event, which in turn will trigger this function
    }
    if (this.currentControl === control) this.playBtn.classList.remove('is-playing')
    this.isLoading(false, control, !eventTriggered) // important: isLoading must be after is-playing, otherwise timeout gets triggered
    this.setDocumentTitle(true) // reset document.title to original title
  }

  pauseAll (except = null) {
    this.allControls.forEach(control => {
      if (control !== except) this.pause(control, undefined, false)
    })
  }

  prev (resetTrack = true, respectRandom = this.respectRandom) {
    const controls = this.allPlayableControls
    if (resetTrack && this.currentControl.currentTime > this.prevResetTollerance) {
      this.play()
      return this.setCurrentTime(this.currentControl, undefined, true)
    } else if (respectRandom && this.mode === 'random') return this.prevRandom()
    const index = this.currentControlIndex
    const control = controls[index - 1 < 0 ? controls.length - 1 : index - 1]
    if (control) {
      this.play(control)
      return control
    }
    return null
  }
  
  next (onlyReady, respectRandom = this.respectRandom) {
    if (respectRandom && this.mode === 'random') return this.nextRandom(onlyReady)
    const controls = onlyReady ? this.allReadyControls : this.allPlayableControls
    const index = controls.indexOf(this.currentControl) !== -1 ? controls.indexOf(this.currentControl) : this.currentControlIndex
    const control = controls[index + 1 >= controls.length ? 0 : index + 1]
    if (control) {
      this.play(control)
      return control
    }
    return null
  }

  prevRandom () {
    const control = this.randomQueue.splice(-1)[0]
    if (control) {
      this.play(control)
      return control
    }
    return this.prev(false, false)
  }

  nextRandom (onlyReady) {
    let allReadyControls = []
    let controls = []
    if (onlyReady === false) {
      controls = this.allPlayableControls
    } else {
      allReadyControls = this.allReadyControls
      controls = !!allReadyControls.length ? allReadyControls : this.allPlayableControls
    }
    if (this.randomQueue.length >= controls.length) this.randomQueue.splice(0, Math.ceil(this.randomQueue.length / 2)) // clear ranedom queue to release songs to be played random
    controls = controls.filter(control => !this.randomQueue.includes(control))
    const control = controls[Math.floor(Math.random() * controls.length)]
    if (control) {
      this.play(control)
      return control
    }
    return this.next(onlyReady, false)
  }

  seekPrev () {
    let control = this.currentControl
    if (control.currentTime > this.seekTime) {
      this.setCurrentTime(control, control.currentTime - this.seekTime)
    } else if ((control = this.prev(false))) {
      this.setCurrentTime(control, control.duration - this.seekTime)
    }
  }

  seekNext () {
    let control = this.currentControl
    if (control.currentTime + this.seekTime < control.duration) {
      this.setCurrentTime(control, control.currentTime + this.seekTime)
    } else if ((control = this.next())) {
      this.setCurrentTime(control, this.seekTime)
    }
  }

  setMode (mode) {
    if (mode) this.mode = mode
    this.repeatBtn.className = 'repeat' // reset to initial
    this.repeatBtn.classList.add(this.mode)
    this.html.className = this.mode
  }

  // only force with user interaction eg. play / pause
  isLoading (loading, control, force = false) {
    if (!force && control !== this.currentControl) return false
    // classes for the player interface
    if (this.mode !== 'loop-machine' && loading) {
      this.html.classList.add('loading')
    } else {
      this.html.classList.remove('loading')
      control.classList.remove('ipfsLoading')
      let source = null
      if ((source = control.querySelector('source'))) source.classList.remove('ipfsLoading')
    }
    // skip to next if song fails to play
    clearTimeout(this.waitToPlayTimeout)
    if (this.mode === 'random' && this.playBtn.classList.contains('is-playing')) {
      // isLoading is the most called function on any changes, in case onerror did not trigger
      if (control.classList.contains('ipfsLoading') || control.sst_hasError) return this.nextRandom()
      this.waitToPlayTimeout = setTimeout(() => {
        if(!!control.duration && !!Math.floor(Math.random() * 2)){
          this.pause()
          this.setCurrentTime(control, 0)
          this.play()
        } else {
          this.nextRandom()
        }
      }, this.waitToPlayMs)
    }
  }

  // value is expected in minutes
  setTimer (input, value, command = 'pauseAll') {
    input.value = value = Math.floor(value)
    clearTimeout(this.timer)
    if (!value || value <= 0) {
      input.classList.remove('active')
      input.value = 0
      this[command]()
    } else {
      input.classList.add('active')
      this.timer = setTimeout(() => this.setTimer(input, value - 1, command), 60000)
    }
    input.blur()
  }

  onError (control) {
    // once reset the html element
    if (control && control.id && !this.onErrorExtendedToSourceIds.includes(control.id)) {
      let source = null
      if ((source = control.querySelector('source')) && typeof source.onerror === 'function') {
        control.addEventListener('error', event => {
          control.sst_hasError = true
          if (this.mode === 'random' && control === this.currentControl) this.nextRandom()
          // if it is not already ipfs.cat then trigger it
          if (!source.classList.contains('ipfsLoading')) source.onerror()
        }, {once: true})
        source.addEventListener('error', event => {
          control.sst_hasError = true
          if (this.mode === 'random' && control === this.currentControl) this.nextRandom()
        }, {once: true})
      }
      this.onErrorExtendedToSourceIds.push(control.id)
    }
  }

  get allControls () {
    return Array.from(document.querySelectorAll('[controls]'))
  }

  get allPlayableControls () {
    // exclude any loading controls and error controls
    return this.allControls.filter(control => !control.classList.contains('ipfsLoading') && !control.sst_hasError)
  }

  get allReadyControls () {
    const allControls = this.loadedmetadataControls
    let state = 9 // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState + state 5 which means it has control.duration
    let controls = this.filterByReadyState(allControls, state) // 9
    while (state > 0 && (!controls.length || controls.every(control => this.randomQueue.includes(control)))) {
      state--
      controls = this.filterByReadyState(allControls, state) // (9 init 3 lines above), 8, 7, 6, 5, 4, 3, 2, 1, 0
    }
    return controls
  }

  filterByReadyState (controls, state = 9) {
    return controls.filter(control => {
      switch (state) {
        case 9:
          return !!control.duration && control.readyState >= 4
        case 8:
          return !!control.duration && control.readyState >= 3
        case 7:
          return !!control.duration && control.readyState >= 2
        case 6:
          return !!control.duration && control.readyState >= 1
        case 5:
          return !!control.duration
        case 0:
          return true
        default:
          return control.readyState >= state
      }
    })
  }

  get loadedmetadataControls () {
    return this._loadedmetadataControls.filter(control => this.allPlayableControls.includes(control))
  }

  set currentControlIndex (index) {
    localStorage.setItem(`lastPlayed_${location.hash}`, index === -1 ? 0 : index)
  }

  get currentControlIndex () {
    return Number(localStorage.getItem(`lastPlayed_${location.hash}`)) || 0
  }
  
  set currentControl (control) {
    this.currentControlIndex = this.allPlayableControls.indexOf(control)
  }

  get currentControl () {
    return this.allPlayableControls[this.currentControlIndex] || document.createElement('audio')
  }

  set mode (mode) {
    localStorage.setItem(`mode_${location.hash}`, mode)
  }

  get mode () {
    return localStorage.getItem(`mode_${location.hash}`) || 'random'
  }
}
