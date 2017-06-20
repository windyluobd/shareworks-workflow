import gojs from 'gojs';
var icons = {
	"cog": "M29.181 19.070c-1.679-2.908-0.669-6.634 2.255-8.328l-3.145-5.447c-0.898 0.527-1.943 0.829-3.058 0.829-3.361 0-6.085-2.742-6.085-6.125h-6.289c0.008 1.044-0.252 2.103-0.811 3.070-1.679 2.908-5.411 3.897-8.339 2.211l-3.144 5.447c0.905 0.515 1.689 1.268 2.246 2.234 1.676 2.903 0.672 6.623-2.241 8.319l3.145 5.447c0.895-0.522 1.935-0.82 3.044-0.82 3.35 0 6.067 2.725 6.084 6.092h6.289c-0.003-1.034 0.259-2.080 0.811-3.038 1.676-2.903 5.399-3.894 8.325-2.219l3.145-5.447c-0.899-0.515-1.678-1.266-2.232-2.226zM16 22.479c-3.578 0-6.479-2.901-6.479-6.479s2.901-6.479 6.479-6.479c3.578 0 6.479 2.901 6.479 6.479s-2.901 6.479-6.479 6.479z",
	"remove": "M6 32h20l2-22h-24zM20 4v-4h-8v4h-10v6l2-2h24l2 2v-6h-10zM18 4h-4v-2h4v2z",
	"plus": "M31 12h-11v-11c0-0.552-0.448-1-1-1h-6c-0.552 0-1 0.448-1 1v11h-11c-0.552 0-1 0.448-1 1v6c0 0.552 0.448 1 1 1h11v11c0 0.552 0.448 1 1 1h6c0.552 0 1-0.448 1-1v-11h11c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1z"
};

