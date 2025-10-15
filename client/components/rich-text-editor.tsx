"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Dynamically import the TinyMCE Editor component
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorContent, setEditorContent] = useState(value);

  useEffect(() => {
    setEditorContent(value);
  }, [value]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    onChange(content);
  };

  // TinyMCE image upload handler
  const handleImageUpload = async (blobInfo: any, progress: any) => {
    return new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      const formData = new FormData();
      formData.append("file", file);

      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast.error("Admin authentication required for image upload.");
        reject("Admin authentication required");
        return;
      }

      fetch("/api/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success && result.url) {
            toast.success("Image uploaded successfully!");
            resolve(result.url);
          } else {
            toast.error(result.error || "Image upload failed.");
            reject(result.error || "Image upload failed.");
          }
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image.");
          reject("Image upload failed");
        });
    });
  };

  return (
    <div className="bg-white rounded-md shadow-sm">
      <Editor
        apiKey="YOUR_TINYMCE_API_KEY" // Replace with your TinyMCE API key
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={editorContent}
        onEditorChange={handleEditorChange}
        init={{
          height: 500,
          menubar: false,
          plugins:
            "advlist autolink lists link image charmap preview anchor " +
            "searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
          toolbar:
            "undo redo | formatselect | bold italic backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | link image | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          images_upload_handler: handleImageUpload,
        }}
      />
    </div>
  );
}
