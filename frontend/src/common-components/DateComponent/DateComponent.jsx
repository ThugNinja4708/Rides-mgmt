export const DateComponent = ({date, time}) => {
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':').map(Number); // Split and parse the time
        const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };
    return (
        <div style={{ display: "flex", gap: "15px", justifyContent:"center" }}>
            <span>
                <i className="pi pi-calendar" /> {date}
            </span>
            <span>
                <i className="pi pi-clock" /> {formatTime(time)}
            </span>
        </div>
    );
};
