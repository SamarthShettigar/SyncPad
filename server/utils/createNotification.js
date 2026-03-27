const Notification = require("../models/Notification");

const createNotification = async ({
  user,
  recipient,
  sender = null,
  note = null,
  type,
  message,
}) => {
  try {
    const targetUser = user || recipient;

    if (!targetUser || !type || !message) {
      return null;
    }

    const notification = await Notification.create({
      user: targetUser,
      sender,
      note,
      type,
      message,
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error.message);
    return null;
  }
};

module.exports = createNotification;
