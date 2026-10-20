import {useEffect, useState} from "react";
import {config} from "../config.ts";
import {BackHomeButton, Badge, LoadingSpinner, NBSpace, Panel} from "./utilComponents.tsx";
import {Sector} from "./Sector.tsx";
import type {ApproachAPI, CragAPI, SectorAPI} from "../api/vs.ts";
import {NavLink} from "react-router";
import "../styles/crag.scss"
import axios from "axios";
import {Histogram} from "./CragIndex.tsx";
import ImageGallery, {type GalleryItem} from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";
import {A8SearchCrag} from "./a8Search.tsx";


interface Sectors {
    sectors: SectorAPI[]
}

export function Crag({crag_id, print_mode=false}: { crag_id: string, print_mode?: boolean }) {
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
                setError(e);
            })
    }, []);

    if (error != null) {
        return <div className="container">
            <section><BackHomeButton /></section>
            <section><Panel>
                <div className="alert alert-danger"><strong>Error loading crag data:</strong> {error.name} / {error.message}</div>
            </Panel></section>
        </div>
    } else  if (!loaded) {
        return <div className="container">
            <section><BackHomeButton /></section>
            <section><Panel><LoadingSpinner /></Panel></section>
        </div>
    } else {
        const cragImages: GalleryItem[] = []
        if (cragData.cover_image != null && cragData.images?.every(i => i.url != cragData.cover_image)) {
            cragImages.push({'original': cragData.cover_image, });
        }
        if (cragData.images != null) {
            cragData.images.forEach(i => cragImages.push({'original': i.url, 'thumbnail': i.thumbnail_url}))
        }


        return <div className="container">
            {!print_mode &&
            <section>
                <NavLink to={`/guidebook/${cragData.guide.title}/${cragData.guide.year}`}><i className="bi bi-chevron-left"></i> Back to {cragData.guide.title} ({cragData.guide.year})</NavLink>
            </section>
            }
            <section>
                <a id={`crag-${crag_id}`}></a>
                <h3>{cragData.name}</h3>
                <div className="crag-characteristics">
                    <div>
                        {cragData.cover_characteristics?.map(c => <Badge>{c.name}: {c.value}</Badge>)}
                    </div>
                    <div>
                        {cragData.characteristics?.map(c => <Badge>{c}</Badge>)}
                    </div>
                    <div className="mt-1 bg-dark-subtle p-2 d-inline-block rounded-2">
                        <Histogram histogram={cragData.histogram} />
                    </div>
                    <div className="row">
                        <div className="col-1">
                        <A8SearchCrag cragName={cragData.name} />
                        </div>
                    </div>
                </div>
                <div>
                    {cragImages && <ImageGallery
                        items={cragImages}
                        showThumbnails={false}
                        showPlayButton={false}
                    />}
                </div>
                <p className="description"><strong>Description: </strong>{cragData.description}</p>
                {approachData.parking_latitude && approachData.parking_longitude &&
                    <p className="parking">
                        <strong>Parking: </strong>
                        <a href={`geo:${approachData.parking_latitude},${approachData.parking_longitude}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-p-square" viewBox="0 0 16 16"><path d="M5.5 4.002h2.962C10.045 4.002 11 5.104 11 6.586c0 1.494-.967 2.578-2.55 2.578H6.784V12H5.5zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z"/><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/></svg>
                        </a>
                        <NBSpace />
                        <a target="_blank"
                           href={`https://mapy.com/fnc/v1/showmap?center=${approachData.parking_longitude},${approachData.parking_latitude}&marker=true`}><img
                            className="h-100 mh-100"
                            src="https://mapy.com/img/favicon/common/plain/favicon-32x32.png" alt="Mapy.cz"/></a>
                        <NBSpace />
                        <a target="_blank"
                           href={`https://maps.google.com/?q=${approachData.parking_latitude},${approachData.parking_longitude}&marker=true`}><img
                            src="https://www.google.com/images/branding/product/ico/web_maps_icon_32dp.ico" alt="Google maps" /></a>
                    </p>
                }
                <p className="approach">
                    <strong>Approach: </strong>
                    {approachData.description} ({approachData.time} min)
                </p>
                {approachData.image &&
                <div className="approach-image">
                    <img src={`${config.ROOT_PATH}images_optimized_approaches/${approachData.image.split('/').slice(-1)[0]}.jpg`} alt="Approach image" />
                </div>}
                {sectorsData.sectors.map(sector => <Sector cragId={crag_id} sectorId={sector.url.split('/').slice(-2)[0]} cragName={cragData.name} />)}
            </section>
        </div>
    }

}