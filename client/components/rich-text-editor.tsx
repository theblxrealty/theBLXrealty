"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
// @ts-ignore
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // @ts-ignore
    await import("react-quill/dist/quill.snow.css");
    return RQ;
  },
  { ssr: false }
);
import { toast } from "sonner";
import Image from "next/image"; // For preview purposes if needed

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
  const quillRef = useRef<ReactQuill>(null);
  const [editorContent, setEditorContent] = useState(value);

  useEffect(() => {
    setEditorContent(value);
  }, [value]);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const adminToken = localStorage.getItem("adminToken");
          if (!adminToken) {
            toast.error("Admin authentication required for image upload.");
            return;
          }

          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
            body: formData,
          });

          const result = await response.json();

          if (response.ok && result.success) {
            const range = quillRef.current?.getEditor().getSelection(true);
            const quill = quillRef.current?.getEditor();
            if (quill && range) {
              quill.insertEmbed(range.index, "image", result.url);
              quill.setSelection(range.index + 1);
            }
            toast.success("Image uploaded successfully!");
          } else {
            toast.error(result.error || "Image upload failed.");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image.");
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false, // This will ensure that formatting is maintained when pasting
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className="bg-white rounded-md shadow-sm">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorContent}
        onChange={(content) => {
          setEditorContent(content);
          onChange(content);
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-72" // Adjust height as needed
      />
    </div>
  );
}
