import React, {useState} from 'react'
import style from './ThirdStepDocs.module.scss'
import FileUpload from '../FileUpload/FileUpload'
import Modal from '../../GlobalComponents/Modal/Modal'
import { useToast } from '../../../context/NotificationContext'
import { useNavigate } from 'react-router-dom';
import api from '../../../hooks/api'


const ThirdStepDocs = ({ userId, onSuccess }) => {

  const DOC_TYPES = {
    id_card: "شناسنامه" ,
    register_form: "فرم ثبت نام" ,
    insurance_card: "بیمه ورزشی" ,
    other: "سایر" ,
  };

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate() 
  

  const { notify } = useToast();

  const [uploadModal, setUploadModal] = useState(false)

  const handleUploadModal = () => {
    if (!uploadModal) {
      if (documents.length >= 4) {
        notify('ظرفیت بارگذاری مدارک برای این کاربر پر میباشد!', 'info')
        return null
      }
      addDocument();
    }

    if (uploadModal && documents.slice(-1)[0]['file'] === null ) {
      documents.pop()
    }

    setUploadModal(!uploadModal)
  }

  const addDocument = () => {
    setDocuments([...documents, { file: null, doc_type: "" }]);
  };

  const updateDocument = (index, value, type) => {
    const updated = [...documents];
    updated[index]['file']= value;
    updated[index]['doc_type']= type;
    setDocuments(updated);
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };


  const endRegisterHandler = () => {
    onSuccess?.();
    notify('ثبت نام با موفقیت به پایان رسید!', 'success')
    navigate('/dashboard/courses');
  }

  const submitHandler = async () => {
    if (!documents.length) {
      notify('مدرکی بارگذاری نشده است!', 'info')
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("registration", userId);

    documents.forEach((doc, index) => {
      formData.append(`file_${index}`, doc.file[0]);
      console.log(doc.file[0] instanceof File);
    });

    formData.append(
      "documents",
      JSON.stringify(documents.map((doc, index) => ({
        doc_type: doc.doc_type,
        file_field_name: `file_${index}`
      })))
    );

    for (let pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(key, value.name, value.size, value.type); // نام، حجم و نوع فایل
      } else {
        console.log(key, value);
      }
    }

    try {
      await api.post(`/registration/documents/${userId}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess?.();
      notify('مدارک با موفقیت بارگذاری شد!', 'success')
      notify('با رفتن بر روی کلاس مد نظر میتوانید ورزشکار را اضافه کنید!', 'success', '4000')
      navigate('/dashboard/courses');
    } catch (err) {
      console.log(err);
      notify("خطا در آپلود مدارک", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.wrapper}>
      <h3>آپلود مدارک</h3>
      <p>شما میتوانید با کلیک بر روی دکمه‌ی زیر مدارک مدنظر را آپلود کنید. (شناسنامه، بیمه ورزشی، فرم ثبت نام و ...)</p>
      {documents.length > 0 ? (
        ''
      ) : (
        <div className={style.endRegister}>
          <p>در صورتی که میخواهید مدارک را بعدا بارگزاری کنید بر روی لینک مقایل کلیک کنید.</p>
          <button onClick={() => endRegisterHandler()}>اتمام ثبت نام</button>
        </div>
      )}
      {documents.map((doc, index) => (
        <ul key={index} className={style.row}>
          <li>
            <b>نام فایل: </b>
            {doc.file ? (
              <p>{doc.file[0].name.length > 20 
                  ? doc.file[0].name.slice(0, 20) + '...'
                  : doc.file[0].name}
              </p>
            ) : (
              <p>در حال انتخاب...</p>
            )}
          </li>

          <li>
            <b>نوع فایل: </b>
            {doc.doc_type ? (
              <p>{DOC_TYPES[doc.doc_type]}</p>
            ) : (
              <p>در حال انتخاب...</p>
            )}
          </li>
          <li>
            <button
              type="button"
              onClick={() => removeDocument(index)}
            >
              ✕
            </button>
          </li>
        </ul>
      ))}

      <div className={style.actions}>
        {/* <button type="button" onClick={addDocument}>
          + افزودن مدرک
        </button> */}
        <button onClick={() => handleUploadModal()}>اضافه کردن مدرک +</button>

        <button
          type="button"
          disabled={loading || !documents.length}
          onClick={submitHandler}
          className={style.submitBtn}
        >
          {loading ? "در حال ارسال..." : "ارسال مدارک"}
        </button>
      </div>
      {uploadModal && (
        <Modal height={600} handleModal={handleUploadModal}>
          <FileUpload handleModal={handleUploadModal} updateDocument={updateDocument} documents={documents}/>
        </Modal>
      )}
    </div>
  );
};

export default ThirdStepDocs;
