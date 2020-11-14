/*jshint esnext: true */

import {MasterEditor} from 'Editor/Prototype/Domain/MasterEditor.js';
import {Helper} from 'Editor/Classes/Helper/Helper.js';
import $ from 'jquery';
import 'bootstrap';
import 'Editor/lib/codemirror/codemirror.js'; // Summernote supported codemirror version not available on github anymore
import 'Editor/lib/codemirror/xml.js';
import 'Editor/lib/codemirror/javascript.js';
import 'Editor/lib/codemirror/css.js';
import 'Editor/lib/codemirror/htmlmixed.js';
import 'Editor/lib/codemirror/formatting.js';
import 'summernote/summernote';
// plugins
import 'Editor/lib/summernote-ext-filedialog.js';
import 'Editor/Classes/Helper/summernote-image-shapes.js';
//import 'Editor/Classes/Helper/summernote-insert-paragraph-bug-fix.js'; // would fix it but triggers summernote error, time to find a new wysiwyg or write our own
//import 'Editor/Classes/Helper/summernote-plugin-image-download.js';

// summernote uses this icons: https://fontawesome.com/icons [jspm_packages/github/summernote/summernote@0.8.16/summernote-bs4.css]

export class EditorSummernote extends MasterEditor {
	constructor(WebTorrent, IPFS){
		super();
		this.WebTorrent = WebTorrent;
		this.IPFS = IPFS;
		this.torrentNodeName = 'figure';

		this.container = null;
		this.summernote = $.summernote;
		this.Helper = new Helper();
		this.changeEvent = () => {console.warn('No ChangeEvent defined!!!');};
		this.changeDelay = 1000;
		this.timeout = true;
		this.timeoutCont = null; // used internal when timeout true
		// add css
		this.css = this.Helper.addBaseURL([`jspm_packages/${System.map['bootstrap']}/css/bootstrap.min.css`, 'JavaScript/js/Editor/lib/codemirror/codemirror.css', 'JavaScript/js/Editor/lib/codemirror/monokai.css', `jspm_packages/${System.map['summernote/summernote']}/summernote.css`]);
		//`` // ide has some issues here to highlight properly without this line
		this.css.forEach((e) => {
			$('<link/>', {
				rel: 'stylesheet',
				type: 'text/css',
				href: e
			}).appendTo('head');
		});
		// options
		this.addEmojis();
		this.opts = {
			toolbar: [
				['insert', ['link', 'codeview'/*, 'picture', 'video'*/]],
				['font', ['style', 'fontsize', 'fontname']],
				['weight', ['color', 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
				['para', ['height', 'ul', 'ol', 'paragraph', 'table']],
				['view', ['undo', 'redo', 'fullscreen', 'help']]
			],
			// catch drag and drop file
			callbacks: {
				// If no WebTorrent remove the onImageUpload callback and let default handle it
				onImageload: (files, text) => {
					if(files.length > 0) this.loadFileInit(files, text);
				},
				onFileUpload: (files, text) => {
					if(files.length > 0) this.loadFileInit(files, text, undefined, false);
				},
				// trash icon
				onMediaDelete: ($target, container) => {
					// remove element in container
					$target.remove();
					const nodeList = document.evaluate(`//${this.torrentNodeName}[@data-blobs[contains(., '${$target[0].src}')]]`, document, null, XPathResult.ANY_TYPE, null);
					let node = nodeList.iterateNext(); // it is supposed to be empty before deleting
					while (node && node.childNodes.length !== 0) {
						node = nodeList.iterateNext();
					}
					if(node){
						if (node.nextSibling && node.nextSibling.innerHTML === '') node.nextSibling.remove(); // remove buffer element added at line 176, this is used for setting focus after torrentNode
						node.remove();
					}
				}
			},
			hint: {
				match: /:([\-+\w]+)$/,
				search: function(keyword, callback){
					callback($.grep(emojis, function(item){
						return item.indexOf(keyword)  === 0;
					}));
				},
				template: function(item){
					var content = emojiUrls[item];
					return '<img src="' + content + '" width="20" /> :' + item + ':';
				},
				content: function(item){
					var url = emojiUrls[item];
					if(url){
						return $('<img />').attr('src', url).css('width', 20)[0];
					}
					return '';
				}
			},
			codemirror: {
				mode: 'htmlmixed',
				htmlMode: true,
				lineNumbers: true,
				theme: 'monokai'
			},
			height: '65vh', /* when adjusting search: height in-code search. to change both values. */
			minHeight: null,
			maxHeight: null,
			focus: false,
			fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48', '64', '82', '150'],
			popover: {
				image: [
				  ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
				  ['float', ['floatLeft', 'floatRight', 'floatNone']],
				  ['custom', ['imageShapes']],
				  ['remove', ['imageDownload', 'removeMedia']]
				]
			}
		};
	}
	add(container = this.container){
		this.container = container;
		container.summernote(this.opts);
		this.addFileDialog(container);
	}
	remove(container = this.container){
		container.summernote('destroy');
	}
	getData(container = this.container){
		// fix possible html errors before getting the data
		this.setData(undefined, container.summernote('code'), 'code');
		return container.summernote('code');
	}
	setData(container = this.container, data = '', type = 'insertText'){
		return container.summernote(type, data, type);
	}
	attachChangeEvent(container = this.container, event){
		this.changeEvent = event;
		container.on('summernote.change', (we, contents, $editable) => {
			if(contents && contents.length > 0){
				clearTimeout(this.timeoutCont);
				this.timeoutCont = setTimeout(() => {
					// unseed webTorrents when node.webTorrent deleted
					if(this.WebTorrent){
						if (this.WebTorrent.api.removeDeletedNodes().length > 0 && !this.WebTorrent.api.areTorrentsLoading()){
							// enable codeview
							$('.btn-codeview').first().removeClass('disabled').removeAttr('disabled', true);
						}
					}
				}, this.changeDelay);
				// !!!Send here the whole content #sender div instead of only the one element!!!
				this.changeEvent(contents, container[0].id);
			}
		});
	}
	addFileDialog(container = this.container){
		// add button
		let ui = this.summernote.ui;
		let button = ui.button({
		contents: '<i class="glyphicon glyphicon-open-file"/>',
		tooltip: 'File',
		click: () => {
				container.summernote('fileDialog.show');
			}
		});
		$('.note-btn-group.btn-group.note-insert').prepend(button.render());
	}
	loadFileInit(files, text, container = this.container, image = true){
		const type = localStorage.getItem('fileType');
		if (type === 'webtorrent'){
			// check for doublicated video, this has a browser bug, which eventuelly looses the blob
			let torrent;
			// TODO: adding videos twice breaks the blob link, this is most likely a bug in browsers
			if (!image && (torrent = this.WebTorrent.api.torrents.get(this.WebTorrent.api.createFilesId(files))) && torrent.sst_containsVideo && !confirm('Adding a video more than once is going to reset the videos of Sender and Receiver. Do you want to continue?')){
				return;
			}
			this.loadFile(files, text, container);
		}else if (type === 'ipfs') {
			super.loadFile(files, text, container, false).then(results => {
				const addSpacerAfter = results && results[0] && results[0].type &&results[0].type[0] !== 'a';
				results.forEach(result => {
					const outerNode = (result.audioVideo || result.source);
					outerNode.classList.add('ipfsLoading');
					// https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#returns
					this.IPFS.add(result.name, result.content).then(file => {
						// sw do not intercept videos for streaming but give mimetype down
						file.link += `?filename=${result.name}${result.audioVideo ? '&audioVideo=true' : ''}`;
						outerNode.classList.remove('ipfsLoading');
						// static error handling which also works at receiver
						if (result.type[0] === 'a') {
							outerNode.setAttribute('download', result.name);
							outerNode.setAttribute('onclick', `${this.IPFS.ipfs_onerror}(event, '${this.sanitizForInlineError(file.link)}', '${this.sanitizForInlineError(result.name)}', '${result.type}', ${!!result.audioVideo}, this);`);
						} else {
							result.source.setAttribute('onerror', `${this.IPFS.ipfs_onerror}(null, '${this.sanitizForInlineError(file.link)}', '${this.sanitizForInlineError(result.name)}', '${result.type}', ${!!result.audioVideo}, this);`);
						}
						result.source[result.type[1]] = file.link;
						// video wouldn't play on seeder if not newly set
						if (result.audioVideo) {
							result.audioVideo.innerHTML = result.audioVideo.innerHTML;
							result.audioVideo.classList.remove('ipfsLoading');
							// add a description
							if (result.name && outerNode.parentNode) {
								const figure = document.createElement('figure');
								const placeholder = document.createElement('span');
								figure.appendChild(placeholder);
								const figcaption = document.createElement('figcaption');
								figcaption.textContent = result.name;
								figure.appendChild(figcaption);
								outerNode.replaceWith(figure);
								placeholder.replaceWith(outerNode);
							}
						}
						this.changeEvent(this.getData(), container[0].id);
					}).catch(error => {
						const errorMessageEl = document.createElement('span');
						errorMessageEl.textContent = `IPFS failed: ${error}`;
						outerNode.replaceWith(errorMessageEl);
						this.changeEvent(this.getData(), container[0].id);
					});
				});
				if (addSpacerAfter) this.setData(container, document.createElement('p'), 'insertNode'); // trying to get cursor focus after node
			});
		}else{
			super.loadFile(files, text, container);
		}
	}
	loadFile(files, text, container = this.container){
		// append file
		let node = document.createElement(this.torrentNodeName);
		//node.id = this.Helper.getRandomString(); // give each node an id, so that virtual-dom doesn't mix up things
		// disable codeview until file is loaded, otherwise it doesn't get added when in codeview
		$('.btn-codeview').first().addClass('disabled').attr('disabled', true);
		// console.log(App.Editor.areTorrentsLoading()); console.log(App.Editor.WebTorrent.torrents);  console.log(App.Editor.WebTorrent.client.torrents); console.log(App.Editor.WebTorrent.nodes);
		this.WebTorrent.api.seed(files, text, node, undefined, undefined, undefined, (torrent) => {
				// enable codeview
				if(!this.WebTorrent.api.areTorrentsLoading()){
					$('.btn-codeview').first().removeClass('disabled').removeAttr('disabled', true);
				}
				this.changeEvent(this.getData(), container[0].id);
				torrent.on('error', error => {
					node.textContent = `WebTorrent failed: ${error}`;
					this.changeEvent(this.getData(), container[0].id);
				});
			}
		);
		const p = document.createElement('p');
		this.setData(container, p, 'insertNode'); // trying to get cursor focus after node
		p.replaceWith(node);
	}
	sanitizForInlineError(str) {
		return str.replace(/[\'\"]/g, '');
	}
}