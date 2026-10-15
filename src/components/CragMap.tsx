import type {RootCragAPI} from "../api.ts";
import {MapContainer, Marker, Popup, TileLayer, useMapEvents} from "react-leaflet";
import {url_to_id, usePersistentState} from "../utils.ts";
import {NavLink} from "react-router";
import {Histogram} from "./CragIndex.tsx";
import L, {LatLng} from 'leaflet'
import "leaflet/dist/leaflet.css"
import "../styles/cragMap.scss"

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 40],
    popupAnchor: [0, -40],
});


function CustomMapControl({setZoom, setCenter}: { setZoom: (x: number) => void, setCenter: (x: LatLng) => void }) {

    const mapEvents = useMapEvents({
        zoomend: () => setZoom(mapEvents.getZoom()),
        moveend: () => setCenter(mapEvents.getCenter())
    })


    return null;
}

function CragMap({crags, guidebookId}: { crags: RootCragAPI[], guidebookId: string }) {
    const [zoom, setZoom] = usePersistentState(`map-zoom-${guidebookId}`, 13)
    const [center, setCenter] = usePersistentState<LatLng>(`map-center-${guidebookId}`, new LatLng(46.0681789, 11.1223475))

    return (
        <MapContainer style={{height: "400px"}} center={center} zoom={zoom} scrollWheelZoom={true}>
            <CustomMapControl setZoom={setZoom} setCenter={setCenter}/>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {crags.map(c =>
                <Marker title={c.name} position={[c.latitude, c.longitude]}>
                    {/*<Tooltip direction="right" offset={[12, -20]} opacity={1} permanent>{c.name}</Tooltip>*/}
                    <Popup>
                        <div className="text-center">
                            <div><NavLink to={`/crag/${url_to_id(c.url)}`}>{c.name}</NavLink></div>
                            <div>{c.expositions.join(", ")} | {c.altitude}m | {c.approach_time} min</div>
                            <div><Histogram histogram={c.histogram}/></div>
                        </div>
                    </Popup>
                </Marker>)}
        </MapContainer>);
}

export default CragMap