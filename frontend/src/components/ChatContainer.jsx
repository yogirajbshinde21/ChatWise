import React, { useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useEffect } from 'react';
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {

    const { 
        messages, 
        getMessages, 
        isMessagesLoading, 
        selectedUser, 
        subscribeToMessages, 
        unsubscribeFromMessages 
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    

    useEffect(() => {
        getMessages(selectedUser._id)
    }, [selectedUser._id, getMessages]);  //Whenever selectedUser Id changes, get their messages.

    useEffect(() => {
        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser._id, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


     if (isMessagesLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  
    return (
     <div className="flex flex-col flex-1 overflow-auto">
      <ChatHeader />

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message._id}
            ref={index === messages.length - 1 ? messageEndRef : null}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            
          >
            <div className=" chat-image avatar">
              <div className="border rounded-full size-10">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "../assets/avatar.png"
                      : selectedUser.profilePic || "./assets/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="mb-1 chat-header">
              <time className="ml-1 text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="flex flex-col chat-bubble">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer
