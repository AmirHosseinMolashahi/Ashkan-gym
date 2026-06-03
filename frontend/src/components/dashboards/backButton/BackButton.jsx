import { useNavigate } from 'react-router-dom';
import style from './BackButton.module.scss';

const BackButton = ({route, title}) => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(route)} className={style.backBtn}>
      {title} <span>←</span>
    </button>
  );
};

export default BackButton;