function shareworksWorkFlow(options) {
	if (typeof(options) != "object") {
		return null;
	}
	var nodeKey = -1;
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
	//show add node
	var showAddNode = options.showAddNode;
	//show delete node
	var showRemoveNode = options.showRemoveNode;
	//init gojs
	var s = gojs.GraphObject.make;
	//init diagram
	var myDiagram = s(gojs.Diagram, diagramId, {
		initialContentAlignment: gojs.Spot.MiddleTop,
		initialAutoScale: gojs.Diagram.Uniform,
		allowDrop: false,
		allowCopy: false,
		allowDelete: false,
		allowMove: false,
		allowZoom: false,
		layout: s(gojs.LayeredDigraphLayout, {direction: 90, layerSpacing: 50, setsPortSpots: false})
	});

	/*var categoryPorts = {
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
	};*/
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
				{
					selectable: false
				},
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
					s(
						gojs.Panel, 
						"Table",
						s(gojs.RowColumnDefinition, { row: 0, separatorStroke: "white" }),
						s(gojs.RowColumnDefinition, { row: 1, separatorStroke: "white" }),
						s(gojs.RowColumnDefinition, { row: 2, separatorStroke: paletteItemTitleStyle.underLineColor }),
						// toolbar
						s(
							gojs.Panel, 
							"Auto",
							{
								click: buttonSetNode,
								alignment: gojs.Spot.MiddleRight,
								row: 0,
								cursor: "pointer"
							},
							s(
								gojs.Shape,
								{ 
									strokeWidth: 1,
									stroke: "#888",
									geometry: gojs.Geometry.parse(icons.cog),
									width: 13,
									height: 13
								}
							),
							new gojs.Binding("margin", "category", function(val) { 
								if (val == "node") {
									return new gojs.Margin(0, 15, 0, 0);
								}
							})
						),
						s(
							gojs.Panel, 
							"Auto",
							{
								click: buttonRemoveNode,
								alignment: gojs.Spot.MiddleRight,
								row: 0,
								cursor: "pointer"
							},
							s(
								gojs.Shape,
								{
									strokeWidth: 1,
									stroke: "#888",
									geometry: gojs.Geometry.parse(icons.remove),
									width: 13,
									height: 13
								},
								new gojs.Binding("visible", "category", function(val) { return val == "node"; })
							)
						),
						
						// header
						s(
							gojs.TextBlock,
							{
								row: 1, 
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
								row: 2,
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
				)
				// makePort("T", gojs.Spot.Top, categoryPorts[category].top[0], categoryPorts[category].top[1]),
				// makePort("L", gojs.Spot.Left, categoryPorts[category].left[0], categoryPorts[category].left[1]),
				// makePort("R", gojs.Spot.Right, categoryPorts[category].right[0], categoryPorts[category].right[1]),
				// makePort("B", gojs.Spot.Bottom, categoryPorts[category].bottom[0], categoryPorts[category].bottom[1])
			)
		);
	}

	
	//init my controller
	s(gojs.Palette, paletteId, {
		"animationManager.duration": 1,
		nodeTemplateMap: myDiagram.nodeTemplateMap,
		model: new gojs.GraphLinksModel(modeList)
	});

	//node style
	function nodeStyle() {
		return [
			new gojs.Binding("location", "loc", gojs.Point.parse).makeTwoWay(gojs.Point.stringify),
			{
				locationSpot: gojs.Spot.Center
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

	/*function makePort(name, spot, output, input) {
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
	}*/

	/*function showPorts(node, show) {
		var diagram = node.diagram;
		if (!diagram || diagram.isReadOnly || !diagram.allowLink)  {
			return;
		}
		node.ports.each(function(port) {
			port.fill = (show ? lineStyle.portColor : "transparent");
			port.stroke = (show ? lineStyle.portColor : null);
		});
	}*/
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
			routing: gojs.Link.Normal,
			selectable: false
		},
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
				stroke: null, 
				fill: "gray"
			}
		),
		s(
			gojs.Panel, 
			"Auto",
			{
				click: buttonAddNode,
				cursor: "pointer",
				segmentIndex: 0
			},
			s(
				gojs.Shape, 
				"CircleLine",
				{ 
					strokeWidth: 1, 
					stroke: "#888", 
					width: 12, 
					height: 12 
				}
			),
			s(
				gojs.Shape,
				{ 
					strokeWidth: 1,
					stroke: "#888",
					geometry: gojs.Geometry.parse(icons.plus),
					width: 9,
					height: 9
				}
			),
			new gojs.Binding("segmentFraction", "", setSegmentFraction)
		)		
	);
	
	/*function setSegmentIndex(data) {
		var fromKey = data.from;
		var fromNode = myDiagram.findNodeForKey(fromKey);
		if (fromNode.category == "start") {
			return 0;
		} else {
			return 0;
		}
	}*/

	function setSegmentFraction(data) {
		var fromKey = data.from;
		var fromNode = myDiagram.findNodeForKey(fromKey);
		if (fromNode.category == "start") {
			return 0.3;
		} else {
			return 0.7;
		}
	}
	//初始化双击操作
	/*myDiagram.addDiagramListener("ObjectDoubleClicked", function(ev) {
		var part = ev.subject.part;
		if (!part.data.customData) {
			var initData = {};
			for (var key in initNodeData) {
				initData[key] = initNodeData[key];
			}
			part.data.customData = initData;
		}
		showEditNode(part, part.data.customData);
	});*/
	//点击事件
	function buttonAddNode(e, port) {
		var linkNode = port.part;
		var linkNodeData = linkNode.data;
		e = null;
		showAddNode(linkNodeData);
		
    }
	//设置节点
	function buttonSetNode(e, port) {
		e = null;
		var node = port.part;
		if (!node.data.customData) {
			var initData = {};
			for (var key in initNodeData) {
				initData[key] = initNodeData[key];
			}
			node.data.customData = initData;
		}
		showEditNode(node, node.data.customData);
	}
	//删除节点
	function buttonRemoveNode(e, port) {
		var node = port.part;
		e = null;
		showRemoveNode(node);
	}
	
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
			nodeKey = -1;
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
		},
		addNode: function(category, linkNodeData, nodeData) {
			if (category == "normal" || category == "branch") {
				var fromNodeKey = linkNodeData.from;
				var toNodeKey = linkNodeData.to;
				var linkDataArray = myDiagram.model.linkDataArray;
				var nodeDataArray = myDiagram.model.nodeDataArray;
				var isEndNode = false;
				for (var idx in nodeDataArray) {
					var entity = nodeDataArray[idx];
					if (entity.key == toNodeKey && entity.category == "end") {
						isEndNode = true;
						break;
					}
				}
				var nextToNodeKey = 0;
				for (var linkIdx in linkDataArray) {
					var linkEntity = linkDataArray[linkIdx];
					if (linkEntity.from == toNodeKey) {
						nextToNodeKey = linkEntity.to;
						break;
					}
				}
				if (isEndNode) {
					category = "normal";
				}
				//添加一个Node
				myDiagram.startTransaction("make new node");
				nodeData = nodeData ? nodeData : {};
				nodeData.key = nodeKey;
				nodeData.category = "node";
				myDiagram.model.addNodeData(nodeData);
				myDiagram.commitTransaction("make new node");
				if (category == "normal") {
					//删除原有链接
					myDiagram.startTransaction("remove link");
					myDiagram.model.removeLinkData(linkNodeData);
					myDiagram.commitTransaction("remove link");
					//重新建立链接
					myDiagram.startTransaction("make new link");
					myDiagram.model.addLinkData({from: fromNodeKey, to: nodeKey});
					myDiagram.commitTransaction("make new link");
					myDiagram.startTransaction("make new link");
					myDiagram.model.addLinkData({from: nodeKey, to: toNodeKey});
					myDiagram.commitTransaction("make new link");
				} else {
					myDiagram.startTransaction("make new link");
					myDiagram.model.addLinkData({from: fromNodeKey, to: nodeKey});
					myDiagram.commitTransaction("make new link");
					myDiagram.startTransaction("make new link");
					myDiagram.model.addLinkData({from: nodeKey, to: nextToNodeKey});
					myDiagram.commitTransaction("make new link");
				}
				nodeKey = nodeKey - 1;
			}
		},
		removeNode: function(node) {
			var nodeDataArray = myDiagram.model.nodeDataArray;
			var nodeCount = 0;
			for (var rmIdx in nodeDataArray) {
				var nodeEntity = nodeDataArray[rmIdx];
				if (nodeEntity.category == "node") {
					nodeCount++;
				}
			}
			if (nodeCount === 1) {
				return {
					code: 11,
					message: "不能删除，必须包含一个节点"
				};
			}
			var nodeKey = node.data.key;
			var linkDataArray = myDiagram.model.linkDataArray;
			//get from and to node key
			var fromNodeKey = 0;
			var toNodeKey = 0;
			var fromLinkData = null;
			var toLinkData = null;
			var pathTree = {};
			for (var idx in linkDataArray) {
				var entity = linkDataArray[idx];
				var from = entity.from;
				var to = entity.to;
				if (from === nodeKey) {
					toNodeKey = to;
					toLinkData = entity;
				}
				if (to === nodeKey) {
					fromNodeKey = from;
					fromLinkData = entity;
				}
				if (!pathTree[from]) {
					pathTree[from] = [];
				}
				pathTree[from].push(to);
			}
			//获取所有路径
			var finalAllPaths = [];
			var finalAllKeys = [];
			createPath(fromNodeKey, pathTree, fromNodeKey, finalAllPaths, finalAllKeys);
			var pathCount = 0;
			for (var i in finalAllPaths) {
				var path = finalAllPaths[i];
				if (path.indexOf(fromNodeKey) > -1 && path.indexOf(toNodeKey) > -1) {
					pathCount++;
				}
			}
			//删除节点
			myDiagram.startTransaction("remove node");
			myDiagram.model.removeNodeData(node.data);
			myDiagram.commitTransaction("remove node");
			myDiagram.startTransaction("remove link");
			myDiagram.model.removeLinkData(fromLinkData);
			myDiagram.commitTransaction("remove link");
			myDiagram.startTransaction("remove link");
			myDiagram.model.removeLinkData(toLinkData);
			myDiagram.commitTransaction("remove link");
			if(pathCount === 1) {
				myDiagram.startTransaction("make new link");
				myDiagram.model.addLinkData({from: fromNodeKey, to: toNodeKey});
				myDiagram.commitTransaction("make new link");
			} 
			return null;
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