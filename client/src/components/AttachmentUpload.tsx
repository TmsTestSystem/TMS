import React from 'react';

interface AttachmentUploadProps {
  testCaseId: string;
  onAttachmentUploaded?: (attachment: any) => void;
  onAttachmentDeleted?: (attachmentId: string) => void;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  testCaseId,
  onAttachmentUploaded,
  onAttachmentDeleted
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Вложения</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Добавить файл
        </button>
      </div>
      <div className="text-center py-8 text-gray-500">
        <p>Функция вложений в разработке</p>
        <p className="text-sm">Test Case ID: {testCaseId}</p>
      </div>
    </div>
  );
};

export default AttachmentUpload; 