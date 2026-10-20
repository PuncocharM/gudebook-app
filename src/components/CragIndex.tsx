import {Badge, NBSpace} from "./utilComponents.tsx";
import type {HistogramBarAPI, RootCragAPI} from "../api/vs.ts";
import {ceilToStep, normalizeText, url_to_id, usePersistentState} from "../utils.ts";
import * as React from "react";
import {useMemo} from "react";
import {NavLink} from "react-router";
import "../styles/cragIndex.scss"


interface Column {
    render: (c: RootCragAPI) => React.ReactNode;
    label: string;
    sortFunction?: (a: RootCragAPI, b: RootCragAPI) => number;
    className?: string;
}

interface Tag {
    accessor: string
    label: string
}

const Tags: Tag[] = [
    {accessor: "comfortable_base", label: "Comfortable base"},
    {accessor: "easy_parking", label: "Easy parking"},
    {accessor: "family_friendly", label: "Family friendly"},
    {accessor: "for_beginners", label: "For beginners"},
    {accessor: "good_bolting", label: "Good bolting"},
    {accessor: "gorgeous", label: "Gorgeous"},
    {accessor: "peaceful", label: "Peaceful"},
    {accessor: "rain", label: "Rain"},
]

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
    {render: c => Tags.filter(t => c[t.accessor]).map(t => <Badge>{t.label}</Badge>), label: "Tags", className: "tags"},
]

function CragIndexItem({crag}: { crag: RootCragAPI }) {
    const crag_id = url_to_id(crag.url);

    if (crag.expositions.length == 1 && crag.expositions[0] != crag.exposition) {
        console.error(`Expositions dont match for crag ${crag_id}`)
    }

    return <tr>{columns.map(column => <td className={column.className}>{column.render(crag)}</td>)}</tr>
}


// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/** Grades 1a, 1b, 1c, 2a ... 9c. Slider positions are indices into this list. */
const GRADES: string[] = Array.from({length: 9}, (_, i) => ["a", "b", "c"].map(l => `${i + 1}${l}`)).flat()
const MAX_GRADE = GRADES.length - 1

type OpenRange = [number, number | null]

const ALTITUDE_STEP = 50
const APPROACH_STEP = 5
const DEFAULT_OPEN_RANGE: OpenRange = [0, null]
const DEFAULT_GRADE_RANGE: [number, number] = [0, MAX_GRADE]

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]


function gradeIndex(label: string): number | null {
    const m = /^([1-9])([abc])/i.exec(label.trim())
    if (!m) return null
    return (Number(m[1]) - 1) * 3 + "abc".indexOf(m[2].toLowerCase())
}


function FilterField({label, active, onReset, className, children}: {
    label: string
    active: boolean
    onReset: () => void
    className?: string
    children: React.ReactNode
}) {
    return <div className={className}>
        <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-semibold">{label}</span>
            <button type="button" className="btn btn-sm btn-outline-secondary py-0" disabled={!active}
                    onClick={onReset} title={`Reset ${label.toLowerCase()} filter`}>
                <i className="bi bi-x-circle"></i><NBSpace />Reset
            </button>
        </div>
        {children}
    </div>
}

function MultipleChoiceFilter({idPrefix, options, selected, onChange}: {
    idPrefix: string
    options: { value: string, label: string }[]
    selected: string[]
    onChange: (selected: string[]) => void
}) {
    return <div className="d-flex flex-wrap gap-1">
        {options.map((o, i) => {
            const id = `${idPrefix}-${i}`
            const checked = selected.includes(o.value)
            return <React.Fragment key={o.value}>
                <input type="checkbox" className="btn-check" id={id} autoComplete="off" checked={checked}
                       onChange={() => onChange(checked ? selected.filter(v => v !== o.value) : [...selected, o.value])}/>
                <label className="btn btn-sm btn-outline-primary" htmlFor={id}>{o.label}</label>
            </React.Fragment>
        })}
    </div>
}


