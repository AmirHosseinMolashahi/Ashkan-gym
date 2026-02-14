import { useNavigate } from 'react-router-dom';
import style from './BackButton.module.scss';

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} className={style.backBtn}>
      بازگشت ←
    </button>
  );
};

export default BackButton;