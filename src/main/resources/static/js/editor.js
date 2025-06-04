
  window.editorInstance = null;

  window.initEditor = function(targetSelector, content = '') {
    if (window.editorInstance) {
      window.editorInstance.destroy();
      window.editorInstance = null;
    }

    window.editorInstance = new toastui.Editor({
      el: document.querySelector(targetSelector),
      height: '100%',
      initialEditType: 'wysiwyg',
      previewStyle: 'vertical',
      initialValue: content,
      hideModeSwitch: true,
      toolbarItems: [
        ['heading', 'bold', 'italic'],
        ['ul', 'ol']
      ],
      hooks: {
        addImageBlobHook: () => {
          alert('이미지는 업로드할 수 없습니다.');
          return false;
        }
      }
    });

    return window.editorInstance;
  };
  
  
  let editorLoaded = false;
  export function loadEditorScript(callback) {
      if (editorLoaded) return callback();

      const script = document.createElement('script');
      script.src = '/SOLEX/js/editor.js';
      script.onload = () => {
          editorLoaded = true;
          callback();
      };

      document.body.appendChild(script);
  }