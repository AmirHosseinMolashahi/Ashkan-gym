import React, {useState, useRef} from 'react'
import styles from './Fileupload.module.scss'
import { useToast } from '../../../context/NotificationContext';

const FileUpload = ({handleModal, updateDocument ,documents}) => {

  const DOC_TYPES = [
    { value: "id_card", label: "شناسنامه" },
    { value: "register_form", label: "فرم ثبت نام" },
    { value: "insurance_card", label: "بیمه ورزشی" },
    { value: "other", label: "سایر" },
  ];

  const fileInputRef = useRef(null)
  const [file, setFile] = useState([])
  const [type, setType] = useState(null)
  const { notify } = useToast();

  return (
    <>
    <div className={styles.modal}>
      <div className={styles.modalBody}>
        <h2 className={styles.modalTitle}>آپلود مدرک</h2>
        <p className={styles.modalDescription}>از کادر پایین اضافه شود</p>

        <button
          className={styles.uploadArea}
          type="button"
          onClick={() => fileInputRef.current.click()}
        >
          <span className={styles.uploadAreaIcon}>
            {/* svg کوتاه شده برای خوانایی */}
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                fill="var(--c-action-primary)"
                d="M5 20h14v-2H5v2zm7-18L5.33 9h3.84v4h5.66V9h3.84L12 2z"
              />
            </svg>
          </span>

          <span className={styles.uploadAreaTitle}>
            فایل‌(ها) را اینجا بکشید و رها کنید
          </span>

          <span className={styles.uploadAreaDescription}>
            می‌توانید یک فایل را انتخاب کنید با <br />
            <strong>کلیک کردن اینجا</strong>
          </span>
        </button>
        <div style={{fontSize: '14px', maxHeight: '2rem'}}>
          {file.length > 0 && (
          <ul style={{marginRight: '10px', listStyle: 'none', marginTop: '10px'}}>
            {file.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
        </div>
        <select
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option value="">نوع مدرک</option>
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={handleModal}>لغو</button>
        <button
          className={styles.btnPrimary}
          onClick={() => {
            if (!file) {
              notify('یه فایل برای بارگذاری انتخاب کنید!', 'info')
              return null
            }
            if (!type) {
              notify('نوع مدرک را مشخص کنید!', 'info')
              return null
            }
            for (const item of documents) {
              if (item['doc_type'] === type) {
                notify('این نوع فایل از قبل آپلود شده است!', 'error')
                return null
              }
            }
            updateDocument(documents.length-1, file, type)
            handleModal()
            }}>
            آپلود مدرک
        </button>
      </div>
    </div>
    <input
      type="file"
      ref={fileInputRef}
      style={{ display: 'none' }}
      onChange={(e) => setFile([...e.target.files])}
    />
    </>
  )
}

export default FileUpload;
