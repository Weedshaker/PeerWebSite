// TESTS // http://jasmine.github.io/edge/introduction.html
jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
const connectText = 'helloWorld';
const sendReceiveText = '. How are you?';
const sendReceiveText2 = ' Pretty fucking good bro!';
const addToTimeouts = 1000;
// fdescribe and fit makes the describtions and it's to call after each other
fdescribe("Connect WebRTC", () => {
	// used for async
	let foundArgs = [];
	beforeAll((done) => {
		// Note: spies (don't seems to work with bind and apply)
		spyOn(console, 'info').and.callThrough();
		spyOn(WebRTC.Receiver, '_receive').and.callThrough();
		spyOn(WebRTC.Sender.OptionSender.Diff_match_patchWorker, 'run').and.callThrough();
		// action
		App.Editor.setData($('#sender'), connectText);
		$('#txt-roomid').val('karmaTest1234567891');
		$('#open-or-join-room').click();
		// wait until connected
		let interval = setInterval(() => {
			if (foundArgs = console.info.calls.allArgs().find((el) => el.indexOf('Data connection has been opened between you & ') !== -1)) {
				clearInterval(interval);
				// wait until text has been sent
				setTimeout(() => {
					done();
				}, WebRTC.ConnectionEvent.openOrJoinEventDelay + WebRTC.ConnectionEvent.newParticipantDelay + WebRTC.Sender.changeDelay + addToTimeouts);
			}
		}, 100);
	});
	fit("=> connect socket.io", () => {
		expect(console.info).toHaveBeenCalledWith(...foundArgs);
	});
	fit("=> receive initial message", () => {
		expect(WebRTC.Receiver._receive.calls.count()).toEqual(1);
		expect(WebRTC.Sender.OptionSender.Diff_match_patchWorker.run.calls.count()).toEqual(0);
	});
	fit("=> approve initial message", () => {
		expect($('#receiver').text()).toBe(connectText);
	});
	fdescribe("send second message with diff", () => {
		beforeAll((done) => {
			// spies (don't seems to work with bind and apply)
			spyOn(WebRTC.Sender, '_send').and.callThrough();
			spyOn(WebRTC.Sender.OptionSender, 'init').and.callThrough();

					// action
					App.Editor.setData($('#sender'), sendReceiveText);
					// wait until text has been sent
					setTimeout(() => {
						done();
					}, WebRTC.Sender.changeDelay * 2 + addToTimeouts);

		});
		fit("=> send/receive message", () => {
			//expect(WebRTC._send).toHaveBeenCalled();
			expect(WebRTC.Sender._send.calls.count()).toEqual(1);
			expect(WebRTC.Sender.OptionSender.init.calls.count()).toEqual(1);
			// the initiator sends onNewParticipant directly to remoteUserId and later toAll, which will not diff match
			if(WebRTC.connection.isInitiator){
				expect(WebRTC.Sender.OptionSender.Diff_match_patchWorker.run.calls.count()).toEqual(0);
			}else{
				expect(WebRTC.Sender.OptionSender.Diff_match_patchWorker.run.calls.count()).toEqual(1);
			}
			expect(WebRTC.Receiver._receive.calls.count()).toEqual(2);
		});
		fit("=> approve message", function() {
			expect($('#receiver').text()).toBe(connectText + sendReceiveText);
		});
		fit("=> approve SentMessage", function() {
			expect($('#receiver').html()).toBe(WebRTC.SentMessage.get('sender'));
		});
		fdescribe("send request for whole message", function() {
			let sendReceiveCount = 3 + 1; // 1: diff text, 2: request whole text, 3: whole text + previous test
			beforeAll(function() {
				// spies (doesn't seems to work with bind and apply)
				//spyOn(WebRTC.Sender.OptionSender.Diff_match_patchWorker, 'run').and.callThrough();
				spyOn(WebRTC.Requestor, 'sendRequest').and.callThrough();
				spyOn(WebRTC.Requestor, 'receiveRequest').and.callThrough();
				spyOn(WebRTC.Requestor, 'fullFilledRequest').and.callThrough();
			});
			fit("=> send/receive message", function(done) {
				// delete received message to corrupt diff function
				for(key in WebRTC.Receiver.ReceivedMessage.cont){
					if(WebRTC.Receiver.ReceivedMessage.cont[key]['sender']){
						WebRTC.Receiver.ReceivedMessage.cont[key]['sender'] = '';
					}
				}
				App.Editor.setData($('#sender'), sendReceiveText2);
				setTimeout(function() {
					//expect(WebRTC._send).toHaveBeenCalled();
					expect(WebRTC.Sender._send.calls.count()).toEqual(sendReceiveCount);
					expect(WebRTC.Sender.OptionSender.init.calls.count()).toEqual(sendReceiveCount); // diffMessage, resendRequest, fullMessage
					if (WebRTC.connection.isInitiator) {
						expect(WebRTC.Sender.OptionSender.Diff_match_patchWorker.run.calls.count()).toEqual(1);
					} else {
						expect(WebRTC.Sender.OptionSender.Diff_match_patchWorker.run.calls.count()).toEqual(2);
					}
					expect(WebRTC.Receiver._receive.calls.count()).toEqual(sendReceiveCount);
					expect(WebRTC.Requestor.sendRequest.calls.count()).toEqual(1);
					expect(WebRTC.Requestor.receiveRequest.calls.count()).toEqual(1);
					expect(WebRTC.Requestor.fullFilledRequest.calls.count()).toEqual(1);
					done();
				}, WebRTC.Sender.changeDelay * sendReceiveCount + addToTimeouts);
			});
			fit("=> approve message", function(done) {
				setTimeout(() => {
					// wait to finish
					expect($('#receiver').text()).toBe(connectText + sendReceiveText + sendReceiveText2);
					done();
				}, 1000 + addToTimeouts);
			});
		});
	});
});