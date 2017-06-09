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
	var lineStyle = paletteInfo.lineStyle;
	delete paletteInfo.id;
	delete paletteInfo.lineStyle;
	var modeList = [];
	for (var category in paletteInfo) {
		var paletteItemBackgroundColor = paletteInfo[category].backgroundColor ? paletteInfo[category].backgroundColor : "#00A9C9";
		var paletteItemTitleStyle = paletteInfo[category].title;
		var paletteItemNodeStyle = paletteInfo[category].node;
		var paletteItemContentStyle = paletteInfo[category].content;
		// var paletteItemColorCount = paletteInfo[category].length;
		var paletteItemLabel = paletteInfo[category].label ? paletteInfo[category].label : "";
		var paletteItemInfo = paletteInfo[category].info ?  paletteInfo[category].info : [];
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
							fill: paletteItemBackgroundColor,
							strokeWidth: paletteItemNodeStyle.boldSize,
							stroke: paletteItemNodeStyle.boldColor
						}
					),
					s(gojs.Panel, "Table",
						{ 
							defaultRowSeparatorStroke: paletteItemTitleStyle.underLineColor
						},
						// header
						s(
							gojs.TextBlock,
							{
								row: 0, 
								columnSpan: 2, 
								margin: 3, 
								alignment: gojs.Spot.Center,
								font: paletteItemTitleStyle.font,
								isMultiline: false,
								stroke: paletteItemTitleStyle.color
							},
							new gojs.Binding("text", "label").makeTwoWay()
						),
						s(
							gojs.Panel, 
							"Vertical",
							new gojs.Binding("itemArray", "info"),
							{
								row: 1,
								background: paletteItemBackgroundColor,
								itemTemplate: s(
									gojs.Panel,
									"Vertical",
									s(
										gojs.TextBlock,
										{
											stroke: paletteItemContentStyle.color,
											font: paletteItemContentStyle.font,
											textAlign: "left"
										},
										new gojs.Binding("text", "").makeTwoWay()
									),
									{
										stretch: gojs.GraphObject.Fill,
										defaultAlignment: gojs.Spot.Left,
										margin: paletteItemContentStyle.margin
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

	function checkData(nodeDataArray, linkDataArray) {
		var code = 0;
		var message = ""; 
		if (nodeDataArray.length === 0) {
			code = 1;
			message = "请添加节点";
		}
		var startCount = 0;
		var endCount = 0;
		var nodeCount = 0;
		var startNodeKey = 0;
		var endNodeKey = 0;
		var allNodeKey = [];
		for (var idx = 0, len = nodeDataArray.length; idx < len; idx++) {
			var node = nodeDataArray[idx];
			var nodeKey = node.key;
			allNodeKey.push(nodeKey);
			if (node.category == "start") {
				startCount++;
				startNodeKey = nodeKey;
			} else if (node.category == "end") {
				endCount++;
				endNodeKey = nodeKey;
			} else if (node.category == "node") {
				nodeCount++;
			}
		}
		if (startCount === 0) {
			return {
				code: 2,
				message: "必须添加一个开始节点"
			};
		}
		if (startCount > 1) {
			return {
				code: 3,
				message: "只能包含一个开始节点"
			};
		}
		if (endCount === 0) {
			return {
				code: 4,
				message: "必须添加一个结束节点"
			};
		}
		if (endCount > 1) {
			return {
				code: 5,
				message: "只能包含一个结束节点"
			};
		}
		if (nodeCount === 0) {
			return {
				code: 6,
				message: "必须添加一个流程节点"
			};
		}
		//构造路径树
		var pathTree = {};
		for (var i in linkDataArray) {
			var entity = linkDataArray[i];
			var from = entity.from;
			var to = entity.to;
			if (!pathTree[from]) {
				pathTree[from] = [];
			}
			pathTree[from].push(to);
		}
		//获取所有路径
		var finalAllPaths = [];
		var finalAllKeys = [];
		createPath(startNodeKey, pathTree, startNodeKey, finalAllPaths, finalAllKeys);
		//判断是否路径都是由开始节点发出
		var checkTag = true;
		for (var key in pathTree) {
			if (finalAllKeys.indexOf(parseInt(key)) < 0) {
				checkTag = false;
				break;
			}
		}
		if (!checkTag) {
			return {
				code: 7,
				message: "所有路径必须从开始节点发出"
			};
		}
		//判断所有路径是否以结束节点为终止
		checkTag = true;
		for (var j in finalAllPaths) {
			var path = finalAllPaths[j];
			var end = parseInt(path.slice(path.lastIndexOf(",") + 1));
			if (end !== endNodeKey) {
				checkTag = false;
				break;
			}
		}
		if (!checkTag) {
			return {
				code: 8,
				message: "所有路径必须以结束节点结束"
			};
		}
		//判断所有路径是否合法
		var pathArray = [];
		for (var k in finalAllPaths) {
			pathArray.push(finalAllPaths[k].split(","));
		}
		if (!checkPath(pathArray)) {
			return {
				code: 9,
				message: "非法路径"
			};
		}
		//判断是否所有节点都在路径里
		if (!isContained(allNodeKey, finalAllKeys)) {
			return {
				code: 10,
				message: "节点必须存在于一条路径中"
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
			port.fill = (show ? lineStyle.portColor : "transparent");
			port.stroke = (show ? lineStyle.portColor : null);
		});
	}
	// 构造路径
	function createPath(key, pathTree, path, allPaths, allKeys) {
		if (allKeys.indexOf(key)  < 0) {
			allKeys.push(key);
		}
		var toArr = pathTree[key];
		if (!toArr) {
			allPaths.push(path);
			return;
		}
		for (var idx in toArr) {
			var toKey = toArr[idx];
			var newPath = path + "," + toKey;
			createPath(toKey, pathTree, newPath, allPaths, allKeys);
		}
	}
	// 检查路径
	function checkPath(cheakPaths) {
		for (var i in cheakPaths) {
			var itemArr = cheakPaths[i];
			for (var j in cheakPaths) {
				if (i !== j) {
					if (isContained(itemArr, cheakPaths[j])) {
						return false;
					}
				}
			}
		}
		return true;
	}
	// 判断数组是否被包含
	function isContained(arr1, arr2) {
		var tag = true;
		for (var idx in arr1) {
			var item = arr1[idx];
			if (arr2.indexOf(item) < 0) {
				tag = false;
				break;
			}
		}
		return tag;
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
				strokeWidth: lineStyle.size * 2, 
				stroke: "transparent", 
				name: "HIGHLIGHT" 
			}
		),
		s(
			gojs.Shape,
			{
				isPanelMain: true, 
				stroke: lineStyle.color, 
				strokeWidth: lineStyle.size 
			}
		),
		s(
			gojs.Shape,
			{
				toArrow: "standard", 
				stroke: lineStyle.color,
				strokeWidth: lineStyle.size,
				fill: lineStyle.color
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
			var checkInfo = checkData(modelJsonData.nodeDataArray, modelJsonData.linkDataArray);
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