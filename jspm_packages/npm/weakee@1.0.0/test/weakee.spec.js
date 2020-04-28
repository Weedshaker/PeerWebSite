/* */ 
import Emitter from '../weakee'
import {expect} from 'chai'

describe('weakee', function() {
  var entity
  beforeEach(()=>{
    class UserClass extends Emitter {
      constructor() {
        super()
      }
    }
    entity = new UserClass();
  })
  it('should allow to emit events', function() {
    entity.emit('test')
    entity.emit('test2')
  })

  it('should call listeners when events are emitted, with the arguments as emitted', function(done){
    entity.on('test', (arg1, arg2)=>{
      expect(arg1).to.equal('a')
      expect(arg2).to.equal(null)
      done()
    })

    setTimeout(function(){
    	entity.emit('test', 'a', null)
    }, 10);
  })

  it('should be able to unregister a listener', function(done){
    function listener() {
      throw new Error('listener must not get called')
    }
    entity.on('test', listener)
    entity.off('test', listener)

    setTimeout(function(){
      entity.emit('test', 'a', null)
      done()
    }, 10)
  })

  it('should register after one event has been fired when using "once"', function(done){
    entity.once('test', (arg1, arg2)=>{
      expect(arg1).to.equal('a')
      expect(arg2).to.equal(null)
    })

    setTimeout(function(){
      entity.emit('test', 'a', null)
      entity.emit('test', 'not gonna trigger that listener')
      done()
    }, 10)
  })
})