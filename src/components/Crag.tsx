import {useEffect, useState} from "react";
import {config} from "../config.ts";
import {LoadingSpinner, Panel} from "./utilComponents.tsx";
import {Sector} from "./Sector.tsx";
import type {ApproachAPI, CragAPI, SectorAPI} from "../api.ts";
import {NavLink} from "react-router";
import "../styles/crag.scss"
import axios from "axios";



interface Sectors {
    sectors: SectorAPI[]
}

export function Crag({crag_id}: { crag_id: string }) {
    const [cragData, setCragData] = useState<CragAPI | null>(null);
    const [approachData, setApproachData] = useState<ApproachAPI | null>(null);
    const [sectorsData, setSectorsData] = useState<Sectors | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const loaded = cragData != null && approachData != null && sectorsData != null;

    useEffect(() => {
        axios.get<CragAPI>(`${config.ROOT_PATH}crags/${crag_id}.json`)
            .then(r => {
                setCragData(r.data)
            })
            .catch(e => {
                console.error(e);
                setError(e)
            })

        axios.get<ApproachAPI>(`${config.ROOT_PATH}approaches/${crag_id}.json`)
            .then(r => {
                setApproachData(r.data)
            })
            .catch(e => {
                console.error(e);
                setError(e)
            })

        axios.get<Sectors>(`${config.ROOT_PATH}sectors/${crag_id}.json`)
            .then(r => {
                setSectorsData(r.data)
            })
            .catch(e => {
                console.error(e);
                console.error(e);
                setError(e);
            })
    }, []);

    if (error != null) {
        return <div className="container"><section><Panel><p><strong>Error:</strong> {error.message}</p></Panel></section></div>
    } else  if (!loaded) {
        return <div className="container"><section><Panel><LoadingSpinner /></Panel></section></div>
    } else {
        return <div className="container">
            <section>
                <NavLink to={`/guidebook/${cragData.guide.title}/${cragData.guide.year}`}><i className="bi bi-chevron-left"></i> Back to {cragData.guide.title} ({cragData.guide.year})</NavLink>
            </section>
            <section>
                <a id={`crag-${crag_id}`}></a>
                <h3>{cragData.name}</h3>
                <div className="crag-images">
                    {(cragData.cover_image != null && cragData.images?.every(i => i.url != cragData.cover_image)) && <img src={cragData.cover_image}/>}
                    {(cragData.images != null) && cragData.images.map(i => <img src={i.thumbnail_url}/>)}
                </div>
                <p className="description"><strong>Description: </strong>{cragData.description}</p>
                <p className="approach"><strong>Approach: </strong>{approachData.description} ({approachData.time} min)</p>
                {approachData.image &&
                <div className="approach-image">
                    <img src={`${config.ROOT_PATH}images_optimized_approaches/${approachData.image.split('/').slice(-1)[0]}.jpg`} alt="Approach image" />
                </div>}
                {sectorsData.sectors.map(sector => <Sector crag_id={crag_id} sector_id={sector.url.split('/').slice(-2)[0]} />)}
            </section>
        </div>
    }

}