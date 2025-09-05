
export async function UsageBar({ value, max, additionalCSS }: { value: number, max: number, additionalCSS?: string }) {
    var cssTags = "progress"

    if (value > 70) {
        cssTags = cssTags + " progress-warning"
    } else if (value > 90) {
        cssTags = cssTags + " progress-error"
    } else {
        cssTags = cssTags + " progress-success"
    }


    return (
        <div className={"flex flex-col place-content-center" + additionalCSS}>
            <div>{value}%</div>
            <progress className={cssTags} value={value} max={max} />

        </div>
    )
}