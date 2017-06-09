import shareworksDiagram from '../dist/main.js';
var myDiagram = shareworksDiagram.createDiagram({
	diagram: "myDiagramDiv",
	palette: {
		id: "myPaletteDiv",
		lineStyle: {
			color: '#F2F0FA',
			size: 2,
			portColor: '#f7dede'
		},
		start: {
			backgroundColor: '#FFFFFF',
			title: {
				font: 'bold 14px Source Han Sans CN',
				color: '#222127',
				underLineColor: '#F2F0FA'
			},
			node: {
				boldSize: 3,
				boldColor: '#F2F0FA'
			},
			content: {
				color: '#9692AE',
				margin: 5,
				font: '13px Source Han Sans CN'
			},
			label: '开始'
		},
		node: {
			backgroundColor: '#FFFFFF',
			title: {
				font: 'bold 14px Source Han Sans CN',
				color: '#222127',
				underLineColor: '#F2F0FA'
			},
			node: {
				boldSize: 3,
				boldColor: '#F2F0FA'
			},
			content: {
				color: '#9692AE',
				margin: 5,
				font: '13px Source Han Sans CN'
			},
			label: '流程节点'
		},
		end: {
			backgroundColor: '#FFFFFF',
			title: {
				font: 'bold 14px Source Han Sans CN',
				color: '#222127',
				underLineColor: '#F2F0FA'
			},
			node: {
				boldSize: 3,
				boldColor: '#F2F0FA'
			},
			content: {
				color: '#9692AE',
				margin: 5,
				font: '13px Source Han Sans CN'
			},
			label: '结束'
		}
	},
	initNodeData: {
		approveType: 0,
		approver: 0,
		condition: {},
		msgTemplateId: []
	},
	showEditNode: function(node, data) {
		var category = node.data.category;
		alert(category);
		data.approver = Math.random();
		myDiagram.saveNodeData(node, data);
	},
	displayNode: function(data) {
		var displayInfo = [];
		displayInfo.push("审批类型:" + data.approveType);
		displayInfo.push("审批人:" + data.approver);
		displayInfo.push("条件:");
		displayInfo.push("消息模板:");
		return {
			label: "新增节点",
			text: displayInfo
		};
	}
});

var initData = {
	nodeDataArray: [
		{
			"category": "start",
			"label": "发起1", 
			"key": 1, 
			"loc": "-114.734375 -310",
			"info": ["dasdsa", "12312321"],
			"customData": {
				approveType: 1,
				approver: 2,
				condition: {},
				msgTemplateId: [1, 2]
			} 
		},
		{
			"category": "node",
			"label": "发起2", 
			"key": 10, 
			"loc":"-227.734375 -153",
			"info": ["dasd1231sa", "213122222"],
			"customData": {
				approveType: 2,
				approver: 3,
				condition: {},
				msgTemplateId: [3, 5]
			} 
		}
	],
	linkDataArray: [
		{
			"from": 1,
			"to": 10
		}
	]
};

myDiagram.renderDiagram(initData);

document.getElementById("btnSave").onclick = function() {
	console.log(myDiagram.getDiagramData());
};