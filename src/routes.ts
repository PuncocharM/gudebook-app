import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/guidebook/:title/:year","routes/guidebook_route.tsx", {id: "guidebook"}),
    route("/all-guidebooks","routes/guidebook_route.tsx", {id: "all-guidebooks"}),
    route("/crag/:crag_id","routes/crag_route.tsx"),
    route("/guidebook/:title/:year/print", "routes/guidebook_print.tsx")
] satisfies RouteConfig;