function RangeFilter({min, max, step, lo, hi, format, onChange}: {
    min: number
    max: number
    step: number
    lo: number
    hi: number | null
    format: (value: number, isUpperEnd: boolean) => string
    onChange: (lo: number, hi: number) => void
}) {
    // Clamp the values to the max of the scale (can happen when retrieving stored values)
    lo = Math.min(lo, max)
    hi = Math.min(hi ?? max, max)

    const span = max - min || 1
    const loFraction = (lo - min) / span
    const hiFraction = (hi - min) / span
    // When both thumbs overlap, keep the one that can still move on top
    const loOnTop = lo > min + span / 2
    return <div>
        <div className="small text-body-secondary">{format(lo, false)} – {format(hi, true)}</div>
        <div className="dual-range">
            <div className="dual-range-track"></div>
            <div className="dual-range-fill" style={{
                left: `calc(.5rem + (100% - 1rem) * ${loFraction})`,
                width: `calc((100% - 1rem) * ${hiFraction - loFraction})`,
            }}></div>
            <input type="range" className="form-range" aria-label="Minimum" min={min} max={max} step={step}
                   value={lo} style={{zIndex: loOnTop ? 2 : 1}}
                   onChange={e => onChange(Math.min(Number(e.target.value), hi), hi)}/>
            <input type="range" className="form-range" aria-label="Maximum" min={min} max={max} step={step}
                   value={hi} style={{zIndex: loOnTop ? 1 : 2}}
                   onChange={e => onChange(lo, Math.max(Number(e.target.value), lo))}/>
        </div>
    </div>
}

function matchesOpenRange(value: number, [lo, hi]: OpenRange): boolean {
    return value >= lo && (hi == null || value <= hi)
}

