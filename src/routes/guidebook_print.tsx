import type {Route} from "./+types/guidebook_route.ts";
import {GuidebookPrint} from "../components/GuidebookPrint.tsx";

export default function GuidebookPrintRoute({params}: Route.ComponentProps) {

    return <GuidebookPrint title={params.title!} year={params.year!} />;
}