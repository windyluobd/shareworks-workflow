import gojs from 'gojs';
function shareworksWorkFlow(options) {
	if (typeof(options) != "object") {
		return null;
	}
	//init diagram id
	var diagramId = options.diagram;
	//init palette info
	var paletteInfo = options.palette;
	var paletteId = paletteInfo.id;
	//init node data
	var initNodeData = options.initNodeData;
	//defined show edit node
	var showEditNode = options.showEditNode;
	//defiend display node
	var displayNode = options.displayNode;
	//init gojs
	var s = gojs.GraphObject.make;
	//init diagram
	var myDiagram = s(gojs.Diagram, diagramId, {
		initialContentAlignment: gojs.Spot.MiddleTop,
		allowDrop: true
	});

	var categoryPorts = {
		"node": {
			"top": [false, true],
			"left": [true, true],
			"right": [true, true],
			"bottom": [true, false]
		},
		"start": {
			"top": [false, false],
			"left": [true, false],
			"right": [true, false],
			"bottom": [true, false]
		},
		"end": {
			"top": [false, true],
			"left": [false, true],
			"right": [false, true],
			"bottom": [false, false]
		}
	};

	delete paletteInfo.id;
	var modeList = [];
	for (var category in paletteInfo) {
		var paletteItemBackgroundColor = paletteInfo[category].backgroundColor ? paletteInfo[category].backgroundColor : "#00A9C9";
		var paletteItemFont = paletteInfo[category].font ? paletteInfo[category].font : "bold 12pt sans-serif";
		var paletteItemLabel = paletteInfo[category].label ? paletteInfo[category].label : "";
		var paletteItemInfo = paletteInfo[category].info ?  paletteInfo[category].info : [];
		var paletteItemColor = paletteInfo[category].color ?  paletteInfo[category].color : ["lightgreen", "lightblue"];
		var paletteItemColorCount = paletteItemColor.length;
		modeList.push({
			label: paletteItemLabel, 
			info: paletteItemInfo, 
			category: category
		});
		//init node template add
		myDiagram.nodeTemplateMap.add(category,
			s(
				gojs.Node, 
				"Spot", 
				nodeStyle(),
				s(
					gojs.Panel, 
					"Auto",
					s(
						gojs.Shape, 
						"RoundedRectangle",
						{ 
							fill: paletteItemBackgroundColor
						}
					),
					s(gojs.Panel, "Table",
						{ 
							defaultRowSeparatorStroke: "black"
						},
						// header
						s(
							gojs.TextBlock,
							{
								row: 0, 
								columnSpan: 2, 
								margin: 3, 
								alignment: gojs.Spot.Center,
								font: paletteItemFont,
								isMultiline: false,
							},
							new gojs.Binding("text", "label").makeTwoWay()
						),
						s(
							gojs.Panel, 
							"Vertical",
							new gojs.Binding("itemArray", "info"),
							{
								row: 1, 
								margin: 3, 
								stretch: gojs.GraphObject.Fill,
								defaultAlignment: gojs.Spot.Left, 
								background: "lightyellow",
								itemTemplate: s(
									gojs.Panel,
									"Vertical",
									new gojs.Binding("background", "itemIndex",
										function(i) { 
											var colorIdx = i % paletteItemColorCount;
											return paletteItemColor[colorIdx]; 
										}
									).ofObject(),
									s(
										gojs.TextBlock,
										new gojs.Binding("text", "").makeTwoWay()
									),
									{
										margin: 2,
										stretch: gojs.GraphObject.Fill
									}
								)
							}
						)
					)
				),
				makePort("T", gojs.Spot.Top, categoryPorts[category].top[0], categoryPorts[category].top[1]),
				makePort("L", gojs.Spot.Left, categoryPorts[category].left[0], categoryPorts[category].left[1]),
				makePort("R", gojs.Spot.Right, categoryPorts[category].right[0], categoryPorts[category].right[1]),
				makePort("B", gojs.Spot.Bottom, categoryPorts[category].bottom[0], categoryPorts[category].bottom[1])
			)
		);
	}

	
	//init my controller
	s(gojs.Palette, paletteId, {
		"animationManager.duration": 1,
		nodeTemplateMap: myDiagram.nodeTemplateMap,
		model: new gojs.GraphLinksModel(modeList)
	});
	function nodeStyle() {
		return [
			new gojs.Binding("location", "loc", gojs.Point.parse).makeTwoWay(gojs.Point.stringify),
			{
				locationSpot: gojs.Spot.Center,
				mouseEnter: function (e, obj) { showPorts(obj.part, true); },
				mouseLeave: function (e, obj) { showPorts(obj.part, false); }
			}
		];
	}

	function checkData(nodeDataArray) {
		var code = 0;
		var message = ""; 
		if (nodeDataArray.length === 0) {
			code = 1;
			message = "Please add node";
		}
		var startCount = 0;
		var endCount = 0;
		var nodeCount = 0;
		for (var idx = 0, len = nodeDataArray.length; idx < len; idx++) {
			var node = nodeDataArray[idx];
			if (node.category == "start") {
				startCount++;
			} else if (node.category == "end") {
				endCount++;
			} else if (node.category == "node") {
				nodeCount++;
			}
		}
		if (startCount === 0) {
			return {
				code: 2,
				message: "Please add a start node"
			};
		}
		if (startCount > 1) {
			return {
				code: 3,
				message: "Only have a start node"
			};
		}
		if (endCount === 0) {
			return {
				code: 4,
				message: "Please add an end node"
			};
		}
		if (endCount > 1) {
			return {
				code: 5,
				message: "Only have an end node"
			};
		}
		if (nodeCount === 0) {
			return {
				code: 6,
				message: "Please add process node"
			};
		}
		return null;
	}

	function makePort(name, spot, output, input) {
		return s(gojs.Shape, "Circle", 
			{
				fill: "transparent",
				stroke: null, 
				desiredSize: new gojs.Size(8, 8),
				alignment: spot, 
				alignmentFocus: spot, 
				portId: name, 
				fromSpot: spot, 
				toSpot: spot,  
				fromLinkable: output, 
				toLinkable: input, 
				cursor: "pointer"
			}
		);
	}

	function showPorts(node, show) {
		var diagram = node.diagram;
		if (!diagram || diagram.isReadOnly || !diagram.allowLink)  {
			return;
		}
		node.ports.each(function(port) {
			port.stroke = (show ? "white" : null);
		});
	}

	myDiagram.linkTemplate = s(
		gojs.Link,
		{
			routing: gojs.Link.AvoidsNodes,
			curve: gojs.Link.JumpOver,
			corner: 5, toShortLength: 4,
			relinkableFrom: true,
			relinkableTo: true,
			reshapable: true,
			resegmentable: true,
			mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
			mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
		},
		new gojs.Binding("points").makeTwoWay(),
		s(
			gojs.Shape,
			{ 
				isPanelMain: true, 
				strokeWidth: 8, 
				stroke: "transparent", 
				name: "HIGHLIGHT" 
			}
		),
		s(
			gojs.Shape,
			{
				isPanelMain: true, 
				stroke: "gray", 
				strokeWidth: 2 
			}
		),
		s(
			gojs.Shape,
			{
				toArrow: "standard", 
				stroke: null, 
				fill: "gray"
			}
		)
	);
	//初始化双击操作
	myDiagram.addDiagramListener("ObjectDoubleClicked", function(ev) {
		var part = ev.subject.part;
		if (!part.data.customData) {
			var initData = {};
			for (var key in initNodeData) {
				initData[key] = initNodeData[key];
			}
			part.data.customData = initData;
		}
		showEditNode(part, part.data.customData);
	});
	
	return {
		saveNodeData: function(node, data) {
			node.data.customData = data;
			var textInfo = displayNode(data);
			var textList = textInfo.text;
			var label = textInfo.label;
			myDiagram.startTransaction("vacate");
			myDiagram.model.setDataProperty(node.data, "label", label);
			myDiagram.model.setDataProperty(node.data, "info", textList);
			myDiagram.commitTransaction("vacate");
		},
		getDiagramData: function() {
			var modelJsonStr = myDiagram.model.toJson();
			var modelJsonData = JSON.parse(modelJsonStr);
			var checkInfo = checkData(modelJsonData.nodeDataArray);
			if (checkInfo) {
				return checkInfo;
			}
			return {
				nodeDataArray: modelJsonData.nodeDataArray,
				linkDataArray: modelJsonData.linkDataArray
			};
		},
		renderDiagram: function(data) {
			if (!data) {
				return;
			}
			if (!data.nodeDataArray) {
				return;
			}
			if (data.nodeDataArray.length === 0) {
				return;
			}
			var modeJsonData = {
				"class": "go.GraphLinksModel"
			};
			modeJsonData.nodeDataArray = data.nodeDataArray;
			modeJsonData.linkDataArray = data.linkDataArray;
			myDiagram.model = gojs.Model.fromJson(data);
		}
	};
}

define([], function() {
	return {
		createDiagram: function(_options) {
			return new shareworksWorkFlow(_options);
		}
	};
});