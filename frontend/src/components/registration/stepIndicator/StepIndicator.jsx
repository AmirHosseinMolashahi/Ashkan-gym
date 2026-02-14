import React from 'react'
import style from './StepIndicator.module.scss';
import { UilCheck } from '@iconscout/react-unicons'

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className={style.stepper}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div className={style.stepWrapper} key={step.id}>
            <div
              className={`${style.circle} ${isCompleted ? style.completed : ""} ${isActive ? style.active : ""}`}>
              {isCompleted ? <UilCheck /> : step.id}
            </div>

            {index !== steps.length - 1 && (
              <div className={style.line}>
                <span
                  className={`${style.progress} ${isCompleted ? style.filled : ""}`}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;