document.addEventListener('DOMContentLoaded', function() {
	console.log('1');
	window.prod_grid = new tui.Grid({
	  el: document.getElementById('prod-grid'),
	  bodyHeight: 600,
	  rowHeaders: ['checkbox'],
	  scrollY: true,
	  pageOptions: {
	    useClient: false,
	    type: 'page',
	    perPage: 20
	  },
	  columns: [
  	    { header: 'BOM번호', name: 'PRD_YN', align : 'center' },
  	    { header: '제품', name: 'PRD_PRICE', align : 'center', sortable: true },
  	    { header: '원자재', name: 'PRD_UNIT', align : 'center', sortable: true },
  	    { header: '소모량', name: 'PRD_COMM', sortable: true, align : 'center' },
  	  ]
	});

/*
	fetch('/SOLEX/products/api/productList')
	  .then(res => res.json())
	  .then(data => {
	    window.prod_grid.resetData(data.products);
	  })
	  .catch(err => console.error(err));
*/	
fetch('/SOLEX/products/api/productList')
  .then(res => res.json())
  .then(res => {
    console.log('데이터 도착:', res);
    window.prod_grid.resetData(res.products);
  })
  .catch(err => console.error('fetch 에러:', err));

//const result = window.prod_grid.readData();
//console.log('readData 반환값:', result);

	

});