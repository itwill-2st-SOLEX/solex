function initEditor(selector, content = '') {
  // 기존 인스턴스 제거 (모달 재열기 시 중복 방지)
  if (window.editorInstance) {
    window.editorInstance.destroy();  // 기존 인스턴스 정리
    window.editorInstance = null;
  }

  const el = document.querySelector(selector);
  if (!el) {
    console.error('Editor element not found:', selector);
    return;
  }

  window.editorInstance = new toastui.Editor({
    el,
    height: '500px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    initialValue: content,
    toolbarItems: [
      ['heading', 'bold', 'italic'],
      ['ul', 'ol']
    ],
    hideModeSwitch: true,
    hooks: {
      addImageBlobHook: () => {
        alert('이미지는 업로드할 수 없습니다.');
        return false;
      }
    }
  });
}

// 전역 등록
window.initEditor = initEditor;