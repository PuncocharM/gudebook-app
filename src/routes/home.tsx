import {useEffect, useState} from "react";
import {config} from "../config.ts";
import type {PurchasedGuideAPI} from "../api.ts";
import {LoadingSpinner, Panel} from "../components/utilComponents.tsx";
import "../styles/home.scss"
import { NavLink } from "react-router";

export default function Home() {
    const [purchasedGuides, setPurchasedGuides] = useState<PurchasedGuideAPI[]>()

    useEffect(() => {
        fetch(config.ROOT_PATH + 'purchased_guides.json ')
            .then(r => r.json())
            .then((r: PurchasedGuideAPI[]) => {
                setPurchasedGuides(r)
            })
            .catch(e => {
                console.error(e)
            })
    }, [])

    if (purchasedGuides == null) {
        return <div className="container"><Panel><LoadingSpinner /></Panel></div>
    }

    return <div className="container">
        <h1>Guidebooks</h1>
        <div className="container guidebooks">
            <div className="row">
                {purchasedGuides.map(g => <div className="col text-center">
                    <div className="card">
                        <NavLink to={`/guidebook/${g.title}/${g.year}`}>
                        <div className="card-body">
                            <div><img src={config.ROOT_PATH + "images_book_covers/" + g.cover_image.split("/").slice(-1)[0]}  alt="Book cover image"/></div>
                            <div>{g.title}</div>
                            <div>{g.year}</div>
                        </div>
                        </NavLink>
                    </div>
                </div>)}
            </div>
            <div className="row">
                <NavLink to="/all-guidebooks/">Browse crags from all guidebooks</NavLink>
            </div>
        </div>
    </div>
}