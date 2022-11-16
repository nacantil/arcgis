import React, { useState, useEffect } from "react";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { loadModules } from 'esri-loader'
import "./App.css";
import {map, view, graphicsLayer} from "./App"

var wmsLayers = [];
let wmsLayer;

export default function WMSComponent() {
	var [layers, setLayers] = useState([]);
	
	// hard-coded ...
	let urls = [
		"https://portal.fnmoc.navy.mil/geoserver/NAVGEM/wms?service=WMS&version=1.3.0&request=GetCapabilities",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/NAVGEM/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
	    "https://ows.terrestris.de/osm/service",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/WW3_GLOBAL/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://portal-alpha.fnmoc.navy.mil/geoserver/imagery/wms?service=WMS&version=1.3.0&request=GetCapabilities",
		"https://portal.fnmoc.navy.mil/geoserver/imagery/wms?SERVICE=WMS&REQUEST=GetCapabilities&version=1.3.0",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/AMBIENT_NOISE?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/COAMPS/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/CBLUG?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/HFBL?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/GDEM-V_3.0.2/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/HYCOM/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/SAFE?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/ACAF?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS"
	];
	
	const onChange = (e) => {
		loadModules(['esri/config', 'esri/layers/WMSLayer']).then(([ESRIConfig, WMSLayer]) => {
			layers = [];
			wmsLayer = new WMSLayer();
			wmsLayer.url = e.value;
			ESRIConfig.request.trustedServers.push(e.value);
			wmsLayer.load().then(() => {
				const names = wmsLayer.allSublayers 
					.filter((sublayer) => !sublayer.sublayers) // Non-grouping layers will not have any "sublayers".
					.map((sublayer) => [sublayer.name]);
				let all = names.join().split(',');
				let length = all.length;
				for (let i = 0; i < length; i++) {
					layers.push(all[i]);
				}
				setLayers(layers);
			});
		});
	}

	const onClick = (e) => {
		console.log(e.target.name);	
		for (let i = 0; i < wmsLayers.length; i++) {
			map.remove(wmsLayers[i]);	
		}
		wmsLayers = [];
		wmsLayer.sublayers = [
		   {
		      name: e.target.name
		   }
		];
		map.add(wmsLayer, 0);
		wmsLayers.push(wmsLayer);
	}
	
	let divStyle = { 
		display: "block",
  		maxHeight: "725px",
  		overflowY: "scroll",	
  		overflowX: "hidden"	
  	}

	let buttonStyle = {
		padding: "15px 15px",
		textAlign: "center",
		textDecoration: "none",
		display: "inline-block",
		fontSize: "13px",
		margin: "4px 2px",
		cursor: "pointer"
	}

	return (
		<div>
			<Dropdown options={urls} onChange={onChange} value="" placeholder="Select an option" />
			<div style={divStyle}>
				{layers.map(item => (<button key={item} style={buttonStyle} name={item} onClick={onClick}>{item}</button>))}
			</div>
		</div>
	);
}