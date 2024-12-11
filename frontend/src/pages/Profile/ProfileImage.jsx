import { axios } from "lib/axios";
import { useEffect, useState } from "react";
import "./profileImage.css";
import useAuth from "hooks/useAuth";
import useError from "hooks/useError";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
import { Button } from "primereact/button";
import Spinner from "common-components/Spinner/Spinner";
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ProfileImage = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState("");
    const { user } = useAuth();
    const { setErrorRef } = useError();
    const [isLoading, setIsLoading] = useState();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPreview(file); // Local preview for new upload
    };

    const handleUpload = async () => {
        setIsLoading(true);
        if (!preview) return;
        const formData = new FormData();
        formData.append("file", preview);

        try {
            const response = await axios.post("/auth/upload_profile_image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            onCancelDialog();
            window.location.reload();
            setIsLoading(false);
        }
    };

    const fetchImage = async () => {
        if (!user || !user.profile_image_id) {
            console.error("User profile image ID is missing.");
            return;
        }

        try {
            const response = await axios.get(`/auth/get_profile_image/${user.profile_image_id}`, {
                responseType: "blob", // Fetch binary data
            });
            const imageUrl = URL.createObjectURL(response.data); // Convert Blob to URL
            setImage(imageUrl); // Set URL for display
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    useEffect(() => {
        if (user) fetchImage();

        return () => {
            // Cleanup Blob URL
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [user]);
    const onCancelDialog = () => {
        setVisible(false);
        setActionPerformed("");
        setPreview(null);
    }
    const actions = {
        uploadImage: {
            header: () => "Profile Picture",
            content: () => (
                isLoading ? <Spinner /> :
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {(image || preview) && <img src={preview ? URL.createObjectURL(preview) : image} alt="Profile" style={{ width: "300px", height: "200px" }} />}
                    </div>),
            footer: () => (
                <div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept={ALLOWED_TYPES.join(',')}
                    />
                    <Button label="Upload" onClick={handleUpload} disabled={!preview} />
                </div>
            )
        }

    }

    return (
        <div className="profile-image-container">
            <div onClick={() => {
                setVisible(true);
                setActionPerformed("uploadImage");
            }}>
                {image ? <img src={image} alt="Profile" style={{ width: "50px", height: "50px" }} /> : (
                    <i className="pi pi-camera" style={{ fontSize: "40px" }}></i>
                )}
            </div>
            <CustomDialog
                header={actions[actionPerformed]?.header()}
                visible={visible}
                onHide={onCancelDialog}
                footer={actions[actionPerformed]?.footer()}
                className={actions[actionPerformed]?.className}
            >
                {actions[actionPerformed]?.content()}
            </CustomDialog>
        </div>
    );
};
