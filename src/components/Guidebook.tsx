
import {useEffect, useState} from "react";
import type {RootCragAPI} from "../api/vs.ts";
import {config} from "../config.ts";
import {url_to_id} from "../utils.ts";
import {NavLink} from "react-router";

import {BackHomeButton, LoadingSpinner, Panel} from "./utilComponents.tsx";
import CragMap from "./CragMap.tsx";
import {CragIndex} from "./CragIndex.tsx";
import axios from "axios";

export default function Guidebook({title, year}: {title: string | undefined, year: string | undefined}) {
    const [error, setError] = useState<Error | null>(null);
    const [rootCrags, setRootCrags] = useState<RootCragAPI[]>([]);


    useEffect(() => {
        axios.get<RootCragAPI[]>(config.ROOT_PATH + 'root_data.json')
            .then(r => {
                setRootCrags(r.data
                    .filter(r => r.bought)
                    .filter(r => title == null || (r.guide.title == title && r.guide.year == year))
                    .sort((a,b) => Number(url_to_id(a.url)) - Number(url_to_id(b.url)))
                )
            })
            .catch(e => {
                console.error(e)
                setError(e)
            })
    }, [])

    if (error != null) {
        return <div className="container">
            <section><BackHomeButton /></section>
            <section><Panel><div className="alert alert-danger"><strong>Error:</strong> {error.message}</div></Panel></section>
        </div>
    } else if (rootCrags == null) {
        return <div className="container">
            <section><BackHomeButton /></section>
            <section><Panel><LoadingSpinner /></Panel></section>
        </div>
    } else {
        return <div className="container">
            <section>
                <NavLink to="/"><i className="bi bi-chevron-left"></i> Back to Guidebooks</NavLink>
            </section>
            <section>
                {title == null ? <h1>All crags</h1>: <h1>{title} ({year}) <NavLink className="link-print" to="./print"><i className="bi bi-printer"></i></NavLink></h1>}

                <div className="mb-3">
                    <CragMap crags={rootCrags} guidebookId={title + '-' + year} />
                </div>

                <CragIndex crags={rootCrags}/>
            </section>

        </div>
    }
}