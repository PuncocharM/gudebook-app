import {
    Links,
    Meta,
    Scripts,
    ScrollRestoration,
} from "react-router";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>Versante sud guidebooks</title>
            <Links/>
            <link rel="manifest" href="/manifest.json"/>
            <Meta/>
        </head>
        <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    )
}