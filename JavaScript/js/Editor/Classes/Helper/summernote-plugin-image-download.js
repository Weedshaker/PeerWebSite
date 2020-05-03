/* https://github.com/DiemenDesign/summernote-image-shapes */
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
    $.extend(true,$.summernote.lang, {
      'en-US': {
        imageDownload: {
          tooltip: 'Image Download'
        }
      },
    });
    $.extend($.summernote.options, {
      imageDownload: {
        icon: '<i class="note-icon-arrow-circle-down"/>',
      }
    });
    $.extend($.summernote.plugins, {
      'imageDownload': function(context) {
        var ui        = $.summernote.ui,
            $editable = context.layoutInfo.editable,
            options   = context.options,
            lang      = options.langInfo;
        context.memo('button.imageDownload', function() {
          var button = ui.buttonGroup([
            ui.button({
              contents: options.imageDownload.icon,
              tooltip: lang.imageDownload.tooltip,
              click: function (e) {
                e.preventDefault();
                const parent = $($editable.data('target')).parent()[0];
                if (typeof parent.sst_download === 'function') parent.sst_download();
              }
            })
          ]);
          return button.render();
        });
      }
    });
  }));