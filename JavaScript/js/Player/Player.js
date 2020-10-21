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
  }
  
  connect (isSender) {
    this.isSender = isSender
    // wait for the first media to load metadata bevor the player options initialize
    document.body.addEventListener('loadedmetadata', event => this.init(), { once: true, capture: true })
  }

  init () {
    this.html = document.querySelector('#' + this.id)
    if (!this.html) return console.warn('SST: Player could not be started due to lack of html el hook #' + this.id)
    this.addControlsBehavior(this.renderHTML(this.renderCSS()))
    this.addEventListeners()
  }

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
  addEventListeners() {
		// stop other audios playing
		document.body.addEventListener('play', event => {
			if (this.validateEvent(event)) this.allControls.forEach((control, index) => {
				if (control !== event.target) {
					 this.pause(control)
				} else {
          this.play(control)
					this.loadCurrentTime(control) // do this because ios does not swollow currentTime set at loadedmetadata
				}
				this.setVolumeAll()
			})
    }, true)
    // loop all audio + video
		document.body.addEventListener('ended', event => {
			if (this.validateEvent(event)) {
				const control = this.allReadyControls //Array.from(document.querySelectorAll('audio')).concat(Array.from(document.querySelectorAll('video')))
				let index = -1
				if ((index = control.indexOf(event.target)) !== -1) this.play(control[index + 1 >= control.length ? 0 : index + 1])
			}
		}, true)
		// keep all at same volume
		document.body.addEventListener('volumechange', event => {
			if (this.validateEvent(event)) this.setVolumeAll(event.target.volume)
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
						this.setVolumeAll((Number(localStorage.getItem('lastVolume') || 1) + (event.keyCode === 38 ? 0.1 : -0.1)).toFixed(4))
						// prev, next, pause, play
					} else {
						const controls = this.allControls
						const index = this.currentControlIndex
						const allWerePaused = this.pauseAll()
						// spacebar
						if (event.keyCode === 32) {
							// if all were already paused play last or first song/video
              if (allWerePaused) this.play()
              // TODO: broken but review the whole play pause next prev concept!!!!
						// left
						} else if (event.keyCode === 37) {
							const prevToPlay = controls[index - 1 < 0 ? controls.length - 1 : index - 1]
							// if all were already paused play last or first song/video
							if (prevToPlay) this.play(prevToPlay)
						// right
						} else if (event.keyCode === 39) {
							const nextToPlay = controls[index + 1 >= controls.length ? 0 : index + 1]
							// if all were already paused play last or first song/video
							if (nextToPlay) this.play(nextToPlay)
						}
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
        #${this.id} section.controls.open {
          display: grid;
        }
        #${this.id} section.controls > i {
          cursor: pointer;
          font-size: min(15vh, 15vw);
          user-select: none;
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
        #${this.id} section.controls > .play > span.pause {
          display: none;
        }
        #${this.id} section.controls > .play.is-playing > span.pause {
          display: block;
        }
        #${this.id} section.controls > .play.is-playing > span.play {
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
        #${this.id} section.controls > .repeat > span.repeat-one {
          display: none;
        }
        #${this.id} section.controls > .repeat.repeat-one > span.repeat-one {
          display: block;
        }
        #${this.id} section.controls > .repeat.repeat-one > span.repeat-all {
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
        #${this.id} section.controls > .prev, #${this.id} section.controls > .next, #${this.id} section.controls > .play > span.pause {
          letter-spacing: max(-7vh, -7vw);
          margin-left: max(-7vh, -7vw);
          white-space: nowrap;
        }
        #${this.id} section.controls > .play > span.pause {
          letter-spacing: max(-5vh, -5vw);
          margin-left: max(-5vh, -5vw);
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
          <i class="play"><span class="play">&#10148;</span><span class="pause">&#10074;&#10074;</span></i>
        <i class="seeknext">&#10093;</i><i class="next">&#10097;&#10073;</i>
        <i class="repeat"><span class="repeat-all">&#9854;</span><span class="repeat-one">&#9843;</span></i><div class="sleep"><span>Sleep:</span><input type="number" placeholder="0"></div>
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
    const openButton = section.querySelector('.player')
    openButton.addEventListener('click', event => {
      event.preventDefault()
      this.openPlayer()
    })
    const closeButton = section.querySelector('.clo')
    closeButton.addEventListener('click', event => this.playerControls.classList.remove('open'))
    // play
    this.playBtn = section.querySelector('.play')
    this.playPlayBtn = this.playBtn.querySelector('.play')
    this.playPlayBtn.addEventListener('click', event => this.play())
    this.playPauseBtn = this.playBtn.querySelector('.pause')
    this.playPauseBtn.addEventListener('click', event => this.pause())
  }

  validateEvent (event) {
    return event.target && event.target.controls
  }

  setVolumeAll (volume = Number(localStorage.getItem('lastVolume') || 1)) {
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
    const currentTime = control.currentTime && control.currentTime > 10 && control.currentTime < control.duration - 10 ? control.currentTime : 0
    if (currentTime) {
      localStorage.setItem(`currentTime_${control.id}`, currentTime)
    } else if (localStorage.getItem(`currentTime_${control.id}`) !== null) {
      localStorage.removeItem(`currentTime_${control.id}`)
    }
  }

  loadCurrentTime (control, removeItem = true) {
    const currentTime = Number(localStorage.getItem(`currentTime_${control.id}`)) || 0
    if (currentTime && currentTime !== control.currentTime) {
      control.currentTime = currentTime
      if (removeItem) localStorage.removeItem(`currentTime_${control.id}`) // only to be set once, then can be deleted
    }
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

  play (control = this.currentControl) {
    const index = this.allControls.indexOf(control)
    localStorage.setItem(`lastPlayed_${location.hash}`, index === -1 ? 0 : index)
    this.setTitleText()
    if (!this.isSender) this.scrollToEl(control) // only at receiver, otherwise the toolbar will be above the fold
    this.playBtn.classList.add('is-playing')
    if (control.paused) {
      control.play()
      return true
    }
    return false
  }

  pause (control = this.currentControl) {
    if (this.currentControl === control) this.playBtn.classList.remove('is-playing')
    if (!control.paused) {
      control.pause()
      return true
    }
    return false
  }

  prev () {

  }

  next () {
    
  }

  pauseAll () {
    let allWerePaused = true
    // pause all
    this.allControls.forEach(control => {
      if (!this.pause(control)) allWerePaused = false
    })
    return allWerePaused
  }

  get allControls () {
    return Array.from(document.querySelectorAll('[controls]'))
  }

  get allReadyControls () {
    return this.allControls.filter(control => control.readyState >= 1) // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
  }

  get currentControlIndex () {
    return Number(localStorage.getItem(`lastPlayed_${location.hash}`)) || 0
  }

  get currentControl () {
    return this.allControls[this.currentControlIndex] || null
  }
}
