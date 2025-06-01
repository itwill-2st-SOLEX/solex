const editor = new toastui.Editor({
    el: document.querySelector('#editor'),
    height: '500px',
    initialEditType: 'WYSIWYG',
    previewStyle: 'vertical',
    toolbarItems: [
      ['heading', 'bold', 'italic'],
      ['ul', 'ol']
    ],
	hideModeSwitch: true,                   // 모드 전환 탭 숨김
    hooks: {
      addImageBlobHook: () => {
        alert('이미지는 업로드할 수 없습니다.');
        return false;
      }
    }
  });