# summernote-ext-filedialog
Based on summernote's ImageDialog

## Setup
 * Include summernote project script
 * Include [Font Awesome](http://fontawesome.io/)
 * Include the script tag below in your document
```HTML
<script src="http://example.com/summernote-ext-filedialog.js"></script>
```

## Usage
```javascript
$('.summernote').summernote({
    toolbar:[
        ['insert', ['file']],
    ],
    callbacks: {
		onFileUpload: function(files, text) {
			var data = new FormData();
			var that = this;
			
			// Uploading just the first selected file for now
			// @todo Multiple file upload example
			data.append("file", files[0]);

			$.ajax ({
				data: data,
				type: 'post',
				url: 'https://path.to/your/upload/process',
				cache: false,
				contentType: false,
				processData: false,
				success: function(response) {
				    /**
					 * In this example the file uploader returned the filename
					 * and relative path to the file.
					 */
					$(that).summernote('createLink', {
						text: text || response.filename,
						url: response.url,
						newWindow: true
					});
				}
			});
		}
	}
});
```

## License
summernote-ext-filedialog may be freely distributed under the MIT license.