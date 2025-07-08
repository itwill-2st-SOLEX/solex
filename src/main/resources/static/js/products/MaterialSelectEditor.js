class MaterialSelectEditor {
    constructor(props) {
        const el = document.createElement('input');
        el.type = 'text';
        this.el = el;

		console.log('class 파일안의 자재 목' + materialList);
        // 원자재 목록을 셋업
//        const options = (window.materialList || []).map(mat => ({
//            value: mat.value,
//            text: mat.text
//        }));

		const options = Array.isArray(window.materialList)
		  ? window.materialList.map(mat => ({
		      value: mat.value,
		      text: mat.text
		    }))
		  : [];


        setTimeout(() => {
            this.select = new TomSelect(this.el, {
                options,
                create: false,
                maxItems: 1,
                valueField: 'value',
                labelField: 'text',
                searchField: 'text',
                placeholder: '원자재 검색...',
                onInitialize: () => {
                    this.select.setValue(props.value); // 기존 값 설정
                }
            });
        });
    }

    getElement() {
        return this.el;
    }

    getValue() {
        return this.select?.getValue();
    }

    mounted() {
        this.el.focus();
    }

    destroy() {
        this.select?.destroy();
    }
}

window.MaterialSelectEditor = MaterialSelectEditor;