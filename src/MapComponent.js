import { Map } from "@esri/react-arcgis";
import { loadModules, setDefaultOptions } from 'esri-loader'
import WMSComponent from "./WMSComponent";

import "./styles.css";

//8dda0e7b5e2d4fafa80132d59122268c //Streets (WGS84)
//4c2b44abaa4841d08c938f4bbb548561 //Imagery Hybrid (WGS84) 

export default function MapComponent({handleMapLoad, handleMapClick}) 
{
	let divStyle = {
		display: "flex"
	}

	let mapDivStyle = {
		height: "800px",
 	 	width: "1500px"
	} 

	let wmsDivStyle = {
		height: "800px",
		width: "420px"
	} 

	return (
		<div style = {divStyle}>
			<div style={mapDivStyle}>
        		<Map
          			mapProperties={{ 
              			basemap: {
    		      			portalItem: {
      			    			id: "4c2b44abaa4841d08c938f4bbb548561" //Streets (WGS84)
    		      			}
              			}	 
          			}}
          			viewProperties={{ center: [-90, 38], spatialReference: {wkid:4326} }} //NPA
          			loaderOptions={{ version: "4.13", css: true }}
          			onLoad={handleMapLoad}
          			onClick={handleMapClick}
                />
           	</div>
            <div style={wmsDivStyle}>
		       <WMSComponent/>	
	        </div>
       </div>
  )
}