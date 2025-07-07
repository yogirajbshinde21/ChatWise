import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { Image, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {

    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.")
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        if (fileInputRef.current) fileInputRef.current.value="";

    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;   // If there is no any image or text,then dont return anything. 
        
        try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
   
    };

  return (
    <div className="p-3 bg-base-100">
      {imagePreview && (
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="object-cover w-16 h-16 border rounded-lg border-base-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300
              flex items-center justify-center border-2 border-base-100"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 text-base bg-base-200 border-none rounded-full input focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-circle btn-ghost
                     ${imagePreview ? "text-emerald-500" : "text-base-content/60"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
