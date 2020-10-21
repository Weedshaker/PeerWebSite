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
    this.saveTollerance = 10 // sec., used to decide from when a track would be saved
    this.prevResetTollerance = 3 // sec., used to decide from when a track would be reset when going to prev track
    this.seekTime = 10 // sec.
    this.keyDownTollerance = 300 // ms
  }
  
  connect (isSender) {
    this.isSender = isSender
    // wait for the first media to load metadata bevor the player options initialize
    document.body.addEventListener('loadedmetadata', event => this.init(), { once: true, capture: true })
    document.body.addEventListener('loadedmetadata', event => this.refreshedInit(), true)
  }

  init () {
    this.html = document.querySelector('#' + this.id)
    if (!this.html) return console.warn('SST: Player could not be started due to lack of html el hook #' + this.id)
    this.addControlsBehavior(this.renderHTML(this.renderCSS()))
    this.addEventListeners()
  }
  
  refreshedInit () {
    this.setVolume() // intial set last volume
    this.currentControl.focus()
  }

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
  addEventListeners() {
		document.body.addEventListener('play', event => {
			if (this.validateEvent(event)) this.play(event.target, true)
    }, true)
    document.body.addEventListener('pause', event => {
			if (this.validateEvent(event)) this.pause(event.target, true)
    }, true)
    // loop all audio + video
		document.body.addEventListener('ended', event => {
			if (this.validateEvent(event)) {
        //  TODO: getNextByMode this.mode
				const control = this.allReadyControls
				let index = -1
				if ((index = control.indexOf(event.target)) !== -1) this.play(control[index + 1 >= control.length ? 0 : index + 1])
			}
		}, true)
		// keep all at same volume
		document.body.addEventListener('volumechange', event => {
			if (this.validateEvent(event)) this.setVolume(event.target.volume)
		}, true)
		// save last currentTime
		document.body.addEventListener('timeupdate', event => {
			if (this.validateEvent(event)) this.saveCurrentTime(event.target)
    }, true)
    document.body.addEventListener('seeked', event => {
			if (this.validateEvent(event)) this.saveCurrentTime(event.target)
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
        #${this.id} section.controls > i:hover {
          color: #c5bbbb;
        }
        #${this.id} section.controls > div {
          font-size: min(5vh, 5vw);
        }
        #${this.id} section.controls > i, #${this.id} section.controls > div {
          color: white;
          font-style: normal;
        }
        #${this.id} section.controls > i, #${this.id} section.controls > div {
          align-items: center;
          display: flex;
          justify-content: center;
        }
        #${this.id} section.controls > .title {
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
        #${this.id} section.controls > .repeat > div.repeat-one, #${this.id} section.controls > .repeat > div.random {
          display: none;
        }
        #${this.id} section.controls > .repeat.repeat-one > div.repeat-one, #${this.id} section.controls > .repeat.random > div.random {
          display: flex;
        }
        #${this.id} section.controls > .repeat.repeat-one > div.repeat-all,  #${this.id} section.controls > .repeat.repeat-one > div.random, #${this.id} section.controls > .repeat.random > div.repeat-all,  #${this.id} section.controls > .repeat.random > div.repeat-one {
          display: none;
        }
        #${this.id} section.controls > .repeat.random > div.repeat-all {
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
        #${this.id} section.controls > .sleep > input {
          color: black;
          text-align: center;
        }
        #${this.id} section.controls > .prev, #${this.id} section.controls > .next {
          letter-spacing: max(-7vh, -7vw);
          margin-left: max(-7vh, -7vw);
          white-space: nowrap;
        }
        #${this.id} section.controls > .play > div.pause {
          letter-spacing: max(-5vh, -5vw);
          margin-left: max(-5vh, -5vw);
          white-space: nowrap;
        }
        @keyframes marquee {
          0% {
            transform: translateX(51%);
          }
          100% {
            transform: translateX(-101%);
          }
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
        <div class="title"><span>...</span></div><i class="clo">&#10006;</i>
        <i class="prev">&#10073;&#10096;</i><i class="seekprev">&#10092;</i>
          <i class="play"><div class="play">&#10148;</div><div class="pause">&#10074;&#10074;</div></i>
        <i class="seeknext">&#10093;</i><i class="next">&#10097;&#10073;</i>
        <i class="repeat">
          <div class="repeat-all">&#9854;</div><div class="repeat-one">&#9843;</div><div class="random">&#9736;</div>
        </i><div class="sleep"><span>Sleep:</span><input type="number" placeholder="0"></div>
      </section>
    `
    this.html.replaceWith(section)
    return section
  }

  addControlsBehavior (section) {
    // title
    this.titleText = section.querySelector('.title span')
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
    this.repeatBtn.querySelector('.random').addEventListener('click', event => this.setMode('repeat-all'))
  }

  validateEvent (event) {
    return event.target && event.target.controls
  }

  setVolume (volume = Number(localStorage.getItem('lastVolume') || 1)) {
    volume = volume > 1 ? 1 : volume < 0 ? 0 : volume
    this.allControls.forEach(control => control.volume = volume)
    localStorage.setItem('lastVolume', volume)
  }

  scrollToEl (el) {
    const rect = el.getBoundingClientRect()
    // check if the element is outside the viewport, otherwise don't scroll
    if (rect && (rect.top < 0 || rect.left < 0 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight) || rect.right > (window.innerWidth || document.documentElement.clientWidth))) {
      setTimeout(() => el.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'}), 500)
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
    if (currentTime && currentTime !== control.currentTime) {
      this.setCurrentTime(control, currentTime, true)
      if (removeItem) localStorage.removeItem(`currentTime_${control.id}`) // only to be set once, then can be deleted
    }
  }

  setCurrentTime (control, time = 0, ignoreSeeking = false) {
    if (isNaN(time)) time = 0
    if (ignoreSeeking || !control.seeking) control.currentTime = time
  }

  getControlTitle (control) {
    let text = '...'
    if (!control) return text
    const figcaption = control.parentElement && control.parentElement.querySelector('figcaption') && control.parentElement.querySelector('figcaption').textContent || ''
    return figcaption ? figcaption : control.getAttribute('data-filename') ? control.getAttribute('data-filename') : control.getAttribute('download') ? control.getAttribute('download') : text
  }

  setTitleText (titleText = this.titleText, control = this.currentControl) {
    titleText.textContent = this.getControlTitle(control)
    if (titleText.offsetWidth > titleText.parentElement.offsetWidth) {
      titleText.classList.add('marquee')
    } else {
      titleText.classList.remove('marquee')
    }
  }

  openPlayer (playerControls = this.playerControls, toggle = false) {
    const command = toggle ? 'toggle' : 'add'
    playerControls.classList[command]('open')
    this.setTitleText()
  }

  play (control = this.currentControl, eventTriggered = false) {
    if (!eventTriggered && control.paused) return control.play() // this wil trigger the event, which in turn will trigger this function
    this.currentControl = control
    this.loadCurrentTime(control) // do this because ios does not swollow currentTime set at loadedmetadata
    this.pauseAll(control)
    this.playBtn.classList.add('is-playing')
    this.setTitleText(undefined, control)
    this.currentControl.focus()
    if (!this.isSender) this.scrollToEl(control) // only at receiver, otherwise the toolbar will be above the fold
  }

  pause (control = this.currentControl, eventTriggered = false) {
    if (!eventTriggered && !control.paused) return control.pause() // this wil trigger the event, which in turn will trigger this function
    if (this.currentControl === control) this.playBtn.classList.remove('is-playing')
  }

  pauseAll (except = null) {
    this.allControls.forEach(control => {
      if (control !== except) this.pause(control)
    })
  }

  prev (resetTrack = true) {
    const controls = this.allControls
    if (resetTrack && this.currentControl.currentTime > this.prevResetTollerance) {
      this.play()
      return this.setCurrentTime(this.currentControl, undefined, true)
    }
    const index = this.currentControlIndex
    const control = controls[index - 1 < 0 ? controls.length - 1 : index - 1]
    if (control) {
      this.play(control)
      return control
    }
    return null
  }
  
  next () {
    const controls = this.allControls
    const index = this.currentControlIndex
    const control = controls[index + 1 >= controls.length ? 0 : index + 1]
    if (control) {
      this.play(control)
      return control
    }
    return null
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
    this.repeatBtn.className = 'repeat'
    this.repeatBtn.classList.add(mode)
    this.mode = mode
  }

  get allControls () {
    return Array.from(document.querySelectorAll('[controls]'))
  }

  get allReadyControls () {
    return this.allControls.filter(control => control.readyState >= 1) // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
  }

  set currentControlIndex (index) {
    localStorage.setItem(`lastPlayed_${location.hash}`, index === -1 ? 0 : index)
  }

  get currentControlIndex () {
    return Number(localStorage.getItem(`lastPlayed_${location.hash}`)) || 0
  }
  
  set currentControl (control) {
    this.currentControlIndex = this.allControls.indexOf(control)
  }

  get currentControl () {
    return this.allControls[this.currentControlIndex] || null
  }
}
