/*jshint esnext: true */

export class MasterEditor {
	constructor(){
	}
	addEmojis(){
		$.ajax({
			url: 'https://api.github.com/emojis'
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
				let node = document.createElement('a');
				node.href = Reader.result;
				node.text = name;
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