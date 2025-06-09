document.addEventListener('DOMContentLoaded', () => {
	
	google.charts.load('current', {packages:["orgchart"]});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Name');
		data.addColumn('string', 'Manager');
		data.addColumn('string', 'ToolTip');

		data.addRows([
		[{'v':'Mike', 'f':'Mike<div style="color:red; font-style:italic">President</div>'},
		'', 'The President'],
		[{'v':'Jim', 'f':'Jim<div style="color:red; font-style:italic">Vice President</div>'},
		'Mike', 'VP'],
		['Alice', 'Mike', ''],
		['Bob', 'Jim', 'Bob Sponge'],
		['Carol', 'Bob', '']
		]);

		var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
		// Draw the chart, setting the allowHtml option to true for the tooltips.
		chart.draw(data, {'allowHtml':true});
	}
	
});