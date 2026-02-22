import { UilCheck, UilTimes, UilClock } from "@iconscout/react-unicons";
import styles from "./AttendanceTable.module.scss";

const AttendanceRow = ({ item, index, onStatusChange, onNoteChange }) => {
  return (
    <tr key={item.student ?? index}>
      <td>{index + 1}</td>
      <td>
        <div className={styles.students}>
          <img src={item.profile_picture} alt={item.student_name} />
          <div>
            <strong>{item.student_name}</strong>
            <p>{item.national_id}</p>
          </div>
        </div>
      </td>
      <td>
        <ul>
          <li
            className={`${item.status === "present" ? styles.active : ""} ${
              styles.present
            }`}
          >
            <button onClick={() => onStatusChange(item.student, "present")}>
              حاضر <UilCheck />
            </button>
          </li>
          <li
            className={`${item.status === "absent" ? styles.active : ""} ${
              styles.absent
            }`}
          >
            <button onClick={() => onStatusChange(item.student, "absent")}>
              غایب <UilTimes />
            </button>
          </li>
          <li
            className={`${item.status === "late" ? styles.active : ""} ${
              styles.late
            }`}
          >
            <button onClick={() => onStatusChange(item.student, "late")}>
              تاخیر <UilClock />
            </button>
          </li>
        </ul>
      </td>
      <td className={styles.note}>
        <input
          type="text"
          placeholder="توضیحات"
          value={item.note || ""}
          onChange={e => onNoteChange(item.student, e.target.value)}
        />
      </td>
    </tr>
  );
};

export default AttendanceRow;