import { axios } from "lib/axios";
import { useEffect, useState } from "react";
export const ProfileImage = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageId, setImageId] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!image) return;
        const formData = new FormData();
        formData.append("file", image);

        try {
            const response = await axios.post("/auth/upload_profile_image", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImageId(response.data.file_id);
            alert("Image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const fetchImage = async () => {
        if (!imageId) return;
        try {
            const response = await axios.get(`/auth/profile_image/${imageId}`, { responseType: "blob" });
            setPreview(URL.createObjectURL(response.data));
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    useEffect(() => {
        if (imageId) {
            fetchImage();
        }
    }, [imageId]);

    return (
        <div>
            <h2>Profile Image</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {/* {preview && <img src={preview} alt="Profile Preview" style={{ width: "200px", height: "200px", marginTop: "10px" }} />} */}
        </div>
    );
}
