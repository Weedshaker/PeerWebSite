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
        imageShapes: {
          tooltip: 'Image Shapes',
          tooltipShapeOptions: ['Responsive', 'Rounded', 'Circle', 'Thumbnail', 'None']
        }
      },
    });
    $.extend($.summernote.options, {
      imageShapes: {
        icon: '<i class="note-icon-picture"/>',
        /* Must keep the same order as in lang.imageAttributes.tooltipShapeOptions */
        shapes: ['img-responsive', 'img-rounded', 'img-circle', 'img-thumbnail', '']
      }
    });
    $.extend($.summernote.plugins, {
      'imageShapes': function(context) {
        var ui        = $.summernote.ui,
            $editable = context.layoutInfo.editable,
            options   = context.options,
            lang      = options.langInfo;
        context.memo('button.imageShapes', function() {
          var button = ui.buttonGroup([
            ui.button({
              className: 'dropdown-toggle',
              contents: options.imageShapes.icon + '&nbsp;&nbsp;<span class="caret"></span>',
              tooltip: lang.imageShapes.tooltip,
              data: {
                toggle: 'dropdown'
              }
            }),
            ui.dropdown({
              className: 'dropdown-shape',
              items: lang.imageShapes.tooltipShapeOptions,
              click: function (e) {
                e.preventDefault();
                var $button = $(e.target);
                var $img    = $($editable.data('target'));
                var index   = $.inArray(
                  $button.data('value'),
                  lang.imageShapes.tooltipShapeOptions
                );
                $.each(options.imageShapes.shapes, function (index,value) {
                  $img.removeClass(value);
                });
                $img.addClass(options.imageShapes.shapes[index]);
                context.invoke('editor.afterCommand');
              }
            })
          ]);
          return button.render();
        });
      }
    });
  }));