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
	var paletteStyle = {
		backgroundColor: paletteInfo.backgroundColor ? paletteInfo.backgroundColor : "#00A9C9",
		font: paletteInfo.font ? paletteInfo.font : "bold 11pt Helvetica, Arial, sans-serif",
		color: paletteInfo.color ? paletteInfo.color : "whitesmoke",
		size: typeof(paletteInfo.size) == "number" ? paletteInfo.size : 400,
		text: paletteInfo.text ? paletteInfo.text : "流程节点"
	};
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
	//init node template add
	myDiagram.nodeTemplateMap.add("",
		s(
			gojs.Node, 
			"Spot", 
			nodeStyle(),
			s(
				gojs.Panel, 
				"Auto",
				s(
					gojs.Shape, 
					"Rectangle",
					{ 
						fill: paletteStyle.backgroundColor, 
						stroke: null 
					},
					new gojs.Binding("figure", "figure")
				),
				s(
					gojs.TextBlock,
					{
						font: paletteStyle.font,
						stroke: paletteStyle.color,
						margin: 8,
						maxSize: new gojs.Size(paletteStyle.size, NaN),
						wrap: gojs.TextBlock.WrapFit
					},
					new gojs.Binding("text").makeTwoWay()
				)
			),
			makePort("T", gojs.Spot.Top, false, true),
			makePort("L", gojs.Spot.Left, true, true),
			makePort("R", gojs.Spot.Right, true, true),
			makePort("B", gojs.Spot.Bottom, true, false)
		)
	);
	//init my controller
	s(gojs.Palette, paletteId, {
		"animationManager.duration": 1,
		nodeTemplateMap: myDiagram.nodeTemplateMap,
		model: new gojs.GraphLinksModel([
			{ text: paletteStyle.text }
		])
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
			var textStr = displayNode(data);
			myDiagram.startTransaction("vacate");
			myDiagram.model.setDataProperty(node.data, "text", textStr);
			myDiagram.commitTransaction("vacate");
		},
		getDiagramData: function() {
			var modelJsonStr = myDiagram.model.toJson();
			var modelJsonData = JSON.parse(modelJsonStr);
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