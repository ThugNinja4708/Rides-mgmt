import "./Tag.css"
export const Tag = ({severity, value}) => {
    const getColor = () =>{
        if(severity === "success"){
            return "#c7f8d2";
        }
        if(severity === "info"){
            return "#fff0d9";
        }
        if(severity === "failure")
            return "#ffdfe0"
    }
    return (
        <div>
            <span className="tag" style={{backgroundColor: getColor()}}>{value}</span>
        </div>
    );
}