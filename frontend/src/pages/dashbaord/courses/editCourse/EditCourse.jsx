import React, { useEffect, useState } from "react";
import styles from "../addCourse/AddCourse.module.scss";
import { UilArrowRight, UilTrash } from "@iconscout/react-unicons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../hooks/api";
import { useToast } from "../../../../context/NotificationContext";
import Modal from "../../../../components/GlobalComponents/Modal/Modal";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [loading, setLoading] = useState(true);
  const [coachList, setCoachList] = useState([]);
  const [ageRangeList, setAgeRangeList] = useState([]);
  const [currentAvatar, setCurrentAvatar] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);

  const handleDeleteModal = () => {
    setDeleteModal(!deleteModal);
  }

  const handleDeleteClass = async () => {
    await api.delete(`/training/courses/${id}/delete/`);
    notify("کلاس با موفقیت حذف شد!", "info");
    navigate('/dashboard/courses')
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    coach: "",
    gender: "both",
    age_ranges: [],
    price: "",
    class_status: "public",
    is_active: true,
    avatar: null,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
    handleChange("age_ranges", values);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    handleChange("avatar", file);
  };

  const fetchFormOptions = async () => {
    const res = await api.get("/training/courses/form-options/");
    setCoachList(res.data?.coaches || []);
    setAgeRangeList(res.data?.age_ranges || []);
  };

  const fetchCourseDetail = async () => {
    const res = await api.get(`/training/courses/detail/${id}/`);
    const data = res.data || {};

    setForm((prev) => ({
      ...prev,
      title: data.title || "",
      description: data.description || "",
      coach: data.coach?.id || data.coach || "",
      gender: data.gender || "both",
      age_ranges: Array.isArray(data.age_ranges) ? data.age_ranges.map((x) => Number(x.id)) : [],
      price: data.price ?? "",
      class_status: data.class_status || "public",
      is_active: Boolean(data.is_active),
      avatar: null,
    }));

    setCurrentAvatar(data.avatar || "");
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchFormOptions(), fetchCourseDetail()]);
      } catch (err) {
        console.log(err);
        notify("خطا در دریافت اطلاعات کلاس", "error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("coach", form.coach);
    payload.append("gender", form.gender);
    form.age_ranges.forEach((item) => payload.append("age_ranges", item));
    payload.append("price", form.price);
    payload.append("class_status", form.class_status);
    payload.append("is_active", String(form.is_active));
    if (form.avatar) payload.append("avatar", form.avatar);

    try {
      await api.put(`/training/courses/${id}/edit/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify("کلاس با موفقیت ویرایش شد!", "success");
      navigate(`/dashboard/courses/${id}`);
    } catch (err) {
      console.log(err);
      notify("خطا در ویرایش کلاس!", "error");
    }
  };

  if (loading) return <div className={styles.addClassPage}>در حال بارگذاری...</div>;

  return (
    <div className={styles.addClassPage} dir="rtl">
      <div className={styles.topBar}>
        <button className={styles.backLink} type="button" onClick={() => navigate(`/dashboard/courses/${id}`)}>
          <UilArrowRight /> بازگشت به جزئیات کلاس
        </button>

        <div className={styles.topActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => navigate(`/dashboard/courses/${id}`)}>
            انصراف
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" form="edit-course-form">
            ذخیره تغییرات
          </button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>ویرایش کلاس</h1>

      <form id="edit-course-form" onSubmit={handleSubmit} className={styles.contentGrid}>
        <div className={styles.leftCol}>
          <section className={styles.card}>
            <h3>اطلاعات پایه</h3>
            <p className={styles.subtitle}>جزئیات اصلی کلاس را ویرایش کنید.</p>

            <div className={styles.field}>
              <label>عنوان کلاس</label>
              <input type="text" value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
            </div>

            <div className={styles.field}>
              <label>توضیحات</label>
              <textarea rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
            </div>
          </section>

          <section className={styles.card}>
            <h3>مخاطب هدف و مربی</h3>
            <p className={styles.subtitle}>اطلاعات مربی و شرایط کلاس را به‌روزرسانی کنید.</p>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>مربی کلاس</label>
                <select value={form.coach} onChange={(e) => handleChange("coach", e.target.value)}>
                  <option value="">انتخاب مربی</option>
                  {coachList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>جنسیت مجاز</label>
                <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                  <option value="both">مختلط / فرقی ندارد</option>
                  <option value="male">آقایان</option>
                  <option value="female">بانوان</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>بازه سنی</label>
                <select multiple value={form.age_ranges} onChange={handleMultiSelect} className={styles.multiSelect}>
                  {ageRangeList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>قیمت</label>
                <div className={styles.priceInput}>
                  <span>تومان</span>
                  <input type="number" min="0" step="100" value={form.price} onChange={(e) => handleChange("price", e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3>حذف کلاس</h3>
            <p className={styles.subtitle}>میتوانید به جای حذف کلاس آن را غیر فعال کنید.</p>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDeleteModal()}
              type="button"
              >
                حذف دائمی کلاس <UilTrash />
            </button>
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.card}>
            <h3>تصویر دوره</h3>
            <p className={styles.subtitle}>در صورت نیاز تصویر جدید آپلود کنید.</p>

            {currentAvatar && !form.avatar && (
              <div style={{ marginBottom: "10px" }}>
                <img src={currentAvatar} alt="course" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }} />
              </div>
            )}

            <label className={styles.uploadBox}>
              <input type="file" accept=".png,.jpg,.jpeg,.svg,.gif" onChange={handleImageChange} />
              <div className={styles.uploadContent}>
                <div className={styles.uploadIcon}>↑</div>
                <strong>برای تغییر تصویر کلیک کنید</strong>
                {form.avatar && <small className={styles.fileName}>{form.avatar.name}</small>}
              </div>
            </label>
          </section>

          <section className={styles.card}>
            <h3>وضعیت نمایش</h3>
            <p className={styles.subtitle}>وضعیت کلاس را تعیین کنید.</p>

            <div className={styles.field}>
              <label>وضعیت کلاس</label>
              <select value={form.class_status} onChange={(e) => handleChange("class_status", e.target.value)}>
                <option value="public">عمومی</option>
                <option value="private">خصوصی</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.activeRow}`}>
              <div>
                <label>فعال بودن کلاس</label>
                <p>اجازه ثبت نام برای ورزشکاران</p>
              </div>

              <button
                type="button"
                className={`${styles.switch} ${form.is_active ? styles.on : ""}`}
                onClick={() => handleChange("is_active", !form.is_active)}
              >
                <span />
              </button>
            </div>
          </section>
        </div>
      </form>
      {deleteModal && (
        <Modal handleModal={handleDeleteModal} height='200px'>
          <div className={styles.deleteModal}>
            <p>آیا از حذف کردن این کلاس مطمئن هستید؟</p>
            <div className={styles.buttons}>
              <button className={styles.deleteBtn} onClick={() => handleDeleteClass()}>حذف</button>
              <button className={styles.cancleBtn} onClick={handleDeleteModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EditCourse;
