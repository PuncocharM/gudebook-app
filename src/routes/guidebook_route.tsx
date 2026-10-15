import type {Route} from "./+types/guidebook_route.ts";
import Guidebook from "../components/Guidebook.tsx";

export default function CragRoute({params}: Route.ComponentProps) {

    return <Guidebook title={params.title} year={params.year} />;
}