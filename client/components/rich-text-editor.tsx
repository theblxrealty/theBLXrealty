"use client";

import React, { useState, useRef, useEffect } from "react";
// import { Editor } from "@tinymce/tinymce-react"; // Remove direct import
import { toast } from "sonner";

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
  const [isClient, setIsClient] = useState(false); // New state to track client-side rendering
  const [TinyMCEEditor, setTinyMCEEditor] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Conditionally import Editor on the client side
    import("@tinymce/tinymce-react").then((mod) => {
      setTinyMCEEditor(() => mod.Editor);
    }).catch(error => {
      console.error("Failed to load TinyMCE Editor:", error);
      toast.error("Failed to load rich text editor.");
    });
  }, []);

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

  if (!isClient || !TinyMCEEditor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div className="bg-white rounded-md shadow-sm">
      <TinyMCEEditor
        apiKey="toi4j2xa3a67z9t9p73wij2hklpbv2v4ult92rrzhv12cv00" // Replace with your TinyMCE API key
        onInit={(evt: any, editor: any) => (editorRef.current = editor)}
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
