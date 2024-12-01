export const DateComponent = ({date, time}) => {
    return (
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <span>
                <i className="pi pi-calendar" /> {date}
            </span>
            <span>
                <i className="pi pi-clock" /> {time}
            </span>
        </div>
    );
};