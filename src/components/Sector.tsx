import {useEffect, useState} from "react";
import {LoadingSpinner} from "./utilComponents.tsx";
import {config} from "../config.ts";
import type {ImageAPI, SectorInstance} from "../api.ts";


export function Sector({crag_id, sector_id}: { crag_id: string, sector_id: string }) {
    const [sectorData, setSectorData] = useState<SectorInstance | null>(null);

    useEffect(() => {
        fetch(`${config.ROOT_PATH}sector_instance/${crag_id}_${sector_id}.json`)
            .then(r => r.json())
            .then((r: SectorInstance) => {
                setSectorData(r)
            })
            .catch(e => {
                console.error(e)
            })
    })

    if (sectorData == null) {
        return <LoadingSpinner />
    } else {
        return <div>
            <h4>{sectorData.name}</h4>
            <div className="sector-images">
                {sectorData.images.map((image: ImageAPI) => {
                    const image_file = image.url.split('/').slice(-1)[0];
                    return <div><img src={`${config.ROOT_PATH}images_optimized_topos/${image_file}.jpg`} alt="Topo image" /></div>
                })}
            </div>
            <div className="table-responsive">
                <table className="table table-routes">
                    <tbody>
                    {sectorData.routes.map(r => <tr>
                        <td>{r.number}</td>
                        <td>{r.name}</td>
                        {/*<td>{r.beautiful && <i className="bi bi-star-fill"></i>}</td>*/}
                        <td>{r.pitches.length > 0 && r.pitches[0].name != "L1" && r.pitches[0].name}</td>
                        <td>{r.pitches.length > 0 && r.pitches[0].difficulty_grade}</td>
                        <td>{r.pitches.length > 0 && r.pitches[0].length}m</td>
                        <td>{r.pitches.length > 0 && r.pitches[0].comment}</td>
                        <td>{r.pitches.length > 1 && (<>{r.pitches.slice(1).map((p,i) => <>
                        {i>0 && <br/>}
                            {r.pitches.length > 1 && p.name} {p.difficulty_grade} {p.length}m {p.comment}
                        </>)}</>)}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    }
}