export function CragIndex({crags}: {crags: RootCragAPI[]}) {
    const [sortBy, setSortBy] = usePersistentState<number>('crag-index-sortby', 0)
    const [ascending, setAscending] = usePersistentState<boolean>('crag-index-ascending', true)

    const [nameFilter, setNameFilter] = usePersistentState<string>('crag-index-filter-name', '')
    const [expositionFilter, setExpositionFilter] = usePersistentState<string[]>('crag-index-filter-expositions', [])
    const [altitudeFilter, setAltitudeFilter] = usePersistentState<OpenRange>('crag-index-filter-altitude', DEFAULT_OPEN_RANGE)
    const [approachFilter, setApproachFilter] = usePersistentState<OpenRange>('crag-index-filter-approach', DEFAULT_OPEN_RANGE)
    const [gradeFilter, setGradeFilter] = usePersistentState<[number, number]>('crag-index-filter-grades', DEFAULT_GRADE_RANGE)
    const [tagFilter, setTagFilter] = usePersistentState<string[]>('crag-index-filter-tags', [])

    function changeSortBy(c: number) {
        if (sortBy == c) {
            setAscending(!ascending);
        } else {
            setSortBy(c)
            setAscending(true)
        }
    }

    const altitudeMax = useMemo(() => ceilToStep(Math.max(0, ...crags.map(c => c.altitude)), ALTITUDE_STEP), [crags])
    const approachMax = useMemo(() => ceilToStep(Math.max(0, ...crags.map(c => c.approach_time)), APPROACH_STEP), [crags])
    const expositionOptions = useMemo(() => {
        const rank = (e: string) => COMPASS.includes(e) ? COMPASS.indexOf(e) : COMPASS.length
        return Array.from(new Set(crags.flatMap(c => c.expositions)))
            .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
            .map(e => ({value: e, label: e}))
    }, [crags])
    const tagOptions = useMemo(() => Tags.map(t => ({value: t.accessor, label: t.label})), [])

    const nameActive = nameFilter.trim() !== ''
    const expositionActive = expositionFilter.length > 0
    const altitudeActive = altitudeFilter[0] > 0 || altitudeFilter[1] != null
    const approachActive = approachFilter[0] > 0 || approachFilter[1] != null
    const gradeActive = gradeFilter[0] > 0 || gradeFilter[1] < MAX_GRADE
    const tagActive = tagFilter.length > 0
    const anyActive = nameActive || expositionActive || altitudeActive || approachActive || gradeActive || tagActive

    const resetAll = () => {
        setNameFilter('')
        setExpositionFilter([])
        setAltitudeFilter(DEFAULT_OPEN_RANGE)
        setApproachFilter(DEFAULT_OPEN_RANGE)
        setGradeFilter(DEFAULT_GRADE_RANGE)
        setTagFilter([])
    }

    const cragMatchesFilters = (c: RootCragAPI) => {
        if (nameActive && !normalizeText(c.name).includes(normalizeText(nameFilter))) return false
        if (expositionActive && !c.expositions.some(e => expositionFilter.includes(e))) return false
        if (altitudeActive && !matchesOpenRange(c.altitude, altitudeFilter)) return false
        if (approachActive && !matchesOpenRange(c.approach_time, approachFilter)) return false
        if (gradeActive && !c.histogram.some(h => {
            const g = gradeIndex(h.label)
            return h.count > 0 && g != null && g >= gradeFilter[0] && g <= gradeFilter[1]
        })) return false
        if (tagActive && !tagFilter.every(t => c[t])) return false

        return true
    }

    const filteredCrags = crags.filter(cragMatchesFilters)

    let sortedCrags;
    if (sortBy != null) {
        sortedCrags = [...filteredCrags].sort((a,b) => columns[sortBy].sortFunction!(a, b))
        if (!ascending) {
            sortedCrags = sortedCrags.reverse();
        }
    } else {
        sortedCrags = filteredCrags;
    }

    return <>
        <div className="card card-body mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Filters</h2>
                <div className="d-flex align-items-center gap-3">
                    <span className="small text-body-secondary">Showing {filteredCrags.length} of {crags.length} crags</span>
                    <button type="button" className="btn btn-sm btn-secondary" disabled={!anyActive} onClick={resetAll}>
                        <i className="bi bi-arrow-counterclockwise"></i><NBSpace />Reset all
                    </button>
                </div>
            </div>
            <div className="row g-3">
                <FilterField className="col-12 col-md-6 col-lg-4" label="Name" active={nameActive} onReset={() => setNameFilter('')}>
                    <input type="search" className="form-control form-control-sm" placeholder="Filter by name"
                           aria-label="Filter by name" value={nameFilter} onChange={e => setNameFilter(e.target.value)}/>
                </FilterField>
                <FilterField className="col-12 col-md-6 col-lg-8" label="Expositions" active={expositionActive} onReset={() => setExpositionFilter([])}>
                    <MultipleChoiceFilter idPrefix="crag-filter-exposition" options={expositionOptions}
                                          selected={expositionFilter} onChange={setExpositionFilter}/>
                </FilterField>
                <FilterField className="col-12 col-md-4" label="Altitude" active={altitudeActive} onReset={() => setAltitudeFilter(DEFAULT_OPEN_RANGE)}>
                    <RangeFilter min={0} max={altitudeMax} step={ALTITUDE_STEP} lo={altitudeFilter[0]} hi={altitudeFilter[1]}
                                 format={(v, upper) => upper && v >= altitudeMax ? "∞" : `${v}m`}
                                 onChange={(lo, hi) => setAltitudeFilter([lo, hi >= altitudeMax ? null : hi])}/>
                </FilterField>
                <FilterField className="col-12 col-md-4" label="Approach time" active={approachActive} onReset={() => setApproachFilter(DEFAULT_OPEN_RANGE)}>
                    <RangeFilter min={0} max={approachMax} step={APPROACH_STEP} lo={approachFilter[0]} hi={approachFilter[1]}
                                 format={(v, upper) => upper && v >= approachMax ? "∞" : `${v} min`}
                                 onChange={(lo, hi) => setApproachFilter([lo, hi >= approachMax ? null : hi])}/>
                </FilterField>
                <FilterField className="col-12 col-md-4" label="Grades" active={gradeActive} onReset={() => setGradeFilter(DEFAULT_GRADE_RANGE)}>
                    <RangeFilter min={0} max={MAX_GRADE} step={1} lo={gradeFilter[0]} hi={gradeFilter[1]}
                                 format={v => GRADES[v]}
                                 onChange={(lo, hi) => setGradeFilter([lo, hi])}/>
                </FilterField>
                <FilterField className="col-12" label="Tags" active={tagActive} onReset={() => setTagFilter([])}>
                    <MultipleChoiceFilter idPrefix="crag-filter-tag" options={tagOptions} selected={tagFilter} onChange={setTagFilter}/>
                </FilterField>
            </div>
        </div>

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
