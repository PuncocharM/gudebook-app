import {type A8SearchItem, type A8SearchResults} from "../api/a8.ts";
import axios from "axios";
import {useRef, useState} from "react";
import {Popup} from 'reactjs-popup';
import {LoadingSpinner} from "./utilComponents.tsx";
import type {PopupActions} from "reactjs-popup/dist/types";


export function A8Search({routeName, cragName}: {
    routeName: string,
    cragName: string
}) {
    const [searchResults, setSearchResults] = useState<A8SearchItem[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const refLoading = useRef<PopupActions | null>(null);
    const refResults = useRef<PopupActions | null>(null);


    const searchOn8a = () => {
        if (searchResults == null && !loading) {
            setLoading(true);
            refLoading.current!.open()
            axios.get<A8SearchResults>(
                "https://www.8a.nu/api/unification/collection/v1/web/search",
                {params: {query: routeName + " " + cragName}}
            )
                .then(res => {
                    setSearchResults(res.data.items.filter(v => v.type == 3)); // filter for route results (type 3)
                })
                .catch((e) => setError(e))
                .finally(() => {
                    setLoading(false);
                    refLoading.current!.close()
                    refResults.current!.open()
                })
        } else {
            refLoading.current!.close()
            refResults.current!.open()
        }
    }

    const popupInner = () => {
        if (error) {
            return <div className="alert alert-danger"><strong>Error: </strong>{error.message}</div>
        } else if (loading || searchResults == null) {
            return <LoadingSpinner/>
        } else if (searchResults.length == 0) {
            return <div className="alert alert-warning">No results</div>
        } else {
            return (
                <div className="table-responsive">
                <table className="table table-light table-striped mb-0">
                    <tbody>
                    {searchResults
                        .map(item =>
                            <tr>
                                <td><a target="_blank" href={`https://www.8a.nu/crags/sportclimbing/${item.countrySlug}/${item.cragSlug}/sectors/${item.sectorSlug}/routes/${item.zlaggableSlug}`}>{item.zlaggableName}</a></td>
                                <td>{item.difficulty}</td>
                                <td>{item.cragName} / {item.sectorName}</td>
                                <td>{item.totalAscents} Ascents</td>
                                <td>{item.averageRating.toFixed(2)} Rating</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            )
        }
    }



    return (<div className="row align-items-center m-0 p-0">
        <Popup
            trigger={<div className="col p-0 m-0" style={{height: 32, }}></div>}
            position="left center"
            arrow={false}
            ref={refLoading}
        >
            <div className="bg-dark-subtle rounded-3 p-2">
                <LoadingSpinner/>
            </div>
        </Popup>
        <Popup
            trigger={<div className="col p-0 m-0" style={{height: 32,}}></div>}
            position="left center"
            arrow={false}
            ref={refResults}
        >
            <div className="bg-dark-subtle rounded-3 p-2">
            {popupInner()}
            </div>
        </Popup>
        <div className="col p-0 m-0">
            <button onClick={searchOn8a} className="btn btn-link d-inline-block h-100 p-0 m-0"><img width={32} height={32} src="https://www.8a.nu/favicon.png" alt="Search on 8a.nu"/></button>
        </div>
    </div>)
}