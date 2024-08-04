import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const sendNotification = async (
  receiverId,
  receiverUsername,
  message,
  senderName,
  senderImage,
  sourceData,
  type
) => {
  try {
    // Add document to Firestore collection
    const docRef = await addDoc(collection(db, "notifications"), {
      text: message,
      createdAt: serverTimestamp(),
      uid: receiverId,
      senderName: senderName,
      senderImage: senderImage,
      receiverUsername: receiverUsername,
      read: false,
      sourceData: sourceData,
      Type: type,
    });

    console.log("Notification sent with sourceData:", sourceData);

    // Return the document ID of the created notification
    return docRef.id;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error; // Re-throw the error to handle it in the caller function
  }
};

export default sendNotification;
