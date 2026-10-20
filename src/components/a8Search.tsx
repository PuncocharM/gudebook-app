import {type A8SearchItem, type A8SearchResults} from "../api/a8.ts";
import axios from "axios";
import React, {useRef, useState} from "react";
import {Popup} from 'reactjs-popup';
import {LoadingSpinner} from "./utilComponents.tsx";
import type {PopupActions, PopupPosition} from "reactjs-popup/dist/types";

enum A8SearchType {
    CRAG = 1,
    ROUTE = 3,
}


function A8Search({text, type, renderItem, popupPosition}: {
    text: string,
    type: A8SearchType,
    renderItem: (item: A8SearchItem) => React.ReactElement,
    popupPosition?: PopupPosition,
}){
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
                {params: {query: text}}
            )
                .then(res => {
                    setSearchResults(res.data.items.filter(v => v.type == type));
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
                // <div className="table-responsive">
                    <table className="table table-light table-striped mb-0">
                        <tbody>
                            {searchResults.map(renderItem)}
                        </tbody>
                    </table>
                // </div>
            )
        }
    }



    return (
        <div className="row align-items-center m-0 p-0">
            <Popup
                trigger={<div className="col p-0 m-0" style={{height: 32, }}></div>}
                position={popupPosition}
                arrow={false}
                ref={refLoading}
            >
                <div className="bg-dark-subtle rounded-3 p-2">
                    <LoadingSpinner/>
                </div>
            </Popup>
            <Popup
                trigger={<div className="col p-0 m-0" style={{height: 32,}}></div>}
                position={popupPosition}
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
        </div>
    )
}

export function A8SearchRoute({routeName, cragName}: {
    routeName: string,
    cragName: string
}) {
    const renderItem = (item: A8SearchItem) => {
        return (
            <tr>
                <td><a target="_blank" href={`https://www.8a.nu/crags/sportclimbing/${item.countrySlug}/${item.cragSlug}/sectors/${item.sectorSlug}/routes/${item.zlaggableSlug}`}>{item.zlaggableName}</a></td>
                <td>{item.difficulty}</td>
                <td>{item.cragName} / {item.sectorName}</td>
                <td>{item.totalAscents} Ascents</td>
                <td>{item.averageRating.toFixed(2)} Rating</td>
            </tr>
        )
    }

    return <A8Search
        text={routeName + " " + cragName}
        type={A8SearchType.ROUTE}
        renderItem={renderItem}
        popupPosition="left center"
    />
}

export function A8SearchCrag({cragName}: {cragName: string}) {
    const renderItem = (item: A8SearchItem) => {
        return (
            <tr>
                <td><a target="_blank" href={`https://www.8a.nu/crags/sportclimbing/${item.countrySlug}/${item.cragSlug}/routes`}>{item.cragName}</a></td>
                <td>{item.totalZlaggables} Routes</td>
                <td>{item.totalAscents} Ascents</td>
                <td>{item.averageRating.toFixed(2)} Rating</td>
            </tr>
        )
    }

    return <A8Search
        text={cragName}
        type={A8SearchType.CRAG}
        renderItem={renderItem}
        popupPosition="right center"
    />
}