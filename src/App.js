import React, { useState, useEffect } from "react";
import axios from "axios";
import SplitPane, { Pane } from 'react-split-pane';
import { loadModules } from 'esri-loader'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import MapComponent from "./MapComponent";
import WMSComponent from "./WMSComponent";
import Table from "./Table";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import StandaloneToggleButton from './StandaloneToggleButton';

import 'react-tabs/style/react-tabs.css';
import "./App.css";
import './edit.css';

const baseURL = "http://localhost:8080/api/v1/ships";
const deleteAllShipsURL = "http://localhost:8080/api/v1/deleteAllShips";

var map = null;
var view = null;
var graphicsLayer = null;

export {map}
export {view}
export {graphicsLayer}

function App() {

	let setupData = false;
	let ships = new Map();
	let latitudes = [];
	let longitudes = [];

	latitudes.push(21.314382639216962);
	longitudes.push(131.748046875037);

	latitudes.push(39.660204901911264);
	longitudes.push(134.20898437503638);

	latitudes.push(-33.99399007259855);
	longitudes.push(-25.04882812501565);

	latitudes.push(36.05303591622894);
	longitudes.push(18.544921875066336);

	latitudes.push(30.932396225238403);
	longitudes.push(-120.5447187086);

	latitudes.push(35.438803668534895);
	longitudes.push(11.162109375068269);

	latitudes.push(-10.855224204493528);
	longitudes.push(46.214345476755);

	const loadedShips = new Set();

	const testTableData = [];
	useEffect(() => {

	}, []);

	// State variables to force a refresh ...
	let [tableData, setTableData] = useState([]);

	// Round number to nth decimal place
	const roundNumber = (num, nthDecimalPlace) => {
		if (num !== undefined && num !== null &&
			nthDecimalPlace !== undefined && nthDecimalPlace !== null) {
			let factor = Math.pow(10, nthDecimalPlace);
			num = Math.round(num * factor) / factor;
		}
		return num;
	}

	const tableColumns = React.useMemo(
		() => [
			{
				Header: 'Forecasting',
				accessor: 'forecasting',
				Cell: ({ cell: { value } }) => <Forecast value={value} />
			},
			{
				Header: 'Ship',
				accessor: 'ship',
				Cell: ({ cell: { value } }) => <Ship value={value} />
			},
			{
				Header: 'Location',
				accessor: 'location',
				Cell: ({ cell: { value } }) => <Location value={value} />
			},
			{
				Header: 'Routing',
				accessor: 'routing',
				Cell: ({ cell: { value } }) => <Routing value={value} />
			},
		],
		[]
	)

	const Forecast = ({ value }) => {
	    //var randomColor = Math.floor(Math.random()*16777215).toString(16);
		const roundButtonStyle = {
			//backgroundColor: '#' + randomColor
			backgroundColor: 'red'
		}; 
		const squareButtonStyle = {
			//backgroundColor: '#' + randomColor
			backgroundColor: 'lightYellow'
		}; 
		return (
			<>
				<div className="container">
				   <button className="box forecast-round-btn-badge" style={roundButtonStyle}></button>
				   <button className="box forecast-rectangle-btn-badge" style={squareButtonStyle}></button>
				</div>
			</>
		);
	};


	// Cell render ...
	const Ship = ({ value }) => {
		const style = {}; 
		return (
			<>
				<span style={style}>
					<center>{value}</center>
				</span>
			</>
		);
	};

	// Cell render ...
	const Location = ({ value }) => {
		const style = {}; // I can override style here, if I wanted ...
		const locationElements = value.split(",");
		const latitude = parseFloat(locationElements[0]);
		const longitude = parseFloat(locationElements[1]);
		value = "(" + roundNumber(latitude, 4) + ", " + roundNumber(longitude, 4) + ")";
		return (
			<>
				<span style={style}>
					<center>{value}</center>
				</span>
			</>
		);
	};

	// Dumb graphic for Routing
	const Routing = ({ value }) => {
	    //var randomColor = Math.floor(Math.random()*16777215).toString(16);
		const roundButtonStyle = {
			//backgroundColor: '#' + randomColor
			backgroundColor: 'lightGreen'
		}; 
		const squareButtonStyle = {
			//backgroundColor: '#' + randomColor
			backgroundColor: 'lightYellow'
		}; 
		return (
			<>
				<div className="container">
				   <button className="box routing-round-btn-badge" style={roundButtonStyle}></button>
				   <button className="box routing-rectangle-btn-badge" style={squareButtonStyle}></button>
				</div>
			</>
		);
	};

	// Tells me what row was clicked ...
	const onRowClickHandler = (row, e) => {
		let name = row.original.ship;
		const locationElements = row.original.location.split(",");
		let latitude = parseFloat(locationElements[0].replace('(', '').replace(')', ''));
		let longitude = parseFloat(locationElements[1].replace('(', '').replace(')', ''));
		view.goTo({ center: [longitude, latitude], zoom: 9 });
	};

	// Test data ...
	var types = [];
	for (let i = 0; i < 6; i++) {
		types.push("Radio Button " + i);
	}


	// Initialize data for prototoype ... I really don't need axios, you know ...
	const initDataButtonOnClick = () => {
	
		//const url = "https://geointdev.nrlssc.org/metocserver/ogc/wms/WW3_GLOBAL/?service&width=1440&height=721&bbox=-180,-90,180,90&format=image%2Fpng&request=GetMap&service=WMS&styles=&transparent=true&version=1.1.1&srs=EPSG%3A4326&layers=max_wav_ht.surface__global_1440x721";
	  	//axios.get(url).then((response) => { });

		if (!setupData) {

			map.add(graphicsLayer);
			
			const locationFudge = 1.5;

			// Delete all ships in database, start with a clean slate ...
			axios.delete(deleteAllShipsURL).catch(err => console.log(err));
			ships = new Map(); // Clear

			// Set up ship data here ...
			const length = latitudes.length;
			let count = 0;
			for (let i = 0; i < length; i++) {
				const numOfShips = getRandomInt(5, 15);
				for (let j = 0; j < numOfShips; j++) {
					let ship = {};
					ship.name = "Ship " + count;
					let latDx = (Math.random() * locationFudge) * (getRandomInt(0, 1) === 0 ? -1.0 : 1.0);
					let lonDx = (Math.random() * locationFudge) * (getRandomInt(0, 1) === 0 ? -1.0 : 1.0);
					ship.latitude = latitudes[i] + latDx;
					ship.longitude = longitudes[i] + lonDx;
					ships.set(ship.name, ship);

					// Create the ship in the database ...
					axios.post(baseURL, ship)
						.catch(err => console.log(err));
					count++;

					loadModules(['esri/Graphic', 'esri/geometry/Point']).then(([Graphic, Point]) => {
						let point = {
							type: "point",  // autocasts as new Point()
							longitude: ship.longitude,
							latitude: ship.latitude
						};

						// Create a symbol for drawing the point
						let markerSymbol = {
							type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
							color: 'cyan'
						};

						// Create a graphic and add the geometry and symbol to it
						let pointGraphic = new Graphic({
							geometry: point,
							symbol: markerSymbol,
							popupTemplate: {
								content: ship.name + "<p>" + "(" + ship.latitude + ", " + ship.longitude + ")"
							}
						});
						graphicsLayer.add(pointGraphic);

					});
				}
			}

			//console.log(ships);

			// Load some region graphics here ...
			loadModules(['esri/Graphic', 'esri/geometry/Point']).then(([Graphic, Point]) => {

				// Create a polygon geometry
				const polygon = {
					type: "polygon", // autocasts as new Polygon()
					rings: [
						[-64.78, 32.3],
						[-66.07, 18.45],
						[-80.21, 25.78],
						[-64.78, 32.3]
					]
				};

				// Create a symbol for rendering the graphic
				const simpleFillSymbol = {
					type: "simple-fill", // autocasts as new SimpleFillSymbol()
					color: [227, 139, 79, 0.0],
					outline: { // autocasts as new SimpleLineSymbol()
						color: [255, 0, 0],
						width: 1
					}
				};

				const polygonGraphic = new Graphic({
					geometry: polygon,
					symbol: simpleFillSymbol
				});
				graphicsLayer.add(polygonGraphic);


				let length = latitudes.length;
				for (let k = 0; k < length; k++) {
					let shape = [];
					switch (k) {
						case 0:
							shape.push([133.04443359378445, 31.676227665713586]);
							shape.push([148.02978515628044, 28.095662059485843]);
							shape.push([154.2260742187788, 16.8722935638509]);
							shape.push([153.65478515627896, 5.730156637959252]);
							shape.push([131.15478515628496, 3.803342766071277]);
							shape.push([112.52197265628989, 7.694042817603407]);
							shape.push([106.67724609379145, 22.37489930834824]);
							shape.push([109.05029296879081, 30.28224953512741]);
							shape.push(shape[0]);
							break;
						case 1:
							shape.push([128.43017578128567, 44.16993754621839]);
							shape.push([136.16455078128362, 46.33512019853323]);
							shape.push([149.69970703128, 41.00015916771196]);
							shape.push([141.65771484378214, 32.123925185915695]);
							shape.push([133.1323242187844, 33.30705591247728]);
							shape.push([125.57373046878642, 34.79976023098801]);
							shape.push([122.27783203128728, 42.18329660245236]);
							shape.push(shape[0]);
							break;
						case 2:
							shape.push([-42.42919921876071, -27.113478555243734]);
							shape.push([-29.421386718764072, -12.270840680900907]);
							shape.push([-12.897949218768373, -7.423007862842925]);
							shape.push([-4.108886718770654, -24.90195053414915]);
							shape.push([-0.24169921877162845, -41.8168260554484]);
							shape.push([-10.78857421876893, -53.78479494483233]);
							shape.push([-33.64013671876299, -55.21371209483867]);
							shape.push([-55.78857421875727, -49.192881812241616]);
							shape.push([-53.67919921875779, -36.928437546505904]);
							shape.push(shape[0]);
							break;
						case 3:
							shape.push([15.589599609441796, 35.545128486492786]);
							shape.push([16.3366699219416, 37.050295382373314]);
							shape.push([17.929687500066176, 37.974023367169586]);
							shape.push([19.401855468815786, 38.01731264527955]);
							shape.push([20.841064453190405, 37.0415266114145]);
							shape.push([22.137451171940057, 35.22267557128448]);
							shape.push([21.70898437506517, 34.093093982326856]);
							shape.push([20.39062500006552, 33.03117013912235]);
							shape.push([18.2263183594411, 32.36551643490957]);
							shape.push([16.413574218816578, 33.1048245487846]);
							shape.push(shape[0]);
							break;
						case 4:
							shape.push([7.789306640693872, 37.965362445892886]);
							shape.push([10.272216796943212, 39.37204358591702]);
							shape.push([11.854248046942791, 40.16580466505129]);
							shape.push([14.97436523444196, 35.67910301252903]);
							shape.push([14.18334960944217, 33.39882466193688]);
							shape.push([12.249755859442686, 31.37655660183975]);
							shape.push([7.635498046943911, 32.235508686422875]);
							shape.push([7.1740722656940346, 35.99972500836743]);
							shape.push([7.1740722656940346, 36.98889271749028]);
							shape.push(shape[0]);
							break;
						case 5:
							shape.push([-121.57743355234781, 36.90774675657877]);
							shape.push([-134.14579292734447, 39.5989258637319]);
							shape.push([-149.17508980234047, 38.9184007633841]);
							shape.push([-155.67899605233873, 31.907417261688764]);
							shape.push([-160.77665230233737, 21.158299079072098]);
							shape.push([-158.49149605233802, 5.73844145678576]);
							shape.push([-132.4758710523449, -4.004535800951667]);
							shape.push([-107.51493355235154, -3.215095879615485]);
							shape.push([-105.49344917735208, 8.789551962244918]);
							shape.push([-108.3938398023513, 20.830075010845253]);
							shape.push(shape[0]);
							break;
						case 6:
							shape.push([48.14793922675523, -1.9116104366024895]);
							shape.push([56.32176735175301, -2.701978758413907]);
							shape.push([62.298329851751475, -11.243399531191224]);
							shape.push([63.70457985175102, -20.035612980090153]);
							shape.push([62.56200172675136, -26.490548425218773]);
							shape.push([58.1674704767525, -32.5285794780956]);
							shape.push([48.32372047675511, -36.43923805973826]);
							shape.push([35.31590797675864, -34.65156825889153]);
							shape.push([30.833486101759775, -31.034403184127484]);
							shape.push([28.636220476760343, -24.66729907888974]);
							shape.push([28.987782976760286, -16.36263966698696]);
							shape.push(shape[0]);
							break;
					}

					// Create a polygon geometry
					const polygon = {
						type: "polygon", // autocasts as new Polygon()
						rings: shape
					};

					// Create a symbol for rendering the graphic
					const simpleFillSymbol = {
						type: "simple-fill", // autocasts as new SimpleFillSymbol()
						color: [227, 139, 79, 0.0],
						outline: { // autocasts as new SimpleLineSymbol()
							color: [255, 0, 0],
							width: 1
						}
					};

					const polygonGraphic = new Graphic({
						geometry: polygon,
						symbol: simpleFillSymbol
					});
					graphicsLayer.add(polygonGraphic);

				}

			});

		}
		setupData = true;
	}

	// Tells me when toggle buttons change ...
	const onToggleButtonChange = (e, selected) => {
		console.log(e.target.value + " is " + selected + "!");

		let latitude = latitudes[0];
		let longitude = longitudes[0];
		let zoom = 5.5;
		switch (e.target.value) {
			case "Toggle Button 1":
				latitude = latitudes[0];
				longitude = longitudes[0];
				break;
			case "Toggle Button 2":
				latitude = latitudes[1];
				longitude = longitudes[1];
				break;
			case "Toggle Button 3":
				latitude = latitudes[2];
				longitude = longitudes[2];
				break;
			case "Toggle Button 4":
				latitude = latitudes[3];
				longitude = longitudes[3];
				zoom = 8.5;
				break;
			case "Toggle Button 5":
				latitude = latitudes[4];
				longitude = longitudes[4];
				break;
			case "Toggle Button 6":
				latitude = latitudes[5];
				longitude = longitudes[5];
				zoom = 7.5;
				break;
			case "Toggle Button 7":
				latitude = latitudes[6];
				longitude = longitudes[6];
				break;
		}

		view.goTo({ center: [longitude, latitude], zoom: zoom });

		/**
	  axios.get(baseURL).then((response) => {
		  for (var i = 0; i < response.data.length; i++) {
			  var name = response.data[i].name;
			  if (!loadedShips.has(name)) {
				  loadedShips.add(name);
				  var testData =
				  {
					  forecasting: 'Forecasting Data',
					  ship: response.data[i].name,
					  location: response.data[i].latitude + ", " + response.data[i].longitude,
					  routing: 'Routing Data'
				  }
				  testTableData.push(testData);
			  }
			  tableData = testTableData;
			  setTableData(tableData);
		  }
	  });
		**/

		for (var [key, value] of ships.entries()) {
			var name = value.name;
			if (!loadedShips.has(name)) {
				loadedShips.add(name);
				var testData =
				{
					forecasting: 'Forecasting Data',
					ship: value.name,
					location: value.latitude + ", " + value.longitude,
					routing: 'Routing Data'
				}
				testTableData.push(testData);
			}
			tableData = testTableData;
			setTableData(tableData);
		}
	}

	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	const buttonOnClick = (event) => {
		console.log(event)
		var url = "https://www.google.com/imgres?imgurl=https%3A%2F%2Ficatcare.org%2Fapp%2Fuploads%2F2018%2F07%2FThinking-of-getting-a-cat.png&imgrefurl=https%3A%2F%2Ficatcare.org%2Fadvice%2Fthinking-of-getting-a-cat%2F&tbnid=0V922RrJgQc9SM&vet=12ahUKEwjc09LE-qj5AhWCK98KHarTBHwQMygCegUIARDdAQ..i&docid=5qEHfJOysK_DwM&w=1200&h=600&q=cat&ved=2ahUKEwjc09LE-qj5AhWCK98KHarTBHwQMygCegUIARDdAQ";	
		var popupWindow = window.open(url,'','height=300,width=700,left=50,top=50,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes')
	}

	const onViewClick = (event) => {
		console.log(event);
		var screenPoint = {
			x: event.x,
			y: event.y
		}
		view.hitTest(screenPoint).then(function(response) {
			if (response.results.length) {
				for (let i = 0; i < response.results.length; i++) {
					console.log(response.results[i]);	
					console.log(response.results[i].graphic);	
				}
			}
		})
	}
	
	// Retrieves the map and view for "global" use ...
	const handleMapLoad = (esriMap, esriView) => {
		console.log("INITIALIZING MAP ...");
		map = esriMap;
		view = esriView;
		
		view.on("click", onViewClick);
		
		loadModules(["esri/layers/GraphicsLayer"]).then(([GraphicsLayer]) => {
			graphicsLayer = new GraphicsLayer();
		});
	}

	// Defines what happens when you click on the map ...
	const handleMapClick = (evt) => {
		console.log("[" + evt.mapPoint.longitude + ", " + evt.mapPoint.latitude + "]");
	}
	
	return (
		<MapComponent handleMapLoad={handleMapLoad} handleMapClick={handleMapClick} />
	);
	
	/**
	return (
		<div>
			{console.log("Rendering!")}
			<Tabs forceRenderTabPanel={true} >
				<TabList>
					<Tab>Map</Tab>
					<Tab>Tracker</Tab>
					<Tab>WMS</Tab>
					<Tab>Init Data</Tab>
				</TabList>

				<TabPanel>
					<MapComponent handleMapLoad={handleMapLoad} handleMapClick={handleMapClick} />
				</TabPanel>
				<TabPanel>
					<SplitPane split="vertical" minSize="55%">
						<Pane>
							<div>
								<div className="App">
									<div className="placeholder-space">DTG PLACEHOLDER...</div>
									<ToggleButtonGroup>
										<StandaloneToggleButton name="Toggle Button 1" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 2" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 3" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 4" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 5" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 6" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 7" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
									</ToggleButtonGroup>
									<ToggleButtonGroup>
										<StandaloneToggleButton name="Toggle Button 1" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 2" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 3" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 4" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 5" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 6" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
										<StandaloneToggleButton name="Toggle Button 7" onToggleButtonChange={onToggleButtonChange}></StandaloneToggleButton>
									</ToggleButtonGroup>
									<div className="placeholder-space">BREADCRUMB PLACEHODER...</div>
									<Table columns={tableColumns} data={tableData} onRowClickHandler={onRowClickHandler} />
								</div>
							</div>
						</Pane>
						<Pane>
							<div className="placeholder-space">ROLE PLACEHODER</div>
							<div className="centered-space">
								<button className="button" onClick={buttonOnClick}>Button</button>
								<button className="button">Button</button>
								<button className="button">Button</button>
								<button className="button">Button</button>
								<button className="button">Button</button>
								<button className="button">Button</button>
							</div>
							<div className="remainder-space">
								PANEL PLACEHOLDER...
         	   			</div>
						</Pane>
					</SplitPane>
				</TabPanel>
				<TabPanel>
					<WMSComponent/>	
				</TabPanel>
				<TabPanel>
					<button className="button" onClick={initDataButtonOnClick}>Initialize Data</button>
				</TabPanel>
			</Tabs>
		</div>
	);
	**/
}

export default App;