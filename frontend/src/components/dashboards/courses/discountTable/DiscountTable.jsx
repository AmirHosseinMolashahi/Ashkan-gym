import { useState, useMemo } from "react";
import styles from "./DiscountTable.module.scss";
import { UilImport, UilEye, UilEdit, UilTrashAlt, UilTimes, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import useCurrentDateTime from "../../../../hooks/currentDateTime";
import Modal from "../../../GlobalComponents/Modal/Modal";
import api from "../../../../hooks/api";
import { useToast } from "../../../../context/NotificationContext";

const PAGE_SIZE = 5;

export default function DiscountTable({ students, fetchStudent }) {
  const [search, setSearch] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState('active')
  const [page, setPage] = useState(1);
  const {date, weekday, month} = useCurrentDateTime()
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const { notify } = useToast()

  const [deleteDiscountModal, setDeleteDiscountModal] = useState(false)

  const formatMoney = (value) =>
    `${toPersianDigits(String(Number(value || 0).toLocaleString()))} تومان`;

  const [ discountFormData, setDiscountFormData ] = useState({
    custom_due_day: "",
    monthly_fee: "",
    discount_reason: "",
  })

  const handleEditModal = (item) => {
    if (!editModal) {
      setSelectedItem(item);
    } 
    setEditModal(!editModal)
  };

  const handleDeleteDiscountModal = (item) => {
    if (!deleteDiscountModal) {
      setSelectedItem(item)
    }
    setDeleteDiscountModal(!deleteDiscountModal)
  }

  const handleUpdateDiscountFormChange = (e) => {
    const { name, value } = e.target;
    setDiscountFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateDiscount = async () => {
    const data = {}

    if (discountFormData.custom_due_day)
      data.custom_due_day = Number(discountFormData.custom_due_day)

    if (discountFormData.monthly_fee)
      data.monthly_fee = Number(discountFormData.monthly_fee)

    if (discountFormData.discount_reason)
      data.discount_reason = discountFormData.discount_reason


    try {
      const res = await api.put(`/payment/coach/discount/${selectedItem.id}/update/`, data);
      console.log("Update response: ", res.data);
      fetchStudent();
      setEditModal(false);
      notify("تغییرات با موفقیت اعمال شد.", "success")
    } catch (err) {
      console.log(err.response?.data)
      notify("تغییرات ذخیره نشد.", "error");
    }
  };

  const handleDeleteDiscount = async () => {
    try {
      await api.delete(`/payment/coach/discount/${selectedItem.id}/delete/`)
      fetchStudent()
      setDeleteDiscountModal(false)
      notify("تخفیف با موفقیت حذف شد", 'info')
    } catch (err) {
      console.log(err)
      notify("خطا در حذف تخفیف.", "error");
    }
  }

  const handleClearFilter = () => {
    setSearch('')
    setDiscountFilter('all')
    setStatusFilter('active')
  }


  const filteredData = useMemo(() => {
    return students.filter(s => {
      const fullName =
        s.student.full_name ||
        `${s.student.first_name || ""} ${s.student.last_name || ""}`.trim();
      const email = s.student.email || "";

      const matchSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchPayment =
        discountFilter === "all" || String(s.paid_amount_info.has_discount) === String(discountFilter);
      
      const matchstatus =
        statusFilter === "all" || s.status === statusFilter

      return matchSearch && matchPayment && matchstatus;
    });
  }, [students, search, discountFilter, statusFilter]);
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <button><UilImport /></button>

            <label>وضعیت تخفیف: </label>
            <select
              value={discountFilter}
              onChange={e => {
                console.log(e.target.value)
                setDiscountFilter(e.target.value);
              }}
            >
              <option value="all">همه</option>
              <option value={true}>تخفیف دار</option>
              <option value={false}>بدون تخفیف</option>
            </select>
            
            <label>وضعیت ورزشکار: </label>
            <select
              value={statusFilter}
              onChange={e => {
                console.log(e.target.value)
                setStatusFilter(e.target.value);
              }}
            >
              <option value="active">فعال</option>
              <option value="deactive">غیر فعال</option>
              <option value="all">همه</option>
            </select>
          </div>

          <div className={styles.inputWrapper}>
            <input
              placeholder="جستجوی ورزشکار..."
              value={search}
              className={styles.searchInput}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            { search && (
              <span className={styles.clearSearch} onClick={() => setSearch("")}><UilTimes /></span>
            )}
          </div>

          <button className={styles.clearFilterBtn} onClick={() => handleClearFilter()}>پاک کردن فیلترها</button>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>ورزشکار</th>
                <th>تاریخ سررسید</th>
                <th>تخفیف</th>
                <th>مبلغ پرداختی</th>
                <th>علت تخفیف</th>
                <th>تغییرات</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                     <div className={styles.students}>
                       <img src={item.student.profile_picture} />
                        <div>
                          <strong>{item.student.first_name} {item.student.last_name}</strong>
                          <p>{toPersianDigits(item.student.national_id)}</p>
                        </div>
                     </div>
                    </td>
                    <td>
                      {toPersianDigits(item.custom_due_day)} هر ماه
                    </td>
                    <td>
                      {item.paid_amount_info.has_discount === false ? (
                        <UilTimes />
                      ) : (
                        <UilCheck />
                      )}
                    </td>
                    <td>
                      {toPersianDigits(item.paid_amount_info.final_price)} تومان  
                    </td>
                    <td>
                      {item.paid_amount_info.has_discount === false ? (
                        '-'
                      ) : (
                        item.paid_amount_info.reason ? item.paid_amount_info.reason : 'بدون توضیح'
                      )}
                    </td>
                    <td>
                      <div className={styles.btnContainer}>
                        <button className={styles.editBtn} onClick={() => handleEditModal(item)}>
                          ویرایش <UilEdit />
                        </button>
                        {item.paid_amount_info.has_discount ? (
                          <button className={styles.deleteBtn} onClick={() => handleDeleteDiscountModal(item)}>
                            حذف تخفیف
                          </button>
                        ): ''}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* //Pagination
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? styles.activePage : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div> */}
      </div>
      {editModal && (
        <Modal handleModal={() => setEditModal(false)} height='460px' width='500px'>
          <div className={styles.editModal}>
            <h2>تنظیمات شهریه</h2>
            <p>{selectedItem?.student?.full_name}</p>

            <h3>سر رسید</h3>
            <div className={styles.invoiceChangeRow}>
              <label>چندمین روز ماه: </label>
              <input type="number" name="custom_due_day" min='1' max='31' step='1' value={discountFormData.custom_due_day} onChange={handleUpdateDiscountFormChange}/>
              <p className={styles.subtle}>تاریخ قبلی: {selectedItem?.custom_due_day} هر ماه</p>
            </div>

            <h3>مبلغ</h3>
            <div className={styles.invoiceChangeRow}>
              <label>مبلغ جدید: </label>
              <input type="number" name="monthly_fee" value={discountFormData.monthly_fee} onChange={handleUpdateDiscountFormChange} placeholder="مبلغ به تومان" min="0" step="50000"/>
              <p className={styles.subtle}>مبلغ قبلی: {formatMoney(selectedItem?.paid_amount_info.final_price)}</p>
            </div>

            <h3>علت تغییر</h3>
            <div className={styles.invoiceChangeRow}>
              <label>علت تغییر مبلغ</label>
              <input type="text" name="discount_reason" value={discountFormData.discount_reason} onChange={handleUpdateDiscountFormChange} placeholder="علت تغییر را وارد کنید" />
            </div>
            <div className={styles.btnContainer2}>
              <button className={styles.closeBtn} onClick={() => setEditModal(false)}>
                لغو
              </button>
              <button className={styles.saveBtn} onClick={handleUpdateDiscount}>
                ذخیره
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteDiscountModal && (
        <Modal handleModal={() => setDeleteDiscountModal(false)} width='500px' height='200px'>
          <h2 style={{color: '#1c1c1c'}}>حذف تخفیف</h2>
          <p style={{color: '#1c1c1c'}}>آیا از حذف تخفیف برای ورزشکار "{selectedItem.student.full_name}" مطمئن هستید؟</p>
          <div className={styles.btnContainer2}>
            <button className={styles.secondaryBtn} onClick={() => setDeleteDiscountModal(false)}>
              لغو
            </button>
            <button className={styles.closeBtn} onClick={handleDeleteDiscount}>
              حذف
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
