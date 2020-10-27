//https://github.com/summernote/summernote/issues/546
// summernote bug to multiply prev paragraph content (in this scenario webtorrent containers got doublicated)
(function (factory) {
    if (typeof define === 'function' && define.amd) {
      define(['jquery'],factory)
    } else if (typeof module === 'object' && module.exports) {
      module.exports = factory(require('jquery'));
    } else {
      factory(window.jQuery)
    }
  }
  (function ($) {
    // Summernote Plugin: Soft breaks only
    // ------------------------------------------------------------------------------------------------------------------ //

    // Allow Summernote to not auto-generate tags, otherwise it will copy webtorrent containers, figure, span etc.
    $.summernote.dom.emptyPara = '<p><br></p>';

    // Initiate plugin
    $.extend($.summernote.plugins, {
      'brenter': function (context) {
          var self = this,
            $editor = context.layoutInfo.editor;
            
            this.events = {
              'summernote.enter': function (we, e) {
                // the default already adds emptyPara see above, but it must be triggered here
                context.invoke('editor.pasteHTML', '\n'); // triggers an error and avoids clonging content of last el
            }
          };
        }
    });
  }));