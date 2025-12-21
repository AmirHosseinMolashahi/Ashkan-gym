import React from 'react';
import { UilTimesCircle } from '@iconscout/react-unicons'
import style from './Modal.module.scss';


const Modal = ({children, handleModal, width, height}) => {
  return (
    <div className={style.modal}>
      <div className={style.container} style={{ width: width || "400px", height: height || "400px" }}>
        <div className={style.closeBtn} onClick={handleModal}>
          <UilTimesCircle />
        </div>
        <div className={style.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal