import { Dialog } from "primereact/dialog"
import "./CustomDialog.css"
export const CustomDialog = ({visible, onHide, header, footer, className, ...props}) => {
    return (
        <Dialog
            header={header}
            visible={visible}
            onHide={onHide}
            footer={footer}
            {...props}
            className={`custom-dialog ${className}`}
        >
            {props.children}
        </Dialog>
    )
}