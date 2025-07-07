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
        unsubscribeFromMessages,
        users
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    
    // Get the most up-to-date user data from users array
    const getCurrentUser = (userId) => {
        return users.find(user => user._id === userId) || selectedUser;
    };
    

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
     <div className="flex flex-col flex-1 h-full overflow-hidden">
      <ChatHeader />

      <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-base-200/50">
        {messages.map((message, index) => (
          <div
            key={message._id}
            ref={index === messages.length - 1 ? messageEndRef : null}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            
          >
            <div className="chat-image avatar">
              <div className="border rounded-full size-8 sm:size-10">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "../assets/avatar.png"
                      : getCurrentUser(message.senderId).profilePic || "./assets/avatar.png"
                  }
                  alt="profile pic"
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
            </div>
            <div className="mb-1 chat-header">
              <time className="ml-1 text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="flex flex-col max-w-xs sm:max-w-md chat-bubble">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="max-w-[200px] sm:max-w-[280px] max-h-[200px] sm:max-h-[300px] object-cover rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.image, '_blank')}
                />
              )}
              {message.text && <p className="break-words">{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer
