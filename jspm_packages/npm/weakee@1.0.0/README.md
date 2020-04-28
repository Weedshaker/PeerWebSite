# weakee
Weakmaps powered lightweight event emitter(this one should not leak)
Written in ES6.
Tests have a babel hook, but in order to use this in your node.js app, you will have to use babel register hook.
On the frontend, JSPM handles it for you.
## Install
```shell
npm i weakee -S
#or on the frontend
jspm i npm:weakee
```

### Usage
```javascript
import Emitter from 'weakee'
class UserClass extends Emitter {
  constructor() {
	super()
  }
}

var inst = new UserClass()

inst.emit('myEvent', whatever, params)
inst.on('myEvent', (whatever, params)=>{
  //runs until you call .off()
})
inst.once('myEvent', (whatever, params)=>{
  //runs once
})
inst.off('myEvent', handlerFunction)	//removes the even handler
```
