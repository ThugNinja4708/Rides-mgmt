import { Dialog } from "primereact/dialog"
import "./CustomDialog.css"
export const CustomDialog = ({visible, onHide, header, footer, ...props}) => {
    return (
        <Dialog
            header={header}
            visible={visible}
            onHide={onHide}
            footer={footer}
            {...props}
            className="custom-dialog"
            style={{width: "40rem"}}
        >
            {props.children}
        </Dialog>
    )
}