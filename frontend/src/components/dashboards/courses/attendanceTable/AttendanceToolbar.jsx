import styles from "./AttendanceTable.module.scss";
import { UilTimes } from "@iconscout/react-unicons";

const AttendanceToolbar = ({
  sessions,
  selectedSession,
  setSelectedSession,
  selectedMonth,
  setSelectedMonth,
  fetchCourseSessions,
  fetchSessionAttendance,
  search,
  setSearch,
  sessionAttendance,
  selectedSessionObject,
  submitAttendance,
  handleAllStatusChange,
  paymentFilter,
  setPaymentFilter,
  setPage,
  setSessionAttendance,
}) => {

  const PERSIAN_MONTH = [
    {id: 1, name: 'فروردین',},
    {id: 2, name: 'اردیبهشت',},
    {id: 3, name: 'خرداد',},
    {id: 4, name: 'تیر',},
    {id: 5, name: 'مرداد',},
    {id: 6, name: 'شهریور',},
    {id: 7, name: 'مهر',},
    {id: 8, name: 'آبان',},
    {id: 9, name: 'آذر',},
    {id: 10, name: 'دی',},
    {id: 11, name: 'بهمن',},
    {id: 12, name: 'اسفند',},
  ]
  
  return (
    <>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.left}>
          <select
            value={paymentFilter}
            onChange={e => {
              setPaymentFilter(e.target.value);
              setPage(1);
              setSelectedSession(e.target.value);
              setSessionAttendance([]);
            }}
          >
            <option value="">انتخاب جلسه تمرین</option>
            {sessions.map((item, index) => {
              return (
                <option key={index} value={item.id}>
                  {item.day_of_week} - {item.date_jalali}{" "}
                  {item.attendance_status === "finished" ? "✓" : ""}
                </option>
              );
            })}
          </select>

          <select
            value={selectedMonth}
            onChange={e => {
              setSelectedMonth(e.target.value);
              setSessionAttendance([]);
              fetchCourseSessions(e.target.value);
            }}
          >
            {PERSIAN_MONTH.map((item, index) => (
              <option value={item.id} key={index}>
                {item.name}
              </option>
            ))}
          </select>

          <button onClick={() => fetchSessionAttendance(selectedSession)}>
            برو
          </button>
        </div>
      </div>

      <div className={styles.actionContainer}>
        <ul>
          <li>
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
              {search && (
                <span
                  className={styles.clearSearch}
                  onClick={() => setSearch("")}
                >
                  <UilTimes />
                </span>
              )}
            </div>
          </li>

          {sessionAttendance.length !== 0 &&
          selectedSessionObject?.attendance_status === "unfinished" ? (
            <>
              <li>
                <button
                  className={styles.present}
                  onClick={() => handleAllStatusChange("p")}
                >
                  حاضری برای همه
                </button>
              </li>
              <li>
                <button
                  className={styles.absent}
                  onClick={() => handleAllStatusChange("a")}
                >
                  غیبت برای همه
                </button>
              </li>
              <li>
                <button
                  className={styles.late}
                  onClick={() => handleAllStatusChange("l")}
                >
                  تاخیر برای همه
                </button>
              </li>
            </>
          ) : (
            ""
          )}

          <li className={styles.endBtn}>
            {selectedSessionObject && sessionAttendance.length !== 0 && (
              selectedSessionObject.attendance_status === "unfinished" ? (
                <button className={styles.end} onClick={submitAttendance}>
                  اتمام حضور و غیاب
                </button>
              ) : (
                <button className={styles.finished}>
                  حضور و غیاب ثبت شده است.
                </button>
              )
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default AttendanceToolbar;