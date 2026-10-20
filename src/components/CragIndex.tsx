import {Badge, NBSpace} from "./utilComponents.tsx";
import type {HistogramBarAPI, RootCragAPI} from "../api/vs.ts";
import {url_to_id, usePersistentState} from "../utils.ts";
import * as React from "react";
import {NavLink} from "react-router";
import "../styles/cragIndex.scss"

export interface Tag {
    value: string
    label: string
}

export const TAGS: Tag[] = [
    {value: "comfortable_base", label: "Comfortable base"},
    {value: "easy_parking", label: "Easy parking"},
    {value: "family_friendly", label: "Family friendly"},
    {value: "for_beginners", label: "For beginners"},
    {value: "good_bolting", label: "Good bolting"},
    {value: "gorgeous", label: "Gorgeous"},
    {value: "peaceful", label: "Peaceful"},
    {value: "rain", label: "Rain"},
]


interface Column {
    render: (c: RootCragAPI) => React.ReactNode;
    label: string;
    sortFunction?: (a: RootCragAPI, b: RootCragAPI) => number;
    className?: string;
}

export function Histogram({histogram}: { histogram: HistogramBarAPI[] }) {
    const maxCount = Math.max(...histogram.map(h => h.count))
    return <table className="histogram">
        <tbody>
        <tr>{histogram.map(h => {
            const relCount = h.count / maxCount;
            return <td className="histogram-bar-container">
                <div className="histogram-bar-count">{h.count}</div>
                <div className="histogram-bar" style={{height: 50*relCount}}></div>
            </td>
        })}</tr>
        <tr>{histogram.map(h => <td>{h.label}</td>)}</tr>
        </tbody>
    </table>
}

const columns: Column[] = [
    {render: () => "", label: "#", sortFunction: (a,b) => Number(url_to_id(a.url)) - Number(url_to_id(b.url))},
    {render: c => <NavLink to={`/crag/${url_to_id(c.url)}`}>{c.name}</NavLink>, label: "Name", sortFunction: (a,b) => a.name.localeCompare(b.name)},
    {render: c => c.expositions.join(", "), label: "Expositions"},
    {render: c => c.altitude + "m", label: "Altitude", sortFunction: (a,b) => a.altitude - b.altitude},
    {render: c => c.approach_time + " min", label: "Approach Time", sortFunction: (a,b) => a.approach_time - b.approach_time},
    {render: c => <Histogram histogram={c.histogram} />, label: "Grades"},
    {render: c => TAGS.filter(t => c[t.value]).map(t => <Badge>{t.label}</Badge>), label: "Tags", className: "tags"},
]

function CragIndexItem({crag}: { crag: RootCragAPI }) {
    const crag_id = url_to_id(crag.url);

    if (crag.expositions.length == 1 && crag.expositions[0] != crag.exposition) {
        console.error(`Expositions dont match for crag ${crag_id}`)
    }

    return <tr>{columns.map(column => <td className={column.className}>{column.render(crag)}</td>)}</tr>
}

export function CragIndex({crags}: {crags: RootCragAPI[]}) {
    const [sortBy, setSortBy] = usePersistentState<number>('crag-index-sortby', 0)
    const [ascending, setAscending] = usePersistentState<boolean>('crag-index-ascending', true)



    const changeSortBy = (c: number) => {
        if (sortBy == c) {
            setAscending(!ascending);
        } else {
            setSortBy(c)
            setAscending(true)
        }
    }



    let sortedCrags;
    if (sortBy != null) {
        sortedCrags = [...crags].sort((a, b) => columns[sortBy].sortFunction!(a, b))
        if (!ascending) {
            sortedCrags = sortedCrags.reverse();
        }
    } else {
        sortedCrags = crags;
    }

    return <>
        <div className="table-responsive "><table className="table crag-index">
            <thead><tr>{columns.map((c, i) => {
                let label: React.ReactNode = c.label;
                if (c.sortFunction != null) {
                    label = <span className="">{label}</span>
                    if (sortBy == i) {
                        label = <><i className={`bi bi-sort-${ascending ? "up" : "down"}`}></i><NBSpace />{label}</>
                    } else {
                        label = <><i className={`bi bi-sort-up`} style={{visibility: "hidden"}}></i><NBSpace />{label}</>
                    }
                    label = <a className="" onClick={() => changeSortBy(i)}>{label}</a>
                }
                return <th>{label}</th>;
            })}</tr></thead>
            <tbody>{sortedCrags.map((crag: RootCragAPI) => <CragIndexItem key={crag.url} crag={crag} />)}</tbody>
        </table></div>
    </>
}
