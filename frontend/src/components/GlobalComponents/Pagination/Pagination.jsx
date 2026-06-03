import styles from "./Pagination.module.scss";
import {
  UilAngleLeft,
  UilAngleRight,
} from "@iconscout/react-unicons";
import toPersianDigits from "../../../hooks/convertNumber";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onNext,
  onPrev,
}) {
  const generatePages = () => {
    const pages = [];

    // همیشه صفحه اول
    pages.push(1);

    // شروع و پایان بازه وسط
    let startPage = Math.max(currentPage - 1, 2);
    let endPage = Math.min(currentPage + 1, totalPages - 1);

    // اگر نزدیک اول بود
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }

    // اگر نزدیک آخر بود
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 3, 2);
    }

    // dots اول
    if (startPage > 2) {
      pages.push("start-dots");
    }

    // صفحات وسط
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // dots آخر
    if (endPage < totalPages - 1) {
      pages.push("end-dots");
    }

    // همیشه صفحه آخر
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.arrow}
        onClick={onPrev}
        disabled={currentPage === 1}
      >
        <UilAngleRight />
      </button>

      <div className={styles.pages}>
        {pages.map((item, index) =>
          item === "start-dots" || item === "end-dots" ? (
            <span key={item + index} className={styles.dots}>
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange?.(item)}
              className={`${styles.page} ${
                currentPage === item ? styles.active : ""
              }`}
            >
              {toPersianDigits(item)}
            </button>
          )
        )}
      </div>

      <button
        className={styles.arrow}
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        <UilAngleLeft />
      </button>
    </div>
  );
}