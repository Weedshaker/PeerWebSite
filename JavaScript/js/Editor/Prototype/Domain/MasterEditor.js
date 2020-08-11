/*jshint esnext: true */

export class MasterEditor {
	constructor(){
	}
	addEmojis(){
		$.ajax({
			url: 'https://api.github.com/emojis',
			crossDomain: true,
			dataType: 'json'
		}).then(function(data) {
			window.emojis = Object.keys(data);
			window.emojiUrls = data; 
		});
	}
	loadFile(files, text, container = this.container){
		$.each(files, (i, file) => {
			let name = file.name;
			if(text){
				name = files.length > 1 ? `${text}_${i}` : text;
			}
			let Reader  = new FileReader();
			Reader.addEventListener('load', () => {
				const type = file.type.includes('image') ? ['img', 'src'] : file.type.includes('video') ? ['video', 'src'] : ['a', 'href']
				let node = document.createElement(type[0]);
				node.id = this.Helper.getRandomString(); // give each node an id, so that virtual-dom doesn't mix up things
				if (type[0] === 'video') {
					node.controls = true;
					const source = document.createElement('source');
					source[type[1]] = Reader.result;
					source.type = file.type;
					node.appendChild(source);
				} else {
					node[type[1]] = Reader.result;
					node.text = name;
				}
				node.setAttribute('download', name);
				node.setAttribute('data-filename', name);
				if(i > 0){
					this.setData(container, ', ');
				}
				this.setData(container, node, 'insertNode');
			}, false);
			Reader.readAsDataURL(file);
		});
	}
}