import { useNavigate } from 'react-router-dom';
import style from './BackButton.module.scss';

const BackButton = ({route, title, color = null}) => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(route)} className={style.backBtn} style={color ? {color: color} : null }>
      {title} <span>←</span>
    </button>
  );
};

export default BackButton;