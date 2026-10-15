import {useEffect, useState} from "react";
import type {RootCragAPI} from "../api.ts";
import axios from "axios";
import {config} from "../config.ts";
import {url_to_id} from "../utils.ts";
import {Crag} from "./Crag.tsx";
import {BackHomeButton} from "./utilComponents.tsx";

export function GuidebookPrint({title, year}: {title: string, year: string}) {
    const [error, setError] = useState<Error | null>(null);
    const [rootCrags, setRootCrags] = useState<RootCragAPI[]>([]);


    useEffect(() => {
        axios.get<RootCragAPI[]>(config.ROOT_PATH + 'root_data.json')
            .then(r => {
                setRootCrags(r.data
                    .filter(r => r.bought)
                    .filter(r =>  r.guide.title == title && r.guide.year == year)
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
            <section><div className="alert alert-danger"><strong>Error: </strong>{error.message}</div></section>
        </div>
    }

    return <div className="container">
        <section>
            <h1>{title} ({year})</h1>
            {/*<div className="table-responsive">*/}
            {/*    <CragIndex crags={rootCrags}/>*/}
            {/*</div>*/}
        </section>
        <section>
            {rootCrags.map(crag => <Crag crag_id={url_to_id(crag.url)} print_mode={true} />)}
        </section>
    </div>
}