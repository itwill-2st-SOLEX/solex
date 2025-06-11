document.addEventListener("DOMContentLoaded", function () {
	fetch("/SOLEX/employee/org/chart")
	  .then(res => {
	    if (!res.ok) throw new Error("Failed to fetch org chart");
	    return res.json();
	  })
	  .then(data => {
	    new Treant({
	      chart: {
	        container: "#orgCard",
	        node: { HTMLclass: "node-style" },
	        connectors: { type: "step" },
	        nodeAlign: "BOTTOM"
	      },
	      nodeStructure: data
	    });
	  })
	  .catch(err => console.error("OrgChart fetch error:", err));
});