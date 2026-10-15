import type {Route} from "./+types/crag_route.ts";
import {Crag} from "../components/Crag.tsx";

export default function CragRoute({params}: Route.ComponentProps) {

    return <Crag crag_id={params.crag_id!} />;
}