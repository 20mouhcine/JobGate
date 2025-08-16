import React from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type ResumePreviewProps = {
  fileUrl: string; // e.g. "http://localhost:8000/media/resumes/cv.pdf"
  width?: number; // optional, default 200px
};

export default function ResumePreview({ fileUrl, width = 200 }: ResumePreviewProps) {
  const openInNewTab = () => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        width: `${width}px`,
        cursor: "pointer",
        border: "1px solid #ddd",
        borderRadius: "4px",
        overflow: "hidden",
      }}
      onClick={openInNewTab}
      title="Click to open full resume"
    >
      <Document
        file={fileUrl}
        onLoadError={(err) => console.error("PDF load error:", err)}
      >
        <Page pageNumber={1} width={width} />
      </Document>
    </div>
  );
}
