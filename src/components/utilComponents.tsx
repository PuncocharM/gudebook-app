import type {ReactNode} from "react";
import {useNavigate} from "react-router";

export function Panel({children, header, className, ...other_props}: { children?: React.ReactNode, header?: React.ReactNode, className?: string; [other_props: string]: any }) {
    return <div className={"card" + (className != null ? " "+className : "")} {...other_props}>
        {header != null && <div className="card-header">{header}</div>}
        <div className='card-body'>{children}</div>
    </div>
}

export function LoadingSpinner() {
    return <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>;
}

export function Badge(props: { children: ReactNode }) {
    return <><span className="badge text-bg-secondary">{props.children}</span> </>
}

export function NBSpace() {
    return <span className="nbspace">&nbsp;</span>
}

export function BackHomeButton() {
    const navigate = useNavigate();
    return <button onClick={() => navigate("/")}>← Back to home page</button>;
}