// components/BulkImageUploadModal.tsx
import { useState, useCallback } from 'react';
import { Modal, Button, Form, ProgressBar, Alert, ListGroup, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import type { PdfCategory } from '../hooks/usePdfConfig';
import './BulkImageUploadModal.css';

interface BulkImageUploadModalProps {
  show: boolean;
  categories: PdfCategory[];
  onClose: () => void;
  onUploadComplete: () => void;
}

interface FileWithCategory {
  file: File;
  preview: string;
  categoryId: number | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const BulkImageUploadModal = ({ show, categories, onClose, onUploadComplete }: BulkImageUploadModalProps) => {
  const [files, setFiles] = useState<FileWithCategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: FileWithCategory[] = selectedFiles.map((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          file,
          preview: '',
          categoryId: null,
          status: 'error' as const,
          error: 'Nu este imagine',
        };
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return {
          file,
          preview: '',
          categoryId: null,
          status: 'error' as const,
          error: 'Prea mare (max 5MB)',
        };
      }

      // Create preview
      const preview = URL.createObjectURL(file);

      return {
        file,
        preview,
        categoryId: null,
        status: 'pending' as const,
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleCategoryChange = useCallback((index: number, categoryId: number) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, categoryId } : file))
    );
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    // Validate all files have categories
    const filesWithoutCategory = files.filter((f) => f.categoryId === null && f.status !== 'error');
    if (filesWithoutCategory.length > 0) {
      alert('Toate imaginile trebuie să aibă o categorie asignată!');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const validFiles = files.filter((f) => f.status !== 'error' && f.categoryId !== null);
    let completed = 0;

    for (const fileData of validFiles) {
      try {
        // Update status
        setFiles((prev) =>
          prev.map((f) => (f === fileData ? { ...f, status: 'uploading' as const } : f))
        );

        // Upload
        const formData = new FormData();
        formData.append('image', fileData.file);

        await httpClient.post(
          `/api/menu/pdf/builder/upload-category-image/${fileData.categoryId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Success
        setFiles((prev) =>
          prev.map((f) => (f === fileData ? { ...f, status: 'success' as const } : f))
        );
      } catch (err) {
        // Error
        setFiles((prev) =>
          prev.map((f) =>
            f === fileData
              ? {
                  ...f,
                  status: 'error' as const,
                  error: err instanceof Error ? err.message : 'Eroare upload',
                }
              : f
          )
        );
      }

      completed++;
      setUploadProgress((completed / validFiles.length) * 100);
    }

    setUploading(false);
    
    // If all succeeded, close and refresh
    const allSuccess = files.every((f) => f.status === 'success' || f.status === 'error');
    if (allSuccess) {
      setTimeout(() => {
        onUploadComplete();
        handleClose();
      }, 1000);
    }
  }, [files, onUploadComplete]);

  const handleClose = useCallback(() => {
    // Cleanup previews
    files.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
    setUploadProgress(0);
    onClose();
  }, [files, onClose]);

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-images me-2" />
          Upload Imagini în Masă
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* File Input */}
        <Form.Group className="mb-3">
          <Form.Label>Selectează Imagini (max 10)</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <Form.Text className="text-muted">
            Formate acceptate: JPEG, PNG, WebP. Dimensiune maximă: 5MB per imagine.
          </Form.Text>
        </Form.Group>

        {/* Stats */}
        {files.length > 0 && (
          <div className="mb-3 d-flex gap-2">
            <Badge bg="secondary">{files.length} total</Badge>
            {pendingCount > 0 && <Badge bg="warning">{pendingCount} în așteptare</Badge>}
            {successCount > 0 && <Badge bg="success">{successCount} încărcate</Badge>}
            {errorCount > 0 && <Badge bg="danger">{errorCount} erori</Badge>}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <ProgressBar 
            now={uploadProgress} 
            label={`${Math.round(uploadProgress)}%`}
            className="mb-3"
            animated
          />
        )}

        {/* Files List */}
        {files.length > 0 ? (
          <ListGroup className="bulk-upload-list">
            {files.map((fileData, index) => (
              <ListGroup.Item
                key={index}
                className={`d-flex align-items-center gap-3 ${fileData.status}`}
              >
                {/* Preview */}
                <div className="preview-container">
                  {fileData.preview ? (
                    <img src={fileData.preview} alt={fileData.file.name} className="preview-image" />
                  ) : (
                    <div className="preview-placeholder">
                      <i className="fas fa-image" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-grow-1">
                  <div className="fw-bold">{fileData.file.name}</div>
                  <div className="text-muted small">
                    {(fileData.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>

                {/* Category Selector */}
                <Form.Select
                  value={fileData.categoryId || ''}
                  onChange={(e) => handleCategoryChange(index, parseInt(e.target.value))}
                  disabled={uploading || fileData.status === 'success' || fileData.status === 'error'}
                  style={{ width: '200px' }}
                >
                  <option value="">Selectează categorie...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </Form.Select>

                {/* Status Icon */}
                <div className="status-icon">
                  {fileData.status === 'pending' && (
                    <i className="fas fa-clock text-secondary" />
                  )}
                  {fileData.status === 'uploading' && (
                    <i className="fas fa-spinner fa-spin text-primary" />
                  )}
                  {fileData.status === 'success' && (
                    <i className="fas fa-check-circle text-success" />
                  )}
                  {fileData.status === 'error' && (
                    <i className="fas fa-exclamation-circle text-danger" title={fileData.error} />
                  )}
                </div>

                {/* Remove Button */}
                {!uploading && fileData.status !== 'success' && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <i className="fas fa-times" />
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info">
            <i className="fas fa-info-circle me-2" />
            Nicio imagine selectată. Folosește butonul de mai sus pentru a selecta imagini.
          </Alert>
        )}

        {/* Error Messages */}
        {errorCount > 0 && (
          <Alert variant="danger" className="mt-3">
            <strong>Atenție:</strong> {errorCount} imagini nu au putut fi încărcate.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Închide
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || pendingCount === 0}
        >
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin me-2" />
              Se încarcă...
            </>
          ) : (
            <>
              <i className="fas fa-upload me-2" />
              Încarcă {files.length} imagini
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
