import React, { useEffect, useState } from "react";
import styles from "./AddCourse.module.scss";
import { UilArrowRight } from '@iconscout/react-unicons'
import { useNavigate } from 'react-router-dom';
import api from "../../../../hooks/api";
import { useToast } from "../../../../context/NotificationContext";

const AddCourse = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    coach: "",
    gender: "",
    age_ranges: [],
    price: "",
    class_status: "public",
    is_active: true,
    avatar: null,
  });

  const [ coachList, setCoachList ] = useState([])
  const [ ageRangeList, setAgeRangeList ] = useState([])
  const { notify } = useToast()

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
    handleChange("age_ranges", values);
  };

  const navigate = useNavigate()

  const fetchCourseForm = async () => {
    try {
      const res = await api.get("/training/courses/form-options/");
      console.log(res.data)
      setCoachList(res.data.coaches);
      setAgeRangeList(res.data.age_ranges);
    } catch (err) {
      console.log(err)
    }
  }


  useEffect(() => {
    fetchCourseForm()
  }, [])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    handleChange("avatar", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("coach", form.coach);
    payload.append("gender", form.gender);
    form.age_ranges.forEach((id) => payload.append("age_ranges", id));
    payload.append("price", form.price);
    payload.append("class_status", form.class_status);
    payload.append("is_active", String(form.is_active));
    if (form.avatar) payload.append("avatar", form.avatar);

    try {
      await api.post("/training/courses/add/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify("کلاس با موفقیت ایجاد شد!", "success");
      navigate("/dashboard/courses");
    } catch (err) {
      console.log(err);
      notify("خطا در ایجاد کلاس!", "error");
    }
  };

  return (
    <div className={styles.addClassPage} dir="rtl">
      <div className={styles.topBar}>
        <button className={styles.backLink} type="button" onClick={() => navigate('/dashboard/courses')}>
          <UilArrowRight /> بازگشت به برنامه کلاس ها
        </button>

        <div className={styles.topActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} type="button">
            انصراف
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="submit"
            form="add-class-form"
          >
            + ایجاد کلاس
          </button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>افزودن کلاس جدید</h1>

      <form id="add-class-form" onSubmit={handleSubmit} className={styles.contentGrid}>
        <div className={styles.leftCol}>
          <section className={styles.card}>
            <h3>اطلاعات پایه</h3>
            <p className={styles.subtitle}>جزئیات اصلی این کلاس را وارد کنید.</p>

            <div className={styles.field}>
              <label>عنوان کلاس</label>
              <input
                type="text"
                placeholder="مثال: ووشو پیشرفته"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>توضیحات</label>
              <textarea
                rows={4}
                placeholder="کوتاه توضیح بده در این کلاس چه چیزهایی آموزش داده می شود..."
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </section>

          <section className={styles.card}>
            <h3>مخاطب هدف و مربی</h3>
            <p className={styles.subtitle}>مربی را انتخاب کنید و مشخص کنید چه کسانی می توانند شرکت کنند.</p>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>مربی کلاس</label>
                <select value={form.coach} onChange={(e) => handleChange("coach", e.target.value)}>
                  <option value="">انتخاب مربی</option>
                  {coachList?.map((item, index) => (
                    <option value={item.id} key={index}>{item.full_name}</option>
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
                <select
                  multiple
                  value={form.age_ranges}
                  onChange={handleMultiSelect}
                  className={styles.multiSelect}
                >
                  {ageRangeList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <small>برای انتخاب چند مورد، Ctrl (یا Cmd) را نگه دارید.</small>
              </div>

              <div className={styles.field}>
                <label>قیمت (هر جلسه یا ماهانه)</label>
                <div className={styles.priceInput}>
                  <span>تومان</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.card}>
            <h3>تصویر دوره</h3>
            <p className={styles.subtitle}>برای کلاس یک تصویر کاور یا بندانگشتی آپلود کنید.</p>

            <label className={styles.uploadBox}>
              <input type="file" accept=".png,.jpg,.jpeg,.svg,.gif" onChange={handleImageChange}  />
              <div className={styles.uploadContent}>
                <div className={styles.uploadIcon}>↑</div>
                <strong>برای آپلود تصویر کلیک کنید</strong>
                <small>SVG, PNG, JPG یا GIF (حداکثر ۲MB)</small>
                {form.avatar && <small className={styles.fileName}>{form.avatar.name}</small>}
              </div>
            </label>
          </section>

          <section className={styles.card}>
            <h3>وضعیت نمایش</h3>
            <p className={styles.subtitle}>مشخص کنید این کلاس چه زمانی و با چه وضعیتی نمایش داده شود.</p>

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
                aria-label="تغییر وضعیت فعال بودن"
              >
                <span />
              </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
