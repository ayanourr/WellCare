import { useState } from "react";
import { toast } from "react-toastify";

const useFileHandler = (type = "multiple", initState = []) => {
  const [imageFile, setImageFile] = useState(initState);
  const [isFileLoading, setFileLoading] = useState(false);

  const removeImage = (id) => {
    const items = imageFile.filter((item) => item.id !== id);
    setImageFile(items);
  };

  const clearFiles = () => {
    setImageFile(initState);
  };

  const onFileChange = (event, callback) => {
    if (!event.target.files) return;
    if (event.target.files.length + imageFile.length > 5) {
      return toast.error("Maximum of 5 photos per post allowed.", {
        hideProgressBar: true,
      });
    }

    const regex = /(\.jpg|\.jpeg|\.png|\.webp)$/i;
    setFileLoading(true);

    Array.from(event.target.files).forEach((file) => {
      if (!regex.exec(file.name)) {
        toast.error("File type must be JPEG or PNG", { hideProgressBar: true });
        setFileLoading(false);
        return;
      }

      const url = URL.createObjectURL(file);
      setImageFile((oldFiles) => [...oldFiles, { file, url, id: file.name }]);
    });

    if (callback) callback(imageFile);
    setFileLoading(false);
  };

  return {
    imageFile,
    setImageFile,
    isFileLoading,
    onFileChange,
    removeImage,
    clearFiles,
  };
};

export default useFileHandler;
