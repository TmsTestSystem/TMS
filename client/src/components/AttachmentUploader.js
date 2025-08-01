import React, { useState, useEffect } from 'react';

const AttachmentUploader = ({
  testCaseId,
  onAttachmentUploaded,
  onAttachmentDeleted
}) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Загрузка существующих вложений
  useEffect(() => {
    if (testCaseId) {
      loadAttachments();
    }
  }, [testCaseId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attachments/test-case/${testCaseId}`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки вложений:', error);
    } finally {
      setLoading(false);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('Файл слишком большой! Максимальный размер — 10 МБ.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('testCaseId', testCaseId);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newAttachment = await response.json();
        setAttachments(prev => [...prev, newAttachment]);
        setSelectedFile(null);
        setDescription('');
        if (onAttachmentUploaded) {
          onAttachmentUploaded(newAttachment);
        }
      } else {
        console.error('Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId, filename) => {
    try {
      const response = await fetch(`/api/attachments/download/${attachmentId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
    }
  };

  const handlePreview = async (attachment) => {
    setPreviewAttachment(attachment);
    setPreviewLoading(true);
    setPreviewContent('');

    try {
      const response = await fetch(`/api/attachments/download/${attachment.id}`);
      if (response.ok) {
        const blob = await response.blob();
        
        // Для текстовых файлов показываем содержимое
        if (attachment.mime_type.startsWith('text/') || 
            attachment.mime_type.includes('json') || 
            attachment.mime_type.includes('xml') ||
            attachment.mime_type.includes('csv')) {
          const text = await blob.text();
          setPreviewContent(text);
        } else if (attachment.mime_type.startsWith('image/')) {
          // Для изображений создаем URL
          const url = window.URL.createObjectURL(blob);
          setPreviewContent(url);
        } else {
          setPreviewContent('Предварительный просмотр недоступен для этого типа файла');
        }
      }
    } catch (error) {
      console.error('Ошибка предварительного просмотра:', error);
      setPreviewContent('Ошибка загрузки файла для просмотра');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это вложение?')) return;

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
        if (onAttachmentDeleted) {
          onAttachmentDeleted(attachmentId);
        }
      } else {
        console.error('Ошибка удаления файла');
      }
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    if (mimeType.startsWith('text/')) return '📄';
    if (mimeType.includes('json')) return '📋';
    if (mimeType.includes('xml')) return '📋';
    return '📎';
  };

  const canPreview = (mimeType) => {
    return mimeType.startsWith('text/') || 
           mimeType.includes('json') || 
           mimeType.includes('xml') ||
           mimeType.includes('csv') ||
           mimeType.startsWith('image/');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Вложения</h3>
        <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />
          Добавить файл
        </label>
      </div>

      {/* Форма загрузки */}
      {selectedFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{getFileIcon(selectedFile.type)}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание (необязательно)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание файла..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setDescription('');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список вложений */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>Загрузка вложений...</p>
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Основная информация о файле */}
              <div className="flex items-center gap-3 p-4">
                <span className="text-2xl">{getFileIcon(attachment.mime_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{attachment.original_filename}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                  </p>
                  {attachment.description && (
                    <p className="text-sm text-gray-600 mt-1">{attachment.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {canPreview(attachment.mime_type) && (
                    <button
                      onClick={() => handlePreview(attachment)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm border border-blue-200 rounded hover:bg-blue-50"
                      title="Предварительный просмотр"
                    >
                      Просмотр
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(attachment.id, attachment.original_filename)}
                    className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm border border-blue-200 rounded hover:bg-blue-50"
                    title="Скачать файл"
                  >
                    Скачать
                  </button>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="px-3 py-1 text-red-600 hover:text-red-700 text-sm border border-red-200 rounded hover:bg-red-50"
                    title="Удалить файл"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {/* Предварительный просмотр */}
              {previewAttachment?.id === attachment.id && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Предварительный просмотр</h4>
                      <button
                        onClick={() => {
                          setPreviewAttachment(null);
                          setPreviewContent('');
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {previewLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Загрузка для просмотра...</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-auto">
                        {attachment.mime_type.startsWith('image/') ? (
                          <img 
                            src={previewContent} 
                            alt={attachment.original_filename}
                            className="max-w-full h-auto rounded border"
                          />
                        ) : (
                          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto whitespace-pre-wrap">
                            {previewContent}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Вложений пока нет</p>
          <p className="text-sm">Добавьте файлы для этого тест-кейса</p>
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader; 