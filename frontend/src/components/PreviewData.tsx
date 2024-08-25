import React from "react";

interface PreviewDataProps {
  extractedData: Record<string, string | number>;
}

const PreviewData: React.FC<PreviewDataProps> = ({ extractedData }) => {
  return (
    <div className="preview-data">
      <h2>Preview Extracted Data</h2>
      <table>
        <tbody>
          {Object.entries(extractedData).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewData;
