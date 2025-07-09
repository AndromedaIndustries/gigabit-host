'use client'

import Link from "next/link"

export default function ErrorPage() {
    return (
        <div>
            <p>Sorry, something went wrong</p>
            <Link className="btn btn-accent" href={"/dashboard"}>Return Home</Link>
        </div>
    )
}