import { useState, useEffect } from "react";
import StepIndicator from "../stepIndicator/StepIndicator";
import FirstStepRegister from "../firstStepRegister/FirstStepRegister";
import SecondStepInfo from "../secondStepCompleteRegister/SecondStepInfo";
import LastStepAddClass from "../lastStepAddClass/LastStepAddClass";
import ThirdStepDocs from "../ThirdStepDocument/ThirdStepDocs";
import style from './MultiStepForm.module.scss';
import {
  getRegisterProgress,
  saveRegisterProgress,
  clearRegisterProgress,
} from "../../../utils/registerStorage";

const steps = [
  { id: 1, label: "ثبت نام اولیه" },
  { id: 2, label: "اطلاعات تکمیلی" },
  { id: 3, label: "آپلود مدارک" },
  // { id: 4, label: "اضافه کردن به کلاس" },
];

const MultiStepForm = () => {
  const saved = getRegisterProgress();
  const [currentStep, setCurrentStep] = useState(saved?.step || 1);
  const [userId, setUserId] = useState(saved?.userId || null);

  useEffect(() => {
    saveRegisterProgress({ step: currentStep, userId });
  }, [currentStep, userId]);

  return (
    <div className={style.formWrapper}>

      <StepIndicator steps={steps} currentStep={currentStep} />

      {currentStep === 1 && (
        <FirstStepRegister onSuccess={() => setCurrentStep(2)} setUserId={setUserId} />
      )}
      {currentStep === 2 && userId && (
        <SecondStepInfo userId={userId} onSuccess={() => setCurrentStep(3)} setUserId={setUserId}/>
      )}
      {currentStep === 3 && userId && (
        <ThirdStepDocs userId={userId} onSuccess={() => clearRegisterProgress()} />
      )}
      {/* {currentStep === 4 && userId && (
        <LastStepAddClass userId={userId} onSuccess={() => clearRegisterProgress()} />
      )} */}
    </div>
  );
}

export default MultiStepForm;