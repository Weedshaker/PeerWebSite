// @ts-check

/**
 * Creates a global Player managing the audio and video tags
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
    this.html = document.querySelector('#' + this.id)
    if (!this.html) return console.warn('SST: Player could not be started due to lack of html el hook #' + this.id)
    this.renderHTML()
    this.addEventListeners()
  }

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
  addEventListeners() {
		// stop other audios playing
		document.body.addEventListener('play', event => {
			if (this.validateEvent(event)) this.allControls.forEach((media, index) => {
				if (media !== event.target) {
					 media.pause()
				} else {
					localStorage.setItem(`lastPlayed_${location.hash}`, index)
					// only at receiver, otherwise the toolbar will be above the fold
					if (!this.isSender) this.scrollToEl(media)
					this.loadCurrentTime(media) // do this because ios does not swollow currentTime set at loadedmetadata
				}
				this.setVolumeAll()
			})
    }, true)
    // loop all audio + video
		document.body.addEventListener('ended', event => {
			if (this.validateEvent(event)) {
				const media = this.allReadyControls //Array.from(document.querySelectorAll('audio')).concat(Array.from(document.querySelectorAll('video')))
				let index = -1
				if ((index = media.indexOf(event.target)) !== -1) media[index + 1 >= media.length ? 0 : index + 1].play()
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
				if (event.keyCode === 32 || event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 38 || event.keyCode === 40) {
					event.preventDefault()
					// volume change
					if (event.keyCode === 38 || event.keyCode === 40) {
						this.setVolumeAll((Number(localStorage.getItem('lastVolume') || 1) + (event.keyCode === 38 ? 0.1 : -0.1)).toFixed(4))
						// prev, next, pause, play
					} else {
						const media = this.allControls
						const index = Number(localStorage.getItem(`lastPlayed_${location.hash}`)) || 0
						let allWerePaused = true
						// pause all
						media.forEach(el => {
							if (!el.paused) {
								el.pause()
								allWerePaused = false
							}
						})
						// spacebar
						if (event.keyCode === 32) {
							const lastPlayed = media[index]
							// if all were already paused play last or first song/video
							if (lastPlayed && allWerePaused) lastPlayed.play()
						// left
						} else if (event.keyCode === 37) {
							const prevToPlay = media[index - 1 < 0 ? media.length - 1 : index - 1]
							// if all were already paused play last or first song/video
							if (prevToPlay) prevToPlay.play()
						// right
						} else if (event.keyCode === 39) {
							const nextToPlay = media[index + 1 >= media.length ? 0 : index + 1]
							// if all were already paused play last or first song/video
							if (nextToPlay) nextToPlay.play()
						}
					}
				}
			}, true)
		}
  }

  renderCSS () {
    return `
      <style>
        ${this.id} {
          background-color: pink;
        }
      </style>
    `
  }

  renderHTML () {
    const section = document.createElement('section')
    section.innerHTML = `
      ${this.renderCSS()}
      <span>
        Player
      </span>
    `
    this.html.replaceWith(section)
  }

  validateEvent (event) {
    return event.target && event.target.controls
  }

  setVolumeAll (volume = Number(localStorage.getItem('lastVolume') || 1)) {
    volume = volume > 1 ? 1 : volume < 0 ? 0 : volume
    this.allControls.forEach(media => media.volume = volume)
    localStorage.setItem('lastVolume', volume)
  }

  scrollToEl (el) {
    const rect = el.getBoundingClientRect()
    // check if the element is outside the viewport, otherwise don't scroll
    if (rect && (rect.top < 0 || rect.left < 0 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight) || rect.right > (window.innerWidth || document.documentElement.clientWidth))) {
      setTimeout(() => el.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'}), 500)
    }
  }

  saveCurrentTime (media) {
    // don't save a tollerance of 10sec
    const currentTime = media.currentTime && media.currentTime > 10 && media.currentTime < media.duration - 10 ? media.currentTime : 0
    if (currentTime) {
      localStorage.setItem(`currentTime_${media.id}`, currentTime)
    } else if (localStorage.getItem(`currentTime_${media.id}`) !== null) {
      localStorage.removeItem(`currentTime_${media.id}`)
    }
  }

  loadCurrentTime (media, removeItem = true) {
    const currentTime = Number(localStorage.getItem(`currentTime_${media.id}`)) || 0
    if (currentTime && currentTime !== media.currentTime) {
      media.currentTime = currentTime
      if (removeItem) localStorage.removeItem(`currentTime_${media.id}`) // only to be set once, then can be deleted
    }
  }

  get allControls () {
    return Array.from(document.querySelectorAll('[controls]'))
  }

  get allReadyControls () {
    return this.allControls.filter(media => media.readyState >= 1) // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
  }
}
