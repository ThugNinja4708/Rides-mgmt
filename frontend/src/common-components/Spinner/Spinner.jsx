import "./spinner.css";
const Spinner = ({ height }) => {
    return (
        <div id="loading-spinner" className="spinner">
            <svg
                className="spinner-svg"
                style={{ height: height }}
                viewBox="0 0 800 800"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    className="spin"
                    cx="400"
                    cy="400"
                    fill="none"
                    r="200"
                    strokeWidth="40"
                    stroke="#000"
                    strokeDasharray="800 1400"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
export default Spinner;