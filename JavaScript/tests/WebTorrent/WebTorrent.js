// TESTS // http://jasmine.github.io/edge/introduction.html
// NOTE: bind/call/apply functions cannot be spied on
// http://tobyho.com/2011/12/15/jasmine-spy-cheatsheet/
jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
const connectText = 'helloWorld';
const id1 = 'webtor1';
const id2 = 'webtor2';
const addToTimeouts = 500;
// fdescribe and fit makes the describtions and it's to call after each other
fdescribe("MasterWebTorrent", function() {
	beforeAll(function () {
		App.Editor.setData($('#sender'), connectText);
		// spies (don't seems to work with bind and apply)
		spyOn(console, 'log').and.callThrough();
	});
	fit("=> approve initial message", function (done) {
		setTimeout(function () {
			expect(console.log.calls.count()).toBeGreaterThan(0);
			expect($('#receiver').text()).toBe(connectText);
			done();
		}, App.Editor.changeDelay + addToTimeouts);
	});
	fdescribe("create a span for webtorrent", function() {
		beforeAll(function() {
			const node = document.createElement('span');
			node.id = id1;
			App.Editor.setData($('#sender'), node, 'insertNode');
		});
		fit("=> Received created span", function(done) {
			setTimeout(function() {
				expect($('#receiver').html()).toMatch(`.*${id1}.*`);
				done();
			}, App.Editor.changeDelay * 2 + addToTimeouts);
		});
		fdescribe("create a webtorrent", function () {
			beforeAll(function () {
				// Editor
				spyOn(App.Editor.WebTorrent.api, 'seed').and.callThrough();
				spyOn(App.Editor.WebTorrent, 'setNodes').and.callThrough();
				spyOn(App.Editor.WebTorrent, 'appended').and.callThrough();
				// HTML
				spyOn(App.HTML.WebTorrent.api, 'addByText').and.callThrough();
				spyOn(App.HTML.WebTorrent.OptionRegex, 'init').and.callThrough();
				spyOn(App.HTML.WebTorrent, 'add').and.callThrough();
				spyOn(App.HTML.WebTorrent.ProgressBar, 'start').and.callThrough();
				spyOn(App.HTML.WebTorrent, 'setNodes').and.callThrough();
				spyOn(App.HTML.WebTorrent, 'appended').and.callThrough();
				spyOn(App.HTML.WebTorrent.ProgressBar, 'end').and.callThrough();
				App.Editor.WebTorrent.api.seed(new File(['add ', 'file ', 'to ', 'webtorrent!'], `${id1}.txt`, { type: 'plain/text', endings: 'native' }), undefined, $(`#${id1}`)[0], undefined, undefined, undefined, (torrent) => {
					App.Editor.changeEvent(App.Editor.getData(), App.Editor.container[0].id);
				});
			});
			fit("=> Editors WebTorrent added file", function (done) {
				setTimeout(function () {
					expect(App.Editor.WebTorrent.api.seed.calls.count()).toEqual(1);
					expect(App.Editor.WebTorrent.setNodes.calls.count()).toEqual(1);
					expect(App.Editor.WebTorrent.appended.calls.count()).toEqual(1);
					expect(App.Editor.WebTorrent.client.torrents.length).toEqual(1);
					done();
				}, App.Editor.changeDelay + addToTimeouts);
			});
			fit("=> HTMLs WebTorrent added file", function (done) {
				setTimeout(function () {
					expect(App.HTML.WebTorrent.api.addByText.calls.count()).toEqual(2); // there is a workaround TODO at MasterHTML:36
					expect(App.HTML.WebTorrent.OptionRegex.init.calls.count()).toEqual(2); // there is a workaround TODO at MasterHTML:36
					expect(App.HTML.WebTorrent.add.calls.count()).toEqual(1);
					expect(App.HTML.WebTorrent.ProgressBar.start.calls.count()).toEqual(1);
					expect(App.HTML.WebTorrent.setNodes.calls.count()).toEqual(3); // at add & findAllNodes & progressbar
					expect(App.HTML.WebTorrent.appended.calls.count()).toEqual(1);
					expect(App.HTML.WebTorrent.ProgressBar.end.calls.count()).toEqual(1);
					expect(App.HTML.WebTorrent.client.torrents.length).toEqual(1);
					done();
				}, App.Editor.changeDelay * 2 + addToTimeouts);
			});
			fdescribe("delete all content", function () {
				beforeAll(function () {
					spyOn(App.Editor.WebTorrent, 'remove').and.callThrough();
					spyOn(App.HTML.WebTorrent, 'remove').and.callThrough();
					App.Editor.setData($('#sender'), '', 'reset');
				});
				fit("=> Nodes got deleted", function (done) {
					setTimeout(function () {
						expect(App.Editor.WebTorrent.remove.calls.count()).toEqual(1);
						expect(App.Editor.WebTorrent.client.torrents.length).toEqual(0);
						expect(App.HTML.WebTorrent.remove.calls.count()).toEqual(1);
						expect(App.HTML.WebTorrent.client.torrents.length).toEqual(0);
						done();
					}, App.Editor.changeDelay * 2 + addToTimeouts);
				});
				fdescribe("add torrent twice", function () {
					beforeAll(function (done) {
						let node = document.createElement('span');
						node.id = id1;
						App.Editor.setData($('#sender'), node, 'insertNode');
						node = document.createElement('span');
						node.id = id2;
						App.Editor.setData($('#sender'), node, 'insertNode');
						const file = new File(['add ', 'file ', 'to ', 'webtorrent!'], `${id1}.txt`, { type: 'plain/text', endings: 'native' });
						setTimeout(function () {
							App.Editor.WebTorrent.api.seed(file, undefined, $(`#${id1}`)[0], undefined, undefined, undefined, (torrent) => {
								App.Editor.changeEvent(App.Editor.getData(), App.Editor.container[0].id);
							});
							App.Editor.WebTorrent.api.seed(file, undefined, $(`#${id2}`)[0], undefined, undefined, undefined, (torrent) => {
								App.Editor.changeEvent(App.Editor.getData(), App.Editor.container[0].id);
							});
							done();
						}, App.Editor.changeDelay + addToTimeouts);
					});
					fit("=> Editors WebTorrent added both files", function (done) {
						setTimeout(function () {
							expect(App.Editor.WebTorrent.client.torrents[0].sst_nodes.length).toEqual(2);
							done();
						}, App.Editor.changeDelay * 2 + addToTimeouts);
					});
					fit("=> HTMLs WebTorrent added both files", function (done) {
						setTimeout(function () {
							expect(App.HTML.WebTorrent.client.torrents[0].sst_nodes.length).toEqual(2);
							done();
						}, App.Editor.changeDelay * 3 + addToTimeouts);
					});
				});
			});
		});
	});
});