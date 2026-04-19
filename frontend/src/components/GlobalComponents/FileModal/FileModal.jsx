import styles from './FileModal.module.scss';

const FileModal = ({ fileUrl }) => {

  const getFileType = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  const type = getFileType(fileUrl);

  return (
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

      {type === 'image' && (
        <img src={fileUrl} alt="preview" width={400} height={400} />
      )}

      {type === 'pdf' && (
        <iframe src={fileUrl} title="pdf" width={400} height={400} />
      )}

      {type === 'other' && (
        <a href={fileUrl} target="_blank">دانلود فایل</a>
      )}

    </div>
  );
};

export default FileModal;