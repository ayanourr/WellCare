// SidebarConfig.js
import React from "react";
import {
  AiFillMessage,
  AiFillNotification,
  AiOutlineMessage,
  AiOutlineNotification,
} from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { GoHomeFill } from "react-icons/go";
import { IoCreateOutline } from "react-icons/io5";
import { LuHome } from "react-icons/lu";
import "./Sidebar.css";

const SidebarConfig = ({
  activeTab,
  handleTabClick,
  unreadNotificationCount,
  unreadMessageCount,
}) => {
  return (
    <div>
      {mainu.map((item, index) => (
        <div
          key={index}
          onClick={() => handleTabClick(item.title)}
          className={`tab-item ${activeTab === item.title ? "active" : ""}`}
        >
          {item.title === "Message" && (
            <div className="relative">
              {activeTab === item.title ? (
                <AiFillMessage className="text-3xl mr-5" />
              ) : (
                <AiOutlineMessage className="text-3xl mr-5" />
              )}
              {unreadMessageCount > 0 && (
                <span className="unread-badge">{unreadMessageCount}</span>
              )}
            </div>
          )}
          {item.title === "Notification" && (
            <div className="relative">
              {activeTab === item.title ? (
                <AiFillNotification className="text-3xl mr-5" />
              ) : (
                <AiOutlineNotification className="text-3xl mr-5" />
              )}
              {unreadNotificationCount > 0 && (
                <span className="unread-badge">{unreadNotificationCount}</span>
              )}
            </div>
          )}
          {item.title !== "Message" && item.title !== "Notification" && (
            <React.Fragment>
              {activeTab === item.title ? item.activeIcon : item.icon}
            </React.Fragment>
          )}
          {activeTab !== "Search" && (
            <p
              className={`${
                activeTab === item.title ? "font-bold" : "font-semibold"
              }`}
            >
              {item.title}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export const mainu = [
  {
    title: "Home",
    icon: <LuHome className="text-3xl mr-5" />,
    activeIcon: <GoHomeFill className="text-3xl mr-5" />,
  },
  {
    title: "Message",
    icon: <AiOutlineMessage className="text-3xl mr-5" />,
    activeIcon: <AiFillMessage className="text-3xl mr-5" />,
  },
  {
    title: "Notification",
    icon: <AiOutlineNotification className="text-3xl mr-5" />,
    activeIcon: <AiFillNotification className="text-3xl mr-5" />,
  },
  {
    title: "New Post",
    icon: <IoCreateOutline className="text-3xl mr-5" />,
    activeIcon: <IoCreateOutline className="text-3xl mr-5" />,
  },
  {
    title: "Profile",
    icon: <CgProfile className="text-3xl mr-5" />,
    activeIcon: <CgProfile className="text-3xl mr-5" />,
  },
];

export default SidebarConfig;
